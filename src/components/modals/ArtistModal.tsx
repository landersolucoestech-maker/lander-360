import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArtistForm } from '@/components/forms/ArtistForm';

interface ArtistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artist?: any;
  mode: 'create' | 'edit';
}

export function ArtistModal({ open, onOpenChange, artist, mode }: ArtistModalProps) {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {mode === 'create' ? 'Novo Artista' : 'Editar Artista'}
          </DialogTitle>
        </DialogHeader>
        <ArtistForm
          artist={artist}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}