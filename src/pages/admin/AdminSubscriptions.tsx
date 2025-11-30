import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, AlertCircle, Plus, Pause, Play, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

// Helper function to set end time to 11:59 PM Bangladesh Time (UTC+6)
const setEndTimeToBangladeshMidnight = (date: Date): Date => {
  // Create a new date at the end of the day in Bangladesh time (23:59:59)
  // Bangladesh is UTC+6, so 23:59 BD time = 17:59 UTC
  const bdDate = new Date(date);
  bdDate.setUTCHours(17, 59, 59, 999); // 23:59:59 in BD time
  return bdDate;
};

// Helper to format date in Bangladesh timezone
const formatBDDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString('bn-BD', { 
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const AdminSubscriptions = () => {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [useCustomDate, setUseCustomDate] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customAmount, setCustomAmount] = useState<string>('');

  const predefinedPlans = [
    { id: 'plan1', name: '১ মাস - ২০০ টাকা', months: 1, price: 200 },
    { id: 'plan2', name: '২ মাস - ৪০০ টাকা', months: 2, price: 400 },
    { id: 'plan3', name: '৩ মাস - ৫০০ টাকা', months: 3, price: 500 }
  ];

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      fetchSubscriptions();
      fetchUsers();
    }
  }, [user, profile]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, mobile_number, display_name')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      setDataLoading(true);
      
      // Fetch subscriptions
      const { data: subsData, error: subsError } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (subsError) throw subsError;

      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, mobile_number');

      if (profilesError) throw profilesError;

      // Create a map of user_id to mobile_number
      const profileMap = new Map(
        profilesData?.map(p => [p.user_id, p.mobile_number]) || []
      );

      // Merge data
      const mergedData = subsData?.map(sub => ({
        ...sub,
        profiles: { mobile_number: profileMap.get(sub.user_id) || 'N/A' }
      })) || [];

      setSubscriptions(mergedData);
    } catch (error) {
      console.error('Error:', error);
      toast.error('লোড করতে ব্যর্থ');
    } finally {
      setDataLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const sub = subscriptions.find(s => s.id === id);
      if (!sub) return;

      // First, cancel any existing active or pending subscriptions for this user
      const { error: cancelError } = await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', sub.user_id)
        .in('status', ['active', 'pending'])
        .neq('id', id);

      if (cancelError) {
        console.error('Error cancelling old subscriptions:', cancelError);
      }

      // Then approve the new subscription with Bangladesh timezone end date
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + sub.plan_months);
      const bdEndDate = setEndTimeToBangladeshMidnight(endDate);

      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'active', end_date: bdEndDate.toISOString() })
        .eq('id', id);

      if (error) throw error;
      toast.success('অনুমোদিত হয়েছে - শেষ তারিখ: রাত ১১:৫৯ পর্যন্ত');
      fetchSubscriptions();
    } catch (error) {
      console.error('Error:', error);
      toast.error('ব্যর্থ');
    }
  };

  // Pause subscription
  const handlePause = async (id: string) => {
    try {
      const sub = subscriptions.find(s => s.id === id);
      if (!sub || sub.status !== 'active') return;

      // Calculate remaining days
      const now = new Date();
      const endDate = new Date(sub.end_date);
      const remainingDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          is_paused: true, 
          paused_at: now.toISOString(),
          paused_days_remaining: remainingDays
        })
        .eq('id', id);

      if (error) throw error;
      toast.success(`সাবস্ক্রিপশন পজ করা হয়েছে (${remainingDays} দিন বাকি)`);
      fetchSubscriptions();
    } catch (error) {
      console.error('Error:', error);
      toast.error('পজ করতে ব্যর্থ');
    }
  };

  // Resume subscription
  const handleResume = async (id: string) => {
    try {
      const sub = subscriptions.find(s => s.id === id);
      if (!sub || !sub.is_paused) return;

      // Calculate new end date based on remaining days
      const newEndDate = new Date();
      newEndDate.setDate(newEndDate.getDate() + (sub.paused_days_remaining || 0));
      const bdEndDate = setEndTimeToBangladeshMidnight(newEndDate);

      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          is_paused: false, 
          paused_at: null,
          paused_days_remaining: null,
          end_date: bdEndDate.toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('সাবস্ক্রিপশন রিজিউম করা হয়েছে');
      fetchSubscriptions();
    } catch (error) {
      console.error('Error:', error);
      toast.error('রিজিউম করতে ব্যর্থ');
    }
  };

  // Upgrade subscription
  const handleUpgrade = async (newPlanId: string) => {
    if (!selectedSubscription) return;

    const newPlan = predefinedPlans.find(p => p.id === newPlanId);
    if (!newPlan) return;

    try {
      // Calculate remaining value from current subscription
      const now = new Date();
      const currentEnd = new Date(selectedSubscription.end_date);
      const remainingDays = Math.max(0, Math.ceil((currentEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      
      // Calculate new end date (remaining days + new plan months)
      const newEndDate = new Date();
      newEndDate.setMonth(newEndDate.getMonth() + newPlan.months);
      newEndDate.setDate(newEndDate.getDate() + remainingDays);
      const bdEndDate = setEndTimeToBangladeshMidnight(newEndDate);

      // Update current subscription
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({ 
          plan_months: newPlan.months,
          price_taka: newPlan.price,
          end_date: bdEndDate.toISOString(),
          upgraded_from: selectedSubscription.id
        })
        .eq('id', selectedSubscription.id);

      if (updateError) throw updateError;

      toast.success(`আপগ্রেড সফল! নতুন প্ল্যান: ${newPlan.months} মাস (+ ${remainingDays} দিন বোনাস)`);
      setUpgradeDialogOpen(false);
      setSelectedSubscription(null);
      fetchSubscriptions();
    } catch (error) {
      console.error('Error:', error);
      toast.error('আপগ্রেড করতে ব্যর্থ');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) throw error;
      toast.success('প্রত্যাখ্যাত হয়েছে');
      fetchSubscriptions();
    } catch (error) {
      console.error('Error:', error);
      toast.error('ব্যর্থ');
    }
  };

  const handleFixDuplicates = async () => {
    try {
      // Get all users with multiple active/pending subscriptions
      const { data: duplicateUsers, error: fetchError } = await supabase
        .from('subscriptions')
        .select('user_id, id, created_at, status')
        .in('status', ['active', 'pending'])
        .order('user_id')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      if (!duplicateUsers || duplicateUsers.length === 0) {
        toast.success('কোনো ডুপ্লিকেট নেই');
        return;
      }

      // Group by user_id and find duplicates
      const userGroups = duplicateUsers.reduce((acc, sub) => {
        if (!acc[sub.user_id]) {
          acc[sub.user_id] = [];
        }
        acc[sub.user_id].push(sub);
        return acc;
      }, {} as Record<string, any[]>);

      let cancelledCount = 0;

      // For each user with multiple subscriptions
      for (const userId in userGroups) {
        const subs = userGroups[userId];
        if (subs.length > 1) {
          // Keep the first one (most recent due to ordering), cancel the rest
          const toCancel = subs.slice(1).map(s => s.id);
          
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({ status: 'cancelled' })
            .in('id', toCancel);

          if (updateError) {
            console.error('Error cancelling duplicates:', updateError);
          } else {
            cancelledCount += toCancel.length;
          }
        }
      }

      toast.success(`${cancelledCount}টি ডুপ্লিকেট সাবস্ক্রিপশন ক্যানসেল করা হয়েছে`);
      fetchSubscriptions();
    } catch (error) {
      console.error('Error fixing duplicates:', error);
      toast.error('ডুপ্লিকেট ফিক্স করতে ব্যর্থ');
    }
  };

  const handleCreateSubscription = async () => {
    if (!selectedUserId || !selectedPlan || !paymentMethod) {
      toast.error('সব তথ্য পূরণ করুন');
      return;
    }

    if (useCustomDate && (!startDate || !endDate)) {
      toast.error('তারিখ সিলেক্ট করুন');
      return;
    }

    const plan = predefinedPlans.find(p => p.id === selectedPlan);
    if (!plan) return;

    try {
      // Check for existing active/pending subscriptions
      const { data: existingSubs, error: checkError } = await supabase
        .from('subscriptions')
        .select('id, status')
        .eq('user_id', selectedUserId)
        .in('status', ['active', 'pending']);

      if (checkError) throw checkError;

      // Cancel old subscriptions if any exist
      if (existingSubs && existingSubs.length > 0) {
        const idsToCancel = existingSubs.map(s => s.id);
        await supabase
          .from('subscriptions')
          .update({ status: 'cancelled' })
          .in('id', idsToCancel);
      }

      let subscriptionStartDate = new Date();
      let subscriptionEndDate = new Date();

      if (useCustomDate) {
        subscriptionStartDate = new Date(startDate);
        subscriptionEndDate = setEndTimeToBangladeshMidnight(new Date(endDate));
      } else {
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + plan.months);
        subscriptionEndDate = setEndTimeToBangladeshMidnight(subscriptionEndDate);
      }

      // Use custom amount if provided, otherwise use plan price
      const actualPrice = customAmount ? parseInt(customAmount, 10) : plan.price;

      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: selectedUserId,
          plan_months: plan.months,
          price_taka: actualPrice,
          payment_method: paymentMethod,
          status: 'active' as const,
          start_date: subscriptionStartDate.toISOString(),
          end_date: subscriptionEndDate.toISOString()
        });

      if (error) throw error;

      toast.success(`সাবস্ক্রিপশন সফলভাবে তৈরি হয়েছে (${actualPrice} টাকা)`);
      setDialogOpen(false);
      setSelectedUserId('');
      setSelectedPlan('');
      setPaymentMethod('');
      setUseCustomDate(false);
      setStartDate('');
      setEndDate('');
      setCustomAmount('');
      fetchSubscriptions();
    } catch (error) {
      console.error('Error:', error);
      toast.error('সাবস্ক্রিপশন তৈরি করতে ব্যর্থ');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || profile?.role !== 'admin') {
    return <Navigate to="/auth" replace />;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const pending = subscriptions.filter(s => s.status === 'pending');
  const active = subscriptions.filter(s => s.status === 'active');
  const expired = subscriptions.filter(s => s.status === 'expired');

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar onSignOut={handleSignOut} />
        
        <div className="flex-1 flex flex-col">
          <header className="h-14 sm:h-16 border-b bg-card/50 backdrop-blur flex items-center justify-between px-3 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-4">
              <SidebarTrigger />
              <h1 className="text-lg sm:text-2xl font-bold font-bengali truncate">সাবস্ক্রিপশন ম্যানেজমেন্ট</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Button 
                variant="outline" 
                onClick={handleFixDuplicates}
                className="hidden sm:flex"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                ডুপ্লিকেট ফিক্স করুন
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    যোগ করুন
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-bengali">নতুন সাবস্ক্রিপশন তৈরি করুন</DialogTitle>
                  </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>ইউজার নির্বাচন করুন</Label>
                        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                          <SelectTrigger>
                            <SelectValue placeholder="ইউজার নির্বাচন করুন" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map((u) => (
                              <SelectItem key={u.user_id} value={u.user_id}>
                                {u.mobile_number} - {u.display_name || 'নাম নেই'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>প্ল্যান নির্বাচন করুন</Label>
                        <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                          <SelectTrigger>
                            <SelectValue placeholder="প্ল্যান নির্বাচন করুন" />
                          </SelectTrigger>
                          <SelectContent>
                            {predefinedPlans.map((plan) => (
                              <SelectItem key={plan.id} value={plan.id}>
                                {plan.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>পেমেন্ট মেথড</Label>
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
                        <Label>প্রদত্ত টাকার পরিমাণ (ঐচ্ছিক)</Label>
                        <Input 
                          type="number"
                          placeholder={selectedPlan ? `ডিফল্ট: ${predefinedPlans.find(p => p.id === selectedPlan)?.price || 0} টাকা` : 'প্ল্যান সিলেক্ট করুন'}
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          কাস্টম টাকা না দিলে প্ল্যানের ডিফল্ট মূল্য ব্যবহার হবে
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="admin-custom-date" 
                          checked={useCustomDate}
                          onCheckedChange={(checked) => setUseCustomDate(checked as boolean)}
                        />
                        <Label htmlFor="admin-custom-date">কাস্টম তারিখ ব্যবহার করুন</Label>
                      </div>
                      {useCustomDate && (
                        <>
                          <div className="space-y-2">
                            <Label>শুরুর তারিখ</Label>
                            <Input 
                              type="date"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>শেষ তারিখ</Label>
                            <Input 
                              type="date"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                            />
                          </div>
                        </>
                      )}
                      <Button onClick={handleCreateSubscription} className="w-full">
                        সাবস্ক্রিপশন তৈরি করুন
                      </Button>
                    </div>
                </DialogContent>
              </Dialog>
              <ThemeToggle />
            </div>
          </header>

          <main className="flex-1 p-3 sm:p-6 overflow-auto">
            <div className="space-y-4 sm:space-y-6">
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium font-bengali">পেন্ডিং</CardTitle>
                    <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-orange-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{pending.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">অপেক্ষমান</p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium font-bengali">সক্রিয়</CardTitle>
                    <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{active.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">চলমান সাবস্ক্রিপশন</p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium font-bengali">মেয়াদ শেষ</CardTitle>
                    <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                      <XCircle className="h-5 w-5 text-red-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{expired.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">শেষ হয়েছে</p>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="pending">
                <TabsList>
                  <TabsTrigger value="pending">পেন্ডিং ({pending.length})</TabsTrigger>
                  <TabsTrigger value="active">সক্রিয় ({active.length})</TabsTrigger>
                  <TabsTrigger value="all">সব ({subscriptions.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="pending">
                  <Card>
                    <CardContent className="pt-6">
                      {dataLoading ? (
                        <div className="space-y-3">
                          {[1,2,3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
                        </div>
                      ) : pending.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground font-bengali">কোনো পেন্ডিং নেই</p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ইউজার</TableHead>
                              <TableHead>প্ল্যান</TableHead>
                              <TableHead>মূল্য</TableHead>
                              <TableHead>পেমেন্ট</TableHead>
                              <TableHead className="text-right">অ্যাকশন</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pending.map((s) => (
                              <TableRow key={s.id}>
                                <TableCell>{s.profiles?.mobile_number}</TableCell>
                                <TableCell>{s.plan_months} মাস</TableCell>
                                <TableCell>{s.price_taka} ৳</TableCell>
                                <TableCell>{s.payment_method}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button size="sm" variant="outline" onClick={() => handleApprove(s.id)}>
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => handleReject(s.id)}>
                                      <XCircle className="h-4 w-4 text-red-600" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="active">
                  <Card>
                    <CardContent className="pt-6">
                      {active.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground font-bengali">কোনো সক্রিয় সাবস্ক্রিপশন নেই</p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ইউজার</TableHead>
                              <TableHead>প্ল্যান</TableHead>
                              <TableHead>শেষ তারিখ</TableHead>
                              <TableHead>স্ট্যাটাস</TableHead>
                              <TableHead className="text-right">অ্যাকশন</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {active.map((s) => (
                              <TableRow key={s.id}>
                                <TableCell>{s.profiles?.mobile_number}</TableCell>
                                <TableCell>{s.plan_months} মাস</TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    {formatBDDate(s.end_date)}
                                    <span className="text-muted-foreground text-xs block">
                                      (রাত ১১:৫৯ পর্যন্ত)
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {s.is_paused ? (
                                    <Badge variant="outline" className="text-orange-500 border-orange-500">
                                      ⏸️ পজড ({s.paused_days_remaining} দিন)
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-green-500 border-green-500">সক্রিয়</Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1">
                                    {s.is_paused ? (
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => handleResume(s.id)}
                                        title="রিজিউম করুন"
                                      >
                                        <Play className="h-4 w-4 text-green-600" />
                                      </Button>
                                    ) : (
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => handlePause(s.id)}
                                        title="পজ করুন"
                                      >
                                        <Pause className="h-4 w-4 text-orange-600" />
                                      </Button>
                                    )}
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      onClick={() => {
                                        setSelectedSubscription(s);
                                        setUpgradeDialogOpen(true);
                                      }}
                                      title="আপগ্রেড করুন"
                                    >
                                      <ArrowUpCircle className="h-4 w-4 text-blue-600" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="all">
                  <Card>
                    <CardContent className="pt-6">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ইউজার</TableHead>
                            <TableHead>প্ল্যান</TableHead>
                            <TableHead>মূল্য</TableHead>
                            <TableHead>স্ট্যাটাস</TableHead>
                            <TableHead>তারিখ</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {subscriptions.map((s) => (
                            <TableRow key={s.id}>
                              <TableCell>{s.profiles?.mobile_number}</TableCell>
                              <TableCell>{s.plan_months} মাস</TableCell>
                              <TableCell>{s.price_taka} ৳</TableCell>
                              <TableCell>
                                <Badge variant={s.status === 'active' ? 'default' : 'secondary'}>
                                  {s.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{new Date(s.created_at).toLocaleDateString('bn-BD')}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>

      {/* Upgrade Dialog */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="font-bengali flex items-center gap-2">
              <ArrowUpCircle className="h-5 w-5 text-blue-500" />
              প্ল্যান আপগ্রেড করুন
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedSubscription && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="text-sm font-bengali">
                  <strong>বর্তমান প্ল্যান:</strong> {selectedSubscription.plan_months} মাস
                </p>
                <p className="text-sm font-bengali">
                  <strong>শেষ তারিখ:</strong> {formatBDDate(selectedSubscription.end_date)}
                </p>
                <p className="text-xs text-muted-foreground font-bengali">
                  💡 আপগ্রেড করলে বাকি দিনগুলো নতুন প্ল্যানে যুক্ত হবে
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label className="font-bengali">নতুন প্ল্যান নির্বাচন করুন</Label>
              <div className="grid gap-2">
                {predefinedPlans.map((plan) => (
                  <Button
                    key={plan.id}
                    variant={selectedSubscription?.plan_months === plan.months ? "secondary" : "outline"}
                    className="w-full justify-between font-bengali"
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={selectedSubscription?.plan_months >= plan.months}
                  >
                    <span>{plan.name}</span>
                    {selectedSubscription?.plan_months === plan.months && (
                      <Badge variant="secondary">বর্তমান</Badge>
                    )}
                    {selectedSubscription?.plan_months < plan.months && (
                      <Badge className="bg-green-500">আপগ্রেড</Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default AdminSubscriptions;
