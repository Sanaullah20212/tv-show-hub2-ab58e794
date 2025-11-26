import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, Smartphone, Archive, Shield, LogOut, FileArchive, Key, Home, Settings, User, AlertCircle, RefreshCcw, HeadphonesIcon, MessageCircle, Facebook } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useSubscriptionNotifications } from '@/hooks/useSubscriptionNotifications';
import { ThemeToggle } from '@/components/ThemeToggle';
import { StatisticsCards } from '@/components/StatisticsCards';
import { NotificationBell } from '@/components/NotificationBell';
import MobileBottomNav from '@/components/MobileBottomNav';
import ZipPasswords from '@/components/ZipPasswords';
import DriveFiles from '@/components/DriveFiles';
import { Progress } from '@/components/ui/progress';
import { formatDateBengali } from '@/lib/utils';

const Dashboard = () => {
  const { user, profile, loading, signOut } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<'drive' | null>(null);
  const { toast } = useToast();
  
  // Initialize push notifications for this user
  usePushNotifications(user?.id);
  
  // Initialize subscription notifications for admin users
  useSubscriptionNotifications(profile?.role === 'admin');

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      setSubscriptionLoading(true);
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
        return;
      }

      setSubscription(data);
    } catch (error) {
      console.error('Error in fetchSubscription:', error);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Admin dashboard
  if (profile?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  const hasActiveSubscription = subscription && subscription.status === 'active' && new Date(subscription.end_date) > new Date();
  const hasPendingSubscription = subscription && subscription.status === 'pending';
  
  // Calculate subscription progress
  const daysRemaining = hasActiveSubscription 
    ? Math.ceil((new Date(subscription.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const totalDays = hasActiveSubscription
    ? Math.ceil((new Date(subscription.end_date).getTime() - new Date(subscription.start_date).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const progressPercentage = hasActiveSubscription ? ((totalDays - daysRemaining) / totalDays) * 100 : 0;
  const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Compact Header */}
      <header className="sticky top-0 z-50 border-b bg-card/90 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div 
                className="p-1.5 sm:p-2 rounded-lg"
                style={{ 
                  background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)',
                }}
              >
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold font-bengali" style={{ color: 'hsl(var(--primary))' }}>
                  ড্যাশবোর্ড
                </h1>
                <p className="text-xs text-muted-foreground font-bengali hidden sm:block">
                  {profile?.mobile_number}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <NotificationBell userId={user.id} />
              <ThemeToggle />
              <Button 
                onClick={() => navigate('/settings')} 
                variant="outline" 
                size="sm" 
                className="font-bengali"
              >
                <User className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">সেটিংস</span>
              </Button>
              <Button 
                onClick={() => navigate('/')} 
                variant="outline" 
                size="sm" 
                className="font-bengali hidden sm:flex"
              >
                <Home className="h-4 w-4 mr-1.5" />
                হোম
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-5 max-w-7xl">
        {/* Compact Subscription Status Card matching screenshot */}
        <Card className="overflow-hidden relative hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4 sm:p-6">
            {subscriptionLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-5 bg-muted/50 rounded w-32"></div>
                    <div className="h-4 bg-muted/50 rounded w-48"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-9 w-24 bg-muted/50 rounded"></div>
                    <div className="h-9 w-24 bg-muted/50 rounded"></div>
                  </div>
                </div>
                <div className="h-2 bg-muted/50 rounded-full"></div>
                <div className="flex justify-between">
                  <div className="h-3 bg-muted/50 rounded w-24"></div>
                  <div className="h-3 bg-muted/50 rounded w-24"></div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2.5 rounded-lg"
                      style={{ 
                        background: hasActiveSubscription 
                          ? 'linear-gradient(135deg, hsl(var(--success)) 0%, hsl(var(--info)) 100%)'
                          : 'hsl(var(--muted))',
                      }}
                    >
                      <CalendarDays className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold font-bengali">সাবস্ক্রিপশন</h3>
                        {hasActiveSubscription ? (
                          <Badge 
                            className="px-2 py-0.5 text-xs font-bengali"
                            style={{ 
                              backgroundColor: 'hsl(var(--success)/0.15)',
                              color: 'hsl(var(--success))',
                              border: '1px solid hsl(var(--success)/0.3)',
                            }}
                          >
                            সক্রিয়
                          </Badge>
                        ) : hasPendingSubscription ? (
                          <Badge 
                            className="px-2 py-0.5 text-xs font-bengali"
                            style={{ 
                              backgroundColor: 'hsl(var(--warning)/0.15)',
                              color: 'hsl(var(--warning))',
                              border: '1px solid hsl(var(--warning)/0.3)'
                            }}
                          >
                            অপেক্ষারত
                          </Badge>
                        ) : (
                          <Badge 
                            className="px-2 py-0.5 text-xs font-bengali"
                            style={{ 
                              backgroundColor: 'hsl(var(--destructive)/0.15)',
                              color: 'hsl(var(--destructive))',
                              border: '1px solid hsl(var(--destructive)/0.3)'
                            }}
                          >
                            মেয়াদ শেষ
                          </Badge>
                        )}
                      </div>
                      {hasActiveSubscription && (
                        <p className="text-sm text-muted-foreground font-bengali mt-0.5">
                          {subscription.plan_months} মাস • {daysRemaining} দিন বাকি
                          {isExpiringSoon && <span className="text-warning ml-2">⚠️</span>}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button 
                      onClick={() => navigate('/plans')}
                      size="sm"
                      variant="outline"
                      className="font-bengali"
                    >
                      <RefreshCcw className="h-4 w-4 mr-1.5" />
                      প্ল্যান নবায়ন
                    </Button>
                    <Button 
                      onClick={() => {
                        const supportSection = document.getElementById('support-links');
                        if (supportSection) {
                          supportSection.classList.toggle('hidden');
                        }
                      }}
                      size="sm"
                      variant="outline"
                      className="font-bengali"
                    >
                      <HeadphonesIcon className="h-4 w-4 mr-1.5" />
                      সাপোর্ট
                    </Button>
                    <Button 
                      onClick={() => navigate('/plans')}
                      size="sm"
                      className="font-bengali"
                      style={{
                        background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)',
                        color: 'white'
                      }}
                    >
                      প্ল্যান দেখুন
                    </Button>
                  </div>
                </div>
                
                {/* Support Links (hidden by default) */}
                <div id="support-links" className="hidden mb-4 p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-sm font-bengali font-semibold mb-2 text-muted-foreground">যোগাযোগ করুন:</p>
                  <div className="flex gap-2 flex-wrap">
                    {settings?.social_links?.whatsapp && (
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="font-bengali"
                      >
                        <a
                          href={settings.social_links.whatsapp}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <MessageCircle className="h-4 w-4" />
                          WhatsApp
                        </a>
                      </Button>
                    )}
                    {settings?.social_links?.facebook && (
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="font-bengali"
                      >
                        <a
                          href={settings.social_links.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <Facebook className="h-4 w-4" />
                          Facebook
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Progress Bar */}
                {hasActiveSubscription && (
                  <div className="space-y-2">
                    <Progress 
                      value={progressPercentage} 
                      className="h-2.5"
                      style={{
                        '--progress-color': isExpiringSoon 
                          ? 'linear-gradient(90deg, hsl(var(--warning)) 0%, hsl(var(--destructive)) 100%)'
                          : 'linear-gradient(90deg, hsl(var(--success)) 0%, hsl(var(--info)) 100%)'
                      } as React.CSSProperties}
                    />
                    <div className="flex justify-between text-xs font-bengali text-muted-foreground">
                      <span>{formatDateBengali(subscription.start_date)}</span>
                      <span>{formatDateBengali(subscription.end_date)}</span>
                    </div>
                  </div>
                )}
                
                {/* No subscription message */}
                {!hasActiveSubscription && !hasPendingSubscription && (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground font-bengali mb-2">
                      কোন সক্রিয় সাবস্ক্রিপশন নেই
                    </p>
                    <p className="text-xs text-muted-foreground font-bengali">
                      একটি প্ল্যান নির্বাচন করুন
                    </p>
                  </div>
                )}
                
                {/* Pending subscription message */}
                {hasPendingSubscription && (
                  <div className="mt-3 p-3 rounded-lg bg-warning/10 border border-warning/30">
                    <p className="text-sm font-bengali text-warning flex items-center gap-2">
                      <span className="animate-spin">🔄</span>
                      আপনার {subscription.plan_months} মাসের সাবস্ক্রিপশন এডমিন অনুমোদনের অপেক্ষায় রয়েছে
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        {hasActiveSubscription && (
          <StatisticsCards 
            subscription={subscription}
            daysRemaining={daysRemaining}
            daysActive={Math.ceil((new Date().getTime() - new Date(subscription.start_date).getTime()) / (1000 * 60 * 60 * 24))}
            isLoading={subscriptionLoading}
          />
        )}

        {/* Service Access Cards - More Compact */}
        <div className="grid gap-4">
          {/* Mobile/Business Service Card */}
          {(profile?.user_type === 'mobile' || profile?.user_type === 'business') && hasActiveSubscription && (
            <Card className="overflow-hidden relative hover:shadow-md transition-all duration-300">
              <div 
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{ backgroundColor: 'hsl(var(--tier-basic))' }}
              />
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-lg text-white"
                    style={{ backgroundColor: 'hsl(var(--tier-basic))' }}
                  >
                    {profile?.user_type === 'mobile' ? (
                      <Smartphone className="h-5 w-5" />
                    ) : (
                      <Archive className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-base font-bengali">
                      {profile?.user_type === 'mobile' ? '📱 মোবাইল সার্ভিস' : '💼 বিজনেস সার্ভিস'}
                    </CardTitle>
                    <CardDescription className="text-sm font-bengali">
                      {profile?.user_type === 'mobile' 
                        ? 'ড্রাইভ ফাইল দেখুন' 
                        : 'ড্রাইভ ফাইল ও পাসওয়ার্ড'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {profile?.user_type === 'mobile' ? (
                  <DriveFiles 
                    userType="mobile" 
                    hasActiveSubscription={hasActiveSubscription} 
                  />
                ) : (
                  <div className="space-y-3">
                    <DriveFiles 
                      userType="business" 
                      hasActiveSubscription={hasActiveSubscription} 
                    />
                    <Separator />
                    <ZipPasswords />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* No subscription message */}
          {!hasActiveSubscription && (
            <Card className="overflow-hidden relative">
              <CardContent className="text-center p-6">
                <Shield className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground font-bengali font-medium mb-3">
                  সার্ভিস ব্যবহার করতে সক্রিয় সাবস্ক্রিপশন প্রয়োজন
                </p>
                <Button 
                  onClick={() => navigate('/plans')}
                  size="sm"
                  className="font-bengali"
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)',
                    color: 'white'
                  }}
                >
                  প্ল্যান দেখুন
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default Dashboard;