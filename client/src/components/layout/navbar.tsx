import { useState, useEffect } from "react";
import { Bell, Search, User, LogOut, Settings, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { t, getCurrentLanguage, toggleLanguage, addLanguageChangeListener } from "@/lib/i18n";

export function Navbar() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Listen for language changes
  useEffect(() => {
    const unsubscribe = addLanguageChangeListener(() => {
      setCurrentLang(getCurrentLanguage());
    });
    return unsubscribe;
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        
        {/* Left side - Search on desktop, spacing on mobile */}
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile: Leave space for hamburger menu */}
          <div className="w-16 md:w-0"></div>
          
          {/* Search - hidden on mobile, shown on desktop */}
          {!isMobile && (
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t("search")}
                className="pl-9 h-9 bg-muted/50"
              />
            </div>
          )}
        </div>

        {/* Center - Title and time */}
        <div className="flex items-center gap-4">
          {/* Mobile: Show compact info */}
          {isMobile ? (
            <div className="text-center">
              <div className="text-sm font-semibold text-foreground">
                {t("appSubtitle")}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatTime(currentTime)}
              </div>
            </div>
          ) : (
            /* Desktop: Show full info */
            <div className="text-center">
              <div className="text-sm font-semibold text-foreground">
                {t("appTitle")} {t("appSubtitle")}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDate(currentTime)} • {formatTime(currentTime)}
              </div>
            </div>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2 md:gap-4 flex-1 justify-end">
          
          {/* Mobile search button */}
          {isMobile && (
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Search className="h-4 w-4" />
            </Button>
          )}

          {/* Language toggle button */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="h-9 px-3 bg-background/50 backdrop-blur border-2 hover:bg-accent transition-all"
            title={currentLang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
          >
            <Globe className="h-4 w-4 mr-2" />
            <span className="font-medium">
              {currentLang === 'ar' ? 'EN' : 'ع'}
            </span>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative h-9 w-9">
            <Bell className="h-4 w-4" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              3
            </Badge>
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/01.png" alt="@user" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    FF
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{t("factoryManager")}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    manager@fertilizer.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>{t("profile")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>{t("settings")}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t("logout")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}