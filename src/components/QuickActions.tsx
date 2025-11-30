import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FolderOpen, 
  Key, 
  CreditCard, 
  HeadphonesIcon, 
  RefreshCw,
  Tv,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickActionsProps {
  userType: 'mobile' | 'business';
  hasActiveSubscription: boolean;
  onRefresh?: () => void;
}

const QuickActions = ({ userType, hasActiveSubscription, onRefresh }: QuickActionsProps) => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: FolderOpen,
      label: 'ড্রাইভ',
      description: 'ফাইল দেখুন',
      onClick: () => navigate('/drive-access'),
      color: 'hsl(var(--info))',
      bgColor: 'hsl(var(--info)/0.1)',
      disabled: !hasActiveSubscription,
    },
    {
      icon: Tv,
      label: 'টিভি',
      description: 'টিভি দেখুন',
      onClick: () => navigate('/tv-access'),
      color: 'hsl(var(--accent))',
      bgColor: 'hsl(var(--accent)/0.1)',
      disabled: !hasActiveSubscription,
    },
    {
      icon: CreditCard,
      label: 'প্ল্যান',
      description: 'সাবস্ক্রিপশন',
      onClick: () => navigate('/plans'),
      color: 'hsl(var(--primary))',
      bgColor: 'hsl(var(--primary)/0.1)',
      disabled: false,
    },
    {
      icon: HeadphonesIcon,
      label: 'সাপোর্ট',
      description: 'সাহায্য নিন',
      onClick: () => navigate('/support'),
      color: 'hsl(var(--secondary))',
      bgColor: 'hsl(var(--secondary)/0.1)',
      disabled: false,
    },
  ];

  // Add password action for business users
  if (userType === 'business') {
    actions.splice(2, 0, {
      icon: Key,
      label: 'পাসওয়ার্ড',
      description: 'জিপ পাসওয়ার্ড',
      onClick: () => {
        const el = document.getElementById('zip-passwords');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      },
      color: 'hsl(var(--warning))',
      bgColor: 'hsl(var(--warning)/0.1)',
      disabled: !hasActiveSubscription,
    });
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bengali text-muted-foreground">
            দ্রুত অ্যাক্সেস
          </CardTitle>
          {onRefresh && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onRefresh}
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-2">
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={action.onClick}
                disabled={action.disabled}
                className={`
                  flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl
                  transition-all duration-200 hover:scale-105
                  ${action.disabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:shadow-md active:scale-95'
                  }
                `}
                style={{ backgroundColor: action.disabled ? 'hsl(var(--muted))' : action.bgColor }}
              >
                <Icon 
                  className="h-5 w-5 sm:h-6 sm:w-6" 
                  style={{ color: action.disabled ? 'hsl(var(--muted-foreground))' : action.color }} 
                />
                <span 
                  className="text-[10px] sm:text-xs font-bengali font-medium truncate w-full text-center"
                  style={{ color: action.disabled ? 'hsl(var(--muted-foreground))' : action.color }}
                >
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
