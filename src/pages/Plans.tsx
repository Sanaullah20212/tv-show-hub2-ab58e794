import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Shield, LogOut, ArrowLeft, History, CreditCard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import SubscriptionPlans from '@/components/SubscriptionPlans';
import { PaymentHistory } from '@/components/PaymentHistory';

const Plans = () => {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [subscription, setSubscription] = useState<any>(null);
  
  // Check if we should show payment history based on hash
  const showHistory = location.hash === '#history';

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Compact Mobile-Friendly Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Button 
                onClick={() => navigate('/dashboard')} 
                variant="ghost" 
                size="sm"
                className="shrink-0"
              >
                <ArrowLeft className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">ফিরে যান</span>
              </Button>
              <div className="p-2 sm:p-2.5 rounded-lg" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)' }}>
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold font-bengali truncate" style={{ color: 'hsl(var(--primary))' }}>
                  সাবস্ক্রিপশন প্ল্যান
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground font-bengali hidden sm:block">
                  আপনার প্রয়োজন অনুযায়ী সেরা প্ল্যান বেছে নিন
                </p>
              </div>
            </div>
            <Button onClick={signOut} variant="outline" size="sm" className="shrink-0 self-end sm:self-auto">
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">লগআউট</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Mobile-Friendly Toggle Buttons */}
        <div className="flex items-center gap-2 p-1.5 bg-muted/50 rounded-lg w-full sm:w-auto sm:mx-auto">
          <Button
            variant={!showHistory ? "default" : "ghost"}
            onClick={() => navigate('/plans')}
            className="font-bengali gap-1.5 flex-1 sm:flex-initial text-sm"
            size="sm"
          >
            <CreditCard className="h-4 w-4" />
            <span>প্ল্যান</span>
          </Button>
          <Button
            variant={showHistory ? "default" : "ghost"}
            onClick={() => navigate('/plans#history')}
            className="font-bengali gap-1.5 flex-1 sm:flex-initial text-sm"
            size="sm"
          >
            <History className="h-4 w-4" />
            <span>হিস্টরি</span>
          </Button>
        </div>

        {/* Conditional Content */}
        {!showHistory ? (
          <SubscriptionPlans currentSubscription={subscription} onSubscriptionUpdate={fetchSubscription} />
        ) : (
          <PaymentHistory />
        )}
      </div>
    </div>
  );
};

export default Plans;
