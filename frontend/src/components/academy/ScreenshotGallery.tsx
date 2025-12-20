import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Image, X, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface ScreenshotGalleryProps {
  screenshots: string[];
  title?: string;
  className?: string;
}

export function ScreenshotGallery({ screenshots, title, className }: ScreenshotGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handlePrevious = () => {
    if (selectedIndex === null || screenshots.length === 0) return;
    setSelectedIndex(selectedIndex === 0 ? screenshots.length - 1 : selectedIndex - 1);
  };

  const handleNext = () => {
    if (selectedIndex === null || screenshots.length === 0) return;
    setSelectedIndex(selectedIndex === screenshots.length - 1 ? 0 : selectedIndex + 1);
  };

  if (!screenshots || screenshots.length === 0) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30",
        className
      )}>
        <Image className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground text-center">
          Screenshots guiados serão adicionados em breve
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Suporte para 1 a 5 imagens
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {screenshots.slice(0, 5).map((screenshot, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className="group relative aspect-video rounded-lg overflow-hidden border border-border bg-muted hover:border-primary/50 transition-all"
          >
            <img
              src={screenshot}
              alt={`Screenshot ${index + 1}${title ? ` - ${title}` : ''}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <ZoomIn className="h-6 w-6 text-white" />
            </div>
            <span className="absolute bottom-1 right-1 text-xs bg-black/70 text-white px-1.5 py-0.5 rounded">
              {index + 1}/{Math.min(screenshots.length, 5)}
            </span>
          </button>
        ))}
      </div>

      <Dialog open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden">
          <VisuallyHidden>
            <DialogTitle>Screenshot {selectedIndex !== null ? selectedIndex + 1 : ''}</DialogTitle>
          </VisuallyHidden>
          
          {selectedIndex !== null && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedIndex(null)}
                className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
              >
                <X className="h-4 w-4" />
              </Button>

              <img
                src={screenshots[selectedIndex]}
                alt={`Screenshot ${selectedIndex + 1}`}
                className="w-full h-auto max-h-[80vh] object-contain"
              />

              {screenshots.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrevious}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white h-10 w-10"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white h-10 w-10"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {screenshots.slice(0, 5).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedIndex(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      index === selectedIndex ? "bg-white" : "bg-white/50 hover:bg-white/75"
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
