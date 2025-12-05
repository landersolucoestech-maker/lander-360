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
import { useToast } from "@/hooks/use-toast";
import { UserCheck, Plus, Phone, Mail, Calendar, Star } from "lucide-react";
import { mockContacts } from "@/data/mockData";

const CRM = () => {
  const { toast } = useToast();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const contacts = mockContacts;

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
                value={0}
                description="na base de dados"
                icon={UserCheck}
                trend={{ value: 0, isPositive: true }}
              />
              <DashboardCard
                title="Leads Quentes"
                value={0}
                description="alta probabilidade"
                icon={Star}
                trend={{ value: 0, isPositive: true }}
              />
              <DashboardCard
                title="Conversões"
                value={0}
                description="este mês"
                icon={Calendar}
                trend={{ value: 0, isPositive: true }}
              />
              <DashboardCard
                title="Taxa de Conversão"
                value="0%"
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
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">contatos iniciais</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Qualificados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">leads validados</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Negociação</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">em andamento</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Fechados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
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
                {contacts.length === 0 ? (
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
                              <Badge variant="secondary">{contact.type}</Badge>
                              <Badge 
                                variant={
                                  contact.status === "Quente" ? "destructive" :
                                  contact.status === "Negociação" ? "outline" : "secondary"
                                }
                              >
                                {contact.status}
                              </Badge>
                              <Badge 
                                variant={
                                  contact.priority === "Alta" ? "destructive" :
                                  contact.priority === "Média" ? "outline" : "secondary"
                                }
                              >
                                {contact.priority}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span className="max-w-32 truncate">{contact.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>{contact.phone}</span>
                          </div>
                          <div className="text-center text-sm">
                            <div className="text-muted-foreground">Último Contato</div>
                            <div className="font-medium">{contact.lastContact}</div>
                          </div>
                          <div className="text-center text-sm">
                            <div className="text-muted-foreground">Próxima Ação</div>
                            <div className="font-medium max-w-32 truncate">{contact.nextAction}</div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedContact(contact);
                              setIsProfileModalOpen(true);
                            }}
                          >
                            Ver Perfil
                          </Button>
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
            // TODO: Implement actual contact service
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
            
            toast({
              title: "Contato Salvo",
              description: "O contato foi salvo com sucesso!",
            });
            setIsContactModalOpen(false);
          } catch (error) {
            toast({
              title: "Erro",
              description: "Erro ao salvar contato.",
              variant: "destructive",
            });
          }
        }}
      />
      
      <ContactProfileModal
        open={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
        contact={selectedContact}
      />
    </SidebarProvider>
  );
};

export default CRM;