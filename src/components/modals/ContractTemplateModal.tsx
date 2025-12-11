import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, GripVertical, Save } from 'lucide-react';
import { ContractTemplate, ContractClause, ContractTemplateInsert } from '@/services/contractTemplates';
import { useCreateContractTemplate, useUpdateContractTemplate } from '@/hooks/useContractTemplates';

interface ContractTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: ContractTemplate | null;
}

const templateTypeLabels: Record<string, string> = {
  agenciamento: 'Agenciamento',
  gestao: 'Gestão',
  empresariamento: 'Empresariamento',
  producao_musical: 'Produção Musical',
  producao_audiovisual: 'Produção Audiovisual',
  edicao: 'Edição',
  distribuicao: 'Distribuição',
  marketing: 'Marketing',
  licenciamento: 'Licenciamento',
  termo_fonograma: 'Termo de Autorização de Fonograma',
};

export const ContractTemplateModal: React.FC<ContractTemplateModalProps> = ({
  isOpen,
  onClose,
  template,
}) => {
  const createTemplate = useCreateContractTemplate();
  const updateTemplate = useUpdateContractTemplate();

  const [formData, setFormData] = useState({
    name: '',
    template_type: '',
    description: '',
  });

  const [clauses, setClauses] = useState<ContractClause[]>([]);

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        template_type: template.template_type,
        description: template.description || '',
      });
      setClauses(template.clauses || []);
    } else {
      setFormData({
        name: '',
        template_type: '',
        description: '',
      });
      setClauses([]);
    }
  }, [template, isOpen]);

  const handleAddClause = () => {
    const newClause: ContractClause = {
      id: Date.now().toString(),
      title: '',
      content: '',
      isCustom: true,
    };
    setClauses([...clauses, newClause]);
  };

  const handleUpdateClause = (id: string, field: 'title' | 'content', value: string) => {
    setClauses(clauses.map(clause => 
      clause.id === id ? { ...clause, [field]: value } : clause
    ));
  };

  const handleRemoveClause = (id: string) => {
    setClauses(clauses.filter(clause => clause.id !== id));
  };

  const handleSubmit = async () => {
    const data: ContractTemplateInsert = {
      name: formData.name,
      template_type: formData.template_type,
      description: formData.description || undefined,
      clauses: clauses,
    };

    try {
      if (template) {
        await updateTemplate.mutateAsync({ id: template.id, data });
      } else {
        await createTemplate.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const isLoading = createTemplate.isPending || updateTemplate.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Editar Template de Contrato' : 'Novo Template de Contrato'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Template</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Contrato de Agenciamento Artístico"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Contrato</Label>
                  <Select
                    value={formData.template_type}
                    onValueChange={(value) => setFormData({ ...formData, template_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(templateTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição do template..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Clauses */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Cláusulas</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={handleAddClause}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Cláusula
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {clauses.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Nenhuma cláusula adicionada. Clique em "Adicionar Cláusula" para começar.
                </p>
              ) : (
                clauses.map((clause, index) => (
                  <div key={clause.id} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">Cláusula {index + 1}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveClause(clause.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Título</Label>
                      <Input
                        value={clause.title}
                        onChange={(e) => handleUpdateClause(clause.id, 'title', e.target.value)}
                        placeholder="Ex: DO OBJETO"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Conteúdo</Label>
                      <Textarea
                        value={clause.content}
                        onChange={(e) => handleUpdateClause(clause.id, 'content', e.target.value)}
                        placeholder="Texto da cláusula... Use {{variavel}} para campos dinâmicos."
                        rows={4}
                      />
                      <p className="text-xs text-muted-foreground">
                        Variáveis disponíveis: {'{{contracted_name}}'}, {'{{royalties_percentage}}'}, {'{{start_date}}'}, {'{{end_date}}'}, {'{{fixed_value}}'}, {'{{advance_amount}}'}, {'{{work_title}}'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !formData.name || !formData.template_type}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar Template'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
