import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Key, 
  Settings, 
  BarChart3, 
  FileText, 
  LogOut, 
  HardDrive, 
  DollarSign,
  Shield,
  Play,
  ChevronDown,
  Home
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

interface AdminSidebarProps {
  onSignOut: () => void;
}

// Grouped menu items for better organization
const menuGroups = [
  {
    label: "প্রধান",
    items: [
      { 
        title: "ড্যাশবোর্ড", 
        description: "সংক্ষিপ্ত বিবরণ", 
        url: "/admin", 
        icon: LayoutDashboard, 
        end: true,
        color: "primary"
      },
      { 
        title: "অ্যানালিটিক্স", 
        description: "পরিসংখ্যান দেখুন", 
        url: "/admin/analytics", 
        icon: BarChart3,
        color: "info"
      },
      { 
        title: "আয়ের রিপোর্ট", 
        description: "আয়-ব্যয় হিসাব", 
        url: "/admin/revenue", 
        icon: DollarSign,
        color: "success"
      },
    ]
  },
  {
    label: "ব্যবহারকারী ও অ্যাক্সেস",
    items: [
      { 
        title: "মেম্বার", 
        description: "ইউজার ও সাবস্ক্রিপশন", 
        url: "/admin/members", 
        icon: Users,
        color: "primary"
      },
      { 
        title: "সেশন", 
        description: "ডিভাইস ম্যানেজ", 
        url: "/admin/sessions", 
        icon: Shield,
        color: "warning"
      },
    ]
  },
  {
    label: "কন্টেন্ট ম্যানেজমেন্ট",
    items: [
      { 
        title: "ড্রাইভ চেক", 
        description: "ফাইল পরীক্ষা", 
        url: "/admin/drive-check", 
        icon: HardDrive,
        color: "info"
      },
      { 
        title: "ZIP পাসওয়ার্ড", 
        description: "পাসওয়ার্ড সেট", 
        url: "/admin/passwords", 
        icon: Key,
        color: "warning"
      },
    ]
  },
  {
    label: "সিস্টেম",
    items: [
      { 
        title: "অডিট লগ", 
        description: "কার্যকলাপ দেখুন", 
        url: "/admin/audit", 
        icon: FileText,
        color: "muted"
      },
      { 
        title: "সেটিংস", 
        description: "সাইট সেটিংস", 
        url: "/admin/settings", 
        icon: Settings,
        color: "muted"
      },
    ]
  },
];

export function AdminSidebar({ onSignOut }: AdminSidebarProps) {
  const { open } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["প্রধান", "ব্যবহারকারী ও অ্যাক্সেস"]);

  const isActive = (path: string, end?: boolean) => {
    if (end) {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => 
      prev.includes(label) 
        ? prev.filter(g => g !== label)
        : [...prev, label]
    );
  };

  return (
    <Sidebar className={open ? "w-64" : "w-16"} collapsible="icon">
      <SidebarContent className="flex flex-col h-full">
        {/* Header */}
        <div className={`p-4 border-b bg-gradient-to-br from-primary/10 to-transparent ${open ? "" : "px-2"}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg">
              <Play className="h-5 w-5 text-white fill-white/50" />
            </div>
            {open && (
              <div>
                <h2 className="font-bold text-base font-bengali">অ্যাডমিন প্যানেল</h2>
                <p className="text-[10px] text-muted-foreground font-bengali">BTSPRO24.COM</p>
              </div>
            )}
          </div>
        </div>

        {/* Home Button */}
        <div className={`px-3 pt-3 ${open ? "" : "px-2"}`}>
          <Button 
            variant="outline" 
            size="sm" 
            className={`w-full justify-start gap-2 text-xs ${open ? "" : "px-2"}`}
            onClick={() => navigate('/')}
          >
            <Home className="h-4 w-4" />
            {open && <span className="font-bengali">হোম পেজে যান</span>}
          </Button>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto py-2">
          {menuGroups.map((group) => (
            <SidebarGroup key={group.label} className="py-1">
              {open ? (
                <Collapsible 
                  open={expandedGroups.includes(group.label)}
                  onOpenChange={() => toggleGroup(group.label)}
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
                    <span className="font-bengali">{group.label}</span>
                    <ChevronDown className={`h-3 w-3 transition-transform ${expandedGroups.includes(group.label) ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {group.items.map((item) => (
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild>
                              <NavLink
                                to={item.url}
                                end={item.end}
                                className={({ isActive }) =>
                                  `flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg transition-all ${
                                    isActive 
                                      ? "bg-primary/15 text-primary border-l-2 border-primary" 
                                      : "hover:bg-muted"
                                  }`
                                }
                              >
                                <div className={`p-1.5 rounded-md ${isActive(item.url, item.end) ? 'bg-primary/20' : 'bg-muted'}`}>
                                  <item.icon className={`h-4 w-4 ${isActive(item.url, item.end) ? 'text-primary' : 'text-muted-foreground'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="font-bengali text-sm font-medium block">{item.title}</span>
                                  <span className="font-bengali text-[10px] text-muted-foreground block truncate">{item.description}</span>
                                </div>
                              </NavLink>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.url}
                            end={item.end}
                            title={item.title}
                            className={({ isActive }) =>
                              `flex items-center justify-center p-2 mx-1 rounded-lg transition-all ${
                                isActive 
                                  ? "bg-primary/15 text-primary" 
                                  : "hover:bg-muted"
                              }`
                            }
                          >
                            <item.icon className={`h-5 w-5 ${isActive(item.url, item.end) ? 'text-primary' : 'text-muted-foreground'}`} />
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              )}
            </SidebarGroup>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t bg-muted/30">
          <Button
            onClick={onSignOut}
            variant="ghost"
            size="sm"
            className={`w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 ${open ? "" : "px-2 justify-center"}`}
          >
            <LogOut className="h-4 w-4" />
            {open && <span className="font-bengali text-sm">লগ আউট</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
