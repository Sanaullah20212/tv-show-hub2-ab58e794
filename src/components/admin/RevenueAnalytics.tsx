import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, DollarSign, CreditCard, PieChart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RevenueData {
  totalRevenue: number;
  monthlyRevenue: number;
  dailyRevenue: number;
  paymentMethodStats: Array<{ method: string; count: number; revenue: number }>;
}

export const RevenueAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<RevenueData>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    dailyRevenue: 0,
    paymentMethodStats: []
  });
  const [timeRange, setTimeRange] = useState<'day' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchRevenueData();
  }, [timeRange]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const now = new Date();
      let startDate: Date;

      switch (timeRange) {
        case 'day':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
      }

      // Get all active subscriptions
      const { data: allSubs, error: allError } = await supabase
        .from('subscriptions')
        .select('price_taka, payment_method')
        .eq('status', 'active');

      if (allError) throw allError;

      const totalRevenue = allSubs?.reduce((sum, sub) => sum + sub.price_taka, 0) || 0;

      // Get subscriptions in selected time range
      const { data: rangeSubs, error: rangeError } = await supabase
        .from('subscriptions')
        .select('price_taka, payment_method, created_at')
        .eq('status', 'active')
        .gte('created_at', startDate.toISOString());

      if (rangeError) throw rangeError;

      const rangeRevenue = rangeSubs?.reduce((sum, sub) => sum + sub.price_taka, 0) || 0;

      // Get today's revenue
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const { data: todaySubs, error: todayError } = await supabase
        .from('subscriptions')
        .select('price_taka')
        .eq('status', 'active')
        .gte('created_at', todayStart.toISOString());

      if (todayError) throw todayError;

      const dailyRevenue = todaySubs?.reduce((sum, sub) => sum + sub.price_taka, 0) || 0;

      // Calculate payment method statistics
      const paymentMethodMap = new Map<string, { count: number; revenue: number }>();
      
      allSubs?.forEach(sub => {
        const method = sub.payment_method || 'Unknown';
        const existing = paymentMethodMap.get(method) || { count: 0, revenue: 0 };
        paymentMethodMap.set(method, {
          count: existing.count + 1,
          revenue: existing.revenue + sub.price_taka
        });
      });

      const paymentMethodStats = Array.from(paymentMethodMap.entries()).map(([method, stats]) => ({
        method,
        ...stats
      })).sort((a, b) => b.revenue - a.revenue);

      setRevenueData({
        totalRevenue,
        monthlyRevenue: timeRange === 'month' ? rangeRevenue : 0,
        dailyRevenue,
        paymentMethodStats
      });
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodBengaliName = (method: string) => {
    const names: Record<string, string> = {
      'bkash': 'বিকাশ',
      'nagad': 'নগদ',
      'rocket': 'রকেট',
      'upay': 'উপায়',
      'upi': 'ইউপিআই',
      'bank': 'ব্যাংক',
      'cash': 'ক্যাশ',
      'Unknown': 'অজানা'
    };
    return names[method] || method;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-bengali">আয়ের পরিসংখ্যান</h2>
        <Select value={timeRange} onValueChange={(value: 'day' | 'month' | 'year') => setTimeRange(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">আজ</SelectItem>
            <SelectItem value="month">এই মাস</SelectItem>
            <SelectItem value="year">এই বছর</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Revenue Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-bengali">মোট আয়</CardTitle>
            <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">৳{revenueData.totalRevenue.toLocaleString('bn-BD')}</div>
            <p className="text-xs text-muted-foreground mt-1 font-bengali">সর্বমোট সংগৃহীত</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-bengali">
              {timeRange === 'day' ? 'আজকের আয়' : timeRange === 'month' ? 'মাসিক আয়' : 'বার্ষিক আয়'}
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              ৳{(timeRange === 'day' ? revenueData.dailyRevenue : revenueData.monthlyRevenue).toLocaleString('bn-BD')}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-bengali">
              {timeRange === 'day' ? 'আজকের সংগ্রহ' : timeRange === 'month' ? 'এই মাসের সংগ্রহ' : 'এই বছরের সংগ্রহ'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-info">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-bengali">গড় লেনদেন</CardTitle>
            <div className="h-10 w-10 rounded-full bg-info/10 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-info" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-info">
              ৳{revenueData.paymentMethodStats.length > 0 
                ? Math.round(revenueData.totalRevenue / revenueData.paymentMethodStats.reduce((sum, s) => sum + s.count, 0)).toLocaleString('bn-BD')
                : '0'}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-bengali">প্রতি সাবস্ক্রিপশন</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Method Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="font-bengali flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent/10">
              <PieChart className="h-5 w-5 text-accent" />
            </div>
            পেমেন্ট মেথড পরিসংখ্যান
          </CardTitle>
          <CardDescription className="font-bengali">কোন পেমেন্ট মেথড সবচেয়ে বেশি ব্যবহৃত হচ্ছে</CardDescription>
        </CardHeader>
        <CardContent>
          {revenueData.paymentMethodStats.length === 0 ? (
            <p className="text-center text-muted-foreground font-bengali py-8">কোনো ডেটা নেই</p>
          ) : (
            <div className="space-y-4">
              {revenueData.paymentMethodStats.map((stat, index) => {
                const percentage = (stat.revenue / revenueData.totalRevenue) * 100;
                const colors = ['bg-success', 'bg-primary', 'bg-info', 'bg-warning', 'bg-danger'];
                const colorClass = colors[index % colors.length];
                
                return (
                  <div key={stat.method} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium font-bengali">{getPaymentMethodBengaliName(stat.method)}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground font-bengali">{stat.count}টি লেনদেন</span>
                        <span className="font-bold">৳{stat.revenue.toLocaleString('bn-BD')}</span>
                      </div>
                    </div>
                    <div className="relative h-3 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${colorClass} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground text-right font-bengali">
                      {percentage.toFixed(1)}% মোট আয়ের
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};