import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Save } from 'lucide-react';

interface SettingsData {
  recaptcha_enabled: boolean;
  registration_enabled: boolean;
  whatsapp: string;
  facebook: string;
}

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    recaptcha_enabled: true,
    registration_enabled: true,
    whatsapp: '',
    facebook: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
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
          const value = item.value as { whatsapp: string; facebook: string };
          newSettings.whatsapp = value.whatsapp || '';
          newSettings.facebook = value.facebook || '';
        }
      });
      setSettings(newSettings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('সেটিংস লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Update recaptcha setting
      const { error: recaptchaError } = await supabase
        .from('settings')
        .update({ value: { enabled: settings.recaptcha_enabled } })
        .eq('key', 'recaptcha_enabled');

      if (recaptchaError) throw recaptchaError;

      // Update registration setting
      const { error: registrationError } = await supabase
        .from('settings')
        .update({ value: { enabled: settings.registration_enabled } })
        .eq('key', 'registration_enabled');

      if (registrationError) throw registrationError;

      // Update social links
      const { error: socialError } = await supabase
        .from('settings')
        .update({
          value: {
            whatsapp: settings.whatsapp,
            facebook: settings.facebook,
          },
        })
        .eq('key', 'social_links');

      if (socialError) throw socialError;

      toast.success('সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('সেটিংস সংরক্ষণ করতে সমস্যা হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">সেটিংস</h1>
        <p className="text-muted-foreground">অ্যাপ্লিকেশন কনফিগারেশন পরিচালনা করুন</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>নিরাপত্তা সেটিংস</CardTitle>
            <CardDescription>রোবট যাচাই এবং রেজিস্ট্রেশন নিয়ন্ত্রণ করুন</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>রোবট যাচাই (reCAPTCHA)</Label>
                <p className="text-sm text-muted-foreground">
                  লগইন এবং রেজিস্ট্রেশনে reCAPTCHA সক্রিয় করুন
                </p>
              </div>
              <Switch
                checked={settings.recaptcha_enabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, recaptcha_enabled: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>নতুন রেজিস্ট্রেশন</Label>
                <p className="text-sm text-muted-foreground">নতুন ইউজার রেজিস্ট্রেশন অনুমতি দিন</p>
              </div>
              <Switch
                checked={settings.registration_enabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, registration_enabled: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>সোশ্যাল মিডিয়া লিংক</CardTitle>
            <CardDescription>যোগাযোগের জন্য সোশ্যাল মিডিয়া লিংক যোগ করুন</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp লিংক</Label>
              <Input
                id="whatsapp"
                placeholder="https://wa.me/1234567890"
                value={settings.whatsapp}
                onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook পেজ লিংক</Label>
              <Input
                id="facebook"
                placeholder="https://facebook.com/yourpage"
                value={settings.facebook}
                onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                সংরক্ষণ হচ্ছে...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                সংরক্ষণ করুন
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
