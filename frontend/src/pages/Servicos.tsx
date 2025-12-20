import { useState, useEffect, useRef } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, X, Download, Upload, Trash2 } from "lucide-react";
import { useServices, useCreateService, useUpdateService, useDeleteService, Service } from "@/hooks/useServices";
import { ServiceModal } from "@/components/modals/ServiceModal";
import { ServiceViewModal } from "@/components/modals/ServiceViewModal";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import { ServiceFormData } from "@/components/forms/ServiceForm";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import * as XLSX from "xlsx";

const grupoLabels: Record<string, string> = {
  agenciamento: "Agenciamento",
  producao_musical: "Produção Musical",
  producao_audiovisual: "Produção Audiovisual",
  editora: "Editora",
  design_grafico: "Design Gráfico",
  gerenciamento_redes_sociais: "Gerenciamento de Redes Sociais",
  trafego_pago: "Tráfego Pago",
  criacao_sites: "Criação de Sites",
};

const categoryLabels: Record<string, string> = {
  consultoria: "Consultoria",
  criacao_sites: "Criação de Sites",
  design_grafico: "Design Gráfico",
  distribuicao_musical: "Distribuição Musical",
  editora_musical: "Editora Musical",
  financeiro_admin: "Financeiro/Admin",
  gerenciamento_redes_sociais: "Gerenciamento de Redes Sociais",
  gestao_carreira: "Gestão de Carreira",
  marketing: "Marketing",
  parcerias: "Parcerias",
  producao_audiovisual: "Produção Audiovisual",
  producao_conteudo: "Produção de Conteúdo",
  producao_musical: "Produção Musical",
  trafego_pago: "Tráfego Pago",
};

const serviceTypeLabels: Record<string, string> = {
  avulso: "Avulso",
  mensal: "Mensal",
  pacote: "Pacote",
  pacote_1: "Pacote 1",
  pacote_2: "Pacote 2",
  pacote_3: "Pacote 3",
  pacote_4: "Pacote 4",
  pacote_5: "Pacote 5",
  pacote_6: "Pacote 6",
  pacote_7: "Pacote 7",
  pacote_essencial: "Pacote Essencial",
  pacote_iniciante: "Pacote Iniciante",
  pacote_intermediario: "Pacote Intermediário",
  pacote_intermediario_completo: "Pacote Intermediário (Completo)",
  pacote_profissional: "Pacote Profissional",
};

export default function Servicos() {
  const { data: services = [], isLoading } = useServices();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [currentSearchTerm, setCurrentSearchTerm] = useState("");
  const [currentFilters, setCurrentFilters] = useState<Record<string, string>>({});
  const [isImporting, setIsImporting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentSearchTerm || Object.values(currentFilters).some(v => v)) {
      filterServices(currentSearchTerm, currentFilters);
    } else {
      setFilteredServices(services);
    }
  }, [services]);

  const displayedServices = currentSearchTerm || Object.values(currentFilters).some(v => v) ? filteredServices : services;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value || 0);
  };

  const formatPercent = (value: number) => {
    return `${Math.min(value || 0, 100)}%`;
  };

  const handleSearch = (value: string) => {
    setCurrentSearchTerm(value);
    filterServices(value, currentFilters);
  };

  const handleGrupoChange = (value: string) => {
    const newFilters = {
      ...currentFilters,
      grupo: value === "all" ? "" : value
    };
    setCurrentFilters(newFilters);
    filterServices(currentSearchTerm, newFilters);
  };

  const handleCategoryChange = (value: string) => {
    const newFilters = {
      ...currentFilters,
      category: value === "all" ? "" : value
    };
    setCurrentFilters(newFilters);
    filterServices(currentSearchTerm, newFilters);
  };

  const handleTypeChange = (value: string) => {
    const newFilters = {
      ...currentFilters,
      service_type: value === "all" ? "" : value
    };
    setCurrentFilters(newFilters);
    filterServices(currentSearchTerm, newFilters);
  };

  const handleClear = () => {
    setCurrentSearchTerm("");
    setCurrentFilters({});
    setFilteredServices(services);
  };

  const filterServices = (searchTerm: string, filters: Record<string, string>) => {
    let filtered = services;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(service =>
        (service.description || "").toLowerCase().includes(term) ||
        (grupoLabels[service.grupo || ""] || "").toLowerCase().includes(term) ||
        (categoryLabels[service.category] || service.category).toLowerCase().includes(term)
      );
    }
    if (filters.grupo) {
      filtered = filtered.filter(service => service.grupo === filters.grupo);
    }
    if (filters.category) {
      filtered = filtered.filter(service => service.category === filters.category);
    }
    if (filters.service_type) {
      filtered = filtered.filter(service => service.service_type === filters.service_type);
    }
    setFilteredServices(filtered);
  };

  const handleCreateService = () => {
    setSelectedService(null);
    setIsModalOpen(true);
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleViewService = (service: Service) => {
    setSelectedService(service);
    setIsViewModalOpen(true);
  };

  const handleDeleteClick = (service: Service) => {
    setSelectedService(service);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (data: ServiceFormData) => {
    const serviceData = {
      ...data,
      discount_type: "percentage",
    };

    if (selectedService) {
      await updateService.mutateAsync({
        id: selectedService.id,
        ...serviceData
      });
    } else {
      await createService.mutateAsync(serviceData as any);
    }
    setIsModalOpen(false);
    setSelectedService(null);
  };

  const handleConfirmDelete = async () => {
    if (selectedService) {
      await deleteService.mutateAsync(selectedService.id);
      setIsDeleteModalOpen(false);
      setSelectedService(null);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(displayedServices.map(s => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleBulkDeleteClick = () => {
    if (selectedIds.length === 0) {
      toast.error("Selecione pelo menos um serviço para excluir");
      return;
    }
    setIsBulkDeleteModalOpen(true);
  };

  const handleConfirmBulkDelete = async () => {
    setIsDeletingBulk(true);
    try {
      for (const id of selectedIds) {
        await deleteService.mutateAsync(id);
      }
      toast.success(`${selectedIds.length} serviço(s) excluído(s) com sucesso!`);
      setSelectedIds([]);
      setIsBulkDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting services:", error);
      toast.error("Erro ao excluir serviços");
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const hasActiveFilters = currentSearchTerm || currentFilters.grupo || currentFilters.category || currentFilters.service_type;

  const handleExport = () => {
    if (services.length === 0) {
      toast.error("Nenhum serviço para exportar");
      return;
    }
    const exportData = services.map(service => ({
      "ID": service.id,
      "Grupo": grupoLabels[service.grupo || ""] || service.grupo || "",
      "Categoria": categoryLabels[service.category] || service.category,
      "Tipo": serviceTypeLabels[service.service_type] || service.service_type,
      "Descrição do Serviço": service.description || "",
      "Valor Custo": service.cost_price || 0,
      "Margem (%)": service.margin || 0,
      "Valor Venda": service.sale_price || 0,
      "Desconto (%)": service.discount_value || 0,
      "Valor Total": service.final_price || 0,
      "Observações": service.observations || "",
      "Data de Criação": service.created_at ? new Date(service.created_at).toLocaleDateString("pt-BR") : "",
      "Última Atualização": service.updated_at ? new Date(service.updated_at).toLocaleDateString("pt-BR") : ""
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Serviços");
    XLSX.writeFile(wb, "servicos.xlsx");
    toast.success("Arquivo exportado com sucesso!");
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      let importedCount = 0;
      for (const row of jsonData as any[]) {
        const grupoValue = row["Grupo"] || row["grupo"] || "";
        const grupo = Object.entries(grupoLabels).find(([_, label]) => label.toLowerCase() === grupoValue.toLowerCase())?.[0] || grupoValue.toLowerCase().replace(/ /g, "_");

        const categoryValue = row["Categoria"] || row["category"] || "";
        const category = Object.entries(categoryLabels).find(([_, label]) => label.toLowerCase() === categoryValue.toLowerCase())?.[0] || categoryValue.toLowerCase().replace(/ /g, "_");

        const typeValue = row["Tipo"] || row["service_type"] || "";
        const service_type = Object.entries(serviceTypeLabels).find(([_, label]) => label.toLowerCase() === typeValue.toLowerCase())?.[0] || typeValue.toLowerCase().replace(/ /g, "_");

        const costPrice = parseFloat(row["Valor Custo"] || row["cost_price"] || "0") || 0;
        const margin = parseFloat(row["Margem (%)"] || row["Margem"] || row["margin"] || "0") || 0;
        const salePrice = parseFloat(row["Valor Venda"] || row["sale_price"] || "0") || costPrice + (costPrice * margin / 100);
        const discountValue = parseFloat(row["Desconto (%)"] || row["Desconto"] || row["discount_value"] || "0") || 0;
        let final_price = parseFloat(row["Valor Total"] || row["final_price"] || "0") || 0;
        
        if (!final_price) {
          final_price = salePrice - (salePrice * discountValue / 100);
        }

        await createService.mutateAsync({
          grupo: grupo || "agenciamento",
          description: row["Descrição do Serviço"] || row["Descrição"] || row["description"] || "",
          category: category || "consultoria",
          service_type: service_type || "avulso",
          cost_price: costPrice,
          margin: margin,
          sale_price: salePrice,
          discount_value: discountValue,
          discount_type: "percentage",
          final_price: Math.max(0, final_price),
          observations: row["Observações"] || row["observations"] || ""
        });
        importedCount++;
      }
      toast.success(`${importedCount} serviço(s) importado(s) com sucesso!`);
    } catch (error) {
      console.error("Error importing services:", error);
      toast.error("Erro ao importar arquivo");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="w-full h-full px-4 py-3 space-y-3">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="h-9 w-9" />
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Serviços</h1>
            </div>

          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <CardTitle>Lista de Serviços</CardTitle>
                {selectedIds.length > 0 && (
                  <Button variant="destructive" size="sm" onClick={handleBulkDeleteClick}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir ({selectedIds.length})
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <input type="file" ref={fileInputRef} onChange={handleImport} accept=".xlsx,.xls" className="hidden" />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
                  <Upload className="w-4 h-4 mr-2" />
                  {isImporting ? "Importando..." : "Importar"}
                </Button>
                <Button variant="outline" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
                <Button onClick={handleCreateService}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Serviço
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-row gap-2 items-center w-full mb-4 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar por descrição..." value={currentSearchTerm} onChange={e => handleSearch(e.target.value)} className="pl-10" />
                </div>

                <Select value={currentFilters.grupo || "all"} onValueChange={handleGrupoChange}>
                  <SelectTrigger className="w-44 shrink-0">
                    <SelectValue placeholder="Grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Grupos</SelectItem>
                    {Object.entries(grupoLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={currentFilters.category || "all"} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-48 shrink-0">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas Categorias</SelectItem>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={currentFilters.service_type || "all"} onValueChange={handleTypeChange}>
                  <SelectTrigger className="w-44 shrink-0">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Tipos</SelectItem>
                    {Object.entries(serviceTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button variant="ghost" onClick={handleClear} className="gap-2 shrink-0">
                    <X className="h-4 w-4" />
                    Limpar
                  </Button>
                )}
              </div>

              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Carregando...</div>
              ) : displayedServices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum serviço cadastrado
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={displayedServices.length > 0 && selectedIds.length === displayedServices.length}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        
                        <TableHead>Descrição do Serviço</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Valor Venda</TableHead>
                        <TableHead className="text-right">Desconto %</TableHead>
                        <TableHead className="text-right">Valor Total (R$)</TableHead>
                        <TableHead className="text-center">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayedServices.map(service => (
                        <TableRow key={service.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedIds.includes(service.id)}
                              onCheckedChange={(checked) => handleSelectOne(service.id, !!checked)}
                            />
                          </TableCell>
                          
                          <TableCell className="max-w-[200px] truncate" title={service.description || ""}>
                            {service.description || "-"}
                          </TableCell>
                          <TableCell>{categoryLabels[service.category] || service.category}</TableCell>
                          <TableCell>{serviceTypeLabels[service.service_type] || service.service_type}</TableCell>
                          <TableCell className="text-right">{formatCurrency(service.sale_price)}</TableCell>
                          <TableCell className="text-right">{formatPercent(service.discount_value)}</TableCell>
                          <TableCell className="text-right font-medium text-primary">
                            {formatCurrency(service.final_price)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleViewService(service)}>
                                Ver
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleEditService(service)}>
                                Editar
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(service)}>
                                Excluir
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <ServiceModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedService(null);
            }}
            onSubmit={handleSubmit}
            service={selectedService}
            isLoading={createService.isPending || updateService.isPending}
          />

          <ServiceViewModal
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedService(null);
            }}
            service={selectedService}
          />

          <DeleteConfirmationModal
            open={isDeleteModalOpen}
            onOpenChange={setIsDeleteModalOpen}
            onConfirm={handleConfirmDelete}
            title="Excluir Serviço"
            description={`Tem certeza que deseja excluir o serviço "${selectedService?.description || ""}"? Esta ação não pode ser desfeita.`}
          />

          <DeleteConfirmationModal
            open={isBulkDeleteModalOpen}
            onOpenChange={setIsBulkDeleteModalOpen}
            onConfirm={handleConfirmBulkDelete}
            title="Excluir Serviços"
            description={`Tem certeza que deseja excluir ${selectedIds.length} serviço(s)? Esta ação não pode ser desfeita.`}
            isLoading={isDeletingBulk}
          />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
