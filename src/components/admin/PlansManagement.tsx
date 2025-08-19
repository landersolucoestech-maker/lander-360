import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Users, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  billing_period: 'monthly' | 'yearly';
  max_users: number;
  features: string[];
  is_active: boolean;
  created_at: string;
}

export const PlansManagement = () => {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    price: 0,
    billing_period: 'monthly' as 'monthly' | 'yearly',
    max_users: 1,
    features: '' // Will be split by comma
  });

  // Mock data - replace with real Supabase data
  const [plans, setPlans] = useState<Plan[]>([
    {
      id: '1',
      name: 'Básico',
      description: 'Plano inicial para pequenas equipes',
      price: 29.90,
      billing_period: 'monthly',
      max_users: 5,
      features: ['Dashboard básico', 'Relatórios limitados', 'Suporte por email'],
      is_active: true,
      created_at: '2024-01-15'
    },
    {
      id: '2',
      name: 'Profissional',
      description: 'Para equipes em crescimento',
      price: 79.90,
      billing_period: 'monthly',
      max_users: 25,
      features: ['Dashboard completo', 'Relatórios avançados', 'Suporte prioritário', 'API access'],
      is_active: true,
      created_at: '2024-01-15'
    },
    {
      id: '3',
      name: 'Enterprise',
      description: 'Para grandes organizações',
      price: 199.90,
      billing_period: 'monthly',
      max_users: 100,
      features: ['Recursos ilimitados', 'Suporte 24/7', 'Manager dedicado', 'Integrações customizadas'],
      is_active: true,
      created_at: '2024-01-15'
    }
  ]);

  const handleCreatePlan = () => {
    if (!newPlan.name || !newPlan.description) {
      toast({
        title: "Erro",
        description: "Nome e descrição são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const plan: Plan = {
      id: Date.now().toString(),
      ...newPlan,
      features: newPlan.features.split(',').map(f => f.trim()),
      is_active: true,
      created_at: new Date().toISOString()
    };

    setPlans([...plans, plan]);
    setNewPlan({
      name: '',
      description: '',
      price: 0,
      billing_period: 'monthly',
      max_users: 1,
      features: ''
    });
    setIsCreateDialogOpen(false);
    
    toast({
      title: "Plano criado",
      description: "Novo plano foi criado com sucesso"
    });
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setNewPlan({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      billing_period: plan.billing_period,
      max_users: plan.max_users,
      features: plan.features.join(', ')
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdatePlan = () => {
    if (!editingPlan || !newPlan.name || !newPlan.description) {
      toast({
        title: "Erro",
        description: "Nome e descrição são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const updatedPlan: Plan = {
      ...editingPlan,
      ...newPlan,
      features: newPlan.features.split(',').map(f => f.trim())
    };

    setPlans(plans.map(plan => 
      plan.id === editingPlan.id ? updatedPlan : plan
    ));
    
    setNewPlan({
      name: '',
      description: '',
      price: 0,
      billing_period: 'monthly',
      max_users: 1,
      features: ''
    });
    setEditingPlan(null);
    setIsEditDialogOpen(false);
    
    toast({
      title: "Plano atualizado",
      description: "Plano foi atualizado com sucesso"
    });
  };

  const togglePlanStatus = (planId: string) => {
    setPlans(plans.map(plan => 
      plan.id === planId 
        ? { ...plan, is_active: !plan.is_active }
        : plan
    ));
    
    toast({
      title: "Status atualizado",
      description: "Status do plano foi atualizado"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Planos</h2>
          <p className="text-muted-foreground">Gerencie os planos de assinatura disponíveis</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Plano
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Plano</DialogTitle>
              <DialogDescription>
                Configure os detalhes do novo plano de assinatura
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Plano</Label>
                <Input
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                  placeholder="Ex: Profissional"
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={newPlan.description}
                  onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                  placeholder="Descreva o plano..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preço (R$)</Label>
                  <Input
                    type="number"
                    value={newPlan.price}
                    onChange={(e) => setNewPlan({ ...newPlan, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Máx. Usuários</Label>
                  <Input
                    type="number"
                    value={newPlan.max_users}
                    onChange={(e) => setNewPlan({ ...newPlan, max_users: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Recursos (separados por vírgula)</Label>
                <Textarea
                  value={newPlan.features}
                  onChange={(e) => setNewPlan({ ...newPlan, features: e.target.value })}
                  placeholder="Dashboard, Relatórios, Suporte..."
                />
              </div>
              <Button onClick={handleCreatePlan} className="w-full">
                Criar Plano
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Plan Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Plano</DialogTitle>
              <DialogDescription>
                Atualize os detalhes do plano de assinatura
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Plano</Label>
                <Input
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                  placeholder="Ex: Profissional"
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={newPlan.description}
                  onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                  placeholder="Descreva o plano..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preço (R$)</Label>
                  <Input
                    type="number"
                    value={newPlan.price}
                    onChange={(e) => setNewPlan({ ...newPlan, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Máx. Usuários</Label>
                  <Input
                    type="number"
                    value={newPlan.max_users}
                    onChange={(e) => setNewPlan({ ...newPlan, max_users: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Recursos (separados por vírgula)</Label>
                <Textarea
                  value={newPlan.features}
                  onChange={(e) => setNewPlan({ ...newPlan, features: e.target.value })}
                  placeholder="Dashboard, Relatórios, Suporte..."
                />
              </div>
              <Button onClick={handleUpdatePlan} className="w-full">
                Atualizar Plano
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {plan.name}
                    <Badge variant={plan.is_active ? "default" : "secondary"}>
                      {plan.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">R$ {plan.price.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">
                    {plan.billing_period === 'monthly' ? 'mensal' : 'anual'}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Até {plan.max_users} usuários</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Cobrança {plan.billing_period === 'monthly' ? 'mensal' : 'anual'}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Recursos inclusos:</h4>
                  <div className="flex flex-wrap gap-2">
                    {plan.features.map((feature, index) => (
                      <Badge key={index} variant="outline">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditPlan(plan)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant={plan.is_active ? "secondary" : "default"}
                    size="sm"
                    onClick={() => togglePlanStatus(plan.id)}
                  >
                    {plan.is_active ? "Desativar" : "Ativar"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};