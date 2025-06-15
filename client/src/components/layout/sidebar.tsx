import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { t, isRTL, getCurrentLanguage, addLanguageChangeListener } from "@/lib/i18n";
import logoImage from "@assets/الواصلون (1)_1749400506920.png";
import {
  Home,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Banknote,
  ClipboardList,
  Settings,
  ChevronLeft,
  ChevronRight,
  PieChart,
  Users,
  Menu,
  X,
  Warehouse
} from "lucide-react";

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  isActive: boolean;
  collapsed: boolean;
  onClick?: () => void;
}

function SidebarItem({ href, icon, title, isActive, collapsed, onClick }: SidebarItemProps) {
  return (
    <Link href={href}>
      <Button
        variant={isActive ? "default" : "ghost"}
        className={cn(
          "w-full justify-start h-12 px-3",
          collapsed ? "px-2" : "px-3",
          isActive && "bg-primary text-primary-foreground shadow-md"
        )}
        onClick={onClick}
      >
        <div className="flex items-center gap-3">
          <div className="shrink-0">{icon}</div>
          {!collapsed && (
            <span className="font-medium text-sm">{title}</span>
          )}
        </div>
      </Button>
    </Link>
  );
}

export function Sidebar() {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(false); // Always expanded on mobile when open
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile sidebar when route changes
  useEffect(() => {
    if (isMobile) {
      setMobileOpen(false);
    }
  }, [location, isMobile]);

  // Listen for language changes
  useEffect(() => {
    const unsubscribe = addLanguageChangeListener(() => {
      setCurrentLang(getCurrentLanguage());
    });
    return unsubscribe;
  }, []);

  // Sidebar items
  const items = [
    {
      href: "/",
      icon: <Home className="h-5 w-5" />,
      title: t("home"),
    },
    {
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      title: t("dashboard"),
    },

    {
      href: "/sales",
      icon: <ShoppingCart className="h-5 w-5" />,
      title: t("sales"),
    },
    {
      href: "/expenses",
      icon: <Banknote className="h-5 w-5" />,
      title: t("expenses"),
    },
    {
      href: "/workers",
      icon: <Users className="h-5 w-5" />,
      title: t("workers"),
    },
    {
      href: "/storage",
      icon: <Warehouse className="h-5 w-5" />,
      title: t("storage"),
    },
    {
      href: "/activity-logs",
      icon: <ClipboardList className="h-5 w-5" />,
      title: t("activityLogs"),
    },
    {
      href: "/reports",
      icon: <PieChart className="h-5 w-5" />,
      title: t("reports"),
    },
    {
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
      title: t("settings"),
    },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-background">
      {/* Logo/header */}
      <div className="px-4 py-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
              <img 
                src={logoImage} 
                alt="Al-Wasiloon Logo" 
                className="w-10 h-10 object-contain"
              />
            </div>
            {(!collapsed || isMobile) && (
              <div className="min-w-0">
                <h2 className="text-lg font-bold leading-tight text-foreground">{t("appTitle")}</h2>
                <p className="text-xs text-muted-foreground">{t("appSubtitle")}</p>
              </div>
            )}
          </div>
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="h-8 w-8 shrink-0"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          )}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(false)}
              aria-label="Close sidebar"
              className="h-8 w-8 shrink-0 md:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {(!collapsed || isMobile) && (
          <div className="mt-3 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
            {t("version")}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
        {items.map((item) => (
          <SidebarItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            title={item.title}
            isActive={location === item.href || (item.href === "/dashboard" && location === "/")}
            collapsed={collapsed && !isMobile}
            onClick={() => isMobile && setMobileOpen(false)}
          />
        ))}
      </nav>
      
      {/* Footer */}
      {(!collapsed || isMobile) && (
        <div className="px-4 py-3 border-t bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            {t("appDescription")}
          </p>
        </div>
      )}
    </div>
  );

  // Mobile sidebar
  if (isMobile) {
    return (
      <>
        {/* Mobile menu button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 z-50 h-12 w-12 md:hidden bg-background/95 backdrop-blur border-2 shadow-lg"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </Button>

        {/* Mobile sidebar overlay */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="p-0 w-[300px] sm:w-[350px]">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // Desktop sidebar
  return (
    <div
      className={cn(
        "flex-shrink-0 border-r transition-all duration-300 ease-in-out bg-background",
        collapsed ? "w-[80px]" : "w-[280px]"
      )}
    >
      <SidebarContent />
    </div>
  );
}

// Mobile menu trigger component for navbar
export function MobileMenuTrigger() {
  const [mobileOpen, setMobileOpen] = useState(false);
  
  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-10 w-10"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-[300px]">
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
}