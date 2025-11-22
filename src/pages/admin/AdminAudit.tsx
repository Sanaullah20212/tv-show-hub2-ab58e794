import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { FileText, Download, LogIn, CheckCircle, XCircle, CreditCard, UserPlus, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AdminAudit = () => {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      fetchActivities();
    }
  }, [user, profile]);

  const fetchActivities = async () => {
    try {
      setDataLoading(true);
      const { data, error } = await supabase
        .from('activities')
        .select('*, profiles!inner(*)')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
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

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login': return <LogIn className="h-4 w-4" />;
      case 'download': return <Download className="h-4 w-4" />;
      case 'subscription_created':
      case 'subscription_approved': return <CheckCircle className="h-4 w-4" />;
      case 'subscription_rejected': return <XCircle className="h-4 w-4" />;
      case 'payment': return <CreditCard className="h-4 w-4" />;
      case 'user_created': return <UserPlus className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'login': return 'bg-blue-500/10 text-blue-500';
      case 'download': return 'bg-purple-500/10 text-purple-500';
      case 'subscription_approved': return 'bg-green-500/10 text-green-500';
      case 'subscription_rejected': return 'bg-red-500/10 text-red-500';
      case 'payment': return 'bg-yellow-500/10 text-yellow-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.profiles?.mobile_number?.includes(searchQuery);
    const matchesFilter = filterAction === 'all' || activity.action === filterAction;
    return matchesSearch && matchesFilter;
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar onSignOut={handleSignOut} />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b bg-card/50 backdrop-blur flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold font-bengali">অডিট লগ</h1>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-6xl space-y-6">
              {/* Filters */}
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="font-bengali flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    ফিল্টার
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Input
                        placeholder="সার্চ করুন..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Select value={filterAction} onValueChange={setFilterAction}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all" className="font-bengali">সব</SelectItem>
                          <SelectItem value="login" className="font-bengali">লগইন</SelectItem>
                          <SelectItem value="download" className="font-bengali">ডাউনলোড</SelectItem>
                          <SelectItem value="subscription_created" className="font-bengali">সাবস্ক্রিপশন তৈরি</SelectItem>
                          <SelectItem value="subscription_approved" className="font-bengali">অনুমোদিত</SelectItem>
                          <SelectItem value="subscription_rejected" className="font-bengali">প্রত্যাখ্যাত</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Activities List */}
              <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <CardHeader>
                  <CardTitle className="font-bengali flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    কার্যক্রম লগ ({filteredActivities.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dataLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : filteredActivities.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p className="font-bengali">কোনো কার্যক্রম নেই</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredActivities.map((activity, index) => (
                        <div 
                          key={activity.id}
                          className="p-4 rounded-lg border bg-muted/50 hover:bg-muted transition-colors animate-fade-in"
                          style={{ animationDelay: `${index * 0.02}s` }}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-lg ${getActionColor(activity.action)}`}>
                              {getActionIcon(activity.action)}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium">{activity.description}</p>
                                <Badge variant="outline" className="font-bengali">
                                  {activity.profiles?.mobile_number || 'অজানা'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {new Date(activity.created_at).toLocaleString('bn-BD', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                              {activity.metadata && (
                                <details className="text-xs text-muted-foreground mt-2">
                                  <summary className="cursor-pointer font-bengali">বিস্তারিত দেখুন</summary>
                                  <pre className="mt-2 p-2 rounded bg-muted overflow-auto">
                                    {JSON.stringify(activity.metadata, null, 2)}
                                  </pre>
                                </details>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
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

export default AdminAudit;
