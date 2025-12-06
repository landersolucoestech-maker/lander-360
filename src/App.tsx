import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Artistas from "./pages/Artistas";
import Projetos from "./pages/Projetos";
import RegistroMusicas from "./pages/RegistroMusicas";
import Lancamentos from "./pages/Lancamentos";
import Contratos from "./pages/Contratos";
import Financeiro from "./pages/Financeiro";
import Agenda from "./pages/Agenda";
import NotaFiscal from "./pages/NotaFiscal";
import Inventario from "./pages/Inventario";
import Usuarios from "./pages/Usuarios";
import Relatorios from "./pages/Relatorios";
import CRM from "./pages/CRM";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";
// Marketing pages
import MarketingVisaoGeral from "./pages/marketing/VisaoGeral";
import MarketingCampanhas from "./pages/marketing/Campanhas";
import MarketingTarefas from "./pages/marketing/Tarefas";
import MarketingCalendario from "./pages/marketing/Calendario";
import MarketingMetricas from "./pages/marketing/Metricas";
import MarketingBriefing from "./pages/marketing/Briefing";
import PerfilUsuario from "./pages/PerfilUsuario";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider 
      attribute="class" 
      defaultTheme="dark" 
      enableSystem={false}
      storageKey="lander360-theme"
      disableTransitionOnChange={false}
    >
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/perfil" element={<PerfilUsuario />} />
            <Route path="/" element={<Index />} />
            <Route path="/artistas" element={<Artistas />} />
            <Route path="/projetos" element={<Projetos />} />
            <Route path="/registro-musicas" element={<RegistroMusicas />} />
            <Route path="/lancamentos" element={<Lancamentos />} />
            <Route path="/contratos" element={<Contratos />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/nota-fiscal" element={<NotaFiscal />} />
            <Route path="/inventario" element={<Inventario />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/crm" element={<CRM />} />
            {/* Marketing routes */}
            <Route path="/marketing/visao-geral" element={<MarketingVisaoGeral />} />
            <Route path="/marketing/campanhas" element={<MarketingCampanhas />} />
            <Route path="/marketing/tarefas" element={<MarketingTarefas />} />
            <Route path="/marketing/calendario" element={<MarketingCalendario />} />
            <Route path="/marketing/metricas" element={<MarketingMetricas />} />
            <Route path="/marketing/briefing" element={<MarketingBriefing />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
