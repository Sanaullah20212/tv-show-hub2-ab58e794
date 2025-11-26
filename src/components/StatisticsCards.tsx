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
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {/* Days Remaining Card */}
      <Card className="hover:shadow-md transition-all duration-300 overflow-hidden group relative">
        <div 
          className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity"
          style={{ background: 'linear-gradient(135deg, hsl(var(--info)/0.05) 0%, hsl(var(--info)/0.1) 100%)' }}
        />
        <CardContent className="pt-3 pb-3 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bengali text-muted-foreground">বাকি দিন</p>
              <p className="text-2xl font-bold mt-0.5" style={{ color: 'hsl(var(--info))' }}>
                {daysRemaining > 0 ? daysRemaining : 0}
              </p>
              <p className="text-xs text-muted-foreground font-bengali mt-1">
                {subscription?.end_date && `শেষ: ${formatDateBengali(new Date(subscription.end_date))}`}
              </p>
            </div>
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: 'hsl(var(--info)/0.15)' }}
            >
              <Clock className="h-5 w-5" style={{ color: 'hsl(var(--info))' }} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Days Active Card */}
      <Card className="hover:shadow-md transition-all duration-300 overflow-hidden group relative">
        <div 
          className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity"
          style={{ background: 'linear-gradient(135deg, hsl(var(--success)/0.05) 0%, hsl(var(--success)/0.1) 100%)' }}
        />
        <CardContent className="pt-3 pb-3 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bengali text-muted-foreground">সক্রিয় দিন</p>
              <p className="text-2xl font-bold mt-0.5" style={{ color: 'hsl(var(--success))' }}>
                {daysActive > 0 ? daysActive : 0}
              </p>
              <p className="text-xs text-muted-foreground font-bengali mt-1">
                {subscription?.plan_months && `মোট ${subscription.plan_months} মাসের প্ল্যান`}
              </p>
            </div>
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: 'hsl(var(--success)/0.15)' }}
            >
              <TrendingUp className="h-5 w-5" style={{ color: 'hsl(var(--success))' }} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Status Card */}
      <Card className="hover:shadow-md transition-all duration-300 overflow-hidden group relative">
        <div 
          className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity"
          style={{ background: 'linear-gradient(135deg, hsl(var(--primary)/0.05) 0%, hsl(var(--primary)/0.1) 100%)' }}
        />
        <CardContent className="pt-3 pb-3 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bengali text-muted-foreground">স্ট্যাটাস</p>
              <p className="text-2xl font-bold mt-0.5 font-bengali" style={{ color: 'hsl(var(--primary))' }}>
                {subscription?.status === 'active' ? 'সক্রিয়' : 
                 subscription?.status === 'pending' ? 'অপেক্ষমাণ' : 'নিষ্ক্রিয়'}
              </p>
              <p className="text-xs text-muted-foreground font-bengali mt-1">
                {subscription?.start_date && `শুরু: ${formatDateBengali(new Date(subscription.start_date))}`}
              </p>
            </div>
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: 'hsl(var(--primary)/0.15)' }}
            >
              <CalendarDays className="h-5 w-5" style={{ color: 'hsl(var(--primary))' }} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

