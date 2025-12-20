import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAI } from "@/hooks/useAI";
import { Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface AIAnalysisButtonProps {
  label?: string;
  analysisType: string;
  context: string;
  data: Record<string, any>;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export function AIAnalysisButton({
  label = "Analisar com IA",
  analysisType,
  context,
  data,
  className,
  variant = "outline",
  size = "sm",
}: AIAnalysisButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [analysis, setAnalysis] = useState<string>("");
  const { sendMessage, isLoading } = useAI({
    systemPrompt: `Você é um analista sênior da Lander Records, gravadora e editora musical.
Sua função é fornecer análises detalhadas, insights estratégicos e recomendações práticas.
Seja direto, objetivo e focado em resultados. Use formatação markdown para organizar a resposta.
Inclua: resumo executivo, pontos principais, riscos/oportunidades, e ações recomendadas.`,
    task: 'análise',
    maxTokens: 2000,
  });

  const runAnalysis = async () => {
    setIsOpen(true);
    setAnalysis("");
    
    const prompt = `
Tipo de análise: ${analysisType}

Contexto: ${context}

Dados para análise:
${JSON.stringify(data, null, 2)}

Forneça uma análise completa e acionável.
`;

    const response = await sendMessage([{ role: 'user', content: prompt }]);
    if (response?.content) {
      setAnalysis(response.content);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={runAnalysis}
        disabled={isLoading}
        className={cn("gap-2", className)}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {label}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Análise IA: {analysisType}
            </DialogTitle>
            <DialogDescription>
              Análise gerada automaticamente com base nos dados disponíveis
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh] pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Analisando dados...</p>
                </div>
              </div>
            ) : analysis ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{analysis}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Erro ao gerar análise. Tente novamente.</p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
