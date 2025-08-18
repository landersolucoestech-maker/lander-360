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
  Edit,
  Eye
} from "lucide-react";

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

  const contracts = [
    {
      id: 1,
      type: "Gestão Artística",
      status: "Ativo",
      startDate: "2024-01-15",
      endDate: "2026-01-15",
      value: "R$ 0,00",
      commission: "15%",
      description: "Contrato de gestão artística completa incluindo produção, marketing e distribuição",
      clauses: [
        "Gestão de carreira artística",
        "Produção de conteúdo musical",
        "Marketing digital e tradicional",
        "Distribuição em plataformas digitais",
        "Booking de shows e eventos"
      ],
      renewalOption: true,
      autoRenewal: false
    },
    {
      id: 2,
      type: "Distribuição Digital",
      status: "Ativo", 
      startDate: "2023-12-01",
      endDate: "2024-12-01",
      value: "R$ 0,00",
      commission: "10%",
      description: "Contrato para distribuição em plataformas digitais (Spotify, Apple Music, etc.)",
      clauses: [
        "Distribuição em todas as plataformas digitais",
        "Relatórios mensais de performance",
        "Suporte técnico para uploads",
        "Otimização de metadados"
      ],
      renewalOption: true,
      autoRenewal: true
    },
    {
      id: 3,
      type: "Produção Musical",
      status: "Concluído",
      startDate: "2023-06-01", 
      endDate: "2023-11-30",
      value: "R$ 0,00",
      commission: "0%",
      description: "Contrato para produção do EP 'Novos Horizontes'",
      clauses: [
        "Produção de 6 faixas musicais",
        "Gravação em estúdio profissional",
        "Mixagem e masterização",
        "Entrega em formatos digitais"
      ],
      renewalOption: false,
      autoRenewal: false
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo": return "success";
      case "Concluído": return "secondary";
      case "Vencido": return "destructive";
      case "Pendente": return "warning";
      default: return "secondary";
    }
  };

  const getDaysUntilExpiry = (endDate: string) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

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
                  <div className="text-lg font-bold">2</div>
                  <div className="text-xs text-muted-foreground">Ativos</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Clock className="h-5 w-5 mx-auto mb-2 text-orange-600" />
                  <div className="text-lg font-bold">1</div>
                  <div className="text-xs text-muted-foreground">Concluídos</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <DollarSign className="h-5 w-5 mx-auto mb-2 text-blue-600" />
                  <div className="text-lg font-bold">R$ 0</div>
                  <div className="text-xs text-muted-foreground">Valor Total</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <AlertTriangle className="h-5 w-5 mx-auto mb-2 text-yellow-600" />
                  <div className="text-lg font-bold">365</div>
                  <div className="text-xs text-muted-foreground">Dias p/ Venc.</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Contratos */}
          <div className="space-y-4">
            {contracts.map((contract) => {
              const daysToExpiry = getDaysUntilExpiry(contract.endDate);
              
              return (
                <Card key={contract.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{contract.type}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {contract.description}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(contract.status) as any}>
                        {contract.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Informações Básicas */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">Início:</span>
                        <div>{new Date(contract.startDate).toLocaleDateString('pt-BR')}</div>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Fim:</span>
                        <div>{new Date(contract.endDate).toLocaleDateString('pt-BR')}</div>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Valor:</span>
                        <div className="font-medium">{contract.value}</div>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Comissão:</span>
                        <div className="font-medium">{contract.commission}</div>
                      </div>
                    </div>

                    {contract.status === "Ativo" && (
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
                      </div>
                    )}

                    <Separator />

                    {/* Cláusulas */}
                    <div>
                      <h4 className="font-medium mb-2">Principais Cláusulas:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {contract.clauses.map((clause, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 mt-0.5 text-green-600 flex-shrink-0" />
                            {clause}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Separator />

                    {/* Opções de Renovação */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="font-medium">Renovação: </span>
                        <span className={contract.renewalOption ? "text-green-600" : "text-muted-foreground"}>
                          {contract.renewalOption ? "Disponível" : "Não disponível"}
                        </span>
                        {contract.autoRenewal && (
                          <Badge variant="outline" className="ml-2">Auto-renovação</Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Eye className="h-3 w-3" />
                          Visualizar
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Download className="h-3 w-3" />
                          Download
                        </Button>
                        {contract.status === "Ativo" && (
                          <Button variant="outline" size="sm" className="gap-1">
                            <Edit className="h-3 w-3" />
                            Editar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}