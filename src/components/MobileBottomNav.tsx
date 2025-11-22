import { Home, Settings, HelpCircle, FolderOpen } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "হোম", path: "/dashboard" },
    { icon: FolderOpen, label: "ড্রাইভ", path: "/drive-access" },
    { icon: HelpCircle, label: "সাহায্য", path: "/support" },
    { icon: Settings, label: "সেটিংস", path: "/settings" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden animate-slide-in-right">
      <nav className="flex items-center justify-around h-16 px-2">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-200",
                "hover:bg-accent rounded-lg",
                isActive && "text-primary"
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Icon className={cn(
                "h-5 w-5 transition-transform",
                isActive && "scale-110"
              )} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileBottomNav;
