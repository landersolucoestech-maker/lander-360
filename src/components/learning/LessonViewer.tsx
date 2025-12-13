import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  LearningLesson,
  LearningNote,
  useUpdateProgress,
  useSaveNote,
  useLearningNotes,
} from '@/hooks/useLearningHub';
import {
  Play,
  FileText,
  Link as LinkIcon,
  File,
  Layout,
  CheckCircle,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LessonViewerProps {
  lesson: LearningLesson;
  isCompleted: boolean;
  onBack: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

const contentTypeIcons: Record<string, React.ElementType> = {
  video: Play,
  text: FileText,
  pdf: File,
  link: LinkIcon,
  template: Layout,
};

const contentTypeLabels: Record<string, string> = {
  video: 'Vídeo',
  text: 'Texto',
  pdf: 'PDF',
  link: 'Link',
  template: 'Template',
};

export const LessonViewer = ({
  lesson,
  isCompleted,
  onBack,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
}: LessonViewerProps) => {
  const { data: noteData } = useLearningNotes(lesson.id);
  const updateProgress = useUpdateProgress();
  const saveNote = useSaveNote();

  const [noteText, setNoteText] = useState(noteData?.note_text || '');
  const [isBookmarked, setIsBookmarked] = useState(noteData?.is_bookmarked || false);

  const Icon = contentTypeIcons[lesson.content_type] || FileText;

  const handleMarkComplete = () => {
    updateProgress.mutate({ lessonId: lesson.id, completed: !isCompleted });
  };

  const handleSaveNote = () => {
    saveNote.mutate({ lessonId: lesson.id, noteText });
  };

  const handleToggleBookmark = () => {
    const newValue = !isBookmarked;
    setIsBookmarked(newValue);
    saveNote.mutate({ lessonId: lesson.id, isBookmarked: newValue });
  };

  const renderContent = () => {
    switch (lesson.content_type) {
      case 'video':
        if (lesson.content_url) {
          const isYouTube = lesson.content_url.includes('youtube') || lesson.content_url.includes('youtu.be');
          const isVimeo = lesson.content_url.includes('vimeo');

          if (isYouTube || isVimeo) {
            let embedUrl = lesson.content_url;
            if (isYouTube) {
              const videoId = lesson.content_url.match(
                /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
              )?.[1];
              embedUrl = `https://www.youtube.com/embed/${videoId}`;
            }

            return (
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            );
          }

          return (
            <video
              src={lesson.content_url}
              controls
              className="w-full rounded-lg"
            />
          );
        }
        return <p className="text-muted-foreground">Vídeo não disponível</p>;

      case 'pdf':
        if (lesson.content_url) {
          return (
            <div className="space-y-4">
              <iframe
                src={lesson.content_url}
                className="w-full h-[600px] rounded-lg border"
              />
              <Button variant="outline" asChild>
                <a href={lesson.content_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir PDF em nova aba
                </a>
              </Button>
            </div>
          );
        }
        return <p className="text-muted-foreground">PDF não disponível</p>;

      case 'link':
        if (lesson.content_url) {
          return (
            <Button variant="outline" size="lg" asChild>
              <a href={lesson.content_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Acessar conteúdo externo
              </a>
            </Button>
          );
        }
        return <p className="text-muted-foreground">Link não disponível</p>;

      case 'template':
        return (
          <div className="space-y-4">
            {lesson.content_text && (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: lesson.content_text }} />
              </div>
            )}
            {lesson.content_url && (
              <Button variant="outline" asChild>
                <a href={lesson.content_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Baixar template
                </a>
              </Button>
            )}
          </div>
        );

      case 'text':
      default:
        return (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {lesson.content_text ? (
              <div dangerouslySetInnerHTML={{ __html: lesson.content_text }} />
            ) : (
              <p className="text-muted-foreground">Conteúdo em breve...</p>
            )}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleBookmark}
            className={cn(isBookmarked && 'text-yellow-500')}
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-5 w-5" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Icon className="h-3 w-3" />
              {contentTypeLabels[lesson.content_type]}
            </Badge>
            {lesson.duration_minutes && (
              <Badge variant="secondary">{lesson.duration_minutes} min</Badge>
            )}
            <Badge
              variant="outline"
              className={cn(
                lesson.difficulty === 'beginner' && 'border-green-500 text-green-500',
                lesson.difficulty === 'intermediate' && 'border-yellow-500 text-yellow-500',
                lesson.difficulty === 'advanced' && 'border-red-500 text-red-500'
              )}
            >
              {lesson.difficulty === 'beginner' && 'Iniciante'}
              {lesson.difficulty === 'intermediate' && 'Intermediário'}
              {lesson.difficulty === 'advanced' && 'Avançado'}
            </Badge>
          </div>
          <CardTitle className="text-2xl">{lesson.title}</CardTitle>
          {lesson.description && (
            <p className="text-muted-foreground">{lesson.description}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {renderContent()}

          <Separator />

          {/* Mark Complete */}
          <div className="flex items-center justify-between">
            <Button
              variant={isCompleted ? 'outline' : 'default'}
              onClick={handleMarkComplete}
              disabled={updateProgress.isPending}
            >
              <CheckCircle
                className={cn('h-4 w-4 mr-2', isCompleted && 'text-green-500')}
              />
              {isCompleted ? 'Concluído' : 'Marcar como concluído'}
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onPrevious}
                disabled={!hasPrevious}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
              <Button onClick={onNext} disabled={!hasNext}>
                Próxima
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Minhas Anotações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Escreva suas anotações, insights ou dúvidas sobre esta aula..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={4}
          />
          <Button onClick={handleSaveNote} disabled={saveNote.isPending}>
            Salvar Anotações
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
