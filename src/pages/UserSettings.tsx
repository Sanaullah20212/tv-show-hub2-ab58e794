import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Camera, Save, User, Phone, Mail } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PreferencesManager } from '@/components/PreferencesManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const UserSettings = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setMobileNumber(profile.mobile_number || '');
      // Avatar URL can be added later when storage is implemented
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          mobile_number: mobileNumber,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('প্রোফাইল সফলভাবে আপডেট হয়েছে');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('প্রোফাইল আপডেট করতে সমস্যা হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Get initials for avatar
  const initials = displayName
    ? displayName.split(' ').map(n => n[0]).join('').toUpperCase()
    : profile?.mobile_number?.substring(0, 2) || 'U';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                ফিরে যান
              </Button>
              <h1 className="text-2xl sm:text-3xl font-bold font-bengali">
                প্রোফাইল সেটিংস
              </h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="font-bengali">প্রোফাইল</TabsTrigger>
            <TabsTrigger value="preferences" className="font-bengali">প্রেফারেন্স</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
          {/* Profile Card */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="font-bengali">প্রোফাইল তথ্য</CardTitle>
              <CardDescription className="font-bengali">
                আপনার প্রোফাইল তথ্য আপডেট করুন
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 border-4 border-primary/20">
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-accent text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-bengali">
                    প্রোফাইল ছবি
                  </p>
                  <Button variant="outline" size="sm" disabled>
                    <Camera className="h-4 w-4 mr-2" />
                    ছবি আপলোড করুন
                  </Button>
                  <p className="text-xs text-muted-foreground font-bengali">
                    (শীঘ্রই আসছে)
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                {/* Display Name */}
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="font-bengali flex items-center gap-2">
                    <User className="h-4 w-4" />
                    প্রদর্শন নাম
                  </Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="আপনার নাম লিখুন"
                    className="font-bengali"
                  />
                </div>

                {/* Mobile Number */}
                <div className="space-y-2">
                  <Label htmlFor="mobileNumber" className="font-bengali flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    মোবাইল নম্বর
                  </Label>
                  <Input
                    id="mobileNumber"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="font-bengali"
                  />
                </div>

                {/* Email (Read Only) */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-bengali flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    ইমেইল
                  </Label>
                  <Input
                    id="email"
                    value={user?.email || 'N/A'}
                    disabled
                    className="font-bengali bg-muted"
                  />
                  <p className="text-xs text-muted-foreground font-bengali">
                    ইমেইল পরিবর্তন করা যাবে না
                  </p>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="gradient-primary text-white font-bengali"
                >
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
            </CardContent>
          </Card>

          {/* Account Type Card */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="font-bengali">অ্যাকাউন্ট তথ্য</CardTitle>
              <CardDescription className="font-bengali">
                আপনার অ্যাকাউন্ট সম্পর্কিত তথ্য
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground font-bengali mb-1">
                    অ্যাকাউন্ট টাইপ
                  </p>
                  <p className="font-semibold font-bengali">
                    {profile?.user_type === 'mobile' ? '📱 মোবাইল' : '💼 বিজনেস'}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground font-bengali mb-1">
                    ভূমিকা
                  </p>
                  <p className="font-semibold font-bengali">
                    {profile?.role === 'admin' ? '👑 অ্যাডমিন' : '👤 ব্যবহারকারী'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Theme Card */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="font-bengali">থিম সেটিংস</CardTitle>
              <CardDescription className="font-bengali">
                আপনার পছন্দের থিম নির্বাচন করুন
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium font-bengali">থিম মোড</p>
                  <p className="text-sm text-muted-foreground font-bengali">
                    লাইট বা ডার্ক মোড নির্বাচন করুন
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <PreferencesManager userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
    </div>
  );
};

export default UserSettings;
