import { useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ContactModal } from "@/components/modals/ContactModal";
import { ContactProfileModal } from "@/components/modals/ContactProfileModal";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import { useToast } from "@/hooks/use-toast";
import { UserCheck, Plus, Phone, Mail, Calendar, Star, Loader2 } from "lucide-react";
import { useCrmContacts, useCreateCrmContact, useUpdateCrmContact, useDeleteCrmContact } from "@/hooks/useCrm";

const CRM = () => {
  const { toast } = useToast();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [contactToDelete, setContactToDelete] = useState<any>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const { data: crmContacts = [], isLoading } = useCrmContacts();
  const createContact = useCreateCrmContact();
  const updateContact = useUpdateCrmContact();
  const deleteContact = useDeleteCrmContact();
  
  const contacts = crmContacts;

  // Calculate KPIs from contacts data
  const totalContacts = contacts.length;
  const hotLeads = contacts.filter(c => c.status === 'quente').length;
  const closedDeals = contacts.filter(c => c.status === 'fechado').length;
  const conversionRate = totalContacts > 0 ? Math.round((closedDeals / totalContacts) * 100) : 0;
  
  // Pipeline counts
  const prospects = contacts.filter(c => c.status === 'frio' || c.status === 'morno').length;
  const qualified = contacts.filter(c => c.status === 'quente').length;
  const negotiating = contacts.filter(c => c.status === 'negociacao').length;
  const closed = contacts.filter(c => c.status === 'fechado').length;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="w-full h-full px-4 py-4 space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-foreground">CRM</h1>
                <p className="text-muted-foreground">
                  Gestão de relacionamento com clientes e prospects
                </p>
              </div>
              <Button 
                className="gap-2"
                onClick={() => setIsContactModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Novo Contato
              </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardCard
                title="Total de Contatos"
                value={totalContacts}
                description="na base de dados"
                icon={UserCheck}
                trend={{ value: 0, isPositive: true }}
              />
              <DashboardCard
                title="Leads Quentes"
                value={hotLeads}
                description="alta probabilidade"
                icon={Star}
                trend={{ value: 0, isPositive: true }}
              />
              <DashboardCard
                title="Conversões"
                value={closedDeals}
                description="este mês"
                icon={Calendar}
                trend={{ value: 0, isPositive: true }}
              />
              <DashboardCard
                title="Taxa de Conversão"
                value={`${conversionRate}%`}
                description="últimos 30 dias"
                icon={Star}
                trend={{ value: 0, isPositive: true }}
              />
            </div>

            {/* Pipeline Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Prospects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{prospects}</div>
                  <p className="text-xs text-muted-foreground">contatos iniciais</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Qualificados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{qualified}</div>
                  <p className="text-xs text-muted-foreground">leads validados</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Negociação</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{negotiating}</div>
                  <p className="text-xs text-muted-foreground">em andamento</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Fechados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{closed}</div>
                  <p className="text-xs text-muted-foreground">contratos assinados</p>
                </CardContent>
              </Card>
            </div>

            {/* Contacts List */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Lista de Contatos</CardTitle>
                <CardDescription>
                  Todos os contatos e prospects em acompanhamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : contacts.length === 0 ? (
                  <div className="text-center py-12">
                    <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhum contato cadastrado</h3>
                    <p className="text-muted-foreground mb-4">
                      Comece criando seu primeiro contato no CRM
                    </p>
                    <Button onClick={() => setIsContactModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Contato
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src="/placeholder.svg" alt={contact.name} />
                            <AvatarFallback>{contact.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <h3 className="font-medium text-foreground">{contact.name}</h3>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{contact.contact_type?.replace(/_/g, ' ') || 'N/A'}</Badge>
                              <Badge 
                                variant={
                                  (contact as any).status === "quente" ? "destructive" :
                                  (contact as any).status === "negociacao" ? "outline" : "secondary"
                                }
                              >
                                {(contact as any).status || 'N/A'}
                              </Badge>
                              <Badge 
                                variant={
                                  (contact as any).priority === "alta" ? "destructive" :
                                  (contact as any).priority === "media" ? "outline" : "secondary"
                                }
                              >
                                {(contact as any).priority || 'N/A'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>{contact.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <span className="max-w-32 truncate">{contact.email}</span>
                            </div>
                          </div>
                          <div className="text-center text-sm">
                            <div className="text-muted-foreground">Empresa</div>
                            <div className="font-medium max-w-32 truncate">{contact.company || '-'}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedContact(contact);
                                setIsProfileModalOpen(true);
                              }}
                            >
                              Ver
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedContact(contact);
                                setIsEditModalOpen(true);
                              }}
                            >
                              Editar
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setContactToDelete(contact);
                                setIsDeleteModalOpen(true);
                              }}
                            >
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
          </div>
        </SidebarInset>
      </div>
      
      <ContactModal
        open={isContactModalOpen}
        onOpenChange={setIsContactModalOpen}
        onSubmit={async (data) => {
          try {
            await createContact.mutateAsync({
              name: data.name,
              email: data.email,
              phone: data.phone,
              contact_type: data.type,
              company: data.company,
              position: data.position,
              document: data.document,
              address: data.address,
              city: data.city,
              state: data.state,
              zip_code: data.zip_code,
              notes: data.notes,
              status: data.status,
              priority: data.priority,
              next_action: data.nextAction,
            });
            setIsContactModalOpen(false);
          } catch (error) {
            console.error('Error creating contact:', error);
          }
        }}
      />
      
      <ContactProfileModal
        open={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
        contact={selectedContact}
      />

      <ContactModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        initialData={selectedContact ? {
          ...selectedContact,
          type: selectedContact.contact_type,
        } : undefined}
        onSubmit={async (data) => {
          try {
            await updateContact.mutateAsync({
              id: selectedContact.id,
              name: data.name,
              email: data.email,
              phone: data.phone,
              contact_type: data.type,
              company: data.company,
              position: data.position,
              document: data.document,
              address: data.address,
              city: data.city,
              state: data.state,
              zip_code: data.zip_code,
              notes: data.notes,
              status: data.status,
              priority: data.priority,
              next_action: data.nextAction,
            });
            setIsEditModalOpen(false);
          } catch (error) {
            console.error('Error updating contact:', error);
          }
        }}
      />

      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={async () => {
          if (contactToDelete) {
            try {
              await deleteContact.mutateAsync(contactToDelete.id);
              setIsDeleteModalOpen(false);
              setContactToDelete(null);
            } catch (error) {
              console.error('Error deleting contact:', error);
            }
          }
        }}
        title="Excluir Contato"
        description={`Tem certeza que deseja excluir o contato "${contactToDelete?.name}"? Esta ação não pode ser desfeita.`}
      />
    </SidebarProvider>
  );
};

export default CRM;