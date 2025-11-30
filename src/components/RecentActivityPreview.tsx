import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  FolderOpen, 
  CreditCard, 
  LogIn, 
  Download,
  ChevronRight,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { bn } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

interface RecentActivityPreviewProps {
  userId: string;
}

interface Activity {
  id: string;
  action: string;
  description: string;
  created_at: string;
}

const RecentActivityPreview = ({ userId }: RecentActivityPreviewProps) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivities();
  }, [userId]);

  const fetchRecentActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('id, action, description, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login':
        return <LogIn className="h-3.5 w-3.5" />;
      case 'file_download':
      case 'download':
        return <Download className="h-3.5 w-3.5" />;
      case 'file_access':
        return <FolderOpen className="h-3.5 w-3.5" />;
      case 'subscription':
        return <CreditCard className="h-3.5 w-3.5" />;
      default:
        return <Activity className="h-3.5 w-3.5" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'login':
        return 'hsl(var(--success))';
      case 'file_download':
      case 'download':
        return 'hsl(var(--info))';
      case 'file_access':
        return 'hsl(var(--primary))';
      case 'subscription':
        return 'hsl(var(--secondary))';
      default:
        return 'hsl(var(--muted-foreground))';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-bengali text-muted-foreground">
            সাম্প্রতিক কার্যকলাপ
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-2 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2 w-16" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-xs text-muted-foreground font-bengali">
            কোন সাম্প্রতিক কার্যকলাপ নেই
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bengali text-muted-foreground flex items-center gap-2">
            <Activity className="h-4 w-4" />
            সাম্প্রতিক কার্যকলাপ
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-2">
        <div className="space-y-2">
          {activities.map((activity) => (
            <div 
              key={activity.id} 
              className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div 
                className="p-1.5 rounded-lg shrink-0"
                style={{ 
                  backgroundColor: `${getActionColor(activity.action)}15`,
                }}
              >
                <span style={{ color: getActionColor(activity.action) }}>
                  {getActionIcon(activity.action)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bengali truncate">
                  {activity.description}
                </p>
                <p className="text-[10px] text-muted-foreground font-bengali">
                  {formatDistanceToNow(new Date(activity.created_at), { 
                    addSuffix: true,
                    locale: bn
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivityPreview;
