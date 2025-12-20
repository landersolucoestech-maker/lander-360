import { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Eye, Edit, Trash2, Download } from "lucide-react";
import { useContractTemplates, useDeleteContractTemplate } from "@/hooks/useContractTemplates";
import { useDataExport } from "@/hooks/useDataExport";
import { ContractTemplateModal } from "@/components/modals/ContractTemplateModal";
import { ContractTemplateViewModal } from "@/components/modals/ContractTemplateViewModal";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import { ContractTemplate } from "@/services/contractTemplates";

const templateTypeLabels: Record<string, string> = {
  empresariamento: 'Empresariamento',
  empresariamento_suporte: 'Empresariamento com suporte',
  gestao: 'Gestão',
  agenciamento: 'Agenciamento',
  edicao: 'Edição',
  distribuicao: 'Distribuição',
  marketing: 'Marketing',
  producao_musical: 'Produção Musical',
  producao_audiovisual: 'Produção Audiovisual',
  licenciamento: 'Licenciamento',
  publicidade: 'Publicidade',
  parceria: 'Parceria',
  shows: 'Shows',
  outros: 'Outros'
};

const ContractTemplates = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | undefined>();
  const [templateToView, setTemplateToView] = useState<ContractTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<ContractTemplate | null>(null);

  const { data: templates = [], isLoading } = useContractTemplates();
  const deleteTemplate = useDeleteContractTemplate();
  const { exportToExcel } = useDataExport();

  const handleExport = () => {
    const exportData = templates.map(template => {
      const clauses = Array.isArray(template.clauses) ? template.clauses : [];
      return {
        ...template,
        template_type: templateTypeLabels[template.template_type] || template.template_type,
        is_active: template.is_active ? 'Ativo' : 'Inativo',
        clauses_count: clauses.length,
        clauses_titles: clauses.map((c: any) => c.title).filter(Boolean).join('; '),
      };
    });
    exportToExcel(exportData, 'templates-contratos', 'Templates', 'contract_templates');
  };

  const handleNewTemplate = () => {
    setSelectedTemplate(undefined);
    setIsModalOpen(true);
  };

  const handleViewTemplate = (template: ContractTemplate) => {
    setTemplateToView(template);
    setIsViewModalOpen(true);
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
      try {
        await deleteTemplate.mutateAsync(templateToDelete.id);
        setIsDeleteModalOpen(false);
        setTemplateToDelete(null);
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="w-full h-full px-4 py-3 space-y-3">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="h-9 w-9" />
                <div className="flex flex-col gap-2">
                  <h1 className="text-3xl font-bold text-foreground">Templates de Contratos</h1>
                  <p className="text-muted-foreground">Gerencie modelos de contratos reutilizáveis</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2" onClick={handleExport} disabled={templates.length === 0}>
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
                <Button className="gap-2" onClick={handleNewTemplate}>
                  <Plus className="h-4 w-4" />
                  Novo Template
                </Button>
              </div>
            </div>

            {/* Templates List */}
            <Card>
              <CardHeader>
                <CardTitle>Lista de Templates</CardTitle>
                <CardDescription>Modelos disponíveis para geração de contratos</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Carregando templates...</p>
                  </div>
                ) : templates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum template cadastrado</h3>
                    <p className="text-muted-foreground mb-4">Crie seu primeiro template de contrato</p>
                    <Button onClick={handleNewTemplate} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Criar Primeiro Template
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors gap-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-medium text-foreground">{template.name}</h3>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="secondary">
                                {templateTypeLabels[template.template_type] || template.template_type}
                              </Badge>
                              <Badge variant={template.is_active ? "default" : "outline"}>
                                {template.is_active ? "Ativo" : "Inativo"}
                              </Badge>
                              {template.version && (
                                <span className="text-xs text-muted-foreground">v{template.version}</span>
                              )}
                            </div>
                            {template.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">{template.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pl-14 sm:pl-0">
                          <Button variant="outline" size="sm" onClick={() => handleViewTemplate(template)}>
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditTemplate(template)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteTemplate(template)}>
                            <Trash2 className="h-4 w-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>

      <ContractTemplateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        template={selectedTemplate}
      />

      <ContractTemplateViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        template={templateToView}
      />

      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={confirmDelete}
        title="Excluir Template"
        description="Tem certeza que deseja excluir este template? Esta ação não pode ser desfeita."
        isLoading={deleteTemplate.isPending}
      />
    </SidebarProvider>
  );
};

export default ContractTemplates;
