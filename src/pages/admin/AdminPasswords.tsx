import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Key, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const AdminPasswords = () => {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [description, setDescription] = useState('');
  const [applicableMonth, setApplicableMonth] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      fetchPasswords();
    }
  }, [user, profile]);

  const fetchPasswords = async () => {
    try {
      setDataLoading(true);
      const { data, error } = await supabase
        .from('zip_passwords')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPasswords(data || []);
    } catch (error) {
      console.error('Error fetching passwords:', error);
      toast.error('পাসওয়ার্ড লোড করতে ব্যর্থ');
    } finally {
      setDataLoading(false);
    }
  };

  const handleAddPassword = async () => {
    if (!newPassword.trim()) {
      toast.error('পাসওয়ার্ড দিন');
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from('zip_passwords')
        .insert({
          password: newPassword,
          description: description || null,
          applicable_month: applicableMonth || null,
        });

      if (error) throw error;

      toast.success('পাসওয়ার্ড যোগ করা হয়েছে');
      setNewPassword('');
      setDescription('');
      setApplicableMonth('');
      fetchPasswords();
    } catch (error) {
      console.error('Error adding password:', error);
      toast.error('পাসওয়ার্ড যোগ করতে ব্যর্থ');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePassword = async (id: string) => {
    try {
      const { error } = await supabase
        .from('zip_passwords')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('পাসওয়ার্ড মুছে ফেলা হয়েছে');
      fetchPasswords();
    } catch (error) {
      console.error('Error deleting password:', error);
      toast.error('পাসওয়ার্ড মুছতে ব্যর্থ');
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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar onSignOut={handleSignOut} />
        
        <div className="flex-1 flex flex-col">
          <header className="h-14 sm:h-16 border-b bg-card/50 backdrop-blur flex items-center justify-between px-3 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-4">
              <SidebarTrigger />
              <h1 className="text-lg sm:text-2xl font-bold font-bengali truncate">ZIP পাসওয়ার্ড ম্যানেজমেন্ট</h1>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 p-3 sm:p-6 overflow-auto">
            <div className="max-w-4xl space-y-4 sm:space-y-6">
              {/* Add Password Form */}
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="font-bengali flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    নতুন পাসওয়ার্ড যোগ করুন
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="font-bengali">পাসওয়ার্ড *</Label>
                      <Input
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="পাসওয়ার্ড লিখুন"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bengali">প্রযোজ্য মাস (YYYY-MM)</Label>
                      <Input
                        type="month"
                        value={applicableMonth}
                        onChange={(e) => setApplicableMonth(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bengali">বিবরণ</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="পাসওয়ার্ড সম্পর্কে বিস্তারিত..."
                      rows={3}
                    />
                  </div>
                  <Button 
                    onClick={handleAddPassword} 
                    disabled={saving}
                    className="font-bengali"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {saving ? 'যোগ করা হচ্ছে...' : 'পাসওয়ার্ড যোগ করুন'}
                  </Button>
                </CardContent>
              </Card>

              {/* Passwords List */}
              <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <CardHeader>
                  <CardTitle className="font-bengali flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    সংরক্ষিত পাসওয়ার্ড ({passwords.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dataLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                      ))}
                    </div>
                  ) : passwords.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Key className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p className="font-bengali">কোনো পাসওয়ার্ড নেই</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {passwords.map((pwd, index) => (
                        <div 
                          key={pwd.id} 
                          className="p-4 rounded-lg border bg-muted/50 hover:bg-muted transition-colors animate-fade-in"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-3">
                                <code className="px-3 py-1 rounded bg-primary/10 text-primary font-mono text-lg font-bold">
                                  {pwd.password}
                                </code>
                                {pwd.applicable_month && (
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>{pwd.applicable_month}</span>
                                  </div>
                                )}
                              </div>
                              {pwd.description && (
                                <p className="text-sm text-muted-foreground">{pwd.description}</p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                যোগ করা হয়েছে: {new Date(pwd.created_at).toLocaleDateString('bn-BD')}
                              </p>
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="font-bengali">নিশ্চিত করুন</AlertDialogTitle>
                                  <AlertDialogDescription className="font-bengali">
                                    আপনি কি এই পাসওয়ার্ডটি মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="font-bengali">বাতিল</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeletePassword(pwd.id)}
                                    className="font-bengali"
                                  >
                                    মুছে ফেলুন
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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

export default AdminPasswords;
