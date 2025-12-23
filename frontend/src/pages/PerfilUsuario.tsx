import { useState, useEffect, useRef } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Shield, Phone, Building2, Camera, Save, X, Edit2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ChangePasswordModal } from "@/components/modals/ChangePasswordModal";
import { LoginHistoryModal } from "@/components/modals/LoginHistoryModal";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  sector: string;
  role: string;
  bio: string;
  avatarUrl: string;
}

const PerfilUsuario = () => {
  const { toast } = useToast();
  const { user, permissions } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLoginHistoryModalOpen, setIsLoginHistoryModalOpen] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    sector: "",
    role: "user",
    bio: "",
    avatarUrl: ""
  });
  const [editData, setEditData] = useState<ProfileData>(profileData);

  // Verificar se o usuário é administrador (pode editar nível de acesso e setor)
  const isAdmin = permissions?.isAdmin || permissions?.roles?.includes('admin');
  
  // Debug: Log para verificar permissões
  console.log('[PerfilUsuario] Permissions:', permissions);
  console.log('[PerfilUsuario] isAdmin:', isAdmin);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fetch profile data - usando apenas colunas básicas
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, avatar_url, department')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      // Fetch user role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (roleError) {
        console.error('Error fetching role:', roleError);
      }

      const newProfileData: ProfileData = {
        name: profile?.full_name || user.user_metadata?.full_name || "",
        email: user.email || "",
        phone: profile?.phone || "",
        sector: (profile as any)?.department || "",
        role: roleData?.role || "user",
        bio: "",
        avatarUrl: profile?.avatar_url || ""
      };

      setProfileData(newProfileData);
      setEditData(newProfileData);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do perfil",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setEditData(profileData);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma imagem válida",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB",
        variant: "destructive"
      });
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setEditData({ ...editData, avatarUrl });
      setProfileData({ ...profileData, avatarUrl });

      toast({
        title: "Foto atualizada",
        description: "Sua foto de perfil foi atualizada com sucesso"
      });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Erro ao enviar foto",
        description: error.message || "Não foi possível enviar a foto",
        variant: "destructive"
      });
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    if (!user) return;

    // Validação básica
    if (!editData.name.trim()) {
      toast({
        title: "Erro",
        description: "O nome é obrigatório",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      // Usar update ao invés de upsert para evitar problemas de schema cache
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (existingProfile) {
        // Profile existe - fazer update
        // Só permite atualizar setor se for admin
        const updateData: any = {
          full_name: editData.name.trim(),
          phone: editData.phone.trim() || null,
          avatar_url: editData.avatarUrl || null,
          updated_at: new Date().toISOString()
        };
        
        // Apenas admin pode alterar o setor
        if (isAdmin) {
          updateData.department = editData.sector || null;
        }

        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', user.id);

        if (error) throw error;
      } else {
        // Profile não existe - criar
        // Só permite definir setor se for admin
        const insertData: any = {
          id: user.id,
          email: user.email,
          full_name: editData.name.trim(),
          phone: editData.phone.trim() || null,
          avatar_url: editData.avatarUrl || null
        };
        
        // Apenas admin pode definir o setor
        if (isAdmin) {
          insertData.department = editData.sector || null;
        }

        const { error } = await supabase
          .from('profiles')
          .insert(insertData);

        if (error) throw error;
      }

      // Se for admin e alterou o role, atualizar na tabela user_roles
      if (isAdmin && editData.role !== profileData.role) {
        // Primeiro remove o role anterior
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', user.id);
        
        // Insere o novo role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            role: editData.role
          });
        
        if (roleError) {
          console.error('Erro ao atualizar role:', roleError);
        }
      }

      setProfileData(editData);
      setIsEditing(false);
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso"
      });
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar as alterações",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      admin: "Administrador Master",
      gestor_artistico: "A&R / Gestão Artística",
      financeiro: "Financeiro / Contábil",
      juridico: "Jurídico",
      marketing: "Marketing",
      artista: "Artista",
      colaborador: "Colaborador / Freelancer",
      leitor: "Leitor",
      manager: "Gerente",
      user: "Usuário"
    };
    return roles[role] || role;
  };

  // Lista de níveis de acesso disponíveis (ordenados alfabeticamente)
  const availableRoles = [
    { value: "gestor_artistico", label: "A&R / Gestão Artística" },
    { value: "admin", label: "Administrador Master" },
    { value: "artista", label: "Artista" },
    { value: "colaborador", label: "Colaborador / Freelancer" },
    { value: "financeiro", label: "Financeiro / Contábil" },
    { value: "juridico", label: "Jurídico" },
    { value: "leitor", label: "Leitor" },
    { value: "marketing", label: "Marketing" },
  ];

  const sectors = [
    "Gestão",
    "Financeiro",
    "Marketing",
    "Jurídico",
    "Produção",
    "A&R",
    "Comercial",
    "Administrativo"
  ];

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <div className="w-full h-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="w-full h-full px-4 py-3 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="h-9 w-9" />
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
                  <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
                </div>
              </div>
              {!isEditing ? (
                <Button onClick={handleEdit} className="gap-2">
                  <Edit2 className="h-4 w-4" />
                  Editar Perfil
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancel} className="gap-2" disabled={isSaving}>
                    <X className="h-4 w-4" />
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} className="gap-2" disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Salvar
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Card do Avatar */}
              <Card className="lg:col-span-1">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4 relative">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <Avatar className="h-32 w-32">
                      {(isEditing ? editData.avatarUrl : profileData.avatarUrl) ? (
                        <AvatarImage src={isEditing ? editData.avatarUrl : profileData.avatarUrl} alt={profileData.name} />
                      ) : null}
                      <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                        {isUploadingAvatar ? (
                          <Loader2 className="h-8 w-8 animate-spin" />
                        ) : (
                          getInitials(isEditing ? editData.name : profileData.name)
                        )}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="absolute bottom-0 right-1/2 translate-x-8 translate-y-2 rounded-full h-10 w-10"
                        onClick={handleAvatarClick}
                        disabled={isUploadingAvatar}
                      >
                        {isUploadingAvatar ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                  <CardTitle>{isEditing ? editData.name : profileData.name || "Usuário"}</CardTitle>
                  <CardDescription className="flex items-center justify-center gap-2">
                    <Mail className="h-4 w-4" />
                    {profileData.email}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Função:</span>
                      <Badge variant="outline" className="gap-1">
                        <Shield className="h-3 w-3" />
                        {getRoleLabel(profileData.role)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Setor:</span>
                      <Badge variant="secondary">
                        <Building2 className="h-3 w-3 mr-1" />
                        {(isEditing ? editData.sector : profileData.sector) || "Não definido"}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {(isEditing ? editData.phone : profileData.phone) || "Não informado"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card de Informações */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informações Pessoais
                  </CardTitle>
                  <CardDescription>
                    {isEditing ? "Edite suas informações abaixo" : "Seus dados cadastrados no sistema"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo</Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          placeholder="Seu nome completo"
                        />
                      ) : (
                        <p className="text-sm py-2 px-3 bg-muted rounded-md">{profileData.name || "Não informado"}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <p className="text-sm py-2 px-3 bg-muted rounded-md">{profileData.email}</p>
                      {isEditing && (
                        <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={editData.phone}
                          onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                          placeholder="(11) 99999-9999"
                        />
                      ) : (
                        <p className="text-sm py-2 px-3 bg-muted rounded-md">{profileData.phone || "Não informado"}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sector">Setor</Label>
                      {isEditing && isAdmin ? (
                        <Select
                          value={editData.sector}
                          onValueChange={(value) => setEditData({ ...editData, sector: value })}
                        >
                          <SelectTrigger id="sector">
                            <SelectValue placeholder="Selecione o setor" />
                          </SelectTrigger>
                          <SelectContent>
                            {sectors.map((sector) => (
                              <SelectItem key={sector} value={sector}>
                                {sector}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm py-2 px-3 bg-muted rounded-md">{profileData.sector || "Não definido"}</p>
                      )}
                      {isEditing && !isAdmin && (
                        <p className="text-xs text-muted-foreground">O setor é definido pelo administrador do sistema</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Nível de Acesso</Label>
                      {isEditing && isAdmin ? (
                        <Select
                          value={editData.role}
                          onValueChange={(value) => setEditData({ ...editData, role: value })}
                        >
                          <SelectTrigger id="role">
                            <SelectValue placeholder="Selecione o nível de acesso" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableRoles.map((role) => (
                              <SelectItem key={role.value} value={role.value}>
                                {role.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm py-2 px-3 bg-muted rounded-md">{getRoleLabel(profileData.role)}</p>
                      )}
                      {isEditing && !isAdmin && (
                        <p className="text-xs text-muted-foreground">O nível de acesso é definido pelo administrador do sistema</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card de Segurança */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Segurança
                  </CardTitle>
                  <CardDescription>
                    Gerencie suas configurações de segurança
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button 
                      variant="outline" 
                      className="justify-start gap-2"
                      onClick={() => setIsPasswordModalOpen(true)}
                    >
                      <Shield className="h-4 w-4" />
                      Alterar Senha
                    </Button>
                    <Button 
                      variant="outline" 
                      className="justify-start gap-2"
                      onClick={() => toast({ title: "Em desenvolvimento", description: "Autenticação de dois fatores será implementada em breve" })}
                    >
                      <Phone className="h-4 w-4" />
                      Ativar 2FA
                    </Button>
                    <Button 
                      variant="outline" 
                      className="justify-start gap-2"
                      onClick={() => setIsLoginHistoryModalOpen(true)}
                    >
                      <User className="h-4 w-4" />
                      Histórico de Login
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </div>

      <ChangePasswordModal 
        open={isPasswordModalOpen} 
        onOpenChange={setIsPasswordModalOpen} 
      />
      
      <LoginHistoryModal
        open={isLoginHistoryModalOpen}
        onOpenChange={setIsLoginHistoryModalOpen}
      />
    </SidebarProvider>
  );
};

export default PerfilUsuario;
