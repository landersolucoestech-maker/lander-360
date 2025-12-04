import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Mail, Phone, Calendar, Shield, Save, Camera } from "lucide-react";

const profileSchema = z.object({
  full_name: z.string().min(1, "Nome completo é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const PerfilUsuario = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  // Buscar dados do perfil
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`*`)
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data;
    },
    enabled: !!user?.id
  });

  // Get user roles
  const { data: userRoles } = useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      return data;
    },
    enabled: !!user?.id
  });

  // Formulário
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      full_name: profile?.full_name || user?.user_metadata?.full_name || "",
      email: user?.email || "",
      phone: profile?.phone || "",
    },
  });

  // Mutation para atualizar perfil
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      if (!user?.id) throw new Error('Usuário não encontrado');

      const profileData = {
        full_name: data.full_name,
        phone: data.phone || null,
      };

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (existingProfile) {
        const { data: updatedData, error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', user.id)
          .select()
          .single();
        
        if (error) throw error;
        return updatedData;
      } else {
        const { data: newData, error } = await supabase
          .from('profiles')
          .insert({ id: user.id, ...profileData })
          .select()
          .single();
        
        if (error) throw error;
        return newData;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      setIsEditing(false);
      toast({ title: "Sucesso", description: "Perfil atualizado com sucesso!" });
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      toast({ title: "Erro", description: "Falha ao atualizar perfil.", variant: "destructive" });
    },
  });

  const onSubmit = (data: ProfileFormData) => updateProfileMutation.mutate(data);

  const handleCancel = () => {
    setIsEditing(false);
    form.reset();
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6">
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
                <div className="h-64 bg-muted rounded"></div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  const userInitials = (profile?.full_name || user?.user_metadata?.full_name || "U")
    .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const hasAdminRole = userRoles?.some(r => r.role === 'admin');
  const userRole = hasAdminRole ? 'admin' : 'user';
  const userRoleLabel = { admin: 'Administrador', manager: 'Gerente', user: 'Usuário' }[userRole] || 'Usuário';

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6 space-y-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
              <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profile?.avatar_url || ""} alt="Avatar" />
                      <AvatarFallback className="bg-primary text-primary-foreground text-2xl">{userInitials}</AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle>{profile?.full_name || user?.user_metadata?.full_name || "Usuário"}</CardTitle>
                  <CardDescription className="flex items-center justify-center gap-2">
                    <Mail className="h-4 w-4" />{user?.email}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Função:</span>
                      <Badge variant="outline"><Shield className="h-3 w-3 mr-1" />{userRoleLabel}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Telefone:</span>
                      <span className="text-sm text-muted-foreground">{profile?.phone || "Não informado"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Membro desde:</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(user?.created_at || '').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Informações Pessoais</CardTitle>
                    <CardDescription>Atualize suas informações básicas</CardDescription>
                  </div>
                  {!isEditing && <Button variant="outline" onClick={() => setIsEditing(true)}>Editar Perfil</Button>}
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField control={form.control} name="full_name" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome Completo</FormLabel>
                            <FormControl><Input placeholder="Seu nome completo" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="email" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl><Input type="email" disabled {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="phone" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl><Input placeholder="(11) 99999-9999" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <div className="flex justify-end gap-3">
                          <Button type="button" variant="outline" onClick={handleCancel}>Cancelar</Button>
                          <Button type="submit" disabled={updateProfileMutation.isPending}>
                            <Save className="h-4 w-4 mr-2" />{updateProfileMutation.isPending ? 'Salvando...' : 'Salvar'}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  ) : (
                    <div className="space-y-4">
                      <div><label className="text-sm font-medium text-muted-foreground">Nome Completo</label><p>{profile?.full_name || "Não informado"}</p></div>
                      <div><label className="text-sm font-medium text-muted-foreground">Email</label><p>{user?.email}</p></div>
                      <div><label className="text-sm font-medium text-muted-foreground">Telefone</label><p>{profile?.phone || "Não informado"}</p></div>
                    </div>
                  )}
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