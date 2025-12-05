import { useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchFilter } from "@/components/filters/SearchFilter";
import { ReleaseForm } from "@/components/forms/ReleaseForm";
import { ReleaseCard } from "@/components/releases/ReleaseCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Music, Plus, Calendar, TrendingUp, Eye } from "lucide-react";
import { mockReleases } from "@/data/mockData";

const Lancamentos = () => {
  const allReleases = mockReleases;

  const [filteredReleases, setFilteredReleases] = useState(allReleases);
  const [isNewReleaseModalOpen, setIsNewReleaseModalOpen] = useState(false);
  const [selectedRelease, setSelectedRelease] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const filterOptions = [
    {
      key: "type",
      label: "Tipo",
      options: ["Single", "EP", "Álbum"]
    },
    {
      key: "status",
      label: "Status",
      options: ["Lançado", "Programado", "Em Produção"]
    },
    {
      key: "artist",
      label: "Artista",
      options: [] // Will be populated from database
    }
  ];

  const handleSearch = (searchTerm: string) => {
    filterReleases(searchTerm, {});
  };

  const handleFilter = (filters: Record<string, string>) => {
    filterReleases("", filters);
  };

  const handleClear = () => {
    setFilteredReleases(allReleases);
  };

  const filterReleases = (searchTerm: string, filters: Record<string, string>) => {
    let filtered = allReleases;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(release =>
        release.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        release.artist.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(release => {
          if (key === "type") return release.type === value;
          if (key === "status") return release.status === value;
          if (key === "artist") return release.artist === value;
          return true;
        });
      }
    });

    setFilteredReleases(filtered);
  };

  const handleNewRelease = () => {
    setIsNewReleaseModalOpen(true);
  };

  const handleViewDetails = (release: any) => {
    setSelectedRelease(release);
    setIsDetailsModalOpen(true);
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
                <h1 className="text-3xl font-bold text-foreground">Lançamentos</h1>
                <p className="text-muted-foreground">
                  Gestão de lançamentos e distribuição musical
                </p>
              </div>
              <Button className="gap-2" onClick={handleNewRelease}>
                <Plus className="h-4 w-4" />
                Novo Lançamento
              </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardCard
                title="Lançamentos Ativos"
                value={0}
                description="disponíveis nas plataformas"
                icon={Music}
                trend={{ value: 0, isPositive: true }}
              />
              <DashboardCard
                title="Programados"
                value={0}
                description="próximos 30 dias"
                icon={Calendar}
                trend={{ value: 0, isPositive: true }}
              />
              <DashboardCard
                title="Performance"
                value="0%"
                description="taxa de crescimento"
                icon={TrendingUp}
                trend={{ value: 0, isPositive: true }}
              />
              <DashboardCard
                title="Total de Streams"
                value="0"
                description="reproduções acumuladas"
                icon={Eye}
                trend={{ value: 0, isPositive: true }}
              />
            </div>

            {/* Search and Filters */}
            <SearchFilter
              searchPlaceholder="Buscar lançamentos por título ou artista..."
              filters={filterOptions}
              onSearch={handleSearch}
              onFilter={handleFilter}
              onClear={handleClear}
            />

            {/* Releases List */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Lista de Lançamentos</CardTitle>
                <CardDescription>
                  Acompanhe todos os seus lançamentos musicais
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allReleases.length === 0 ? (
                  <div className="text-center py-12">
                    <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhum lançamento cadastrado</h3>
                    <p className="text-muted-foreground mb-4">
                      Comece criando seu primeiro lançamento musical
                    </p>
                    <Button onClick={handleNewRelease}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Lançamento
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredReleases.map((release) => (
                      <ReleaseCard
                        key={release.id}
                        release={release}
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* New Release Modal */}
            <Dialog open={isNewReleaseModalOpen} onOpenChange={setIsNewReleaseModalOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Novo Lançamento</DialogTitle>
                </DialogHeader>
                <ReleaseForm
                  onSuccess={() => setIsNewReleaseModalOpen(false)}
                  onCancel={() => setIsNewReleaseModalOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Lancamentos;