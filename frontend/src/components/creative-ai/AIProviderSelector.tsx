import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, Brain, Bot } from 'lucide-react';
import { AIProvider } from '@/hooks/useAI';

interface AIProviderSelectorProps {
  value: AIProvider | 'auto';
  onChange: (value: AIProvider | 'auto') => void;
  showDescription?: boolean;
  className?: string;
}

const PROVIDERS = [
  {
    value: 'auto' as const,
    label: 'Auto (Melhor para tarefa)',
    description: 'Seleciona automaticamente a melhor IA',
    icon: Sparkles,
    color: 'text-primary',
  },
  {
    value: 'openai' as const,
    label: 'OpenAI GPT-4o',
    description: 'Criativo e conversacional',
    icon: Bot,
    color: 'text-green-500',
  },
  {
    value: 'anthropic' as const,
    label: 'Claude Sonnet 4',
    description: 'Análise e raciocínio complexo',
    icon: Brain,
    color: 'text-orange-500',
  },
  {
    value: 'gemini' as const,
    label: 'Gemini 2.5 Flash',
    description: 'Rápido e multimodal',
    icon: Zap,
    color: 'text-blue-500',
  },
];

export const AIProviderSelector: React.FC<AIProviderSelectorProps> = ({
  value,
  onChange,
  showDescription = false,
  className,
}) => {
  const selected = PROVIDERS.find(p => p.value === value);
  const Icon = selected?.icon || Sparkles;

  return (
    <div className={className}>
      <Select value={value} onValueChange={(v) => onChange(v as AIProvider | 'auto')}>
        <SelectTrigger className="w-full">
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${selected?.color}`} />
            <SelectValue placeholder="Selecionar IA" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {PROVIDERS.map((provider) => (
            <SelectItem key={provider.value} value={provider.value}>
              <div className="flex items-center gap-2">
                <provider.icon className={`h-4 w-4 ${provider.color}`} />
                <span>{provider.label}</span>
                {provider.value === 'auto' && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    Recomendado
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {showDescription && selected && (
        <p className="text-xs text-muted-foreground mt-1">
          {selected.description}
        </p>
      )}
    </div>
  );
};

export default AIProviderSelector;
