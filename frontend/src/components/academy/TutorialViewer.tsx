import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  ArrowRight, 
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { 
  TutorialModule, 
  TutorialProgress,
  getNextTutorial, 
  getPreviousTutorial
} from '@/types/academy';
import { 
  TutorialIcon, 
  TutorialChecklist,
  TutorialStatusBadge
} from '@/components/academy';
import { SlideViewer } from './SlideViewer';
import { getNarrationScriptByTutorialId } from '@/data/tutorialNarrationScripts';

interface TutorialViewerProps {
  tutorial: TutorialModule;
  progress: TutorialProgress;
  onToggleChecklistItem: (itemId: string) => void;
  onMarkComplete: () => void;
  onMarkIncomplete: () => void;
  onSelectTutorial: (slug: string) => void;
  onBack: () => void;
}

export function TutorialViewer({
  tutorial,
  progress,
  onToggleChecklistItem,
  onMarkComplete,
  onMarkIncomplete,
  onSelectTutorial,
  onBack
}: TutorialViewerProps) {
  const nextTutorial = getNextTutorial(tutorial.slug);
  const previousTutorial = getPreviousTutorial(tutorial.slug);

  const handleToggleComplete = () => {
    if (progress.isCompleted) {
      onMarkIncomplete();
    } else {
      onMarkComplete();
    }
  };

  return (
    <div className="space-y-3">
      {/* Header Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 text-primary shrink-0">
              <TutorialIcon icon={tutorial.icon} size={40} />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  Tutorial #{tutorial.order.toString().padStart(2, '0')}
                </Badge>
                {tutorial.isRequired && (
                  <Badge className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                    Obrigatório
                  </Badge>
                )}
                <TutorialStatusBadge isCompleted={progress.isCompleted} />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">{tutorial.title}</h1>
              <p className="text-lg text-muted-foreground">{tutorial.subtitle}</p>
              <p className="text-muted-foreground">{tutorial.description}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Slides with Narration */}
      {(() => {
        const script = getNarrationScriptByTutorialId(tutorial.id);
        return script?.slides && script.slides.length > 0 ? (
          <SlideViewer 
            slides={script.slides} 
            tutorialTitle={tutorial.title}
            onClose={() => {}}
          />
        ) : null;
      })()}

      {/* Checklist Section */}
      <Card>
        <CardContent className="pt-6">
          <TutorialChecklist
            items={tutorial.checklist}
            progress={progress}
            onToggle={onToggleChecklistItem}
          />
        </CardContent>
      </Card>

      {/* CTA Button */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">Pronto para praticar?</h3>
              <p className="text-sm text-muted-foreground">
                Acesse o módulo e aplique o que aprendeu
              </p>
            </div>
            <Button asChild size="lg" className="gap-2">
              <Link to={tutorial.moduleRoute}>
                <ExternalLink className="h-4 w-4" />
                Ir para o módulo
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mark Complete Button */}
      <div className="flex justify-center">
        <Button
          variant={progress.isCompleted ? "outline" : "default"}
          size="lg"
          onClick={handleToggleComplete}
          className="gap-2"
        >
          <CheckCircle2 className="h-5 w-5" />
          {progress.isCompleted ? 'Marcar como Pendente' : 'Marcar como Concluído'}
        </Button>
      </div>

      <Separator />

      {/* Navigation */}
      <div className="flex items-center justify-between">
        {previousTutorial ? (
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => onSelectTutorial(previousTutorial.slug)}
          >
            <ArrowLeft className="h-4 w-4" />
            <div className="text-left">
              <span className="text-xs text-muted-foreground block">Anterior</span>
              <span>{previousTutorial.title}</span>
            </div>
          </Button>
        ) : (
          <div />
        )}

        {nextTutorial ? (
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => onSelectTutorial(nextTutorial.slug)}
          >
            <div className="text-right">
              <span className="text-xs text-muted-foreground block">Próximo</span>
              <span>{nextTutorial.title}</span>
            </div>
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="default" className="gap-2" onClick={onBack}>
            🎉 Voltar aos Tutoriais
          </Button>
        )}
      </div>
    </div>
  );
}
