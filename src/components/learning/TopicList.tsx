import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LearningTopic, LearningLesson, LearningProgress } from '@/hooks/useLearningHub';
import { ChevronRight, CheckCircle, Circle, Play, FileText, Link, File, Layout } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopicListProps {
  topics: LearningTopic[];
  lessons: Record<string, LearningLesson[]>;
  progress: LearningProgress[];
  onSelectLesson: (lesson: LearningLesson) => void;
  selectedLessonId?: string;
}

const contentTypeIcons: Record<string, React.ElementType> = {
  video: Play,
  text: FileText,
  pdf: File,
  link: Link,
  template: Layout,
};

export const TopicList = ({
  topics,
  lessons,
  progress,
  onSelectLesson,
  selectedLessonId,
}: TopicListProps) => {
  const isLessonCompleted = (lessonId: string) => {
    return progress.some((p) => p.lesson_id === lessonId && p.completed);
  };

  const getTopicProgress = (topicId: string) => {
    const topicLessons = lessons[topicId] || [];
    if (topicLessons.length === 0) return 0;

    const completed = topicLessons.filter((l) => isLessonCompleted(l.id)).length;
    return Math.round((completed / topicLessons.length) * 100);
  };

  return (
    <div className="space-y-4">
      {topics.map((topic) => {
        const topicLessons = lessons[topic.id] || [];
        const topicProgress = getTopicProgress(topic.id);

        return (
          <Card key={topic.id} className="overflow-hidden">
            <CardHeader className="pb-3 bg-muted/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">
                    {topic.topic_order}.
                  </span>
                  {topic.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {topicProgress}%
                  </span>
                  <Progress value={topicProgress} className="w-20 h-2" />
                </div>
              </div>
              {topic.description && (
                <p className="text-sm text-muted-foreground">{topic.description}</p>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {topicLessons.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  Nenhuma aula disponível ainda
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {topicLessons.map((lesson) => {
                    const completed = isLessonCompleted(lesson.id);
                    const isSelected = selectedLessonId === lesson.id;
                    const Icon = contentTypeIcons[lesson.content_type] || FileText;

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => onSelectLesson(lesson)}
                        className={cn(
                          'w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-muted/50',
                          isSelected && 'bg-primary/10 border-l-2 border-l-primary'
                        )}
                      >
                        <div
                          className={cn(
                            'flex-shrink-0',
                            completed ? 'text-green-500' : 'text-muted-foreground'
                          )}
                        >
                          {completed ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <Circle className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className={cn('font-medium', completed && 'text-muted-foreground')}>
                              {lesson.title}
                            </span>
                          </div>
                          {lesson.duration_minutes && (
                            <span className="text-xs text-muted-foreground">
                              {lesson.duration_minutes} min
                            </span>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs',
                            lesson.difficulty === 'beginner' && 'border-green-500 text-green-500',
                            lesson.difficulty === 'intermediate' && 'border-yellow-500 text-yellow-500',
                            lesson.difficulty === 'advanced' && 'border-red-500 text-red-500'
                          )}
                        >
                          {lesson.difficulty === 'beginner' && 'Iniciante'}
                          {lesson.difficulty === 'intermediate' && 'Intermediário'}
                          {lesson.difficulty === 'advanced' && 'Avançado'}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
