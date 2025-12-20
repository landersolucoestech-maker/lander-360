import { Megaphone, Music, Settings, ChevronDown, LogOut, Palette, DollarSign, Upload } from "lucide-react";
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
  musicRegistryItems,
  financeiroItems,
  distribuicaoItems,
  getFilteredNavigation, 
  getFilteredMarketingItems,
  getFilteredMusicRegistryItems,
  getFilteredFinanceiroItems,
  getFilteredDistribuicaoItems,
  shouldShowMarketing,
  shouldShowMusicRegistry,
  shouldShowFinanceiro,
  shouldShowDistribuicao,
  roleDisplayNames 
} from "@/lib/permissions";

interface AppSidebarProps {
  className?: string;
}

export function AppSidebar({ className }: AppSidebarProps) {
  const [isMarketingOpen, setIsMarketingOpen] = useState(false);
  const [isMusicRegistryOpen, setIsMusicRegistryOpen] = useState(false);
  const [isDistribuicaoOpen, setIsDistribuicaoOpen] = useState(false);
  const [isFinanceiroOpen, setIsFinanceiroOpen] = useState(false);
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

  const filteredMusicRegistryItems = useMemo(() => {
    if (rolesLoading || roles.length === 0) {
      return musicRegistryItems;
    }
    return getFilteredMusicRegistryItems(roles);
  }, [roles, rolesLoading]);

  const filteredFinanceiroItems = useMemo(() => {
    if (rolesLoading || roles.length === 0) {
      return financeiroItems;
    }
    return getFilteredFinanceiroItems(roles);
  }, [roles, rolesLoading]);

  const showMarketing = useMemo(() => {
    if (rolesLoading || roles.length === 0) return true;
    return shouldShowMarketing(roles);
  }, [roles, rolesLoading]);

  const showMusicRegistry = useMemo(() => {
    if (rolesLoading || roles.length === 0) return true;
    return shouldShowMusicRegistry(roles);
  }, [roles, rolesLoading]);

  const showFinanceiro = useMemo(() => {
    if (rolesLoading || roles.length === 0) return true;
    return shouldShowFinanceiro(roles);
  }, [roles, rolesLoading]);

  const filteredDistribuicaoItems = useMemo(() => {
    if (rolesLoading || roles.length === 0) {
      return distribuicaoItems;
    }
    return getFilteredDistribuicaoItems(roles);
  }, [roles, rolesLoading]);

  const showDistribuicao = useMemo(() => {
    if (rolesLoading || roles.length === 0) return true;
    return shouldShowDistribuicao(roles);
  }, [roles, rolesLoading]);

  // Items that are rendered inline from navigationConfig (excluding special items)
  // Exclude "Registro de Músicas", "Financeiro", "Marketing" since they are handled separately
  const excludedFromMain = ['Registro de Músicas', 'Financeiro', 'Configurações', 'Aparência'];
  
  // Items before Registro de Músicas (Dashboard, Artistas, Projetos)
  const beforeMusicRegistry = filteredNavigation.filter(item => 
    ['Dashboard', 'Artistas', 'Projetos'].includes(item.title)
  );
  
  // Items after Distribuição up to and including Financeiro order:
  // Gestão de Shares, Contratos - then Financeiro is separate
  const afterDistribuicao = filteredNavigation.filter(item => 
    ['Gestão de Shares', 'Contratos'].includes(item.title)
  );
  
  // Items after Financeiro: Serviços, Agenda, Nota Fiscal, Inventário, LanderZap, Usuários, CRM
  const afterFinanceiro = filteredNavigation.filter(item => 
    ['Serviços', 'Agenda', 'Nota Fiscal', 'Inventário', 'LanderZap', 'Usuários', 'CRM'].includes(item.title)
  );
  
  // Items after Marketing: Relatórios (Auditoria is now a tab inside Relatórios)
  const afterMarketing = filteredNavigation.filter(item => 
    item.title === 'Relatórios'
  );

  const settingsItems = filteredNavigation.filter(item => 
    item.title === 'Configurações'
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
  const isMusicRegistryActive = currentPath === "/registro-musicas" || filteredMusicRegistryItems.some(item => {
    const baseUrl = item.url.split('?')[0];
    return currentPath === baseUrl || currentPath.startsWith(baseUrl + '/');
  });
  const isFinanceiroActive = currentPath === "/financeiro" || currentPath.startsWith("/financeiro/") || filteredFinanceiroItems.some(item => currentPath.startsWith(item.url));
  const isDistribuicaoActive = currentPath === "/lancamentos" || filteredDistribuicaoItems.some(item => currentPath.startsWith(item.url));

  return (
    <Sidebar className={cn("border-r border-sidebar-border", className)}>
      <SidebarHeader className="border-b border-sidebar-border p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center">
            <img src="/assets/a21a1ab1-df8a-4b7b-a1e4-0e36f63eff02.png" alt="Lander 360º Logo" className="h-10 w-auto object-contain" />
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
              {/* Dashboard, Artistas, Projetos */}
              {beforeMusicRegistry.map(item => (
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

              {/* Registro de Músicas dropdown */}
              {showMusicRegistry && (
                <SidebarMenuItem>
                  <div className={cn(
                    "flex items-center w-full hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md",
                    (isMusicRegistryActive || currentPath === "/registro-musicas") && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}>
                    <div className="flex items-center gap-3 px-3 py-2.5 flex-1 cursor-default">
                      <Music className="h-4 w-4" />
                      <span className="font-medium">Registro de Músicas</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setIsMusicRegistryOpen(!isMusicRegistryOpen);
                      }}
                      className="p-2 hover:bg-sidebar-accent rounded-md"
                    >
                      <ChevronDown className={cn("h-4 w-4 transition-transform", isMusicRegistryOpen && "rotate-180")} />
                    </button>
                  </div>
                  {isMusicRegistryOpen && (
                    <SidebarMenuSub className="mt-1 space-y-1">
                      {filteredMusicRegistryItems.map(subItem => (
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

              {/* Lançamentos dropdown */}
              {showDistribuicao && (
                <SidebarMenuItem>
                  <div className={cn(
                    "flex items-center w-full hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md",
                    isDistribuicaoActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}>
                    <div className="flex items-center gap-3 px-3 py-2.5 flex-1 cursor-default">
                      <Upload className="h-4 w-4" />
                      <span className="font-medium">Lançamentos</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setIsDistribuicaoOpen(!isDistribuicaoOpen);
                      }}
                      className="p-2 hover:bg-sidebar-accent rounded-md"
                    >
                      <ChevronDown className={cn("h-4 w-4 transition-transform", isDistribuicaoOpen && "rotate-180")} />
                    </button>
                  </div>
                  {isDistribuicaoOpen && (
                    <SidebarMenuSub className="mt-1 space-y-1">
                      {filteredDistribuicaoItems.map(subItem => (
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

              {/* Gestão de Shares, Contratos */}
              {afterDistribuicao.map(item => (
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

              {/* Financeiro dropdown */}
              {showFinanceiro && (
                <SidebarMenuItem>
                  <div className={cn(
                    "flex items-center w-full hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md",
                    isFinanceiroActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}>
                    <div className="flex items-center gap-3 px-3 py-2.5 flex-1 cursor-default">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-medium">Financeiro</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setIsFinanceiroOpen(!isFinanceiroOpen);
                      }}
                      className="p-2 hover:bg-sidebar-accent rounded-md"
                    >
                      <ChevronDown className={cn("h-4 w-4 transition-transform", isFinanceiroOpen && "rotate-180")} />
                    </button>
                  </div>
                  {isFinanceiroOpen && (
                    <SidebarMenuSub className="mt-1 space-y-1">
                      {filteredFinanceiroItems.map(subItem => (
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

              {/* Serviços, Agenda, Nota Fiscal, Inventário, LanderZap, Usuários, CRM */}
              {afterFinanceiro.map(item => (
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

              {/* Auditoria, Relatórios */}
              {afterMarketing.map(item => (
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

              {/* Marketing dropdown - after Relatórios */}
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
