import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import ContabilidadeModule from "@/components/relatorios/ContabilidadeModule";

const Contabilidade = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="w-full h-full px-4 py-3 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="h-9 w-9" />
                <div className="flex flex-col gap-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Contabilidade</h1>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Fechamento de período, P&L e recoupment
                  </p>
                </div>
              </div>
            </div>

            <ContabilidadeModule />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Contabilidade;
