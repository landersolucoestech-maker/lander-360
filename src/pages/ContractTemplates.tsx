import { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Edit2, Trash2, Eye, Loader2 } from "lucide-react";
import { useContractTemplates, useDeleteContractTemplate } from "@/hooks/useContractTemplates";
import { ContractTemplateModal } from "@/components/modals/ContractTemplateModal";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import { ContractTemplate } from "@/services/contractTemplates";

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

const ContractTemplatesPage = () => {
  const { data: templates = [], isLoading } = useContractTemplates();
  const deleteTemplate = useDeleteContractTemplate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<ContractTemplate | null>(null);

  const handleNewTemplate = () => {
    setSelectedTemplate(null);
    setIsModalOpen(true);
  };

  const handleEditTemplate = (template: ContractTemplate) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  const handleDeleteTemplate = (template: ContractTemplate) => {
    setTemplateToDelete(template);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (templateToDelete) {
      await deleteTemplate.mutateAsync(templateToDelete.id);
      setIsDeleteModalOpen(false);
      setTemplateToDelete(null);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="w-full h-full px-4 py-4 space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="h-9 w-9" />
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Templates de Contratos</h1>
                  <p className="text-muted-foreground">Gerencie templates padronizados para geração de contratos</p>
                </div>
              </div>
              <Button onClick={handleNewTemplate} className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Template
              </Button>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                <Card className="col-span-full">
                  <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </CardContent>
                </Card>
              ) : templates.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum template cadastrado</h3>
                    <p className="text-muted-foreground mb-4">Crie seu primeiro template de contrato</p>
                    <Button onClick={handleNewTemplate} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Criar Template
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                templates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base line-clamp-2">{template.name}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {template.description || 'Sem descrição'}
                          </CardDescription>
                        </div>
                        <Badge variant={template.is_active ? "default" : "secondary"}>
                          {template.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {templateTypeLabels[template.template_type] || template.template_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {template.clauses.length} cláusulas
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEditTemplate(template)}
                        >
                          <Edit2 className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTemplate(template)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </SidebarInset>
      </div>

      <ContractTemplateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        template={selectedTemplate}
      />

      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={confirmDelete}
        title="Excluir Template"
        description={`Tem certeza que deseja excluir o template "${templateToDelete?.name}"? Esta ação não pode ser desfeita.`}
      />
    </SidebarProvider>
  );
};

export default ContractTemplatesPage;
