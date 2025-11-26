import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Tv, Archive, ArrowRight, Users, Star, Sparkles, Zap, Heart, MessageCircle, Facebook } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import { useState, useEffect } from 'react';

const Index = () => {
  const { user, loading } = useAuth();
  const { settings } = useSettings();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('');

  // Track scroll progress - MUST be before any conditional returns
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track active section - MUST be before any conditional returns
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
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Main loading content */}
        <div className="relative flex flex-col items-center justify-center space-y-8 animate-fade-in">
          {/* Shield icon with advanced animations */}
          <div className="relative group">
            {/* Outer glow ring - rotating */}
            <div className="absolute inset-0 -m-8">
              <div className="w-full h-full rounded-full border-4 border-white/30 animate-spin" style={{ animationDuration: '3s' }}></div>
            </div>
            
            {/* Middle glow ring - pulsing */}
            <div className="absolute inset-0 -m-4">
              <div className="w-full h-full rounded-full border-2 border-white/50 animate-pulse"></div>
            </div>
            
            {/* Inner glow effect */}
            <div className="absolute inset-0 bg-white/30 rounded-full blur-3xl animate-pulse"></div>
            
            {/* Shield icon */}
            <div className="relative p-8 bg-white/20 rounded-full backdrop-blur-sm shadow-2xl border-2 border-white/30 animate-scale-in">
              <Shield className="h-24 w-24 text-white drop-shadow-2xl animate-pulse" />
            </div>
          </div>

          {/* Logo text with animation */}
          <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <h1 className="text-6xl font-bold text-white drop-shadow-2xl tracking-tight animate-pulse">
              BTSPRO24.COM
            </h1>
            {/* Animated underline */}
            <div className="h-1.5 w-48 mx-auto bg-gradient-to-r from-transparent via-white to-transparent rounded-full animate-pulse"></div>
          </div>

          {/* Loading text */}
          <p className="text-white/90 text-xl font-bengali animate-pulse" style={{ animationDelay: '0.5s' }}>
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
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-info/10">
      {/* Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-white/10">
        <div 
          className="h-full bg-gradient-to-r from-primary via-info to-success transition-all duration-300 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-gradient-to-r from-primary via-info to-success py-3 sm:py-4 shadow-lg backdrop-blur-sm">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-center gap-2 sm:gap-4 overflow-x-auto">
            <Button 
              onClick={() => scrollToSection('services')}
              variant="ghost" 
              className={`text-white hover:bg-white/20 font-bengali text-xs sm:text-base whitespace-nowrap px-2 sm:px-4 transition-all duration-300 ${
                activeSection === 'services' 
                  ? 'bg-white/30 shadow-lg scale-105 border-b-2 border-white' 
                  : ''
              }`}
            >
              আমাদের সেবাসমূহ
            </Button>
            <div className="h-4 sm:h-6 w-px bg-white/30 flex-shrink-0"></div>
            <Button 
              onClick={() => scrollToSection('pricing')}
              variant="ghost" 
              className={`text-white hover:bg-white/20 font-bengali text-xs sm:text-base whitespace-nowrap px-2 sm:px-4 transition-all duration-300 ${
                activeSection === 'pricing' 
                  ? 'bg-white/30 shadow-lg scale-105 border-b-2 border-white' 
                  : ''
              }`}
            >
              সাবস্ক্রিপশন প্ল্যান
            </Button>
            <div className="h-4 sm:h-6 w-px bg-white/30 flex-shrink-0"></div>
            <Button 
              onClick={() => scrollToSection('how-to-start')}
              variant="ghost" 
              className={`text-white hover:bg-white/20 font-bengali text-xs sm:text-base whitespace-nowrap px-2 sm:px-4 transition-all duration-300 ${
                activeSection === 'how-to-start' 
                  ? 'bg-white/30 shadow-lg scale-105 border-b-2 border-white' 
                  : ''
              }`}
            >
              কিভাবে শুরু করবেন
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-info to-success">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-700"></div>
          </div>
        </div>
        
        <div className="relative">
          <div className="container mx-auto px-4 py-16 sm:py-20 lg:py-24">
            <div className="text-center max-w-6xl mx-auto">
              {/* Logo and Title */}
              <div className="flex flex-col items-center justify-center space-y-6 mb-8 animate-fade-in">
                <div className="relative group">
                  <div className="absolute inset-0 bg-white/30 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                  <div className="relative p-5 sm:p-6 bg-white/20 rounded-full backdrop-blur-sm shadow-2xl border-2 border-white/30 group-hover:scale-110 transition-transform duration-500">
                    <Shield className="h-14 w-14 sm:h-20 sm:w-20 lg:h-24 lg:w-24 text-white drop-shadow-2xl" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h1 className="text-4xl sm:text-6xl lg:text-8xl font-bold drop-shadow-2xl tracking-tight animate-scale-in">
                    <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-[length:200%_100%] animate-gradient-x bg-clip-text text-transparent">
                      BTSPRO24.COM
                    </span>
                  </h1>
                  <div className="h-1.5 w-32 sm:w-48 mx-auto bg-gradient-to-r from-transparent via-white to-transparent rounded-full animate-pulse"></div>
                </div>
              </div>
              
              {/* Tagline */}
              <p className="text-base sm:text-xl lg:text-3xl text-white/95 mb-10 sm:mb-12 leading-relaxed drop-shadow-lg px-4 font-bengali font-medium max-w-4xl mx-auto animate-fade-in">
                ব্যবসায়িক ফাইলের জন্য এবং টিভি শো দেখার অন্যতম ওয়েবসাইট
              </p>
              
              {/* CTA Button */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 sm:mb-16 animate-fade-in px-4">
                {user ? (
                  <Button 
                    asChild 
                    size="lg" 
                    className="text-base sm:text-lg px-8 sm:px-12 py-6 sm:py-7 bg-white text-primary hover:bg-white/95 shadow-2xl hover:shadow-white/20 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 w-full sm:w-auto rounded-xl font-semibold"
                  >
                    <a href="/dashboard" className="font-bengali flex items-center justify-center gap-2">
                      <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
                      <span>ড্যাশবোর্ডে যান</span>
                      <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" />
                    </a>
                  </Button>
                ) : (
                  <Button 
                    asChild 
                    size="lg" 
                    className="text-base sm:text-lg px-8 sm:px-12 py-6 sm:py-7 bg-white text-primary hover:bg-white/95 shadow-2xl hover:shadow-white/20 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 w-full sm:w-auto rounded-xl font-semibold"
                  >
                    <a href="/auth" className="font-bengali flex items-center justify-center gap-2">
                      <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
                      <span>এখনই শুরু করুন</span>
                      <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" />
                    </a>
                  </Button>
                )}
              </div>

              {/* Contact Us Section - Redesigned */}
              {(settings?.social_links?.whatsapp || settings?.social_links?.facebook) && (
                <div className="animate-fade-in px-4">
                  <div className="max-w-3xl mx-auto">
                    {/* Card with glass effect */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/20 to-white/30 rounded-3xl blur-xl"></div>
                      <div className="relative bg-white/10 backdrop-blur-md border-2 border-white/30 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl">
                        {/* Header with icon */}
                        <div className="flex items-center justify-center gap-3 mb-4 sm:mb-6">
                          <div className="p-2 bg-white/20 rounded-full">
                            <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                          </div>
                          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-bengali drop-shadow-lg">
                            সাহায্য প্রয়োজন?
                          </h3>
                        </div>
                        
                        {/* Description */}
                        <p className="text-white/90 text-center mb-6 sm:mb-8 font-bengali text-sm sm:text-base lg:text-lg leading-relaxed drop-shadow-md">
                          যেকোনো প্রশ্ন বা সমস্যার জন্য আমাদের সাথে যোগাযোগ করুন। আমরা সবসময় সাহায্য করতে প্রস্তুত!
                        </p>
                        
                        {/* Contact Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
                          {settings?.social_links?.whatsapp && (
                            <Button
                              asChild
                              size="lg"
                              className="bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#1da851] hover:to-[#0d7a5f] text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 font-bengali text-sm sm:text-base py-5 sm:py-6 rounded-xl font-semibold border-2 border-white/20"
                            >
                              <a
                                href={settings?.social_links?.whatsapp || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2"
                              >
                                <MessageCircle className="h-5 w-5" />
                                হোয়াটসঅ্যাপে যোগাযোগ করুন
                              </a>
                            </Button>
                          )}
                          {settings?.social_links?.facebook && (
                            <Button
                              asChild
                              size="lg"
                              className="bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#7C3AED] hover:to-[#5B21B6] text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 font-bengali text-sm sm:text-base py-5 sm:py-6 rounded-xl font-semibold border-2 border-white/20"
                            >
                              <a
                                href={settings?.social_links?.facebook || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2"
                              >
                                <Facebook className="h-5 w-5" />
                                ফেসবুকে মেসেজ করুন
                              </a>
                            </Button>
                          )}
                        </div>
                       </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="services" className="py-16 sm:py-20 scroll-mt-20">
        <div className="container mx-auto px-4">
          {/* Header with horizontal navigation */}
          <div className="bg-gradient-to-r from-primary/5 via-info/5 to-success/5 rounded-2xl p-6 mb-12 border border-primary/10">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-2">
                <Heart className="h-6 w-6 text-primary" />
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-info bg-clip-text text-transparent font-bengali">
                  আমাদের সেবাসমূহ
                </h2>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button variant="ghost" className="font-bengali hover:bg-primary/10">
                  সব
                </Button>
                <div className="h-4 w-px bg-border"></div>
                <Button variant="ghost" className="font-bengali hover:bg-primary/10">
                  মোবাইল সিস্টেম
                </Button>
                <div className="h-4 w-px bg-border"></div>
                <Button variant="ghost" className="font-bengali hover:bg-primary/10">
                  ব্যবসায়ী সিস্টেম
                </Button>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card className="text-center border-0 shadow-xl bg-gradient-to-br from-tier-basic/10 to-tier-basic/5 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <CardHeader className="pb-4">
                <div className="mx-auto mb-6 p-4 bg-gradient-to-br from-tier-basic to-tier-basic/80 rounded-full w-fit shadow-lg">
                  <Tv className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl sm:text-3xl bg-gradient-to-r from-tier-basic to-tier-basic/80 bg-clip-text text-transparent font-bengali">
                  মোবাইল ইউজার সিস্টেম
                </CardTitle>
                <CardDescription className="text-lg font-bengali">
                  বিভিন্ন টিভি শো এবং সিরিয়াল দেখুন
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-8">
                <div className="space-y-3">
                  {[
                    '• সকল টিভি শো অ্যাক্সেস',
                    '• উচ্চ মানের ভিডিও',
                    '• মোবাইল ফ্রেন্ডলি',
                    '• সাবস্ক্রিপশন ভিত্তিক'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center justify-center space-x-2 text-muted-foreground">
                      <div className="w-2 h-2 bg-tier-basic rounded-full"></div>
                      <span className="font-bengali">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-xl bg-gradient-to-br from-tier-business/10 to-tier-business/5 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <CardHeader className="pb-4">
                <div className="mx-auto mb-6 p-4 bg-gradient-to-br from-tier-business to-tier-business/80 rounded-full w-fit shadow-lg">
                  <Archive className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl sm:text-3xl bg-gradient-to-r from-tier-business to-tier-business/80 bg-clip-text text-transparent font-bengali">
                  ব্যবসায়ী সিস্টেম
                </CardTitle>
                <CardDescription className="text-lg font-bengali">
                  জিপ ফাইল এবং পাসওয়ার্ড ম্যানেজমেন্ট
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-8">
                <div className="space-y-3">
                  {[
                    '• সুরক্ষিত জিপ ফাইল অ্যাক্সেস',
                    '• পাসওয়ার্ড ম্যানেজমেন্ট',
                    '• ব্যবসায়িক ডকুমেন্ট',
                    '• মেয়াদ ভিত্তিক অ্যাক্সেস'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center justify-center space-x-2 text-muted-foreground">
                      <div className="w-2 h-2 bg-tier-business rounded-full"></div>
                      <span className="font-bengali">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-20 bg-gradient-to-r from-primary/5 via-info/5 to-success/5 scroll-mt-20">
        <div className="container mx-auto px-4">
          {/* Header with horizontal navigation */}
          <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-6 mb-12 border border-primary/10 shadow-lg">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-6 w-6 text-primary" />
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent font-bengali">
                  সাবস্ক্রিপশন প্ল্যান
                </h2>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button variant="ghost" className="font-bengali hover:bg-primary/10">
                  সব প্ল্যান
                </Button>
                <div className="h-4 w-px bg-border"></div>
                <Button variant="ghost" className="font-bengali hover:bg-primary/10">
                  ১ মাস
                </Button>
                <div className="h-4 w-px bg-border"></div>
                <Button variant="ghost" className="font-bengali hover:bg-primary/10">
                  ২ মাস
                </Button>
                <div className="h-4 w-px bg-border"></div>
                <Button variant="ghost" className="font-bengali hover:bg-primary/10">
                  ৩ মাস
                </Button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="text-center border-0 shadow-xl bg-gradient-to-br from-primary/10 to-primary/5 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <CardHeader className="pb-6">
                <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-primary to-primary/80 rounded-full w-fit">
                  <span className="text-white font-bold text-lg">১</span>
                </div>
                <CardTitle className="text-xl sm:text-2xl font-bengali">১ মাসের প্ল্যান</CardTitle>
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent font-bengali">
                  ২০০ টাকা
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-bengali">মাসিক সাবস্ক্রিপশন</p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-2xl bg-gradient-to-br from-tier-premium/20 to-tier-premium/10 relative transform scale-105 hover:scale-110 transition-all duration-300">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-tier-premium to-tier-premium/80 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center space-x-1">
                  <Star className="h-4 w-4" />
                  <span className="font-bengali">জনপ্রিয়</span>
                </span>
              </div>
              <CardHeader className="pb-6 pt-8">
                <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-tier-premium to-tier-premium/80 rounded-full w-fit">
                  <span className="text-white font-bold text-lg">২</span>
                </div>
                <CardTitle className="text-xl sm:text-2xl font-bengali">২ মাসের প্ল্যান</CardTitle>
                <div className="text-4xl font-bold bg-gradient-to-r from-tier-premium to-tier-premium/80 bg-clip-text text-transparent font-bengali">
                  ৪০০ টাকা
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-bengali">দুই মাসের সাবস্ক্রিপশন</p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-xl bg-gradient-to-br from-success/10 to-success/5 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <CardHeader className="pb-6">
                <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-success to-success/80 rounded-full w-fit">
                  <span className="text-white font-bold text-lg">৩</span>
                </div>
                <CardTitle className="text-xl sm:text-2xl font-bengali">৩ মাসের প্ল্যান</CardTitle>
                <div className="text-4xl font-bold bg-gradient-to-r from-success to-success/80 bg-clip-text text-transparent font-bengali">
                  ৫০০ টাকা
                </div>
                <div className="text-sm text-destructive line-through font-semibold font-bengali">৬০০ টাকা</div>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-success/20 to-success/10 rounded-lg p-2 mb-2">
                  <p className="text-sm font-semibold text-success font-bengali">সেরা সাশ্রয় - ১০০ টাকা ছাড়</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How to Get Started Section */}
      <section id="how-to-start" className="py-16 sm:py-20 bg-gradient-to-br from-background via-info/5 to-success/5 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary via-info to-success bg-clip-text text-transparent mb-4 font-bengali">
              কিভাবে শুরু করবেন?
            </h2>
            <p className="text-muted-foreground text-lg font-bengali">
              মাত্র তিনটি সহজ ধাপে আপনার যাত্রা শুরু করুন
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary to-info rounded-bl-3xl flex items-start justify-end p-2">
                <span className="text-white font-bold text-2xl">১</span>
              </div>
              <CardHeader className="pt-12">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-info/20 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl text-center font-bengali">অ্যাকাউন্ট তৈরি করুন</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground font-bengali">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>"শুরু করুন" বোতামে ক্লিক করুন</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>মোবাইল নম্বর এবং পাসওয়ার্ড দিয়ে রেজিস্টার করুন</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>ইউজার টাইপ নির্বাচন করুন (মোবাইল/বিজনেস)</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-info">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-info to-success rounded-bl-3xl flex items-start justify-end p-2">
                <span className="text-white font-bold text-2xl">২</span>
              </div>
              <CardHeader className="pt-12">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-info/20 to-success/20 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <Star className="h-8 w-8 text-info" />
                </div>
                <CardTitle className="text-xl text-center font-bengali">সাবস্ক্রিপশন নিন</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground font-bengali">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-5 w-5 text-info mt-0.5 flex-shrink-0" />
                    <span>আপনার প্রয়োজন অনুযায়ী প্ল্যান বাছুন</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-5 w-5 text-info mt-0.5 flex-shrink-0" />
                    <span>হোয়াটসঅ্যাপ বা ফেসবুকে যোগাযোগ করুন</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-5 w-5 text-info mt-0.5 flex-shrink-0" />
                    <span>পেমেন্ট সম্পন্ন করুন এবং অ্যাক্টিভেশনের জন্য অপেক্ষা করুন</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-success">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-success to-primary rounded-bl-3xl flex items-start justify-end p-2">
                <span className="text-white font-bold text-2xl">৩</span>
              </div>
              <CardHeader className="pt-12">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-success/20 to-primary/20 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <Sparkles className="h-8 w-8 text-success" />
                </div>
                <CardTitle className="text-xl text-center font-bengali">সেবা উপভোগ করুন</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground font-bengali">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span>ড্যাশবোর্ডে লগইন করুন</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span>ড্রাইভ ফাইল অ্যাক্সেস বা টিভি দেখুন</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span>জিপ পাসওয়ার্ড এবং অন্যান্য সেবা ব্যবহার করুন</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Additional Help - Contact Us */}
          <div className="mt-16 text-center">
            <div className="max-w-3xl mx-auto">
              {/* Gradient Border Card */}
              <div className="relative bg-gradient-to-r from-primary via-info to-success p-1 rounded-3xl shadow-2xl">
                <Card className="bg-background/95 backdrop-blur-sm border-0 rounded-[22px]">
                  <CardContent className="p-8 sm:p-12">
                    {/* Title with Icon */}
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-br from-primary/20 to-info/20 rounded-full">
                        <MessageCircle className="h-7 w-7 text-primary" />
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary via-info to-success bg-clip-text text-transparent font-bengali">
                        সাহায্য প্রয়োজন?
                      </h3>
                    </div>
                    
                    {/* Description */}
                    <p className="text-muted-foreground text-base sm:text-lg mb-8 font-bengali leading-relaxed">
                      যেকোনো প্রশ্ন বা সমস্যার জন্য আমাদের সাথে যোগাযোগ করুন। আমরা সবসময় সাহায্য করতে প্রস্তুত!
                    </p>
                    
                    {/* Contact Buttons - Large Icons */}
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                      {settings?.social_links?.whatsapp && (
                        <a
                          href={settings.social_links.whatsapp}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex flex-col items-center gap-3 transition-all duration-300 transform hover:scale-110 w-full sm:w-auto"
                        >
                          <div className="relative">
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-success/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                            {/* Icon container */}
                            <div className="relative p-6 bg-gradient-to-br from-success to-success/80 hover:from-success/90 hover:to-success/70 rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300 border-2 border-success/20">
                              <MessageCircle className="h-12 w-12 text-white drop-shadow-lg" />
                            </div>
                          </div>
                          <span className="text-foreground text-base font-semibold group-hover:text-success transition-colors font-bengali">
                            হোয়াটসঅ্যাপে যোগাযোগ করুন
                          </span>
                        </a>
                      )}
                      
                      {settings?.social_links?.facebook && (
                        <a
                          href={settings.social_links.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex flex-col items-center gap-3 transition-all duration-300 transform hover:scale-110 w-full sm:w-auto"
                        >
                          <div className="relative">
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-primary/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                            {/* Icon container */}
                            <div className="relative p-6 bg-gradient-to-br from-primary to-info hover:from-primary/90 hover:to-info/90 rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300 border-2 border-primary/20">
                              <Facebook className="h-12 w-12 text-white drop-shadow-lg" />
                            </div>
                          </div>
                          <span className="text-foreground text-base font-semibold group-hover:text-primary transition-colors font-bengali">
                            ফেসবুকে মেসেজ করুন
                          </span>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-16 sm:py-20 scroll-mt-20">
        <div className="container mx-auto px-4">
          {/* Header with horizontal navigation */}
          <div className="bg-gradient-to-r from-primary/5 via-info/5 to-success/5 rounded-2xl p-6 mb-12 border border-primary/10">
            <div className="flex flex-col items-center space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-info bg-clip-text text-transparent font-bengali">
                আমাদের পরিসংখ্যান
              </h2>
              
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button variant="ghost" className="font-bengali hover:bg-primary/10">
                  সব তথ্য
                </Button>
                <div className="h-4 w-px bg-border"></div>
                <Button variant="ghost" className="font-bengali hover:bg-primary/10">
                  গ্রাহক সংখ্যা
                </Button>
                <div className="h-4 w-px bg-border"></div>
                <Button variant="ghost" className="font-bengali hover:bg-primary/10">
                  কন্টেন্ট
                </Button>
                <div className="h-4 w-px bg-border"></div>
                <Button variant="ghost" className="font-bengali hover:bg-primary/10">
                  সেবার মান
                </Button>
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-success/10 to-success/5 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="p-4 bg-gradient-to-br from-success to-success/80 rounded-full">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                </div>
                <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-success to-success/80 bg-clip-text text-transparent mb-2 font-bengali">
                  ১০০০+
                </div>
                <p className="text-muted-foreground text-lg font-bengali">সন্তুষ্ট গ্রাহক</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-xl bg-gradient-to-br from-tier-basic/10 to-tier-basic/5 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="p-4 bg-gradient-to-br from-tier-basic to-tier-basic/80 rounded-full">
                    <Tv className="h-10 w-10 text-white" />
                  </div>
                </div>
                <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-tier-basic to-tier-basic/80 bg-clip-text text-transparent mb-2 font-bengali">
                  ৫০০+
                </div>
                <p className="text-muted-foreground text-lg font-bengali">টিভি শো</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-xl bg-gradient-to-br from-warning/10 to-warning/5 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="p-4 bg-gradient-to-br from-warning to-warning/80 rounded-full">
                    <Star className="h-10 w-10 text-white" />
                  </div>
                </div>
                <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-warning to-warning/80 bg-clip-text text-transparent mb-2 font-bengali">
                  ৯৯%
                </div>
                <p className="text-muted-foreground text-lg font-bengali">আপটাইম</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gradient-to-r from-primary/10 via-info/10 to-success/10 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center space-y-6">
            {/* Logo and Name */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-3">
              <div className="p-3 bg-gradient-to-br from-primary to-info rounded-full">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
                BTSPRO24.COM
              </span>
            </div>


            {/* Copyright */}
            <p className="text-muted-foreground font-bengali text-center">
              © ২০২৪ BTSPRO24.COM। সকল অধিকার সংরক্ষিত।
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;