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
import { User, Shield, Eye, Plus, Edit, Trash2, CheckCircle, Download, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useUsers } from '@/hooks/useUsers';
import { generateSecureToken, sanitizeInput } from '@/lib/security';
import { useSecurePassword } from '@/hooks/useSecurePassword';

const userSchema = z.object({
  fullName: z.string().min(2, 'Nome completo é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  role: z.string().optional(),
  sector: z.string().optional(),
  status: z.enum(['active', 'inactive']),
  permissionMode: z.enum(['automatic', 'manual']).default('automatic'),
  permissionTemplate: z.string().optional(),
  permissions: z.object({
    artistas: z.array(z.string()).default([]),
    projetos: z.array(z.string()).default([]),
    marketing: z.array(z.string()).default([]),
    financeiro: z.array(z.string()).default([]),
    contratos: z.array(z.string()).default([]),
    agenda: z.array(z.string()).default([]),
    inventario: z.array(z.string()).default([]),
    configuracoes: z.array(z.string()).default([]),
    usuarios: z.array(z.string()).default([]),
  }).default({}),
}).superRefine((data, ctx) => {
  // Role and sector are required only in automatic mode
  if (data.permissionMode === 'automatic') {
    if (!data.role || data.role.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Função é obrigatória no modo automático',
        path: ['role'],
      });
    }
    if (!data.sector || data.sector.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Setor é obrigatório no modo automático',
        path: ['sector'],
      });
    }
  }
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  user?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const permissionActions = [
  { id: 'visualizar', label: 'Visualizar', icon: Eye },
  { id: 'criar', label: 'Criar', icon: Plus },
  { id: 'editar', label: 'Editar', icon: Edit },
  { id: 'excluir', label: 'Excluir', icon: Trash2 },
  { id: 'aprovar', label: 'Aprovar', icon: CheckCircle },
  { id: 'exportar', label: 'Exportar', icon: Download },
  { id: 'gerenciar_permissoes', label: 'Gerenciar Permissões', icon: Settings },
];

const modules = [
  { id: 'artistas', label: 'Artistas' },
  { id: 'projetos', label: 'Projetos' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'financeiro', label: 'Financeiro' },
  { id: 'contratos', label: 'Contratos' },
  { id: 'agenda', label: 'Agenda' },
  { id: 'inventario', label: 'Inventário' },
  { id: 'configuracoes', label: 'Configurações' },
  { id: 'usuarios', label: 'Usuários' },
];

const permissionTemplates = {
  administrador: {
    label: 'Administrador',
    permissions: {
      artistas: ['visualizar', 'criar', 'editar', 'excluir', 'aprovar', 'exportar', 'gerenciar_permissoes'],
      projetos: ['visualizar', 'criar', 'editar', 'excluir', 'aprovar', 'exportar', 'gerenciar_permissoes'],
      marketing: ['visualizar', 'criar', 'editar', 'excluir', 'aprovar', 'exportar', 'gerenciar_permissoes'],
      financeiro: ['visualizar', 'criar', 'editar', 'excluir', 'aprovar', 'exportar', 'gerenciar_permissoes'],
      contratos: ['visualizar', 'criar', 'editar', 'excluir', 'aprovar', 'exportar', 'gerenciar_permissoes'],
      agenda: ['visualizar', 'criar', 'editar', 'excluir', 'aprovar', 'exportar', 'gerenciar_permissoes'],
      inventario: ['visualizar', 'criar', 'editar', 'excluir', 'aprovar', 'exportar', 'gerenciar_permissoes'],
      configuracoes: ['visualizar', 'criar', 'editar', 'excluir', 'aprovar', 'exportar', 'gerenciar_permissoes'],
      usuarios: ['visualizar', 'criar', 'editar', 'excluir', 'aprovar', 'exportar', 'gerenciar_permissoes'],
    }
  },
  artista: {
    label: 'Artista',
    permissions: {
      artistas: ['visualizar'],
      projetos: ['visualizar'],
      marketing: ['visualizar'],
      financeiro: ['visualizar'],
      contratos: ['visualizar'],
      agenda: ['visualizar'],
      inventario: [],
      configuracoes: [],
      usuarios: [],
    }
  },
  editor: {
    label: 'Editor',
    permissions: {
      artistas: ['visualizar', 'criar', 'editar'],
      projetos: ['visualizar', 'criar', 'editar'],
      marketing: ['visualizar', 'criar', 'editar'],
      financeiro: ['visualizar'],
      contratos: ['visualizar', 'criar', 'editar'],
      agenda: ['visualizar', 'criar', 'editar'],
      inventario: ['visualizar', 'criar', 'editar'],
      configuracoes: [],
      usuarios: [],
    }
  },
  financeiro: {
    label: 'Financeiro',
    permissions: {
      artistas: ['visualizar'],
      projetos: ['visualizar'],
      marketing: ['visualizar'],
      financeiro: ['visualizar', 'criar', 'editar', 'excluir', 'aprovar', 'exportar'],
      contratos: ['visualizar', 'criar', 'editar', 'exportar'],
      agenda: ['visualizar'],
      inventario: ['visualizar'],
      configuracoes: [],
      usuarios: [],
    }
  },
  marketing: {
    label: 'Marketing',
    permissions: {
      artistas: ['visualizar'],
      projetos: ['visualizar'],
      marketing: ['visualizar', 'criar', 'editar', 'excluir', 'aprovar', 'exportar'],
      financeiro: ['visualizar'],
      contratos: ['visualizar'],
      agenda: ['visualizar', 'criar', 'editar'],
      inventario: ['visualizar'],
      configuracoes: [],
      usuarios: [],
    }
  },
  visualizador: {
    label: 'Visualizador',
    permissions: {
      artistas: ['visualizar'],
      projetos: ['visualizar'],
      marketing: ['visualizar'],
      financeiro: ['visualizar'],
      contratos: ['visualizar'],
      agenda: ['visualizar'],
      inventario: ['visualizar'],
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
  const { generateAndNotifyPassword } = useSecurePassword();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullName: user?.full_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      role: user?.roles?.[0] || user?.role_display || '',
      sector: user?.sector || '',
      status: user?.isActive === false ? 'inactive' : 'active',
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
      if (user.permissions && user.permissions.length > 0) {
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

        user.permissions.forEach((permission: string) => {
          if (permission.includes(':')) {
            const [module, action] = permission.split(':');
            if (modulePermissions[module]) {
              modulePermissions[module].push(action);
            }
          }
        });

        setValue('permissions', modulePermissions);
        setHasManualPermissionEdits(true);
      }
    }
  }, [user, setValue]);

  const watchedPermissions = watch('permissions');
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
    };
    const templateKey = roleToTemplateMap[watchedRole] || 'visualizador';
    setValue('permissionTemplate', templateKey);
    setValue('permissions', permissionTemplates[templateKey].permissions);
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
    if (template && permissionTemplates[template as keyof typeof permissionTemplates]) {
      const templatePermissions = permissionTemplates[template as keyof typeof permissionTemplates].permissions;
      setValue('permissions', templatePermissions);
    }
  };

  const handlePermissionChange = (module: string, action: string, checked: boolean) => {
    const currentPermissions = watchedPermissions[module as keyof typeof watchedPermissions] || [];
    let newPermissions;
    
    if (checked) {
      newPermissions = [...currentPermissions, action];
    } else {
      newPermissions = currentPermissions.filter(p => p !== action);
    }
    
    setValue(`permissions.${module}` as keyof UserFormData, newPermissions);
    setHasManualPermissionEdits(true);
    // Clear template selection when manually changing permissions
    setValue('permissionTemplate', '');
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      if (user) {
        // Coletar todas as permissões selecionadas
        const allPermissions = Object.entries(data.permissions).flatMap(([moduleKey, actions]) => 
          actions.map(action => `${moduleKey}:${action}`)
        );
        
        // Atualizar usuário existente
        const result = await updateUser(user.id, {
          full_name: sanitizeInput(data.fullName),
          phone: data.phone ? sanitizeInput(data.phone) : undefined,
          sector: data.sector ? sanitizeInput(data.sector) : undefined,
          role: sanitizeInput(data.role),
          permissions: allPermissions,
        });
        
        if (result.success) {
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
        
        if (result.success) {
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
                      <SelectItem value="Master">Master</SelectItem>
                      <SelectItem value="Administrador">Administrador</SelectItem>
                      <SelectItem value="Gerente">Gerente</SelectItem>
                      <SelectItem value="Produtor Musical">Produtor Musical</SelectItem>
                      <SelectItem value="Editor">Editor</SelectItem>
                      <SelectItem value="Analista Financeiro">Analista Financeiro</SelectItem>
                      <SelectItem value="Especialista em Marketing">Especialista em Marketing</SelectItem>
                      <SelectItem value="Assistente de Produção">Assistente de Produção</SelectItem>
                      <SelectItem value="Coordenador de Eventos">Coordenador de Eventos</SelectItem>
                      <SelectItem value="Artista">Artista</SelectItem>
                      <SelectItem value="Técnico de Som">Técnico de Som</SelectItem>
                      <SelectItem value="Designer Gráfico">Designer Gráfico</SelectItem>
                      <SelectItem value="Social Media">Social Media</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-destructive">{errors.role.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sector">
                    Setor {watchedPermissionMode === 'automatic' ? '*' : '(opcional)'}
                  </Label>
                  <Select value={watch('sector')} onValueChange={(value) => setValue('sector', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o setor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Produção">Produção</SelectItem>
                      <SelectItem value="Administrativo">Administrativo</SelectItem>
                      <SelectItem value="Financeiro">Financeiro</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Comercial">Comercial</SelectItem>
                      <SelectItem value="Técnico">Técnico</SelectItem>
                      <SelectItem value="Artístico">Artístico</SelectItem>
                      <SelectItem value="Eventos">Eventos</SelectItem>
                      <SelectItem value="Jurídico">Jurídico</SelectItem>
                      <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
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