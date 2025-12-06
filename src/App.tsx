import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
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
import SegurancaLogs from "./pages/SegurancaLogs";
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
      defaultTheme="system" 
      enableSystem={true}
      storageKey="lander360-theme"
      disableTransitionOnChange={false}
    >
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/perfil" element={<ProtectedRoute><PerfilUsuario /></ProtectedRoute>} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/artistas" element={<ProtectedRoute><Artistas /></ProtectedRoute>} />
              <Route path="/projetos" element={<ProtectedRoute><Projetos /></ProtectedRoute>} />
              <Route path="/registro-musicas" element={<ProtectedRoute><RegistroMusicas /></ProtectedRoute>} />
              <Route path="/lancamentos" element={<ProtectedRoute><Lancamentos /></ProtectedRoute>} />
              <Route path="/contratos" element={<ProtectedRoute><Contratos /></ProtectedRoute>} />
              <Route path="/financeiro" element={<ProtectedRoute><Financeiro /></ProtectedRoute>} />
              <Route path="/agenda" element={<ProtectedRoute><Agenda /></ProtectedRoute>} />
              <Route path="/nota-fiscal" element={<ProtectedRoute><NotaFiscal /></ProtectedRoute>} />
              <Route path="/inventario" element={<ProtectedRoute><Inventario /></ProtectedRoute>} />
              <Route path="/usuarios" element={<ProtectedRoute><Usuarios /></ProtectedRoute>} />
              <Route path="/relatorios" element={<ProtectedRoute><Relatorios /></ProtectedRoute>} />
              <Route path="/crm" element={<ProtectedRoute><CRM /></ProtectedRoute>} />
              {/* Marketing routes */}
              <Route path="/marketing/visao-geral" element={<ProtectedRoute><MarketingVisaoGeral /></ProtectedRoute>} />
              <Route path="/marketing/campanhas" element={<ProtectedRoute><MarketingCampanhas /></ProtectedRoute>} />
              <Route path="/marketing/tarefas" element={<ProtectedRoute><MarketingTarefas /></ProtectedRoute>} />
              <Route path="/marketing/calendario" element={<ProtectedRoute><MarketingCalendario /></ProtectedRoute>} />
              <Route path="/marketing/metricas" element={<ProtectedRoute><MarketingMetricas /></ProtectedRoute>} />
              <Route path="/marketing/briefing" element={<ProtectedRoute><MarketingBriefing /></ProtectedRoute>} />
              <Route path="/configuracoes" element={<ProtectedRoute><Configuracoes /></ProtectedRoute>} />
              <Route path="/seguranca-logs" element={<ProtectedRoute><SegurancaLogs /></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
