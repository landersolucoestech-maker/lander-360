import { useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchFilter } from "@/components/filters/SearchFilter";
import { FileText, Plus, Calendar, AlertTriangle, CheckCircle, Upload, Download } from "lucide-react";
import * as XLSX from 'xlsx';
import { ContractModal } from "@/components/modals/ContractModal";
import { ContractViewModal } from "@/components/modals/ContractViewModal";
import { useContracts, useActiveContracts, useContractsExpiringSoon, useDeleteContract } from "@/hooks/useContracts";
import { mockContracts } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import { Contract } from "@/types/database";
import { formatDateBR } from "@/lib/utils";

const Contratos = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | undefined>();
  const [contractToView, setContractToView] = useState<Contract | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const { data: dbContracts = [], isLoading } = useContracts();
  const contracts: any[] = dbContracts;
  const { data: activeContracts = [] } = useActiveContracts();
  const { data: expiringSoon = [] } = useContractsExpiringSoon(30);
  const deleteContract = useDeleteContract();
  const { toast } = useToast();

  const handleExport = () => {
    const dataToExport = filteredContracts.map((contract: any) => ({
      'Título': contract.title || '',
      'Artista': contract.artists?.stage_name || contract.artists?.name || '',
      'Tipo de Serviço': serviceTypeLabels[contract.service_type as keyof typeof serviceTypeLabels] || '',
      'Status': statusLabels[contract.status as keyof typeof statusLabels] || '',
      'Data Início': contract.start_date || contract.effective_from || '',
      'Data Fim': contract.end_date || contract.effective_to || '',
      'Valor': contract.fixed_value || contract.advance_amount || '',
      'Royalties (%)': contract.royalty_rate || contract.royalties_percentage || '',
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Contratos');
    XLSX.writeFile(wb, `contratos_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast({ title: 'Sucesso', description: 'Arquivo exportado com sucesso!' });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        toast({ 
          title: 'Arquivo importado', 
          description: `${jsonData.length} registros encontrados. Funcionalidade de importação em desenvolvimento.` 
        });
      } catch (error) {
        toast({ title: 'Erro', description: 'Erro ao processar arquivo.', variant: 'destructive' });
      }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = '';
  };

  // Service type labels mapping
  const serviceTypeLabels = {
    empresariamento: 'Empresariamento',
    gestao: 'Gestão',
    agenciamento: 'Agenciamento',
    edicao: 'Edição',
    distribuicao: 'Distribuição',
    marketing: 'Marketing',
    producao_musical: 'Produção Musical',
    producao_audiovisual: 'Produção Audiovisual'
  };

  const statusLabels = {
    pendente: 'Pendente',
    assinado: 'Assinado',
    expirado: 'Expirado',
    rescindido: 'Rescindido',
    rascunho: 'Rascunho'
  };

  // Calculate days to expire for a contract
  const getDaysToExpire = (endDate: string | null) => {
    if (!endDate) return null;
    const today = new Date();
    const expireDate = new Date(endDate);
    const diffTime = expireDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Filter contracts based on search and filters
  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = !searchTerm || 
      ((contract as any).title || contract.contract_type).toLowerCase().includes(searchTerm.toLowerCase()) ||
      ((contract as any).responsible_person && (contract as any).responsible_person.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ((contract as any).service_type && serviceTypeLabels[(contract as any).service_type as keyof typeof serviceTypeLabels]?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilters = Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      if (key === 'service_type') return (contract as any).service_type === value;
      if (key === 'status') return (contract as any).status === value;
      if (key === 'client_type') return (contract as any).client_type === value;
      return true;
    });

    return matchesSearch && matchesFilters;
  });

  const filterOptions = [
    {
      key: "service_type",
      label: "Tipo de Serviço",
      options: ["empresariamento", "gestao", "agenciamento", "edicao", "distribuicao", "marketing", "producao_musical", "producao_audiovisual", "licenciamento", "publicidade", "parceria", "shows", "outros"]
    },
    {
      key: "status",
      label: "Status",
      options: ["pendente", "assinado", "expirado", "rescindido", "rascunho"]
    },
    {
      key: "client_type",
      label: "Tipo de Cliente",
      options: ["artista", "empresa"]
    }
  ];

  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);
  };

  const handleFilter = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
  };

  const handleClear = () => {
    setSearchTerm("");
    setFilters({});
  };

  const handleNewContract = () => {
    setSelectedContract(undefined);
    setIsModalOpen(true);
  };

  const handleViewContract = (contract: Contract) => {
    setContractToView(contract);
    setIsViewModalOpen(true);
  };

  const handleEditContract = (contract: Contract) => {
    setSelectedContract(contract);
    setIsModalOpen(true);
  };

  const handleDeleteContract = (contract: Contract) => {
    setContractToDelete(contract);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (contractToDelete) {
      try {
        await deleteContract.mutateAsync(contractToDelete.id);
        setIsDeleteModalOpen(false);
        setContractToDelete(null);
      } catch (error) {
        console.error('Error deleting contract:', error);
      }
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
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-foreground">Contratos</h1>
                <p className="text-muted-foreground">
                  Gerencie contratos e documentação legal
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="gap-2" onClick={handleExport}>
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
                <label>
                  <input type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
                  <Button variant="outline" className="gap-2" asChild>
                    <span><Upload className="h-4 w-4" />Importar</span>
                  </Button>
                </label>
                <Button className="gap-2" onClick={handleNewContract}>
                  <Plus className="h-4 w-4" />
                  Novo Contrato
                </Button>
              </div>
            </div>

            {/* KPI Cards */}
            {(() => {
              // Calculate KPIs from real data
              const totalContracts = contracts.length;
              const activeCount = activeContracts.length;
              const expiringCount = expiringSoon.length;
              
              // Calculate signed contracts this year
              const currentYear = new Date().getFullYear();
              const signedThisYear = contracts.filter((c: any) => {
                const createdAt = new Date(c.created_at);
                return createdAt.getFullYear() === currentYear && c.status === 'assinado';
              }).length;
              
              // Calculate total value of active contracts
              const totalValue = activeContracts.reduce((sum: number, c: any) => {
                const value = c.fixed_value || c.advance_amount || c.value || 0;
                return sum + Number(value);
              }, 0);
              
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <DashboardCard
                    title="Contratos Vigentes"
                    value={activeCount}
                    description="ativos no momento"
                    icon={FileText}
                    trend={{ value: totalContracts, isPositive: true }}
                  />
                  <DashboardCard
                    title="Vencendo em 30 dias"
                    value={expiringCount}
                    description="precisam renovação"
                    icon={AlertTriangle}
                    trend={{ value: expiringCount > 0 ? -expiringCount : 0, isPositive: expiringCount === 0 }}
                  />
                  <DashboardCard
                    title="Assinados este ano"
                    value={signedThisYear}
                    description="contratos assinados"
                    icon={CheckCircle}
                    trend={{ value: signedThisYear, isPositive: true }}
                  />
                  <DashboardCard
                    title="Valor Total"
                    value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
                    description="contratos vigentes"
                    icon={Calendar}
                    trend={{ value: 0, isPositive: true }}
                  />
                </div>
              );
            })()}

            {/* Search and Filters */}
            <SearchFilter
              searchPlaceholder="Buscar contratos por artista, tipo ou valor..."
              filters={filterOptions}
              onSearch={handleSearch}
              onFilter={handleFilter}
              onClear={handleClear}
            />

            {/* Contracts List */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Lista de Contratos</CardTitle>
                <CardDescription>
                  Acompanhe todos os contratos e seus vencimentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Carregando contratos...</p>
                    </div>
                  ) : filteredContracts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum contrato cadastrado</h3>
                      <p className="text-muted-foreground mb-4">Comece criando seu primeiro contrato</p>
                      <Button onClick={handleNewContract} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Criar Primeiro Contrato
                      </Button>
                    </div>
                  ) : (
                    filteredContracts.map((contract) => {
                      const daysToExpire = getDaysToExpire((contract as any).end_date || contract.effective_to);
                      const totalValue = (contract as any).fixed_value || contract.advance_amount || 0;
                      
                      return (
                        <div
                          key={contract.id}
                          className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <FileText className="h-6 w-6 text-primary" />
                            </div>
                            <div className="space-y-1">
                              <h3 className="font-medium text-foreground">{(contract as any).title || contract.contract_type}</h3>
                              {(contract as any).artists && (
                                <p className="text-sm text-muted-foreground">
                                  Artista: {(contract as any).artists.stage_name || (contract as any).artists.name}
                                </p>
                              )}
                              <div className="flex items-center gap-2">
                                {(contract as any).service_type && (
                                  <Badge variant="secondary">
                                    {serviceTypeLabels[(contract as any).service_type as keyof typeof serviceTypeLabels]}
                                  </Badge>
                                )}
                                <Badge 
                                  variant={
                                    (contract as any).status === "assinado" ? "default" : 
                                    (contract as any).status === "expirado" || (contract as any).status === "rescindido" ? "destructive" : 
                                    (contract as any).status === "pendente" ? "secondary" : "outline"
                                  }
                                >
                                  {statusLabels[(contract as any).status as keyof typeof statusLabels] || 'Ativo'}
                                </Badge>
                                {(contract as any).client_type && (
                                  <Badge variant="outline">
                                    {(contract as any).client_type === 'artista' ? 'Artista' : 'Empresa'}
                                  </Badge>
                                )}
                              </div>
                              {(contract as any).responsible_person && (
                                <p className="text-sm text-muted-foreground">
                                  Responsável: {(contract as any).responsible_person}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6 text-sm">
                            {((contract as any).start_date || (contract as any).end_date || contract.effective_from || contract.effective_to) && (
                              <div className="text-center">
                                <div className="text-muted-foreground">Período</div>
                                <div className="font-medium">
                                  {formatDateBR((contract as any).start_date || contract.effective_from)} - {formatDateBR((contract as any).end_date || contract.effective_to)}
                                </div>
                              </div>
                            )}
                            
                            {totalValue > 0 && (
                              <div className="text-center">
                                <div className="text-muted-foreground">Valor</div>
                                <div className="font-medium text-foreground">
                                  {new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                  }).format(totalValue)}
                                </div>
                                {(contract.royalty_rate || (contract as any).royalties_percentage) && (
                                  <div className="text-xs text-muted-foreground">
                                    + {contract.royalty_rate || (contract as any).royalties_percentage}% royalties
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {daysToExpire !== null && (
                              <div className="text-center">
                                <div className="text-muted-foreground">Vencimento</div>
                                <div className={`font-medium ${
                                  daysToExpire < 0 ? "text-destructive" :
                                  daysToExpire < 30 ? "text-orange-600" : "text-foreground"
                                }`}>
                                  {daysToExpire < 0 ? "Vencido" : 
                                   daysToExpire === 0 ? "Hoje" :
                                   `${daysToExpire} dias`}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewContract(contract)}
                              >
                                Ver
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditContract(contract)}
                              >
                                Editar
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeleteContract(contract)}
                              >
                                Excluir
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>

      {/* Modals */}
      <ContractViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        contract={contractToView}
      />

      <ContractModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contract={selectedContract}
      />

      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={confirmDelete}
        title="Excluir Contrato"
        description={`Tem certeza que deseja excluir o contrato "${(contractToDelete as any)?.title || contractToDelete?.contract_type}"? Esta ação não pode ser desfeita.`}
        isLoading={deleteContract.isPending}
      />
    </SidebarProvider>
  );
};

export default Contratos;