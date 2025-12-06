import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Pause, Play, ArrowUpCircle, Calendar, Phone, CreditCard, Clock } from 'lucide-react';
import { PaymentScreenshotViewer } from '@/components/PaymentScreenshotViewer';

interface SubscriptionCardProps {
  subscription: any;
  type: 'pending' | 'active' | 'all';
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
  onUpgrade?: (subscription: any) => void;
  formatBDDate: (dateStr: string) => string;
}

export const SubscriptionCard = ({
  subscription,
  type,
  onApprove,
  onReject,
  onPause,
  onResume,
  onUpgrade,
  formatBDDate
}: SubscriptionCardProps) => {
  const s = subscription;

  const getStatusBadge = (status: string, isPaused: boolean, pausedDays?: number) => {
    if (isPaused) {
      return (
        <Badge variant="outline" className="text-orange-500 border-orange-500">
          ⏸️ পজড ({pausedDays} দিন)
        </Badge>
      );
    }
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">সক্রিয়</Badge>;
      case 'pending':
        return <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30">পেন্ডিং</Badge>;
      case 'expired':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">মেয়াদ শেষ</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">বাতিল</Badge>;
      case 'rejected':
        return <Badge variant="destructive">প্রত্যাখ্যাত</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        {/* Header: User & Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium font-bengali">{s.profiles?.mobile_number || 'N/A'}</span>
          </div>
          {getStatusBadge(s.status, s.is_paused, s.paused_days_remaining)}
        </div>

        {/* Plan & Price */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="font-bengali">{s.plan_months} মাস</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <span className="font-bengali">{s.price_taka} ৳</span>
          </div>
        </div>

        {/* Payment Method */}
        {s.payment_method && (
          <div className="text-sm text-muted-foreground font-bengali">
            পেমেন্ট: {s.payment_method}
          </div>
        )}

        {/* End Date (for active) */}
        {type === 'active' && s.end_date && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="font-bengali">
              <span>শেষ: {formatBDDate(s.end_date)}</span>
              <span className="text-muted-foreground text-xs ml-1">(রাত ১১:৫৯)</span>
            </div>
          </div>
        )}

        {/* Created Date (for all) */}
        {type === 'all' && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-bengali text-muted-foreground">
              {new Date(s.created_at).toLocaleDateString('bn-BD')}
            </span>
          </div>
        )}

        {/* Screenshot */}
        {s.payment_screenshot_url && (
          <div className="pt-1">
            <PaymentScreenshotViewer screenshotUrl={s.payment_screenshot_url} size="sm" />
          </div>
        )}

        {/* Actions */}
        {(type === 'pending' || type === 'active') && (
          <div className="flex gap-2 pt-2 border-t">
            {type === 'pending' && (
              <>
                <Button 
                  size="sm" 
                  className="flex-1 bg-green-500 hover:bg-green-600"
                  onClick={() => onApprove?.(s.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  অনুমোদন
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  className="flex-1"
                  onClick={() => onReject?.(s.id)}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  প্রত্যাখ্যান
                </Button>
              </>
            )}
            {type === 'active' && (
              <>
                {s.is_paused ? (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => onResume?.(s.id)}
                  >
                    <Play className="h-4 w-4 mr-1 text-green-600" />
                    রিজিউম
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex-1"
                    onClick={() => onPause?.(s.id)}
                  >
                    <Pause className="h-4 w-4 mr-1 text-orange-600" />
                    পজ
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="outline"
                  className="flex-1"
                  onClick={() => onUpgrade?.(s)}
                >
                  <ArrowUpCircle className="h-4 w-4 mr-1 text-blue-600" />
                  আপগ্রেড
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
