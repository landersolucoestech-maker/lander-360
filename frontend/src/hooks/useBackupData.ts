import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useBackupData = () => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const exportData = async () => {
    setIsExporting(true);
    try {
      // Export main data tables
      const exportData: Record<string, unknown> = {
        export_date: new Date().toISOString(),
        data: {}
      };

      // Export artists
      const { data: artistsData } = await supabase
        .from('artists')
        .select('*');
      (exportData.data as Record<string, unknown>).artists = artistsData || [];

      // Export projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*');
      (exportData.data as Record<string, unknown>).projects = projectsData || [];

      // Export contracts
      const { data: contractsData } = await supabase
        .from('contracts')
        .select('*');
      (exportData.data as Record<string, unknown>).contracts = contractsData || [];

      // Export releases
      const { data: releasesData } = await supabase
        .from('releases')
        .select('*');
      (exportData.data as Record<string, unknown>).releases = releasesData || [];

      // Export tracks
      const { data: tracksData } = await supabase
        .from('tracks')
        .select('*');
      (exportData.data as Record<string, unknown>).tracks = tracksData || [];

      // Create downloadable file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Sucesso",
        description: "Dados exportados com sucesso!",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Erro",
        description: "Falha ao exportar dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const createBackup = async () => {
    setIsBackingUp(true);
    try {
      // Create comprehensive backup
      const backupData: Record<string, unknown> = {
        backup_date: new Date().toISOString(),
        version: '1.0',
        tables: {}
      };

      const tables = backupData.tables as Record<string, unknown>;

      // Backup artists
      const { data: artistsData } = await supabase
        .from('artists')
        .select('*');
      tables.artists = artistsData || [];

      // Backup projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*');
      tables.projects = projectsData || [];

      // Backup contracts
      const { data: contractsData } = await supabase
        .from('contracts')
        .select('*');
      tables.contracts = contractsData || [];

      // Backup releases
      const { data: releasesData } = await supabase
        .from('releases')
        .select('*');
      tables.releases = releasesData || [];

      // Backup tracks
      const { data: tracksData } = await supabase
        .from('tracks')
        .select('*');
      tables.tracks = tracksData || [];

      // Backup contributors
      const { data: contributorsData } = await supabase
        .from('contributors')
        .select('*');
      tables.contributors = contributorsData || [];

      // Backup compositions
      const { data: compositionsData } = await supabase
        .from('compositions')
        .select('*');
      tables.compositions = compositionsData || [];

      // Backup tasks
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*');
      tables.tasks = tasksData || [];

      // Backup distributions
      const { data: distributionsData } = await supabase
        .from('distributions')
        .select('*');
      tables.distributions = distributionsData || [];

      // Store backup info locally
      const backups = JSON.parse(localStorage.getItem('systemBackups') || '[]');
      const newBackup = {
        id: Date.now(),
        date: new Date().toISOString(),
        size: JSON.stringify(backupData).length,
        tables: Object.keys(tables).length
      };
      
      backups.unshift(newBackup);
      localStorage.setItem('systemBackups', JSON.stringify(backups.slice(0, 10))); // Keep last 10

      // Create downloadable backup file
      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Sucesso",
        description: "Backup criado e baixado com sucesso!",
      });
    } catch (error) {
      console.error('Backup error:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar backup. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  const getLastBackupInfo = () => {
    const backups = JSON.parse(localStorage.getItem('systemBackups') || '[]');
    return backups[0] || null;
  };

  return {
    exportData,
    createBackup,
    isExporting,
    isBackingUp,
    getLastBackupInfo,
  };
};
