import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, XCircle, MapPin, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { bn } from 'date-fns/locale';

interface SecurityAlert {
  id: string;
  type: 'blocked' | 'suspicious';
  mobile_number?: string;
  country?: string;
  city?: string;
  ip_address?: string;
  reason?: string;
  created_at: string;
}

interface SecurityAlertsProps {
  alerts: SecurityAlert[];
  onViewDetails: (alertId: string) => void;
}

export const SecurityAlerts = ({ alerts, onViewDetails }: SecurityAlertsProps) => {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-success" />
            নিরাপত্তা সতর্কতা
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-success" />
            <p className="font-medium">কোন নিরাপত্তা সমস্যা নেই</p>
            <p className="text-sm mt-1">সব লগইন অ্যাক্টিভিটি স্বাভাবিক</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-destructive/50">
      <CardHeader className="bg-destructive/10">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          নিরাপত্তা সতর্কতা
          <Badge variant="destructive" className="ml-auto">{alerts.length} নতুন</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div 
              key={alert.id}
              className="flex items-start gap-3 p-4 rounded-lg border border-destructive/30 bg-destructive/5"
            >
              <div className="mt-1">
                {alert.type === 'blocked' ? (
                  <XCircle className="h-5 w-5 text-destructive" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-warning" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm">
                      {alert.type === 'blocked' ? 'ব্লক করা লগইন' : 'সন্দেহজনক লগইন'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {alert.mobile_number || 'অজানা ব্যবহারকারী'}
                    </p>
                  </div>
                  <Badge 
                    variant={alert.type === 'blocked' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {alert.type === 'blocked' ? 'ব্লক' : 'সন্দেহজনক'}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  {alert.country && alert.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {alert.city}, {alert.country}
                    </span>
                  )}
                  {alert.ip_address && (
                    <span className="font-mono bg-background px-2 py-0.5 rounded">
                      {alert.ip_address}
                    </span>
                  )}
                  <span className="ml-auto">
                    {formatDistanceToNow(new Date(alert.created_at), { 
                      addSuffix: true,
                      locale: bn 
                    })}
                  </span>
                </div>

                {alert.reason && (
                  <p className="text-xs text-muted-foreground bg-background p-2 rounded">
                    <strong>কারণ:</strong> {alert.reason}
                  </p>
                )}

                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onViewDetails(alert.id)}
                  className="w-full mt-2"
                >
                  <ExternalLink className="h-3 w-3 mr-2" />
                  বিস্তারিত দেখুন
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
