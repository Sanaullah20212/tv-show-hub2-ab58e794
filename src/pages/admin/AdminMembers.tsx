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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, UserCheck, UserX, Smartphone, Briefcase, CreditCard, UserPlus, X, RefreshCw, Trash2, CheckCircle, XCircle, Clock, AlertCircle, Plus, Pause, Play, ArrowUpCircle, Phone, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PaymentScreenshotViewer } from '@/components/PaymentScreenshotViewer';

// Helper function to set end time to 11:59 PM Bangladesh Time (UTC+6)
const setEndTimeToBangladeshMidnight = (date: Date): Date => {
  const bdDate = new Date(date);
  bdDate.setUTCHours(17, 59, 59, 999);
  return bdDate;
};

// Helper to format date in Bangladesh timezone
const formatBDDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString('bn-BD', { 
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const AdminMembers = () => {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // User states
  const [users, setUsers] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  
  // Form states
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [priceTaka, setPriceTaka] = useState('');
  const [useCustomDate, setUseCustomDate] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const predefinedPlans = [
    { id: 'plan1', name: '১ মাস - ২০০ টাকা', months: 1, price: 200 },
    { id: 'plan2', name: '২ মাস - ৪০০ টাকা', months: 2, price: 400 },
    { id: 'plan3', name: '৩ মাস - ৫০০ টাকা', months: 3, price: 500 },
    { id: 'custom', name: 'কাস্টম তারিখ', months: 0, price: 0 }
  ];

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      fetchData();
    }
  }, [user, profile]);

  const fetchData = async () => {
    try {
      setDataLoading(true);
      
      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all subscriptions
      const { data: subsData, error: subsError } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (subsError) throw subsError;

      // Create profile map for subscriptions
      const profileMap = new Map(
        profilesData?.map(p => [p.user_id, p]) || []
      );

      // Merge subscription data with user info
      const subsWithProfiles = subsData?.map(sub => ({
        ...sub,
        profiles: profileMap.get(sub.user_id) || { mobile_number: 'N/A' }
      })) || [];

      // Merge user data with subscription info
      const usersWithSubs = profilesData?.map(profile => {
        const activeSub = subsData?.find(s => 
          s.user_id === profile.user_id && 
          s.status === 'active' && 
          new Date(s.end_date) > new Date()
        );
        return {
          ...profile,
          hasActiveSubscription: !!activeSub,
          subscriptionEndDate: activeSub?.end_date,
          activeSubscription: activeSub
        };
      }) || [];

      setUsers(usersWithSubs);
      setSubscriptions(subsWithProfiles);
    } catch (error) {
      console.error('Error:', error);
      toast.error('লোড করতে ব্যর্থ');
    } finally {
      setDataLoading(false);
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

  // Filter users
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.mobile_number?.includes(searchQuery) || u.display_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || u.user_type === filterType;
    return matchesSearch && matchesType;
  });

  // Subscription categories
  const pending = subscriptions.filter(s => s.status === 'pending');
  const active = subscriptions.filter(s => s.status === 'active' && new Date(s.end_date) > new Date());
  const expired = subscriptions.filter(s => s.status === 'active' && new Date(s.end_date) <= new Date());

  // User type toggle
  const handleToggleUserType = async (userId: string, currentType: string) => {
    try {
      const newType = currentType === 'mobile' ? 'business' : 'mobile';
      const { error } = await supabase
        .from('profiles')
        .update({ user_type: newType })
        .eq('user_id', userId);

      if (error) throw error;
      toast.success(`ইউজার টাইপ ${newType === 'mobile' ? 'মোবাইল' : 'বিজনেস'} এ পরিবর্তন হয়েছে`);
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      toast.error('ইউজার টাইপ পরিবর্তন করতে ব্যর্থ');
    }
  };

  // Cancel subscription
  const handleCancelSubscription = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', userId)
        .eq('status', 'active');

      if (error) throw error;
      toast.success('সাবস্ক্রিপশন বাতিল করা হয়েছে');
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      toast.error('সাবস্ক্রিপশন বাতিল করতে ব্যর্থ');
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: string, userName: string) => {
    try {
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { userId }
      });
      if (error) throw error;
      toast.success(`${userName || 'ইউজার'} ডিলিট করা হয়েছে`);
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      toast.error('ইউজার ডিলিট করতে ব্যর্থ');
    }
  };

  // Approve subscription
  const handleApprove = async (id: string) => {
    try {
      const sub = subscriptions.find(s => s.id === id);
      if (!sub) return;

      // Cancel existing active subscriptions
      await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', sub.user_id)
        .in('status', ['active', 'pending'])
        .neq('id', id);

      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + sub.plan_months);
      const bdEndDate = setEndTimeToBangladeshMidnight(endDate);

      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'active', end_date: bdEndDate.toISOString() })
        .eq('id', id);

      if (error) throw error;
      toast.success('অনুমোদিত হয়েছে');
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      toast.error('ব্যর্থ');
    }
  };

  // Reject subscription
  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) throw error;
      toast.success('প্রত্যাখ্যাত হয়েছে');
      fetchData();
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
      toast.success(`পজ করা হয়েছে (${remainingDays} দিন বাকি)`);
      fetchData();
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
      toast.success('রিজিউম করা হয়েছে');
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      toast.error('রিজিউম করতে ব্যর্থ');
    }
  };

  // Create subscription
  const handleCreateSubscription = async () => {
    if (!selectedUser || !selectedPlan || !paymentMethod) {
      toast.error('সব তথ্য পূরণ করুন');
      return;
    }

    const plan = predefinedPlans.find(p => p.id === selectedPlan);
    if (!plan) return;

    try {
      let subscriptionEndDate = new Date();
      let finalPrice = plan.price;

      if (priceTaka) {
        const parsed = parseInt(priceTaka, 10);
        if (!isNaN(parsed)) finalPrice = parsed;
      }

      if (useCustomDate && startDate && endDate) {
        subscriptionEndDate = new Date(endDate);
      } else {
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + plan.months);
      }

      subscriptionEndDate = setEndTimeToBangladeshMidnight(subscriptionEndDate);

      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: selectedUser.user_id,
          plan_months: plan.months || 1,
          price_taka: finalPrice,
          payment_method: paymentMethod,
          status: 'active' as const,
          start_date: useCustomDate && startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
          end_date: subscriptionEndDate.toISOString()
        });

      if (error) throw error;

      toast.success(`সাবস্ক্রিপশন তৈরি হয়েছে (${finalPrice} টাকা)`);
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      toast.error('সাবস্ক্রিপশন তৈরি করতে ব্যর্থ');
    }
  };

  const resetForm = () => {
    setSelectedPlan('');
    setPaymentMethod('');
    setPriceTaka('');
    setUseCustomDate(false);
    setStartDate('');
    setEndDate('');
    setSelectedUser(null);
  };

  // Mobile user card
  const UserMobileCard = ({ u }: { u: any }) => (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{u.mobile_number || 'N/A'}</span>
          </div>
          <Badge variant={u.user_type === 'business' ? 'default' : 'secondary'}>
            {u.user_type === 'business' ? <><Briefcase className="h-3 w-3 mr-1" /> বিজনেস</> : <><Smartphone className="h-3 w-3 mr-1" /> মোবাইল</>}
          </Badge>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {u.display_name || 'নাম নেই'}
        </div>

        <div className="flex items-center gap-2 text-sm">
          {u.hasActiveSubscription ? (
            <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
              <CheckCircle className="h-3 w-3 mr-1" /> সক্রিয়
            </Badge>
          ) : (
            <Badge variant="secondary">
              <XCircle className="h-3 w-3 mr-1" /> সাবস্ক্রিপশন নেই
            </Badge>
          )}
        </div>

        <div className="flex gap-2 pt-2 border-t flex-wrap">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleToggleUserType(u.user_id, u.user_type)}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            টাইপ
          </Button>
          
          <Dialog open={dialogOpen && selectedUser?.id === u.id} onOpenChange={(open) => {
            setDialogOpen(open);
            if (open) setSelectedUser(u);
            else resetForm();
          }}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" onClick={() => setSelectedUser(u)}>
                <CreditCard className="h-3 w-3 mr-1" />
                সাবস্ক্রিপশন
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle className="font-bengali">সাবস্ক্রিপশন তৈরি</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>ইউজার</Label>
                  <Input value={u.mobile_number || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label>প্ল্যান</Label>
                  <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                    <SelectTrigger><SelectValue placeholder="প্ল্যান নির্বাচন" /></SelectTrigger>
                    <SelectContent>
                      {predefinedPlans.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>পেমেন্ট মেথড</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger><SelectValue placeholder="মেথড নির্বাচন" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bkash">বিকাশ</SelectItem>
                      <SelectItem value="nagad">নগদ</SelectItem>
                      <SelectItem value="rocket">রকেট</SelectItem>
                      <SelectItem value="cash">ক্যাশ</SelectItem>
                      <SelectItem value="free">ফ্রি</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>টাকা (ঐচ্ছিক)</Label>
                  <Input type="number" value={priceTaka} onChange={(e) => setPriceTaka(e.target.value)} placeholder="ডিফল্ট মূল্য" />
                </div>
                <Button onClick={handleCreateSubscription} className="w-full">তৈরি করুন</Button>
              </div>
            </DialogContent>
          </Dialog>

          {u.hasActiveSubscription && (
            <Button size="sm" variant="destructive" onClick={() => handleCancelSubscription(u.user_id)}>
              <X className="h-3 w-3 mr-1" />
              বাতিল
            </Button>
          )}
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive"><Trash2 className="h-3 w-3" /></Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>ইউজার ডিলিট?</AlertDialogTitle>
                <AlertDialogDescription>{u.display_name || u.mobile_number} কে ডিলিট করতে চান?</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>বাতিল</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDeleteUser(u.user_id, u.display_name)} className="bg-destructive">ডিলিট</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );

  // Mobile subscription card
  const SubscriptionMobileCard = ({ s, type }: { s: any; type: 'pending' | 'active' }) => (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{s.profiles?.mobile_number || 'N/A'}</span>
          </div>
          {s.is_paused ? (
            <Badge variant="outline" className="text-orange-500 border-orange-500">⏸️ পজড</Badge>
          ) : (
            <Badge className={type === 'active' ? 'bg-green-500/20 text-green-600' : 'bg-orange-500/20 text-orange-600'}>
              {type === 'active' ? 'সক্রিয়' : 'পেন্ডিং'}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><Clock className="h-3 w-3 inline mr-1" />{s.plan_months} মাস</div>
          <div><CreditCard className="h-3 w-3 inline mr-1" />{s.price_taka} ৳</div>
        </div>

        {type === 'active' && s.end_date && (
          <div className="text-sm text-muted-foreground">
            <Calendar className="h-3 w-3 inline mr-1" />
            শেষ: {formatBDDate(s.end_date)}
          </div>
        )}

        {s.payment_screenshot_url && (
          <PaymentScreenshotViewer screenshotUrl={s.payment_screenshot_url} size="sm" />
        )}

        <div className="flex gap-2 pt-2 border-t">
          {type === 'pending' && (
            <>
              <Button size="sm" className="flex-1 bg-green-500 hover:bg-green-600" onClick={() => handleApprove(s.id)}>
                <CheckCircle className="h-3 w-3 mr-1" />অনুমোদন
              </Button>
              <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleReject(s.id)}>
                <XCircle className="h-3 w-3 mr-1" />প্রত্যাখ্যান
              </Button>
            </>
          )}
          {type === 'active' && (
            <>
              {s.is_paused ? (
                <Button size="sm" variant="outline" className="flex-1" onClick={() => handleResume(s.id)}>
                  <Play className="h-3 w-3 mr-1" />রিজিউম
                </Button>
              ) : (
                <Button size="sm" variant="outline" className="flex-1" onClick={() => handlePause(s.id)}>
                  <Pause className="h-3 w-3 mr-1" />পজ
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar onSignOut={handleSignOut} />
        
        <div className="flex-1 flex flex-col">
          <header className="h-14 sm:h-16 border-b bg-card/50 backdrop-blur flex items-center justify-between px-3 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-4">
              <SidebarTrigger />
              <h1 className="text-lg sm:text-2xl font-bold font-bengali">মেম্বার ম্যানেজমেন্ট</h1>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 p-3 sm:p-6 overflow-auto">
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">মোট ইউজার</p>
                        <p className="text-2xl font-bold">{users.length}</p>
                      </div>
                      <Users className="h-8 w-8 text-primary/50" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">সক্রিয়</p>
                        <p className="text-2xl font-bold">{active.length}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-500/50" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-orange-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">পেন্ডিং</p>
                        <p className="text-2xl font-bold">{pending.length}</p>
                      </div>
                      <Clock className="h-8 w-8 text-orange-500/50" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">বিজনেস</p>
                        <p className="text-2xl font-bold">{users.filter(u => u.user_type === 'business').length}</p>
                      </div>
                      <Briefcase className="h-8 w-8 text-blue-500/50" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="users" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="users" className="font-bengali">
                    <Users className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">ইউজার</span> ({users.length})
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="font-bengali">
                    <Clock className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">পেন্ডিং</span> ({pending.length})
                  </TabsTrigger>
                  <TabsTrigger value="active" className="font-bengali">
                    <CheckCircle className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">সক্রিয়</span> ({active.length})
                  </TabsTrigger>
                </TabsList>

                {/* Users Tab */}
                <TabsContent value="users">
                  <Card>
                    <CardContent className="pt-6">
                      {/* Search */}
                      <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="মোবাইল বা নাম দিয়ে খুঁজুন..." 
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)} 
                            className="pl-9"
                          />
                        </div>
                        <Select value={filterType} onValueChange={setFilterType}>
                          <SelectTrigger className="w-full sm:w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">সব</SelectItem>
                            <SelectItem value="mobile">মোবাইল</SelectItem>
                            <SelectItem value="business">বিজনেস</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {dataLoading ? (
                        <div className="space-y-3">
                          {[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
                        </div>
                      ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">কোনো ইউজার পাওয়া যায়নি</div>
                      ) : isMobile ? (
                        <div className="space-y-3">
                          {filteredUsers.map(u => <UserMobileCard key={u.id} u={u} />)}
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>মোবাইল</TableHead>
                              <TableHead>নাম</TableHead>
                              <TableHead>টাইপ</TableHead>
                              <TableHead>সাবস্ক্রিপশন</TableHead>
                              <TableHead className="text-right">অ্যাকশন</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredUsers.map(u => (
                              <TableRow key={u.id}>
                                <TableCell className="font-mono">{u.mobile_number || '-'}</TableCell>
                                <TableCell>{u.display_name || '-'}</TableCell>
                                <TableCell>
                                  <Badge variant={u.user_type === 'business' ? 'default' : 'secondary'}>
                                    {u.user_type === 'business' ? 'বিজনেস' : 'মোবাইল'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {u.hasActiveSubscription ? (
                                    <Badge className="bg-green-500/20 text-green-600">সক্রিয়</Badge>
                                  ) : (
                                    <Badge variant="secondary">নেই</Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1">
                                    <Button size="sm" variant="outline" onClick={() => handleToggleUserType(u.user_id, u.user_type)}>
                                      <RefreshCw className="h-3 w-3" />
                                    </Button>
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button size="sm" variant="outline" onClick={() => setSelectedUser(u)}>
                                          <CreditCard className="h-3 w-3" />
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-[400px]">
                                        <DialogHeader>
                                          <DialogTitle>সাবস্ক্রিপশন তৈরি</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                          <div><Label>ইউজার</Label><Input value={u.mobile_number || ''} disabled /></div>
                                          <div className="space-y-2">
                                            <Label>প্ল্যান</Label>
                                            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                                              <SelectTrigger><SelectValue placeholder="প্ল্যান" /></SelectTrigger>
                                              <SelectContent>
                                                {predefinedPlans.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div className="space-y-2">
                                            <Label>পেমেন্ট</Label>
                                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                              <SelectTrigger><SelectValue placeholder="মেথড" /></SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="bkash">বিকাশ</SelectItem>
                                                <SelectItem value="nagad">নগদ</SelectItem>
                                                <SelectItem value="cash">ক্যাশ</SelectItem>
                                                <SelectItem value="free">ফ্রি</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <Button onClick={handleCreateSubscription} className="w-full">তৈরি করুন</Button>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                    {u.hasActiveSubscription && (
                                      <Button size="sm" variant="destructive" onClick={() => handleCancelSubscription(u.user_id)}>
                                        <X className="h-3 w-3" />
                                      </Button>
                                    )}
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button size="sm" variant="destructive"><Trash2 className="h-3 w-3" /></Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>ইউজার ডিলিট?</AlertDialogTitle>
                                          <AlertDialogDescription>{u.display_name || u.mobile_number} ডিলিট করবেন?</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>বাতিল</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDeleteUser(u.user_id, u.display_name)} className="bg-destructive">ডিলিট</AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
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

                {/* Pending Tab */}
                <TabsContent value="pending">
                  <Card>
                    <CardContent className="pt-6">
                      {pending.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">কোনো পেন্ডিং সাবস্ক্রিপশন নেই</div>
                      ) : isMobile ? (
                        <div className="space-y-3">
                          {pending.map(s => <SubscriptionMobileCard key={s.id} s={s} type="pending" />)}
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>মোবাইল</TableHead>
                              <TableHead>প্ল্যান</TableHead>
                              <TableHead>মূল্য</TableHead>
                              <TableHead>পেমেন্ট</TableHead>
                              <TableHead>স্ক্রিনশট</TableHead>
                              <TableHead className="text-right">অ্যাকশন</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pending.map(s => (
                              <TableRow key={s.id}>
                                <TableCell>{s.profiles?.mobile_number}</TableCell>
                                <TableCell>{s.plan_months} মাস</TableCell>
                                <TableCell>{s.price_taka} ৳</TableCell>
                                <TableCell>{s.payment_method}</TableCell>
                                <TableCell><PaymentScreenshotViewer screenshotUrl={s.payment_screenshot_url} size="sm" /></TableCell>
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

                {/* Active Tab */}
                <TabsContent value="active">
                  <Card>
                    <CardContent className="pt-6">
                      {active.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">কোনো সক্রিয় সাবস্ক্রিপশন নেই</div>
                      ) : isMobile ? (
                        <div className="space-y-3">
                          {active.map(s => <SubscriptionMobileCard key={s.id} s={s} type="active" />)}
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>মোবাইল</TableHead>
                              <TableHead>প্ল্যান</TableHead>
                              <TableHead>শেষ তারিখ</TableHead>
                              <TableHead>স্ট্যাটাস</TableHead>
                              <TableHead className="text-right">অ্যাকশন</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {active.map(s => (
                              <TableRow key={s.id}>
                                <TableCell>{s.profiles?.mobile_number}</TableCell>
                                <TableCell>{s.plan_months} মাস</TableCell>
                                <TableCell>{formatBDDate(s.end_date)}</TableCell>
                                <TableCell>
                                  {s.is_paused ? (
                                    <Badge variant="outline" className="text-orange-500">⏸️ পজড ({s.paused_days_remaining}দিন)</Badge>
                                  ) : (
                                    <Badge className="bg-green-500/20 text-green-600">সক্রিয়</Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1">
                                    {s.is_paused ? (
                                      <Button size="sm" variant="outline" onClick={() => handleResume(s.id)}>
                                        <Play className="h-4 w-4 text-green-600" />
                                      </Button>
                                    ) : (
                                      <Button size="sm" variant="outline" onClick={() => handlePause(s.id)}>
                                        <Pause className="h-4 w-4 text-orange-600" />
                                      </Button>
                                    )}
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
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminMembers;
