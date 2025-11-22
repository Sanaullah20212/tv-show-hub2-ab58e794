import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Download, TrendingUp, Clock } from 'lucide-react';
import { formatDateBengali } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface StatisticsCardsProps {
  subscription: any;
  daysRemaining: number;
  daysActive: number;
  isLoading?: boolean;
}

export function StatisticsCards({ subscription, daysRemaining, daysActive, isLoading }: StatisticsCardsProps) {
  const subscriptionProgress = subscription ? 
    ((daysActive / (daysActive + daysRemaining)) * 100).toFixed(0) : 0;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-fade-in" style={{ animationDelay: `${(i - 1) * 0.1}s` }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Subscription Status Card */}
      <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden group animate-fade-in relative">
        <div 
          className="absolute inset-0 opacity-50 group-hover:opacity-70 transition-opacity"
          style={{ background: 'linear-gradient(135deg, hsl(var(--primary)/0.05) 0%, hsl(var(--primary)/0.1) 100%)' }}
        />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium font-bengali text-muted-foreground group-hover:text-foreground transition-colors">
            সাবস্ক্রিপশন স্ট্যাটাস
          </CardTitle>
          <div 
            className="p-2 rounded-lg group-hover:scale-110 transition-transform"
            style={{ backgroundColor: 'hsl(var(--primary)/0.15)' }}
          >
            <CalendarDays className="h-4 w-4" style={{ color: 'hsl(var(--primary))' }} />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-2xl font-bold font-bengali mb-1" style={{ color: 'hsl(var(--primary))' }}>
            {subscription?.status === 'active' ? 'সক্রিয়' : 
             subscription?.status === 'pending' ? 'অপেক্ষমাণ' : 'নিষ্ক্রিয়'}
          </div>
          <p className="text-xs text-muted-foreground font-bengali">
            {subscription?.start_date ? 
              `শুরু: ${formatDateBengali(new Date(subscription.start_date))}` : 
              'কোনো সাবস্ক্রিপশন নেই'}
          </p>
        </CardContent>
      </Card>

      {/* Days Remaining Card */}
      <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden group animate-fade-in relative" style={{ animationDelay: "0.1s" }}>
        <div 
          className="absolute inset-0 opacity-50 group-hover:opacity-70 transition-opacity"
          style={{ background: 'linear-gradient(135deg, hsl(var(--info)/0.05) 0%, hsl(var(--info)/0.1) 100%)' }}
        />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium font-bengali text-muted-foreground group-hover:text-foreground transition-colors">
            বাকি দিন
          </CardTitle>
          <div 
            className="p-2 rounded-lg group-hover:scale-110 transition-transform"
            style={{ backgroundColor: 'hsl(var(--info)/0.15)' }}
          >
            <Clock className="h-4 w-4" style={{ color: 'hsl(var(--info))' }} />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-2xl font-bold mb-1" style={{ color: 'hsl(var(--info))' }}>
            {daysRemaining > 0 ? daysRemaining : 0}
          </div>
          <p className="text-xs text-muted-foreground font-bengali mb-2">
            {subscription?.end_date ? 
              `শেষ: ${formatDateBengali(new Date(subscription.end_date))}` : 
              'মেয়াদ শেষ'}
          </p>
          {/* Enhanced Progress Bar */}
          {subscription && daysRemaining > 0 && (
            <div className="mt-3">
              <div 
                className="h-2 w-full rounded-full overflow-hidden"
                style={{ backgroundColor: 'hsl(var(--muted))' }}
              >
                <div 
                  className="h-full transition-all duration-500 rounded-full"
                  style={{ 
                    width: `${subscriptionProgress}%`,
                    background: 'linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--info)) 100%)'
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Days Active Card */}
      <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden group animate-fade-in relative" style={{ animationDelay: "0.2s" }}>
        <div 
          className="absolute inset-0 opacity-50 group-hover:opacity-70 transition-opacity"
          style={{ background: 'linear-gradient(135deg, hsl(var(--success)/0.05) 0%, hsl(var(--success)/0.1) 100%)' }}
        />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium font-bengali text-muted-foreground group-hover:text-foreground transition-colors">
            সক্রিয় দিন
          </CardTitle>
          <div 
            className="p-2 rounded-lg group-hover:scale-110 transition-transform"
            style={{ backgroundColor: 'hsl(var(--success)/0.15)' }}
          >
            <TrendingUp className="h-4 w-4" style={{ color: 'hsl(var(--success))' }} />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-2xl font-bold mb-1" style={{ color: 'hsl(var(--success))' }}>
            {daysActive > 0 ? daysActive : 0}
          </div>
          <p className="text-xs text-muted-foreground font-bengali">
            {subscription?.plan_months ? 
              `মোট ${subscription.plan_months} মাসের প্ল্যান` : 
              'কোনো ডেটা নেই'}
          </p>
        </CardContent>
      </Card>

      {/* Downloads Card */}
      <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden group animate-fade-in relative" style={{ animationDelay: "0.3s" }}>
        <div 
          className="absolute inset-0 opacity-50 group-hover:opacity-70 transition-opacity"
          style={{ background: 'linear-gradient(135deg, hsl(var(--accent)/0.05) 0%, hsl(var(--accent)/0.1) 100%)' }}
        />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium font-bengali text-muted-foreground group-hover:text-foreground transition-colors">
            ডাউনলোড অ্যাক্সেস
          </CardTitle>
          <div 
            className="p-2 rounded-lg group-hover:scale-110 transition-transform"
            style={{ backgroundColor: 'hsl(var(--accent)/0.15)' }}
          >
            <Download className="h-4 w-4" style={{ color: 'hsl(var(--accent))' }} />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-2xl font-bold mb-1" style={{ color: 'hsl(var(--accent))' }}>
            {subscription?.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
          </div>
          <p className="text-xs text-muted-foreground font-bengali">
            {subscription?.status === 'active' ? 
              'সব কন্টেন্ট অ্যাক্সেসযোগ্য' : 
              'সাবস্ক্রিপশন প্রয়োজন'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

