import React, { useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Music, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export interface AudioFile {
  name?: string;
  url?: string;
  size?: number;
  path?: string;
}

interface AudioUploaderProps {
  files: AudioFile[];
  onChange: (files: AudioFile[]) => void;
  projectId?: string;
  songIndex: number;
}

export function AudioUploader({ files, onChange, projectId, songIndex }: AudioUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-wav'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    for (const file of Array.from(selectedFiles)) {
      if (!validTypes.includes(file.type)) {
        toast.error(`Formato inválido: ${file.name}. Use MP3 ou WAV.`);
        continue;
      }

      if (file.size > maxSize) {
        toast.error(`Arquivo muito grande: ${file.name}. Máximo 50MB.`);
        continue;
      }

      await uploadFile(file);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${projectId || 'new'}/song_${songIndex}/${timestamp}_${sanitizedName}`;

      // Simulate progress (Supabase doesn't have built-in progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const { data, error } = await supabase.storage
        .from('project-audio')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      clearInterval(progressInterval);

      if (error) {
        throw error;
      }

      // Get signed URL for private bucket
      const { data: urlData } = await supabase.storage
        .from('project-audio')
        .createSignedUrl(filePath, 60 * 60 * 24 * 7); // 7 days

      const newFile: AudioFile = {
        name: file.name,
        url: urlData?.signedUrl || '',
        size: file.size,
        path: filePath,
      };

      setUploadProgress(100);
      onChange([...files, newFile]);
      toast.success(`${file.name} enviado com sucesso!`);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Erro ao enviar ${file.name}: ${error.message}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = async (fileToRemove: AudioFile) => {
    try {
      // Remove from storage
      if (fileToRemove.path) {
        const { error } = await supabase.storage
          .from('project-audio')
          .remove([fileToRemove.path]);

        if (error) {
          console.error('Error removing file:', error);
        }
      }

      // Remove from list
      onChange(files.filter(f => f.path !== fileToRemove.path));
      toast.success('Arquivo removido');
    } catch (error) {
      console.error('Error removing file:', error);
      toast.error('Erro ao remover arquivo');
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const input = fileInputRef.current;
      if (input) {
        const dataTransfer = new DataTransfer();
        Array.from(droppedFiles).forEach(file => dataTransfer.items.add(file));
        input.files = dataTransfer.files;
        await handleFileSelect({ target: input } as any);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".mp3,.wav,audio/mpeg,audio/wav"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          uploading 
            ? 'border-primary/50 bg-primary/5 cursor-not-allowed' 
            : 'border-border hover:border-primary/50 hover:bg-accent/50'
        }`}
      >
        {uploading ? (
          <div className="space-y-3">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Enviando arquivo...</p>
            <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
          </div>
        ) : (
          <>
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Clique para selecionar arquivos ou arraste e solte aqui
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Formatos aceitos: MP3, WAV (máx. 50MB)
            </p>
          </>
        )}
      </div>

      {/* Lista de arquivos enviados */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={file.path || index}
              className="flex items-center justify-between p-3 bg-accent/30 rounded-lg border border-border"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Music className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{file.name || 'Arquivo de áudio'}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {file.url && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    asChild
                  >
                    <a href={file.url} target="_blank" rel="noopener noreferrer">
                      Ouvir
                    </a>
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(file)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
