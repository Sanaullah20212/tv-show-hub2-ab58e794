import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Users, CreditCard, Clock, AlertCircle, CheckCircle, Activity, ArrowRight, BarChart3, Settings, Key, HardDrive } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSubscriptionNotifications } from '@/hooks/useSubscriptionNotifications';
import { formatDateBengali } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { LiveActivityFeed } from '@/components/admin/LiveActivityFeed';
import { SecurityAlerts } from '@/components/admin/SecurityAlerts';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    pendingApprovals: 0,
    expiringSoon: 0,
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [pendingSubscriptions, setPendingSubscriptions] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [liveActivities, setLiveActivities] = useState<any[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<any[]>([]);
  const [activeUsersCount, setActiveUsersCount] = useState(0);

  useSubscriptionNotifications(true);

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      fetchDashboardData();
      fetchLiveData();
      setupRealtimeListeners();
    }
  }, [user, profile]);

  const fetchDashboardData = async () => {
    try {
      setDataLoading(true);

      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: activeSubscriptions } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString());

      const { count: pendingApprovals } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      const { count: expiringSoon } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .lte('end_date', sevenDaysFromNow.toISOString())
        .gte('end_date', new Date().toISOString());

      setStats({
        totalUsers: totalUsers || 0,
        activeSubscriptions: activeSubscriptions || 0,
        pendingApprovals: pendingApprovals || 0,
        expiringSoon: expiringSoon || 0,
      });

      const { data: recentUsersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentUsers(recentUsersData || []);

      const { data: pendingSubsData } = await supabase
        .from('subscriptions')
        .select('*, profiles!inner(*)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);

      setPendingSubscriptions(pendingSubsData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchLiveData = async () => {
    try {
      // Fetch recent login attempts (last 20)
      const { data: attempts } = await supabase
        .from('login_attempts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      // Fetch recent sessions
      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // Combine and format activities
      const combinedActivities = [
        ...(attempts || []).map(a => ({
          ...a,
          type: 'login_attempt' as const
        })),
        ...(sessions || []).map(s => ({
          ...s,
          type: s.is_approved ? 'session_approved' as const : 'session_created' as const
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
       .slice(0, 15);

      setLiveActivities(combinedActivities);

      // Get security alerts (blocked or suspicious)
      const alerts = (attempts || [])
        .filter(a => a.attempt_type === 'blocked' || a.attempt_type === 'suspicious')
        .slice(0, 5);
      setSecurityAlerts(alerts);

      // Count active users (sessions active in last 15 minutes)
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      const { data: activeSessions } = await supabase
        .from('user_sessions')
        .select('user_id')
        .eq('is_active', true)
        .gte('last_active_at', fifteenMinutesAgo);

      const uniqueActiveUsers = new Set(activeSessions?.map(s => s.user_id) || []);
      setActiveUsersCount(uniqueActiveUsers.size);

    } catch (error) {
      console.error('Error fetching live data:', error);
    }
  };

  const setupRealtimeListeners = () => {
    console.log('Setting up realtime listeners...');

    // Listen to login attempts
    const loginAttemptsChannel = supabase
      .channel('login-attempts-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'login_attempts'
        },
        (payload) => {
          console.log('New login attempt:', payload);
          const newActivity = {
            ...payload.new,
            type: 'login_attempt' as const
          };
          
          setLiveActivities(prev => [newActivity, ...prev].slice(0, 15));

          // Add to security alerts if blocked or suspicious
          if (payload.new.attempt_type === 'blocked' || payload.new.attempt_type === 'suspicious') {
            setSecurityAlerts(prev => [payload.new, ...prev].slice(0, 5));
            toast.error(`নিরাপত্তা সতর্কতা: ${payload.new.attempt_type === 'blocked' ? 'ব্লক' : 'সন্দেহজনক'} লগইন প্রচেষ্টা`, {
              description: `${payload.new.mobile_number || 'N/A'} - ${payload.new.city}, ${payload.new.country}`
            });
          } else if (payload.new.attempt_type === 'success') {
            toast.success('নতুন সফল লগইন', {
              description: `${payload.new.mobile_number || 'N/A'}`
            });
          }

          // Refresh active users count
          fetchLiveData();
        }
      )
      .subscribe();

    // Listen to user sessions
    const sessionsChannel = supabase
      .channel('sessions-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_sessions'
        },
        (payload) => {
          console.log('New session:', payload);
          const newActivity = {
            ...payload.new,
            type: 'session_created' as const
          };
          setLiveActivities(prev => [newActivity, ...prev].slice(0, 15));
          
          toast.info('নতুন ডিভাইস সেশন', {
            description: `${payload.new.device_name || 'Unknown Device'} - অনুমোদনের জন্য অপেক্ষমাণ`
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_sessions'
        },
        (payload) => {
          console.log('Session updated:', payload);
          if (payload.new.is_approved && !payload.old.is_approved) {
            const newActivity = {
              ...payload.new,
              type: 'session_approved' as const
            };
            setLiveActivities(prev => [newActivity, ...prev].slice(0, 15));
          }

          // Refresh active users count
          fetchLiveData();
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(loginAttemptsChannel);
      supabase.removeChannel(sessionsChannel);
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || profile?.role !== 'admin') {
    return <Navigate to="/auth" replace />;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleViewAlertDetails = (alertId: string) => {
    navigate('/admin/sessions');
  };

  const statCards = [
    {
      title: "মোট ব্যবহারকারী",
      description: "সব রেজিস্টার্ড ইউজার",
      value: stats.totalUsers,
      icon: Users,
      colorClass: "stat-blue",
      link: "/admin/members"
    },
    {
      title: "অনলাইন এখন",
      description: "১৫ মিনিটে সক্রিয়",
      value: activeUsersCount,
      icon: Activity,
      colorClass: "stat-green",
      isLive: true
    },
    {
      title: "সক্রিয় সাবস্ক্রিপশন",
      description: "চলমান প্ল্যান",
      value: stats.activeSubscriptions,
      icon: CreditCard,
      colorClass: "stat-purple",
      link: "/admin/members"
    },
    {
      title: "অনুমোদন বাকি",
      description: "দ্রুত অনুমোদন দিন",
      value: stats.pendingApprovals,
      icon: Clock,
      colorClass: "stat-orange",
      alert: stats.pendingApprovals > 0,
      link: "/admin/members"
    },
    {
      title: "শীঘ্রই মেয়াদ শেষ",
      description: "৭ দিনের মধ্যে",
      value: stats.expiringSoon,
      icon: AlertCircle,
      colorClass: "stat-red",
      alert: stats.expiringSoon > 0,
      link: "/admin/members"
    },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar onSignOut={handleSignOut} />
        
        <div className="flex-1 flex flex-col">
          <header className="h-14 sm:h-16 border-b bg-card/80 backdrop-blur-xl shadow-sm flex items-center justify-between px-3 sm:px-4 lg:px-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <SidebarTrigger />
              <div>
                <h1 className="text-base sm:text-lg md:text-xl font-bold font-bengali text-foreground">ড্যাশবোর্ড</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-bengali hidden sm:block">সব কিছুর সংক্ষিপ্ত বিবরণ</p>
              </div>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-auto bg-gradient-to-br from-background via-background to-muted/20">
            <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
              {dataLoading ? (
                <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Card key={i} className="animate-fade-in">
                      <CardHeader className="p-3 sm:p-4">
                        <Skeleton className="h-4 w-20 sm:w-32" />
                      </CardHeader>
                      <CardContent className="p-3 sm:p-4 pt-0">
                        <Skeleton className="h-8 sm:h-10 w-16 sm:w-24" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {statCards.map((stat, index) => (
                    <Card 
                      key={stat.title} 
                      className={`animate-fade-in cursor-pointer transition-all duration-300 overflow-hidden group relative hover:shadow-md
                        ${stat.alert ? 'border-[hsl(var(--stat-orange))]/50' : ''} 
                        ${stat.isLive ? 'border-[hsl(var(--stat-green))]/50' : ''}`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                      onClick={() => stat.link && navigate(stat.link)}
                    >
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-start justify-between mb-2 sm:mb-3">
                          <div 
                            className="p-1.5 sm:p-2 rounded-lg"
                            style={{ backgroundColor: `hsl(var(--${stat.colorClass})/0.15)` }}
                          >
                            <stat.icon 
                              className="h-3 w-3 sm:h-4 sm:w-4" 
                              style={{ color: `hsl(var(--${stat.colorClass}))` }}
                            />
                          </div>
                          {stat.isLive && (
                            <span className="flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full opacity-75" style={{ backgroundColor: `hsl(var(--${stat.colorClass}))` }} />
                              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: `hsl(var(--${stat.colorClass}))` }} />
                            </span>
                          )}
                          {stat.alert && (
                            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: `hsl(var(--${stat.colorClass}))` }} />
                          )}
                        </div>
                        <div className="text-xl sm:text-2xl font-bold mb-0.5" style={{ color: `hsl(var(--${stat.colorClass}))` }}>
                          {stat.value}
                        </div>
                        <p className="text-[10px] sm:text-xs font-medium font-bengali text-foreground leading-tight">{stat.title}</p>
                        <p className="text-[9px] sm:text-[10px] font-bengali text-muted-foreground">{stat.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Realtime Activity and Security Alerts */}
              <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
                  <LiveActivityFeed activities={liveActivities} />
                </div>
                <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
                  <SecurityAlerts alerts={securityAlerts} onViewDetails={handleViewAlertDetails} />
                </div>
              </div>

              <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                <Card className="animate-fade-in hover:shadow-md transition-shadow" style={{ animationDelay: "0.5s" }}>
                  <CardHeader className="bg-gradient-to-br from-[hsl(var(--stat-blue)/0.05)] to-transparent">
                    <CardTitle className="font-bengali flex items-center gap-2">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: 'hsl(var(--stat-blue)/0.15)' }}>
                        <Users className="h-5 w-5" style={{ color: 'hsl(var(--stat-blue))' }} />
                      </div>
                      সাম্প্রতিক ব্যবহারকারী
                    </CardTitle>
                    <CardDescription className="font-bengali">সর্বশেষ রেজিস্টার করা ব্যবহারকারীরা</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dataLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : recentUsers.length === 0 ? (
                      <p className="text-center text-muted-foreground font-bengali py-4">কোনো ব্যবহারকারী নেই</p>
                    ) : (
                      <div className="space-y-3">
                        {recentUsers.map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                            <div>
                              <p className="font-medium">{user.mobile_number}</p>
                              <p className="text-xs text-muted-foreground font-bengali">{formatDateBengali(user.created_at)}</p>
                            </div>
                            <Badge variant={user.user_type === 'business' ? 'default' : 'secondary'}>
                              {user.user_type === 'business' ? '💼 বিজনেস' : '📱 মোবাইল'}
                            </Badge>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full font-bengali" onClick={() => navigate('/admin/users')}>সব দেখুন</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="animate-fade-in hover:shadow-md transition-shadow" style={{ animationDelay: "0.6s" }}>
                  <CardHeader className="bg-gradient-to-br from-[hsl(var(--stat-orange)/0.05)] to-transparent">
                    <CardTitle className="font-bengali flex items-center gap-2">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: 'hsl(var(--stat-orange)/0.15)' }}>
                        <Clock className="h-5 w-5" style={{ color: 'hsl(var(--stat-orange))' }} />
                      </div>
                      পেন্ডিং অনুমোদন
                    </CardTitle>
                    <CardDescription className="font-bengali">অনুমোদনের অপেক্ষায় থাকা সাবস্ক্রিপশন</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dataLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : pendingSubscriptions.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
                        <p className="text-muted-foreground font-bengali">কোনো পেন্ডিং অনুমোদন নেই</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pendingSubscriptions.map((sub) => (
                          <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                            <div>
                              <p className="font-medium">{sub.profiles.mobile_number}</p>
                              <p className="text-xs text-muted-foreground font-bengali">{sub.plan_months} মাস - {sub.price_taka} ৳</p>
                            </div>
                            <Badge variant="outline" className="text-orange-500 border-orange-500">পেন্ডিং</Badge>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full font-bengali" onClick={() => navigate('/admin/subscriptions')}>সব দেখুন</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="animate-fade-in hover:shadow-md transition-shadow" style={{ animationDelay: "0.7s" }}>
                <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent">
                  <CardTitle className="font-bengali flex items-center gap-2">
                    <ArrowRight className="h-5 w-5 text-primary" />
                    দ্রুত লিঙ্ক
                  </CardTitle>
                  <CardDescription className="font-bengali">সাধারণ কাজের জন্য দ্রুত অ্যাক্সেস</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex flex-col gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all group" 
                      onClick={() => navigate('/admin/analytics')}
                    >
                      <div className="p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <BarChart3 className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-bengali text-sm">অ্যানালিটিক্স</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex flex-col gap-2 hover:border-[hsl(var(--stat-blue))]/50 hover:bg-[hsl(var(--stat-blue))]/5 transition-all group" 
                      onClick={() => navigate('/admin/users')}
                    >
                      <div className="p-2.5 rounded-xl group-hover:bg-[hsl(var(--stat-blue))]/20 transition-colors" style={{ backgroundColor: 'hsl(var(--stat-blue)/0.1)' }}>
                        <Users className="h-5 w-5" style={{ color: 'hsl(var(--stat-blue))' }} />
                      </div>
                      <span className="font-bengali text-sm">ব্যবহারকারী</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex flex-col gap-2 hover:border-[hsl(var(--stat-purple))]/50 hover:bg-[hsl(var(--stat-purple))]/5 transition-all group" 
                      onClick={() => navigate('/admin/subscriptions')}
                    >
                      <div className="p-2.5 rounded-xl group-hover:bg-[hsl(var(--stat-purple))]/20 transition-colors" style={{ backgroundColor: 'hsl(var(--stat-purple)/0.1)' }}>
                        <CreditCard className="h-5 w-5" style={{ color: 'hsl(var(--stat-purple))' }} />
                      </div>
                      <span className="font-bengali text-sm">সাবস্ক্রিপশন</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex flex-col gap-2 hover:border-[hsl(var(--stat-orange))]/50 hover:bg-[hsl(var(--stat-orange))]/5 transition-all group" 
                      onClick={() => navigate('/admin/passwords')}
                    >
                      <div className="p-2.5 rounded-xl group-hover:bg-[hsl(var(--stat-orange))]/20 transition-colors" style={{ backgroundColor: 'hsl(var(--stat-orange)/0.1)' }}>
                        <Key className="h-5 w-5" style={{ color: 'hsl(var(--stat-orange))' }} />
                      </div>
                      <span className="font-bengali text-sm">ZIP পাসওয়ার্ড</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex flex-col gap-2 hover:border-info/50 hover:bg-info/5 transition-all group" 
                      onClick={() => navigate('/admin/drive-check')}
                    >
                      <div className="p-2.5 rounded-xl bg-info/10 group-hover:bg-info/20 transition-colors">
                        <HardDrive className="h-5 w-5 text-info" />
                      </div>
                      <span className="font-bengali text-sm">ড্রাইভ চেক</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex flex-col gap-2 hover:border-muted-foreground/50 hover:bg-muted/50 transition-all group" 
                      onClick={() => navigate('/admin/settings')}
                    >
                      <div className="p-2.5 rounded-xl bg-muted group-hover:bg-muted/80 transition-colors">
                        <Settings className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <span className="font-bengali text-sm">সেটিংস</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
