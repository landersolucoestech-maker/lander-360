import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUsers } from "@/hooks/useUsers";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Search, Users, Shield, Trash2, Edit3, UserX, MoreVertical } from "lucide-react";
import { UserModal } from "@/components/modals/UserModal";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const Usuarios = () => {
  const { toast } = useToast();
  const { users, loading, toggleUserStatus, deleteUser } = useUsers();
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [userToToggle, setUserToToggle] = useState<any>(null);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.sector?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
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
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Usuários</h1>
                  <p className="text-muted-foreground">
                    Gerencie usuários e permissões do sistema
                  </p>
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
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar por nome, email ou setor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
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
                                <span>{new Date(userData.created_at).toLocaleDateString('pt-BR')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(userData)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleToggleUserStatus(userData)}
                                className={userData.isActive ? "text-yellow-600" : "text-green-600"}
                              >
                                {userData.isActive ? (
                                  <>
                                    <Shield className="h-4 w-4 mr-2" />
                                    Desativar
                                  </>
                                ) : (
                                  <>
                                    <Shield className="h-4 w-4 mr-2" />
                                    Ativar
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteUser(userData)}
                                className="text-destructive"
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                Excluir Permanentemente
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
      <UserModal
        mode={selectedUser ? "edit" : "create"}
        user={selectedUser}
        open={isUserModalOpen}
        onOpenChange={setIsUserModalOpen}
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