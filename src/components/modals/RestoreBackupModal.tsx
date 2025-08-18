import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, FileText, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RestoreBackupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RestoreBackupModal = ({ open, onOpenChange }: RestoreBackupModalProps) => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupPreview, setBackupPreview] = useState<any>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo JSON válido.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);

    // Preview backup contents
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (data.backup_date && data.tables) {
        setBackupPreview(data);
      } else {
        toast({
          title: "Aviso",
          description: "Arquivo pode não ser um backup válido do sistema.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível ler o arquivo de backup.",
        variant: "destructive",
      });
    }
  };

  const handleRestore = async () => {
    if (!selectedFile || !backupPreview) return;

    setIsRestoring(true);
    try {
      // This is a simplified restore - in a real system, you'd want to:
      // 1. Validate backup integrity
      // 2. Create a pre-restore backup
      // 3. Restore data in correct order respecting foreign keys
      // 4. Validate restored data
      
      toast({
        title: "Funcionalidade em Desenvolvimento",
        description: "A restauração de backup será implementada em versões futuras. O arquivo foi validado com sucesso.",
      });

      onOpenChange(false);
      setSelectedFile(null);
      setBackupPreview(null);
    } catch (error) {
      console.error('Restore error:', error);
      toast({
        title: "Erro",
        description: "Falha ao restaurar backup. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Restaurar Backup
          </DialogTitle>
          <DialogDescription>
            Selecione um arquivo de backup para restaurar os dados do sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="backup-file">Arquivo de Backup</Label>
            <Input
              id="backup-file"
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="cursor-pointer"
            />
          </div>

          {selectedFile && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{selectedFile.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Tamanho: {formatFileSize(selectedFile.size)}
              </p>
              
              {backupPreview && (
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Data do backup: {new Date(backupPreview.backup_date).toLocaleString('pt-BR')}</p>
                  <p>Tabelas: {Object.keys(backupPreview.tables).length}</p>
                  <p>Versão: {backupPreview.version || 'Não especificada'}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg dark:bg-orange-950 dark:border-orange-800">
            <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-orange-700 dark:text-orange-300">
              <p className="font-medium mb-1">Atenção:</p>
              <p>A restauração substituirá todos os dados atuais. Certifique-se de ter um backup atual antes de prosseguir.</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isRestoring}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleRestore}
            disabled={!selectedFile || !backupPreview || isRestoring}
          >
            {isRestoring ? 'Restaurando...' : 'Restaurar Backup'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};