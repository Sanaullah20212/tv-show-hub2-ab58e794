import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SocialLinks {
  whatsapp: string;
  facebook: string;
}

interface Settings {
  recaptcha_enabled: boolean;
  registration_enabled: boolean;
  social_links: SocialLinks;
}

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>({
    recaptcha_enabled: true,
    registration_enabled: true,
    social_links: { whatsapp: '', facebook: '' },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['recaptcha_enabled', 'registration_enabled', 'social_links']);

      if (error) throw error;

      const newSettings = { ...settings };
      data?.forEach((item) => {
        if (item.key === 'recaptcha_enabled') {
          const value = item.value as { enabled: boolean };
          newSettings.recaptcha_enabled = value.enabled;
        } else if (item.key === 'registration_enabled') {
          const value = item.value as { enabled: boolean };
          newSettings.registration_enabled = value.enabled;
        } else if (item.key === 'social_links') {
          const value = item.value as unknown as SocialLinks;
          newSettings.social_links = value;
        }
      });
      setSettings(newSettings);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading, refetch: fetchSettings };
};
