import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, CreditCard } from 'lucide-react';

interface PaymentMethod {
  id: string;
  method_key: string;
  display_name: string;
  display_name_bangla: string;
  account_number: string | null;
  instructions: string | null;
  instructions_bangla: string | null;
  is_active: boolean;
  sort_order: number;
}

export const PaymentMethodsManager = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setMethods(data || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast({
        title: "লোড করতে ব্যর্থ",
        description: "পেমেন্ট মেথড লোড করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (id: string, field: keyof PaymentMethod, value: any) => {
    setMethods(methods.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const method of methods) {
        const { error } = await supabase
          .from('payment_methods')
          .update({
            display_name: method.display_name,
            display_name_bangla: method.display_name_bangla,
            account_number: method.account_number,
            instructions: method.instructions,
            instructions_bangla: method.instructions_bangla,
            is_active: method.is_active,
          })
          .eq('id', method.id);

        if (error) throw error;
      }

      toast({
        title: "সফল!",
        description: "পেমেন্ট মেথড আপডেট করা হয়েছে।",
      });
    } catch (error) {
      console.error('Error updating payment methods:', error);
      toast({
        title: "আপডেট ব্যর্থ",
        description: "পেমেন্ট মেথড আপডেট করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="font-bengali">পেমেন্ট মেথড ম্যানেজমেন্ট</CardTitle>
            <CardDescription className="font-bengali">
              পেমেন্ট মেথডের নাম্বার এবং তথ্য পরিবর্তন করুন
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {methods.map((method) => (
          <div key={method.id} className="p-4 sm:p-6 rounded-lg border bg-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b">
              <h3 className="text-base sm:text-lg font-semibold font-bengali">{method.display_name_bangla}</h3>
              <div className="flex items-center gap-2">
                <Label htmlFor={`active-${method.id}`} className="text-sm font-bengali">সক্রিয়</Label>
                <Switch
                  id={`active-${method.id}`}
                  checked={method.is_active}
                  onCheckedChange={(checked) => handleUpdate(method.id, 'is_active', checked)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`name-${method.id}`} className="font-bengali">ইংরেজি নাম</Label>
                <Input
                  id={`name-${method.id}`}
                  value={method.display_name}
                  onChange={(e) => handleUpdate(method.id, 'display_name', e.target.value)}
                  placeholder="bKash"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`name-bangla-${method.id}`} className="font-bengali">বাংলা নাম</Label>
                <Input
                  id={`name-bangla-${method.id}`}
                  value={method.display_name_bangla}
                  onChange={(e) => handleUpdate(method.id, 'display_name_bangla', e.target.value)}
                  placeholder="বিকাশ"
                  className="font-bengali"
                />
              </div>

              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor={`number-${method.id}`} className="font-bengali">
                  {method.method_key === 'upi' ? 'UPI আইডি' : 'অ্যাকাউন্ট নম্বর'}
                </Label>
                <Input
                  id={`number-${method.id}`}
                  value={method.account_number || ''}
                  onChange={(e) => handleUpdate(method.id, 'account_number', e.target.value)}
                  placeholder={method.method_key === 'upi' ? 'example@upi' : '01XXXXXXXXX'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`instructions-${method.id}`} className="font-bengali">নির্দেশনা (ইংরেজি)</Label>
                <Textarea
                  id={`instructions-${method.id}`}
                  value={method.instructions || ''}
                  onChange={(e) => handleUpdate(method.id, 'instructions', e.target.value)}
                  placeholder="Send Money or Cash In to the number"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`instructions-bangla-${method.id}`} className="font-bengali">নির্দেশনা (বাংলা)</Label>
                <Textarea
                  id={`instructions-bangla-${method.id}`}
                  value={method.instructions_bangla || ''}
                  onChange={(e) => handleUpdate(method.id, 'instructions_bangla', e.target.value)}
                  placeholder="নম্বরে সেন্ড মানি অথবা ক্যাশ ইন করুন"
                  className="font-bengali"
                  rows={2}
                />
              </div>
            </div>
          </div>
        ))}

        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full sm:w-auto gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              সংরক্ষণ করা হচ্ছে...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              সংরক্ষণ করুন
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
