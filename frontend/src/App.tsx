import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { DemoDataProvider } from "@/contexts/DemoDataContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ErrorBoundary from "@/components/errors/ErrorBoundary";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Artistas from "./pages/Artistas";
import Projetos from "./pages/Projetos";
import RegistroMusicas from "./pages/RegistroMusicas";
import Lancamentos from "./pages/Lancamentos";
import Contratos from "./pages/Contratos";
import ContractTemplates from "./pages/ContractTemplates";
import Financeiro from "./pages/Financeiro";
import Contabilidade from "./pages/Contabilidade";
import RegrasCategorização from "./pages/RegrasCategorização";
import Agenda from "./pages/Agenda";
import NotaFiscal from "./pages/NotaFiscal";
import Inventario from "./pages/Inventario";
import Usuarios from "./pages/Usuarios";
import Relatorios from "./pages/Relatorios";
import GestaoShares from "./pages/GestaoShares";
import CRM from "./pages/CRM";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";
import ConfirmEmailChange from "./pages/ConfirmEmailChange";
import GoogleCallback from "./pages/GoogleCallback";
// Marketing pages
import MarketingVisaoGeral from "./pages/marketing/VisaoGeral";
import MarketingCampanhas from "./pages/marketing/Campanhas";
import MarketingTarefas from "./pages/marketing/Tarefas";
import MarketingCalendario from "./pages/marketing/Calendario";
import MarketingMetricas from "./pages/marketing/Metricas";
import MarketingBriefing from "./pages/marketing/Briefing";
import IACriativa from "./pages/marketing/IACriativa";

import PerfilUsuario from "./pages/PerfilUsuario";
import Servicos from "./pages/Servicos";
import LanderZap from "./pages/LanderZap";
import SpotifyForArtistsCallback from "./pages/SpotifyForArtistsCallback";
import Monitoramento from "./pages/Monitoramento";
import AssetsSync from "./pages/AssetsSync";
import Licenciamento from "./pages/Licenciamento";
import Takedowns from "./pages/Takedowns";
import ScreenshotCapture from "./pages/ScreenshotCapture";
import CadastroPublico from "./pages/CadastroPublico";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (was cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && "status" in error) {
          const status = (error as { status: number }).status;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => (
  <ErrorBoundary>
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
              <DemoDataProvider>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                <Route path="/cadastro-publico" element={<CadastroPublico />} />
                <Route path="/confirm-email-change" element={<ConfirmEmailChange />} />
                <Route path="/callback/google" element={<GoogleCallback />} />

                <Route path="/admin/screenshots" element={<ScreenshotCapture />} />

                <Route path="/perfil" element={<ProtectedRoute><PerfilUsuario /></ProtectedRoute>} />
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/artistas" element={<ProtectedRoute><Artistas /></ProtectedRoute>} />
                <Route path="/projetos" element={<ProtectedRoute><Projetos /></ProtectedRoute>} />
                <Route path="/registro-musicas" element={<ProtectedRoute><RegistroMusicas /></ProtectedRoute>} />
                <Route path="/lancamentos" element={<ProtectedRoute><Lancamentos /></ProtectedRoute>} />
                <Route path="/contratos" element={<ProtectedRoute><Contratos /></ProtectedRoute>} />
                <Route path="/contratos/templates" element={<ProtectedRoute><ContractTemplates /></ProtectedRoute>} />
                <Route path="/financeiro" element={<ProtectedRoute><Financeiro /></ProtectedRoute>} />
                <Route path="/financeiro/regras" element={<ProtectedRoute><RegrasCategorização /></ProtectedRoute>} />
                <Route path="/contabilidade" element={<ProtectedRoute><Contabilidade /></ProtectedRoute>} />
                <Route path="/agenda" element={<ProtectedRoute><Agenda /></ProtectedRoute>} />
                <Route path="/nota-fiscal" element={<ProtectedRoute><NotaFiscal /></ProtectedRoute>} />
                <Route path="/inventario" element={<ProtectedRoute><Inventario /></ProtectedRoute>} />
                <Route path="/usuarios" element={<ProtectedRoute><Usuarios /></ProtectedRoute>} />
                <Route path="/relatorios" element={<ProtectedRoute><Relatorios /></ProtectedRoute>} />
                <Route path="/relatorios-autorais" element={<ProtectedRoute><Relatorios /></ProtectedRoute>} />
                <Route path="/gestao-shares" element={<ProtectedRoute><GestaoShares /></ProtectedRoute>} />
                <Route path="/crm" element={<ProtectedRoute><CRM /></ProtectedRoute>} />
                <Route path="/servicos" element={<ProtectedRoute><Servicos /></ProtectedRoute>} />
                <Route path="/lander" element={<ProtectedRoute><LanderZap /></ProtectedRoute>} />
                <Route path="/monitoramento" element={<ProtectedRoute><Monitoramento /></ProtectedRoute>} />
                <Route path="/assets-sync" element={<ProtectedRoute><AssetsSync /></ProtectedRoute>} />
                <Route path="/licenciamento" element={<ProtectedRoute><Licenciamento /></ProtectedRoute>} />
                <Route path="/takedowns" element={<ProtectedRoute><Takedowns /></ProtectedRoute>} />

                <Route path="/callback/spotify-for-artists" element={<SpotifyForArtistsCallback />} />
                {/* Marketing routes */}
                <Route path="/marketing/visao-geral" element={<ProtectedRoute><MarketingVisaoGeral /></ProtectedRoute>} />
                <Route path="/marketing/campanhas" element={<ProtectedRoute><MarketingCampanhas /></ProtectedRoute>} />
                <Route path="/marketing/tarefas" element={<ProtectedRoute><MarketingTarefas /></ProtectedRoute>} />
                <Route path="/marketing/calendario" element={<ProtectedRoute><MarketingCalendario /></ProtectedRoute>} />
                <Route path="/marketing/metricas" element={<ProtectedRoute><MarketingMetricas /></ProtectedRoute>} />
                <Route path="/marketing/briefing" element={<ProtectedRoute><MarketingBriefing /></ProtectedRoute>} />
                <Route path="/marketing/ia-criativa" element={<ProtectedRoute><IACriativa /></ProtectedRoute>} />

                <Route path="/configuracoes" element={<ProtectedRoute><Configuracoes /></ProtectedRoute>} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </DemoDataProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

