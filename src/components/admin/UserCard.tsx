import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Smartphone, Briefcase, CreditCard, RefreshCw, X, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserCardProps {
  user: any;
  isSelected: boolean;
  onToggleSelect: () => void;
  onToggleUserType: (userId: string, currentType: string) => void;
  onCancelSubscription: (userId: string) => void;
  onDeleteUser: (userId: string, displayName: string) => void;
  onCreateSubscription: (userId: string) => void;
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  selectedPlan: string;
  setSelectedPlan: (plan: string) => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  priceTaka: string;
  setPriceTaka: (price: string) => void;
  useCustomDate: boolean;
  setUseCustomDate: (use: boolean) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  predefinedPlans: Array<{ id: string; name: string; months: number; price: number }>;
}

export const UserCard = ({
  user,
  isSelected,
  onToggleSelect,
  onToggleUserType,
  onCancelSubscription,
  onDeleteUser,
  onCreateSubscription,
  dialogOpen,
  setDialogOpen,
  selectedPlan,
  setSelectedPlan,
  paymentMethod,
  setPaymentMethod,
  priceTaka,
  setPriceTaka,
  useCustomDate,
  setUseCustomDate,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  predefinedPlans
}: UserCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with checkbox and avatar */}
          <div className="flex items-start gap-3">
            <Checkbox 
              checked={isSelected}
              onCheckedChange={onToggleSelect}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-primary">
                    {user.display_name?.charAt(0)?.toUpperCase() || user.mobile_number?.charAt(0) || '?'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate font-bengali">{user.display_name || '-'}</p>
                  <p className="text-sm text-muted-foreground font-mono">{user.mobile_number || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Type Badge */}
          <div className="flex items-center gap-2">
            <Badge 
              variant={user.user_type === 'business' ? 'default' : 'secondary'}
              className="font-medium font-bengali"
            >
              {user.user_type === 'business' ? (
                <><Briefcase className="h-3 w-3 mr-1" /> বিজনেস</>
              ) : (
                <><Smartphone className="h-3 w-3 mr-1" /> মোবাইল</>
              )}
            </Badge>
            <span className="text-xs text-muted-foreground font-bengali">
              {new Date(user.created_at).toLocaleDateString('bn-BD')}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="w-full gap-2 font-bengali"
                  onClick={() => setDialogOpen(true)}
                >
                  <CreditCard className="h-4 w-4" />
                  সাবস্ক্রিপশন
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-bengali">সাবস্ক্রিপশন তৈরি করুন</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="font-bengali">ইউজার</Label>
                    <Input value={user.mobile_number || ''} disabled className="font-bengali" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bengali">প্ল্যান নির্বাচন করুন</Label>
                    <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                      <SelectTrigger>
                        <SelectValue placeholder="প্ল্যান নির্বাচন করুন" className="font-bengali" />
                      </SelectTrigger>
                      <SelectContent>
                        {predefinedPlans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id} className="font-bengali">
                            {plan.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bengali">পেমেন্ট মেথড</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="পেমেন্ট মেথড নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bkash">📱 বিকাশ (bKash)</SelectItem>
                        <SelectItem value="nagad">💳 নগদ (Nagad)</SelectItem>
                        <SelectItem value="rocket">🚀 রকেট (Rocket)</SelectItem>
                        <SelectItem value="upi">🇮🇳 UPI (India)</SelectItem>
                        <SelectItem value="bank">🏦 ব্যাংক ট্রান্সফার</SelectItem>
                        <SelectItem value="cash">💵 ক্যাশ (Cash)</SelectItem>
                        <SelectItem value="free">🎁 ফ্রি (Promo)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bengali">প্রদত্ত টাকার পরিমাণ (ঐচ্ছিক)</Label>
                    <Input 
                      type="number"
                      placeholder={selectedPlan && selectedPlan !== 'custom' ? `ডিফল্ট: ${predefinedPlans.find(p => p.id === selectedPlan)?.price || 0} টাকা` : 'মূল্য লিখুন'}
                      value={priceTaka}
                      onChange={(e) => setPriceTaka(e.target.value)}
                      className="font-bengali"
                    />
                    {selectedPlan !== 'custom' && (
                      <p className="text-xs text-muted-foreground font-bengali">
                        কাস্টম টাকা না দিলে প্ল্যানের ডিফল্ট মূল্য ব্যবহার হবে
                      </p>
                    )}
                  </div>
                  <Button onClick={() => onCreateSubscription(user.user_id)} className="w-full font-bengali">
                    তৈরি করুন
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onToggleUserType(user.user_id, user.user_type)}
              className="w-full gap-2 font-bengali"
            >
              <RefreshCw className="h-4 w-4" />
              টাইপ পরিবর্তন
            </Button>

            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => onCancelSubscription(user.user_id)}
              className="w-full gap-2 font-bengali"
            >
              <X className="h-4 w-4" />
              সাবস্ক্রিপশন বাতিল
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  size="sm" 
                  variant="destructive"
                  className="w-full gap-2 font-bengali"
                >
                  <Trash2 className="h-4 w-4" />
                  ডিলিট
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-bengali">ইউজার ডিলিট করবেন?</AlertDialogTitle>
                  <AlertDialogDescription className="font-bengali">
                    আপনি কি নিশ্চিত যে <strong>{user.display_name || user.mobile_number}</strong> কে ডিলিট করতে চান? 
                    এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না এবং ইউজারের সকল ডেটা মুছে যাবে।
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="font-bengali">বাতিল</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDeleteUser(user.user_id, user.display_name || user.mobile_number)}
                    className="bg-destructive hover:bg-destructive/90 font-bengali"
                  >
                    ডিলিট করুন
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
