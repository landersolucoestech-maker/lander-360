import { useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Shield, Phone, Building2, Camera, Save, X, Edit2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "Administrador",
    email: "admin@lander360.com",
    phone: "(11) 99999-9999",
    sector: "Gestão",
    role: "admin",
    bio: "Administrador do sistema Lander 360º, responsável pela gestão completa da plataforma.",
    avatarUrl: ""
  });
  const [editData, setEditData] = useState<ProfileData>(profileData);

  const handleEdit = () => {
    setEditData(profileData);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  const handleSave = () => {
    // Validação básica
    if (!editData.name.trim()) {
      toast({
        title: "Erro",
        description: "O nome é obrigatório",
        variant: "destructive"
      });
      return;
    }
    if (!editData.email.trim() || !editData.email.includes("@")) {
      toast({
        title: "Erro",
        description: "Email inválido",
        variant: "destructive"
      });
      return;
    }

    setProfileData(editData);
    setIsEditing(false);
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram salvas com sucesso"
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      admin: "Administrador",
      manager: "Gerente",
      user: "Usuário"
    };
    return roles[role] || role;
  };

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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
                <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
              </div>
              {!isEditing ? (
                <Button onClick={handleEdit} className="gap-2">
                  <Edit2 className="h-4 w-4" />
                  Editar Perfil
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancel} className="gap-2">
                    <X className="h-4 w-4" />
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} className="gap-2">
                    <Save className="h-4 w-4" />
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
                    <Avatar className="h-32 w-32">
                      {profileData.avatarUrl ? (
                        <AvatarImage src={profileData.avatarUrl} alt={profileData.name} />
                      ) : null}
                      <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                        {getInitials(isEditing ? editData.name : profileData.name)}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="absolute bottom-0 right-1/2 translate-x-8 translate-y-2 rounded-full h-10 w-10"
                        onClick={() => toast({ title: "Em desenvolvimento", description: "Upload de foto será implementado em breve" })}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <CardTitle>{isEditing ? editData.name : profileData.name}</CardTitle>
                  <CardDescription className="flex items-center justify-center gap-2">
                    <Mail className="h-4 w-4" />
                    {isEditing ? editData.email : profileData.email}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Função:</span>
                      <Badge variant="outline" className="gap-1">
                        <Shield className="h-3 w-3" />
                        {getRoleLabel(isEditing ? editData.role : profileData.role)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Setor:</span>
                      <Badge variant="secondary">
                        <Building2 className="h-3 w-3 mr-1" />
                        {isEditing ? editData.sector : profileData.sector}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {isEditing ? editData.phone : profileData.phone}
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
                        <p className="text-sm py-2 px-3 bg-muted rounded-md">{profileData.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      {isEditing ? (
                        <Input
                          id="email"
                          type="email"
                          value={editData.email}
                          onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                          placeholder="seu@email.com"
                        />
                      ) : (
                        <p className="text-sm py-2 px-3 bg-muted rounded-md">{profileData.email}</p>
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
                        <p className="text-sm py-2 px-3 bg-muted rounded-md">{profileData.phone}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sector">Setor</Label>
                      {isEditing ? (
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
                        <p className="text-sm py-2 px-3 bg-muted rounded-md">{profileData.sector}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Nível de Acesso</Label>
                      {isEditing ? (
                        <Select
                          value={editData.role}
                          onValueChange={(value) => setEditData({ ...editData, role: value })}
                        >
                          <SelectTrigger id="role">
                            <SelectValue placeholder="Selecione o nível" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="manager">Gerente</SelectItem>
                            <SelectItem value="user">Usuário</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm py-2 px-3 bg-muted rounded-md">{getRoleLabel(profileData.role)}</p>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bio">Biografia</Label>
                      {isEditing ? (
                        <Textarea
                          id="bio"
                          value={editData.bio}
                          onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                          placeholder="Uma breve descrição sobre você..."
                          rows={4}
                        />
                      ) : (
                        <p className="text-sm py-2 px-3 bg-muted rounded-md min-h-[80px]">{profileData.bio}</p>
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
                      onClick={() => toast({ title: "Em desenvolvimento", description: "Alteração de senha será implementada em breve" })}
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
                      onClick={() => toast({ title: "Em desenvolvimento", description: "Histórico de login será implementado em breve" })}
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
    </SidebarProvider>
  );
};

export default PerfilUsuario;