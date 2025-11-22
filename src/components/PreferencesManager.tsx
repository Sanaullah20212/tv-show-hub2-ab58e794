import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Palette, Type, Globe } from "lucide-react";
import { usePreferences } from "@/hooks/usePreferences";
import { Skeleton } from "@/components/ui/skeleton";
import { PushNotificationSettings } from "@/components/PushNotificationSettings";

interface PreferencesManagerProps {
  userId: string;
}

export const PreferencesManager = ({ userId }: PreferencesManagerProps) => {
  const { preferences, loading, updatePreferences } = usePreferences(userId);

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-fade-in">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!preferences) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Theme Settings */}
      <Card className="animate-fade-in hover-scale">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle className="font-bengali">থিম সেটিংস</CardTitle>
          </div>
          <CardDescription className="font-bengali">
            আপনার পছন্দমত থিম কাস্টমাইজ করুন
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="font-bengali">থিম মোড</Label>
            <RadioGroup
              value={preferences.theme_mode}
              onValueChange={(value) => updatePreferences({ theme_mode: value as any })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light" className="font-bengali cursor-pointer">লাইট</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark" className="font-bengali cursor-pointer">ডার্ক</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="system" id="system" />
                <Label htmlFor="system" className="font-bengali cursor-pointer">সিস্টেম</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="font-bengali">ফন্ট সাইজ</Label>
            <Select
              value={preferences.font_size}
              onValueChange={(value) => updatePreferences({ font_size: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small" className="font-bengali">ছোট</SelectItem>
                <SelectItem value="medium" className="font-bengali">মাঝারি</SelectItem>
                <SelectItem value="large" className="font-bengali">বড়</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <PushNotificationSettings
        userId={userId}
        enabled={preferences.push_notifications_enabled}
        onToggle={(enabled) => updatePreferences({ push_notifications_enabled: enabled })}
      />

      <Card className="animate-fade-in hover-scale" style={{ animationDelay: "0.1s" }}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle className="font-bengali">ইমেইল নোটিফিকেশন</CardTitle>
          </div>
          <CardDescription className="font-bengali">
            ইমেইলে গুরুত্বপূর্ণ আপডেট পান
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-bengali">ইমেইল নোটিফিকেশন চালু করুন</Label>
              <p className="text-sm text-muted-foreground font-bengali mt-1">
                সাবস্ক্রিপশন এবং অ্যাকাউন্ট আপডেট পান
              </p>
            </div>
            <Switch
              checked={preferences.email_notifications_enabled}
              onCheckedChange={(checked) =>
                updatePreferences({ email_notifications_enabled: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card className="animate-fade-in hover-scale" style={{ animationDelay: "0.2s" }}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle className="font-bengali">ভাষা সেটিংস</CardTitle>
          </div>
          <CardDescription className="font-bengali">
            আপনার পছন্দের ভাষা নির্বাচন করুন
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={preferences.language}
            onValueChange={(value) => updatePreferences({ language: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bn" className="font-bengali">বাংলা</SelectItem>
              <SelectItem value="en" className="font-bengali">English</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Font Settings Info */}
      <Card className="animate-fade-in hover-scale" style={{ animationDelay: "0.3s" }}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Type className="h-5 w-5 text-primary" />
            <CardTitle className="font-bengali">ফন্ট তথ্য</CardTitle>
          </div>
          <CardDescription className="font-bengali">
            বর্তমান ফন্ট সেটিংস
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground font-bengali">ফন্ট সাইজ</p>
              <p className="font-medium">
                {preferences.font_size === 'small' && 'ছোট'}
                {preferences.font_size === 'medium' && 'মাঝারি'}
                {preferences.font_size === 'large' && 'বড়'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground font-bengali">ভাষা</p>
              <p className="font-medium">
                {preferences.language === 'bn' ? 'বাংলা' : 'English'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
