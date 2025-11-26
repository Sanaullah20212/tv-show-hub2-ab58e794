import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { useEffect } from "react";
import { getDeviceFingerprint } from "@/utils/deviceFingerprint";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminSessions from "./pages/admin/AdminSessions";
import AdminPasswords from "./pages/admin/AdminPasswords";
import AdminAudit from "./pages/admin/AdminAudit";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminDriveCheck from "./pages/admin/AdminDriveCheck";
import AdminRevenue from "./pages/admin/AdminRevenue";
import TvAccess from "./pages/TvAccess";
import DriveAccess from "./pages/DriveAccess";
import Plans from "./pages/Plans";
import Settings from "./pages/Settings";
import UserSettings from "./pages/UserSettings";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Pre-load device fingerprint in background for faster login
  useEffect(() => {
    getDeviceFingerprint().catch(err => 
      console.error('Failed to pre-load device fingerprint:', err)
    );
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
                <Route path="/admin/sessions" element={<AdminSessions />} />
                <Route path="/admin/passwords" element={<AdminPasswords />} />
                <Route path="/admin/audit" element={<AdminAudit />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
                <Route path="/admin/drive-check" element={<AdminDriveCheck />} />
                <Route path="/admin/revenue" element={<AdminRevenue />} />
                <Route path="/tv-access" element={<TvAccess />} />
                <Route path="/drive-access" element={<DriveAccess />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/settings" element={<UserSettings />} />
                <Route path="/admin-settings" element={<Settings />} />
                <Route path="/support" element={<Support />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
