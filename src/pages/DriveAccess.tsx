import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DriveExplorer from '@/components/DriveExplorer';

const DriveAccess = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    checkSubscription();
  }, [user, navigate]);

  const checkSubscription = async () => {
    try {
      const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .gt('end_date', new Date().toISOString());

      if (error) {
        console.error('Subscription check error:', error);
      }

      setHasAccess(subscriptions && subscriptions.length > 0);
    } catch (err) {
      console.error('Error checking subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-3 sm:p-4">
        <div className="text-center max-w-md px-4">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <span className="text-4xl sm:text-5xl">🔐</span>
            </div>
            <p className="text-base sm:text-lg font-bengali mb-2 font-semibold">
              ড্রাইভ দেখতে সক্রিয় সাবস্ক্রিপশন প্রয়োজন
            </p>
            <p className="text-sm text-muted-foreground font-bengali">
              প্রিমিয়াম ফাইল অ্যাক্সেস করতে একটি সাবস্ক্রিপশন প্ল্যান নিন
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
            <Button
              onClick={() => navigate('/plans')}
              className="font-bengali w-full sm:w-auto"
            >
              প্ল্যান দেখুন
            </Button>
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="font-bengali w-full sm:w-auto gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              ড্যাশবোর্ডে ফিরে যান
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-Friendly Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur-xl">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="ghost"
              size="sm"
              className="gap-2 font-bengali"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">ড্যাশবোর্ডে ফিরে যান</span>
              <span className="sm:hidden">ফিরে যান</span>
            </Button>
            <h1 className="text-lg sm:text-xl font-bold font-bengali">ড্রাইভ অ্যাক্সেস</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <DriveExplorer userType={profile?.user_type || 'mobile'} />
      </div>
    </div>
  );
};

export default DriveAccess;
