import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Check, Calendar, Banknote } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'upi' | 'bank'>('bkash');
  const [lastDigits, setLastDigits] = useState('');

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
    try {
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

      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + paymentDialog.months);

      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_months: paymentDialog.months,
          price_taka: paymentDialog.price,
          end_date: endDate.toISOString(),
          payment_method: paymentMethod,
          payment_last_digits: lastDigits,
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

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = hasActiveSubscription && currentPlanMonths === plan.months;
          const isDisabled = hasActiveSubscription || hasPendingSubscription;

          return (
            <Card 
              key={plan.id} 
              className={`relative transition-all duration-300 hover:shadow-2xl overflow-hidden border-0 ${
                isCurrentPlan ? 'ring-2 ring-primary shadow-2xl scale-105' : ''
              } ${
                plan.id === '1-month' ? 'bg-gradient-to-br from-slate-100/80 to-slate-50/50 dark:from-slate-900/40 dark:to-slate-800/20' :
                plan.id === '2-month' ? 'bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20' :
                'bg-gradient-to-br from-accent/20 to-accent/10 dark:from-accent/30 dark:to-accent/20'
              }`}
            >
              {plan.id === '2-month' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                  <Badge className="bg-primary text-white px-4 py-1.5 rounded-full shadow-xl text-sm font-bold font-bengali">
                    ⭐ জনপ্রিয়
                  </Badge>
                </div>
              )}
              
              {plan.discount && (
                <div className="absolute top-4 right-4 z-20">
                  <Badge variant="destructive" className="px-3 py-1 rounded-full shadow-lg text-xs font-bold font-bengali">
                    {plan.discount}
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center relative z-10 pt-8 sm:pt-10 pb-4 sm:pb-6 px-3 sm:px-6">
                <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                  {/* Icon Circle */}
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-lg ${
                    plan.id === '1-month' ? 'bg-slate-600 dark:bg-slate-500' :
                    plan.id === '2-month' ? 'bg-primary' :
                    'bg-accent'
                  }`}>
                    <Calendar className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                  </div>

                  {/* Plan Duration */}
                  <CardTitle className={`text-xl sm:text-2xl font-bold font-bengali ${
                    plan.id === '1-month' ? 'text-slate-700 dark:text-slate-300' :
                    plan.id === '2-month' ? 'text-primary' :
                    'text-accent'
                  }`}>
                    {plan.name}
                  </CardTitle>

                  {/* Price */}
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-center space-x-1.5">
                      <span className={`text-4xl sm:text-5xl font-bold font-bengali ${
                        plan.id === '1-month' ? 'text-destructive' :
                        plan.id === '2-month' ? 'text-primary' :
                        'text-accent'
                      }`}>
                        {plan.price}
                      </span>
                      <span className={`text-lg sm:text-xl font-semibold font-bengali ${
                        plan.id === '1-month' ? 'text-destructive' :
                        plan.id === '2-month' ? 'text-primary' :
                        'text-accent'
                      }`}>
                        টাকা
                      </span>
                    </div>
                    {plan.originalPrice && plan.originalPrice !== plan.price && (
                      <div className="text-base text-muted-foreground line-through font-bengali">
                        {plan.originalPrice} টাকা
                      </div>
                    )}
                    {plan.discount && (
                      <div className="text-sm text-red-600 dark:text-red-400 font-semibold font-bengali">
                        ১০০ টাকা ছাড়
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <CardDescription className="text-base font-medium font-bengali text-foreground/80">
                    {plan.description === 'মাসিক সাবস্ক্রিপশন' ? 'মাসিক সাবস্ক্রিপশন' :
                     plan.description === 'জনপ্রিয় প্ল্যান' ? 'দুই মাসের সাবস্ক্রিপশন' :
                     'মাসিক সাবস্ক্রিপশন'}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 sm:space-y-4 relative z-10 px-3 sm:px-4 pb-4 sm:pb-6">
                <Button 
                  onClick={() => handleSubscribeClick(plan.id, plan.months, plan.price)}
                  disabled={isDisabled}
                  className={`w-full h-12 sm:h-14 text-sm sm:text-base font-bold font-bengali rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg ${
                    isCurrentPlan ? 
                      'bg-success hover:bg-success/90' :
                    !isDisabled ?
                      plan.id === '1-month' ? 'bg-purple-500 hover:bg-purple-600 text-white dark:bg-purple-600 dark:hover:bg-purple-700' :
                      plan.id === '2-month' ? 'bg-primary hover:bg-primary/90 text-white' :
                      'bg-teal-500 hover:bg-teal-600 text-white dark:bg-teal-600 dark:hover:bg-teal-700' :
                      'bg-muted/50'
                  }`}
                >
                  {isCurrentPlan ? (
                    <span className="font-bengali">সক্রিয় প্ল্যান</span>
                  ) : hasPendingSubscription ? (
                    <span className="font-bengali">পেন্ডিং অনুমোদন</span>
                  ) : hasActiveSubscription ? (
                    <span className="font-bengali">ইতিমধ্যে সাবস্ক্রাইব করা</span>
                  ) : (
                    <span className="font-bengali">
                      {plan.discount ? 'মেগা অফার - ১০০ টাকা ছাড়' : `নিয়ে নিন - ${plan.price} টাকা`}
                    </span>
                  )}
                </Button>

                {isCurrentPlan && (
                  <div className="text-center mt-4">
                    <Badge variant="default" className="bg-success text-success-foreground px-6 py-2 rounded-full font-bengali font-semibold">
                      ✨ সক্রিয় প্ল্যান
                    </Badge>
                  </div>
                )}
                
                {hasPendingSubscription && currentPlanMonths === plan.months && (
                  <div className="text-center mt-4">
                    <Badge variant="secondary" className="bg-warning text-warning-foreground px-6 py-2 rounded-full font-bengali font-semibold">
                      ⏳ অনুমোদনের অপেক্ষায়
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Enhanced Payment Modal */}
      <Dialog open={paymentDialog.isOpen} onOpenChange={(open) => !open && setPaymentDialog({ isOpen: false })}>
        <DialogContent className="sm:max-w-xl card-gradient max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center space-x-2 font-bengali">
              <div className="p-2 rounded-lg gradient-primary">
                <Banknote className="h-5 w-5 text-white" />
              </div>
              <span>💳 পেমেন্ট তথ্য</span>
            </DialogTitle>
            <DialogDescription className="text-base font-bengali">
              পেমেন্ট সম্পূর্ণ করতে নিচের নির্দেশনা অনুসরণ করুন
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Payment Instructions - Different for UPI vs Bangladesh methods */}
            {paymentMethod === 'upi' ? (
              <div className="p-4 bg-gradient-to-br from-orange-500/90 to-orange-600/90 rounded-xl border border-orange-400/30">
                <h3 className="font-semibold text-white text-lg mb-3 flex items-center space-x-2">
                  <span>🇮🇳</span>
                  <span>UPI Payment Instructions:</span>
                </h3>
                <div className="space-y-3 text-white/90 text-sm">
                  <p>1. Send payment to our UPI ID:</p>
                  <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg border border-white/20">
                    <span className="font-bold text-xl text-green-300">example@upi</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText('example@upi');
                        toast({ title: "Copied!", description: "UPI ID copied to clipboard" });
                      }}
                      className="h-8 px-3 bg-white/20 text-white border-white/30 hover:bg-white/30"
                    >
                      📋 Copy
                    </Button>
                  </div>
                  <div className="p-3 bg-white/10 rounded-lg">
                    <p className="text-yellow-200 font-semibold">
                      💰 Amount: ₹{paymentDialog.price ? Math.round(paymentDialog.price * 1.2) : 0} INR
                    </p>
                    <p className="text-xs text-white/70 mt-1">(Approx. conversion from BDT)</p>
                  </div>
                  <p>2. After payment, enter the last 4 digits of your UPI transaction ID</p>
                  <div className="p-3 bg-green-500/20 rounded-lg border border-green-300/30">
                    <p className="text-green-100 text-sm">
                      <strong>✅ Supported Apps:</strong> Google Pay, PhonePe, Paytm, BHIM, Amazon Pay
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 gradient-secondary rounded-xl border border-primary/20">
                <h3 className="font-semibold text-white text-lg mb-3 flex items-center space-x-2 font-bengali">
                  <span>📋</span>
                  <span>পেমেন্ট নির্দেশনা:</span>
                </h3>
                <div className="space-y-3 text-white/90 text-sm font-bengali">
                  <p>১. নিচের নম্বরে <strong className="text-yellow-300">সেন্ড মানি</strong> অথবা <strong className="text-yellow-300">ক্যাশ ইন</strong> করুন:</p>
                  <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg border border-white/20">
                    <span className="font-bold text-xl text-green-300">📱 01637792810</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText('01637792810');
                        toast({ title: "কপি হয়েছে!", description: "নম্বর কপি করা হয়েছে" });
                      }}
                      className="h-8 px-3 bg-white/20 text-white border-white/30 hover:bg-white/30"
                    >
                      📋 কপি
                    </Button>
                  </div>
                  <p>২. টাকা পাঠানোর পর শেষ ৪ সংখ্যা নিচে লিখুন</p>
                  <div className="p-3 bg-orange-500/20 rounded-lg border border-orange-300/30">
                    <p className="text-orange-100 text-sm">
                      <strong>⚠️ দ্রষ্টব্য:</strong> পেমেন্ট <strong className="text-yellow-300">পারসোনাল নম্বর</strong> হিসেবে করুন (এজেন্ট নয়)
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold mb-2 block font-bengali">💰 পেমেন্ট মেথড</Label>
                <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)} className="space-y-2">
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="bkash" id="bkash" />
                    <Label htmlFor="bkash" className="text-base font-medium cursor-pointer flex-1 font-bengali">
                      📱 বিকাশ (bKash)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="nagad" id="nagad" />
                    <Label htmlFor="nagad" className="text-base font-medium cursor-pointer flex-1 font-bengali">
                      💳 নগদ (Nagad)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="rocket" id="rocket" />
                    <Label htmlFor="rocket" className="text-base font-medium cursor-pointer flex-1 font-bengali">
                      🚀 রকেট (Rocket)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi" className="text-base font-medium cursor-pointer flex-1 font-bengali">
                      🇮🇳 UPI (India)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="bank" id="bank" />
                    <Label htmlFor="bank" className="text-base font-medium cursor-pointer flex-1 font-bengali">
                      🏦 ব্যাংক ট্রান্সফার
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <Label htmlFor="lastDigits" className="text-base font-semibold mb-2 block font-bengali">
                  {paymentMethod === 'upi' ? '🔢 Last 4 digits of Transaction ID' : '🔢 শেষ ৪টি ডিজিট'}
                </Label>
                <Input
                  id="lastDigits"
                  type="text"
                  placeholder={paymentMethod === 'upi' ? 'e.g., 1234' : 'যেমন: 1234'}
                  value={lastDigits}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setLastDigits(value);
                  }}
                  maxLength={4}
                  className="text-center text-xl h-12 font-bold bg-muted/50 border-2"
                />
                <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted/30 rounded-lg font-bengali">
                  {paymentMethod === 'upi' 
                    ? '💡 Enter the last 4 digits of your UPI transaction reference number'
                    : '💡 টাকা পাঠানোর পর যে নম্বর থেকে টাকা পাঠিয়েছেন তার শেষ ৪টি সংখ্যা লিখুন'
                  }
                </p>
              </div>
              
              <div className="flex justify-end space-x-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setPaymentDialog({ isOpen: false })}
                  disabled={loading}
                  className="px-6 py-2 font-bengali"
                >
                  ❌ বাতিল
                </Button>
                <Button 
                  onClick={handlePaymentSubmit}
                  disabled={loading || lastDigits.length !== 4}
                  className="px-6 py-2 gradient-primary hover:shadow-lg font-bengali"
                >
                  {loading ? "⏳ জমা দিচ্ছি..." : "✅ জমা দিন"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionPlans;