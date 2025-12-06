import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, ArrowLeft, History, CreditCard, Info } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import SubscriptionPlans from '@/components/SubscriptionPlans';
import { PaymentHistory } from '@/components/PaymentHistory';
import SubscriptionDetails from '@/components/SubscriptionDetails';

const Plans = () => {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [subscription, setSubscription] = useState<any>(null);
  
  // Check hash for tab navigation
  const currentTab = location.hash === '#history' ? 'history' : 
                     location.hash === '#details' ? 'details' : 'plans';

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
      {/* Minimal Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button 
              onClick={() => navigate('/dashboard')} 
              variant="ghost" 
              size="sm"
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline font-bengali">ফিরে যান</span>
            </Button>
            <Button onClick={signOut} variant="ghost" size="sm" className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline font-bengali">লগআউট</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Tab Buttons - Responsive */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
          <Button
            variant={currentTab === 'plans' ? "default" : "outline"}
            onClick={() => navigate('/plans')}
            className="font-bengali gap-1 sm:gap-2 px-3 sm:px-6 text-xs sm:text-sm"
            size="sm"
          >
            <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
            প্ল্যান
          </Button>
          <Button
            variant={currentTab === 'details' ? "default" : "outline"}
            onClick={() => navigate('/plans#details')}
            className="font-bengali gap-1 sm:gap-2 px-3 sm:px-6 text-xs sm:text-sm"
            size="sm"
          >
            <Info className="h-3 w-3 sm:h-4 sm:w-4" />
            বিবরণ
          </Button>
          <Button
            variant={currentTab === 'history' ? "default" : "outline"}
            onClick={() => navigate('/plans#history')}
            className="font-bengali gap-1 sm:gap-2 px-3 sm:px-6 text-xs sm:text-sm"
            size="sm"
          >
            <History className="h-3 w-3 sm:h-4 sm:w-4" />
            হিস্টরি
          </Button>
        </div>

        {/* Conditional Content */}
        {currentTab === 'plans' && (
          <SubscriptionPlans currentSubscription={subscription} onSubscriptionUpdate={fetchSubscription} />
        )}
        {currentTab === 'details' && (
          <div className="max-w-2xl mx-auto">
            <SubscriptionDetails subscription={subscription} />
          </div>
        )}
        {currentTab === 'history' && (
          <PaymentHistory />
        )}
      </div>
    </div>
  );
};

export default Plans;
