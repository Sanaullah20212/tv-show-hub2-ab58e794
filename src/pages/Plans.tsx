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
      {/* Header with gradient */}
      <header className="border-b border-border bg-card/50 backdrop-blur card-gradient">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => navigate('/dashboard')} 
                variant="ghost" 
                size="sm"
                className="card-hover"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                ফিরে যান
              </Button>
              <div className="p-3 rounded-xl gradient-primary">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-bengali">
                  সাবস্ক্রিপশন প্ল্যান
                </h1>
                <p className="text-sm text-muted-foreground">আপনার প্রয়োজন অনুযায়ী সেরা প্ল্যান বেছে নিন</p>
              </div>
            </div>
            <Button onClick={signOut} variant="outline" size="sm" className="card-hover">
              <LogOut className="h-4 w-4 mr-2" />
              লগআউট
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Toggle Buttons */}
        <div className="flex items-center justify-center gap-4 p-2 bg-muted/50 rounded-xl w-fit mx-auto">
          <Button
            variant={!showHistory ? "default" : "ghost"}
            onClick={() => navigate('/plans')}
            className="font-bengali gap-2"
          >
            <CreditCard className="h-4 w-4" />
            প্ল্যান দেখুন
          </Button>
          <Button
            variant={showHistory ? "default" : "ghost"}
            onClick={() => navigate('/plans#history')}
            className="font-bengali gap-2"
          >
            <History className="h-4 w-4" />
            পেমেন্ট হিস্টরি
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
