import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, Monitor, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { bn } from 'date-fns/locale';

interface Activity {
  id: string;
  type: 'login_attempt' | 'session_created' | 'session_approved';
  attempt_type?: string;
  mobile_number?: string;
  country?: string;
  city?: string;
  ip_address?: string;
  reason?: string;
  device_name?: string;
  created_at: string;
}

interface LiveActivityFeedProps {
  activities: Activity[];
}

export const LiveActivityFeed = ({ activities }: LiveActivityFeedProps) => {
  const getActivityIcon = (activity: Activity) => {
    if (activity.type === 'login_attempt') {
      if (activity.attempt_type === 'success') {
        return <CheckCircle className="h-4 w-4 text-success" />;
      } else if (activity.attempt_type === 'blocked') {
        return <XCircle className="h-4 w-4 text-destructive" />;
      } else if (activity.attempt_type === 'suspicious') {
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      }
    } else if (activity.type === 'session_created') {
      return <Clock className="h-4 w-4 text-warning" />;
    } else if (activity.type === 'session_approved') {
      return <CheckCircle className="h-4 w-4 text-success" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  const getActivityText = (activity: Activity) => {
    if (activity.type === 'login_attempt') {
      const status = activity.attempt_type === 'success' ? 'সফল' :
                     activity.attempt_type === 'blocked' ? 'ব্লক' : 'সন্দেহজনক';
      return `${status} লগইন প্রচেষ্টা: ${activity.mobile_number || 'N/A'}`;
    } else if (activity.type === 'session_created') {
      return `নতুন ডিভাইস সেশন: ${activity.device_name || 'Unknown Device'}`;
    } else if (activity.type === 'session_approved') {
      return `সেশন অনুমোদিত: ${activity.device_name || 'Unknown Device'}`;
    }
    return 'Unknown Activity';
  };

  const getActivityBadge = (activity: Activity) => {
    if (activity.type === 'login_attempt') {
      if (activity.attempt_type === 'success') {
        return <Badge variant="default" className="text-xs">সফল</Badge>;
      } else if (activity.attempt_type === 'blocked') {
        return <Badge variant="destructive" className="text-xs">ব্লক</Badge>;
      } else if (activity.attempt_type === 'suspicious') {
        return <Badge variant="secondary" className="text-xs">সন্দেহজনক</Badge>;
      }
    } else if (activity.type === 'session_created') {
      return <Badge variant="secondary" className="text-xs">পেন্ডিং</Badge>;
    } else if (activity.type === 'session_approved') {
      return <Badge variant="default" className="text-xs">অনুমোদিত</Badge>;
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          লাইভ অ্যাক্টিভিটি ফিড
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {activities.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              কোন সাম্প্রতিক অ্যাক্টিভিটি নেই
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="mt-1">
                    {getActivityIcon(activity)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-none">
                        {getActivityText(activity)}
                      </p>
                      {getActivityBadge(activity)}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {activity.country && activity.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {activity.city}, {activity.country}
                        </span>
                      )}
                      {activity.ip_address && (
                        <span className="font-mono">{activity.ip_address}</span>
                      )}
                      <span className="ml-auto">
                        {formatDistanceToNow(new Date(activity.created_at), { 
                          addSuffix: true,
                          locale: bn 
                        })}
                      </span>
                    </div>
                    {activity.reason && (
                      <p className="text-xs text-muted-foreground pt-1">
                        কারণ: {activity.reason}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
