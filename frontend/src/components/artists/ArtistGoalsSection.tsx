import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useArtistGoals, ArtistGoal } from "@/hooks/useArtistGoals";
import { Plus, Target, TrendingUp, Calendar, Trash2, Pencil, CheckCircle, AlertCircle } from "lucide-react";
import { formatDateBR } from "@/lib/utils";

interface ArtistGoalsSectionProps {
  artistId: string;
  artistName?: string;
}

const goalTypeLabels: Record<string, string> = {
  streams: "Streams",
  followers: "Seguidores",
  revenue: "Receita",
  releases: "Lançamentos",
  shows: "Shows",
  engagement: "Engajamento",
};

const platformLabels: Record<string, string> = {
  spotify: "Spotify",
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
  all: "Todas",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-500/20 text-gray-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  high: "bg-red-500/20 text-red-400",
};

const statusColors: Record<string, string> = {
  active: "bg-blue-500/20 text-blue-400",
  completed: "bg-green-500/20 text-green-400",
  failed: "bg-red-500/20 text-red-400",
  paused: "bg-gray-500/20 text-gray-400",
};

export const ArtistGoalsSection = ({ artistId, artistName }: ArtistGoalsSectionProps) => {
  const { goals, isLoading, createGoal, updateGoal, deleteGoal, getProgress } = useArtistGoals(artistId);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<ArtistGoal | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    goal_type: "",
    target_value: "",
    current_value: "",
    unit: "number",
    platform: "",
    period: "monthly",
    start_date: new Date().toISOString().split('T')[0],
    end_date: "",
    priority: "medium",
  });

  const handleSubmit = () => {
    const payload = {
      artist_id: artistId,
      title: formData.title,
      description: formData.description || null,
      goal_type: formData.goal_type,
      target_value: parseFloat(formData.target_value),
      current_value: formData.current_value ? parseFloat(formData.current_value) : 0,
      unit: formData.unit,
      platform: formData.platform || null,
      period: formData.period,
      start_date: formData.start_date,
      end_date: formData.end_date,
      priority: formData.priority,
      status: 'active',
    };

    if (editingGoal) {
      updateGoal.mutate({ id: editingGoal.id, ...payload });
    } else {
      createGoal.mutate(payload);
    }
    setIsFormOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      goal_type: "",
      target_value: "",
      current_value: "",
      unit: "number",
      platform: "",
      period: "monthly",
      start_date: new Date().toISOString().split('T')[0],
      end_date: "",
      priority: "medium",
    });
    setEditingGoal(null);
  };

  const openEdit = (goal: ArtistGoal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || "",
      goal_type: goal.goal_type,
      target_value: goal.target_value.toString(),
      current_value: goal.current_value?.toString() || "0",
      unit: goal.unit || "number",
      platform: goal.platform || "",
      period: goal.period || "monthly",
      start_date: goal.start_date,
      end_date: goal.end_date,
      priority: goal.priority,
    });
    setIsFormOpen(true);
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Metas & OKRs
          </CardTitle>
          {artistName && <p className="text-sm text-muted-foreground">{artistName}</p>}
        </div>
        <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nova Meta</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingGoal ? "Editar Meta" : "Criar Nova Meta"}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2">
                <Label>Título *</Label>
                <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Ex: Atingir 1M de streams mensais" />
              </div>
              <div>
                <Label>Tipo de Meta *</Label>
                <Select value={formData.goal_type} onValueChange={v => setFormData({...formData, goal_type: v})}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="streams">Streams</SelectItem>
                    <SelectItem value="followers">Seguidores</SelectItem>
                    <SelectItem value="revenue">Receita</SelectItem>
                    <SelectItem value="releases">Lançamentos</SelectItem>
                    <SelectItem value="shows">Shows</SelectItem>
                    <SelectItem value="engagement">Engajamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Plataforma</Label>
                <Select value={formData.platform} onValueChange={v => setFormData({...formData, platform: v})}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spotify">Spotify</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="all">Todas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Valor Alvo *</Label>
                <Input type="number" value={formData.target_value} onChange={e => setFormData({...formData, target_value: e.target.value})} placeholder="1000000" />
              </div>
              <div>
                <Label>Valor Atual</Label>
                <Input type="number" value={formData.current_value} onChange={e => setFormData({...formData, current_value: e.target.value})} placeholder="0" />
              </div>
              <div>
                <Label>Data Início</Label>
                <Input type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
              </div>
              <div>
                <Label>Data Fim *</Label>
                <Input type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
              </div>
              <div>
                <Label>Período</Label>
                <Select value={formData.period} onValueChange={v => setFormData({...formData, period: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="quarterly">Trimestral</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Prioridade</Label>
                <Select value={formData.priority} onValueChange={v => setFormData({...formData, priority: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Descrição</Label>
                <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Detalhes da meta..." />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={!formData.title || !formData.goal_type || !formData.target_value || !formData.end_date}>
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma meta definida</p>
            <p className="text-sm">Clique em "Nova Meta" para criar objetivos para este artista</p>
          </div>
        ) : (
          <>
            {/* Active Goals */}
            {activeGoals.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">Metas Ativas ({activeGoals.length})</h4>
                {activeGoals.map(goal => {
                  const progress = getProgress(goal);
                  const isOverdue = new Date(goal.end_date) < new Date();
                  return (
                    <div key={goal.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium">{goal.title}</h5>
                            <Badge className={priorityColors[goal.priority]}>
                              {goal.priority === 'high' ? 'Alta' : goal.priority === 'medium' ? 'Média' : 'Baixa'}
                            </Badge>
                            {isOverdue && (
                              <Badge className="bg-red-500/20 text-red-400">
                                <AlertCircle className="h-3 w-3 mr-1" /> Atrasada
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {goalTypeLabels[goal.goal_type] || goal.goal_type}
                            {goal.platform && ` • ${platformLabels[goal.platform] || goal.platform}`}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(goal)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteGoal.mutate(goal.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{goal.current_value?.toLocaleString('pt-BR')} de {goal.target_value.toLocaleString('pt-BR')}</span>
                          <span className="font-medium">{progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDateBR(goal.start_date)} - {formatDateBR(goal.end_date)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Completed Goals */}
            {completedGoals.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">Concluídas ({completedGoals.length})</h4>
                {completedGoals.map(goal => (
                  <div key={goal.id} className="p-3 border rounded-lg opacity-70">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="font-medium">{goal.title}</span>
                      <Badge className={statusColors.completed}>Concluída</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ArtistGoalsSection;
