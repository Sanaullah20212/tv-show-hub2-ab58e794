import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Download, LogIn, CheckCircle, XCircle } from 'lucide-react';
import { formatDateBengali } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface Activity {
  id: string;
  action: string;
  description: string;
  metadata: any;
  created_at: string;
}

export function ActivityTimeline({ userId }: { userId: string }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [userId]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

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
        return <LogIn className="h-4 w-4" />;
      case 'download':
        return <Download className="h-4 w-4" />;
      case 'subscription_created':
      case 'subscription_approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'subscription_rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'login':
        return 'bg-blue-500/10 text-blue-500';
      case 'download':
        return 'bg-purple-500/10 text-purple-500';
      case 'subscription_created':
      case 'subscription_approved':
        return 'bg-green-500/10 text-green-500';
      case 'subscription_rejected':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  if (loading) {
    return (
      <Card className="card-hover animate-fade-in">
        <CardHeader>
          <CardTitle className="font-bengali">অ্যাক্টিভিটি টাইমলাইন</CardTitle>
          <CardDescription className="font-bengali">
            আপনার সাম্প্রতিক কার্যক্রম
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-hover animate-fade-in">
      <CardHeader>
        <CardTitle className="font-bengali flex items-center gap-2">
          <Clock className="h-5 w-5" />
          অ্যাক্টিভিটি টাইমলাইন
        </CardTitle>
        <CardDescription className="font-bengali">
          আপনার সাম্প্রতিক {activities.length}টি কার্যক্রম
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground font-bengali">
            <Clock className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>কোনো অ্যাক্টিভিটি নেই</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-border" />
            
            {/* Activities */}
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={activity.id} className="relative pl-10 animate-fade-in hover-scale" style={{ animationDelay: `${index * 0.05}s` }}>
                  {/* Icon */}
                  <div
                    className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${getActionColor(
                      activity.action
                    )} border-2 border-background z-10`}
                  >
                    {getActionIcon(activity.action)}
                  </div>

                  {/* Content */}
                  <div className="bg-muted/30 rounded-lg p-3 hover:bg-muted/50 transition-colors">
                    <p className="font-medium text-sm font-bengali">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDateBengali(new Date(activity.created_at))}
                    </p>
                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {activity.metadata.file_name && (
                          <span className="font-bengali">
                            📄 {activity.metadata.file_name}
                          </span>
                        )}
                        {activity.metadata.plan_months && (
                          <span className="font-bengali">
                            💎 {activity.metadata.plan_months} মাস
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
