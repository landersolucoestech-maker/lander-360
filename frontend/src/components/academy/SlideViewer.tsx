import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  VolumeX,
  Play,
  Pause,
  X,
  Maximize2,
  SkipBack,
  SkipForward,
  Loader2
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { TutorialSlide } from '@/data/tutorialNarrationScripts';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SlideViewerProps {
  slides: TutorialSlide[];
  tutorialTitle: string;
  className?: string;
  onClose?: () => void;
}

export function SlideViewer({ 
  slides, 
  tutorialTitle,
  className,
  onClose 
}: SlideViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentSlide = slides[currentIndex];

  // Clean up audio when slide changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setAudioProgress(0);
  }, [currentIndex]);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(slides.length - 1, prev + 1));
  };

  const handleSlideClick = (index: number) => {
    setCurrentIndex(index);
  };

  const generateAndPlayAudio = async () => {
    if (!currentSlide?.narrationText) {
      toast.error('Narração não disponível para este slide');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('tutorial-tts', {
        body: { text: currentSlide.narrationText }
      });

      if (error) throw error;

      if (data?.audioContent) {
        const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
        const audio = new Audio(audioUrl);
        audio.volume = isMuted ? 0 : volume / 100;
        
        audio.addEventListener('timeupdate', () => {
          if (audio.duration) {
            setAudioProgress((audio.currentTime / audio.duration) * 100);
          }
        });

        audio.addEventListener('ended', () => {
          setIsPlaying(false);
          setAudioProgress(100);
          // Auto-advance to next slide
          if (currentIndex < slides.length - 1) {
            setTimeout(() => {
              handleNext();
            }, 500);
          }
        });

        audioRef.current = audio;
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('TTS Error:', error);
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Erro ao gerar áudio. Tente novamente.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlay = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else if (audioRef.current && audioRef.current.paused) {
      await audioRef.current.play();
      setIsPlaying(true);
    } else {
      await generateAndPlayAudio();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!slides || slides.length === 0) {
    return null;
  }

  const progressPercentage = Math.round(((currentIndex + 1) / slides.length) * 100);

  return (
    <div className={cn(
      "bg-background border rounded-lg overflow-hidden",
      isFullscreen && "fixed inset-0 z-50 rounded-none",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Tour: {tutorialTitle}</span>
          <span className="text-sm text-muted-foreground">
            Slide {currentIndex + 1} de {slides.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleFullscreen}>
            <Maximize2 className="h-4 w-4" />
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row">
        {/* Left: Screenshot/Image */}
        <div className="flex-1 bg-muted/30 p-4 flex items-center justify-center min-h-[300px] lg:min-h-[400px]">
          {currentSlide.imageUrl ? (
            <img 
              src={currentSlide.imageUrl} 
              alt={currentSlide.title}
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            />
          ) : (
            <div className="w-full h-full min-h-[250px] bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted-foreground/20 rounded-lg flex items-center justify-center">
                  <Play className="h-8 w-8" />
                </div>
                <p className="text-sm">Preview do módulo</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Info Panel */}
        <div className="w-full lg:w-80 xl:w-96 border-l bg-card p-4 flex flex-col">
          {/* Title and Description */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-3">{currentSlide.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {currentSlide.description}
            </p>
          </div>

          {/* Progress */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progresso do Slideshow</span>
              <span className="text-sm text-primary font-semibold">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-1.5" />
          </div>

          {/* Thumbnail Navigation */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 shrink-0"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex-1 overflow-x-auto">
                <div className="flex gap-2">
                  {slides.map((slide, index) => (
                    <button
                      key={index}
                      onClick={() => handleSlideClick(index)}
                      className={cn(
                        "w-12 h-8 rounded border-2 shrink-0 transition-all overflow-hidden",
                        currentIndex === index 
                          ? "border-primary ring-1 ring-primary" 
                          : "border-border hover:border-muted-foreground"
                      )}
                    >
                      {slide.imageUrl ? (
                        <img 
                          src={slide.imageUrl} 
                          alt={`Slide ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-[10px] text-muted-foreground">{index + 1}</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 shrink-0"
                onClick={handleNext}
                disabled={currentIndex === slides.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-t">
        {/* Volume Controls */}
        <div className="flex items-center gap-2 w-48">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleMute}>
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={100}
            step={1}
            onValueChange={(value) => setVolume(value[0])}
            className="w-24"
          />
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="default" 
            size="icon" 
            className="h-10 w-10 rounded-full"
            onClick={togglePlay}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={handleNext}
            disabled={currentIndex === slides.length - 1}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Audio Progress */}
        <div className="w-48">
          {(isPlaying || audioProgress > 0) && (
            <Progress value={audioProgress} className="h-1" />
          )}
        </div>
      </div>
    </div>
  );
}

export default SlideViewer;
