import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AttachmentUploadProps {
  attachmentUrl?: string;
  attachmentName?: string | null;
  onUpload: (url: string, name: string) => void;
  onRemove: () => void;
}

export const AttachmentUpload: React.FC<AttachmentUploadProps> = ({
  attachmentUrl,
  attachmentName,
  onUpload,
  onRemove
}) => {
  const { toast } = useToast();
  const [uploading, setUploading] = React.useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Tipo de arquivo inválido',
        description: 'Apenas PDF, JPG, PNG e WebP são permitidos.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O arquivo deve ter no máximo 10MB.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `financial-attachments/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('artist-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('artist-documents')
        .getPublicUrl(filePath);

      onUpload(publicUrl, file.name);
      toast({
        title: 'Upload concluído',
        description: 'Comprovante anexado com sucesso.',
      });
    } catch (error) {
      console.error('Error uploading attachment:', error);
      toast({
        title: 'Erro no upload',
        description: 'Falha ao anexar comprovante. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Anexar Comprovante (PDF, JPG, PNG)</Label>
      <div className="flex items-center gap-4">
        {!attachmentUrl ? (
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleUpload}
              disabled={uploading}
              className="max-w-xs"
            />
            {uploading && (
              <span className="text-sm text-muted-foreground">Carregando...</span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
            <Upload className="h-4 w-4" />
            <span className="text-sm">{attachmentName || 'Arquivo anexado'}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
