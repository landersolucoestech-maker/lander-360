import { useState, useRef, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchFilter } from "@/components/filters/SearchFilter";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DollarSign, Plus, TrendingUp, TrendingDown, CreditCard, Building2, CalendarIcon, X, Upload, Download, FileSpreadsheet, FileText, Trash2, Settings2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { FinancialTransactionModal } from "@/components/modals/FinancialTransactionModal";
import { FinancialViewModal } from "@/components/modals/FinancialViewModal";
import { BankIntegrationModal } from "@/components/modals/BankIntegrationModal";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import { FinancialTransaction } from "@/types/database";
import { formatDateBR, cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { parseOFX, exportToCSV, exportToOFX, downloadFile } from "@/lib/ofx-parser";
import { categorizeByRules } from "@/lib/categorization-rules";
import { supabase } from "@/integrations/supabase/client";
import { 
  useFinancialTransactions, 
  useCreateFinancialTransaction, 
  useUpdateFinancialTransaction,
  useDeleteFinancialTransaction 
} from "@/hooks/useFinancial";
import { useArtistFilter } from "@/hooks/useLinkedArtist";


const Financeiro = () => {
  // Filtro de artista
  const { shouldFilter, artistId, isArtistUser } = useArtistFilter();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<FinancialTransaction | undefined>();
  const [transactionToView, setTransactionToView] = useState<FinancialTransaction | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<FinancialTransaction | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();

  // Use real data from database
  const { data: transactions = [], isLoading } = useFinancialTransactions();
  const createTransaction = useCreateFinancialTransaction();
  const updateTransaction = useUpdateFinancialTransaction();
  const deleteTransaction = useDeleteFinancialTransaction();

  const handleNewTransaction = () => {
    setSelectedTransaction(undefined);
    setIsModalOpen(true);
  };

  const handleEditTransaction = (transaction: FinancialTransaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleViewTransaction = (transaction: FinancialTransaction) => {
    setTransactionToView(transaction);
    setIsViewModalOpen(true);
  };

  const handleDeleteTransaction = (transaction: FinancialTransaction) => {
    setTransactionToDelete(transaction);
    setIsDeleteModalOpen(true);
  };

  // Helper function to add interval to date
  const addIntervalToDate = (date: Date, interval: string, multiplier: number): Date => {
    const result = new Date(date);
    switch (interval) {
      case 'semanal':
        result.setDate(result.getDate() + (7 * multiplier));
        break;
      case 'quinzenal':
        result.setDate(result.getDate() + (15 * multiplier));
        break;
      case 'mensal':
        result.setMonth(result.getMonth() + multiplier);
        break;
      case 'anual':
        result.setFullYear(result.getFullYear() + multiplier);
        break;
    }
    return result;
  };

  const handleSubmitTransaction = async (data: any) => {
    try {
      const baseTransactionData = {
        description: data.description,
        type: data.transaction_type,
        transaction_type: data.transaction_type,
        category: data.category,
        subcategory: data.subcategory || null,
        status: data.status,
        payment_method: data.payment_method || null,
        payment_type: data.payment_type || null,
        artist_id: data.client_type === 'artista' ? data.client_id : null,
        crm_contact_id: data.client_type === 'empresa' ? data.crm_contact_id : null,
        contract_id: data.primary_link_type === 'contrato' ? data.contract_id : null,
        project_id: data.primary_link_type === 'projeto' ? data.project_id : null,
        event_id: data.primary_link_type === 'show' ? data.event_id : null,
        attachment_url: data.attachment_url || null,
        observations: data.observations || null,
      };

      if (selectedTransaction) {
        // Editing existing - simple update
        const transactionData = {
          ...baseTransactionData,
          amount: data.amount,
          date: data.transaction_date?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
          transaction_date: data.transaction_date?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        };
        await updateTransaction.mutateAsync({ 
          id: selectedTransaction.id, 
          data: transactionData 
        });
      } else {
        // Creating new - check payment type
        const paymentType = data.payment_type;

        if (paymentType === 'parcelado' && data.installment_count && data.installment_count >= 2) {
          // Generate multiple installment transactions
          const installmentCount = data.installment_count;
          const installmentAmount = data.amount / installmentCount;
          const interval = data.installment_interval || 'mensal';
          const startDate = data.first_installment_date || data.transaction_date || new Date();

          const installmentPromises = [];
          for (let i = 0; i < installmentCount; i++) {
            const installmentDate = addIntervalToDate(new Date(startDate), interval, i);
            const installmentData = {
              ...baseTransactionData,
              description: `${data.description} (Parcela ${i + 1}/${installmentCount})`,
              amount: installmentAmount,
              date: installmentDate.toISOString().split('T')[0],
              transaction_date: installmentDate.toISOString().split('T')[0],
              status: 'pendente' as const,
            };
            installmentPromises.push(createTransaction.mutateAsync(installmentData));
          }
          await Promise.all(installmentPromises);
          toast({
            title: 'Sucesso',
            description: `${installmentCount} parcelas criadas com sucesso.`,
          });
        } else if (paymentType === 'recorrente' && data.recurring_frequency) {
          // Generate recurring transactions (generate next 12 occurrences or until end date)
          const frequency = data.recurring_frequency;
          const startDate = data.recurring_start_date || data.transaction_date || new Date();
          const endDate = data.recurring_end_date;
          const maxOccurrences = 12; // Generate up to 12 by default

          const recurringPromises = [];
          let currentDate = new Date(startDate);
          let count = 0;

          while (count < maxOccurrences) {
            if (endDate && currentDate > new Date(endDate)) break;

            const recurringData = {
              ...baseTransactionData,
              description: `${data.description} (Recorrência ${count + 1})`,
              amount: data.amount,
              date: currentDate.toISOString().split('T')[0],
              transaction_date: currentDate.toISOString().split('T')[0],
              status: 'pendente' as const,
            };
            recurringPromises.push(createTransaction.mutateAsync(recurringData));
            
            currentDate = addIntervalToDate(currentDate, frequency, 1);
            count++;
          }

          await Promise.all(recurringPromises);
          toast({
            title: 'Sucesso',
            description: `${count} lançamentos recorrentes criados.`,
          });
        } else {
          // À vista or no payment type - single transaction
          const transactionData = {
            ...baseTransactionData,
            amount: data.amount,
            date: data.transaction_date?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
            transaction_date: data.transaction_date?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
          };
          await createTransaction.mutateAsync(transactionData);
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const confirmDelete = async () => {
    if (transactionToDelete) {
      try {
        await deleteTransaction.mutateAsync(transactionToDelete.id);
        setIsDeleteModalOpen(false);
        setTransactionToDelete(null);
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  // Selection functions
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredTransactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTransactions.map(t => t.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const confirmBulkDelete = async () => {
    try {
      const promises = Array.from(selectedIds).map(id => 
        deleteTransaction.mutateAsync(id)
      );
      await Promise.all(promises);
      toast({
        title: 'Sucesso',
        description: `${selectedIds.size} transações excluídas com sucesso.`,
      });
      setSelectedIds(new Set());
      setIsBulkDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting transactions:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir algumas transações.',
        variant: 'destructive',
      });
    }
  };

  // Import OFX file with auto-categorization
  const handleImportOFX = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      toast({
        title: 'Processando',
        description: 'Lendo arquivo e categorizando transações...',
      });

      const content = await file.text();
      const ofxData = parseOFX(content);
      
      if (ofxData.transactions.length === 0) {
        toast({
          title: 'Atenção',
          description: 'Nenhuma transação encontrada no arquivo OFX.',
          variant: 'destructive',
        });
        return;
      }

      // Step 1: Apply manual rules first
      const categorizedTransactions = ofxData.transactions.map(t => {
        const ruleResult = categorizeByRules(t.description);
        return {
          ...t,
          category: ruleResult?.category || null,
          categorizedType: ruleResult?.type || null,
          needsAI: !ruleResult,
        };
      });

      // Step 2: Get AI categorization for uncategorized transactions
      const uncategorized = categorizedTransactions.filter(t => t.needsAI);
      
      if (uncategorized.length > 0) {
        try {
          const { data: aiResult, error: aiError } = await supabase.functions.invoke('categorize-transaction', {
            body: { descriptions: uncategorized.map(t => t.description) }
          });

          if (!aiError && aiResult?.categorizations) {
            // Apply AI categorizations
            aiResult.categorizations.forEach((cat: { index: number; category: string; type: string }) => {
              const transaction = uncategorized[cat.index];
              if (transaction) {
                transaction.category = cat.category;
                transaction.categorizedType = cat.type as 'receitas' | 'despesas' | 'investimentos';
              }
            });
          }
        } catch (aiError) {
          console.warn('AI categorization failed, using defaults:', aiError);
        }
      }

      // Step 3: Create transactions with categorizations
      const promises = categorizedTransactions.map(t => {
        const finalType = t.categorizedType || (t.type === 'credit' ? 'receitas' : 'despesas');
        const transactionData = {
          description: t.description,
          type: finalType,
          transaction_type: finalType,
          amount: t.amount,
          date: t.date.toISOString().split('T')[0],
          transaction_date: t.date.toISOString().split('T')[0],
          status: 'pendente' as const,
          category: t.category || 'outros',
        };
        return createTransaction.mutateAsync(transactionData);
      });

      await Promise.all(promises);
      
      const rulesCount = categorizedTransactions.filter(t => !t.needsAI).length;
      const aiCount = uncategorized.length;
      
      toast({
        title: 'Sucesso',
        description: `${ofxData.transactions.length} transações importadas. ${rulesCount} por regras, ${aiCount} por IA.`,
      });
    } catch (error) {
      console.error('Error importing OFX:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao importar arquivo OFX. Verifique o formato do arquivo.',
        variant: 'destructive',
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Export functions
  const handleExportCSV = () => {
    const csv = exportToCSV(filteredTransactions);
    const filename = `transacoes_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    downloadFile(csv, filename, 'text/csv;charset=utf-8;');
    toast({
      title: 'Sucesso',
      description: 'Arquivo CSV exportado com sucesso.',
    });
  };

  const handleExportOFX = () => {
    const ofx = exportToOFX(filteredTransactions);
    const filename = `transacoes_${format(new Date(), 'yyyy-MM-dd')}.ofx`;
    downloadFile(ofx, filename, 'application/x-ofx');
    toast({
      title: 'Sucesso',
      description: 'Arquivo OFX exportado com sucesso.',
    });
  };

  // Categories for filtering
  const receitasCategories = ['venda_musicas', 'streaming', 'shows', 'licenciamento', 'merchandising', 'publicidade', 'producao', 'distribuicao', 'gestao'];
  const despesasCategories = ['produtores', 'caches', 'comissao', 'marketing', 'equipe', 'infraestrutura', 'registros', 'juridicos', 'salarios', 'aluguel', 'manutencao', 'viagens', 'licencas', 'contabilidade', 'estudio', 'equipamentos', 'servicos'];
  const investimentosCategories = ['producao_musical', 'marketing_digital', 'equipamentos', 'estudio', 'clipes', 'turnê', 'capacitacao'];

  const filterOptions = [
    {
      key: "transaction_type",
      label: "Tipo",
      options: ["receitas", "despesas", "investimentos"]
    },
    {
      key: "status",
      label: "Status",
      options: ["pendente", "aprovado", "pago", "cancelado"]
    },
    {
      key: "category",
      label: "Categoria",
      options: [...receitasCategories, ...despesasCategories, ...investimentosCategories, "outros"]
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
    setStartDate(undefined);
    setEndDate(undefined);
  };

  // Filter transactions based on search, filters, and date range
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = !searchTerm || 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.category && transaction.category.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilters = Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      if (key === 'transaction_type') return transaction.transaction_type === value;
      if (key === 'status') return transaction.status === value;
      if (key === 'category') return transaction.category === value;
      return true;
    });

    // Date range filter
    let matchesDateRange = true;
    if (startDate || endDate) {
      const transactionDate = transaction.transaction_date ? new Date(transaction.transaction_date) : null;
      if (transactionDate) {
        if (startDate) {
          matchesDateRange = transactionDate >= startDate;
        }
        if (endDate && matchesDateRange) {
          const endOfDay = new Date(endDate);
          endOfDay.setHours(23, 59, 59, 999);
          matchesDateRange = transactionDate <= endOfDay;
        }
      } else {
        matchesDateRange = false;
      }
    }

    return matchesSearch && matchesFilters && matchesDateRange;
  });

  // Calculate totals
  const receitas = transactions.filter(t => t.transaction_type === 'receitas' && t.status === 'pago')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const despesas = transactions.filter(t => t.transaction_type === 'despesas' && t.status === 'pago')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const lucroLiquido = receitas - despesas;
  const contasAReceber = transactions.filter(t => t.transaction_type === 'receitas' && t.status === 'pendente')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const contasAPagar = transactions.filter(t => t.transaction_type === 'despesas' && t.status === 'pendente')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const categoryLabels: Record<string, string> = {
    // Receitas - Distribuidoras
    venda_musicas: 'Venda de Músicas',
    onerpm: 'ONErpm',
    distrokid: 'DistroKid',
    '30por1': '30por1',
    believe: 'Believe',
    tunecore: 'TuneCore',
    cd_baby: 'CD Baby',
    outras_distribuidoras: 'Outras Distribuidoras',
    // Receitas - Outros
    shows: 'Shows',
    licenciamento: 'Licenciamento',
    merchandising: 'Merchandising',
    publicidade: 'Publicidade',
    producao: 'Produção',
    distribuicao: 'Distribuição',
    gestao: 'Gestão',
    // Despesas
    produtores: 'Produtores',
    caches: 'Cachês',
    marketing: 'Marketing',
    equipe: 'Equipe',
    infraestrutura: 'Infraestrutura',
    registros: 'Registros',
    juridicos: 'Jurídicos',
    salarios: 'Salários',
    aluguel: 'Aluguel',
    manutencao: 'Manutenção',
    viagens: 'Viagens',
    licencas: 'Licenças',
    contabilidade: 'Contabilidade',
    estudio: 'Estúdio',
    equipamentos: 'Equipamentos',
    servicos: 'Serviços',
    // Outros
    investimentos: 'Investimentos',
    outros: 'Outros'
  };

  const statusLabels = {
    pendente: 'Pendente',
    aprovado: 'Aprovado',
    pago: 'Pago',
    cancelado: 'Cancelado'
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="w-full h-full px-4 py-3 space-y-3">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="h-9 w-9" />
                <div className="flex flex-col gap-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Transações</h1>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Controle financeiro e fluxo de caixa
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {/* Hidden file input for OFX import */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".ofx"
                  onChange={handleImportOFX}
                  className="hidden"
                />
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-1 sm:gap-2" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">Importar OFX</span>
                </Button>
                
                <Link to="/financeiro/regras">
                  <Button variant="outline" size="sm" className="gap-1 sm:gap-2">
                    <Settings2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Regras</span>
                  </Button>
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1 sm:gap-2">
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">Exportar</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleExportCSV} className="gap-2 cursor-pointer">
                      <FileSpreadsheet className="h-4 w-4" />
                      Exportar CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportOFX} className="gap-2 cursor-pointer">
                      <FileText className="h-4 w-4" />
                      Exportar OFX
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-1 sm:gap-2" 
                  onClick={() => setIsBankModalOpen(true)}
                >
                  <Building2 className="h-4 w-4" />
                  <span className="hidden lg:inline">Integração Bancária</span>
                </Button>
                <Button size="sm" className="gap-1 sm:gap-2" onClick={handleNewTransaction}>
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Nova Transação</span>
                </Button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              <DashboardCard
                title="Receita Mensal"
                value={new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(receitas)}
                description="receitas pagas"
                icon={DollarSign}
                trend={{ value: 0, isPositive: true }}
              />
              <DashboardCard
                title="Despesas Mensais"
                value={new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(despesas)}
                description="despesas pagas"
                icon={CreditCard}
                trend={{ value: 0, isPositive: true }}
              />
              <DashboardCard
                title="Lucro Líquido"
                value={new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(lucroLiquido)}
                description={`margem de ${receitas > 0 ? Math.min(((lucroLiquido / receitas) * 100), 100).toFixed(1) : 0}%`}
                icon={TrendingUp}
                trend={{ value: 0, isPositive: true }}
              />
              <DashboardCard
                title="Contas a Receber"
                value={new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(contasAReceber)}
                description="receitas pendentes"
                icon={TrendingUp}
                trend={{ value: 0, isPositive: true }}
              />
              <DashboardCard
                title="Contas a Pagar"
                value={new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(contasAPagar)}
                description="despesas pendentes"
                icon={TrendingDown}
                trend={{ value: 0, isPositive: true }}
              />
            </div>


            {/* Search and Filters */}
            <div className="space-y-4">
              <SearchFilter
                searchPlaceholder="Buscar transações por descrição, categoria ou subcategoria..."
                filters={filterOptions}
                onSearch={handleSearch}
                onFilter={handleFilter}
                onClear={handleClear}
              />
              
              {/* Date Range Filters */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Período:</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[180px] justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Data início"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        locale={ptBR}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <span className="text-muted-foreground">até</span>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[180px] justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Data fim"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        locale={ptBR}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  
                  {(startDate || endDate) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setStartDate(undefined);
                        setEndDate(undefined);
                      }}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                {(startDate || endDate) && (
                  <Badge variant="secondary" className="text-xs">
                    {startDate && endDate 
                      ? `${format(startDate, "dd/MM/yyyy")} - ${format(endDate, "dd/MM/yyyy")}`
                      : startDate 
                        ? `A partir de ${format(startDate, "dd/MM/yyyy")}`
                        : `Até ${format(endDate!, "dd/MM/yyyy")}`
                    }
                  </Badge>
                )}
              </div>
            </div>

            {/* Transactions List */}
            <Card className="flex-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Transações</CardTitle>
                    <CardDescription>
                      Histórico de movimentações financeiras
                    </CardDescription>
                  </div>
                  {selectedIds.size > 0 && (
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => setIsBulkDeleteModalOpen(true)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir {selectedIds.size} selecionada{selectedIds.size > 1 ? 's' : ''}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Carregando transações...</p>
                    </div>
                  ) : filteredTransactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma transação cadastrada</h3>
                      <p className="text-muted-foreground mb-4">Comece registrando sua primeira transação financeira</p>
                      <Button onClick={handleNewTransaction} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Criar Primeira Transação
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* Select All Header */}
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                        <Checkbox
                          checked={selectedIds.size === filteredTransactions.length && filteredTransactions.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                        <span className="text-sm text-muted-foreground">
                          {selectedIds.size > 0 
                            ? `${selectedIds.size} de ${filteredTransactions.length} selecionada${selectedIds.size > 1 ? 's' : ''}`
                            : 'Selecionar todas'
                          }
                        </span>
                      </div>
                      
                      {filteredTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className={cn(
                          "flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors",
                          selectedIds.has(transaction.id) ? "border-primary bg-primary/5" : "border-border"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <Checkbox
                            checked={selectedIds.has(transaction.id)}
                            onCheckedChange={() => toggleSelect(transaction.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            transaction.transaction_type === "receitas" ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20"
                          }`}>
                            {transaction.transaction_type === "receitas" ? (
                              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                            ) : (
                              <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-medium text-foreground">{transaction.description}</h3>
                            <div className="flex items-center gap-2 flex-wrap">
                              {transaction.artists && (
                                <Badge variant="outline" className="text-xs">
                                  {transaction.artists.stage_name || transaction.artists.name}
                                </Badge>
                              )}
                              {transaction.crm_contacts && (
                                <Badge variant="outline" className="text-xs">
                                  {transaction.crm_contacts.name}
                                  {transaction.crm_contacts.company && ` (${transaction.crm_contacts.company})`}
                                </Badge>
                              )}
                              {transaction.category && (
                                <Badge variant="secondary">
                                  {categoryLabels[transaction.category] || transaction.category}
                                </Badge>
                              )}
                              <Badge 
                                variant={
                                  transaction.status === "pago" ? "default" : 
                                  transaction.status === "cancelado" ? "destructive" : "secondary"
                                }
                              >
                                {statusLabels[transaction.status as keyof typeof statusLabels]}
                              </Badge>
                            </div>
                            {transaction.payment_method && (
                              <p className="text-sm text-muted-foreground">
                                {transaction.payment_method}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Data</div>
                            <div className="font-medium">
                              {formatDateBR(transaction.transaction_date)}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Valor</div>
                            <div className={`font-semibold ${
                              transaction.transaction_type === "receitas" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                            }`}>
                              {transaction.transaction_type === "receitas" ? "+" : "-"}
                              {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                               }).format(transaction.amount)}
                             </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewTransaction(transaction)}
                            >
                              Ver
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditTransaction(transaction)}
                            >
                              Editar
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteTransaction(transaction)}
                            >
                              Excluir
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>

      {/* Modals */}
      <FinancialViewModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        transaction={transactionToView}
      />

      <FinancialTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={selectedTransaction}
        onSubmit={handleSubmitTransaction}
        isLoading={false}
      />

      <BankIntegrationModal
        open={isBankModalOpen}
        onOpenChange={setIsBankModalOpen}
      />

      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={confirmDelete}
        title="Excluir Transação"
        description={`Tem certeza que deseja excluir a transação "${transactionToDelete?.description}"? Esta ação não pode ser desfeita.`}
        isLoading={false}
      />

      <DeleteConfirmationModal
        open={isBulkDeleteModalOpen}
        onOpenChange={setIsBulkDeleteModalOpen}
        onConfirm={confirmBulkDelete}
        title="Excluir Transações Selecionadas"
        description={`Tem certeza que deseja excluir ${selectedIds.size} transação(ões)? Esta ação não pode ser desfeita.`}
        isLoading={false}
      />
    </SidebarProvider>
  );
};

export default Financeiro;