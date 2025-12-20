import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UserViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
}

export function UserViewModal({ open, onOpenChange, user }: UserViewModalProps) {
  if (!user) return null;

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (roles: string[]) => {
    if (roles?.includes('admin') || roles?.includes('master')) return 'bg-red-100 text-red-800';
    if (roles?.includes('manager')) return 'bg-blue-100 text-blue-800';
    if (roles?.includes('producer')) return 'bg-green-100 text-green-800';
    if (roles?.includes('artist')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getRoleLabel = (roles: string[]) => {
    if (roles?.includes('master')) return 'Master';
    if (roles?.includes('admin')) return 'Administrador';
    if (roles?.includes('manager')) return 'Gerente';
    if (roles?.includes('producer')) return 'Produtor';
    if (roles?.includes('artist')) return 'Artista';
    return 'Usuário';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Detalhes do Usuário</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header com Avatar */}
          <div className="flex items-center gap-4 pb-4 border-b">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {getUserInitials(user.full_name || 'U')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{user.full_name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className={getRoleColor(user.roles || [])}>
                  {getRoleLabel(user.roles || [])}
                </Badge>
                <Badge variant={user.isActive ? "default" : "secondary"} className={user.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                  {user.isActive ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Informações de Contato */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Informações de Contato</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">E-mail</label>
                <p className="font-medium">{user.email}</p>
              </div>
              {user.phone && (
                <div>
                  <label className="text-sm text-muted-foreground">Telefone</label>
                  <p className="font-medium">{user.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Informações Profissionais */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Informações Profissionais</h3>
            <div className="grid grid-cols-2 gap-4">
              {user.sector && (
                <div>
                  <label className="text-sm text-muted-foreground">Setor</label>
                  <p className="font-medium">{user.sector}</p>
                </div>
              )}
              <div>
                <label className="text-sm text-muted-foreground">Permissões</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {user.roles?.map((role: string) => (
                    <Badge key={role} variant="secondary" className="text-xs">
                      {role}
                    </Badge>
                  )) || <span className="text-muted-foreground">Nenhuma</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Datas */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Informações do Sistema</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Criado em</label>
                <p className="font-medium">
                  {user.created_at ? format(new Date(user.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : '-'}
                </p>
              </div>
              {user.updated_at && (
                <div>
                  <label className="text-sm text-muted-foreground">Última atualização</label>
                  <p className="font-medium">
                    {format(new Date(user.updated_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
