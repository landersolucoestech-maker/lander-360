import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAI } from "@/hooks/useAI";
import { Sparkles, RefreshCw, ChevronDown, ChevronUp, Lightbulb, AlertTriangle, TrendingUp, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AIInsight {
  type: 'suggestion' | 'warning' | 'opportunity' | 'success';
  title: string;
  description: string;
  action?: string;
  priority?: 'high' | 'medium' | 'low';
}

interface AIInsightsCardProps {
  title?: string;
  description?: string;
  context: string;
  dataContext?: Record<string, any>;
  autoLoad?: boolean;
  compact?: boolean;
  className?: string;
  onInsightAction?: (insight: AIInsight) => void;
}

const insightIcons = {
  suggestion: Lightbulb,
  warning: AlertTriangle,
  opportunity: TrendingUp,
  success: CheckCircle2,
};

const insightColors = {
  suggestion: 'text-blue-500 bg-blue-500/10',
  warning: 'text-yellow-500 bg-yellow-500/10',
  opportunity: 'text-green-500 bg-green-500/10',
  success: 'text-emerald-500 bg-emerald-500/10',
};

const priorityColors = {
  high: 'bg-destructive/20 text-destructive',
  medium: 'bg-yellow-500/20 text-yellow-600',
  low: 'bg-muted text-muted-foreground',
};

export function AIInsightsCard({
  title = "Insights da IA",
  description = "Análises e sugestões automáticas",
  context,
  dataContext,
  autoLoad = false,
  compact = false,
  className,
  onInsightAction,
}: AIInsightsCardProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [expanded, setExpanded] = useState(!compact);
  const { sendMessage, isLoading } = useAI({
    systemPrompt: `Você é um assistente analítico para gestão de uma gravadora musical (Lander Records). 
Analise os dados fornecidos e retorne insights em formato JSON válido.
Seja direto, objetivo e prático. Foque em ações que gerem resultados.
Retorne APENAS um array JSON com objetos contendo: type (suggestion|warning|opportunity|success), title, description, action (opcional), priority (high|medium|low).
Máximo 5 insights. Não inclua markdown, apenas JSON puro.`,
    task: 'análise',
  });

  const generateInsights = async () => {
    const dataStr = dataContext ? JSON.stringify(dataContext, null, 2) : '';
    const prompt = `${context}\n\nDados para análise:\n${dataStr}`;

    const response = await sendMessage([{ role: 'user', content: prompt }]);
    
    if (response?.content) {
      try {
        // Extract JSON from response (handle markdown code blocks if present)
        let jsonStr = response.content;
        const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          jsonStr = jsonMatch[0];
        }
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed)) {
          setInsights(parsed.slice(0, 5));
        }
      } catch (e) {
        console.error('Failed to parse AI insights:', e);
      }
    }
  };

  useEffect(() => {
    if (autoLoad && dataContext && Object.keys(dataContext).length > 0) {
      generateInsights();
    }
  }, [autoLoad]);

  if (compact && insights.length === 0 && !isLoading) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={generateInsights}
        disabled={isLoading}
        className={cn("gap-2", className)}
      >
        <Sparkles className="h-4 w-4" />
        Gerar Insights IA
      </Button>
    );
  }

  return (
    <Card className={cn("border-primary/20", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription className="text-xs">{description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={generateInsights}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
            {insights.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      {expanded && (
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : insights.length === 0 ? (
            <div className="text-center py-6">
              <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                Clique para gerar insights baseados nos dados atuais
              </p>
              <Button onClick={generateInsights} size="sm" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Analisar com IA
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {insights.map((insight, index) => {
                const Icon = insightIcons[insight.type] || Lightbulb;
                return (
                  <div
                    key={index}
                    className="flex gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className={cn("p-2 rounded-lg h-fit", insightColors[insight.type])}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{insight.title}</span>
                        {insight.priority && (
                          <Badge variant="secondary" className={cn("text-xs", priorityColors[insight.priority])}>
                            {insight.priority === 'high' ? 'Alta' : insight.priority === 'medium' ? 'Média' : 'Baixa'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                      {insight.action && onInsightAction && (
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 h-auto mt-1 text-primary"
                          onClick={() => onInsightAction(insight)}
                        >
                          {insight.action} →
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
