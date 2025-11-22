import { useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Smartphone, Shield, Tv, Archive, MessageCircle, Facebook, Home } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/hooks/useSettings';

const Auth = () => {
  const { user, loading, signUp, signIn } = useAuth();
  const { toast } = useToast();
  const { settings, loading: settingsLoading } = useSettings();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'mobile' | 'business'>('mobile');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const recaptchaRefSignIn = useRef<ReCAPTCHA>(null);
  const recaptchaRefSignUp = useRef<ReCAPTCHA>(null);
  
  // Google reCAPTCHA site key - Replace with your own key from https://www.google.com/recaptcha/admin
  const RECAPTCHA_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Test key
  
  // Get settings for recaptcha and registration
  const recaptchaEnabled = settings?.recaptcha_enabled ?? true;
  const registrationEnabled = settings?.registration_enabled ?? true;

  if (loading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registrationEnabled) {
      toast({
        title: "রেজিস্ট্রেশন বন্ধ আছে",
        description: "বর্তমানে নতুন রেজিস্ট্রেশন গ্রহণ করা হচ্ছে না।",
        variant: "destructive",
      });
      return;
    }
    
    if (recaptchaEnabled) {
      const captchaValue = recaptchaRefSignUp.current?.getValue();
      if (!captchaValue) {
        toast({
          title: "রোবট যাচাই প্রয়োজন",
          description: "অনুগ্রহ করে 'I'm not a robot' চেকবক্স টিক দিন",
          variant: "destructive",
        });
        return;
      }
    }
    
    setIsSubmitting(true);
    await signUp(mobile, password, userType);
    setIsSubmitting(false);
    if (recaptchaEnabled) {
      recaptchaRefSignUp.current?.reset();
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (recaptchaEnabled) {
      const captchaValue = recaptchaRefSignIn.current?.getValue();
      if (!captchaValue) {
        toast({
          title: "রোবট যাচাই প্রয়োজন",
          description: "অনুগ্রহ করে 'I'm not a robot' চেকবক্স টিক দিন",
          variant: "destructive",
        });
        return;
      }
    }
    
    setIsSubmitting(true);
    await signIn(mobile, password);
    setIsSubmitting(false);
    if (recaptchaEnabled) {
      recaptchaRefSignIn.current?.reset();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back to Home Button */}
        <div className="text-center">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <a href="/" className="flex items-center justify-center gap-2 font-bengali">
              <Home className="h-4 w-4" />
              হোম পেজে ফিরে যান
            </a>
          </Button>
        </div>

        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">প্যানেল সিস্টেম</h1>
          </div>
          <p className="text-muted-foreground">আপনার অ্যাকাউন্টে প্রবেশ করুন</p>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className={`grid w-full ${registrationEnabled ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <TabsTrigger value="signin">লগইন</TabsTrigger>
            {registrationEnabled && <TabsTrigger value="signup">সাইনআপ</TabsTrigger>}
          </TabsList>

          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle>লগইন করুন</CardTitle>
                <CardDescription>
                  আপনার মোবাইল নম্বর এবং পাসওয়ার্ড দিন
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="mobile">মোবাইল নম্বর</Label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="mobile"
                        type="tel"
                        placeholder="01XXXXXXXXX"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">পাসওয়ার্ড</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  {recaptchaEnabled && (
                    <div className="flex justify-center">
                      <ReCAPTCHA
                        ref={recaptchaRefSignIn}
                        sitekey={RECAPTCHA_SITE_KEY}
                      />
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {registrationEnabled && (
            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle>নতুন অ্যাকাউন্ট</CardTitle>
                  <CardDescription>
                    আপনার তথ্য দিয়ে নতুন অ্যাকাউন্ট তৈরি করুন
                  </CardDescription>
                </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-mobile">মোবাইল নম্বর</Label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-mobile"
                        type="tel"
                        placeholder="01XXXXXXXXX"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">পাসওয়ার্ড</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-type">ব্যবহারকারীর ধরন</Label>
                    <Select value={userType} onValueChange={(value: 'mobile' | 'business') => setUserType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mobile">
                          <div className="flex items-center space-x-2">
                            <Tv className="h-4 w-4" />
                            <span>মোবাইল ইউজার (টিভি শো)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="business">
                          <div className="flex items-center space-x-2">
                            <Archive className="h-4 w-4" />
                            <span>ব্যবসায়ী (জিপ ফাইল)</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {recaptchaEnabled && (
                    <div className="flex justify-center">
                      <ReCAPTCHA
                        ref={recaptchaRefSignUp}
                        sitekey={RECAPTCHA_SITE_KEY}
                      />
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'অ্যাকাউন্ট তৈরি করুন'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          )}
        </Tabs>

        {/* Contact Us Section */}
        {(settings.social_links.whatsapp || settings.social_links.facebook) && (
          <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-foreground font-semibold text-base tracking-wide font-bengali">
                  Contact Us
                </p>
                <div className="flex items-center justify-center gap-6">
                  {settings.social_links.whatsapp && (
                    <a
                      href={settings.social_links.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col items-center gap-2 transition-all duration-300 transform hover:scale-110"
                    >
                      <div className="p-3 bg-success/10 hover:bg-success/20 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-success/20">
                        <MessageCircle className="h-6 w-6 text-success" />
                      </div>
                      <span className="text-muted-foreground text-sm font-medium group-hover:text-foreground transition-colors font-bengali">
                        WhatsApp
                      </span>
                    </a>
                  )}
                  {settings.social_links.facebook && (
                    <a
                      href={settings.social_links.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col items-center gap-2 transition-all duration-300 transform hover:scale-110"
                    >
                      <div className="p-3 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-500/20">
                        <Facebook className="h-6 w-6 text-blue-500" />
                      </div>
                      <span className="text-muted-foreground text-sm font-medium group-hover:text-foreground transition-colors font-bengali">
                        Facebook
                      </span>
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Auth;