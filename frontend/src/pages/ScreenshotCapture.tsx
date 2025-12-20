import { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Download, Loader2, Monitor, RefreshCw } from "lucide-react";

type CaptureRoute = {
  path: string;
  label: string;
};

const ROUTES: CaptureRoute[] = [
  { path: "/", label: "Dashboard" },
  { path: "/artistas", label: "Artistas" },
  { path: "/projetos", label: "Projetos" },
  { path: "/registro-musicas", label: "Registro de Músicas" },
  { path: "/lancamentos", label: "Lançamentos" },
  { path: "/contratos", label: "Contratos" },
  { path: "/contratos/templates", label: "Templates de Contratos" },
  { path: "/financeiro", label: "Financeiro" },
  { path: "/financeiro/regras", label: "Regras de Categorização" },
  { path: "/contabilidade", label: "Contabilidade" },
  { path: "/agenda", label: "Agenda" },
  { path: "/nota-fiscal", label: "Nota Fiscal" },
  { path: "/inventario", label: "Inventário" },
  { path: "/usuarios", label: "Usuários" },
  { path: "/relatorios", label: "Relatórios" },
  { path: "/gestao-shares", label: "Gestão de Shares" },
  { path: "/crm", label: "CRM" },
  { path: "/servicos", label: "Serviços" },
  { path: "/lander", label: "LanderZap" },
  { path: "/monitoramento", label: "Monitoramento" },
  { path: "/assets-sync", label: "Assets Sync" },
  { path: "/licenciamento", label: "Licenciamento" },
  { path: "/takedowns", label: "Takedowns" },
  { path: "/marketing/visao-geral", label: "Marketing · Visão Geral" },
  { path: "/marketing/campanhas", label: "Marketing · Campanhas" },
  { path: "/marketing/tarefas", label: "Marketing · Tarefas" },
  { path: "/marketing/calendario", label: "Marketing · Calendário" },
  { path: "/marketing/metricas", label: "Marketing · Métricas" },
  { path: "/marketing/briefing", label: "Marketing · Briefing" },
  { path: "/marketing/ia-criativa", label: "Marketing · IA Criativa" },
  { path: "/configuracoes", label: "Configurações" },
  { path: "/perfil", label: "Perfil" },
];

function routeToFileName(route: CaptureRoute) {
  const clean = route.path
    .replace(/^\//, "")
    .replace(/\/$/, "")
    .replace(/[/?#:&]+/g, "_")
    .replace(/_+/g, "_")
    .trim();

  const base = clean.length ? clean : "home";
  return `${base}.png`;
}

function blobFromCanvas(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Falha ao gerar PNG"));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function wait(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

export default function ScreenshotCapture() {
  const { toast } = useToast();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const [activePath, setActivePath] = useState<string>(ROUTES[0]?.path ?? "/");
  const [selected, setSelected] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    ROUTES.forEach((r) => (initial[r.path] = true));
    return initial;
  });

  const [isCapturing, setIsCapturing] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number; label?: string } | null>(null);

  const selectedRoutes = useMemo(() => ROUTES.filter((r) => selected[r.path]), [selected]);

  const loadInIframe = async (path: string) => {
    const iframe = iframeRef.current;
    if (!iframe) throw new Error("Iframe não encontrado");

    const src = `${path}${path.includes("?") ? "&" : "?"}__capture=1`;

    await new Promise<void>((resolve, reject) => {
      const onLoad = () => {
        iframe.removeEventListener("load", onLoad);
        resolve();
      };

      iframe.addEventListener("load", onLoad);
      iframe.src = src;

      // safety timeout
      window.setTimeout(() => {
        try {
          iframe.removeEventListener("load", onLoad);
        } catch {
          // ignore
        }
        reject(new Error(`Timeout carregando ${path}`));
      }, 25000);
    });

    // dá tempo de fontes/queries estabilizarem
    await wait(1200);

    setActivePath(path);
  };

  const captureFromIframe = async (route: CaptureRoute) => {
    const iframe = iframeRef.current;
    if (!iframe) throw new Error("Iframe não encontrado");

    const win = iframe.contentWindow;
    const doc = iframe.contentDocument;
    if (!win || !doc) throw new Error("Sem acesso ao conteúdo do iframe");

    win.scrollTo(0, 0);
    await wait(200);

    const root = doc.documentElement;
    const width = Math.max(root.scrollWidth, root.clientWidth);
    const height = Math.max(root.scrollHeight, root.clientHeight);

    const canvas = await html2canvas(root, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      width,
      height,
      windowWidth: width,
      windowHeight: height,
      scrollX: 0,
      scrollY: 0,
    });

    const blob = await blobFromCanvas(canvas);
    downloadBlob(blob, routeToFileName(route));
  };

  const handleCaptureAll = async () => {
    if (!selectedRoutes.length) {
      toast({
        title: "Nada selecionado",
        description: "Selecione ao menos uma rota para capturar.",
        variant: "destructive",
      });
      return;
    }

    setIsCapturing(true);
    setProgress({ current: 0, total: selectedRoutes.length });

    try {
      for (let i = 0; i < selectedRoutes.length; i++) {
        const route = selectedRoutes[i];
        setProgress({ current: i + 1, total: selectedRoutes.length, label: route.label });

        await loadInIframe(route.path);
        await captureFromIframe(route);

        // respiro entre capturas
        await wait(350);
      }

      toast({
        title: "Captura concluída",
        description: `Baixados ${selectedRoutes.length} PNGs.`,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Erro ao capturar";
      toast({
        title: "Falha na captura",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsCapturing(false);
      setProgress(null);
    }
  };

  const handleCaptureOne = async (route: CaptureRoute) => {
    setIsCapturing(true);
    setProgress({ current: 1, total: 1, label: route.label });

    try {
      await loadInIframe(route.path);
      await captureFromIframe(route);

      toast({
        title: "Screenshot gerado",
        description: `${route.label} baixado.`,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Erro ao capturar";
      toast({
        title: "Falha na captura",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsCapturing(false);
      setProgress(null);
    }
  };

  const toggleAll = (value: boolean) => {
    const next: Record<string, boolean> = {};
    ROUTES.forEach((r) => (next[r.path] = value));
    setSelected(next);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-4 py-6">
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-md border border-border bg-card p-2">
              <Monitor className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-semibold">Captura de Screenshots do Sistema</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Selecione as telas e baixe PNGs automaticamente (render em iframe).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => loadInIframe(activePath)}
                disabled={isCapturing}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Recarregar
              </Button>
              <Button onClick={handleCaptureAll} disabled={isCapturing}>
                {isCapturing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Capturar tudo
              </Button>
            </div>
          </div>

          {progress && (
            <div className="mt-4 text-sm text-muted-foreground">
              Capturando {progress.current}/{progress.total}
              {progress.label ? ` · ${progress.label}` : ""}
            </div>
          )}
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 px-4 py-6 lg:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Telas</CardTitle>
            <CardDescription>Marque/desmarque as páginas para captura.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => toggleAll(true)} disabled={isCapturing}>
                Selecionar tudo
              </Button>
              <Button variant="outline" size="sm" onClick={() => toggleAll(false)} disabled={isCapturing}>
                Limpar
              </Button>
            </div>

            <Separator />

            <div className="max-h-[55vh] space-y-2 overflow-auto pr-1">
              {ROUTES.map((r) => (
                <div key={r.path} className="flex items-center gap-3 rounded-md border border-border p-2">
                  <Checkbox
                    checked={!!selected[r.path]}
                    onCheckedChange={(v) => setSelected((prev) => ({ ...prev, [r.path]: Boolean(v) }))}
                    disabled={isCapturing}
                    aria-label={`Selecionar ${r.label} para captura`}
                  />

                  <button
                    type="button"
                    className="flex-1 text-left"
                    onClick={() => loadInIframe(r.path)}
                    disabled={isCapturing}
                  >
                    <div className="text-sm font-medium">{r.label}</div>
                    <div className="text-xs text-muted-foreground">{r.path}</div>
                  </button>

                  <Button variant="secondary" size="sm" onClick={() => handleCaptureOne(r)} disabled={isCapturing}>
                    <Download className="mr-2 h-4 w-4" />
                    PNG
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Pré-visualização</CardTitle>
            <CardDescription>{activePath}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <iframe
              ref={iframeRef}
              title="Pré-visualização para captura"
              className="h-[70vh] w-full bg-background"
              src={`${activePath}?__capture=1`}
            />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
