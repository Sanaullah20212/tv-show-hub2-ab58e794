import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { PaymentMethodsManager } from '@/components/admin/PaymentMethodsManager';

interface SettingsData {
  recaptcha_enabled: boolean;
  registration_enabled: boolean;
  whatsapp: string;
  facebook: string;
  mobile_worker_url: string;
  business_worker_url: string;
  custom_domain: string;
}

const Settings = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    recaptcha_enabled: true,
    registration_enabled: true,
    whatsapp: '',
    facebook: '',
    mobile_worker_url: 'https://black-wildflower-1653.savshopbd.workers.dev/',
    business_worker_url: 'https://webzip.savshopbd.workers.dev/',
    custom_domain: '',
  });

  useEffect(() => {
    if (user && profile) {
      fetchSettings();
    }
  }, [user, profile]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['recaptcha_enabled', 'registration_enabled', 'social_links', 'worker_config']);

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
        } else if (item.key === 'worker_config') {
          const value = item.value as { mobile_worker_url: string; business_worker_url: string; custom_domain: string };
          newSettings.mobile_worker_url = value.mobile_worker_url || '';
          newSettings.business_worker_url = value.business_worker_url || '';
          newSettings.custom_domain = value.custom_domain || '';
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

      // Update worker config
      const { error: workerError } = await supabase
        .from('settings')
        .upsert({
          key: 'worker_config',
          value: {
            mobile_worker_url: settings.mobile_worker_url,
            business_worker_url: settings.business_worker_url,
            custom_domain: settings.custom_domain,
          },
        }, { onConflict: 'key' });

      if (workerError) throw workerError;

      toast.success('সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('সেটিংস সংরক্ষণ করতে সমস্যা হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Admin-only access check
  if (!user || profile?.role !== 'admin') {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-6xl">
      <div className="mb-6">
        <Button
          onClick={() => navigate('/admin')}
          variant="outline"
          size="sm"
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">এডমিন ড্যাশবোর্ডে ফিরে যান</span>
          <span className="sm:hidden">ফিরে যান</span>
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold font-bengali">সেটিংস</h1>
        <p className="text-sm sm:text-base text-muted-foreground font-bengali">অ্যাপ্লিকেশন কনফিগারেশন পরিচালনা করুন</p>
      </div>

      <div className="space-y-6">
        {/* Payment Methods Manager */}
        <PaymentMethodsManager />
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
            <CardTitle>Worker Configuration</CardTitle>
            <CardDescription>Cloudflare Worker URLs এবং Custom Domain কনফিগার করুন</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mobile_worker">মোবাইল ইউজার Worker URL</Label>
              <Input
                id="mobile_worker"
                placeholder="https://your-worker.workers.dev/"
                value={settings.mobile_worker_url}
                onChange={(e) => setSettings({ ...settings, mobile_worker_url: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">মোবাইল ইউজারদের জন্য Cloudflare Worker URL</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_worker">বিজনেস ইউজার Worker URL</Label>
              <Input
                id="business_worker"
                placeholder="https://your-worker.workers.dev/"
                value={settings.business_worker_url}
                onChange={(e) => setSettings({ ...settings, business_worker_url: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">বিজনেস ইউজারদের জন্য Cloudflare Worker URL</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom_domain">কাস্টম ডোমেইন (ঐচ্ছিক)</Label>
              <Input
                id="custom_domain"
                placeholder="cloud.btspro24.com"
                value={settings.custom_domain}
                onChange={(e) => setSettings({ ...settings, custom_domain: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Cloudflare Worker route এর জন্য কাস্টম ডোমেইন (যেমন: cloud.btspro24.com)
              </p>
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
