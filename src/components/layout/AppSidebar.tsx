import { LayoutDashboard, Users, FolderOpen, Music, Upload, FileText, DollarSign, Calendar, Receipt, Package, UserCheck, BarChart3, UserCog, Megaphone, Settings, ChevronDown, LogOut, Briefcase, FileSearch, Scale, MessageCircle } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton, SidebarFooter } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
const navigationItems = [{
  title: "Dashboard",
  url: "/",
  icon: LayoutDashboard
}, {
  title: "Artistas",
  url: "/artistas",
  icon: Users
}, {
  title: "Projetos",
  url: "/projetos",
  icon: FolderOpen
}, {
  title: "Registro de Músicas",
  url: "/registro-musicas",
  icon: Music
}, {
  title: "Lançamentos",
  url: "/lancamentos",
  icon: Upload
}, {
  title: "Contratos",
  url: "/contratos",
  icon: FileText
}, {
  title: "Financeiro",
  url: "/financeiro",
  icon: DollarSign
}, {
  title: "Agenda",
  url: "/agenda",
  icon: Calendar
}, {
  title: "Nota Fiscal",
  url: "/nota-fiscal",
  icon: Receipt
}, {
  title: "Inventário",
  url: "/inventario",
  icon: Package
}, {
  title: "CRM",
  url: "/crm",
  icon: UserCheck
}, {
  title: "Serviços",
  url: "/servicos",
  icon: Briefcase
}, {
  title: "Gestão de Shares",
  url: "/gestao-shares",
  icon: Scale
}, {
  title: "Auditoria",
  url: "/relatorios-autorais",
  icon: FileSearch
}, {
  title: "Usuários",
  url: "/usuarios",
  icon: UserCog
}, {
  title: "Relatórios",
  url: "/relatorios",
  icon: BarChart3
}, {
  title: "LanderZap",
  url: "/lander",
  icon: MessageCircle
}];
const marketingItems = [{
  title: "Visão Geral",
  url: "/marketing/visao-geral"
}, {
  title: "Planejamento de Campanhas",
  url: "/marketing/campanhas"
}, {
  title: "Gestão de Tarefas",
  url: "/marketing/tarefas"
}, {
  title: "Calendário de Conteúdo",
  url: "/marketing/calendario"
}, {
  title: "Métricas e Resultados",
  url: "/marketing/metricas"
}, {
  title: "Central de Briefing",
  url: "/marketing/briefing"
}];
interface AppSidebarProps {
  className?: string;
}
export function AppSidebar({
  className
}: AppSidebarProps) {
  const [isMarketingOpen, setIsMarketingOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { user, signOut } = useAuth();
  const { toast } = useToast();

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
    return currentPath.startsWith(url);
  };

  const isMarketingActive = marketingItems.some(item => currentPath.startsWith(item.url));

  return <Sidebar className={cn("border-r border-sidebar-border", className)}>
      <SidebarHeader className="border-b border-sidebar-border p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center">
            <img src="/lovable-uploads/a21a1ab1-df8a-4b7b-a1e4-0e36f63eff02.png" alt="Lander 360º Logo" className="h-10 w-auto object-contain" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground whitespace-nowrap">LANDER 360º</h1>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={cn(
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive(item.url) && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}>
                    <Link to={item.url} className="flex items-center gap-3 px-3 py-2.5 rounded-md">
                      <item.icon className="h-4 w-4" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}

              {/* Marketing dropdown */}
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setIsMarketingOpen(!isMarketingOpen)} className={cn(
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex items-center gap-3 px-3 py-2.5 rounded-md",
                  isMarketingActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}>
                  <Megaphone className="h-4 w-4" />
                  <span className="font-medium">Marketing</span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform ml-auto", isMarketingOpen && "rotate-180")} />
                </SidebarMenuButton>
                {isMarketingOpen && <SidebarMenuSub className="mt-1 space-y-1">
                    {marketingItems.map(subItem => <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild className={cn(
                          isActive(subItem.url) && "bg-sidebar-accent text-sidebar-accent-foreground"
                        )}>
                          <Link to={subItem.url} className="flex items-center gap-3 px-3 py-2.5 rounded-md ml-6">
                            <span className="font-medium text-sm">{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>)}
                  </SidebarMenuSub>}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={cn(
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive("/configuracoes") && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}>
                  <Link to="/configuracoes" className="flex items-center gap-3 px-3 py-2">
                    <Settings className="h-4 w-4" />
                    <span className="font-medium">Configurações</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
    </Sidebar>;
}