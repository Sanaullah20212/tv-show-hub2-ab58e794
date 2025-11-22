import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AnalyticsOverview } from '@/components/admin/AnalyticsOverview';
import { ThemeToggle } from '@/components/ThemeToggle';

const AdminAnalytics = () => {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    newUsersThisMonth: 0,
    conversionRate: 0,
  });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [userTypeData, setUserTypeData] = useState<any[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      fetchAnalytics();
    }
  }, [user, profile]);

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);

      // Fetch total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch active subscriptions
      const { data: activeSubsData, count: activeSubscriptions } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact' })
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString());

      // Calculate total revenue
      const totalRevenue = activeSubsData?.reduce((sum, sub) => sum + sub.price_taka, 0) || 0;

      // Fetch monthly data
      const currentMonth = new Date().toISOString().slice(0, 7);
      const { data: monthlySubsData } = await supabase
        .from('subscriptions')
        .select('*')
        .gte('created_at', `${currentMonth}-01`)
        .eq('status', 'active');

      const monthlyRevenue = monthlySubsData?.reduce((sum, sub) => sum + sub.price_taka, 0) || 0;

      // Fetch new users this month
      const { count: newUsersThisMonth } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${currentMonth}-01`);

      // Calculate conversion rate
      const conversionRate = totalUsers && activeSubscriptions
        ? (activeSubscriptions / totalUsers) * 100
        : 0;

      setStats({
        totalUsers: totalUsers || 0,
        activeSubscriptions: activeSubscriptions || 0,
        totalRevenue,
        monthlyRevenue,
        newUsersThisMonth: newUsersThisMonth || 0,
        conversionRate,
      });

      // Fetch revenue trend (last 6 months)
      await fetchRevenueTrend();
      await fetchUserTypeData();
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchRevenueTrend = async () => {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = date.toISOString().slice(0, 7);
      const monthName = date.toLocaleDateString('bn-BD', { month: 'short' });

      const { data: subsData } = await supabase
        .from('subscriptions')
        .select('*')
        .gte('created_at', `${monthStr}-01`)
        .lt('created_at', `${new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString().slice(0, 10)}`);

      const { count: newUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${monthStr}-01`)
        .lt('created_at', `${new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString().slice(0, 10)}`);

      const revenue = subsData?.reduce((sum, sub) => sum + sub.price_taka, 0) || 0;

      months.push({
        month: monthName,
        revenue,
        users: newUsers || 0,
      });
    }

    setRevenueData(months);
  };

  const fetchUserTypeData = async () => {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_type');

    const mobileCount = profiles?.filter(p => p.user_type === 'mobile').length || 0;
    const businessCount = profiles?.filter(p => p.user_type === 'business').length || 0;

    setUserTypeData([
      { name: 'মোবাইল', value: mobileCount, color: 'hsl(var(--primary))' },
      { name: 'বিজনেস', value: businessCount, color: 'hsl(var(--accent))' },
    ]);
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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar onSignOut={handleSignOut} />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b bg-card/50 backdrop-blur flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold font-bengali">অ্যানালিটিক্স</h1>
            </div>
            <ThemeToggle />
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            <AnalyticsOverview
              stats={stats}
              revenueData={revenueData}
              userTypeData={userTypeData}
              loading={analyticsLoading}
            />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminAnalytics;
