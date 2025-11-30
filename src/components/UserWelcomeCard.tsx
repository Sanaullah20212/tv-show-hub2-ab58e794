import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Briefcase, Crown, AlertTriangle, Pause, Clock } from 'lucide-react';
import { formatDateBengali } from '@/lib/utils';

interface UserWelcomeCardProps {
  displayName?: string | null;
  mobileNumber?: string | null;
  userType: 'mobile' | 'business';
  subscription?: any;
  hasActiveSubscription: boolean;
  hasPendingSubscription: boolean;
}

const UserWelcomeCard = ({ 
  displayName, 
  mobileNumber, 
  userType, 
  subscription,
  hasActiveSubscription,
  hasPendingSubscription
}: UserWelcomeCardProps) => {
  const isPaused = subscription?.is_paused;
  const pausedDaysRemaining = subscription?.paused_days_remaining;

  const getUserTypeLabel = () => {
    if (userType === 'mobile') return 'মোবাইল ইউজার';
    return 'বিজনেস ইউজার';
  };

  const getUserTypeIcon = () => {
    if (userType === 'mobile') return <Smartphone className="h-3.5 w-3.5" />;
    return <Briefcase className="h-3.5 w-3.5" />;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'সুপ্রভাত';
    if (hour < 17) return 'শুভ দুপুর';
    if (hour < 20) return 'শুভ সন্ধ্যা';
    return 'শুভ রাত্রি';
  };

  return (
    <Card className="overflow-hidden border-none shadow-none bg-transparent">
      <CardContent className="p-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-bengali mb-0.5">
              {getGreeting()} 👋
            </p>
            <h2 className="text-lg sm:text-xl font-bold font-bengali truncate">
              {displayName || mobileNumber || 'ব্যবহারকারী'}
            </h2>
          </div>
          
          <div className="flex flex-col items-end gap-1.5">
            {/* User Type Badge */}
            <Badge 
              variant="outline" 
              className="text-xs font-bengali gap-1 shrink-0"
              style={{
                borderColor: userType === 'business' 
                  ? 'hsl(var(--tier-business))' 
                  : 'hsl(var(--tier-basic))',
                color: userType === 'business' 
                  ? 'hsl(var(--tier-business))' 
                  : 'hsl(var(--tier-basic))',
                backgroundColor: userType === 'business' 
                  ? 'hsl(var(--tier-business)/0.1)' 
                  : 'hsl(var(--tier-basic)/0.1)',
              }}
            >
              {getUserTypeIcon()}
              {getUserTypeLabel()}
            </Badge>

            {/* Subscription Status Badges */}
            {hasActiveSubscription && !isPaused && (
              <Badge 
                className="text-xs font-bengali gap-1"
                style={{
                  backgroundColor: 'hsl(var(--success)/0.15)',
                  color: 'hsl(var(--success))',
                  border: '1px solid hsl(var(--success)/0.3)',
                }}
              >
                <Crown className="h-3 w-3" />
                প্রিমিয়াম
              </Badge>
            )}

            {isPaused && (
              <Badge 
                className="text-xs font-bengali gap-1"
                style={{
                  backgroundColor: 'hsl(var(--warning)/0.15)',
                  color: 'hsl(var(--warning))',
                  border: '1px solid hsl(var(--warning)/0.3)',
                }}
              >
                <Pause className="h-3 w-3" />
                বিরতি ({pausedDaysRemaining} দিন বাকি)
              </Badge>
            )}

            {hasPendingSubscription && (
              <Badge 
                className="text-xs font-bengali gap-1"
                style={{
                  backgroundColor: 'hsl(var(--warning)/0.15)',
                  color: 'hsl(var(--warning))',
                  border: '1px solid hsl(var(--warning)/0.3)',
                }}
              >
                <Clock className="h-3 w-3" />
                অপেক্ষারত
              </Badge>
            )}

            {!hasActiveSubscription && !hasPendingSubscription && !isPaused && (
              <Badge 
                className="text-xs font-bengali gap-1"
                style={{
                  backgroundColor: 'hsl(var(--destructive)/0.15)',
                  color: 'hsl(var(--destructive))',
                  border: '1px solid hsl(var(--destructive)/0.3)',
                }}
              >
                <AlertTriangle className="h-3 w-3" />
                নিষ্ক্রিয়
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserWelcomeCard;
