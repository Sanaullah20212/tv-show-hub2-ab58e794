import { LayoutDashboard, Users, CreditCard, FileArchive, Key, Settings, BarChart3, Bell, FileText, LogOut, HardDrive, DollarSign } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

interface AdminSidebarProps {
  onSignOut: () => void;
}

const menuItems = [
  { title: "ড্যাশবোর্ড", url: "/admin", icon: LayoutDashboard, end: true },
  { title: "অ্যানালিটিক্স", url: "/admin/analytics", icon: BarChart3 },
  { title: "আয়ের পরিসংখ্যান", url: "/admin/revenue", icon: DollarSign },
  { title: "ব্যবহারকারী", url: "/admin/users", icon: Users },
  { title: "সাবস্ক্রিপশন", url: "/admin/subscriptions", icon: CreditCard },
  { title: "সেশন ম্যানেজমেন্ট", url: "/admin/sessions", icon: Shield },
  { title: "ড্রাইভ চেক", url: "/admin/drive-check", icon: HardDrive },
  { title: "ZIP পাসওয়ার্ড", url: "/admin/passwords", icon: Key },
  { title: "অডিট লগ", url: "/admin/audit", icon: FileText },
  { title: "সেটিংস", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar({ onSignOut }: AdminSidebarProps) {
  const { open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string, end?: boolean) => {
    if (end) {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

  return (
    <Sidebar className={open ? "w-64" : "w-16"} collapsible="icon">
      <SidebarContent>
        {/* Header */}
        <div className={`p-4 border-b ${open ? "" : "px-2"}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg gradient-primary">
              <Shield className="h-6 w-6 text-white" />
            </div>
            {open && (
              <div>
                <h2 className="font-bold text-lg font-bengali">অ্যাডমিন প্যানেল</h2>
                <p className="text-xs text-muted-foreground font-bengali">ম্যানেজমেন্ট সিস্টেম</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={open ? "" : "sr-only"}>মেনু</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.end}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all hover:bg-accent ${
                          isActive ? "bg-primary/10 text-primary font-medium" : ""
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {open && <span className="font-bengali">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Footer */}
        <div className="mt-auto p-4 border-t">
          <Button
            onClick={onSignOut}
            variant="outline"
            className={`w-full ${open ? "" : "px-2"}`}
          >
            <LogOut className="h-5 w-5" />
            {open && <span className="ml-2 font-bengali">লগ আউট</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
