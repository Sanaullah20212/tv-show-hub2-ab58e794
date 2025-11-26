import { useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Smartphone, Shield, Tv, Archive, MessageCircle, Facebook, Home, Lock, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/hooks/useSettings';
import { useCountryCode } from '@/hooks/useCountryCode';
import { CountryCodeSelector } from '@/components/CountryCodeSelector';

const Auth = () => {
  const { user, loading, signUp, signIn } = useAuth();
  const { toast } = useToast();
  const { settings, loading: settingsLoading } = useSettings();
  const { selectedCountry, setSelectedCountry, countryList, isDetecting } = useCountryCode();
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 animate-gradient-xy" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
      
      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Back to Home Button */}
        <div className="text-center">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground transition-all hover:scale-105"
          >
            <a href="/" className="flex items-center justify-center gap-2 font-bengali">
              <Home className="h-4 w-4" />
              হোম পেজে ফিরে যান
            </a>
          </Button>
        </div>

        {/* Header with animated logo */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
              <div className="relative bg-gradient-to-br from-primary to-secondary p-4 rounded-2xl shadow-lg">
                <Shield className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              BTSPRO24.COM
            </h1>
            <p className="text-muted-foreground mt-2">নিরাপদ এবং সহজ লগইন সিস্টেম</p>
          </div>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className={`grid w-full ${registrationEnabled ? 'grid-cols-2' : 'grid-cols-1'} bg-card/50 backdrop-blur-sm p-1 h-auto`}>
            <TabsTrigger 
              value="signin" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white py-3"
            >
              <Lock className="h-4 w-4 mr-2" />
              লগইন
            </TabsTrigger>
            {registrationEnabled && (
              <TabsTrigger 
                value="signup"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-secondary data-[state=active]:to-accent data-[state=active]:text-white py-3"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                সাইনআপ
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="signin">
            <Card className="border-border/50 shadow-xl backdrop-blur-sm bg-card/80">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  লগইন করুন
                </CardTitle>
                <CardDescription className="text-base">
                  আপনার মোবাইল নম্বর এবং পাসওয়ার্ড দিয়ে লগইন করুন
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="mobile" className="text-sm font-medium">
                      মোবাইল নম্বর
                    </Label>
                    <div className="flex gap-0">
                      <CountryCodeSelector
                        selectedCountry={selectedCountry}
                        countryList={countryList}
                        onCountryChange={setSelectedCountry}
                        disabled={isDetecting}
                      />
                      <div className="relative flex-1">
                        <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="mobile"
                          type="tel"
                          placeholder="1XXXXXXXXX"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          className="pl-10 rounded-l-none border-l-0 h-[42px] bg-background/50"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      পাসওয়ার্ড
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 bg-background/50"
                        required
                      />
                    </div>
                  </div>
                  {recaptchaEnabled && (
                    <div className="flex justify-center py-2">
                      <ReCAPTCHA
                        ref={recaptchaRefSignIn}
                        sitekey={RECAPTCHA_SITE_KEY}
                      />
                    </div>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        লগইন হচ্ছে...
                      </div>
                    ) : (
                      'লগইন করুন'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {registrationEnabled && (
            <TabsContent value="signup">
              <Card className="border-border/50 shadow-xl backdrop-blur-sm bg-card/80">
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                    নতুন অ্যাকাউন্ট
                  </CardTitle>
                  <CardDescription className="text-base">
                    আপনার তথ্য দিয়ে নতুন অ্যাকাউন্ট তৈরি করুন
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignUp} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="signup-mobile" className="text-sm font-medium">
                        মোবাইল নম্বর
                      </Label>
                      <div className="flex gap-0">
                        <CountryCodeSelector
                          selectedCountry={selectedCountry}
                          countryList={countryList}
                          onCountryChange={setSelectedCountry}
                          disabled={isDetecting}
                        />
                        <div className="relative flex-1">
                          <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-mobile"
                            type="tel"
                            placeholder="1XXXXXXXXX"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            className="pl-10 rounded-l-none border-l-0 h-[42px] bg-background/50"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-sm font-medium">
                        পাসওয়ার্ড
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 bg-background/50"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-type" className="text-sm font-medium">
                        ব্যবহারকারীর ধরন
                      </Label>
                      <Select value={userType} onValueChange={(value: 'mobile' | 'business') => setUserType(value)}>
                        <SelectTrigger className="bg-background/50 h-[42px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="z-[100]">
                          <SelectItem value="mobile">
                            <div className="flex items-center space-x-3 py-1">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <Tv className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex flex-col items-start">
                                <span className="font-medium">মোবাইল ইউজার</span>
                                <span className="text-xs text-muted-foreground">টিভি শো দেখুন</span>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="business">
                            <div className="flex items-center space-x-3 py-1">
                              <div className="p-2 bg-accent/10 rounded-lg">
                                <Archive className="h-4 w-4 text-accent" />
                              </div>
                              <div className="flex flex-col items-start">
                                <span className="font-medium">ব্যবসায়ী</span>
                                <span className="text-xs text-muted-foreground">জিপ ফাইল ডাউনলোড করুন</span>
                              </div>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {recaptchaEnabled && (
                      <div className="flex justify-center py-2">
                        <ReCAPTCHA
                          ref={recaptchaRefSignUp}
                          sitekey={RECAPTCHA_SITE_KEY}
                        />
                      </div>
                    )}
                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          অ্যাকাউন্ট তৈরি হচ্ছে...
                        </div>
                      ) : (
                        'অ্যাকাউন্ট তৈরি করুন'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Contact Us Section */}
        {(settings.social_links.whatsapp || settings.social_links.facebook) && (
          <Card className="border-border/50 bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-sm shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-foreground font-semibold text-lg tracking-wide font-bengali flex items-center justify-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  যোগাযোগ করুন
                </p>
                <div className="flex items-center justify-center gap-6">
                  {settings.social_links.whatsapp && (
                    <a
                      href={settings.social_links.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col items-center gap-3 transition-all duration-300 transform hover:scale-110"
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-success/20 blur-xl rounded-full animate-pulse" />
                        <div className="relative p-4 bg-gradient-to-br from-success/20 to-success/10 hover:from-success/30 hover:to-success/20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-success/30">
                          <MessageCircle className="h-7 w-7 text-success" />
                        </div>
                      </div>
                      <span className="text-muted-foreground text-sm font-medium group-hover:text-success transition-colors font-bengali">
                        WhatsApp
                      </span>
                    </a>
                  )}
                  {settings.social_links.facebook && (
                    <a
                      href={settings.social_links.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col items-center gap-3 transition-all duration-300 transform hover:scale-110"
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-secondary/20 blur-xl rounded-full animate-pulse" />
                        <div className="relative p-4 bg-gradient-to-br from-secondary/20 to-secondary/10 hover:from-secondary/30 hover:to-secondary/20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-secondary/30">
                          <Facebook className="h-7 w-7 text-secondary" />
                        </div>
                      </div>
                      <span className="text-muted-foreground text-sm font-medium group-hover:text-secondary transition-colors font-bengali">
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