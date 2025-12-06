import { useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchFilter } from "@/components/filters/SearchFilter";
import { InventoryModal } from "@/components/modals/InventoryModal";
import { InventoryViewModal } from "@/components/modals/InventoryViewModal";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import { Package, Plus, Headphones, Mic, Speaker } from "lucide-react";
import { mockEquipment } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

interface Equipment {
  id: string;
  name: string;
  category: string;
  status: string;
  quantity: number;
  location: string;
  value: string;
  lastMaintenance: string;
}

const Inventario = () => {
  const { toast } = useToast();
  const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  const filterOptions = [
    {
      key: "category",
      label: "Categoria",
      options: ["Microfone", "Fone", "Monitor", "Instrumento", "Interface"]
    },
    {
      key: "status",
      label: "Status",
      options: ["Disponível", "Em Uso", "Manutenção", "Danificado"]
    },
    {
      key: "location",
      label: "Local",
      options: ["Estúdio A", "Estúdio B", "Depósito", "Em Trânsito"]
    }
  ];

  const handleSearch = (searchTerm: string) => {
    filterEquipment(searchTerm, {});
  };

  const handleFilter = (filters: Record<string, string>) => {
    filterEquipment("", filters);
  };

  const handleClear = () => {
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

  const confirmDelete = () => {
    if (selectedEquipment) {
      const updated = allEquipment.filter(e => e.id !== selectedEquipment.id);
      setAllEquipment(updated);
      setFilteredEquipment(updated);
      toast({
        title: "Item Excluído",
        description: `${selectedEquipment.name} foi removido do inventário.`,
      });
      setIsDeleteModalOpen(false);
      setSelectedEquipment(null);
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
                <h1 className="text-3xl font-bold text-foreground">Inventário</h1>
                <p className="text-muted-foreground">
                  Controle de equipamentos e patrimônio
                </p>
              </div>
              <Button className="gap-2" onClick={() => setIsInventoryModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Novo Item
              </Button>
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
                value="R$ 0"
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
                <CardTitle>Lista de Equipamentos</CardTitle>
                <CardDescription>
                  Inventário completo de equipamentos e instrumentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredEquipment.length === 0 ? (
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
                  {filteredEquipment.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
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
                      
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <div className="text-muted-foreground">Quantidade</div>
                          <div className="font-medium text-foreground">{item.quantity} un</div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">Local</div>
                          <div className="font-medium">{item.location}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">Valor</div>
                          <div className="font-medium text-foreground">{item.value}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">Última Manutenção</div>
                          <div className="font-medium">{item.lastMaintenance}</div>
                        </div>
                        <div className="flex items-center gap-2">
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
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Inventario;