import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SessionActivityMonitor } from "@/components/security/SessionActivityMonitor";
import { ErrorBoundary } from "@/components/ErrorBoundary";
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
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/perfil" element={<ProtectedRoute><SessionActivityMonitor><PerfilUsuario /></SessionActivityMonitor></ProtectedRoute>} />
              <Route path="/" element={<ProtectedRoute><SessionActivityMonitor><Index /></SessionActivityMonitor></ProtectedRoute>} />
              <Route path="/artistas" element={<ProtectedRoute><SessionActivityMonitor><Artistas /></SessionActivityMonitor></ProtectedRoute>} />
              <Route path="/projetos" element={<ProtectedRoute><SessionActivityMonitor><Projetos /></SessionActivityMonitor></ProtectedRoute>} />
              <Route path="/registro-musicas" element={<ProtectedRoute><SessionActivityMonitor><RegistroMusicas /></SessionActivityMonitor></ProtectedRoute>} />
              <Route path="/lancamentos" element={<ProtectedRoute><SessionActivityMonitor><Lancamentos /></SessionActivityMonitor></ProtectedRoute>} />
              <Route path="/contratos" element={<ProtectedRoute><SessionActivityMonitor><Contratos /></SessionActivityMonitor></ProtectedRoute>} />
              <Route path="/financeiro" element={<ProtectedRoute><SessionActivityMonitor><Financeiro /></SessionActivityMonitor></ProtectedRoute>} />
              <Route path="/agenda" element={<ProtectedRoute><SessionActivityMonitor><Agenda /></SessionActivityMonitor></ProtectedRoute>} />
              <Route path="/nota-fiscal" element={<ProtectedRoute><SessionActivityMonitor><NotaFiscal /></SessionActivityMonitor></ProtectedRoute>} />
              <Route path="/inventario" element={<ProtectedRoute><SessionActivityMonitor><Inventario /></SessionActivityMonitor></ProtectedRoute>} />
              <Route path="/usuarios" element={<ProtectedRoute><SessionActivityMonitor><Usuarios /></SessionActivityMonitor></ProtectedRoute>} />
              <Route path="/relatorios" element={<ProtectedRoute><SessionActivityMonitor><Relatorios /></SessionActivityMonitor></ProtectedRoute>} />
              <Route path="/crm" element={<ProtectedRoute><SessionActivityMonitor><CRM /></SessionActivityMonitor></ProtectedRoute>} />
              {/* Marketing routes */}
              <Route path="/marketing/visao-geral" element={<ProtectedRoute><SessionActivityMonitor><MarketingVisaoGeral /></SessionActivityMonitor></ProtectedRoute>} />
              <Route path="/marketing/campanhas" element={<ProtectedRoute><SessionActivityMonitor><MarketingCampanhas /></SessionActivityMonitor></ProtectedRoute>} />
              <Route path="/marketing/tarefas" element={<ProtectedRoute><SessionActivityMonitor><MarketingTarefas /></SessionActivityMonitor></ProtectedRoute>} />
              <Route path="/marketing/calendario" element={<ProtectedRoute><SessionActivityMonitor><MarketingCalendario /></SessionActivityMonitor></ProtectedRoute>} />
              <Route path="/marketing/metricas" element={<ProtectedRoute><SessionActivityMonitor><MarketingMetricas /></SessionActivityMonitor></ProtectedRoute>} />
              <Route path="/marketing/briefing" element={<ProtectedRoute><SessionActivityMonitor><MarketingBriefing /></SessionActivityMonitor></ProtectedRoute>} />
              <Route path="/configuracoes" element={<ProtectedRoute><SessionActivityMonitor><Configuracoes /></SessionActivityMonitor></ProtectedRoute>} />
              <Route path="/seguranca-logs" element={<ProtectedRoute><SessionActivityMonitor><SegurancaLogs /></SessionActivityMonitor></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
