import { useState, useEffect, useCallback } from 'react';
import { TutorialProgress, ACADEMY_TUTORIALS } from '@/types/academy';

const STORAGE_KEY = 'academy-progress';

export function useAcademyProgress() {
  const [progress, setProgress] = useState<Record<string, TutorialProgress>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load progress from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setProgress(JSON.parse(stored));
      } catch (e) {
        console.error('Error loading academy progress:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save progress to localStorage
  const saveProgress = useCallback((newProgress: Record<string, TutorialProgress>) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
    setProgress(newProgress);
  }, []);

  // Toggle checklist item
  const toggleChecklistItem = useCallback((tutorialId: string, itemId: string) => {
    setProgress(prev => {
      const tutorialProgress = prev[tutorialId] || {
        tutorialId,
        completedChecklist: [],
        isCompleted: false
      };

      const completedChecklist = tutorialProgress.completedChecklist.includes(itemId)
        ? tutorialProgress.completedChecklist.filter(id => id !== itemId)
        : [...tutorialProgress.completedChecklist, itemId];

      // Check if all items are completed
      const tutorial = ACADEMY_TUTORIALS.find(t => t.id === tutorialId);
      const allCompleted = tutorial 
        ? tutorial.checklist.every(item => completedChecklist.includes(item.id))
        : false;

      const newProgress = {
        ...prev,
        [tutorialId]: {
          ...tutorialProgress,
          completedChecklist,
          isCompleted: allCompleted,
          completedAt: allCompleted ? new Date().toISOString() : undefined
        }
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
      return newProgress;
    });
  }, []);

  // Mark tutorial as complete
  const markTutorialComplete = useCallback((tutorialId: string) => {
    setProgress(prev => {
      const tutorial = ACADEMY_TUTORIALS.find(t => t.id === tutorialId);
      if (!tutorial) return prev;

      const newProgress = {
        ...prev,
        [tutorialId]: {
          tutorialId,
          completedChecklist: tutorial.checklist.map(item => item.id),
          isCompleted: true,
          completedAt: new Date().toISOString()
        }
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
      return newProgress;
    });
  }, []);

  // Mark tutorial as incomplete
  const markTutorialIncomplete = useCallback((tutorialId: string) => {
    setProgress(prev => {
      const newProgress = {
        ...prev,
        [tutorialId]: {
          tutorialId,
          completedChecklist: [],
          isCompleted: false,
          completedAt: undefined
        }
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
      return newProgress;
    });
  }, []);

  // Get progress for a specific tutorial
  const getTutorialProgress = useCallback((tutorialId: string): TutorialProgress => {
    return progress[tutorialId] || {
      tutorialId,
      completedChecklist: [],
      isCompleted: false
    };
  }, [progress]);

  // Check if StartHub is completed (required for other modules)
  const isStartHubCompleted = progress['start-hub']?.isCompleted || false;

  // Check if a tutorial is unlocked
  const isTutorialUnlocked = useCallback((tutorialId: string): boolean => {
    if (tutorialId === 'start-hub') return true;
    return isStartHubCompleted;
  }, [isStartHubCompleted]);

  // Calculate overall progress
  const overallProgress = {
    total: ACADEMY_TUTORIALS.length,
    completed: Object.values(progress).filter(p => p.isCompleted).length,
    percentage: Math.round(
      (Object.values(progress).filter(p => p.isCompleted).length / ACADEMY_TUTORIALS.length) * 100
    )
  };

  return {
    progress,
    isLoaded,
    toggleChecklistItem,
    markTutorialComplete,
    markTutorialIncomplete,
    getTutorialProgress,
    isTutorialUnlocked,
    isStartHubCompleted,
    overallProgress
  };
}
