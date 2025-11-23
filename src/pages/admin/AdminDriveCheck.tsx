import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HardDrive, Loader2 } from "lucide-react";
import DriveExplorer from "@/components/DriveExplorer";

export default function AdminDriveCheck() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (profile?.role !== "admin") {
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar onSignOut={handleSignOut} />
        <main className="flex-1 overflow-auto">
          <div className="container py-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <HardDrive className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold font-bengali">ড্রাইভ চেক</h1>
                <p className="text-muted-foreground font-bengali">
                  মোবাইল এবং বিজনেস ইউজারের ড্রাইভ পরীক্ষা করুন
                </p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="font-bengali">ড্রাইভ ফাইল ব্রাউজার</CardTitle>
                <CardDescription className="font-bengali">
                  উভয় ড্রাইভের ফাইল এবং ফোল্ডার দেখুন এবং চেক করুন
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="mobile" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="mobile" className="font-bengali">
                      মোবাইল ড্রাইভ
                    </TabsTrigger>
                    <TabsTrigger value="business" className="font-bengali">
                      বিজনেস ড্রাইভ
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="mobile" className="mt-6">
                    <div className="rounded-lg border bg-card">
                      <DriveExplorer userType="mobile" />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="business" className="mt-6">
                    <div className="rounded-lg border bg-card">
                      <DriveExplorer userType="business" />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
