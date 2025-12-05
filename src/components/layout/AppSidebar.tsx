import { LayoutDashboard, Users, FolderOpen, Music, Upload, FileText, DollarSign, Calendar, Receipt, Package, UserCheck, BarChart3, UserCog, Megaphone, Settings, ChevronDown } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton, SidebarFooter } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Artistas", url: "/artistas", icon: Users },
  { title: "Projetos", url: "/projetos", icon: FolderOpen },
  { title: "Registro de Músicas", url: "/registro-musicas", icon: Music },
  { title: "Lançamentos", url: "/lancamentos", icon: Upload },
  { title: "Contratos", url: "/contratos", icon: FileText },
  { title: "Financeiro", url: "/financeiro", icon: DollarSign },
  { title: "Agenda", url: "/agenda", icon: Calendar },
  { title: "Nota Fiscal", url: "/nota-fiscal", icon: Receipt },
  { title: "Inventário", url: "/inventario", icon: Package },
  { title: "Usuários", url: "/usuarios", icon: UserCog },
  { title: "CRM", url: "/crm", icon: UserCheck },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 }
];

const marketingItems = [
  { title: "Visão Geral", url: "/marketing/visao-geral" },
  { title: "Planejamento de Campanhas", url: "/marketing/campanhas" },
  { title: "Gestão de Tarefas", url: "/marketing/tarefas" },
  { title: "Calendário de Conteúdo", url: "/marketing/calendario" },
  { title: "Métricas e Resultados", url: "/marketing/metricas" },
  { title: "Central de Briefing", url: "/marketing/briefing" }
];

interface AppSidebarProps {
  className?: string;
}

export function AppSidebar({ className }: AppSidebarProps) {
  const [isMarketingOpen, setIsMarketingOpen] = useState(false);

  return (
    <Sidebar className={cn("border-r border-sidebar-border", className)}>
      <SidebarHeader className="border-b border-sidebar-border p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center">
            <img 
              src="/lovable-uploads/a21a1ab1-df8a-4b7b-a1e4-0e36f63eff02.png" 
              alt="Gestão 360 Logo" 
              className="h-10 w-auto object-contain"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground whitespace-nowrap">GESTÃO 360</h1>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                    <a href={item.url} className="flex items-center gap-3 px-3 py-2.5 rounded-md">
                      <item.icon className="h-4 w-4" />
                      <span className="font-medium">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Marketing dropdown */}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setIsMarketingOpen(!isMarketingOpen)}
                  className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex items-center gap-3 px-3 py-2.5 rounded-md"
                >
                  <Megaphone className="h-4 w-4" />
                  <span className="font-medium">Marketing</span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform ml-auto", isMarketingOpen && "rotate-180")} />
                </SidebarMenuButton>
                {isMarketingOpen && (
                  <SidebarMenuSub className="mt-1 space-y-1">
                    {marketingItems.map(subItem => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <a href={subItem.url} className="flex items-center gap-3 px-3 py-2.5 rounded-md ml-6">
                            <span className="font-medium text-sm">{subItem.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                  <a href="/configuracoes" className="flex items-center gap-3 px-3 py-2">
                    <Settings className="h-4 w-4" />
                    <span className="font-medium">Configurações</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <ThemeToggle />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="text-sm text-muted-foreground text-center">
          Gestão 360
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}