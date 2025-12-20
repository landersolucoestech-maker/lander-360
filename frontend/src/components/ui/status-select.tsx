import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  MUSIC_STATUS,
  RELEASE_STATUS,
  CONTRACT_STATUS,
} from "@/lib/constants";

type StatusType = 'project' | 'obra' | 'release' | 'contract';

const statusOptionsMap = {
  project: MUSIC_STATUS,
  obra: MUSIC_STATUS,
  release: RELEASE_STATUS,
  contract: CONTRACT_STATUS,
};

// Status color mapping
const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  aprovado: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' },
  ativo: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' },
  assinado: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' },
  lancado: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' },
  released: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' },
  aceita: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' },
  active: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' },
  em_analise: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/20' },
  pendente: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/20' },
  pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/20' },
  planning: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
  cancelado: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' },
  cancelled: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' },
  recusada: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' },
  expired: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' },
  rascunho: { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border' },
  draft: { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border' },
  paused: { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border' },
};

function getStatusColors(status: string | null | undefined) {
  if (!status) return statusColors.rascunho;
  return statusColors[status.toLowerCase()] || statusColors.rascunho;
}

interface StatusSelectProps {
  type: StatusType;
  value: string | null | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const StatusSelect = ({ 
  type,
  value, 
  onChange, 
  placeholder = "Selecione o status",
  disabled = false,
  className 
}: StatusSelectProps) => {
  const options = statusOptionsMap[type];
  
  return (
    <Select 
      value={value || undefined} 
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((status) => {
          const colors = getStatusColors(status.value);
          return (
            <SelectItem key={status.value} value={status.value}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${colors.bg} ${colors.border} border`} />
                {status.label}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

interface StatusBadgeProps {
  status: string | null | undefined;
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  if (!status) return null;
  
  const colors = getStatusColors(status);
  
  let label = status;
  for (const options of Object.values(statusOptionsMap)) {
    const found = options.find(o => o.value === status);
    if (found) {
      label = found.label;
      break;
    }
  }
  
  return (
    <Badge 
      variant="outline" 
      className={`${colors.bg} ${colors.text} ${colors.border} ${className}`}
    >
      {label}
    </Badge>
  );
};
