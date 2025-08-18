import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Download, Upload, RefreshCw, Trash2, HardDrive, Calendar, Database, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBackupData } from '@/hooks/useBackupData';

interface BackupRecord {
  id: string;
  name: string;
  type: 'automatic' | 'manual';
  size: string;
  status: 'completed' | 'running' | 'failed';
  created_at: string;
  tables_included: string[];
}

export const BackupRestore = () => {
  const { toast } = useToast();
  const { createBackup, isBackingUp, getLastBackupInfo } = useBackupData();
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Mock backup records - replace with real data
  const [backups] = useState<BackupRecord[]>([
    {
      id: '1',
      name: 'Backup Automático - 15/02/2024',
      type: 'automatic',
      size: '2.5 MB',
      status: 'completed',
      created_at: '2024-02-15T06:00:00Z',
      tables_included: ['artists', 'projects', 'contracts', 'releases', 'tracks']
    },
    {
      id: '2',
      name: 'Backup Manual - 14/02/2024',
      type: 'manual',
      size: '2.3 MB',
      status: 'completed',
      created_at: '2024-02-14T15:30:00Z',
      tables_included: ['artists', 'projects', 'contracts', 'releases']
    },
    {
      id: '3',
      name: 'Backup Automático - 14/02/2024',
      type: 'automatic',
      size: '2.4 MB',
      status: 'completed',
      created_at: '2024-02-14T06:00:00Z',
      tables_included: ['artists', 'projects', 'contracts', 'releases', 'tracks']
    }
  ]);

  const handleCreateBackup = async () => {
    try {
      await createBackup();
    } catch (error) {
      toast({
        title: "Erro no backup",
        description: "Falha ao criar backup. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleFileRestore = () => {
    if (!selectedFile) {
      toast({
        title: "Arquivo não selecionado",
        description: "Selecione um arquivo de backup para restaurar.",
        variant: "destructive"
      });
      return;
    }

    setIsRestoring(true);
    setRestoreProgress(0);

    // Simulate restore process
    const interval = setInterval(() => {
      setRestoreProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRestoring(false);
          toast({
            title: "Restauração concluída",
            description: "Os dados foram restaurados com sucesso."
          });
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const handleRestoreBackup = (backupId: string) => {
    const backup = backups.find(b => b.id === backupId);
    if (!backup) return;

    setIsRestoring(true);
    setRestoreProgress(0);

    // Simulate restore process
    const interval = setInterval(() => {
      setRestoreProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRestoring(false);
          toast({
            title: "Restauração concluída",
            description: `Backup "${backup.name}" foi restaurado com sucesso.`
          });
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const handleDeleteBackup = (backupId: string) => {
    // Delete backup logic here
    toast({
      title: "Backup excluído",
      description: "O backup foi removido com sucesso."
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      running: 'secondary',
      failed: 'destructive'
    } as const;
    
    const labels = {
      completed: 'Concluído',
      running: 'Em andamento',
      failed: 'Falhou'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    return (
      <Badge variant={type === 'automatic' ? 'outline' : 'secondary'}>
        {type === 'automatic' ? 'Automático' : 'Manual'}
      </Badge>
    );
  };

  const lastBackup = getLastBackupInfo();
  const totalBackups = backups.length;
  const totalSize = backups.reduce((sum, backup) => {
    const size = parseFloat(backup.size.replace(' MB', ''));
    return sum + size;
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Backup e Restauração</h2>
        <p className="text-muted-foreground">Gerencie backups e restaure dados do sistema</p>
      </div>

      {/* Estatísticas de Backup */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Backups</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBackups}</div>
            <p className="text-xs text-muted-foreground">
              Backups disponíveis
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Espaço Utilizado</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSize.toFixed(1)} MB</div>
            <p className="text-xs text-muted-foreground">
              Espaço total dos backups
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Último Backup</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lastBackup ? new Date(lastBackup.date).toLocaleDateString('pt-BR') : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {lastBackup ? `${lastBackup.fileCount} arquivos` : 'Nenhum backup'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status do Sistema</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Ativo</div>
            <p className="text-xs text-muted-foreground">
              Sistema funcionando
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ações de Backup */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Criar Backup
            </CardTitle>
            <CardDescription>
              Crie um backup manual dos dados do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tabelas a incluir:</Label>
              <div className="flex flex-wrap gap-2">
                {['artists', 'projects', 'contracts', 'releases', 'tracks', 'users'].map((table) => (
                  <Badge key={table} variant="outline">
                    {table}
                  </Badge>
                ))}
              </div>
            </div>
            <Button 
              onClick={handleCreateBackup} 
              disabled={isBackingUp}
              className="w-full"
            >
              {isBackingUp ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Criando Backup...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Criar Backup Agora
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Restaurar Dados
            </CardTitle>
            <CardDescription>
              Restaure dados a partir de um arquivo de backup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Arquivo de Backup</Label>
              <Input
                type="file"
                accept=".json,.zip"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </div>
            
            {isRestoring && (
              <div className="space-y-2">
                <Label>Progresso da Restauração</Label>
                <Progress value={restoreProgress} className="w-full" />
                <p className="text-sm text-muted-foreground">
                  {restoreProgress}% concluído
                </p>
              </div>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  disabled={!selectedFile || isRestoring}
                  className="w-full"
                >
                  {isRestoring ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Restaurando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Restaurar Arquivo
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    Confirmar Restauração
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação irá substituir todos os dados atuais pelos dados do backup. 
                    Esta operação não pode ser desfeita. Tem certeza que deseja continuar?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleFileRestore}>
                    Sim, Restaurar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Backups */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Backups</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os backups criados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tabelas</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backups.map((backup) => (
                <TableRow key={backup.id}>
                  <TableCell className="font-medium">{backup.name}</TableCell>
                  <TableCell>{getTypeBadge(backup.type)}</TableCell>
                  <TableCell>{backup.size}</TableCell>
                  <TableCell>{getStatusBadge(backup.status)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {backup.tables_included.slice(0, 2).map((table) => (
                        <Badge key={table} variant="outline" className="text-xs">
                          {table}
                        </Badge>
                      ))}
                      {backup.tables_included.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{backup.tables_included.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(backup.created_at).toLocaleString('pt-BR')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Restauração</AlertDialogTitle>
                            <AlertDialogDescription>
                              Deseja restaurar o backup "{backup.name}"? Esta ação irá substituir todos os dados atuais.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRestoreBackup(backup.id)}>
                              Restaurar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o backup "{backup.name}"? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteBackup(backup.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};