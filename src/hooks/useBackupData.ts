import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useBackupData = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const exportData = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      // Get user's organization
      const { data: orgMember } = await supabase
        .from('org_members')
        .select('org_id')
        .eq('user_id', user.id)
        .single();

      if (!orgMember) {
        throw new Error('Organização não encontrada');
      }

      const orgId = orgMember.org_id;

      // Export main data tables
      const exportData: Record<string, any> = {
        export_date: new Date().toISOString(),
        org_id: orgId,
        data: {}
      };

      // Export artists
      const { data: artistsData } = await supabase
        .from('artists')
        .select('*')
        .eq('org_id', orgId);
      exportData.data.artists = artistsData || [];

      // Export projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('org_id', orgId);
      exportData.data.projects = projectsData || [];

      // Export contracts
      const { data: contractsData } = await supabase
        .from('contracts')
        .select('*')
        .eq('org_id', orgId);
      exportData.data.contracts = contractsData || [];

      // Export releases
      const { data: releasesData } = await supabase
        .from('releases')
        .select('*')
        .eq('org_id', orgId);
      exportData.data.releases = releasesData || [];

      // Export tracks
      const { data: tracksData } = await supabase
        .from('tracks')
        .select('*')
        .eq('org_id', orgId);
      exportData.data.tracks = tracksData || [];

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
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado.",
        variant: "destructive",
      });
      return;
    }

    setIsBackingUp(true);
    try {
      // Get user's organization
      const { data: orgMember } = await supabase
        .from('org_members')
        .select('org_id')
        .eq('user_id', user.id)
        .single();

      if (!orgMember) {
        throw new Error('Organização não encontrada');
      }

      const orgId = orgMember.org_id;

      // Create comprehensive backup
      const backupData: Record<string, any> = {
        backup_date: new Date().toISOString(),
        org_id: orgId,
        version: '1.0',
        tables: {}
      };

      // Backup artists
      const { data: artistsData } = await supabase
        .from('artists')
        .select('*')
        .eq('org_id', orgId);
      backupData.tables.artists = artistsData || [];

      // Backup projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('org_id', orgId);
      backupData.tables.projects = projectsData || [];

      // Backup contracts
      const { data: contractsData } = await supabase
        .from('contracts')
        .select('*')
        .eq('org_id', orgId);
      backupData.tables.contracts = contractsData || [];

      // Backup releases
      const { data: releasesData } = await supabase
        .from('releases')
        .select('*')
        .eq('org_id', orgId);
      backupData.tables.releases = releasesData || [];

      // Backup tracks
      const { data: tracksData } = await supabase
        .from('tracks')
        .select('*')
        .eq('org_id', orgId);
      backupData.tables.tracks = tracksData || [];

      // Backup contributors
      const { data: contributorsData } = await supabase
        .from('contributors')
        .select('*')
        .eq('org_id', orgId);
      backupData.tables.contributors = contributorsData || [];

      // Backup compositions
      const { data: compositionsData } = await supabase
        .from('compositions')
        .select('*')
        .eq('org_id', orgId);
      backupData.tables.compositions = compositionsData || [];

      // Backup tasks
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('org_id', orgId);
      backupData.tables.tasks = tasksData || [];

      // Backup distributions
      const { data: distributionsData } = await supabase
        .from('distributions')
        .select('*')
        .eq('org_id', orgId);
      backupData.tables.distributions = distributionsData || [];

      // Store backup info locally
      const backups = JSON.parse(localStorage.getItem('systemBackups') || '[]');
      const newBackup = {
        id: Date.now(),
        date: new Date().toISOString(),
        size: JSON.stringify(backupData).length,
        tables: Object.keys(backupData.tables).length
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