import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const TvAccess = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [proxyUrl, setProxyUrl] = useState<string>('');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    checkSubscriptionAndSetupProxy();
  }, [user, navigate]);

  const checkSubscriptionAndSetupProxy = async () => {
    try {
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .gt('end_date', new Date().toISOString())
        .maybeSingle();

      if (subError) {
        console.error('Subscription error:', subError);
        setError('সাবস্ক্রিপশন চেক করতে সমস্যা হয়েছে');
        setIsLoading(false);
        return;
      }

      if (!subscription) {
        setError('টিভি দেখতে সক্রিয় সাবস্ক্রিপশন প্রয়োজন');
        setHasAccess(false);
      } else {
        setHasAccess(true);
        // Create proxy URL with userId for server-side verification
        const url = `https://khazxwlqjhynjkimqxzy.supabase.co/functions/v1/tv-proxy?path=/0:/&userId=${user?.id}`;
        setProxyUrl(url);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error checking subscription:', err);
      setError('সমস্যা হয়েছে');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error || !hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <p className="text-destructive mb-6 text-lg">{error || 'অ্যাক্সেস নেই'}</p>
          <Button
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            ড্যাশবোর্ডে ফিরে যান
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-background">
      <div className="absolute top-4 left-4 z-10">
        <Button
          onClick={() => navigate('/dashboard')}
          variant="secondary"
          size="sm"
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          ফিরে যান
        </Button>
      </div>
      
      {proxyUrl && (
        <iframe
          src={proxyUrl}
          className="w-full h-full border-0"
          title="TV Access"
          allow="fullscreen"
        />
      )}
    </div>
  );
};

export default TvAccess;
