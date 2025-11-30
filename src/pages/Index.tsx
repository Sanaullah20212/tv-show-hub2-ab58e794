import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tv, Archive, ArrowRight, Users, Star, Sparkles, MessageCircle, Facebook, Play, CheckCircle2, Phone, Clock, Shield, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import { useState, useEffect } from 'react';

const Index = () => {
  const { user, loading } = useAuth();
  const { settings } = useSettings();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const sections = ['services', 'pricing', 'how-to-start'];
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
      }
    );

    sections.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      sections.forEach((sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-info to-success overflow-hidden relative">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative flex flex-col items-center justify-center space-y-6 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 -m-4">
              <div className="w-full h-full rounded-full border-2 border-white/50 animate-pulse"></div>
            </div>
            <div className="relative p-6 bg-white/20 rounded-full backdrop-blur-sm shadow-2xl border-2 border-white/30">
              <Play className="h-16 w-16 text-white fill-white/50" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-bold text-white drop-shadow-2xl tracking-tight">
              BTSPRO24.COM
            </h1>
            <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-white to-transparent rounded-full"></div>
          </div>

          <p className="text-white/90 text-lg font-bengali animate-pulse">
            লোড হচ্ছে...
          </p>
        </div>
      </div>
    );
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Scroll Progress */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted">
        <div 
          className="h-full bg-gradient-to-r from-primary via-info to-success transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-gradient-to-r from-primary via-info to-success py-3 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-1 sm:gap-3">
            <Button 
              onClick={() => scrollToSection('services')}
              variant="ghost" 
              size="sm"
              className={`text-white hover:bg-white/20 font-bengali text-xs sm:text-sm px-2 sm:px-4 ${
                activeSection === 'services' ? 'bg-white/25' : ''
              }`}
            >
              সেবাসমূহ
            </Button>
            <div className="h-4 w-px bg-white/30"></div>
            <Button 
              onClick={() => scrollToSection('pricing')}
              variant="ghost" 
              size="sm"
              className={`text-white hover:bg-white/20 font-bengali text-xs sm:text-sm px-2 sm:px-4 ${
                activeSection === 'pricing' ? 'bg-white/25' : ''
              }`}
            >
              প্ল্যান ও মূল্য
            </Button>
            <div className="h-4 w-px bg-white/30"></div>
            <Button 
              onClick={() => scrollToSection('how-to-start')}
              variant="ghost" 
              size="sm"
              className={`text-white hover:bg-white/20 font-bengali text-xs sm:text-sm px-2 sm:px-4 ${
                activeSection === 'how-to-start' ? 'bg-white/25' : ''
              }`}
            >
              শুরু করুন
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-info to-success">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-10 sm:py-14 lg:py-16">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo */}
            <div className="flex flex-col items-center space-y-4 mb-6 animate-fade-in">
              <div className="relative group">
                <div className="absolute -inset-2 bg-white/30 rounded-full blur-xl"></div>
                <div className="relative p-4 sm:p-5 bg-white/20 backdrop-blur-xl rounded-full border-2 border-white/40 group-hover:scale-105 transition-transform">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 via-transparent to-transparent"></div>
                  <div className="relative">
                    <Play className="absolute inset-0 h-8 w-8 sm:h-10 sm:w-10 text-white/50 fill-white/30 blur-sm ml-0.5" strokeWidth={2} />
                    <Play className="relative h-8 w-8 sm:h-10 sm:w-10 text-white/90 fill-white/40 ml-0.5" strokeWidth={2} />
                  </div>
                </div>
              </div>
              
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg tracking-tight">
                  BTSPRO24.COM
                </h1>
                <div className="h-0.5 w-20 sm:w-28 mx-auto mt-2 bg-gradient-to-r from-transparent via-white to-transparent rounded-full"></div>
              </div>
            </div>
            
            {/* Tagline */}
            <p className="text-sm sm:text-base lg:text-lg text-white/95 mb-6 font-bengali font-medium max-w-2xl mx-auto">
              ব্যবসায়িক ফাইল এবং টিভি শো দেখার সেরা প্ল্যাটফর্ম
            </p>
            
            {/* CTA Button */}
            <div className="mb-8">
              {user ? (
                <Button 
                  asChild 
                  size="lg" 
                  className="text-sm sm:text-base px-6 sm:px-8 py-5 bg-white text-primary hover:bg-white/95 shadow-xl transition-all hover:scale-105 rounded-xl font-semibold"
                >
                  <a href="/dashboard" className="font-bengali flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    ড্যাশবোর্ডে যান
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              ) : (
                <Button 
                  asChild 
                  size="lg" 
                  className="text-sm sm:text-base px-6 sm:px-8 py-5 bg-white text-primary hover:bg-white/95 shadow-xl transition-all hover:scale-105 rounded-xl font-semibold"
                >
                  <a href="/auth" className="font-bengali flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    এখনই শুরু করুন
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>

            {/* Contact Card */}
            {(settings?.social_links?.whatsapp || settings?.social_links?.facebook) && (
              <div className="max-w-lg mx-auto">
                <div className="relative bg-white/10 backdrop-blur-md border border-white/30 rounded-xl p-4 sm:p-5">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    <h3 className="text-base sm:text-lg font-bold text-white font-bengali">
                      সাহায্য প্রয়োজন?
                    </h3>
                  </div>
                  <p className="text-white/80 text-center mb-3 font-bengali text-xs sm:text-sm">
                    যেকোনো প্রশ্নে আমাদের সাথে যোগাযোগ করুন
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    {settings?.social_links?.whatsapp && (
                      <Button asChild size="sm" className="bg-[#25D366] hover:bg-[#1da851] text-white font-bengali text-xs">
                        <a href={settings.social_links.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                          <MessageCircle className="h-3.5 w-3.5" />
                          হোয়াটসঅ্যাপ
                        </a>
                      </Button>
                    )}
                    {settings?.social_links?.facebook && (
                      <Button asChild size="sm" className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bengali text-xs">
                        <a href={settings.social_links.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                          <Facebook className="h-3.5 w-3.5" />
                          ফেসবুক
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-12 sm:py-16 scroll-mt-14">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-info bg-clip-text text-transparent font-bengali mb-2">
              আমাদের সেবাসমূহ
            </h2>
            <p className="text-muted-foreground font-bengali text-sm sm:text-base">
              দুই ধরনের ইউজারের জন্য আলাদা সেবা
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Mobile User System */}
            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-3 p-3 bg-gradient-to-br from-primary to-primary/80 rounded-xl w-fit">
                  <Tv className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl sm:text-2xl text-primary font-bengali">
                  📱 মোবাইল ইউজার
                </CardTitle>
                <CardDescription className="font-bengali text-sm">
                  টিভি শো এবং সিরিয়াল দেখার জন্য
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    'সকল টিভি শো অ্যাক্সেস',
                    'উচ্চ মানের ভিডিও স্ট্রিমিং',
                    'মোবাইল ফ্রেন্ডলি ইন্টারফেস',
                    'সাবস্ক্রিপশন ভিত্তিক সেবা'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="font-bengali text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Business User System */}
            <Card className="border-2 border-success/20 hover:border-success/40 transition-all hover:shadow-lg">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-3 p-3 bg-gradient-to-br from-success to-success/80 rounded-xl w-fit">
                  <Archive className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl sm:text-2xl text-success font-bengali">
                  💼 ব্যবসায়ী ইউজার
                </CardTitle>
                <CardDescription className="font-bengali text-sm">
                  জিপ ফাইল এবং ডকুমেন্ট ম্যানেজমেন্ট
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    'সুরক্ষিত জিপ ফাইল অ্যাক্সেস',
                    'পাসওয়ার্ড ম্যানেজমেন্ট সিস্টেম',
                    'ব্যবসায়িক ডকুমেন্ট সংরক্ষণ',
                    'মেয়াদ ভিত্তিক অ্যাক্সেস',
                    'Medium/Low কোয়ালিটি বাটন ফোনে সাপোর্ট'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                      <span className="font-bengali text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 sm:py-16 bg-muted/30 scroll-mt-14">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent font-bengali mb-2">
              সাবস্ক্রিপশন প্ল্যান
            </h2>
            <p className="text-muted-foreground font-bengali text-sm sm:text-base">
              আপনার প্রয়োজন অনুযায়ী প্ল্যান বেছে নিন
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {/* 1 Month */}
            <Card className="text-center border hover:shadow-lg transition-all">
              <CardHeader className="pb-3">
                <div className="mx-auto mb-2 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold">১</span>
                </div>
                <CardTitle className="text-lg font-bengali">১ মাস</CardTitle>
                <div className="text-3xl font-bold text-primary font-bengali">
                  ২০০ <span className="text-base font-normal">টাকা</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-bengali text-sm">মাসিক সাবস্ক্রিপশন</p>
              </CardContent>
            </Card>

            {/* 2 Month - Popular */}
            <Card className="text-center border-2 border-warning relative shadow-lg sm:scale-105">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-warning text-warning-foreground px-3 py-1 rounded-full text-xs font-bold font-bengali flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  জনপ্রিয়
                </span>
              </div>
              <CardHeader className="pb-3 pt-6">
                <div className="mx-auto mb-2 w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                  <span className="text-warning font-bold">২</span>
                </div>
                <CardTitle className="text-lg font-bengali">২ মাস</CardTitle>
                <div className="text-3xl font-bold text-warning font-bengali">
                  ৪০০ <span className="text-base font-normal">টাকা</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-bengali text-sm">দুই মাসের সাবস্ক্রিপশন</p>
              </CardContent>
            </Card>

            {/* 3 Month */}
            <Card className="text-center border hover:shadow-lg transition-all">
              <CardHeader className="pb-3">
                <div className="mx-auto mb-2 w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <span className="text-success font-bold">৩</span>
                </div>
                <CardTitle className="text-lg font-bengali">৩ মাস</CardTitle>
                <div className="text-3xl font-bold text-success font-bengali">
                  ৫০০ <span className="text-base font-normal">টাকা</span>
                </div>
                <div className="text-xs text-destructive line-through font-bengali">৬০০ টাকা</div>
              </CardHeader>
              <CardContent>
                <div className="bg-success/10 rounded-md p-1.5 mb-1">
                  <p className="text-xs font-semibold text-success font-bengali">১০০ টাকা সাশ্রয়!</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How to Start Section */}
      <section id="how-to-start" className="py-12 sm:py-16 scroll-mt-14">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary via-info to-success bg-clip-text text-transparent font-bengali mb-2">
              কিভাবে শুরু করবেন?
            </h2>
            <p className="text-muted-foreground font-bengali text-sm sm:text-base">
              মাত্র ৩টি সহজ ধাপ
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center mx-auto">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-primary text-white rounded-full text-sm font-bold flex items-center justify-center">১</span>
              </div>
              <h3 className="font-bold text-lg mb-2 font-bengali">অ্যাকাউন্ট তৈরি</h3>
              <p className="text-muted-foreground text-sm font-bengali">
                মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে রেজিস্টার করুন। ইউজার টাইপ (মোবাইল/বিজনেস) নির্বাচন করুন।
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-info to-success flex items-center justify-center mx-auto">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-info text-white rounded-full text-sm font-bold flex items-center justify-center">২</span>
              </div>
              <h3 className="font-bold text-lg mb-2 font-bengali">সাবস্ক্রিপশন</h3>
              <p className="text-muted-foreground text-sm font-bengali">
                প্ল্যান বাছুন। হোয়াটসঅ্যাপ/ফেসবুকে যোগাযোগ করে পেমেন্ট করুন এবং অ্যাক্টিভেশনের অপেক্ষা করুন।
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-success to-primary flex items-center justify-center mx-auto">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-success text-white rounded-full text-sm font-bold flex items-center justify-center">৩</span>
              </div>
              <h3 className="font-bold text-lg mb-2 font-bengali">সেবা উপভোগ</h3>
              <p className="text-muted-foreground text-sm font-bengali">
                ড্যাশবোর্ডে লগইন করে ড্রাইভ ফাইল, টিভি শো, জিপ পাসওয়ার্ড ইত্যাদি সেবা ব্যবহার করুন।
              </p>
            </div>
          </div>

          {/* Contact Help */}
          {(settings?.social_links?.whatsapp || settings?.social_links?.facebook) && (
            <div className="mt-12 max-w-md mx-auto">
              <Card className="border-2 border-primary/20">
                <CardContent className="p-5 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-lg font-bengali">সাহায্য দরকার?</h3>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4 font-bengali">
                    যেকোনো প্রশ্নে যোগাযোগ করুন
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    {settings?.social_links?.whatsapp && (
                      <Button asChild className="bg-[#25D366] hover:bg-[#1da851] text-white font-bengali">
                        <a href={settings.social_links.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4" />
                          হোয়াটসঅ্যাপ
                        </a>
                      </Button>
                    )}
                    {settings?.social_links?.facebook && (
                      <Button asChild className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bengali">
                        <a href={settings.social_links.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                          <Facebook className="h-4 w-4" />
                          ফেসবুক
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-primary/5 via-info/5 to-success/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-info bg-clip-text text-transparent font-bengali">
              আমাদের পরিসংখ্যান
            </h2>
          </div>
          
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="text-center p-4 bg-background rounded-xl shadow-sm">
              <div className="flex justify-center mb-2">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-success" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-success font-bengali">১০০০+</div>
              <p className="text-muted-foreground text-xs sm:text-sm font-bengali">গ্রাহক</p>
            </div>
            
            <div className="text-center p-4 bg-background rounded-xl shadow-sm">
              <div className="flex justify-center mb-2">
                <Tv className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-primary font-bengali">৫০০+</div>
              <p className="text-muted-foreground text-xs sm:text-sm font-bengali">টিভি শো</p>
            </div>
            
            <div className="text-center p-4 bg-background rounded-xl shadow-sm">
              <div className="flex justify-center mb-2">
                <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-warning" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-warning font-bengali">৯৯%</div>
              <p className="text-muted-foreground text-xs sm:text-sm font-bengali">আপটাইম</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-muted/50 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-primary to-info rounded-lg">
                <Play className="h-5 w-5 text-white fill-white/50" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
                BTSPRO24.COM
              </span>
            </div>
            <p className="text-muted-foreground font-bengali text-sm text-center">
              © ২০২৪ BTSPRO24.COM। সকল অধিকার সংরক্ষিত।
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
