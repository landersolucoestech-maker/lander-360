import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface LearningStage {
  id: string;
  stage_number: number;
  title: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  is_active: boolean;
  topics?: LearningTopic[];
}

export interface LearningTopic {
  id: string;
  stage_id: string;
  topic_order: number;
  title: string;
  description: string | null;
  is_active: boolean;
  lessons?: LearningLesson[];
}

export interface LearningLesson {
  id: string;
  topic_id: string;
  lesson_order: number;
  title: string;
  description: string | null;
  content_type: 'video' | 'text' | 'pdf' | 'link' | 'template';
  content_text: string | null;
  content_url: string | null;
  duration_minutes: number | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  is_active: boolean;
}

export interface LearningProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
  started_at: string;
}

export interface LearningNote {
  id: string;
  user_id: string;
  lesson_id: string;
  note_text: string | null;
  is_bookmarked: boolean;
}

export interface LearningBadge {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  stage_id: string | null;
  points: number;
}

export interface LearningUserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: LearningBadge;
}

export const useLearningStages = () => {
  return useQuery({
    queryKey: ['learning-stages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_stages')
        .select('*')
        .eq('is_active', true)
        .order('stage_number', { ascending: true });

      if (error) throw error;
      return data as LearningStage[];
    },
  });
};

export const useLearningTopics = (stageId?: string) => {
  return useQuery({
    queryKey: ['learning-topics', stageId],
    queryFn: async () => {
      let query = supabase
        .from('learning_topics')
        .select('*')
        .eq('is_active', true)
        .order('topic_order', { ascending: true });

      if (stageId) {
        query = query.eq('stage_id', stageId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as LearningTopic[];
    },
    enabled: !!stageId,
  });
};

export const useLearningLessons = (topicId?: string) => {
  return useQuery({
    queryKey: ['learning-lessons', topicId],
    queryFn: async () => {
      let query = supabase
        .from('learning_lessons')
        .select('*')
        .eq('is_active', true)
        .order('lesson_order', { ascending: true });

      if (topicId) {
        query = query.eq('topic_id', topicId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as LearningLesson[];
    },
    enabled: !!topicId,
  });
};

export const useLearningProgress = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['learning-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data as LearningProgress[];
    },
    enabled: !!user?.id,
  });
};

export const useUpdateProgress = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ lessonId, completed }: { lessonId: string; completed: boolean }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data: existing } = await supabase
        .from('learning_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('learning_progress')
          .update({
            completed,
            completed_at: completed ? new Date().toISOString() : null,
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('learning_progress').insert({
          user_id: user.id,
          lesson_id: lessonId,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-progress'] });
      toast.success('Progresso atualizado');
    },
    onError: () => {
      toast.error('Erro ao atualizar progresso');
    },
  });
};

export const useLearningNotes = (lessonId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['learning-notes', lessonId, user?.id],
    queryFn: async () => {
      if (!user?.id || !lessonId) return null;

      const { data, error } = await supabase
        .from('learning_notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as LearningNote | null;
    },
    enabled: !!user?.id && !!lessonId,
  });
};

export const useSaveNote = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      lessonId,
      noteText,
      isBookmarked,
    }: {
      lessonId: string;
      noteText?: string;
      isBookmarked?: boolean;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data: existing } = await supabase
        .from('learning_notes')
        .select('id')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .single();

      if (existing) {
        const updateData: Record<string, unknown> = {};
        if (noteText !== undefined) updateData.note_text = noteText;
        if (isBookmarked !== undefined) updateData.is_bookmarked = isBookmarked;

        const { error } = await supabase
          .from('learning_notes')
          .update(updateData)
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('learning_notes').insert({
          user_id: user.id,
          lesson_id: lessonId,
          note_text: noteText || null,
          is_bookmarked: isBookmarked || false,
        });

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['learning-notes', variables.lessonId] });
      toast.success('Salvo com sucesso');
    },
    onError: () => {
      toast.error('Erro ao salvar');
    },
  });
};

export const useLearningBadges = () => {
  return useQuery({
    queryKey: ['learning-badges'],
    queryFn: async () => {
      const { data, error } = await supabase.from('learning_badges').select('*');

      if (error) throw error;
      return data as LearningBadge[];
    },
  });
};

export const useUserBadges = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['learning-user-badges', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('learning_user_badges')
        .select('*, badge:learning_badges(*)')
        .eq('user_id', user.id);

      if (error) throw error;
      return data as LearningUserBadge[];
    },
    enabled: !!user?.id,
  });
};

export const useAwardBadge = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (badgeId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase.from('learning_user_badges').insert({
        user_id: user.id,
        badge_id: badgeId,
      });

      if (error && error.code !== '23505') throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-user-badges'] });
      toast.success('🎉 Novo badge conquistado!');
    },
  });
};

export const useStageProgress = (stageId?: string) => {
  const { data: topics } = useLearningTopics(stageId);
  const { data: progress } = useLearningProgress();

  if (!stageId || !topics || !progress) {
    return { completedLessons: 0, totalLessons: 0, percentage: 0 };
  }

  const topicIds = topics.map((t) => t.id);
  const completedLessons = progress.filter(
    (p) => p.completed && topicIds.some((tid) => p.lesson_id.includes(tid))
  ).length;

  return {
    completedLessons,
    totalLessons: topics.length * 3, // Estimate
    percentage: topics.length > 0 ? Math.round((completedLessons / (topics.length * 3)) * 100) : 0,
  };
};
