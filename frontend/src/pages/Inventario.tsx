import { useState, useEffect, useRef, useMemo } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchFilter } from "@/components/filters/SearchFilter";
import { InventoryModal } from "@/components/modals/InventoryModal";
import { InventoryViewModal } from "@/components/modals/InventoryViewModal";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import { Package, Plus, Headphones, Mic, Speaker, Loader2, Upload, Download, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useInventory, useDeleteInventory, useCreateInventory } from "@/hooks/useInventory";
import { useDataExport } from "@/hooks/useDataExport";
import * as XLSX from "xlsx";
import { Checkbox } from "@/components/ui/checkbox";

interface Equipment {
  id: string;
  name: string;
  category: string;
  status: string;
  quantity: number;
  location: string;
  unit_value: number | null;
  sector: string | null;
  responsible: string | null;
  purchase_location: string | null;
  invoice_number: string | null;
  entry_date: string | null;
  observations: string | null;
}

const sectorLabels: Record<string, string> = {
  administrativo_corporativo: "Administrativo / Corporativo",
  administrativo: "Administrativo / Corporativo",
  financeiro: "Financeiro",
  juridico: "Jurídico",
  artistico_ar: "Artístico (A&R)",
  artistico: "Artístico (A&R)",
  producao_musical: "Produção Musical",
  producao_audiovisual: "Produção Audiovisual",
  editora_musical: "Editora Musical (Publishing)",
  editora: "Editora Musical (Publishing)",
  distribuicao_digital: "Distribuição Digital",
  distribuicao: "Distribuição Digital",
  marketing: "Marketing",
  comunicacao_imprensa: "Comunicação e Imprensa (PR)",
  comunicacao: "Comunicação e Imprensa (PR)",
  eventos_shows: "Eventos e Shows",
  eventos: "Eventos e Shows",
  shows: "Eventos e Shows",
  Shows: "Eventos e Shows",
  comercial_vendas: "Comercial / Vendas",
  comercial: "Comercial / Vendas",
  recursos_humanos: "Recursos Humanos (RH)",
  rh: "Recursos Humanos (RH)",
  tecnologia_ti: "Tecnologia / TI",
  ti: "Tecnologia / TI",
  arquivo_documentacao: "Arquivo e Documentação",
  arquivo: "Arquivo e Documentação",
  logistica_operacoes: "Logística e Operações",
  logistica: "Logística e Operações",
};

const Inventario = () => {
  const { toast } = useToast();
  const { data: inventoryData, isLoading } = useInventory();
  const deleteInventory = useDeleteInventory();
  const createInventory = useCreateInventory();
  const { exportToExcel, parseExcelFile } = useDataExport();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  
  // Filter persistence state
  const [currentSearchTerm, setCurrentSearchTerm] = useState("");
  const [currentFilters, setCurrentFilters] = useState<Record<string, string>>({});

  const allEquipment: Equipment[] = (inventoryData || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    category: item.category || 'Outros',
    status: item.status || 'Disponível',
    quantity: item.quantity || 1,
    location: item.location || '-',
    unit_value: item.unit_value,
    sector: item.sector,
    responsible: item.responsible,
    purchase_location: item.purchase_location,
    invoice_number: item.invoice_number,
    entry_date: item.entry_date,
    observations: item.observations,
  }));

  // Apply filters when data changes (persistence)
  useEffect(() => {
    filterEquipment(currentSearchTerm, currentFilters);
  }, [inventoryData]);

  // Extrair locais únicos do inventário e ordenar alfabeticamente
  const uniqueLocations = useMemo(() => {
    const locations = new Set<string>();
    allEquipment.forEach((item: any) => {
      if (item.location) locations.add(item.location);
    });
    // Adicionar locais padrão se não existirem
    ['Dj Stay', 'Escritório', 'Estoque', 'Estúdio 1', 'Estúdio 2'].forEach(loc => locations.add(loc));
    return Array.from(locations).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [allEquipment]);

  // Categorias ordenadas alfabeticamente
  const categoryOptions = [
    "Áudio",
    "Computador",
    "Equipamento",
    "Escritório",
    "Estrutura",
    "Iluminação",
    "Mobília",
    "Software",
    "Vídeo",
  ];

  // Status ordenados alfabeticamente
  const statusOptions = [
    "Danificado",
    "Disponível",
    "Em Uso",
    "Manutenção",
  ];

  const filterOptions = [
    {
      key: "category",
      label: "Categoria",
      options: categoryOptions
    },
    {
      key: "status",
      label: "Status",
      options: statusOptions
    },
    {
      key: "location",
      label: "Local",
      options: uniqueLocations
    }
  ];

  const handleSearch = (searchTerm: string) => {
    setCurrentSearchTerm(searchTerm);
    filterEquipment(searchTerm, currentFilters);
  };

  const handleFilter = (filters: Record<string, string>) => {
    setCurrentFilters(filters);
    filterEquipment(currentSearchTerm, filters);
  };

  const handleClear = () => {
    setCurrentSearchTerm("");
    setCurrentFilters({});
    setFilteredEquipment(allEquipment);
  };

  const filterEquipment = (searchTerm: string, filters: Record<string, string>) => {
    let filtered = allEquipment;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(item => {
          if (key === "category") return item.category === value;
          if (key === "status") return item.status === value;
          if (key === "location") return item.location === value;
          return true;
        });
      }
    });

    setFilteredEquipment(filtered);
  };

  const handleView = (item: Equipment) => {
    setSelectedEquipment(item);
    setIsViewModalOpen(true);
  };

  const handleEdit = (item: Equipment) => {
    setSelectedEquipment(item);
    setIsEditModalOpen(true);
  };

  const handleDelete = (item: Equipment) => {
    setSelectedEquipment(item);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedEquipment) {
      await deleteInventory.mutateAsync(selectedEquipment.id);
      setIsDeleteModalOpen(false);
      setSelectedEquipment(null);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredEquipment.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  const confirmBulkDelete = async () => {
    setIsDeletingBulk(true);
    try {
      for (const id of selectedItems) {
        await deleteInventory.mutateAsync(id);
      }
      toast({
        title: "Itens excluídos",
        description: `${selectedItems.length} itens foram excluídos com sucesso.`,
      });
      setSelectedItems([]);
      setIsBulkDeleteModalOpen(false);
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir alguns itens.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingBulk(false);
    }
  };

  // Convert Excel serial date to ISO date string
  const excelDateToISO = (excelDate: any): string | undefined => {
    if (!excelDate) return undefined;
    
    // If it's already a string date, try to parse it
    if (typeof excelDate === 'string') {
      // Check if it's in dd/mm/yyyy format
      const ddmmyyyyMatch = excelDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (ddmmyyyyMatch) {
        const [, day, month, year] = ddmmyyyyMatch;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      // Check if it's already in yyyy-mm-dd format
      if (/^\d{4}-\d{2}-\d{2}$/.test(excelDate)) {
        return excelDate;
      }
      return undefined;
    }
    
    // If it's a number (Excel serial date)
    if (typeof excelDate === 'number') {
      // Excel dates are days since January 1, 1900 (with a bug for 1900 leap year)
      const excelEpoch = new Date(1899, 11, 30); // December 30, 1899
      const date = new Date(excelEpoch.getTime() + excelDate * 24 * 60 * 60 * 1000);
      return date.toISOString().split('T')[0];
    }
    
    return undefined;
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log("Dados importados do Excel:", jsonData);
      console.log("Número de linhas:", jsonData.length);
      if (jsonData.length > 0) {
        console.log("Primeira linha:", jsonData[0]);
        console.log("Colunas disponíveis:", Object.keys(jsonData[0] as object));
      }

      let importedCount = 0;
      for (const row of jsonData as any[]) {
        // Parse currency values (remove R$, dots and convert comma to dot)
        const parseValue = (val: any): number | undefined => {
          if (!val) return undefined;
          if (typeof val === 'number') return val;
          if (typeof val === 'string') {
            const cleaned = val.replace(/[R$\s.]/g, '').replace(',', '.');
            const num = parseFloat(cleaned);
            return isNaN(num) ? undefined : num;
          }
          return undefined;
        };

        const inventoryItem = {
          name: row.item || row.Item || row.nome || row.Nome || row.name || row.Name || "",
          category: row.categoria || row.Categoria || row.category || row.Category || "Outros",
          status: row.status || row.Status || "Disponível",
          quantity: Number(row.quantidade || row.Quantidade || row.quantity || row.Quantity || 1),
          location: row.localizacao || row.Localizacao || row["Localização"] || row.local || row.Local || row.location || row.Location || "",
          unit_value: parseValue(row.valor_unitario || row["Valor Unitário"] || row.valor || row.Valor || row.unit_value),
          sector: row.setor || row.Setor || row.sector || row.Sector || undefined,
          responsible: row.responsavel || row["Responsável"] || row.responsible || row.Responsible || undefined,
          purchase_location: row.local_compra || row["Local de Compra"] || row.purchase_location || undefined,
          invoice_number: row.nota_fiscal || row["Nota Fiscal"] || row["Número da Nota"] || row.invoice_number || row.NF || undefined,
          entry_date: excelDateToISO(row.data_entrada || row["Data de Entrada"] || row.entry_date),
          observations: row.observacoes || row["Observações"] || row.observations || row.Observations || undefined,
        };

        if (inventoryItem.name) {
          await createInventory.mutateAsync(inventoryItem);
          importedCount++;
        }
      }

      toast({
        title: "Importação concluída",
        description: `${importedCount} itens importados com sucesso.`,
      });
    } catch (error) {
      console.error("Erro ao importar:", error);
      toast({
        title: "Erro na importação",
        description: "Não foi possível importar o arquivo. Verifique o formato.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleExportExcel = () => {
    exportToExcel(allEquipment, "inventario", "Inventário", "inventory");
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return 'R$ 0,00';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const totalValue = allEquipment.reduce((sum, item) => sum + ((item.unit_value || 0) * item.quantity), 0);

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
                  <h1 className="text-3xl font-bold text-foreground">Inventário</h1>
                  <p className="text-muted-foreground">
                    Controle de equipamentos e patrimônio
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx,.xls"
                  onChange={handleImportExcel}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  className="gap-2" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                >
                  {isImporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Importar Excel
                </Button>
                <Button 
                  variant="outline" 
                  className="gap-2" 
                  onClick={handleExportExcel}
                  disabled={allEquipment.length === 0}
                >
                  <Download className="h-4 w-4" />
                  Exportar Excel
                </Button>
                <Button className="gap-2" onClick={() => setIsInventoryModalOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Novo Item
                </Button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardCard
                title="Total de Itens"
                value={allEquipment.length}
                description="equipamentos cadastrados"
                icon={Package}
                trend={{ value: 0, isPositive: true }}
              />
              <DashboardCard
                title="Valor do Inventário"
                value={formatCurrency(totalValue)}
                description="patrimônio total"
                icon={Package}
                trend={{ value: 0, isPositive: true }}
              />
              <DashboardCard
                title="Em Manutenção"
                value={allEquipment.filter(e => e.status === "Manutenção").length}
                description="equipamentos"
                icon={Package}
                trend={{ value: 0, isPositive: true }}
              />
              <DashboardCard
                title="Disponíveis"
                value={allEquipment.filter(e => e.status === "Disponível").length}
                description="prontos para uso"
                icon={Package}
                trend={{ value: 0, isPositive: true }}
              />
            </div>

            {/* Search and Filters */}
            <SearchFilter
              searchPlaceholder="Buscar equipamentos por nome, categoria ou local..."
              filters={filterOptions}
              onSearch={handleSearch}
              onFilter={handleFilter}
              onClear={handleClear}
            />

            {/* Equipment List */}
            <Card className="flex-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Lista de Equipamentos</CardTitle>
                    <CardDescription>
                      Inventário completo de equipamentos e instrumentos
                    </CardDescription>
                  </div>
                  {selectedItems.length > 0 && (
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => setIsBulkDeleteModalOpen(true)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir Selecionados ({selectedItems.length})
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredEquipment.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Package className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum equipamento cadastrado</h3>
                    <p className="text-muted-foreground mb-4">Comece adicionando seu primeiro item ao inventário</p>
                    <Button onClick={() => setIsInventoryModalOpen(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Adicionar Primeiro Item
                    </Button>
                  </div>
                ) : (
                <div className="space-y-4">
                  {/* Select All Header */}
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                    <Checkbox
                      checked={selectedItems.length === filteredEquipment.length && filteredEquipment.length > 0}
                      onCheckedChange={(checked) => handleSelectAll(!!checked)}
                    />
                    <span className="text-sm font-medium text-muted-foreground">
                      {selectedItems.length > 0 
                        ? `${selectedItems.length} de ${filteredEquipment.length} selecionados`
                        : "Selecionar todos"
                      }
                    </span>
                  </div>

                  {filteredEquipment.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors ${
                        selectedItems.includes(item.id) ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
                        />
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          {item.category === "Microfone" ? (
                            <Mic className="h-6 w-6 text-primary" />
                          ) : item.category === "Fone" ? (
                            <Headphones className="h-6 w-6 text-primary" />
                          ) : (
                            <Speaker className="h-6 w-6 text-primary" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-medium text-foreground">{item.name}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{item.category}</Badge>
                            <Badge 
                              variant={
                                item.status === "Disponível" ? "success" :
                                item.status === "Em Uso" ? "info" : "warning"
                              }
                            >
                              {item.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center min-w-[60px]">
                          <div className="text-muted-foreground text-xs">Qtd</div>
                          <div className="font-medium text-foreground">{item.quantity} un</div>
                        </div>
                        <div className="text-center min-w-[80px]">
                          <div className="text-muted-foreground text-xs">Local</div>
                          <div className="font-medium truncate">{item.location}</div>
                        </div>
                        <div className="text-center min-w-[90px]">
                          <div className="text-muted-foreground text-xs">Valor Unit.</div>
                          <div className="font-medium text-foreground">{formatCurrency(item.unit_value)}</div>
                        </div>
                        <div className="text-center min-w-[90px]">
                          <div className="text-muted-foreground text-xs">Valor Total</div>
                          <div className="font-medium text-foreground">{formatCurrency((item.unit_value || 0) * item.quantity)}</div>
                        </div>
                        {item.sector && (
                          <div className="text-center min-w-[80px]">
                            <div className="text-muted-foreground text-xs">Setor</div>
                            <div className="font-medium truncate">{sectorLabels[item.sector] || item.sector}</div>
                          </div>
                        )}
                        <div className="text-center min-w-[80px]">
                          <div className="text-muted-foreground text-xs">Responsável</div>
                          <div className="font-medium truncate">{item.responsible || '-'}</div>
                        </div>
                        {item.invoice_number && (
                          <div className="text-center min-w-[80px]">
                            <div className="text-muted-foreground text-xs">NF</div>
                            <div className="font-medium truncate">{item.invoice_number}</div>
                          </div>
                        )}
                        <div className="flex items-center gap-2 ml-auto">
                          <Button variant="outline" size="sm" onClick={() => handleView(item)}>
                            Ver
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                            Editar
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(item)}>
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

            {/* Modal Novo Item */}
            <InventoryModal 
              isOpen={isInventoryModalOpen} 
              onClose={() => setIsInventoryModalOpen(false)} 
            />

            {/* Modal Visualizar */}
            <InventoryViewModal
              isOpen={isViewModalOpen}
              onClose={() => {
                setIsViewModalOpen(false);
                setSelectedEquipment(null);
              }}
              equipment={selectedEquipment}
            />

            {/* Modal Editar */}
            <InventoryModal 
              isOpen={isEditModalOpen} 
              onClose={() => {
                setIsEditModalOpen(false);
                setSelectedEquipment(null);
              }}
              equipment={selectedEquipment}
              isEditMode={true}
            />

            {/* Modal Excluir */}
            <DeleteConfirmationModal
              open={isDeleteModalOpen}
              onOpenChange={(open) => {
                setIsDeleteModalOpen(open);
                if (!open) setSelectedEquipment(null);
              }}
              onConfirm={confirmDelete}
              title="Excluir Equipamento"
              description={`Tem certeza que deseja excluir "${selectedEquipment?.name}"? Esta ação não pode ser desfeita.`}
            />

            {/* Modal Excluir em Massa */}
            <DeleteConfirmationModal
              open={isBulkDeleteModalOpen}
              onOpenChange={(open) => {
                setIsBulkDeleteModalOpen(open);
              }}
              onConfirm={confirmBulkDelete}
              title="Excluir Itens Selecionados"
              description={`Tem certeza que deseja excluir ${selectedItems.length} itens selecionados? Esta ação não pode ser desfeita.`}
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Inventario;