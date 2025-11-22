import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSubscriptionNotifications = (isAdmin: boolean) => {
  const { toast } = useToast();

  useEffect(() => {
    if (!isAdmin) return;

    // Listen for new subscriptions in real-time
    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'subscriptions'
        },
        (payload) => {
          console.log('New subscription detected:', payload);
          
          // Only show notification for pending subscriptions (user requests)
          // Don't show notification when admin directly creates active subscriptions
          const newSubscription = payload.new as any;
          if (newSubscription.status !== 'pending') {
            return;
          }
          
          // Show notification to admin
          toast({
            title: '🎉 নতুন সাবস্ক্রিপশন!',
            description: 'একটি নতুন সাবস্ক্রিপশন রিকোয়েস্ট এসেছে। দয়া করে অনুমোদন করুন।',
            duration: 10000,
          });

          // Play notification sound (if supported)
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('নতুন সাবস্ক্রিপশন', {
              body: 'একটি নতুন সাবস্ক্রিপশন রিকোয়েস্ট এসেছে।',
              icon: '/favicon.ico',
              badge: '/favicon.ico',
            });
          }
        }
      )
      .subscribe();

    // Request browser notification permission for web
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, toast]);
};
