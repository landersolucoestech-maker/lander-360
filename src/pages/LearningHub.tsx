import { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StageCard } from '@/components/learning/StageCard';
import { TopicList } from '@/components/learning/TopicList';
import { LessonViewer } from '@/components/learning/LessonViewer';
import { ProgressDashboard } from '@/components/learning/ProgressDashboard';
import {
  useLearningStages,
  useLearningTopics,
  useLearningLessons,
  useLearningProgress,
  useUserBadges,
  LearningStage,
  LearningLesson,
} from '@/hooks/useLearningHub';
import { supabase } from '@/integrations/supabase/client';
import {
  GraduationCap,
  Search,
  BarChart3,
  BookOpen,
  Filter,
  ChevronLeft,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type ViewMode = 'stages' | 'topics' | 'lesson';
type ContentTypeFilter = 'all' | 'video' | 'text' | 'pdf' | 'link' | 'template';
type DifficultyFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';

const LearningHub = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('stages');
  const [selectedStage, setSelectedStage] = useState<LearningStage | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<LearningLesson | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentTypeFilter>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [allLessons, setAllLessons] = useState<Record<string, LearningLesson[]>>({});

  const { data: stages, isLoading: stagesLoading } = useLearningStages();
  const { data: topics, isLoading: topicsLoading } = useLearningTopics(selectedStage?.id);
  const { data: progress = [] } = useLearningProgress();
  const { data: userBadges = [] } = useUserBadges();

  // Fetch all lessons for topics
  useEffect(() => {
    if (topics && topics.length > 0) {
      const fetchLessons = async () => {
        const lessonsMap: Record<string, LearningLesson[]> = {};

        for (const topic of topics) {
          const { data } = await supabase
            .from('learning_lessons')
            .select('*')
            .eq('topic_id', topic.id)
            .eq('is_active', true)
            .order('lesson_order', { ascending: true });

          if (data) {
            lessonsMap[topic.id] = data as LearningLesson[];
          }
        }

        setAllLessons(lessonsMap);
      };

      fetchLessons();
    }
  }, [topics]);

  const handleSelectStage = (stage: LearningStage) => {
    setSelectedStage(stage);
    setViewMode('topics');
  };

  const handleSelectLesson = (lesson: LearningLesson) => {
    setSelectedLesson(lesson);
    setViewMode('lesson');
  };

  const handleBackToStages = () => {
    setSelectedStage(null);
    setSelectedLesson(null);
    setViewMode('stages');
  };

  const handleBackToTopics = () => {
    setSelectedLesson(null);
    setViewMode('topics');
  };

  const getStageProgress = (stageId: string) => {
    // Simplified progress calculation
    const completedCount = progress.filter((p) => p.completed).length;
    return Math.min(Math.round((completedCount / 10) * 100), 100);
  };

  const isStageUnlocked = (stageNumber: number) => {
    if (stageNumber === 1) return true;
    // Unlock next stage if previous has some progress
    const prevStageProgress = getStageProgress(stages?.[stageNumber - 2]?.id || '');
    return prevStageProgress >= 50;
  };

  const isStageCompleted = (stageId: string) => {
    return getStageProgress(stageId) === 100;
  };

  const getAllLessonsFlat = () => {
    return Object.values(allLessons).flat();
  };

  const getNextLesson = () => {
    if (!selectedLesson) return null;
    const allLessonsFlat = getAllLessonsFlat();
    const currentIndex = allLessonsFlat.findIndex((l) => l.id === selectedLesson.id);
    return allLessonsFlat[currentIndex + 1] || null;
  };

  const getPreviousLesson = () => {
    if (!selectedLesson) return null;
    const allLessonsFlat = getAllLessonsFlat();
    const currentIndex = allLessonsFlat.findIndex((l) => l.id === selectedLesson.id);
    return allLessonsFlat[currentIndex - 1] || null;
  };

  const renderContent = () => {
    if (viewMode === 'lesson' && selectedLesson) {
      const isCompleted = progress.some(
        (p) => p.lesson_id === selectedLesson.id && p.completed
      );
      const nextLesson = getNextLesson();
      const prevLesson = getPreviousLesson();

      return (
        <LessonViewer
          lesson={selectedLesson}
          isCompleted={isCompleted}
          onBack={handleBackToTopics}
          onNext={nextLesson ? () => handleSelectLesson(nextLesson) : undefined}
          onPrevious={prevLesson ? () => handleSelectLesson(prevLesson) : undefined}
          hasNext={!!nextLesson}
          hasPrevious={!!prevLesson}
        />
      );
    }

    if (viewMode === 'topics' && selectedStage && topics) {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBackToStages}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Voltar aos Estágios
            </Button>
            <div>
              <h2 className="text-2xl font-bold">
                Estágio {selectedStage.stage_number}: {selectedStage.title}
              </h2>
              <p className="text-muted-foreground">{selectedStage.description}</p>
            </div>
          </div>

          {topicsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : (
            <TopicList
              topics={topics}
              lessons={allLessons}
              progress={progress}
              onSelectLesson={handleSelectLesson}
              selectedLessonId={selectedLesson?.id}
            />
          )}
        </div>
      );
    }

    // Stages view
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stagesLoading ? (
          [1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-64 w-full" />)
        ) : (
          stages?.map((stage) => (
            <StageCard
              key={stage.id}
              stage={stage}
              progress={getStageProgress(stage.id)}
              isUnlocked={isStageUnlocked(stage.stage_number)}
              isCompleted={isStageCompleted(stage.id)}
              onClick={() => handleSelectStage(stage)}
            />
          ))
        )}
      </div>
    );
  };

  const totalLessons = getAllLessonsFlat().length || 24; // Estimate if not loaded

  useEffect(() => {
    document.title = 'Learning Hub | Lander 360º';
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
          <main className="flex-1 p-6 overflow-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h1 className="text-3xl font-bold">Learning Hub</h1>
              </div>
              <p className="text-muted-foreground">
                Trilhas de aprendizado estruturadas para impulsionar sua carreira artística
              </p>
            </div>

            <Tabs defaultValue="courses" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <TabsList>
                  <TabsTrigger value="courses" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Cursos
                  </TabsTrigger>
                  <TabsTrigger value="progress" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Meu Progresso
                  </TabsTrigger>
                </TabsList>

                {viewMode === 'stages' && (
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar conteúdo..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-64"
                      />
                    </div>
                    <Select
                      value={contentTypeFilter}
                      onValueChange={(v) => setContentTypeFilter(v as ContentTypeFilter)}
                    >
                      <SelectTrigger className="w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="video">Vídeo</SelectItem>
                        <SelectItem value="text">Texto</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="link">Link</SelectItem>
                        <SelectItem value="template">Template</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <TabsContent value="courses">{renderContent()}</TabsContent>

              <TabsContent value="progress">
                <ProgressDashboard
                  stages={stages || []}
                  progress={progress}
                  userBadges={userBadges}
                  totalLessons={totalLessons}
                />
              </TabsContent>
            </Tabs>
          </main>
        </div>
    </SidebarProvider>
  );
};

export default LearningHub;
