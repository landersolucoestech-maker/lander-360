import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { User, Shield, Eye, Plus, Edit, Trash2, CheckCircle, Download, Settings, Mail, Music, Target, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useUsers } from '@/hooks/useUsers';
import { generateSecureToken, sanitizeInput } from '@/lib/security';
import { useSecurePassword } from '@/hooks/useSecurePassword';
import { supabase } from '@/integrations/supabase/client';
import { useArtists } from '@/hooks/useArtists';
import { 
  UserRole, 
  Sector, 
  roleDisplayNames, 
  roleDescriptions, 
  sectorDisplayNames,
  moduleDisplayNames,
  permissionDisplayNames,
  moduleAvailablePermissions,
  defaultRolePermissions,
  SystemModule,
  ModulePermission
} from '@/lib/permissions';

const userSchema = z.object({
  fullName: z.string().min(2, 'Nome completo é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  role: z.string().optional(),
  sector: z.string().optional(),
  status: z.enum(['active', 'inactive']),
  linkedArtistId: z.string().optional(),
  scopeType: z.enum(['all', 'artist', 'project']).default('all'),
  scopeIds: z.array(z.string()).default([]),
  permissionMode: z.enum(['automatic', 'manual']).default('automatic'),
  permissionTemplate: z.string().optional(),
  permissions: z.record(z.string(), z.array(z.string())).default({}),
}).superRefine((data, ctx) => {
  // Role is required in automatic mode
  if (data.permissionMode === 'automatic' && (!data.role || data.role.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Perfil é obrigatório no modo automático',
      path: ['role'],
    });
  }
  // Linked artist is required for Artista role
  if (data.role === 'artista' && !data.linkedArtistId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Selecione o artista vinculado',
      path: ['linkedArtistId'],
    });
  }
  // Scope IDs required when scope is not 'all'
  if (data.scopeType !== 'all' && data.scopeIds.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Selecione pelo menos um item para o escopo de acesso',
      path: ['scopeIds'],
    });
  }
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  user?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

// Available roles for selection - ATUALIZADO conforme matriz de permissões
const availableRoles: { value: UserRole; label: string; description: string }[] = [
  { value: 'admin', label: roleDisplayNames.admin, description: roleDescriptions.admin },
  { value: 'gestor_artistico', label: roleDisplayNames.gestor_artistico, description: roleDescriptions.gestor_artistico },
  { value: 'financeiro', label: roleDisplayNames.financeiro, description: roleDescriptions.financeiro },
  { value: 'juridico', label: roleDisplayNames.juridico, description: roleDescriptions.juridico },
  { value: 'marketing', label: roleDisplayNames.marketing, description: roleDescriptions.marketing },
  { value: 'artista', label: roleDisplayNames.artista, description: roleDescriptions.artista },
  { value: 'colaborador', label: roleDisplayNames.colaborador, description: roleDescriptions.colaborador },
  { value: 'leitor', label: roleDisplayNames.leitor, description: roleDescriptions.leitor },
];

// Available sectors for selection
const availableSectors: { value: Sector; label: string }[] = [
  { value: 'producao', label: sectorDisplayNames.producao },
  { value: 'administrativo', label: sectorDisplayNames.administrativo },
  { value: 'financeiro', label: sectorDisplayNames.financeiro },
  { value: 'marketing', label: sectorDisplayNames.marketing },
  { value: 'comercial', label: sectorDisplayNames.comercial },
  { value: 'tecnico', label: sectorDisplayNames.tecnico },
  { value: 'artistico', label: sectorDisplayNames.artistico },
  { value: 'eventos', label: sectorDisplayNames.eventos },
  { value: 'juridico', label: sectorDisplayNames.juridico },
  { value: 'rh', label: sectorDisplayNames.rh },
  { value: 'ti', label: sectorDisplayNames.ti },
];

// Modules for permission configuration
const modules: { id: SystemModule; label: string }[] = Object.entries(moduleDisplayNames).map(([id, label]) => ({
  id: id as SystemModule,
  label,
}));

// Permission actions for display
const permissionActions = [
  { id: 'view', label: 'Visualizar', icon: Eye },
  { id: 'create', label: 'Criar', icon: Plus },
  { id: 'edit', label: 'Editar', icon: Edit },
  { id: 'delete', label: 'Excluir', icon: Trash2 },
  { id: 'approve', label: 'Aprovar', icon: CheckCircle },
  { id: 'export', label: 'Exportar', icon: Download },
];

// Permission templates based on roles
const permissionTemplates: Record<string, { label: string; permissions: Record<string, string[]> }> = {
  administrador: {
    label: 'Administrador',
    permissions: {
      artistas: ['view', 'create', 'edit', 'delete', 'export'],
      projetos: ['view', 'create', 'edit', 'delete', 'export'],
      marketing: ['view', 'create', 'edit', 'delete', 'export'],
      financeiro: ['view', 'create', 'edit', 'delete', 'export'],
      contratos: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
      agenda: ['view', 'create', 'edit', 'delete', 'export'],
      inventario: ['view', 'create', 'edit', 'delete', 'export'],
      configuracoes: ['view', 'edit'],
      usuarios: ['view', 'create', 'edit', 'delete'],
    }
  },
  artista: {
    label: 'Artista',
    permissions: {
      artistas: ['view'],
      projetos: ['view'],
      marketing: ['view'],
      financeiro: [],
      contratos: ['view'],
      agenda: ['view'],
      inventario: [],
      configuracoes: [],
      usuarios: [],
    }
  },
  gestor_artistico: {
    label: 'Gestor Artístico',
    permissions: {
      artistas: ['view', 'create', 'edit'],
      projetos: ['view', 'create', 'edit'],
      marketing: ['view'],
      financeiro: [],
      contratos: ['view'],
      agenda: ['view', 'create', 'edit'],
      inventario: [],
      configuracoes: [],
      usuarios: [],
    }
  },
  financeiro: {
    label: 'Financeiro',
    permissions: {
      artistas: ['view'],
      projetos: ['view'],
      marketing: [],
      financeiro: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
      contratos: ['view', 'edit', 'export'],
      agenda: ['view'],
      inventario: ['view'],
      configuracoes: [],
      usuarios: [],
    }
  },
  marketing_template: {
    label: 'Marketing',
    permissions: {
      artistas: ['view'],
      projetos: ['view'],
      marketing: ['view', 'create', 'edit', 'delete', 'export'],
      financeiro: [],
      contratos: [],
      agenda: ['view', 'create', 'edit'],
      inventario: [],
      configuracoes: [],
      usuarios: [],
    }
  },
  marketing: {
    label: 'Marketing',
    permissions: {
      artistas: ['view'],
      projetos: ['view'],
      marketing: ['view', 'create', 'edit', 'delete', 'export'],
      financeiro: [],
      contratos: [],
      agenda: ['view', 'create', 'edit'],
      inventario: [],
      configuracoes: [],
      usuarios: [],
    }
  },
  leitor: {
    label: 'Leitor (Read-only)',
    permissions: {
      artistas: ['view'],
      projetos: ['view'],
      marketing: ['view'],
      financeiro: ['view'],
      contratos: ['view'],
      agenda: ['view'],
      inventario: ['view'],
      configuracoes: [],
      usuarios: [],
    }
  },
  visualizador: {
    label: 'Visualizador',
    permissions: {
      artistas: ['view'],
      projetos: ['view'],
      marketing: ['view'],
      financeiro: ['view'],
      contratos: ['view'],
      agenda: ['view'],
      inventario: ['view'],
      configuracoes: [],
      usuarios: [],
    }
  },
  editor: {
    label: 'Editor',
    permissions: {
      artistas: ['view', 'create', 'edit'],
      projetos: ['view', 'create', 'edit'],
      marketing: ['view', 'create', 'edit'],
      financeiro: ['view'],
      contratos: ['view', 'edit'],
      agenda: ['view', 'create', 'edit'],
      inventario: ['view', 'edit'],
      configuracoes: [],
      usuarios: [],
    }
  },
};

// Permissões adicionais com base no Setor (aplicadas de forma aditiva)
const sectorPermissionAdditions: Record<string, Record<string, string[]>> = {
  Financeiro: {
    financeiro: ['visualizar', 'criar', 'editar', 'excluir', 'aprovar', 'exportar'],
    contratos: ['visualizar', 'exportar'],
  },
  Marketing: {
    marketing: ['visualizar', 'criar', 'editar', 'excluir', 'aprovar', 'exportar'],
    agenda: ['visualizar', 'criar', 'editar'],
  },
  Produção: {
    projetos: ['visualizar', 'criar', 'editar'],
    agenda: ['visualizar', 'criar', 'editar'],
  },
  Eventos: {
    agenda: ['visualizar', 'criar', 'editar'],
  },
  Administrativo: {
    contratos: ['visualizar', 'criar', 'editar'],
    projetos: ['visualizar'],
  },
  Artístico: {
    artistas: ['visualizar', 'criar', 'editar'],
  },
  Técnico: {
    inventario: ['visualizar', 'criar', 'editar'],
  },
  Comercial: {
    projetos: ['visualizar'],
    marketing: ['visualizar'],
  },
  Jurídico: {
    contratos: ['visualizar', 'criar', 'editar', 'exportar'],
  },
  'Recursos Humanos': {},
  TI: {
    configuracoes: ['visualizar', 'editar'],
  },
};

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const { createUser, updateUser, loading } = useUsers();
  const { data: artists = [] } = useArtists();
  const { generateAndNotifyPassword } = useSecurePassword();
  const [linkedArtistId, setLinkedArtistId] = useState<string>('');
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullName: user?.full_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      role: user?.roles?.[0] || user?.role_display || '',
      sector: user?.sector || '',
      status: user?.isActive === false ? 'inactive' : 'active',
      linkedArtistId: '',
      permissionMode: 'automatic',
      permissionTemplate: '',
      permissions: {
        artistas: [],
        projetos: [],
        marketing: [],
        financeiro: [],
        contratos: [],
        agenda: [],
        inventario: [],
        configuracoes: [],
        usuarios: [],
      },
    },
  });

  // Load linked artist when editing user
  useEffect(() => {
    const loadLinkedArtist = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from('user_artists')
          .select('artist_id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (data?.artist_id) {
          setLinkedArtistId(data.artist_id);
          setValue('linkedArtistId', data.artist_id);
        }
      }
    };
    loadLinkedArtist();
  }, [user?.id, setValue]);

  // Popular formulário quando usuário for fornecido
  useEffect(() => {
    if (user) {
      setValue('fullName', user.full_name || '');
      setValue('email', user.email || '');
      setValue('phone', user.phone || '');
      setValue('sector', user.sector || '');
      setValue('status', user.isActive === false ? 'inactive' : 'active');

      // Use role_display or first role from roles array
      const userRole = user.role_display || user.roles?.[0] || '';
      setValue('role', userRole);

      // Carregar permissões detalhadas existentes
      const userPerms = user.permissions;
      if (userPerms && Array.isArray(userPerms) && userPerms.length > 0) {
        const modulePermissions: { [key: string]: string[] } = {
          artistas: [],
          projetos: [],
          marketing: [],
          financeiro: [],
          contratos: [],
          agenda: [],
          inventario: [],
          configuracoes: [],
          usuarios: [],
        };

        userPerms.forEach((permission: string) => {
          if (permission && typeof permission === 'string' && permission.includes(':')) {
            const [module, action] = permission.split(':');
            if (modulePermissions[module]) {
              modulePermissions[module].push(action);
            }
          }
        });

        setValue('permissions', modulePermissions);
        // Ao editar um usuário com permissões já definidas, abrir direto no modo manual
        // para renderizar e permitir ajuste fino.
        setValue('permissionMode', 'manual');
        setValue('permissionTemplate', '');
        setHasManualPermissionEdits(true);
      }
    }
  }, [user, setValue]);

  const watchedPermissions = watch('permissions') || {};
  const watchedTemplate = watch('permissionTemplate');
  const watchedRole = watch('role');
  const watchedSector = watch('sector');
  const watchedPermissionMode = watch('permissionMode');
  const [hasManualPermissionEdits, setHasManualPermissionEdits] = useState(false);

  // Auto-aplicar permissões com base na Função selecionada (apenas no modo automático)
  useEffect(() => {
    if (!watchedRole || hasManualPermissionEdits || watchedPermissionMode !== 'automatic') return;
    const roleToTemplateMap: Record<string, keyof typeof permissionTemplates> = {
      'Master': 'administrador',
      'Administrador': 'administrador',
      'Gerente': 'editor',
      'Editor': 'editor',
      'Analista Financeiro': 'financeiro',
      'Especialista em Marketing': 'marketing',
      'Artista': 'artista',
      'Produtor Musical': 'visualizador',
      'Assistente de Produção': 'visualizador',
      'Coordenador de Eventos': 'visualizador',
      'Técnico de Som': 'visualizador',
      'Designer Gráfico': 'visualizador',
      'Social Media': 'marketing',
      'Leitor': 'leitor',
    };
    const templateKey = roleToTemplateMap[watchedRole] || 'visualizador';
    const template = permissionTemplates[templateKey];
    if (template && template.permissions) {
      setValue('permissionTemplate', templateKey);
      setValue('permissions', template.permissions);
    }
  }, [watchedRole, hasManualPermissionEdits, watchedPermissionMode, setValue]);

  // Ajustar permissões com base no Setor selecionado (aditivo, apenas no modo automático)
  useEffect(() => {
    if (!watchedSector || hasManualPermissionEdits || watchedPermissionMode !== 'automatic') return;
    const additions = sectorPermissionAdditions[watchedSector as keyof typeof sectorPermissionAdditions];
    if (!additions) return;
    const merged: Record<string, string[]> = { ...watchedPermissions } as any;
    Object.entries(additions).forEach(([moduleId, actions]) => {
      const existing = (merged[moduleId] || []) as string[];
      merged[moduleId] = Array.from(new Set([...existing, ...actions]));
    });
    setValue('permissions', merged as any);
  }, [watchedSector, hasManualPermissionEdits, watchedPermissions, watchedPermissionMode, setValue]);

  const handleTemplateChange = (template: string) => {
    setValue('permissionTemplate', template);
    const selectedTemplate = permissionTemplates[template as keyof typeof permissionTemplates];
    if (template && selectedTemplate && selectedTemplate.permissions) {
      setValue('permissions', selectedTemplate.permissions);
    }
  };

  const handlePermissionChange = (module: string, action: string, checked: boolean) => {
    const currentModulePermissions = watchedPermissions[module as keyof typeof watchedPermissions] || [];
    let newModulePermissions: string[];
    
    if (checked) {
      newModulePermissions = [...currentModulePermissions, action];
    } else {
      newModulePermissions = currentModulePermissions.filter(p => p !== action);
    }
    
    // Update the entire permissions object with the new module permissions
    const updatedPermissions = {
      ...watchedPermissions,
      [module]: newModulePermissions,
    };
    
    setValue('permissions', updatedPermissions);
    setHasManualPermissionEdits(true);
    // Clear template selection when manually changing permissions
    setValue('permissionTemplate', '');
  };

  const [emailChangeLoading, setEmailChangeLoading] = useState(false);

  const requestEmailChange = async (userId: string, currentEmail: string, newEmail: string) => {
    setEmailChangeLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('request-email-change', {
        body: { userId, currentEmail, newEmail },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        toast.error(data.error);
        return false;
      }

      toast.success(data.message, {
        description: 'O usuário deve clicar no link enviado para confirmar a alteração.',
        duration: 8000,
        icon: <Mail className="h-5 w-5" />,
      });
      return true;
    } catch (error: any) {
      console.error('Error requesting email change:', error);
      toast.error('Erro ao solicitar alteração de email');
      return false;
    } finally {
      setEmailChangeLoading(false);
    }
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      if (user) {
        // Coletar todas as permissões selecionadas
        const allPermissions = Object.entries(data.permissions).flatMap(([moduleKey, actions]) => 
          actions.map(action => `${moduleKey}:${action}`)
        );

        const newEmail = sanitizeInput(data.email);
        const currentEmail = user.email;
        const emailChanged = newEmail !== currentEmail;
        
        // Se o email mudou, solicitar confirmação por email
        if (emailChanged) {
          const emailChangeRequested = await requestEmailChange(user.id, currentEmail, newEmail);
          if (!emailChangeRequested) {
            return; // Don't proceed if email change request failed
          }
        }
        
        // Atualizar usuário existente (sem alterar o email diretamente)
        const result = await updateUser(user.id, {
          full_name: sanitizeInput(data.fullName),
          // Não passar email aqui - será alterado via confirmação por email
          phone: data.phone ? sanitizeInput(data.phone) : undefined,
          sector: data.sector ? sanitizeInput(data.sector) : undefined,
          role: sanitizeInput(data.role || ''),
          permissions: allPermissions,
        });
        
        if (result.success) {
          // Handle artist linking for Artista role
          if (data.role === 'Artista' && data.linkedArtistId) {
            // Remove existing links and add new one
            await supabase.from('user_artists').delete().eq('user_id', user.id);
            await supabase.from('user_artists').insert({
              user_id: user.id,
              artist_id: data.linkedArtistId,
              access_level: 'owner'
            });
          } else if (data.role !== 'Artista') {
            // Remove artist link if role is not Artista
            await supabase.from('user_artists').delete().eq('user_id', user.id);
          }
          
          if (emailChanged) {
            toast.info('Dados atualizados. Email pendente de confirmação.', {
              description: 'O novo email só será ativado após confirmação.',
            });
          }
          onSuccess();
        }
      } else {
        // Criar novo usuário - gerar senha segura
        const password = generateAndNotifyPassword();
        
        const result = await createUser({
          email: sanitizeInput(data.email),
          password: password,
          full_name: sanitizeInput(data.fullName),
          phone: data.phone ? sanitizeInput(data.phone) : undefined,
          role: sanitizeInput(data.role),
          permissions: [],
        });
        
        if (result.success && result.data?.user?.id) {
          // Link user to artist if role is Artista
          if (data.role === 'Artista' && data.linkedArtistId) {
            await supabase.from('user_artists').insert({
              user_id: result.data.user.id,
              artist_id: data.linkedArtistId,
              access_level: 'owner'
            });
          }
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
          <TabsTrigger value="permissions">Permissões</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Dados do Usuário
              </CardTitle>
              <CardDescription>
                Informações básicas do usuário no sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo *</Label>
                  <Input
                    id="fullName"
                    placeholder="Digite o nome completo"
                    {...register('fullName')}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Digite o email"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="Digite o telefone"
                    {...register('phone')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">
                    Função {watchedPermissionMode === 'automatic' ? '*' : '(opcional)'}
                  </Label>
                  <Select value={watch('role')} onValueChange={(value) => setValue('role', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a função" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Administrador">Administrador</SelectItem>
                      <SelectItem value="Analista Financeiro">Analista Financeiro</SelectItem>
                      <SelectItem value="Artista">Artista</SelectItem>
                      <SelectItem value="Assistente de Produção">Assistente de Produção</SelectItem>
                      <SelectItem value="Coordenador de Eventos">Coordenador de Eventos</SelectItem>
                      <SelectItem value="Designer Gráfico">Designer Gráfico</SelectItem>
                      <SelectItem value="Editor">Editor</SelectItem>
                      <SelectItem value="Especialista em Marketing">Especialista em Marketing</SelectItem>
                      <SelectItem value="Gerente">Gerente</SelectItem>
                      <SelectItem value="Master">Master</SelectItem>
                      <SelectItem value="Produtor Musical">Produtor Musical</SelectItem>
                      <SelectItem value="Social Media">Social Media</SelectItem>
                      <SelectItem value="Técnico de Som">Técnico de Som</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-destructive">{errors.role.message}</p>
                  )}
                </div>

                {watch('role') === 'Artista' && (
                  <div className="space-y-2">
                    <Label htmlFor="linkedArtistId">
                      <div className="flex items-center gap-2">
                        <Music className="h-4 w-4" />
                        Artista Vinculado *
                      </div>
                    </Label>
                    <Select 
                      value={watch('linkedArtistId') || linkedArtistId} 
                      onValueChange={(value) => {
                        setValue('linkedArtistId', value);
                        setLinkedArtistId(value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o artista" />
                      </SelectTrigger>
                      <SelectContent>
                        {artists.map((artist) => (
                          <SelectItem key={artist.id} value={artist.id}>
                            {artist.stage_name || artist.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.linkedArtistId && (
                      <p className="text-sm text-destructive">{errors.linkedArtistId.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      O usuário terá acesso apenas aos dados deste artista.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="sector">
                    Setor {watchedPermissionMode === 'automatic' ? '*' : '(opcional)'}
                  </Label>
                  <Select value={watch('sector')} onValueChange={(value) => setValue('sector', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o setor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Administrativo">Administrativo</SelectItem>
                      <SelectItem value="Artístico">Artístico</SelectItem>
                      <SelectItem value="Comercial">Comercial</SelectItem>
                      <SelectItem value="Eventos">Eventos</SelectItem>
                      <SelectItem value="Financeiro">Financeiro</SelectItem>
                      <SelectItem value="Jurídico">Jurídico</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Produção">Produção</SelectItem>
                      <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
                      <SelectItem value="Técnico">Técnico</SelectItem>
                      <SelectItem value="TI">TI</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.sector && (
                    <p className="text-sm text-destructive">{errors.sector.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select value={watch('status')} onValueChange={(value) => setValue('status', value as 'active' | 'inactive')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configuração de Permissões
              </CardTitle>
              <CardDescription>
                Escolha como configurar as permissões do usuário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Modo de Configuração</Label>
                  <Select value={watchedPermissionMode} onValueChange={(value) => setValue('permissionMode', value as 'automatic' | 'manual')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o modo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="automatic">Automático (baseado na função e setor)</SelectItem>
                      <SelectItem value="manual">Manual (configuração personalizada)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {watchedPermissionMode === 'automatic' && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Modo Automático:</strong> As permissões serão configuradas automaticamente com base na função e setor selecionados.
                    </p>
                  </div>
                )}

                {watchedPermissionMode === 'manual' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        <strong>Modo Manual:</strong> Configure as permissões específicas abaixo ou use um template como ponto de partida.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Template de Permissão (opcional)</Label>
                      <Select value={watchedTemplate || ''} onValueChange={handleTemplateChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um template como base" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(permissionTemplates).map(([key, template]) => (
                            <SelectItem key={key} value={key}>
                              {template.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {watchedPermissionMode === 'manual' && (
            <Card>
              <CardHeader>
                <CardTitle>Permissões Detalhadas</CardTitle>
                <CardDescription>
                  Configure permissões específicas para cada módulo do sistema
                </CardDescription>
              </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {modules.map((module) => (
                  <div key={module.id}>
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="font-medium">{module.label}</h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                      {permissionActions.map((action) => {
                        const Icon = action.icon;
                        const isChecked = watchedPermissions[module.id as keyof typeof watchedPermissions]?.includes(action.id) || false;
                        
                        return (
                          <div key={action.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${module.id}-${action.id}`}
                              checked={isChecked}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(module.id, action.id, checked as boolean)
                              }
                            />
                            <Label 
                              htmlFor={`${module.id}-${action.id}`}
                              className="text-xs cursor-pointer flex items-center gap-1"
                            >
                              <Icon className="h-3 w-3" />
                              {action.label}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                    {module.id !== modules[modules.length - 1].id && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : (user ? 'Atualizar' : 'Criar')} Usuário
        </Button>
      </div>
    </form>
  );
}