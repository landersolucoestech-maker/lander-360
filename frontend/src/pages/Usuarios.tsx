import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUsers } from "@/hooks/useUsers";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Search, Users, Shield, Trash2, UserX, MoreVertical, X, ArrowUpDown } from "lucide-react";
import { UserModal } from "@/components/modals/UserModal";
import { UserViewModal } from "@/components/modals/UserViewModal";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDateBR } from "@/lib/utils";

const Usuarios = () => {
  const { toast } = useToast();
  const { users: dbUsers, loading, toggleUserStatus, deleteUser, refetch } = useUsers();
  const users = dbUsers;
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name_asc");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userToView, setUserToView] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [userToToggle, setUserToToggle] = useState<any>(null);

  // Get unique sectors for filter dropdown - ordenados alfabeticamente
  const uniqueSectors = [...new Set(users.map(u => u.sector).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  
  // Get unique roles for filter dropdown - ordenados alfabeticamente
  const uniqueRoles = [...new Set(users.flatMap(u => u.roles || []).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));

  useEffect(() => {
    let filtered = users;

    // Text search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.sector?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.roles?.includes(roleFilter));
    }

    // Status filter
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filtered = filtered.filter(user => user.isActive === isActive);
    }

    // Sector filter
    if (sectorFilter !== "all") {
      filtered = filtered.filter(user => user.sector === sectorFilter);
    }

    // Sorting
    const [field, direction] = sortBy.split("_");
    filtered = [...filtered].sort((a, b) => {
      let valueA, valueB;
      
      switch (field) {
        case "name":
          valueA = a.full_name?.toLowerCase() || "";
          valueB = b.full_name?.toLowerCase() || "";
          break;
        case "email":
          valueA = a.email?.toLowerCase() || "";
          valueB = b.email?.toLowerCase() || "";
          break;
        case "date":
          valueA = new Date(a.created_at || 0).getTime();
          valueB = new Date(b.created_at || 0).getTime();
          break;
        default:
          return 0;
      }

      if (valueA < valueB) return direction === "asc" ? -1 : 1;
      if (valueA > valueB) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredUsers(filtered);
  }, [searchTerm, users, roleFilter, statusFilter, sectorFilter, sortBy]);

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const handleViewUser = (user: any) => {
    setUserToView(user);
    setIsViewModalOpen(true);
  };

  const handleToggleUserStatus = (user: any) => {
    setUserToToggle(user);
    setIsToggleModalOpen(true);
  };

  const handleDeleteUser = (user: any) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!userToToggle) return;

    try {
      const result = await toggleUserStatus(userToToggle.id);
      if (result.success) {
        // Success message is handled in the hook
      }
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      toast({
        title: "Erro",
        description: "Falha ao alterar status do usuário",
        variant: "destructive",
      });
    } finally {
      setIsToggleModalOpen(false);
      setUserToToggle(null);
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      const result = await deleteUser(userToDelete.id);
      if (result.success) {
        // Success message is handled in the hook
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast({
        title: "Erro",
        description: "Falha ao excluir usuário",
        variant: "destructive",
      });
    } finally {
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (roles: string[]) => {
    if (roles.includes('admin') || roles.includes('master')) return 'bg-red-100 text-red-800';
    if (roles.includes('manager')) return 'bg-blue-100 text-blue-800';
    if (roles.includes('producer')) return 'bg-green-100 text-green-800';
    if (roles.includes('artist')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getRoleLabel = (roles: string[]) => {
    if (roles.includes('master')) return 'Master';
    if (roles.includes('admin')) return 'Administrador';
    if (roles.includes('manager')) return 'Gerente';
    if (roles.includes('producer')) return 'Produtor';
    if (roles.includes('artist')) return 'Artista';
    return 'Usuário';
  };

  // Removemos as verificações de loading e acesso que podem estar causando problemas
  
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
                <div className="flex items-center gap-2">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">Usuários</h1>
                    <p className="text-muted-foreground">
                      Gerencie usuários e permissões do sistema
                    </p>
                  </div>
                </div>
              </div>
              <Button onClick={handleCreateUser} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Novo Usuário
              </Button>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar por nome, email ou setor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Cargos</SelectItem>
                      {uniqueRoles.length > 0 ? (
                        uniqueRoles.map(role => (
                          <SelectItem key={role} value={role}>
                            {role === 'admin' ? 'Administrador Master' :
                             role === 'gestor_artistico' ? 'A&R / Gestão Artística' :
                             role === 'financeiro' ? 'Financeiro / Contábil' :
                             role === 'juridico' ? 'Jurídico' :
                             role === 'marketing' ? 'Marketing' :
                             role === 'artista' ? 'Artista' :
                             role === 'colaborador' ? 'Colaborador / Freelancer' :
                             role === 'leitor' ? 'Leitor' :
                             role}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="admin">Administrador Master</SelectItem>
                          <SelectItem value="gestor_artistico">A&R / Gestão Artística</SelectItem>
                          <SelectItem value="artista">Artista</SelectItem>
                          <SelectItem value="colaborador">Colaborador / Freelancer</SelectItem>
                          <SelectItem value="financeiro">Financeiro / Contábil</SelectItem>
                          <SelectItem value="juridico">Jurídico</SelectItem>
                          <SelectItem value="leitor">Leitor</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Status</SelectItem>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>

                  {uniqueSectors.length > 0 && (
                    <Select value={sectorFilter} onValueChange={setSectorFilter}>
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Setor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Setores</SelectItem>
                        {uniqueSectors.map(sector => (
                          <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Ordenar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name_asc">Nome (A-Z)</SelectItem>
                      <SelectItem value="name_desc">Nome (Z-A)</SelectItem>
                      <SelectItem value="email_asc">Email (A-Z)</SelectItem>
                      <SelectItem value="email_desc">Email (Z-A)</SelectItem>
                      <SelectItem value="date_desc">Mais Recentes</SelectItem>
                      <SelectItem value="date_asc">Mais Antigos</SelectItem>
                    </SelectContent>
                  </Select>

                  {(searchTerm || roleFilter !== "all" || statusFilter !== "all" || sectorFilter !== "all" || sortBy !== "name_asc") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchTerm("");
                        setRoleFilter("all");
                        setStatusFilter("all");
                        setSectorFilter("all");
                        setSortBy("name_asc");
                      }}
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Limpar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Users List */}
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {filteredUsers.map((userData) => (
                    <div key={userData.id} className="p-6 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {getUserInitials(userData.full_name || 'U')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-lg font-medium text-foreground truncate">
                                {userData.full_name}
                              </h3>
                              <Badge 
                                variant="outline"
                                className={getRoleColor(userData.roles || [])}
                              >
                                {getRoleLabel(userData.roles || [])}
                              </Badge>
                              <Badge 
                                variant={userData.isActive ? "default" : "secondary"}
                                className={userData.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                              >
                                {userData.isActive ? "Ativo" : "Inativo"}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Email:</span>
                                <span className="truncate">{userData.email}</span>
                              </div>
                              
                              {userData.sector && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">Setor:</span>
                                  <span>{userData.sector}</span>
                                </div>
                              )}
                              
                              {userData.phone && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">Telefone:</span>
                                  <span>{userData.phone}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Criado em:</span>
                                <span>{formatDateBR(userData.created_at)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewUser(userData)}
                          >
                            Ver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(userData)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(userData)}
                          >
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Empty State */}
            {filteredUsers.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
                  </h3>
                  <p className="text-muted-foreground text-center mb-6">
                    {searchTerm 
                      ? 'Tente ajustar os filtros de busca'
                      : 'Comece criando o primeiro usuário do sistema'
                    }
                  </p>
                  {!searchTerm && (
                    <Button onClick={handleCreateUser} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Criar Primeiro Usuário
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </SidebarInset>
      </div>

      {/* Modals */}
      <UserViewModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        user={userToView}
      />

      <UserModal
        mode={selectedUser ? "edit" : "create"}
        user={selectedUser}
        open={isUserModalOpen}
        onOpenChange={setIsUserModalOpen}
        onSaved={refetch}
      />

      <DeleteConfirmationModal
        open={isToggleModalOpen}
        onOpenChange={setIsToggleModalOpen}
        onConfirm={confirmToggleStatus}
        title={`Confirmar ${userToToggle?.isActive ? 'desativação' : 'ativação'}`}
        description={`Tem certeza que deseja ${userToToggle?.isActive ? 'desativar' : 'ativar'} o usuário "${userToToggle?.full_name}"?`}
      />

      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={confirmDelete}
        title="Confirmar exclusão permanente"
        description={`⚠️ ATENÇÃO: Esta ação é irreversível! Tem certeza que deseja excluir permanentemente o usuário "${userToDelete?.full_name}" e todos os seus dados?`}
      />
    </SidebarProvider>
  );
};

export default Usuarios;