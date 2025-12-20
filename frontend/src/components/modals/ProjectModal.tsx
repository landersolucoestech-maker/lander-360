import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProjectForm } from '@/components/forms/ProjectForm';

interface ProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: any;
  mode: 'create' | 'edit';
}

export function ProjectModal({ open, onOpenChange, project, mode }: ProjectModalProps) {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  // Parse audio_files to get full project details for editing
  const getProjectWithParsedData = () => {
    if (!project) return null;
    
    try {
      let details = null;
      if (project.audio_files && typeof project.audio_files === 'string') {
        details = JSON.parse(project.audio_files);
      } else if (project.audio_files && typeof project.audio_files === 'object') {
        details = project.audio_files;
      }
      
      if (details) {
        // Map songs with duration fields
        const mappedSongs = (details.songs || []).map((song: any) => ({
          ...song,
          duration_minutes: song.duration_minutes ?? undefined,
          duration_seconds: song.duration_seconds ?? undefined,
        }));
        
        return {
          ...project,
          release_type: details.release_type || 'single',
          songs: mappedSongs,
          observations: details.observations || '',
        };
      }
    } catch (e) {
      console.error('Error parsing project audio_files:', e);
    }
    
    return project;
  };

  const parsedProject = getProjectWithParsedData();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {mode === 'create' ? 'Novo Projeto' : 'Editar Projeto'}
          </DialogTitle>
        </DialogHeader>
        <ProjectForm
          project={parsedProject}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}