import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, Smartphone, Archive, Shield, LogOut, FileArchive, Key, Home, Settings, User, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useSubscriptionNotifications } from '@/hooks/useSubscriptionNotifications';
import { ThemeToggle } from '@/components/ThemeToggle';
import { StatisticsCards } from '@/components/StatisticsCards';
import { NotificationBell } from '@/components/NotificationBell';
import MobileBottomNav from '@/components/MobileBottomNav';
import ZipPasswords from '@/components/ZipPasswords';
import DriveFiles from '@/components/DriveFiles';
import { QuickActions } from '@/components/QuickActions';
import { Progress } from '@/components/ui/progress';
import { formatDateBengali } from '@/lib/utils';

const Dashboard = () => {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<'drive' | null>(null);
  const { toast } = useToast();
  
  // Initialize push notifications for this user
  usePushNotifications(user?.id);
  
  // Initialize subscription notifications for admin users
  useSubscriptionNotifications(profile?.role === 'admin');

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      setSubscriptionLoading(true);
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
        return;
      }

      setSubscription(data);
    } catch (error) {
      console.error('Error in fetchSubscription:', error);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Admin dashboard
  if (profile?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  const hasActiveSubscription = subscription && subscription.status === 'active' && new Date(subscription.end_date) > new Date();
  const hasPendingSubscription = subscription && subscription.status === 'pending';
  
  // Calculate subscription progress
  const daysRemaining = hasActiveSubscription 
    ? Math.ceil((new Date(subscription.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const totalDays = hasActiveSubscription
    ? Math.ceil((new Date(subscription.end_date).getTime() - new Date(subscription.start_date).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const progressPercentage = hasActiveSubscription ? ((totalDays - daysRemaining) / totalDays) * 100 : 0;
  const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Enhanced Header */}
      <header className="sticky top-0 z-50 border-b bg-gradient-to-r from-card/90 via-card/80 to-card/90 backdrop-blur-xl shadow-lg">
        <div className="container mx-auto px-4 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div 
                className="p-2.5 sm:p-3 rounded-xl relative group hover:scale-110 transition-transform duration-300"
                style={{ 
                  background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)',
                  boxShadow: '0 8px 24px -4px hsl(var(--primary)/0.4)'
                }}
              >
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-bengali">
                  ড্যাশবোর্ড
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground font-bengali flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-success animate-pulse" />
                  {profile?.mobile_number}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <NotificationBell userId={user.id} />
              <ThemeToggle />
              <Button 
                onClick={() => navigate('/settings')} 
                variant="outline" 
                size="sm" 
                className="hover:bg-primary/10 hover:border-primary/50 transition-all font-bengali"
              >
                <User className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">প্রোফাইল</span>
              </Button>
              <Button 
                onClick={() => navigate('/')} 
                variant="outline" 
                size="sm" 
                className="hover:bg-accent/10 hover:border-accent/50 transition-all font-bengali"
              >
                <Home className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">হোম</span>
              </Button>
              <Button 
                onClick={signOut} 
                variant="outline" 
                size="sm" 
                className="hover:bg-destructive/10 hover:border-destructive/50 transition-all font-bengali"
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">লগআউট</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 max-w-7xl">
        {/* Enhanced Subscription Status Card */}
        <Card className="overflow-hidden relative group hover:shadow-xl transition-all duration-300 animate-fade-in">
          <div 
            className="absolute inset-0 opacity-50 group-hover:opacity-70 transition-opacity"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary)/0.05) 0%, hsl(var(--secondary)/0.05) 50%, hsl(var(--accent)/0.05) 100%)'
            }}
          />
          <div 
            className="absolute left-0 top-0 bottom-0 w-1 group-hover:w-1.5 transition-all"
            style={{ backgroundColor: 'hsl(var(--primary))' }}
          />
          <CardHeader className="relative z-10 pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div 
                  className="p-2.5 sm:p-3 rounded-xl group-hover:scale-110 transition-transform"
                  style={{ 
                    background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)',
                    boxShadow: '0 8px 20px -4px hsl(var(--primary)/0.4)'
                  }}
                >
                  <CalendarDays className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl font-bengali">সাবস্ক্রিপশন স্ট্যাটাস</CardTitle>
                  <CardDescription className="text-sm sm:text-base font-bengali mt-0.5">
                    আপনার বর্তমান প্ল্যানের তথ্য
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {hasActiveSubscription ? (
                  <Badge 
                    className="px-4 py-2 rounded-full font-bengali text-sm whitespace-nowrap animate-fade-in hover:scale-105 transition-all"
                    style={{ 
                      backgroundColor: 'hsl(var(--success)/0.15)',
                      color: 'hsl(var(--success))',
                      border: '1px solid hsl(var(--success)/0.3)',
                      boxShadow: '0 4px 16px hsl(var(--success)/0.3)'
                    }}
                  >
                    <span className="inline-block h-2 w-2 rounded-full bg-success mr-2 animate-pulse" />
                    সক্রিয়
                  </Badge>
                ) : hasPendingSubscription ? (
                  <Badge 
                    className="px-4 py-2 rounded-full font-bengali text-sm whitespace-nowrap animate-pulse"
                    style={{ 
                      backgroundColor: 'hsl(var(--warning)/0.15)',
                      color: 'hsl(var(--warning))',
                      border: '1px solid hsl(var(--warning)/0.3)'
                    }}
                  >
                    ⏳ অনুমোদনের অপেক্ষায়
                  </Badge>
                ) : (
                  <Badge 
                    className="px-4 py-2 rounded-full font-bengali text-sm whitespace-nowrap animate-fade-in"
                    style={{ 
                      backgroundColor: 'hsl(var(--destructive)/0.15)',
                      color: 'hsl(var(--destructive))',
                      border: '1px solid hsl(var(--destructive)/0.3)'
                    }}
                  >
                    ❌ মেয়াদ শেষ
                  </Badge>
                )}
                <Button 
                  onClick={() => navigate('/plans')}
                  size="sm"
                  className="font-bengali whitespace-nowrap px-4 sm:px-6 hover:scale-105 hover:shadow-lg transition-all"
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)',
                    color: 'white'
                  }}
                >
                  প্ল্যান দেখুন
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10 pt-0">
            {subscriptionLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-6 bg-muted/50 rounded-xl w-2/3"></div>
                <div className="h-6 bg-muted/50 rounded-xl w-1/2"></div>
              </div>
            ) : hasActiveSubscription ? (
              <div className="space-y-4">
                <div 
                  className="p-4 sm:p-6 rounded-xl relative overflow-hidden group/inner hover:scale-[1.02] transition-transform"
                  style={{
                    background: isExpiringSoon 
                      ? 'linear-gradient(135deg, hsl(var(--warning)) 0%, hsl(var(--destructive)) 100%)'
                      : 'linear-gradient(135deg, hsl(var(--success)) 0%, hsl(var(--info)) 100%)',
                    boxShadow: isExpiringSoon 
                      ? '0 8px 24px -4px hsl(var(--warning)/0.5)'
                      : '0 8px 24px -4px hsl(var(--success)/0.3)'
                  }}
                >
                  <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                  <div className="relative z-10 space-y-3">
                    <p className="text-white font-semibold font-bengali text-sm sm:text-base flex items-center gap-2">
                      <span className="text-lg">💎</span>
                      প্ল্যান: {subscription.plan_months} মাস • {subscription.price_taka} টাকা
                    </p>
                    <p className="text-white/90 font-bengali text-sm sm:text-base flex items-center gap-2">
                      <span className="text-lg">📅</span>
                      মেয়াদ: {formatDateBengali(subscription.end_date)} পর্যন্ত
                    </p>
                    <p className="text-white font-bold font-bengali text-sm sm:text-base flex items-center gap-2">
                      <span className="text-lg">⏰</span>
                      {daysRemaining} দিন বাকি আছে
                    </p>
                    
                    {/* Warning for expiring soon */}
                    {isExpiringSoon && (
                      <div className="mt-3 p-3 rounded-lg bg-white/20 backdrop-blur-sm animate-pulse">
                        <p className="text-white font-bold font-bengali text-sm flex items-center gap-2">
                          <AlertCircle className="h-5 w-5" />
                          ⚠️ সাবস্ক্রিপশন শীঘ্রই শেষ হয়ে যাবে!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Progress Bar Section */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bengali text-muted-foreground">
                      সাবস্ক্রিপশন অগ্রগতি
                    </span>
                    <span className="text-sm font-bengali font-semibold" style={{ 
                      color: isExpiringSoon ? 'hsl(var(--warning))' : 'hsl(var(--success))' 
                    }}>
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                  <Progress 
                    value={progressPercentage} 
                    className="h-3 bg-muted/50"
                    style={{
                      '--progress-color': isExpiringSoon 
                        ? 'linear-gradient(90deg, hsl(var(--warning)) 0%, hsl(var(--destructive)) 100%)'
                        : 'linear-gradient(90deg, hsl(var(--success)) 0%, hsl(var(--info)) 100%)'
                    } as React.CSSProperties}
                  />
                  <div className="flex justify-between text-xs font-bengali text-muted-foreground">
                    <span>শুরু: {formatDateBengali(subscription.start_date)}</span>
                    <span>শেষ: {formatDateBengali(subscription.end_date)}</span>
                  </div>
                </div>
              </div>
            ) : hasPendingSubscription ? (
              <div 
                className="p-4 sm:p-6 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--warning)/0.2) 0%, hsl(var(--warning)/0.1) 100%)',
                  border: '1px solid hsl(var(--warning)/0.3)'
                }}
              >
                <div className="space-y-2.5">
                  <p className="text-foreground font-semibold font-bengali text-sm sm:text-base flex items-center gap-2">
                    <span className="text-lg">💳</span>
                    প্ল্যান: {subscription.plan_months} মাস • {subscription.price_taka} টাকা
                  </p>
                  <p className="text-muted-foreground font-bengali text-sm sm:text-base flex items-center gap-2">
                    <span className="text-lg">📱</span>
                    পেমেন্ট: {subscription.payment_method}
                  </p>
                  <p className="font-medium font-bengali text-sm sm:text-base flex items-center gap-2" style={{ color: 'hsl(var(--warning))' }}>
                    <span className="text-lg animate-spin">🔄</span>
                    এডমিন অনুমোদনের অপেক্ষায় রয়েছে
                  </p>
                </div>
              </div>
            ) : (
              <div 
                className="p-4 sm:p-6 rounded-xl text-center"
                style={{
                  background: 'hsl(var(--muted)/0.3)',
                  border: '1px dashed hsl(var(--border))'
                }}
              >
                <AlertCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground font-bengali text-sm sm:text-base">
                  কোন সক্রিয় সাবস্ক্রিপশন নেই
                </p>
                <p className="text-xs text-muted-foreground font-bengali mt-1">
                  উপরে থেকে একটি প্ল্যান নির্বাচন করুন
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Section */}
        <QuickActions hasActiveSubscription={hasActiveSubscription} />

        {/* Statistics Cards */}
        {hasActiveSubscription && (
          <StatisticsCards 
            subscription={subscription}
            daysRemaining={daysRemaining}
            daysActive={Math.ceil((new Date().getTime() - new Date(subscription.start_date).getTime()) / (1000 * 60 * 60 * 24))}
            isLoading={subscriptionLoading}
          />
        )}

        {/* Service Access Cards with modern design */}
        <div className="grid gap-6 sm:gap-8">
          {/* Mobile Service Card */}
          {profile?.user_type === 'mobile' && (
            <Card className="overflow-hidden relative group hover:shadow-xl transition-all duration-300 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div 
                className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--tier-basic)/0.1) 0%, hsl(var(--tier-basic)/0.05) 100%)'
                }}
              />
              <div 
                className="absolute left-0 top-0 bottom-0 w-1 group-hover:w-1.5 transition-all"
                style={{ backgroundColor: 'hsl(var(--tier-basic))' }}
              />
              <CardHeader className="relative z-10 pb-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div 
                    className="p-3 sm:p-3.5 rounded-xl text-white group-hover:scale-110 transition-transform"
                    style={{ 
                      backgroundColor: 'hsl(var(--tier-basic))',
                      boxShadow: '0 8px 20px -4px hsl(var(--tier-basic)/0.4)'
                    }}
                  >
                    <Smartphone className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl font-bengali flex items-center gap-2">
                      📱 মোবাইল সার্ভিস
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base font-bengali">
                      আপনার ড্রাইভ ফাইলগুলো দেখুন এবং ডাউনলোড করুন
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10 pt-0">
                {hasActiveSubscription ? (
                  <DriveFiles 
                    userType="mobile" 
                    hasActiveSubscription={hasActiveSubscription} 
                  />
                ) : (
                  <div 
                    className="text-center p-6 sm:p-8 rounded-xl"
                    style={{
                      background: 'hsl(var(--muted)/0.3)',
                      border: '1px dashed hsl(var(--border))'
                    }}
                  >
                    <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm sm:text-base text-muted-foreground font-bengali font-medium">
                      সার্ভিস ব্যবহার করতে সক্রিয় সাবস্ক্রিপশন প্রয়োজন
                    </p>
                    <Button 
                      onClick={() => navigate('/plans')}
                      size="sm"
                      className="mt-4 font-bengali"
                      style={{
                        background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)',
                        color: 'white'
                      }}
                    >
                      প্ল্যান দেখুন
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Business Service Card */}
          {profile?.user_type === 'business' && (
            <Card className="overflow-hidden relative group hover:shadow-xl transition-all duration-300 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div 
                className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--tier-business)/0.1) 0%, hsl(var(--tier-business)/0.05) 100%)'
                }}
              />
              <div 
                className="absolute left-0 top-0 bottom-0 w-1 group-hover:w-1.5 transition-all"
                style={{ backgroundColor: 'hsl(var(--tier-business))' }}
              />
              <CardHeader className="relative z-10 pb-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div 
                    className="p-3 sm:p-3.5 rounded-xl text-white group-hover:scale-110 transition-transform"
                    style={{ 
                      backgroundColor: 'hsl(var(--tier-business))',
                      boxShadow: '0 8px 20px -4px hsl(var(--tier-business)/0.4)'
                    }}
                  >
                    <FileArchive className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl font-bengali flex items-center gap-2">
                      📂 বিজনেস সার্ভিস
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base font-bengali">
                      জিপ ফাইল এবং পাসওয়ার্ড অ্যাক্সেস করুন
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10 space-y-6 pt-0">
                {hasActiveSubscription ? (
                  <>
                    <DriveFiles 
                      userType="business" 
                      hasActiveSubscription={hasActiveSubscription} 
                    />
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-semibold mb-4 flex items-center gap-2 font-bengali text-base">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ 
                            backgroundColor: 'hsl(var(--primary)/0.15)',
                            color: 'hsl(var(--primary))'
                          }}
                        >
                          <Key className="h-4 w-4" />
                        </div>
                        পাসওয়ার্ড লিস্ট
                      </h4>
                      <ZipPasswords />
                    </div>
                  </>
                ) : (
                  <div 
                    className="text-center p-6 sm:p-8 rounded-xl"
                    style={{
                      background: 'hsl(var(--muted)/0.3)',
                      border: '1px dashed hsl(var(--border))'
                    }}
                  >
                    <Key className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm sm:text-base text-muted-foreground font-bengali font-medium">
                      জিপ ফাইল এবং পাসওয়ার্ড দেখতে সক্রিয় সাবস্ক্রিপশন প্রয়োজন
                    </p>
                    <Button 
                      onClick={() => navigate('/plans')}
                      size="sm"
                      className="mt-4 font-bengali"
                      style={{
                        background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)',
                        color: 'white'
                      }}
                    >
                      প্ল্যান দেখুন
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

      </div>
      <MobileBottomNav />
    </div>
  );
};

export default Dashboard;