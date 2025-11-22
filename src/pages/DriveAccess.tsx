import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <p className="text-lg mb-4">🔐 ড্রাইভ দেখতে সক্রিয় সাবস্ক্রিপশন প্রয়োজন</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-primary underline"
          >
            ড্যাশবোর্ডে ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
          >
            ← ড্যাশবোর্ডে ফিরে যান
          </Button>
        </div>
        <DriveExplorer userType={profile?.user_type || 'mobile'} />
      </div>
    </div>
  );
};

export default DriveAccess;
