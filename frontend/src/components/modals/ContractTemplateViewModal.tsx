import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ContractTemplate } from '@/services/contractTemplates';
import { formatDateBR } from '@/lib/utils';

interface ContractTemplateViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: ContractTemplate | null;
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

export const ContractTemplateViewModal: React.FC<ContractTemplateViewModalProps> = ({
  isOpen,
  onClose,
  template,
}) => {
  if (!template) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {template.name}
            <Badge variant={template.is_active ? "default" : "secondary"}>
              {template.is_active ? "Ativo" : "Inativo"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Tipo</p>
              <p className="font-medium">{templateTypeLabels[template.template_type] || template.template_type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Versão</p>
              <p className="font-medium">{template.version || 1}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Criado em</p>
              <p className="font-medium">{formatDateBR(template.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Atualizado em</p>
              <p className="font-medium">{formatDateBR(template.updated_at)}</p>
            </div>
          </div>

          {template.description && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Descrição</p>
              <p className="text-foreground">{template.description}</p>
            </div>
          )}

          <Separator />

          {/* Header Preview */}
          {template.header_html && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Cabeçalho</p>
              <div className="border border-border rounded-lg p-4 bg-card">
                <div dangerouslySetInnerHTML={{ __html: template.header_html }} />
              </div>
            </div>
          )}

          {/* Clauses Preview */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Cláusulas ({template.clauses?.length || 0})
            </p>
            {template.clauses && template.clauses.length > 0 ? (
              <div className="space-y-4">
                {template.clauses.map((clause: any, index: number) => (
                  <div key={clause.id || index} className="border border-border rounded-lg p-4 bg-card">
                    <h4 className="font-semibold text-foreground mb-2">
                      {index + 1}. {clause.title || `Cláusula ${index + 1}`}
                    </h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{clause.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">Nenhuma cláusula cadastrada</p>
            )}
          </div>

          {/* Footer Preview */}
          {template.footer_html && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Rodapé</p>
              <div className="border border-border rounded-lg p-4 bg-card">
                <div dangerouslySetInnerHTML={{ __html: template.footer_html }} />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
