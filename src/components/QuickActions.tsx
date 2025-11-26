import { Button } from '@/components/ui/button';
import { HeadphonesIcon, RefreshCcw } from 'lucide-react';
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
      onClick: () => navigate('/plans'),
      color: 'hsl(var(--primary))',
    },
    {
      icon: HeadphonesIcon,
      title: 'সাপোর্ট',
      onClick: () => navigate('/support'),
      color: 'hsl(var(--success))',
    },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {actions.map((action, index) => (
        <Button
          key={index}
          onClick={action.onClick}
          variant="outline"
          size="sm"
          className="font-bengali hover:scale-105 transition-all"
          style={{
            borderColor: `${action.color}50`,
          }}
        >
          <action.icon className="h-4 w-4 mr-2" style={{ color: action.color }} />
          {action.title}
        </Button>
      ))}
    </div>
  );
};
