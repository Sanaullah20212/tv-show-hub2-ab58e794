import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, ArrowLeft, History, CreditCard } from 'lucide-react';
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
        {/* Tab Buttons - Centered */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant={!showHistory ? "default" : "outline"}
            onClick={() => navigate('/plans')}
            className="font-bengali gap-2 px-6"
            size="sm"
          >
            <CreditCard className="h-4 w-4" />
            প্ল্যান
          </Button>
          <Button
            variant={showHistory ? "default" : "outline"}
            onClick={() => navigate('/plans#history')}
            className="font-bengali gap-2 px-6"
            size="sm"
          >
            <History className="h-4 w-4" />
            হিস্টরি
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
