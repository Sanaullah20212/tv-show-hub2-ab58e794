import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Banknote, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface PaymentMethod {
  id: string;
  method_key: string;
  display_name: string;
  display_name_bangla: string;
  account_number: string | null;
  instructions: string | null;
  instructions_bangla: string | null;
  is_active: boolean;
}

interface SubscriptionPlansProps {
  currentSubscription: any;
  onSubscriptionUpdate: () => void;
}

interface PaymentDialogState {
  isOpen: boolean;
  planId?: string;
  months?: number;
  price?: number;
}

export const SubscriptionPlans = ({ currentSubscription, onSubscriptionUpdate }: SubscriptionPlansProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState<PaymentDialogState>({ isOpen: false });
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [lastDigits, setLastDigits] = useState('');
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true});

      if (error) throw error;
      
      if (data && data.length > 0) {
        setPaymentMethods(data);
        setPaymentMethod(data[0].method_key); // Set first as default
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoadingMethods(false);
    }
  };

  const plans = [
    {
      id: '1-month',
      name: '১ মাসের প্ল্যান',
      months: 1,
      price: 200,
      description: 'মাসিক সাবস্ক্রিপশন',
      features: ['সব কন্টেন্ট অ্যাক্সেস', '২৪/৭ সাপোর্ট', 'মোবাইল অ্যাপ']
    },
    {
      id: '2-month',
      name: '২ মাসের প্ল্যান',
      months: 2,
      price: 400,
      originalPrice: 400,
      description: 'জনপ্রিয় প্ল্যান',
      features: ['সব কন্টেন্ট অ্যাক্সেস', '২৪/৭ সাপোর্ট', 'মোবাইল অ্যাপ', 'অগ্রাধিকার সাপোর্ট']
    },
    {
      id: '3-month',
      name: '৩ মাসের প্ল্যান',
      months: 3,
      price: 500,
      originalPrice: 600,
      discount: '১০০ টাকা ছাড়',
      description: 'সেরা সাশ্রয়',
      features: ['সব কন্টেন্ট অ্যাক্সেস', '২৪/৭ সাপোর্ট', 'মোবাইল অ্যাপ', 'অগ্রাধিকার সাপোর্ট', 'এক্সক্লুসিভ কন্টেন্ট']
    }
  ];

  const handleSubscribeClick = (planId: string, months: number, price: number) => {
    if (!user) {
      toast({
        title: "লগইন প্রয়োজন",
        description: "সাবস্ক্রিপশন নিতে প্রথমে লগইন করুন।",
        variant: "destructive"
      });
      return;
    }
    setPaymentDialog({ isOpen: true, planId, months, price });
  };

  const handlePaymentSubmit = async () => {
    if (!user || !paymentDialog.planId || !paymentDialog.months || !paymentDialog.price) {
      return;
    }

    if (lastDigits.length !== 4) {
      toast({
        title: "তথ্য অসম্পূর্ণ",
        description: "অনুগ্রহ করে পেমেন্ট নম্বরের শেষ ৪টি ডিজিট লিখুন।",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    let screenshotUrl: string | null = null;

    try {
      // Upload screenshot if provided
      if (screenshot) {
        setUploading(true);
        const fileExt = screenshot.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('payment-screenshots')
          .upload(fileName, screenshot);

        if (uploadError) {
          console.error('Screenshot upload error:', uploadError);
          toast({
            title: "স্ক্রিনশট আপলোড ব্যর্থ",
            description: "স্ক্রিনশট আপলোড করতে সমস্যা হয়েছে। তবে সাবস্ক্রিপশন জমা দেওয়া হবে।",
            variant: "destructive",
          });
        } else {
          screenshotUrl = fileName;
        }
        setUploading(false);
      }

      // Continue with existing logic
      // Check for existing active or pending subscriptions
      const { data: existingSubs, error: checkError } = await supabase
        .from('subscriptions')
        .select('id, status')
        .eq('user_id', user.id)
        .in('status', ['active', 'pending']);

      if (checkError) {
        console.error('Error checking subscriptions:', checkError);
        toast({
          title: "চেক করতে ব্যর্থ",
          description: "বিদ্যমান সাবস্ক্রিপশন চেক করতে সমস্যা হয়েছে।",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // If there's already an active or pending subscription, prevent duplicate
      if (existingSubs && existingSubs.length > 0) {
        toast({
          title: "ডুপ্লিকেট সাবস্ক্রিপশন",
          description: "আপনার ইতিমধ্যে একটি সক্রিয় বা পেন্ডিং সাবস্ক্রিপশন আছে।",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Calculate end date with Bangladesh timezone (11:59 PM BD time)
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + paymentDialog.months);
      // Set to 11:59 PM Bangladesh time (UTC+6), which is 17:59 UTC
      endDate.setUTCHours(17, 59, 59, 999);

      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_months: paymentDialog.months,
          price_taka: paymentDialog.price,
          end_date: endDate.toISOString(),
          payment_method: paymentMethod,
          payment_last_digits: lastDigits,
          payment_screenshot_url: screenshotUrl,
          status: 'pending',
        });

      if (error) {
        console.error('Error creating subscription:', error);
        toast({
          title: "সাবস্ক্রিপশন ব্যর্থ",
          description: "সাবস্ক্রিপশন তৈরি করতে সমস্যা হয়েছে।",
          variant: "destructive",
        });
      } else {
        toast({
          title: "সাবস্ক্রিপশন জমা দেওয়া হয়েছে",
          description: "আপনার সাবস্ক্রিপশন অনুমোদনের জন্য পেন্ডিং রয়েছে। এডমিন অনুমোদনের পর সক্রিয় হবে।",
        });
        setPaymentDialog({ isOpen: false });
        setLastDigits('');
        setScreenshot(null);
        onSubscriptionUpdate();
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "সাবস্ক্রিপশন ব্যর্থ",
        description: "একটি অপ্রত্যাশিত ত্রুটি ঘটেছে।",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const hasActiveSubscription = currentSubscription && currentSubscription.status === 'active' && new Date(currentSubscription.end_date) > new Date();
  const hasPendingSubscription = currentSubscription && currentSubscription.status === 'pending';
  const currentPlanMonths = currentSubscription?.plan_months;

  // Bengali numbers
  const bengaliNumbers = ['১', '২', '৩'];

  // Get current selected payment method details
  const currentPaymentMethodInfo = paymentMethods.find(m => m.method_key === paymentMethod);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold font-bengali text-foreground">
          সাবস্ক্রিপশন প্ল্যান
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground font-bengali">
          আপনার প্রয়োজন অনুযায়ী সেরা প্ল্যান বেছে নিন
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {plans.map((plan, index) => {
          const isCurrentPlan = hasActiveSubscription && currentPlanMonths === plan.months;
          const isDisabled = hasActiveSubscription || hasPendingSubscription;
          const isPopular = plan.id === '2-month';
          const hasDiscount = plan.originalPrice && plan.originalPrice !== plan.price;

          return (
            <div
              key={plan.id}
              className={`relative ${isPopular ? 'md:-mt-2' : ''}`}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                  <Badge className="bg-amber-500 hover:bg-amber-500 text-white px-4 py-1 rounded-full shadow-lg text-xs font-semibold font-bengali border-0">
                    ⭐ জনপ্রিয়
                  </Badge>
                </div>
              )}

              <Card 
                onClick={() => !isDisabled && handleSubscribeClick(plan.id, plan.months, plan.price)}
                className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                  isCurrentPlan ? 'ring-2 ring-success shadow-xl' : 'hover:shadow-xl'
                } ${
                  isPopular 
                    ? 'bg-gradient-to-b from-primary/15 to-primary/5 border-primary/30' 
                    : 'bg-card border-border/50'
                } ${isDisabled ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <CardContent className="pt-8 pb-6 px-4 sm:px-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    {/* Number Badge */}
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold ${
                      isPopular 
                        ? 'bg-amber-600 text-white' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {bengaliNumbers[index]}
                    </div>

                    {/* Plan Duration */}
                    <h3 className={`text-lg sm:text-xl font-bold font-bengali ${
                      isPopular ? 'text-primary' : 'text-foreground'
                    }`}>
                      {plan.months === 1 ? '১ মাস' : plan.months === 2 ? '২ মাস' : '৩ মাস'}
                    </h3>

                    {/* Price Section */}
                    <div className="space-y-1">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className={`text-3xl sm:text-4xl font-bold font-bengali ${
                          isPopular ? 'text-primary' : 'text-foreground'
                        }`}>
                          {plan.price === 200 ? '২০০' : plan.price === 400 ? '৪০০' : '৫০০'}
                        </span>
                        <span className={`text-base sm:text-lg font-medium font-bengali ${
                          isPopular ? 'text-primary' : 'text-foreground'
                        }`}>
                          টাকা
                        </span>
                      </div>
                      
                      {/* Original Price (crossed) */}
                      {hasDiscount && (
                        <p className="text-sm text-muted-foreground line-through font-bengali">
                          ৬০০ টাকা
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground font-bengali">
                      {plan.months === 1 ? 'মাসিক সাবস্ক্রিপশন' : 
                       plan.months === 2 ? 'দুই মাসের সাবস্ক্রিপশন' : 
                       'মাসিক সাবস্ক্রিপশন'}
                    </p>

                    {/* Savings Badge for 3-month */}
                    {hasDiscount && (
                      <Badge className="bg-success hover:bg-success text-success-foreground px-4 py-1.5 rounded-md text-xs font-semibold font-bengali border-0">
                        ১০০ টাকা সাশ্রয়!
                      </Badge>
                    )}

                    {/* Active/Pending Status */}
                    {isCurrentPlan && (
                      <Badge className="bg-success hover:bg-success text-success-foreground px-4 py-1.5 rounded-full text-xs font-semibold font-bengali border-0">
                        ✨ সক্রিয় প্ল্যান
                      </Badge>
                    )}
                    
                    {hasPendingSubscription && currentPlanMonths === plan.months && (
                      <Badge className="bg-warning hover:bg-warning text-warning-foreground px-4 py-1.5 rounded-full text-xs font-semibold font-bengali border-0">
                        ⏳ অনুমোদনের অপেক্ষায়
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Enhanced Payment Modal */}
      <Dialog open={paymentDialog.isOpen} onOpenChange={(open) => !open && setPaymentDialog({ isOpen: false })}>
        <DialogContent className="sm:max-w-xl card-gradient max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-xl flex items-center space-x-2 font-bengali">
              <div className="p-2 rounded-lg gradient-primary">
                <Banknote className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <span>💳 পেমেন্ট তথ্য</span>
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base font-bengali">
              পেমেন্ট সম্পূর্ণ করতে নিচের নির্দেশনা অনুসরণ করুন
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {loadingMethods ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Dynamic Payment Instructions */}
                {currentPaymentMethodInfo && (
                  <div 
                    className={`p-3 sm:p-4 rounded-xl border ${
                      currentPaymentMethodInfo.method_key === 'upi' 
                        ? 'bg-gradient-to-br from-orange-500/90 to-orange-600/90 border-orange-400/30'
                        : 'gradient-secondary border-primary/20'
                    }`}
                  >
                    <h3 className={`font-semibold text-white text-sm sm:text-base md:text-lg mb-2 sm:mb-3 flex items-center space-x-2 ${
                      currentPaymentMethodInfo.method_key === 'upi' ? '' : 'font-bengali'
                    }`}>
                      <span>📋</span>
                      <span>
                        {currentPaymentMethodInfo.method_key === 'upi' 
                          ? 'Payment Instructions:' 
                          : 'পেমেন্ট নির্দেশনা:'}
                      </span>
                    </h3>
                    
                    <div className={`space-y-2 sm:space-y-3 text-white/90 text-xs sm:text-sm ${
                      currentPaymentMethodInfo.method_key === 'upi' ? '' : 'font-bengali'
                    }`}>
                      <p>
                        {currentPaymentMethodInfo.method_key === 'upi' 
                          ? currentPaymentMethodInfo.instructions 
                          : currentPaymentMethodInfo.instructions_bangla}
                      </p>
                      
                      {currentPaymentMethodInfo.account_number && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2 sm:p-3 bg-white/10 rounded-lg border border-white/20">
                          <span className="font-bold text-base sm:text-lg md:text-xl text-green-300 break-all">
                            {currentPaymentMethodInfo.method_key === 'upi' 
                              ? currentPaymentMethodInfo.account_number 
                              : `📱 ${currentPaymentMethodInfo.account_number}`}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(currentPaymentMethodInfo.account_number || '');
                              toast({ 
                                title: currentPaymentMethodInfo.method_key === 'upi' ? "Copied!" : "কপি হয়েছে!", 
                                description: currentPaymentMethodInfo.method_key === 'upi' ? "UPI ID copied" : "নম্বর কপি করা হয়েছে" 
                              });
                            }}
                            className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm bg-white/20 text-white border-white/30 hover:bg-white/30 whitespace-nowrap"
                          >
                            📋 {currentPaymentMethodInfo.method_key === 'upi' ? 'Copy' : 'কপি'}
                          </Button>
                        </div>
                      )}

                      {currentPaymentMethodInfo.method_key === 'upi' && (
                        <>
                          <div className="p-2 sm:p-3 bg-white/10 rounded-lg">
                            <p className="text-yellow-200 font-semibold text-xs sm:text-sm">
                              💰 Amount: ₹{paymentDialog.price ? Math.round(paymentDialog.price * 1.2) : 0} INR
                            </p>
                            <p className="text-xs text-white/70 mt-1">(Approx. conversion from BDT)</p>
                          </div>
                          <p className="text-xs sm:text-sm">2. After payment, enter the last 4 digits of your UPI transaction ID</p>
                          <div className="p-2 sm:p-3 bg-green-500/20 rounded-lg border border-green-300/30">
                            <p className="text-green-100 text-xs sm:text-sm">
                              <strong>✅ Supported Apps:</strong> Google Pay, PhonePe, Paytm, BHIM, Amazon Pay
                            </p>
                          </div>
                        </>
                      )}
                      
                      {currentPaymentMethodInfo.method_key !== 'upi' && (
                        <>
                          <p className="text-xs sm:text-sm">২. টাকা পাঠানোর পর শেষ ৪ সংখ্যা নিচে লিখুন</p>
                          <div className="p-2 sm:p-3 bg-orange-500/20 rounded-lg border border-orange-300/30">
                            <p className="text-orange-100 text-xs sm:text-sm">
                              <strong>⚠️ গুরুত্বপূর্ণ:</strong> পেমেন্টের শেষ ৪ সংখ্যা সঠিকভাবে লিখুন।
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment Method Selection */}
                {paymentMethods.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm sm:text-base font-semibold font-bengali">💳 পেমেন্ট মাধ্যম নির্বাচন করুন</Label>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {paymentMethods.map((method) => (
                          <Label 
                            key={method.id}
                            htmlFor={method.method_key}
                            className={`flex items-center justify-center p-2 sm:p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              paymentMethod === method.method_key 
                                ? 'border-primary bg-primary/10' 
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <RadioGroupItem value={method.method_key} id={method.method_key} className="sr-only" />
                            <span className={`text-xs sm:text-sm font-bold truncate ${
                              method.method_key === 'upi' ? '' : 'font-bengali'
                            }`}>
                              {method.display_name_bangla}
                            </span>
                          </Label>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {/* Last 4 Digits Input */}
                <div className="space-y-2">
                  <Label htmlFor="lastDigits" className="text-sm sm:text-base font-semibold font-bengali">
                    {currentPaymentMethodInfo?.method_key === 'upi' ? '🔢 Last 4 digits' : '🔢 শেষ ৪টি ডিজিট'}
                  </Label>
                  <Input
                    id="lastDigits"
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={lastDigits}
                    onChange={(e) => setLastDigits(e.target.value.replace(/\D/g, ''))}
                    placeholder="1234"
                    className="text-center text-base sm:text-lg font-bold tracking-wider"
                  />
                </div>

                {/* Screenshot Upload (Optional) */}
                <div className="space-y-2">
                  <Label htmlFor="screenshot" className="text-sm sm:text-base font-semibold font-bengali flex items-center gap-2">
                    📸 পেমেন্ট স্ক্রিনশট 
                    <span className="text-xs text-muted-foreground font-normal">(ঐচ্ছিক)</span>
                  </Label>
                  <div className="space-y-2">
                    <Input
                      id="screenshot"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            toast({
                              title: "ফাইল বড়",
                              description: "স্ক্রিনশট ৫ MB এর কম হতে হবে।",
                              variant: "destructive",
                            });
                            e.target.value = '';
                            return;
                          }
                          setScreenshot(file);
                        }
                      }}
                      className="text-sm"
                    />
                    {screenshot && (
                      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg text-xs sm:text-sm">
                        <span className="text-green-600">✓</span>
                        <span className="flex-1 truncate font-bengali">{screenshot.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setScreenshot(null);
                            const input = document.getElementById('screenshot') as HTMLInputElement;
                            if (input) input.value = '';
                          }}
                          className="h-6 w-6 p-0"
                        >
                          ✕
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground font-bengali">
                      💡 পেমেন্টের প্রমাণ হিসেবে স্ক্রিনশট যুক্ত করুন (দ্রুত অনুমোদনের জন্য)
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <Button 
                  onClick={handlePaymentSubmit} 
                  disabled={loading || uploading || !lastDigits || lastDigits.length !== 4}
                  className="w-full gap-2 text-sm sm:text-base py-5 sm:py-6"
                >
                  {loading || uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                      <span className="font-bengali">
                        {uploading ? 'আপলোড হচ্ছে...' : 'প্রক্রিয়াকরণ...'}
                      </span>
                    </>
                  ) : (
                    <span className="font-bengali">✨ সাবস্ক্রিপশন জমা দিন</span>
                  )}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionPlans;
