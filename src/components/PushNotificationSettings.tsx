import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, BellOff, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PushNotificationSettingsProps {
  userId: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export const PushNotificationSettings = ({ userId, enabled, onToggle }: PushNotificationSettingsProps) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkNotificationSupport();
  }, []);

  const checkNotificationSupport = async () => {
    try {
      setChecking(true);
      
      // Check if notifications are supported
      if (!('Notification' in window)) {
        setIsSupported(false);
        return;
      }

      setIsSupported(true);
      setHasPermission(Notification.permission === 'granted');
    } catch (error) {
      console.error('Error checking notification support:', error);
      setIsSupported(false);
    } finally {
      setChecking(false);
    }
  };

  const requestPermission = async () => {
    if (!isSupported) {
      toast.error('এই ব্রাউজারে পুশ নোটিফিকেশন সাপোর্টেড নয়');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        setHasPermission(true);
        onToggle(true);
        toast.success('পুশ নোটিফিকেশন চালু করা হয়েছে');
      } else {
        toast.error('পুশ নোটিফিকেশনের অনুমতি দেওয়া হয়নি');
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast.error('পুশ নোটিফিকেশন চালু করতে ব্যর্থ');
    }
  };

  const handleToggle = async (checked: boolean) => {
    if (checked && !hasPermission) {
      await requestPermission();
    } else {
      onToggle(checked);
      toast.success(checked ? 'পুশ নোটিফিকেশন চালু করা হয়েছে' : 'পুশ নোটিফিকেশন বন্ধ করা হয়েছে');
    }
  };

  const sendTestNotification = async () => {
    try {
      if (!hasPermission) {
        toast.error('প্রথমে পুশ নোটিফিকেশনের অনুমতি দিন');
        return;
      }

      // Send test notification
      new Notification('টেস্ট নোটিফিকেশন', {
        body: 'এটি একটি টেস্ট নোটিফিকেশন। আপনার পুশ নোটিফিকেশন সঠিকভাবে কাজ করছে! 🎉',
        icon: '/placeholder.svg',
      });

      toast.success('টেস্ট নোটিফিকেশন পাঠানো হয়েছে');
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('টেস্ট নোটিফিকেশন পাঠাতে ব্যর্থ');
    }
  };

  if (checking) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Bell className="h-4 w-4 animate-pulse" />
            <span className="font-bengali">লোড হচ্ছে...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isSupported) {
    return (
      <Card className="animate-fade-in border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BellOff className="h-5 w-5 text-destructive" />
            <CardTitle className="font-bengali">পুশ নোটিফিকেশন সাপোর্টেড নয়</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground font-bengali">
            আপনার ব্রাউজার বা ডিভাইস পুশ নোটিফিকেশন সাপোর্ট করে না। একটি আধুনিক ব্রাউজার ব্যবহার করুন।
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in hover-scale">
      <CardHeader>
        <div className="flex items-center gap-2">
          {hasPermission && enabled ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          )}
          <CardTitle className="font-bengali">পুশ নোটিফিকেশন</CardTitle>
        </div>
        <CardDescription className="font-bengali">
          ব্রাউজার এবং মোবাইল অ্যাপে নোটিফিকেশন পান
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div>
            <Label className="font-bengali">পুশ নোটিফিকেশন চালু করুন</Label>
            <p className="text-sm text-muted-foreground font-bengali mt-1">
              নতুন বিজ্ঞপ্তি এবং আপডেট পান
            </p>
          </div>
          <Switch
            checked={enabled && hasPermission}
            onCheckedChange={handleToggle}
          />
        </div>

        {hasPermission && (
          <div className="space-y-2">
            <p className="text-sm text-green-600 dark:text-green-400 font-bengali flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              পুশ নোটিফিকেশনের অনুমতি দেওয়া আছে
            </p>
            <Button
              onClick={sendTestNotification}
              variant="outline"
              size="sm"
              className="w-full font-bengali"
            >
              <Bell className="h-4 w-4 mr-2" />
              টেস্ট নোটিফিকেশন পাঠান
            </Button>
          </div>
        )}

        {!hasPermission && (
          <div className="space-y-2">
            <p className="text-sm text-yellow-600 dark:text-yellow-400 font-bengali flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              পুশ নোটিফিকেশনের অনুমতি দেওয়া নেই
            </p>
            <Button
              onClick={requestPermission}
              variant="default"
              size="sm"
              className="w-full font-bengali"
            >
              <Bell className="h-4 w-4 mr-2" />
              অনুমতি দিন
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
