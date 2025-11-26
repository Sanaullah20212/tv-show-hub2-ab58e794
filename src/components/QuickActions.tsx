import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, HeadphonesIcon, History, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickActionsProps {
  hasActiveSubscription: boolean;
}

export const QuickActions = ({ hasActiveSubscription }: QuickActionsProps) => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: RefreshCcw,
      title: 'প্ল্যান নবায়ন',
      description: 'নতুন সাবস্ক্রিপশন',
      onClick: () => navigate('/plans'),
      color: 'hsl(var(--primary))',
      bgColor: 'hsl(var(--primary)/0.1)',
    },
    {
      icon: History,
      title: 'পেমেন্ট হিস্টরি',
      description: 'লেনদেনের ইতিহাস',
      onClick: () => navigate('/settings'),
      color: 'hsl(var(--info))',
      bgColor: 'hsl(var(--info)/0.1)',
    },
    {
      icon: HeadphonesIcon,
      title: 'সাপোর্ট',
      description: 'সাহায্য পান',
      onClick: () => navigate('/support'),
      color: 'hsl(var(--success))',
      bgColor: 'hsl(var(--success)/0.1)',
    },
    {
      icon: CreditCard,
      title: 'সাবস্ক্রিপশন',
      description: 'প্ল্যান দেখুন',
      onClick: () => navigate('/plans'),
      color: 'hsl(var(--secondary))',
      bgColor: 'hsl(var(--secondary)/0.1)',
    },
  ];

  return (
    <Card className="overflow-hidden relative group hover:shadow-xl transition-all duration-300">
      <div 
        className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--primary)/0.05) 0%, hsl(var(--secondary)/0.05) 100%)'
        }}
      />
      <CardHeader className="relative z-10">
        <CardTitle className="text-xl font-bengali flex items-center gap-2">
          ⚡ দ্রুত অ্যাক্সেস
        </CardTitle>
        <CardDescription className="font-bengali">
          সাধারণ কাজগুলোর শর্টকাট
        </CardDescription>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              variant="outline"
              className="h-auto p-4 sm:p-6 flex flex-col items-center gap-3 hover:scale-105 transition-all duration-300 border-2"
              style={{
                borderColor: `${action.color}30`,
                backgroundColor: action.bgColor,
              }}
            >
              <div 
                className="p-3 rounded-xl"
                style={{ 
                  backgroundColor: action.color,
                  boxShadow: `0 4px 16px ${action.color}40`
                }}
              >
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm font-bengali" style={{ color: action.color }}>
                  {action.title}
                </p>
                <p className="text-xs text-muted-foreground font-bengali mt-1">
                  {action.description}
                </p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
