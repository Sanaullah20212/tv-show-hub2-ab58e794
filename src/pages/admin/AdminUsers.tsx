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
import { Users, Search, Download, UserCheck, UserX, Smartphone, Briefcase, CreditCard, UserPlus, X, RefreshCw, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const AdminUsers = () => {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSubscriptionStatus, setFilterSubscriptionStatus] = useState<'all' | 'active' | 'expired' | 'none'>('all');
  const [filterCountry, setFilterCountry] = useState<string>('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [planMonths, setPlanMonths] = useState('1');
  const [priceTaka, setPriceTaka] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string>('');
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
      fetchUsers();
      fetchCountries();
    }
  }, [user, profile]);

  const fetchCountries = async () => {
    try {
      const { data, error } = await supabase
        .from('login_attempts')
        .select('country')
        .not('country', 'is', null);

      if (error) throw error;

      const uniqueCountries = Array.from(new Set(data?.map(d => d.country).filter(Boolean))) as string[];
      setCountries(uniqueCountries.sort());
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setDataLoading(true);
      
      // Fetch profiles with their subscription info and login location
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch subscription data for each user
      const { data: subscriptionsData } = await supabase
        .from('subscriptions')
        .select('user_id, status, end_date')
        .eq('status', 'active');

      // Fetch latest login location for each user
      const { data: loginData } = await supabase
        .from('login_attempts')
        .select('user_id, country, city')
        .eq('attempt_type', 'success')
        .order('created_at', { ascending: false });

      // Merge the data
      const usersWithData = profilesData?.map(profile => {
        const subscription = subscriptionsData?.find(s => s.user_id === profile.user_id);
        const loginInfo = loginData?.find(l => l.user_id === profile.user_id);
        
        return {
          ...profile,
          hasActiveSubscription: !!subscription && new Date(subscription.end_date) > new Date(),
          subscriptionEndDate: subscription?.end_date,
          country: loginInfo?.country,
          city: loginInfo?.city
        };
      });

      setUsers(usersWithData || []);
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

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.mobile_number?.includes(searchQuery) || u.display_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || u.user_type === filterType;
    
    // Subscription status filter
    let matchesSubscription = true;
    if (filterSubscriptionStatus !== 'all') {
      if (filterSubscriptionStatus === 'active') {
        matchesSubscription = u.hasActiveSubscription === true;
      } else if (filterSubscriptionStatus === 'expired') {
        matchesSubscription = u.hasActiveSubscription === false && u.subscriptionEndDate;
      } else if (filterSubscriptionStatus === 'none') {
        matchesSubscription = !u.subscriptionEndDate;
      }
    }

    // Country filter
    const matchesCountry = filterCountry === 'all' || u.country === filterCountry;

    // Date range filter
    let matchesDateRange = true;
    if (filterDateFrom) {
      matchesDateRange = matchesDateRange && new Date(u.created_at) >= new Date(filterDateFrom);
    }
    if (filterDateTo) {
      matchesDateRange = matchesDateRange && new Date(u.created_at) <= new Date(filterDateTo);
    }

    return matchesSearch && matchesType && matchesSubscription && matchesCountry && matchesDateRange;
  });

  const parsePrice = (value: string) => {
    const banglaToEnglish: Record<string, string> = {
      '০': '0',
      '১': '1',
      '২': '2',
      '৩': '3',
      '৪': '4',
      '৫': '5',
      '৬': '6',
      '৭': '7',
      '৮': '8',
      '৯': '9',
    };

    const normalized = value
      .replace(/[০-৯]/g, (d) => banglaToEnglish[d] || '')
      .replace(/[^0-9]/g, '');

    const parsed = parseInt(normalized, 10);
    return Number.isNaN(parsed) ? NaN : parsed;
  };

  const handleCreateSubscription = async () => {
    if (!selectedUser || !selectedPlan || !paymentMethod) {
      toast.error('সব তথ্য পূরণ করুন');
      return;
    }

    const plan = predefinedPlans.find(p => p.id === selectedPlan);
    if (!plan) return;

    const isCustomPlan = selectedPlan === 'custom';

    if (isCustomPlan && (!startDate || !endDate || !priceTaka)) {
      toast.error('কাস্টম সাবস্ক্রিপশনের জন্য সব তথ্য পূরণ করুন');
      return;
    }

    if (useCustomDate && (!startDate || !endDate)) {
      toast.error('তারিখ সিলেক্ট করুন');
      return;
    }

    try {
      let subscriptionStartDate = new Date();
      let subscriptionEndDate = new Date();
      let calculatedMonths = plan.months;
      let finalPrice = plan.price;

      // Use custom price if provided for any plan
      if (priceTaka) {
        const parsedPrice = parsePrice(priceTaka);
        if (parsedPrice && !Number.isNaN(parsedPrice)) {
          finalPrice = parsedPrice;
        }
      }

      if (isCustomPlan || useCustomDate) {
        subscriptionStartDate = new Date(startDate);
        subscriptionEndDate = new Date(endDate);
        
        // Calculate months difference
        const monthsDiff = (subscriptionEndDate.getFullYear() - subscriptionStartDate.getFullYear()) * 12 
                          + (subscriptionEndDate.getMonth() - subscriptionStartDate.getMonth());
        calculatedMonths = Math.max(1, monthsDiff);
        
        if (isCustomPlan && !priceTaka) {
          toast.error('সঠিক টাকার পরিমাণ লিখুন');
          return;
        }
      } else {
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + plan.months);
      }

      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: selectedUser.user_id,
          plan_months: calculatedMonths,
          price_taka: finalPrice,
          payment_method: paymentMethod,
          status: 'active' as const,
          start_date: subscriptionStartDate.toISOString(),
          end_date: subscriptionEndDate.toISOString()
        });

      if (error) throw error;

      toast.success(`সাবস্ক্রিপশন সফলভাবে তৈরি হয়েছে (${finalPrice} টাকা)`);
      setDialogOpen(false);
      setSelectedPlan('');
      setPaymentMethod('');
      setPriceTaka('');
      setSelectedUser(null);
      setUseCustomDate(false);
      setStartDate('');
      setEndDate('');
      fetchUsers();
    } catch (error) {
      console.error('Error:', error);
      toast.error('সাবস্ক্রিপশন তৈরি করতে ব্যর্থ');
    }
  };

  const handleBulkCreateSubscription = async () => {
    if (selectedUsers.size === 0 || !selectedPlan || !paymentMethod) {
      toast.error('সব তথ্য পূরণ করুন');
      return;
    }

    const plan = predefinedPlans.find(p => p.id === selectedPlan);
    if (!plan) return;

    const isCustomPlan = selectedPlan === 'custom';

    if (isCustomPlan && (!startDate || !endDate || !priceTaka)) {
      toast.error('কাস্টম সাবস্ক্রিপশনের জন্য সব তথ্য পূরণ করুন');
      return;
    }

    if (useCustomDate && (!startDate || !endDate)) {
      toast.error('তারিখ সিলেক্ট করুন');
      return;
    }

    try {
      let subscriptionStartDate = new Date();
      let subscriptionEndDate = new Date();
      let calculatedMonths = plan.months;
      let finalPrice = plan.price;

      // Use custom price if provided for any plan
      if (priceTaka) {
        const parsedPrice = parsePrice(priceTaka);
        if (parsedPrice && !Number.isNaN(parsedPrice)) {
          finalPrice = parsedPrice;
        }
      }

      if (isCustomPlan || useCustomDate) {
        subscriptionStartDate = new Date(startDate);
        subscriptionEndDate = new Date(endDate);
        
        // Calculate months difference
        const monthsDiff = (subscriptionEndDate.getFullYear() - subscriptionStartDate.getFullYear()) * 12 
                          + (subscriptionEndDate.getMonth() - subscriptionStartDate.getMonth());
        calculatedMonths = Math.max(1, monthsDiff);
        
        if (isCustomPlan && !priceTaka) {
          toast.error('সঠিক টাকার পরিমাণ লিখুন');
          return;
        }
      } else {
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + plan.months);
      }

      const subscriptions = Array.from(selectedUsers).map(userId => ({
        user_id: userId,
        plan_months: calculatedMonths,
        price_taka: finalPrice,
        payment_method: paymentMethod,
        status: 'active' as const,
        start_date: subscriptionStartDate.toISOString(),
        end_date: subscriptionEndDate.toISOString()
      }));

      const { error } = await supabase
        .from('subscriptions')
        .insert(subscriptions);

      if (error) throw error;

      toast.success(`${selectedUsers.size}টি সাবস্ক্রিপশন সফলভাবে তৈরি হয়েছে (${finalPrice} টাকা)`);
      setBulkDialogOpen(false);
      setSelectedUsers(new Set());
      setSelectedPlan('');
      setPaymentMethod('');
      setPriceTaka('');
      setUseCustomDate(false);
      setStartDate('');
      setEndDate('');
      fetchUsers();
    } catch (error) {
      console.error('Error:', error);
      toast.error('সাবস্ক্রিপশন তৈরি করতে ব্যর্থ');
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const toggleAllUsers = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.user_id)));
    }
  };

  const handleToggleUserType = async (userId: string, currentType: string) => {
    try {
      const newType = currentType === 'mobile' ? 'business' : 'mobile';
      const { error } = await supabase
        .from('profiles')
        .update({ user_type: newType })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success(`ইউজার টাইপ ${newType === 'mobile' ? 'মোবাইল' : 'বিজনেস'} এ পরিবর্তন করা হয়েছে`);
      fetchUsers();
    } catch (error) {
      console.error('Error:', error);
      toast.error('ইউজার টাইপ পরিবর্তন করতে ব্যর্থ');
    }
  };

  const handleCancelSubscription = async (userId: string) => {
    try {
      // Find active subscriptions for this user
      const { data: subscriptions, error: fetchError } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'active');

      if (fetchError) throw fetchError;

      if (!subscriptions || subscriptions.length === 0) {
        toast.error('কোনো সক্রিয় সাবস্ক্রিপশন পাওয়া যায়নি');
        return;
      }

      // Cancel all active subscriptions
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', userId)
        .eq('status', 'active');

      if (updateError) throw updateError;

      toast.success('সাবস্ক্রিপশন বাতিল করা হয়েছে');
      fetchUsers();
    } catch (error) {
      console.error('Error:', error);
      toast.error('সাবস্ক্রিপশন বাতিল করতে ব্যর্থ');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId }
      });

      if (error) throw error;

      toast.success(`${userName || 'ইউজার'} সফলভাবে ডিলিট করা হয়েছে`);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('ইউজার ডিলিট করতে ব্যর্থ');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedUsers.size === 0) {
      toast.error('অন্তত একজন ইউজার সিলেক্ট করুন');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ approval_status: 'approved', approved_at: new Date().toISOString() })
        .in('user_id', Array.from(selectedUsers));

      if (error) throw error;

      toast.success(`${selectedUsers.size}টি ইউজার অনুমোদন করা হয়েছে`);
      setSelectedUsers(new Set());
      fetchUsers();
    } catch (error) {
      console.error('Error:', error);
      toast.error('ব্যবহারকারী অনুমোদন করতে ব্যর্থ');
    }
  };

  const handleBulkReject = async () => {
    if (selectedUsers.size === 0) {
      toast.error('অন্তত একজন ইউজার সিলেক্ট করুন');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ approval_status: 'rejected', rejection_reason: 'Bulk rejection by admin' })
        .in('user_id', Array.from(selectedUsers));

      if (error) throw error;

      toast.success(`${selectedUsers.size}টি ইউজার প্রত্যাখ্যান করা হয়েছে`);
      setSelectedUsers(new Set());
      fetchUsers();
    } catch (error) {
      console.error('Error:', error);
      toast.error('ব্যবহারকারী প্রত্যাখ্যান করতে ব্যর্থ');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) {
      toast.error('অন্তত একজন ইউজার সিলেক্ট করুন');
      return;
    }

    try {
      const deletePromises = Array.from(selectedUsers).map(userId =>
        supabase.functions.invoke('delete-user', { body: { userId } })
      );

      await Promise.all(deletePromises);

      toast.success(`${selectedUsers.size}টি ইউজার ডিলিট করা হয়েছে`);
      setSelectedUsers(new Set());
      fetchUsers();
    } catch (error) {
      console.error('Error:', error);
      toast.error('ব্যবহারকারী ডিলিট করতে ব্যর্থ');
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar onSignOut={handleSignOut} />
        
        <div className="flex-1 flex flex-col">
          <header className="h-14 sm:h-16 border-b bg-card/50 backdrop-blur flex items-center justify-between px-3 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-4">
              <SidebarTrigger />
              <h1 className="text-lg sm:text-2xl font-bold font-bengali">ব্যবহারকারী ম্যানেজমেন্ট</h1>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 p-3 sm:p-6 overflow-auto">
            <div className="space-y-4 sm:space-y-6">
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                <Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium font-bengali">মোট ইউজার</CardTitle>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{users.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">সর্বমোট রেজিস্টার্ড</p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-info hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium font-bengali">মোবাইল ইউজার</CardTitle>
                    <div className="h-10 w-10 rounded-full bg-info/10 flex items-center justify-center">
                      <Smartphone className="h-5 w-5 text-info" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{users.filter(u => u.user_type === 'mobile').length}</div>
                    <p className="text-xs text-muted-foreground mt-1">টিভি এক্সেস</p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-success hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium font-bengali">বিজনেস ইউজার</CardTitle>
                    <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-success" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{users.filter(u => u.user_type === 'business').length}</div>
                    <p className="text-xs text-muted-foreground mt-1">ড্রাইভ এক্সেস</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4">
                    {/* Search and Filter Row */}
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="মোবাইল নম্বর বা নাম দিয়ে খুঁজুন..." 
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)} 
                            className="pl-9 h-11"
                          />
                        </div>
                        <Select value={filterType} onValueChange={setFilterType}>
                          <SelectTrigger className="w-full sm:w-[180px] h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">সব টাইপ</SelectItem>
                            <SelectItem value="mobile">মোবাইল</SelectItem>
                            <SelectItem value="business">বিজনেস</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Advanced Filters */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <Select value={filterSubscriptionStatus} onValueChange={(value: any) => setFilterSubscriptionStatus(value)}>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="সাবস্ক্রিপশন স্ট্যাটাস" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
                            <SelectItem value="active">সক্রিয়</SelectItem>
                            <SelectItem value="expired">মেয়াদ শেষ</SelectItem>
                            <SelectItem value="none">নেই</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={filterCountry} onValueChange={setFilterCountry}>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="দেশ" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">সব দেশ</SelectItem>
                            {countries.map(country => (
                              <SelectItem key={country} value={country}>{country}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Input 
                          type="date"
                          placeholder="তারিখ থেকে"
                          value={filterDateFrom}
                          onChange={(e) => setFilterDateFrom(e.target.value)}
                          className="h-11"
                        />

                        <Input 
                          type="date"
                          placeholder="তারিখ পর্যন্ত"
                          value={filterDateTo}
                          onChange={(e) => setFilterDateTo(e.target.value)}
                          className="h-11"
                        />
                      </div>
                    </div>

                    {/* Bulk Action Buttons */}
                    {selectedUsers.size > 0 && (
                      <div className="flex flex-wrap gap-2 p-4 bg-muted/50 rounded-lg border">
                        <span className="text-sm font-bengali self-center">{selectedUsers.size}টি সিলেক্ট করা হয়েছে</span>
                        <Button onClick={handleBulkApprove} size="sm" variant="default" className="font-bengali">
                          <UserCheck className="h-4 w-4 mr-1" />
                          অনুমোদন
                        </Button>
                        <Button onClick={handleBulkReject} size="sm" variant="destructive" className="font-bengali">
                          <UserX className="h-4 w-4 mr-1" />
                          প্রত্যাখ্যান
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive" className="font-bengali">
                              <Trash2 className="h-4 w-4 mr-1" />
                              ডিলিট
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="font-bengali">নিশ্চিত করুন</AlertDialogTitle>
                              <AlertDialogDescription className="font-bengali">
                                আপনি কি নিশ্চিত যে আপনি {selectedUsers.size}টি ইউজার ডিলিট করতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="font-bengali">বাতিল</AlertDialogCancel>
                              <AlertDialogAction onClick={handleBulkDelete} className="font-bengali bg-destructive">
                                ডিলিট করুন
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <Button onClick={() => setSelectedUsers(new Set())} size="sm" variant="outline" className="font-bengali">
                          <X className="h-4 w-4 mr-1" />
                          সিলেকশন ক্লিয়ার
                        </Button>
                      </div>
                    )}
                    
                    {/* Bulk Actions */}
                    {selectedUsers.size > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <div className="flex items-center gap-2 flex-1">
                          <Checkbox 
                            checked={true}
                            className="data-[state=checked]:bg-primary"
                          />
                          <span className="text-sm font-medium">
                            {selectedUsers.size}টি ইউজার সিলেক্টেড
                          </span>
                        </div>
                        <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" className="gap-2">
                              <UserPlus className="h-4 w-4" />
                              বাল্ক সাবস্ক্রিপশন
                            </Button>
                          </DialogTrigger>
                        <DialogContent className="max-w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="font-bengali">বাল্ক সাবস্ক্রিপশন তৈরি করুন</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>নির্বাচিত ইউজার</Label>
                              <Input value={`${selectedUsers.size}টি ইউজার নির্বাচিত`} disabled />
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
                                placeholder={selectedPlan && selectedPlan !== 'custom' ? `ডিফল্ট: ${predefinedPlans.find(p => p.id === selectedPlan)?.price || 0} টাকা` : 'মূল্য লিখুন'}
                                value={priceTaka}
                                onChange={(e) => setPriceTaka(e.target.value)}
                              />
                              {selectedPlan !== 'custom' && (
                                <p className="text-xs text-muted-foreground">
                                  কাস্টম টাকা না দিলে প্ল্যানের ডিফল্ট মূল্য ব্যবহার হবে
                                </p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="bulk-custom-date" 
                                checked={useCustomDate}
                                onCheckedChange={(checked) => setUseCustomDate(checked as boolean)}
                              />
                              <Label htmlFor="bulk-custom-date">কাস্টম তারিখ ব্যবহার করুন</Label>
                            </div>
                            {(useCustomDate || selectedPlan === 'custom') && (
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
                            <Button onClick={handleBulkCreateSubscription} className="w-full">
                              {selectedUsers.size}টি সাবস্ক্রিপশন তৈরি করুন
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-bengali">তালিকা ({filteredUsers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {dataLoading ? (
                    <div className="space-y-3">
                      {[1,2,3,4,5].map((i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">কোনো ইউজার পাওয়া যায়নি</h3>
                      <p className="text-muted-foreground">এই ফিল্টার অনুযায়ী কোনো ইউজার খুঁজে পাওয়া যায়নি</p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-border/50 overflow-hidden">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                              <TableHead className="w-12">
                                <Checkbox 
                                  checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                                  onCheckedChange={toggleAllUsers}
                                />
                              </TableHead>
                              <TableHead className="min-w-[140px] font-semibold">মোবাইল</TableHead>
                              <TableHead className="min-w-[160px] font-semibold">নাম</TableHead>
                              <TableHead className="min-w-[110px] font-semibold">টাইপ</TableHead>
                              <TableHead className="min-w-[130px] font-semibold">তারিখ</TableHead>
                              <TableHead className="text-right min-w-[200px] font-semibold">অ্যাকশন</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredUsers.map((u, index) => (
                              <TableRow 
                                key={u.id}
                                className={`
                                  transition-colors hover:bg-muted/50
                                  ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
                                `}
                              >
                                <TableCell>
                                  <Checkbox 
                                    checked={selectedUsers.has(u.user_id)}
                                    onCheckedChange={() => toggleUserSelection(u.user_id)}
                                  />
                                </TableCell>
                                <TableCell className="font-mono text-sm">{u.mobile_number || '-'}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                      <span className="text-xs font-semibold text-primary">
                                        {u.display_name?.charAt(0)?.toUpperCase() || u.mobile_number?.charAt(0) || '?'}
                                      </span>
                                    </div>
                                    <span>{u.display_name || '-'}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge 
                                    variant={u.user_type === 'business' ? 'default' : 'secondary'}
                                    className="font-medium"
                                  >
                                    {u.user_type === 'business' ? (
                                      <><Briefcase className="h-3 w-3 mr-1" /> বিজনেস</>
                                    ) : (
                                      <><Smartphone className="h-3 w-3 mr-1" /> মোবাইল</>
                                    )}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {new Date(u.created_at).toLocaleDateString('bn-BD')}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleToggleUserType(u.user_id, u.user_type)}
                                    title={u.user_type === 'mobile' ? 'বিজনেস করুন' : 'মোবাইল করুন'}
                                    className="px-2"
                                  >
                                    <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => handleCancelSubscription(u.user_id)}
                                    title="সাবস্ক্রিপশন বাতিল করুন"
                                    className="px-2"
                                  >
                                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button 
                                        size="sm" 
                                        variant="destructive"
                                        title="ইউজার ডিলিট করুন"
                                        className="px-2 bg-destructive/90 hover:bg-destructive"
                                      >
                                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="font-bengali">ইউজার ডিলিট করবেন?</AlertDialogTitle>
                                        <AlertDialogDescription className="font-bengali">
                                          আপনি কি নিশ্চিত যে <strong>{u.display_name || u.mobile_number}</strong> কে ডিলিট করতে চান? 
                                          এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না এবং ইউজারের সকল ডেটা মুছে যাবে।
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="font-bengali">বাতিল</AlertDialogCancel>
                                        <AlertDialogAction 
                                          onClick={() => handleDeleteUser(u.user_id, u.display_name || u.mobile_number)}
                                          className="bg-destructive hover:bg-destructive/90 font-bengali"
                                        >
                                          ডিলিট করুন
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                  <Dialog open={dialogOpen && selectedUser?.id === u.id} onOpenChange={(open) => {
                                    setDialogOpen(open);
                                    if (!open) {
                                      setSelectedUser(null);
                                      setPlanMonths('1');
                                      setPriceTaka('');
                                      setPaymentMethod('');
                                    }
                                  }}>
                                    <DialogTrigger asChild>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => {
                                          setSelectedUser(u);
                                          setDialogOpen(true);
                                        }}
                                        className="px-2"
                                      >
                                        <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                                        <span className="hidden sm:inline">সাবস্ক্রিপশন</span>
                                      </Button>
                                    </DialogTrigger>
                                  <DialogContent className="max-w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle className="font-bengali">সাবস্ক্রিপশন তৈরি করুন</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                      <div className="space-y-2">
                                        <Label>ইউজার</Label>
                                        <Input value={u.mobile_number || ''} disabled />
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
                                          placeholder={selectedPlan && selectedPlan !== 'custom' ? `ডিফল্ট: ${predefinedPlans.find(p => p.id === selectedPlan)?.price || 0} টাকা` : 'মূল্য লিখুন'}
                                          value={priceTaka}
                                          onChange={(e) => setPriceTaka(e.target.value)}
                                        />
                                        {selectedPlan !== 'custom' && (
                                          <p className="text-xs text-muted-foreground">
                                            কাস্টম টাকা না দিলে প্ল্যানের ডিফল্ট মূল্য ব্যবহার হবে
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Checkbox 
                                          id="custom-date" 
                                          checked={useCustomDate}
                                          onCheckedChange={(checked) => setUseCustomDate(checked as boolean)}
                                        />
                                        <Label htmlFor="custom-date">কাস্টম তারিখ ব্যবহার করুন</Label>
                                      </div>
                                      {(useCustomDate || selectedPlan === 'custom') && (
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
                              </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminUsers;
