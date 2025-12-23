import { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchFilter } from "@/components/filters/SearchFilter";
import { InvoiceModal } from "@/components/modals/InvoiceModal";
import { Receipt, Plus, FileText, DollarSign, Calendar } from "lucide-react";


const NotaFiscal = () => {
  const allInvoices: any[] = [];

  const [filteredInvoices, setFilteredInvoices] = useState(allInvoices);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Tipos de nota fiscal ordenados alfabeticamente
  const typeOptions = [
    "Apresentação",
    "Marketing",
    "Produção",
    "Royalties",
  ];

  // Status ordenados alfabeticamente
  const statusOptions = [
    "Cancelada",
    "Emitida",
    "Paga",
    "Pendente",
  ];

  const filterOptions = [
    {
      key: "status",
      label: "Status",
      options: statusOptions
    },
    {
      key: "type",
      label: "Tipo",
      options: typeOptions
    },
    {
      key: "client",
      label: "Cliente",
      options: [] // Will be populated from database
    }
  ];

  const handleSearch = (searchTerm: string) => {
    filterInvoices(searchTerm, {});
  };

  const handleFilter = (filters: Record<string, string>) => {
    filterInvoices("", filters);
  };

  const handleClear = () => {
    setFilteredInvoices(allInvoices);
  };

  const filterInvoices = (searchTerm: string, filters: Record<string, string>) => {
    let filtered = allInvoices;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(invoice =>
        invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.amount.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(invoice => {
          if (key === "status") return invoice.status === value;
          if (key === "type") return invoice.type === value;
          if (key === "client") return invoice.client === value;
          return true;
        });
      }
    });

    setFilteredInvoices(filtered);
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
                  <h1 className="text-3xl font-bold text-foreground">Nota Fiscal</h1>
                  <p className="text-muted-foreground">
                    Gestão de notas fiscais e faturamento
                  </p>
                </div>
              </div>
              <Button className="gap-2" onClick={() => setIsInvoiceModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Nova Nota Fiscal
              </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardCard
                title="Notas Emitidas"
                value={0}
                description="este mês"
                icon={Receipt}
                trend={{ value: 0, isPositive: true }}
              />
              <DashboardCard
                title="Valor Total"
                value="R$ 0"
                description="faturamento mensal"
                icon={DollarSign}
                trend={{ value: 0, isPositive: true }}
              />
              <DashboardCard
                title="Pendentes"
                value={0}
                description="aguardando pagamento"
                icon={FileText}
                trend={{ value: 0, isPositive: false }}
              />
              <DashboardCard
                title="Vencendo Hoje"
                value={0}
                description="notas com vencimento"
                icon={Calendar}
                trend={{ value: 0, isPositive: false }}
              />
            </div>

            {/* Search and Filters */}
            <SearchFilter
              searchPlaceholder="Buscar notas fiscais por número, cliente ou descrição..."
              filters={filterOptions}
              onSearch={handleSearch}
              onFilter={handleFilter}
              onClear={handleClear}
            />

            {/* Invoices List */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Lista de Notas Fiscais</CardTitle>
                <CardDescription>
                  Todas as notas fiscais emitidas e seus status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allInvoices.length === 0 ? (
                  <div className="text-center py-12">
                    <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhuma nota fiscal cadastrada</h3>
                    <p className="text-muted-foreground mb-4">
                      Comece criando sua primeira nota fiscal
                    </p>
                    <Button onClick={() => setIsInvoiceModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeira Nota Fiscal
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredInvoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Receipt className="h-6 w-6 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-medium text-foreground">{invoice.number}</h3>
                            <div className="text-sm text-muted-foreground">{invoice.client}</div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{invoice.type}</Badge>
                              <Badge 
                                variant={
                                  invoice.status === "Paga" ? "default" :
                                  invoice.status === "Emitida" ? "secondary" : "outline"
                                }
                              >
                                {invoice.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <div className="text-muted-foreground">Descrição</div>
                            <div className="font-medium max-w-32 truncate">{invoice.description}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-muted-foreground">Emissão</div>
                            <div className="font-medium">{invoice.issueDate}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-muted-foreground">Vencimento</div>
                            <div className="font-medium">{invoice.dueDate}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-muted-foreground">Valor</div>
                            <div className="font-semibold text-foreground">{invoice.amount}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              Ver
                            </Button>
                            <Button variant="outline" size="sm">
                              Editar
                            </Button>
                            <Button variant="outline" size="sm">
                              Excluir
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <InvoiceModal 
              isOpen={isInvoiceModalOpen} 
              onClose={() => setIsInvoiceModalOpen(false)} 
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default NotaFiscal;