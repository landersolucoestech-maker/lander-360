import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Calendar, 
  DollarSign, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  Eye,
  Info,
  Plus
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDateBR } from "@/lib/utils";

interface ArtistContractModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artist: any;
}

export function ArtistContractModal({
  open,
  onOpenChange,
  artist,
}: ArtistContractModalProps) {
  if (!artist) return null;

  // Buscar contratos reais do banco de dados
  const { data: contracts, isLoading } = useQuery({
    queryKey: ['artist-contracts', artist.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('artist_id', artist.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: open && !!artist.id
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "Ativo": return "success";
      case "completed":
      case "Concluído": return "secondary";
      case "expired":
      case "Vencido": return "destructive";
      case "pending":
      case "Pendente": return "warning";
      case "draft":
      case "Rascunho": return "outline";
      default: return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "Ativo";
      case "completed": return "Concluído";
      case "expired": return "Vencido";
      case "pending": return "Pendente";
      case "draft": return "Rascunho";
      default: return status;
    }
  };

  const getDaysUntilExpiry = (endDate: string | null) => {
    if (!endDate) return null;
    const today = new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatContractDate = (dateString: string | null) => {
    if (!dateString) return 'Não informado';
    return formatDateBR(dateString);
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const activeContracts = contracts?.filter(c => c.status === 'active' || c.status === 'Ativo') || [];
  const completedContracts = contracts?.filter(c => c.status === 'completed' || c.status === 'Concluído') || [];
  const totalValue = contracts?.reduce((acc, c) => acc + (c.value || 0), 0) || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Contratos - {artist.name}</DialogTitle>
          <DialogDescription>
            Todos os contratos e acordos do artista
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Resumo dos Contratos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo dos Contratos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <CheckCircle className="h-5 w-5 mx-auto mb-2 text-green-600" />
                  <div className="text-lg font-bold">{activeContracts.length}</div>
                  <div className="text-xs text-muted-foreground">Ativos</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Clock className="h-5 w-5 mx-auto mb-2 text-orange-600" />
                  <div className="text-lg font-bold">{completedContracts.length}</div>
                  <div className="text-xs text-muted-foreground">Concluídos</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <DollarSign className="h-5 w-5 mx-auto mb-2 text-blue-600" />
                  <div className="text-lg font-bold">{formatCurrency(totalValue)}</div>
                  <div className="text-xs text-muted-foreground">Valor Total</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <FileText className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <div className="text-lg font-bold">{contracts?.length || 0}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Contratos */}
          <div className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                </CardContent>
              </Card>
            ) : contracts && contracts.length > 0 ? (
              contracts.map((contract) => {
                const daysToExpiry = getDaysUntilExpiry(contract.end_date);
                
                return (
                  <Card key={contract.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{contract.title}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {contract.description || 'Sem descrição'}
                          </p>
                        </div>
                        <Badge variant={getStatusColor(contract.status || '') as any}>
                          {getStatusLabel(contract.status || '')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Informações Básicas */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">Início:</span>
                          <div>{formatContractDate(contract.start_date)}</div>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Fim:</span>
                          <div>{formatContractDate(contract.end_date)}</div>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Valor:</span>
                          <div className="font-medium">{formatCurrency(contract.value)}</div>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Tipo:</span>
                          <div className="font-medium">{contract.contract_type || 'Não informado'}</div>
                        </div>
                      </div>

                      {contract.status === "active" && daysToExpiry !== null && (
                        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {daysToExpiry > 0 
                              ? `Vence em ${daysToExpiry} dias`
                              : daysToExpiry === 0 
                              ? "Vence hoje!"
                              : `Vencido há ${Math.abs(daysToExpiry)} dias`
                            }
                          </span>
                          {daysToExpiry <= 30 && daysToExpiry > 0 && (
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          )}
                        </div>
                      )}

                      <Separator />

                      {/* Ações */}
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Eye className="h-3 w-3" />
                          Visualizar
                        </Button>
                        {contract.document_url && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1"
                            onClick={() => window.open(contract.document_url, '_blank')}
                          >
                            <Download className="h-3 w-3" />
                            Download
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="py-8">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Info className="h-12 w-12 mb-4" />
                    <p className="text-center font-medium">Nenhum contrato encontrado</p>
                    <p className="text-sm text-center mt-2">
                      Este artista ainda não possui contratos cadastrados no sistema.
                    </p>
                    <Button variant="outline" size="sm" className="mt-4 gap-2">
                      <Plus className="h-4 w-4" />
                      Adicionar Contrato
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
