import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Clock, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  Timer,
  CalendarDays,
  Banknote,
  Pause
} from 'lucide-react';
import { format, differenceInDays, differenceInHours } from 'date-fns';
import { bn } from 'date-fns/locale';

interface SubscriptionDetailsProps {
  subscription: {
    id: string;
    plan_months: number;
    price_taka: number;
    status: string;
    start_date: string;
    end_date: string;
    payment_method: string | null;
    payment_last_digits: string | null;
    is_paused: boolean;
    paused_days_remaining: number | null;
    created_at: string;
  } | null;
}

const SubscriptionDetails = ({ subscription }: SubscriptionDetailsProps) => {
  if (!subscription) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardContent className="py-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground font-bengali">
            কোনো সক্রিয় সাবস্ক্রিপশন নেই
          </p>
        </CardContent>
      </Card>
    );
  }

  const startDate = new Date(subscription.start_date);
  const endDate = new Date(subscription.end_date);
  const now = new Date();
  
  // Calculate remaining days and hours
  const remainingDays = differenceInDays(endDate, now);
  const remainingHours = differenceInHours(endDate, now) % 24;
  
  // Calculate total days and progress
  const totalDays = differenceInDays(endDate, startDate);
  const usedDays = differenceInDays(now, startDate);
  const progressPercent = Math.min(Math.max((usedDays / totalDays) * 100, 0), 100);
  
  // Check status
  const isActive = subscription.status === 'active' && endDate > now;
  const isPending = subscription.status === 'pending';
  const isExpired = subscription.status === 'expired' || endDate <= now;
  const isPaused = subscription.is_paused;

  // Bengali number conversion
  const toBengaliNumber = (num: number): string => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().split('').map(d => bengaliDigits[parseInt(d)] || d).join('');
  };

  // Format date in Bengali
  const formatBanglaDate = (date: Date) => {
    return format(date, 'dd MMMM, yyyy', { locale: bn });
  };

  // Plan name in Bengali
  const getPlanName = (months: number) => {
    const monthMap: Record<number, string> = {
      1: '১ মাস',
      2: '২ মাস',
      3: '৩ মাস',
      6: '৬ মাস',
      12: '১২ মাস'
    };
    return monthMap[months] || `${toBengaliNumber(months)} মাস`;
  };

  // Status badge
  const getStatusBadge = () => {
    if (isPaused) {
      return (
        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 font-bengali">
          <Pause className="h-3 w-3 mr-1" />
          পজড
        </Badge>
      );
    }
    if (isActive) {
      return (
        <Badge className="bg-success/20 text-success border-success/30 font-bengali">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          সক্রিয়
        </Badge>
      );
    }
    if (isPending) {
      return (
        <Badge className="bg-warning/20 text-warning border-warning/30 font-bengali">
          <Clock className="h-3 w-3 mr-1" />
          অপেক্ষমাণ
        </Badge>
      );
    }
    return (
      <Badge className="bg-destructive/20 text-destructive border-destructive/30 font-bengali">
        <AlertCircle className="h-3 w-3 mr-1" />
        মেয়াদ শেষ
      </Badge>
    );
  };

  // Payment method display
  const getPaymentMethodName = (method: string | null) => {
    const methodMap: Record<string, string> = {
      'bkash': 'বিকাশ',
      'nagad': 'নগদ',
      'rocket': 'রকেট',
      'upi': 'UPI'
    };
    return method ? methodMap[method] || method : 'অজানা';
  };

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-border/50 overflow-hidden">
      {/* Header with Status */}
      <CardHeader className="pb-4 border-b border-border/30">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-lg sm:text-xl font-bengali flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            সাবস্ক্রিপশন বিবরণ
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Plan Info */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/20">
          <div>
            <p className="text-sm text-muted-foreground font-bengali">বর্তমান প্ল্যান</p>
            <p className="text-xl sm:text-2xl font-bold text-primary font-bengali">
              {getPlanName(subscription.plan_months)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground font-bengali">মূল্য</p>
            <p className="text-xl sm:text-2xl font-bold text-foreground font-bengali">
              ৳{toBengaliNumber(subscription.price_taka)}
            </p>
          </div>
        </div>

        {/* Remaining Time - Only for active subscriptions */}
        {isActive && !isPaused && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground font-bengali flex items-center gap-2">
                <Timer className="h-4 w-4" />
                বাকি সময়
              </span>
              <span className="text-sm font-medium text-foreground font-bengali">
                {toBengaliNumber(Math.round(progressPercent))}% ব্যবহৃত
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <div className="flex items-center justify-center gap-4 p-4 rounded-xl bg-success/10 border border-success/20">
              <div className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-success font-bengali">
                  {remainingDays >= 0 ? toBengaliNumber(remainingDays) : '০'}
                </p>
                <p className="text-sm text-muted-foreground font-bengali">দিন</p>
              </div>
              <div className="h-12 w-px bg-border/50" />
              <div className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-success font-bengali">
                  {remainingHours >= 0 ? toBengaliNumber(remainingHours) : '০'}
                </p>
                <p className="text-sm text-muted-foreground font-bengali">ঘন্টা</p>
              </div>
            </div>
          </div>
        )}

        {/* Paused Info */}
        {isPaused && subscription.paused_days_remaining && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
            <Pause className="h-8 w-8 mx-auto text-amber-400 mb-2" />
            <p className="text-sm text-muted-foreground font-bengali mb-1">সাবস্ক্রিপশন পজ করা আছে</p>
            <p className="text-2xl font-bold text-amber-400 font-bengali">
              {toBengaliNumber(subscription.paused_days_remaining)} দিন বাকি
            </p>
          </div>
        )}

        {/* Date Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground font-bengali">শুরুর তারিখ</span>
            </div>
            <p className="text-base sm:text-lg font-semibold text-foreground font-bengali">
              {formatBanglaDate(startDate)}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays className="h-4 w-4 text-destructive" />
              <span className="text-sm text-muted-foreground font-bengali">শেষ তারিখ</span>
            </div>
            <p className="text-base sm:text-lg font-semibold text-foreground font-bengali">
              {formatBanglaDate(endDate)}
            </p>
          </div>
        </div>

        {/* Payment Info */}
        {subscription.payment_method && (
          <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <Banknote className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground font-bengali">পেমেন্ট তথ্য</span>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-base font-semibold text-foreground font-bengali">
                {getPaymentMethodName(subscription.payment_method)}
              </p>
              {subscription.payment_last_digits && (
                <Badge variant="outline" className="font-mono">
                  •••• {subscription.payment_last_digits}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Pending Message */}
        {isPending && (
          <div className="p-4 rounded-xl bg-warning/10 border border-warning/20 text-center">
            <Clock className="h-8 w-8 mx-auto text-warning mb-2" />
            <p className="text-sm font-bengali text-warning">
              আপনার সাবস্ক্রিপশন এডমিন অনুমোদনের অপেক্ষায় রয়েছে
            </p>
          </div>
        )}

        {/* Expired Message */}
        {isExpired && !isPending && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-center">
            <AlertCircle className="h-8 w-8 mx-auto text-destructive mb-2" />
            <p className="text-sm font-bengali text-destructive">
              আপনার সাবস্ক্রিপশনের মেয়াদ শেষ হয়ে গেছে
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionDetails;
