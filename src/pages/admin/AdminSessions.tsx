import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, CheckCircle, XCircle, Clock, Shield, Trash2, RefreshCw, Ban, AlertTriangle, Smartphone } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AdminSessions = () => {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loginAttempts, setLoginAttempts] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [attemptTypeFilter, setAttemptTypeFilter] = useState<string>('all');
  const [attemptsLimit, setAttemptsLimit] = useState(50);
  const [totalAttempts, setTotalAttempts] = useState(0);

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      fetchData();
    }
  }, [user, profile, attemptsLimit]);

  const fetchData = async () => {
    try {
      setDataLoading(true);
      
      // Fetch sessions without join
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('user_sessions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (sessionsError) {
        console.error('Sessions fetch error:', sessionsError);
        toast.error('সেশন ডেটা লোড করতে ব্যর্থ');
      }
      
      // First get total count of login attempts
      const { count: attemptsCount } = await supabase
        .from('login_attempts')
        .select('*', { count: 'exact', head: true });
      
      setTotalAttempts(attemptsCount || 0);
      
      // Fetch login attempts with current limit
      const { data: attemptsData, error: attemptsError } = await supabase
        .from('login_attempts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(attemptsLimit);
      
      if (attemptsError) {
        console.error('Login attempts fetch error:', attemptsError);
        toast.error('লগইন প্রচেষ্টা ডেটা লোড করতে ব্যর্থ');
      }
      
      // Fetch all profiles separately
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, mobile_number, display_name');
      
      // Create a map of user profiles
      const profilesMap = new Map(
        profilesData?.map(p => [p.user_id, p]) || []
      );
      
      // Merge profile data with sessions
      const sessionsWithProfiles = sessionsData?.map(session => ({
        ...session,
        profiles: session.user_id ? profilesMap.get(session.user_id) : null
      })) || [];
      
      setSessions(sessionsWithProfiles);
      
      // Merge profile data with login attempts
      const attemptsWithProfiles = attemptsData?.map(attempt => ({
        ...attempt,
        profiles: attempt.user_id ? profilesMap.get(attempt.user_id) : null
      })) || [];
      
      console.log('Login attempts loaded:', attemptsWithProfiles.length);
      setLoginAttempts(attemptsWithProfiles);
      
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('ডেটা লোড করতে ব্যর্থ');
    } finally {
      setDataLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div></div>;
  if (!user || profile?.role !== 'admin') return <Navigate to="/auth" replace />;

  const handleSignOut = async () => { await signOut(); navigate('/auth'); };
  const handleApproveSession = async (sessionId: string) => { 
    try { 
      // First get the session to find the user_id
      const { data: sessionData } = await supabase
        .from('user_sessions')
        .select('user_id')
        .eq('id', sessionId)
        .single();
      
      if (sessionData) {
        // Deactivate ALL other sessions for this user
        await supabase
          .from('user_sessions')
          .update({ is_active: false })
          .eq('user_id', sessionData.user_id)
          .neq('id', sessionId);
      }
      
      // Then approve and activate this session
      await supabase
        .from('user_sessions')
        .update({ 
          is_approved: true, 
          is_active: true, 
          approved_by: user.id, 
          approved_at: new Date().toISOString() 
        })
        .eq('id', sessionId); 
      
      toast.success('সেশন অনুমোদিত হয়েছে এবং অন্য ডিভাইসগুলি বাতিল করা হয়েছে'); 
      fetchData(); 
    } catch (error) { 
      console.error('Approval error:', error);
      toast.error('সেশন অনুমোদন করতে ব্যর্থ'); 
    } 
  };
  const handleRejectSession = async (sessionId: string) => { try { await supabase.from('user_sessions').delete().eq('id', sessionId); toast.success('সেশন প্রত্যাখ্যান করা হয়েছে'); fetchData(); } catch (error) { toast.error('সেশন প্রত্যাখ্যান করতে ব্যর্থ'); } };
  const handleRevokeSession = async (sessionId: string) => { try { await supabase.from('user_sessions').update({ is_active: false }).eq('id', sessionId); toast.success('সেশন বাতিল করা হয়েছে'); fetchData(); } catch (error) { toast.error('সেশন বাতিল করতে ব্যর্থ'); } };
  const handleDeleteDevice = async (sessionId: string) => { try { await supabase.from('user_sessions').delete().eq('id', sessionId); toast.success('ডিভাইস মুছে ফেলা হয়েছে'); fetchData(); } catch (error) { toast.error('ডিভাইস মুছতে ব্যর্থ'); } };
  const handleResetUserDevices = async (userId: string) => { try { await supabase.from('user_sessions').delete().eq('user_id', userId); toast.success('ব্যবহারকারীর সব ডিভাইস রিসেট করা হয়েছে'); fetchData(); } catch (error) { toast.error('ডিভাইস রিসেট করতে ব্যর্থ'); } };

  const filteredSessions = sessions.filter(s => (searchQuery === '' || s.profiles?.mobile_number?.includes(searchQuery) || s.device_name?.toLowerCase().includes(searchQuery.toLowerCase()) || s.ip_address?.includes(searchQuery)) && (statusFilter === 'all' || (statusFilter === 'active' && s.is_active && s.is_approved) || (statusFilter === 'pending' && !s.is_approved) || (statusFilter === 'blocked' && !s.is_active)));
  const filteredAttempts = loginAttempts.filter(a => (searchQuery === '' || a.mobile_number?.includes(searchQuery) || a.profiles?.mobile_number?.includes(searchQuery) || a.profiles?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) || a.ip_address?.includes(searchQuery)) && (attemptTypeFilter === 'all' || a.attempt_type === attemptTypeFilter));
  const pendingSessions = filteredSessions.filter(s => !s.is_approved);
  const activeSessions = filteredSessions.filter(s => s.is_active && s.is_approved);
  const suspiciousAttempts = filteredAttempts.filter(a => a.attempt_type === 'suspicious');
  
  const handleLoadMoreAttempts = () => {
    setAttemptsLimit(prev => prev + 50);
  };

  const handleApproveSuspiciousLogin = async (attempt: any) => {
    try {
      // Create security override entry
      const { error: overrideError } = await supabase
        .from('security_overrides')
        .insert({
          user_id: attempt.user_id,
          device_fingerprint: attempt.device_fingerprint,
          approved_by: user.id,
          reason: 'Manually approved suspicious login attempt from admin panel'
        });

      if (overrideError) throw overrideError;

      // Check if session already exists for this user and device
      const { data: existingSession } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', attempt.user_id)
        .eq('device_fingerprint', attempt.device_fingerprint)
        .single();

      if (existingSession) {
        // Reactivate existing session
        await supabase
          .from('user_sessions')
          .update({
            is_active: true,
            is_approved: true,
            approved_by: user.id,
            approved_at: new Date().toISOString()
          })
          .eq('id', existingSession.id);
      } else {
        // Create new approved session
        await supabase
          .from('user_sessions')
          .insert({
            user_id: attempt.user_id,
            device_fingerprint: attempt.device_fingerprint,
            device_name: attempt.user_agent?.substring(0, 50) || 'Unknown Device',
            ip_address: attempt.ip_address,
            country: attempt.country,
            city: attempt.city,
            user_agent: attempt.user_agent,
            is_active: true,
            is_approved: true,
            approved_by: user.id,
            approved_at: new Date().toISOString()
          });
      }

      toast.success('✅ সন্দেহজনক লগইন অনুমোদিত হয়েছে এবং whitelist এ যোগ করা হয়েছে');
      fetchData();
    } catch (error) {
      console.error('Approve suspicious login error:', error);
      toast.error('সন্দেহজনক লগইন অনুমোদন করতে ব্যর্থ');
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar onSignOut={handleSignOut} />
        <main className="flex-1 p-6 overflow-auto">
          <SidebarTrigger className="mb-4" />
          <div className="flex items-center justify-between mb-6">
            <div><h1 className="text-3xl font-bold flex items-center gap-2"><Shield className="h-8 w-8" />নিরাপত্তা ও সেশন ম্যানেজমেন্ট</h1><p className="text-muted-foreground mt-1">ব্যবহারকারী লগইন, ডিভাইস এবং নিরাপত্তা মনিটরিং</p></div>
            <ThemeToggle />
          </div>
          <Card className="mb-6"><CardHeader><CardTitle>ফিল্টার এবং সার্চ</CardTitle></CardHeader><CardContent><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div><label className="text-sm font-medium mb-2 block">সার্চ করুন</label><Input placeholder="মোবাইল, আইপি, ডিভাইস..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div><div><label className="text-sm font-medium mb-2 block">সেশন স্ট্যাটাস</label><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">সব সেশন</SelectItem><SelectItem value="active">সক্রিয়</SelectItem><SelectItem value="pending">পেন্ডিং</SelectItem><SelectItem value="blocked">ব্লকড</SelectItem></SelectContent></Select></div><div><label className="text-sm font-medium mb-2 block">লগইন টাইপ</label><Select value={attemptTypeFilter} onValueChange={setAttemptTypeFilter}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">সব লগইন</SelectItem><SelectItem value="success">সফল</SelectItem><SelectItem value="blocked">ব্লকড</SelectItem><SelectItem value="suspicious">সন্দেহজনক</SelectItem></SelectContent></Select></div></div></CardContent></Card>
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">পেন্ডিং</CardTitle><Clock className="h-4 w-4 text-warning" /></CardHeader><CardContent><div className="text-2xl font-bold text-warning">{pendingSessions.length}</div></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">সক্রিয়</CardTitle><CheckCircle className="h-4 w-4 text-success" /></CardHeader><CardContent><div className="text-2xl font-bold text-success">{activeSessions.length}</div></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">ব্যর্থ লগইন</CardTitle><AlertTriangle className="h-4 w-4 text-destructive" /></CardHeader><CardContent><div className="text-2xl font-bold text-destructive">{filteredAttempts.filter(a => a.attempt_type === 'blocked').length}</div></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">মোট</CardTitle><Shield className="h-4 w-4" /></CardHeader><CardContent><div className="text-2xl font-bold">{sessions.length}</div></CardContent></Card>
          </div>
          <Tabs defaultValue="pending"><TabsList><TabsTrigger value="pending">পেন্ডিং ({pendingSessions.length})</TabsTrigger><TabsTrigger value="active">সক্রিয় ({activeSessions.length})</TabsTrigger><TabsTrigger value="suspicious">সন্দেহজনক ({suspiciousAttempts.length})</TabsTrigger><TabsTrigger value="attempts">লগইন ({filteredAttempts.length}/{totalAttempts})</TabsTrigger></TabsList>
            <TabsContent value="pending"><Card><CardHeader><CardTitle>পেন্ডিং অনুমোদন</CardTitle><CardDescription>নতুন ডিভাইস থেকে লগইন</CardDescription></CardHeader><CardContent>{dataLoading ? <Skeleton className="h-20" /> : pendingSessions.length === 0 ? <p className="text-center text-muted-foreground py-4">কোন পেন্ডিং সেশন নেই</p> : <Table><TableHeader><TableRow><TableHead>ব্যবহারকারী</TableHead><TableHead>ডিভাইস</TableHead><TableHead>লোকেশন</TableHead><TableHead>অ্যাকশন</TableHead></TableRow></TableHeader><TableBody>{pendingSessions.map(s => <TableRow key={s.id}><TableCell><p className="font-medium">{s.profiles?.display_name}</p><p className="text-sm text-muted-foreground">{s.profiles?.mobile_number}</p></TableCell><TableCell><div className="flex items-center gap-2"><Smartphone className="h-4 w-4" /><span className="text-sm">{s.device_name || 'Unknown'}</span></div></TableCell><TableCell><div className="flex items-center gap-2"><MapPin className="h-4 w-4" /><span className="text-sm">{s.city}, {s.country}</span></div><p className="text-xs text-muted-foreground">{s.ip_address}</p></TableCell><TableCell><div className="flex gap-2"><Button size="sm" onClick={() => handleApproveSession(s.id)}><CheckCircle className="h-4 w-4 mr-1" />অনুমোদন</Button><Button size="sm" variant="destructive" onClick={() => handleRejectSession(s.id)}><XCircle className="h-4 w-4 mr-1" />প্রত্যাখ্যান</Button></div></TableCell></TableRow>)}</TableBody></Table>}</CardContent></Card></TabsContent>
            <TabsContent value="active"><Card><CardHeader><CardTitle>সক্রিয় সেশন</CardTitle><CardDescription>চলমান অনুমোদিত সেশন</CardDescription></CardHeader><CardContent>{dataLoading ? <Skeleton className="h-20" /> : activeSessions.length === 0 ? <p className="text-center text-muted-foreground py-4">কোন সক্রিয় সেশন নেই</p> : <Table><TableHeader><TableRow><TableHead>ব্যবহারকারী</TableHead><TableHead>ডিভাইস</TableHead><TableHead>লোকেশন</TableHead><TableHead>অ্যাকশন</TableHead></TableRow></TableHeader><TableBody>{activeSessions.map(s => <TableRow key={s.id}><TableCell><p className="font-medium">{s.profiles?.display_name}</p><p className="text-sm text-muted-foreground">{s.profiles?.mobile_number}</p></TableCell><TableCell><div className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-success" /><span className="text-sm">{s.device_name || 'Unknown'}</span></div></TableCell><TableCell><div className="flex items-center gap-2"><MapPin className="h-4 w-4" /><span className="text-sm">{s.city}, {s.country}</span></div></TableCell><TableCell><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => handleRevokeSession(s.id)}><Ban className="h-4 w-4 mr-1" />বাতিল</Button><AlertDialog><AlertDialogTrigger asChild><Button size="sm" variant="destructive"><Trash2 className="h-4 w-4 mr-1" />মুছুন</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>ডিভাইস মুছবেন?</AlertDialogTitle><AlertDialogDescription>ডিভাইস স্থায়ীভাবে মুছে যাবে</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>বাতিল</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteDevice(s.id)}>মুছুন</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog><AlertDialog><AlertDialogTrigger asChild><Button size="sm" variant="outline"><RefreshCw className="h-4 w-4 mr-1" />সব রিসেট</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>সব ডিভাইস রিসেট?</AlertDialogTitle><AlertDialogDescription>ব্যবহারকারীর সব সেশন মুছে যাবে</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>বাতিল</AlertDialogCancel><AlertDialogAction onClick={() => handleResetUserDevices(s.user_id)}>রিসেট</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div></TableCell></TableRow>)}</TableBody></Table>}</CardContent></Card></TabsContent>
            <TabsContent value="suspicious"><Card><CardHeader><CardTitle>সন্দেহজনক লগইন প্রচেষ্টা</CardTitle><CardDescription>Impossible travel ও অন্যান্য সন্দেহজনক লগইন</CardDescription></CardHeader><CardContent>{dataLoading ? <Skeleton className="h-20" /> : suspiciousAttempts.length === 0 ? <p className="text-center text-muted-foreground py-4">কোন সন্দেহজনক লগইন নেই</p> : <Table><TableHeader><TableRow><TableHead>ব্যবহারকারী</TableHead><TableHead>লোকেশন</TableHead><TableHead>কারণ</TableHead><TableHead>সময়</TableHead><TableHead>অ্যাকশন</TableHead></TableRow></TableHeader><TableBody>{suspiciousAttempts.map(a => <TableRow key={a.id}><TableCell><div><p className="font-medium">{a.profiles?.display_name || 'অজানা ব্যবহারকারী'}</p><p className="text-xs text-muted-foreground">{a.profiles?.mobile_number || a.mobile_number || '-'}</p></div></TableCell><TableCell><div className="space-y-1"><div className="flex items-center gap-2"><MapPin className="h-4 w-4" /><span className="text-sm">{a.city || 'Unknown'}, {a.country || 'Unknown'}</span></div><p className="text-xs text-muted-foreground pl-6">IP: {a.ip_address}</p></div></TableCell><TableCell><Badge variant="secondary" className="text-xs">{a.reason || 'সন্দেহজনক কার্যকলাপ'}</Badge></TableCell><TableCell className="text-sm">{new Date(a.created_at).toLocaleString('bn-BD')}</TableCell><TableCell><AlertDialog><AlertDialogTrigger asChild><Button size="sm" variant="default"><CheckCircle className="h-4 w-4 mr-1" />Approve & Whitelist</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>সন্দেহজনক লগইন অনুমোদন?</AlertDialogTitle><AlertDialogDescription>এই ইউজার ও ডিভাইসকে permanent whitelist এ যোগ করা হবে এবং ভবিষ্যতে এই ডিভাইস থেকে security check bypass হবে।</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>বাতিল</AlertDialogCancel><AlertDialogAction onClick={() => handleApproveSuspiciousLogin(a)}>Approve করুন</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></TableCell></TableRow>)}</TableBody></Table>}</CardContent></Card></TabsContent>
            <TabsContent value="attempts"><Card><CardHeader><CardTitle>লগইন প্রচেষ্টা</CardTitle><CardDescription>সব লগইন লগ (দেখানো হচ্ছে: {filteredAttempts.length}, মোট: {totalAttempts})</CardDescription></CardHeader><CardContent>{dataLoading ? <Skeleton className="h-20" /> : filteredAttempts.length === 0 ? <p className="text-center text-muted-foreground py-4">কোন লগ নেই</p> : <><Table><TableHeader><TableRow><TableHead>স্ট্যাটাস</TableHead><TableHead>ব্যবহারকারী</TableHead><TableHead>লোকেশন</TableHead><TableHead>কারণ</TableHead><TableHead>সময়</TableHead></TableRow></TableHeader><TableBody>{filteredAttempts.map(a => <TableRow key={a.id}><TableCell><Badge variant={a.attempt_type === 'success' ? 'default' : a.attempt_type === 'blocked' ? 'destructive' : 'secondary'}>{a.attempt_type === 'success' ? 'সফল' : a.attempt_type === 'blocked' ? 'ব্লকড' : 'সন্দেহজনক'}</Badge></TableCell><TableCell><div><p className="font-medium">{a.profiles?.display_name || 'অজানা ব্যবহারকারী'}</p><p className="text-xs text-muted-foreground">{a.profiles?.mobile_number || a.mobile_number || '-'}</p></div></TableCell><TableCell><div className="space-y-1"><div className="flex items-center gap-2"><MapPin className="h-4 w-4" /><span className="text-sm">{a.city || 'Unknown'}, {a.country || 'Unknown'}</span></div><p className="text-xs text-muted-foreground pl-6">IP: {a.ip_address}</p></div></TableCell><TableCell><span className="text-sm">{a.reason || '-'}</span></TableCell><TableCell className="text-sm">{new Date(a.created_at).toLocaleString('bn-BD')}</TableCell></TableRow>)}</TableBody></Table>{loginAttempts.length < totalAttempts && <div className="mt-4 text-center"><Button onClick={handleLoadMoreAttempts} variant="outline">আরও লোড করুন ({totalAttempts - loginAttempts.length} বাকি আছে)</Button></div>}</>}</CardContent></Card></TabsContent>
          </Tabs>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminSessions;
