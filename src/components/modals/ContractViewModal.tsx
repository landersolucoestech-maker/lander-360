import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Contract } from "@/types/database";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, Calendar, DollarSign, User, Building, Briefcase, Percent, FileCheck, ClipboardList } from "lucide-react";
import { useArtists } from "@/hooks/useArtists";
import { useProjects } from "@/hooks/useProjects";
import { useCrmContacts } from "@/hooks/useCrm";

interface ContractViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract | null;
}

const serviceTypeLabels: Record<string, string> = {
  empresariamento: 'Empresariamento',
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

const statusLabels: Record<string, string> = {
  pendente: 'Pendente',
  assinado: 'Assinado',
  expirado: 'Expirado',
  rescindido: 'Rescindido',
  rascunho: 'Rascunho'
};

const paymentTypeLabels: Record<string, string> = {
  valor_fixo: 'Valor Fixo',
  royalties: 'Royalties'
};

export function ContractViewModal({ isOpen, onClose, contract }: ContractViewModalProps) {
  const { data: artists = [] } = useArtists();
  const { data: projects = [] } = useProjects();
  const { data: crmContacts = [] } = useCrmContacts();

  if (!contract) return null;

  const contractData = contract as any;
  const totalValue = contractData.fixed_value || contract.advance_amount || contractData.value || 0;
  
  // Find related data
  const artist = contract.artist_id ? artists.find(a => a.id === contract.artist_id) : null;
  const project = contractData.project_id ? projects.find(p => p.id === contractData.project_id) : null;
  const contact = contractData.contractor_contact ? crmContacts.find(c => c.id === contractData.contractor_contact) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <FileText className="h-5 w-5 text-primary" />
            {contractData.title || contract.contract_type}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            {contractData.service_type && (
              <Badge variant="secondary">
                {serviceTypeLabels[contractData.service_type] || contractData.service_type}
              </Badge>
            )}
            <Badge 
              variant={
                contractData.status === "assinado" ? "default" : 
                contractData.status === "expirado" || contractData.status === "rescindido" ? "destructive" : 
                contractData.status === "pendente" ? "secondary" : "outline"
              }
            >
              {statusLabels[contractData.status] || 'Ativo'}
            </Badge>
            {contractData.client_type && (
              <Badge variant="outline">
                {contractData.client_type === 'artista' ? 'Artista' : 'Empresa'}
              </Badge>
            )}
            {contractData.registry_office && (
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                Registrado em Cartório
              </Badge>
            )}
          </div>

          {/* Contract Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo de Cliente */}
            {contractData.client_type && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Building className="h-4 w-4" />
                  <span className="text-sm font-medium">Tipo de Cliente</span>
                </div>
                <div className="font-medium capitalize">{contractData.client_type}</div>
              </div>
            )}

            {/* Artista */}
            {contractData.client_type === 'artista' && artist && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">Artista</span>
                </div>
                <div className="font-medium">{artist.stage_name || artist.name}</div>
                {artist.email && <div className="text-sm text-muted-foreground">{artist.email}</div>}
              </div>
            )}

            {/* Contratante/Contato para Empresa */}
            {contractData.client_type === 'empresa' && contact && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Building className="h-4 w-4" />
                  <span className="text-sm font-medium">Contratante/Contato</span>
                </div>
                <div className="font-medium">{contact.name}</div>
                {contact.company && (
                  <div className="text-sm text-muted-foreground">{contact.company}</div>
                )}
                {contact.email && (
                  <div className="text-sm text-muted-foreground">{contact.email}</div>
                )}
              </div>
            )}

            {/* Tipo de Serviço */}
            {contractData.service_type && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Briefcase className="h-4 w-4" />
                  <span className="text-sm font-medium">Tipo de Serviço</span>
                </div>
                <div className="font-medium">{serviceTypeLabels[contractData.service_type] || contractData.service_type}</div>
              </div>
            )}

            {/* Projeto */}
            {project && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Briefcase className="h-4 w-4" />
                  <span className="text-sm font-medium">Projeto</span>
                </div>
                <div className="font-medium">{project.name}</div>
              </div>
            )}

            {/* Responsável */}
            {contractData.responsible_person && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">Responsável</span>
                </div>
                <div className="font-medium">{contractData.responsible_person}</div>
              </div>
            )}

            {/* Período */}
            {(contractData.start_date || contractData.end_date || contract.effective_from || contract.effective_to) && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Período de Vigência</span>
                </div>
                <div className="font-medium">
                  {(contractData.start_date || contract.effective_from) 
                    ? format(new Date(contractData.start_date || contract.effective_from), "dd/MM/yyyy", { locale: ptBR }) 
                    : "N/A"} 
                  {" até "} 
                  {(contractData.end_date || contract.effective_to) 
                    ? format(new Date(contractData.end_date || contract.effective_to), "dd/MM/yyyy", { locale: ptBR }) 
                    : "N/A"}
                </div>
              </div>
            )}

            {/* Registro em Cartório */}
            {contractData.registry_office && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <FileCheck className="h-4 w-4" />
                  <span className="text-sm font-medium">Registro em Cartório</span>
                </div>
                <div className="font-medium">
                  {contractData.registry_date 
                    ? format(new Date(contractData.registry_date), "dd/MM/yyyy", { locale: ptBR })
                    : 'Sim'}
                </div>
              </div>
            )}

          </div>

          {/* Valores Section */}
          <div className="border-t border-border pt-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Valores
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tipo de Pagamento */}
              {contractData.payment_type && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-muted-foreground text-sm mb-1">Tipo de Pagamento</div>
                  <div className="font-medium">
                    {paymentTypeLabels[contractData.payment_type] || contractData.payment_type}
                  </div>
                </div>
              )}

              {/* Valor Principal */}
              {totalValue > 0 && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-muted-foreground text-sm mb-1">
                    {contractData.payment_type === 'valor_fixo' ? 'Valor do Serviço' : 'Valor do Contrato'}
                  </div>
                  <div className="font-medium text-lg text-primary">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(totalValue)}
                  </div>
                </div>
              )}

              {/* Royalties */}
              {(contract.royalty_rate || contractData.royalties_percentage) && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Percent className="h-3 w-3" />
                    <span className="text-sm">Royalties</span>
                  </div>
                  <div className="font-medium text-lg">
                    {Math.min(contract.royalty_rate || contractData.royalties_percentage || 0, 100)}%
                  </div>
                </div>
              )}

              {/* Adiantamento */}
              {contractData.advance_payment && contractData.advance_payment > 0 && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-muted-foreground text-sm mb-1">Adiantamento</div>
                  <div className="font-medium text-lg">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(contractData.advance_payment)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Termos e Condições */}
          {contractData.terms && (
            <div className="border-t border-border pt-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                Termos e Condições
              </h3>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-foreground whitespace-pre-wrap">{contractData.terms}</p>
              </div>
            </div>
          )}

          {/* Descrição */}
          {contract.description && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-muted-foreground text-sm font-medium mb-2">Descrição</div>
              <p className="text-foreground">{contract.description}</p>
            </div>
          )}

          {/* Observações */}
          {(contract.notes || contractData.observations) && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-muted-foreground text-sm font-medium mb-2">Observações</div>
              <p className="text-foreground">{contract.notes || contractData.observations}</p>
            </div>
          )}

          {/* Metadados */}
          <div className="text-xs text-muted-foreground pt-4 border-t border-border">
            {contract.created_at && (
              <p>Criado em: {format(new Date(contract.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
            )}
            {contract.updated_at && (
              <p>Atualizado em: {format(new Date(contract.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}