import { useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchFilter } from "@/components/filters/SearchFilter";
import { DollarSign, Plus, TrendingUp, TrendingDown, CreditCard, Building2 } from "lucide-react";
import { FinancialTransactionModal } from "@/components/modals/FinancialTransactionModal";
import { FinancialViewModal } from "@/components/modals/FinancialViewModal";
import { BankIntegrationModal } from "@/components/modals/BankIntegrationModal";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import { FinancialTransaction } from "@/types/database";
import { formatDateBR } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { 
  useFinancialTransactions, 
  useCreateFinancialTransaction, 
  useUpdateFinancialTransaction,
  useDeleteFinancialTransaction 
} from "@/hooks/useFinancial";

const Financeiro = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<FinancialTransaction | undefined>();
  const [transactionToView, setTransactionToView] = useState<FinancialTransaction | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<FinancialTransaction | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  
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
        status: data.status,
        payment_method: data.payment_method || null,
        artist_id: data.client_type === 'artista' ? data.client_id : null,
        crm_contact_id: data.client_type === 'empresa' ? data.crm_contact_id : null,
        contract_id: data.contract_id || null,
        attachment_url: data.attachment_url || null,
        responsible_by: data.responsible_by || null,
        authorized_by: data.authorized_by || null,
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

  // Categories for filtering
  const receitasCategories = ['venda_musicas', 'streaming', 'shows', 'licenciamento', 'merchandising', 'publicidade', 'producao', 'distribuicao', 'gestao'];
  const despesasCategories = ['produtores', 'caches', 'marketing', 'equipe', 'infraestrutura', 'registros', 'juridicos', 'salarios', 'aluguel', 'manutencao', 'viagens', 'licencas', 'contabilidade', 'estudio', 'equipamentos', 'servicos'];
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
  };

  // Filter transactions based on search and filters
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = !searchTerm || 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilters = Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      if (key === 'transaction_type') return transaction.transaction_type === value;
      if (key === 'status') return transaction.status === value;
      if (key === 'category') return transaction.category === value;
      return true;
    });

    return matchesSearch && matchesFilters;
  });

  // Calculate totals
  const receitas = transactions.filter(t => t.transaction_type === 'receitas' && t.status === 'pago')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const despesas = transactions.filter(t => t.transaction_type === 'despesas' && t.status === 'pago')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const lucroLiquido = receitas - despesas;
  const contasAReceber = transactions.filter(t => t.transaction_type === 'receitas' && t.status === 'pendente')
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
          <div className="w-full h-full px-4 py-4 space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-foreground">Financeiro</h1>
                <p className="text-muted-foreground">
                  Controle financeiro e fluxo de caixa
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="gap-2" 
                  onClick={() => setIsBankModalOpen(true)}
                >
                  <Building2 className="h-4 w-4" />
                  Integração Bancária
                </Button>
                <Button className="gap-2" onClick={handleNewTransaction}>
                  <Plus className="h-4 w-4" />
                  Nova Transação
                </Button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                description={`margem de ${receitas > 0 ? ((lucroLiquido / receitas) * 100).toFixed(1) : 0}%`}
                icon={TrendingUp}
                trend={{ value: 0, isPositive: true }}
              />
              <DashboardCard
                title="Contas a Receber"
                value={new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(contasAReceber)}
                description="pendentes"
                icon={TrendingDown}
                trend={{ value: 0, isPositive: true }}
              />
            </div>

            {/* Search and Filters */}
            <SearchFilter
              searchPlaceholder="Buscar transações por descrição, categoria ou subcategoria..."
              filters={filterOptions}
              onSearch={handleSearch}
              onFilter={handleFilter}
              onClear={handleClear}
            />

            {/* Transactions List */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Transações</CardTitle>
                <CardDescription>
                  Histórico de movimentações financeiras
                </CardDescription>
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
                    filteredTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            transaction.transaction_type === "entrada" ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20"
                          }`}>
                            {transaction.transaction_type === "entrada" ? (
                              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                            ) : (
                              <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-medium text-foreground">{transaction.description}</h3>
                            <div className="flex items-center gap-2">
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
                              transaction.transaction_type === "entrada" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                            }`}>
                              {transaction.transaction_type === "entrada" ? "+" : "-"}
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
                    ))
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
    </SidebarProvider>
  );
};

export default Financeiro;