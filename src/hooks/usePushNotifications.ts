import { useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePushNotifications = (userId?: string) => {
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;

    // Request permission and register for push notifications
    const initPushNotifications = async () => {
      try {
        // Request permission
        const permission = await PushNotifications.requestPermissions();
        
        if (permission.receive === 'granted') {
          // Register with Apple / Google to receive push via APNS/FCM
          await PushNotifications.register();
        }
      } catch (error) {
        console.error('Error initializing push notifications:', error);
      }
    };

    // Listen for registration success
    PushNotifications.addListener('registration', async (token) => {
      console.log('Push registration success, token: ' + token.value);
      
      // Save the token to Supabase for this user
      try {
        const { error } = await supabase
          .from('push_tokens' as any)
          .upsert({ 
            user_id: userId, 
            token: token.value,
            updated_at: new Date().toISOString()
          });
        
        if (error) {
          console.error('Error saving push token:', error);
        }
      } catch (err) {
        console.error('Error saving push token:', err);
      }
    });

    // Listen for registration errors
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on registration: ' + JSON.stringify(error));
    });

    // Listen for push notifications
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received: ', notification);
      toast({
        title: notification.title || 'নতুন নোটিফিকেশন',
        description: notification.body || '',
      });
    });

    // Listen for notification actions (when user taps on notification)
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push notification action performed', notification);
    });

    // Initialize push notifications
    initPushNotifications();

    // Cleanup listeners on unmount
    return () => {
      PushNotifications.removeAllListeners();
    };
  }, [userId, toast]);
};
