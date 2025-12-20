import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Zap, Bell, Calendar, Clock, Plus, Trash2, Play, Pause, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useArtists } from '@/hooks/useArtists';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface Automation {
  id: string;
  name: string;
  type: 'workflow' | 'reminder' | 'batch';
  trigger: string;
  action: string;
  artistId?: string;
  schedule?: string;
  enabled: boolean;
}

const AUTOMATION_TYPES = [
  { value: 'workflow', label: 'Workflow Automático', icon: Zap },
  { value: 'reminder', label: 'Lembrete', icon: Bell },
  { value: 'batch', label: 'Ação em Lote', icon: Settings },
];

const TRIGGERS = [
  { value: 'release_date', label: 'Próximo ao lançamento' },
  { value: 'campaign_start', label: 'Início de campanha' },
  { value: 'weekly', label: 'Semanalmente' },
  { value: 'monthly', label: 'Mensalmente' },
  { value: 'low_engagement', label: 'Engajamento baixo detectado' },
  { value: 'new_release', label: 'Novo lançamento cadastrado' },
];

const ACTIONS = [
  { value: 'generate_ideas', label: 'Gerar ideias criativas' },
  { value: 'send_notification', label: 'Enviar notificação' },
  { value: 'create_task', label: 'Criar tarefa de marketing' },
  { value: 'analyze_metrics', label: 'Analisar métricas' },
  { value: 'suggest_content', label: 'Sugerir conteúdo' },
  { value: 'export_report', label: 'Exportar relatório' },
];


export const CreativeAIAutomations = () => {
  const { toast } = useToast();
  const { data: artists } = useArtists();
  // Empty array - will be populated from database when creative_automations table is created
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newAutomation, setNewAutomation] = useState<Partial<Automation>>({
    type: 'workflow',
    enabled: true,
  });

  const handleToggle = (id: string, enabled: boolean) => {
    setAutomations(prev => 
      prev.map(a => a.id === id ? { ...a, enabled } : a)
    );
    toast({
      title: enabled ? 'Automação ativada' : 'Automação desativada',
      description: `A automação foi ${enabled ? 'ativada' : 'desativada'} com sucesso.`,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta automação?')) {
      setAutomations(prev => prev.filter(a => a.id !== id));
      toast({
        title: 'Automação excluída',
        description: 'A automação foi removida com sucesso.',
      });
    }
  };

  const handleCreate = () => {
    if (!newAutomation.name || !newAutomation.trigger || !newAutomation.action) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    const automation: Automation = {
      id: Date.now().toString(),
      name: newAutomation.name!,
      type: newAutomation.type as 'workflow' | 'reminder' | 'batch',
      trigger: newAutomation.trigger!,
      action: newAutomation.action!,
      artistId: newAutomation.artistId,
      enabled: true,
    };

    setAutomations(prev => [...prev, automation]);
    setDialogOpen(false);
    setNewAutomation({ type: 'workflow', enabled: true });
    
    toast({
      title: 'Automação criada',
      description: 'A nova automação foi configurada com sucesso.',
    });
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = AUTOMATION_TYPES.find(t => t.value === type);
    if (!typeConfig) return Zap;
    return typeConfig.icon;
  };

  const getTypeLabel = (type: string) => {
    return AUTOMATION_TYPES.find(t => t.value === type)?.label || type;
  };

  const getTriggerLabel = (trigger: string) => {
    return TRIGGERS.find(t => t.value === trigger)?.label || trigger;
  };

  const getActionLabel = (action: string) => {
    return ACTIONS.find(a => a.value === action)?.label || action;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Automações
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure workflows automáticos, lembretes e ações em lote
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Automação
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Automações</p>
                <p className="text-2xl font-bold">{automations.length}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Zap className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ativas</p>
                <p className="text-2xl font-bold text-green-500">
                  {automations.filter(a => a.enabled).length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-500/10 text-green-500">
                <Play className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pausadas</p>
                <p className="text-2xl font-bold text-yellow-500">
                  {automations.filter(a => !a.enabled).length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-yellow-500/10 text-yellow-500">
                <Pause className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automations List */}
      <div className="space-y-4">
        {automations.map((automation) => {
          const TypeIcon = getTypeIcon(automation.type);
          return (
            <Card key={automation.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${automation.enabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium flex items-center gap-2">
                        {automation.name}
                        <Badge variant={automation.enabled ? 'default' : 'secondary'}>
                          {automation.enabled ? 'Ativa' : 'Pausada'}
                        </Badge>
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {getTypeLabel(automation.type)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right hidden md:block">
                      <p className="text-xs text-muted-foreground">Gatilho</p>
                      <p className="text-sm">{getTriggerLabel(automation.trigger)}</p>
                    </div>
                    <div className="text-right hidden md:block">
                      <p className="text-xs text-muted-foreground">Ação</p>
                      <p className="text-sm">{getActionLabel(automation.action)}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={automation.enabled}
                        onCheckedChange={(checked) => handleToggle(automation.id, checked)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(automation.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {automations.length === 0 && (
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <Zap className="h-12 w-12 text-muted-foreground/50" />
              <div>
                <h3 className="font-medium text-foreground">Nenhuma automação configurada</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Crie sua primeira automação para otimizar seu fluxo de trabalho
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Automação</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input
                placeholder="Nome da automação"
                value={newAutomation.name || ''}
                onChange={(e) => setNewAutomation(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select
                value={newAutomation.type}
                onValueChange={(value) => setNewAutomation(prev => ({ ...prev, type: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {AUTOMATION_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Artista (opcional)</Label>
              <Select
                value={newAutomation.artistId || 'all'}
                onValueChange={(value) =>
                  setNewAutomation((prev) => ({
                    ...prev,
                    artistId: value === 'all' ? undefined : value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os artistas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os artistas</SelectItem>
                  {artists?.filter((artist) => artist.id).map((artist) => (
                    <SelectItem key={artist.id} value={artist.id}>
                      {artist.stage_name || artist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Gatilho *</Label>
              <Select
                value={newAutomation.trigger}
                onValueChange={(value) => setNewAutomation(prev => ({ ...prev, trigger: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o gatilho" />
                </SelectTrigger>
                <SelectContent>
                  {TRIGGERS.map(trigger => (
                    <SelectItem key={trigger.value} value={trigger.value}>
                      {trigger.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ação *</Label>
              <Select
                value={newAutomation.action}
                onValueChange={(value) => setNewAutomation(prev => ({ ...prev, action: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a ação" />
                </SelectTrigger>
                <SelectContent>
                  {ACTIONS.map(action => (
                    <SelectItem key={action.value} value={action.value}>
                      {action.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate}>
              Criar Automação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
