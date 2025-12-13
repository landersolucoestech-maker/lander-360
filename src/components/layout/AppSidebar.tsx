import { Megaphone, Settings, ChevronDown, LogOut, Palette } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton, SidebarFooter } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { 
  navigationConfig, 
  marketingItems, 
  getFilteredNavigation, 
  getFilteredMarketingItems, 
  shouldShowMarketing,
  roleDisplayNames 
} from "@/lib/permissions";

interface AppSidebarProps {
  className?: string;
}

export function AppSidebar({ className }: AppSidebarProps) {
  const [isMarketingOpen, setIsMarketingOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { roles, primaryRole, isLoading: rolesLoading } = useUserRole();

  // Filter navigation based on user roles
  const filteredNavigation = useMemo(() => {
    if (rolesLoading || roles.length === 0) {
      // While loading, show full menu for admin/manager legacy users
      return navigationConfig;
    }
    return getFilteredNavigation(roles);
  }, [roles, rolesLoading]);

  const filteredMarketingItems = useMemo(() => {
    if (rolesLoading || roles.length === 0) {
      return marketingItems;
    }
    return getFilteredMarketingItems(roles);
  }, [roles, rolesLoading]);

  const showMarketing = useMemo(() => {
    if (rolesLoading || roles.length === 0) return true;
    return shouldShowMarketing(roles);
  }, [roles, rolesLoading]);

  // Separate items: main items (before Marketing) and bottom items (after Marketing)
  const mainNavigationItems = filteredNavigation.filter(item => 
    !['Relatórios', 'Auditoria', 'LanderZap', 'Usuários', 'Configurações', 'Aparência'].includes(item.title)
  );

  const bottomNavigationItems = filteredNavigation.filter(item => 
    ['Relatórios', 'Auditoria', 'LanderZap', 'Usuários'].includes(item.title)
  );

  const settingsItems = filteredNavigation.filter(item => 
    ['Configurações', 'Aparência'].includes(item.title)
  );

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      toast({
        title: "Erro ao sair",
        description: "Não foi possível encerrar a sessão",
        variant: "destructive"
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getUserInitials = () => {
    if (!user?.email) return 'U';
    return user.email.substring(0, 2).toUpperCase();
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.email) return user.email.split('@')[0];
    return 'Usuário';
  };

  const isActive = (url: string) => {
    if (url === "/") return currentPath === "/";
    if (url.includes('#')) {
      const baseUrl = url.split('#')[0];
      return currentPath === baseUrl;
    }
    return currentPath.startsWith(url);
  };

  const isMarketingActive = filteredMarketingItems.some(item => currentPath.startsWith(item.url));

  return (
    <Sidebar className={cn("border-r border-sidebar-border", className)}>
      <SidebarHeader className="border-b border-sidebar-border p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center">
            <img src="/lovable-uploads/a21a1ab1-df8a-4b7b-a1e4-0e36f63eff02.png" alt="Lander 360º Logo" className="h-10 w-auto object-contain" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground whitespace-nowrap">LANDER 360º</h1>
            {!rolesLoading && roles.length > 0 && (
              <p className="text-xs text-muted-foreground">{roleDisplayNames[primaryRole]}</p>
            )}
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {/* Main navigation items */}
              {mainNavigationItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={cn(
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive(item.url) && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}>
                    <Link to={item.url} className="flex items-center gap-3 px-3 py-2.5 rounded-md">
                      <item.icon className="h-4 w-4" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Marketing dropdown */}
              {showMarketing && (
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => setIsMarketingOpen(!isMarketingOpen)} 
                    className={cn(
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex items-center gap-3 px-3 py-2.5 rounded-md",
                      isMarketingActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                  >
                    <Megaphone className="h-4 w-4" />
                    <span className="font-medium">Marketing</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform ml-auto", isMarketingOpen && "rotate-180")} />
                  </SidebarMenuButton>
                  {isMarketingOpen && (
                    <SidebarMenuSub className="mt-1 space-y-1">
                      {filteredMarketingItems.map(subItem => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild className={cn(
                            isActive(subItem.url) && "bg-sidebar-accent text-sidebar-accent-foreground"
                          )}>
                            <Link to={subItem.url} className="flex items-center gap-3 px-3 py-2.5 rounded-md ml-6">
                              <span className="font-medium text-sm">{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              )}

              {/* Bottom navigation items (after Marketing) */}
              {bottomNavigationItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={cn(
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive(item.url) && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}>
                    <Link to={item.url} className="flex items-center gap-3 px-3 py-2.5 rounded-md">
                      <item.icon className="h-4 w-4" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {/* Settings items */}
              {settingsItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={cn(
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive(item.url) && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}>
                    <Link to={item.url} className="flex items-center gap-3 px-3 py-2">
                      <item.icon className="h-4 w-4" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <ThemeToggle />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4 space-y-2">
        <Link 
          to="/perfil" 
          className={cn(
            "flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors",
            isActive("/perfil") && "bg-sidebar-accent"
          )}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">{getUserInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{getUserDisplayName()}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </Link>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleSignOut}
          disabled={isLoggingOut}
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          {isLoggingOut ? "Saindo..." : "Sair"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
