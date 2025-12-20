import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Users, Music, Disc, Edit, FolderKanban, Rocket, FileText, 
  DollarSign, Calendar, Package, UserPlus, Briefcase,
  AlertTriangle, CheckCircle
} from "lucide-react";
import { ArtistModal } from "@/components/modals/ArtistModal";
import { ProjectModal } from "@/components/modals/ProjectModal";
import { MusicEditModal } from "@/components/modals/MusicEditModal";
import { PhonogramEditModal } from "@/components/modals/PhonogramEditModal";
import { ContractModal } from "@/components/modals/ContractModal";
import { InventoryModal } from "@/components/modals/InventoryModal";
import { ContactModal } from "@/components/modals/ContactModal";
import { ServiceModal } from "@/components/modals/ServiceModal";
import { FinancialTransactionModal } from "@/components/modals/FinancialTransactionModal";
import { AgendaEventModal } from "@/components/modals/AgendaEventModal";
import { ReleaseForm } from "@/components/forms/ReleaseForm";
import { useAuditData, AuditItem } from "@/hooks/useAuditData";
import { useUpdateFinancialTransaction } from "@/hooks/useFinancial";
import { useUpdateAgendaEvent } from "@/hooks/useAgenda";
import { useUpdateCrmContact } from "@/hooks/useCrm";
import { useUpdateService } from "@/hooks/useServices";

interface AuditSectionProps {
  title: string;
  items: AuditItem[];
  icon: React.ReactNode;
  onEdit: (item: AuditItem) => void;
}

const AuditSection = ({ title, items, icon, onEdit }: AuditSectionProps) => {
  const itemsWithIssues = items.filter(item => item.missingFields.length > 0);
  const completedItems = items.filter(item => item.missingFields.length === 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1">
            <CheckCircle className="h-3 w-3 text-green-600" />
            {completedItems.length} Completos
          </Badge>
          <Badge variant="outline" className="gap-1 border-yellow-500/50 text-yellow-600">
            <AlertTriangle className="h-3 w-3" />
            {itemsWithIssues.length} Incompletos
          </Badge>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">Nenhum registro encontrado</div>
      ) : (
        <ScrollArea className="h-[calc(100vh-500px)]">
          <div className="grid gap-3">
            {items.map(item => (
              <Card 
                key={item.id} 
                className={item.missingFields.length > 0 ? "border-yellow-500/50" : "border-green-500/30"}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{item.name || "Sem nome"}</h3>
                        {item.missingFields.length === 0 ? (
                          <Badge variant="outline" className="text-green-600 border-green-500/50">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-500/50">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {item.missingFields.length} campos
                          </Badge>
                        )}
                      </div>
                      {item.missingFields.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.missingFields.map((field, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs bg-yellow-500/10 text-yellow-700">
                              {field}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onEdit(item)}
                      className="gap-1 shrink-0"
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export function AuditoriaModule() {
  const auditData = useAuditData();
  const [activeTab, setActiveTab] = useState("artistas");

  const updateCrmContact = useUpdateCrmContact();
  const updateService = useUpdateService();
  const updateFinancialTransaction = useUpdateFinancialTransaction();
  const updateAgendaEvent = useUpdateAgendaEvent();

  // Modal states
  const [artistModalOpen, setArtistModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [musicModalOpen, setMusicModalOpen] = useState(false);
  const [phonogramModalOpen, setPhonogramModalOpen] = useState(false);
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [financialModalOpen, setFinancialModalOpen] = useState(false);
  const [agendaModalOpen, setAgendaModalOpen] = useState(false);
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);

  // Selected items for editing
  const [selectedArtist, setSelectedArtist] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedMusic, setSelectedMusic] = useState<any>(null);
  const [selectedPhonogram, setSelectedPhonogram] = useState<any>(null);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [selectedInventory, setSelectedInventory] = useState<any>(null);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedFinancial, setSelectedFinancial] = useState<any>(null);
  const [selectedAgenda, setSelectedAgenda] = useState<any>(null);
  const [selectedRelease, setSelectedRelease] = useState<any>(null);

  const handleContactSubmit = async (data: any) => {
    if (selectedContact?.id) {
      await updateCrmContact.mutateAsync({ id: selectedContact.id, ...data });
    }
  };

  const handleServiceSubmit = async (data: any) => {
    if (selectedService?.id) {
      await updateService.mutateAsync({ id: selectedService.id, ...data });
    }
  };

  const handleEditArtist = (item: AuditItem) => {
    setSelectedArtist(item.data);
    setArtistModalOpen(true);
  };

  const handleEditProject = (item: AuditItem) => {
    setSelectedProject(item.data);
    setProjectModalOpen(true);
  };

  const handleEditMusic = (item: AuditItem) => {
    setSelectedMusic(item.data);
    setMusicModalOpen(true);
  };

  const handleEditPhonogram = (item: AuditItem) => {
    setSelectedPhonogram(item.data);
    setPhonogramModalOpen(true);
  };

  const handleEditContract = (item: AuditItem) => {
    setSelectedContract(item.data);
    setContractModalOpen(true);
  };

  const handleEditInventory = (item: AuditItem) => {
    setSelectedInventory(item.data);
    setInventoryModalOpen(true);
  };

  const handleEditContact = (item: AuditItem) => {
    setSelectedContact(item.data);
    setContactModalOpen(true);
  };

  const handleEditService = (item: AuditItem) => {
    setSelectedService(item.data);
    setServiceModalOpen(true);
  };

  const handleEditFinancial = (item: AuditItem) => {
    setSelectedFinancial(item.data);
    setFinancialModalOpen(true);
  };

  const handleEditAgenda = (item: AuditItem) => {
    setSelectedAgenda(item.data);
    setAgendaModalOpen(true);
  };

  const handleEditRelease = (item: AuditItem) => {
    setSelectedRelease(item.data);
    setReleaseModalOpen(true);
  };

  const handleFinancialSubmit = async (data: any) => {
    if (selectedFinancial?.id) {
      await updateFinancialTransaction.mutateAsync({ id: selectedFinancial.id, ...data });
    }
  };

  const handleAgendaSubmit = async (data: any) => {
    if (selectedAgenda?.id) {
      await updateAgendaEvent.mutateAsync({ id: selectedAgenda.id, ...data });
    }
  };

  const tabs = [
    { id: "artistas", label: "Artistas", icon: Users, data: auditData.artistsAudit, onEdit: handleEditArtist },
    { id: "projetos", label: "Projetos", icon: FolderKanban, data: auditData.projectsAudit, onEdit: handleEditProject },
    { id: "obras", label: "Obras", icon: Music, data: auditData.musicAudit, onEdit: handleEditMusic },
    { id: "fonogramas", label: "Fonogramas", icon: Disc, data: auditData.phonogramsAudit, onEdit: handleEditPhonogram },
    { id: "lancamentos", label: "Lançamentos", icon: Rocket, data: auditData.releasesAudit, onEdit: handleEditRelease },
    { id: "contratos", label: "Contratos", icon: FileText, data: auditData.contractsAudit, onEdit: handleEditContract },
    { id: "financeiro", label: "Financeiro", icon: DollarSign, data: auditData.financialAudit, onEdit: handleEditFinancial },
    { id: "agenda", label: "Agenda", icon: Calendar, data: auditData.agendaAudit, onEdit: handleEditAgenda },
    { id: "inventario", label: "Inventário", icon: Package, data: auditData.inventoryAudit, onEdit: handleEditInventory },
    { id: "crm", label: "CRM", icon: UserPlus, data: auditData.crmAudit, onEdit: handleEditContact },
    { id: "servicos", label: "Serviços", icon: Briefcase, data: auditData.servicesAudit, onEdit: handleEditService },
  ];

  // Summary stats
  const totalIncomplete = tabs.reduce((acc, tab) => acc + tab.data.filter(i => i.missingFields.length > 0).length, 0);
  const totalComplete = tabs.reduce((acc, tab) => acc + tab.data.filter(i => i.missingFields.length === 0).length, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Registros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalComplete + totalIncomplete}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Registros Completos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalComplete}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Registros Incompletos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{totalIncomplete}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Completude</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalComplete + totalIncomplete > 0 
                ? Math.min(Math.round((totalComplete / (totalComplete + totalIncomplete)) * 100), 100) 
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Tabs */}
      <Card>
        <CardContent className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <ScrollArea className="w-full">
              <TabsList className="flex w-max gap-1 mb-4">
                {tabs.map(tab => {
                  const incompleteCount = tab.data.filter(i => i.missingFields.length > 0).length;
                  return (
                    <TabsTrigger 
                      key={tab.id} 
                      value={tab.id} 
                      className="gap-2 whitespace-nowrap"
                    >
                      <tab.icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      {incompleteCount > 0 && (
                        <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs bg-yellow-500/20 text-yellow-700">
                          {incompleteCount}
                        </Badge>
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </ScrollArea>

            {tabs.map(tab => (
              <TabsContent key={tab.id} value={tab.id}>
                <AuditSection 
                  title={`Auditoria de ${tab.label}`}
                  items={tab.data}
                  icon={<tab.icon className="h-5 w-5" />}
                  onEdit={tab.onEdit}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Modals */}
      <ArtistModal
        open={artistModalOpen}
        onOpenChange={setArtistModalOpen}
        artist={selectedArtist}
        mode="edit"
      />
      <ProjectModal
        open={projectModalOpen}
        onOpenChange={setProjectModalOpen}
        project={selectedProject}
        mode="edit"
      />
      <MusicEditModal
        open={musicModalOpen}
        onOpenChange={setMusicModalOpen}
        song={selectedMusic}
      />
      <PhonogramEditModal
        open={phonogramModalOpen}
        onOpenChange={setPhonogramModalOpen}
        phonogram={selectedPhonogram}
      />
      <ContractModal
        isOpen={contractModalOpen}
        onClose={() => setContractModalOpen(false)}
        contract={selectedContract}
      />
      <InventoryModal
        isOpen={inventoryModalOpen}
        onClose={() => setInventoryModalOpen(false)}
        equipment={selectedInventory}
        isEditMode={true}
      />
      <ContactModal
        open={contactModalOpen}
        onOpenChange={setContactModalOpen}
        initialData={selectedContact}
        onSubmit={handleContactSubmit}
      />
      <ServiceModal
        isOpen={serviceModalOpen}
        onClose={() => setServiceModalOpen(false)}
        service={selectedService}
        onSubmit={handleServiceSubmit}
      />
      <FinancialTransactionModal
        isOpen={financialModalOpen}
        onClose={() => setFinancialModalOpen(false)}
        transaction={selectedFinancial}
        onSubmit={handleFinancialSubmit}
        isLoading={updateFinancialTransaction.isPending}
      />
      <AgendaEventModal
        isOpen={agendaModalOpen}
        onClose={() => setAgendaModalOpen(false)}
        event={selectedAgenda ? {
          ...selectedAgenda,
          event_name: selectedAgenda.title || selectedAgenda.event_name,
        } : undefined}
        onSubmit={handleAgendaSubmit}
        isLoading={updateAgendaEvent.isPending}
      />
      <Dialog open={releaseModalOpen} onOpenChange={setReleaseModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Lançamento</DialogTitle>
          </DialogHeader>
          <ReleaseForm 
            release={selectedRelease} 
            onSuccess={() => { 
              setReleaseModalOpen(false); 
              setSelectedRelease(null); 
            }} 
            onCancel={() => { 
              setReleaseModalOpen(false); 
              setSelectedRelease(null); 
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AuditoriaModule;
