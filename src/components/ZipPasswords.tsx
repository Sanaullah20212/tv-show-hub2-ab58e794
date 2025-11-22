import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Key, Copy, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { formatDateBengali } from '@/lib/utils';

const ZipPasswords = () => {
  const [passwords, setPasswords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchPasswords();
  }, []);

  const fetchPasswords = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        console.log('No user ID available');
        setPasswords([]);
        return;
      }

      console.log('Fetching passwords for user:', user.id);
      
      // RLS policy will automatically filter passwords based on subscription
      // Just fetch all passwords - RLS will handle the filtering
      const { data, error } = await supabase
        .from('zip_passwords')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching passwords:', error);
        setPasswords([]);
        return;
      }

      console.log('Passwords from database (filtered by RLS):', data);
      setPasswords(data || []);
    } catch (error) {
      console.error('Error in fetchPasswords:', error);
      setPasswords([]);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (passwordId: string) => {
    const newVisible = new Set(visiblePasswords);
    if (newVisible.has(passwordId)) {
      newVisible.delete(passwordId);
    } else {
      newVisible.add(passwordId);
    }
    setVisiblePasswords(newVisible);
  };

  const copyToClipboard = async (password: string) => {
    try {
      await navigator.clipboard.writeText(password);
      toast({
        title: "কপি সফল",
        description: "পাসওয়ার্ড ক্লিপবোর্ডে কপি করা হয়েছে।",
      });
    } catch (error) {
      toast({
        title: "কপি ব্যর্থ",
        description: "পাসওয়ার্ড কপি করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-muted rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (passwords.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Key className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            কোন জিপ পাসওয়ার্ড পাওয়া যায়নি।
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Key className="h-5 w-5 text-tier-business" />
        <h3 className="text-lg font-semibold">জিপ ফাইল পাসওয়ার্ড</h3>
        <Badge variant="secondary">{passwords.length} টি পাসওয়ার্ড</Badge>
      </div>

      <div className="space-y-3">
        {passwords.map((passwordItem) => {
          const isVisible = visiblePasswords.has(passwordItem.id);
          
          return (
            <Card key={passwordItem.id} className="border-l-4 border-l-tier-business">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    {passwordItem.description || 'জিপ ফাইল পাসওয়ার্ড'}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {formatDateBengali(passwordItem.created_at)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                  <div className="font-mono text-sm">
                    {isVisible ? passwordItem.password : '•'.repeat(passwordItem.password.length)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePasswordVisibility(passwordItem.id)}
                    >
                      {isVisible ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(passwordItem.password)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  পাসওয়ার্ড দেখতে চোখের আইকনে ক্লিক করুন, কপি করতে কপি আইকনে ক্লিক করুন।
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ZipPasswords;