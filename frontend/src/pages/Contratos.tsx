import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchFilter } from "@/components/filters/SearchFilter";
import { FileText, Plus, Calendar, AlertTriangle, CheckCircle, Upload, Download, Loader2, Trash2, FileSignature, LayoutTemplate } from "lucide-react";
import { ContractModal } from "@/components/modals/ContractModal";
import { ContractViewModal } from "@/components/modals/ContractViewModal";
import { GenerateContractModal } from "@/components/modals/GenerateContractModal";
import { useContracts, useActiveContracts, useContractsExpiringSoon, useDeleteContract, useCreateContract } from "@/hooks/useContracts";
import { useArtists } from "@/hooks/useArtists";
import { useToast } from "@/hooks/use-toast";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import { useDataExport } from "@/hooks/useDataExport";
import { useImportExport } from "@/hooks/useImportExport";
import { Contract } from "@/types/database";
import { formatDateBR } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";


const Contratos = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | undefined>();
  const [contractToView, setContractToView] = useState<Contract | null>(null);
  const [contractToGenerate, setContractToGenerate] = useState<Contract | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: dbContracts = [], isLoading } = useContracts();
  const contracts: any[] = dbContracts;
  const { data: activeContracts = [] } = useActiveContracts();
  const { data: expiringSoon = [] } = useContractsExpiringSoon(30);
  const { data: artists = [] } = useArtists();
  const deleteContract = useDeleteContract();
  const createContract = useCreateContract();
  const { toast } = useToast();
  const { exportToExcel } = useDataExport();
  const { parseExcelFile, parseContractImportRow } = useImportExport();

  const serviceTypeLabels: Record<string, string> = {
    empresariamento: 'Empresariamento',
    empresariamento_suporte: 'Empresariamento com suporte',
    gestao: 'Gestão',
    agenciamento: 'Agenciamento',
    edicao: 'Edição',
    distribuicao: 'Distribuição',
    marketing: 'Marketing',
    producao_musical: 'Produção Musical',
    producao_audiovisual: 'Produção Audiovisual',
    licenciamento: 'Licenciamento'
  };

  const statusLabels: Record<string, string> = {
    pendente: 'Pendente',
    assinado: 'Assinado',
    expirado: 'Expirado',
    rescindido: 'Rescindido',
    rascunho: 'Rascunho'
  };

  const getDaysToExpire = (endDate: string | null) => {
    if (!endDate) return null;
    const today = new Date();
    const expireDate = new Date(endDate);
    const diffTime = expireDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

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
    { key: "service_type", label: "Tipo de Serviço", options: ["empresariamento", "gestao", "agenciamento", "edicao", "distribuicao", "marketing", "producao_musical", "producao_audiovisual", "licenciamento", "publicidade", "parceria", "shows", "outros"] },
    { key: "status", label: "Status", options: ["pendente", "assinado", "expirado", "rescindido", "rascunho"] },
    { key: "client_type", label: "Tipo de Cliente", options: ["artista", "empresa"] }
  ];

  const handleSearch = (term: string) => setSearchTerm(term);
  const handleFilter = (newFilters: Record<string, string>) => setFilters(newFilters);
  const handleClear = () => { setSearchTerm(""); setFilters({}); };
  const handleNewContract = () => { setSelectedContract(undefined); setIsModalOpen(true); };
  const handleViewContract = (contract: Contract) => { setContractToView(contract); setIsViewModalOpen(true); };
  const handleEditContract = (contract: Contract) => { setSelectedContract(contract); setIsModalOpen(true); };
  const handleDeleteContract = (contract: Contract) => { setContractToDelete(contract); setIsDeleteModalOpen(true); };
  const handleGenerateDocument = (contract: Contract) => { setContractToGenerate(contract); setIsGenerateModalOpen(true); };

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

  const handleSelectAll = (checked: boolean) => {
    setSelectedItems(checked ? filteredContracts.map(c => c.id) : []);
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    setSelectedItems(checked ? [...selectedItems, itemId] : selectedItems.filter(id => id !== itemId));
  };

  const confirmBulkDelete = async () => {
    setIsDeletingBulk(true);
    try {
      for (const id of selectedItems) {
        await deleteContract.mutateAsync(id);
      }
      toast({ title: "Contratos excluídos", description: `${selectedItems.length} contratos foram excluídos com sucesso.` });
      setSelectedItems([]);
      setIsBulkDeleteModalOpen(false);
    } catch (error) {
      toast({ title: "Erro ao excluir", description: "Não foi possível excluir alguns contratos.", variant: "destructive" });
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const handleExport = () => {
    exportToExcel(contracts, "contratos", "Contratos", "contracts");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    
    try {
      const data = await parseExcelFile(file);
      
      // Build artists map for lookup
      const artistsMap: Record<string, string> = {};
      artists.forEach((artist: any) => {
        if (artist.name) artistsMap[artist.name.toLowerCase()] = artist.id;
        if (artist.stage_name) artistsMap[artist.stage_name.toLowerCase()] = artist.id;
      });

      let successCount = 0;
      let errorCount = 0;

      for (const row of data) {
        try {
          const contractData = parseContractImportRow(row, artistsMap);
          if (contractData) {
            await createContract.mutateAsync(contractData);
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error('Error importing contract row:', error);
          errorCount++;
        }
      }

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['contracts'] });

      toast({ 
        title: "Importação concluída", 
        description: `${successCount} contratos importados com sucesso.${errorCount > 0 ? ` ${errorCount} erros.` : ''}` 
      });
    } catch (error) {
      console.error('Error importing contracts:', error);
      toast({ title: "Erro na importação", description: "Não foi possível ler o arquivo.", variant: "destructive" });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
                  <h1 className="text-3xl font-bold text-foreground">Contratos</h1>
                  <p className="text-muted-foreground">Gerencie contratos e documentação legal</p>
                </div>
              </div>
              <div className="flex gap-2">
                <input type="file" ref={fileInputRef} accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
                <Button variant="outline" className="gap-2" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
                  {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Importar
                </Button>
                <Button variant="outline" className="gap-2" onClick={handleExport} disabled={contracts.length === 0}>
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
                <Button variant="outline" className="gap-2" onClick={() => navigate('/contratos/templates')}>
                  <LayoutTemplate className="h-4 w-4" />
                  Templates
                </Button>
                <Button className="gap-2" onClick={handleNewContract}>
                  <Plus className="h-4 w-4" />
                  Novo Contrato
                </Button>
              </div>
            </div>

            {/* KPI Cards */}
            {(() => {
              const totalContracts = contracts.length;
              const activeCount = activeContracts.length;
              const expiringCount = expiringSoon.length;
              const currentYear = new Date().getFullYear();
              const signedThisYear = contracts.filter((c: any) => {
                const createdAt = new Date(c.created_at);
                return createdAt.getFullYear() === currentYear && c.status === 'assinado';
              }).length;
              const totalValue = activeContracts.reduce((sum: number, c: any) => sum + Number(c.fixed_value || c.advance_amount || c.value || 0), 0);

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <DashboardCard title="Contratos Vigentes" value={activeCount} description="ativos no momento" icon={FileText} trend={{ value: totalContracts, isPositive: true }} />
                  <DashboardCard title="Vencendo em 30 dias" value={expiringCount} description="precisam renovação" icon={AlertTriangle} trend={{ value: expiringCount > 0 ? -expiringCount : 0, isPositive: expiringCount === 0 }} />
                  <DashboardCard title="Assinados este ano" value={signedThisYear} description="contratos assinados" icon={CheckCircle} trend={{ value: signedThisYear, isPositive: true }} />
                  <DashboardCard title="Valor Total" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)} description="contratos vigentes" icon={Calendar} trend={{ value: 0, isPositive: true }} />
                </div>
              );
            })()}


            {/* Search and Filters */}
            <SearchFilter searchPlaceholder="Buscar contratos por artista, tipo ou valor..." filters={filterOptions} onSearch={handleSearch} onFilter={handleFilter} onClear={handleClear} />

            {/* Contracts List */}
            <Card className="flex-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Lista de Contratos</CardTitle>
                    <CardDescription>Acompanhe todos os contratos e seus vencimentos</CardDescription>
                  </div>
                  {selectedItems.length > 0 && (
                    <Button variant="destructive" size="sm" className="gap-2" onClick={() => setIsBulkDeleteModalOpen(true)}>
                      <Trash2 className="h-4 w-4" />
                      Excluir Selecionados ({selectedItems.length})
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-8"><p className="text-muted-foreground">Carregando contratos...</p></div>
                  ) : filteredContracts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum contrato cadastrado</h3>
                      <p className="text-muted-foreground mb-4">Comece criando seu primeiro contrato</p>
                      <Button onClick={handleNewContract} className="gap-2"><Plus className="h-4 w-4" />Criar Primeiro Contrato</Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                        <Checkbox checked={selectedItems.length === filteredContracts.length && filteredContracts.length > 0} onCheckedChange={(checked) => handleSelectAll(!!checked)} />
                        <span className="text-sm font-medium text-muted-foreground">
                          {selectedItems.length > 0 ? `${selectedItems.length} de ${filteredContracts.length} selecionados` : "Selecionar todos"}
                        </span>
                      </div>
                      {filteredContracts.map((contract) => {
                        const daysToExpire = getDaysToExpire((contract as any).end_date || contract.effective_to);
                        const totalValue = (contract as any).fixed_value || contract.advance_amount || 0;
                        
                        return (
                          <div key={contract.id} className="flex flex-col sm:flex-row sm:items-start gap-3">
                            <Checkbox 
                              checked={selectedItems.includes(contract.id)} 
                              onCheckedChange={(checked) => handleSelectItem(contract.id, !!checked)} 
                              className="mt-4 sm:mt-6"
                            />
                            <div className="flex-1 flex flex-col lg:flex-row lg:items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors gap-4">
                              <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                                </div>
                                <div className="space-y-1 min-w-0">
                                  <h3 className="font-medium text-foreground text-sm sm:text-base truncate">{(contract as any).title || contract.contract_type}</h3>
                                  {(contract as any).artists && <p className="text-xs sm:text-sm text-muted-foreground truncate">Artista: {(contract as any).artists.stage_name || (contract as any).artists.name}</p>}
                                  <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                                    {(contract as any).service_type && <Badge variant="secondary" className="text-xs">{serviceTypeLabels[(contract as any).service_type as keyof typeof serviceTypeLabels]}</Badge>}
                                    <Badge variant={(contract as any).status === "assinado" ? "default" : (contract as any).status === "expirado" || (contract as any).status === "rescindido" ? "destructive" : (contract as any).status === "pendente" ? "secondary" : "outline"} className="text-xs">
                                      {statusLabels[(contract as any).status as keyof typeof statusLabels] || 'Ativo'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Info Grid */}
                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:items-center gap-2 lg:gap-4 text-xs sm:text-sm pl-12 lg:pl-0">
                                {((contract as any).start_date || (contract as any).end_date || contract.effective_from || contract.effective_to) && (
                                  <div className="text-left lg:text-center">
                                    <div className="text-muted-foreground text-xs">Período</div>
                                    <div className="font-medium text-xs sm:text-sm">{formatDateBR((contract as any).start_date || contract.effective_from)} - {formatDateBR((contract as any).end_date || contract.effective_to)}</div>
                                  </div>
                                )}
                                {totalValue > 0 && (
                                  <div className="text-left lg:text-center">
                                    <div className="text-muted-foreground text-xs">Valor</div>
                                    <div className="font-medium text-foreground text-xs sm:text-sm">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}</div>
                                  </div>
                                )}
                                {daysToExpire !== null && (
                                  <div className="text-left lg:text-center">
                                    <div className="text-muted-foreground text-xs">Vencimento</div>
                                    <div className={`font-medium text-xs sm:text-sm ${daysToExpire < 0 ? "text-destructive" : daysToExpire < 30 ? "text-orange-600" : "text-foreground"}`}>
                                      {daysToExpire < 0 ? "Vencido" : daysToExpire === 0 ? "Hoje" : `${daysToExpire} dias`}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex flex-wrap gap-2 pl-12 lg:pl-0 lg:ml-auto">
                                <Button variant="outline" size="sm" className="text-xs" onClick={() => handleViewContract(contract)}>Ver</Button>
                                <Button variant="outline" size="sm" className="text-xs" onClick={() => handleEditContract(contract)}>Editar</Button>
                                <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => handleGenerateDocument(contract)}>
                                  <FileSignature className="h-3 w-3" />
                                  <span className="hidden sm:inline">Gerar</span>
                                </Button>
                                <Button variant="outline" size="sm" className="text-xs" onClick={() => handleDeleteContract(contract)}>Excluir</Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>

      <ContractViewModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} contract={contractToView} />
      <ContractModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} contract={selectedContract} />
      <GenerateContractModal isOpen={isGenerateModalOpen} onClose={() => setIsGenerateModalOpen(false)} contract={contractToGenerate} />
      <DeleteConfirmationModal open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen} onConfirm={confirmDelete} title="Excluir Contrato" description={`Tem certeza que deseja excluir o contrato "${(contractToDelete as any)?.title || contractToDelete?.contract_type}"? Esta ação não pode ser desfeita.`} />
      <DeleteConfirmationModal open={isBulkDeleteModalOpen} onOpenChange={setIsBulkDeleteModalOpen} onConfirm={confirmBulkDelete} title="Excluir Contratos" description={`Tem certeza que deseja excluir ${selectedItems.length} contratos? Esta ação não pode ser desfeita.`} isLoading={isDeletingBulk} />
    </SidebarProvider>
  );
};

export default Contratos;
