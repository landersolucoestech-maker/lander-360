import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Music, 
  Disc3,
  FolderKanban,
  Rocket,
  BarChart3,
  Instagram,
  Facebook,
  Youtube,
  ExternalLink
} from "lucide-react";

interface ArtistProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artist: any;
}

export function ArtistProfileModal({
  open,
  onOpenChange,
  artist,
}: ArtistProfileModalProps) {
  if (!artist) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Perfil do Artista</DialogTitle>
          <DialogDescription>
            Informações detalhadas do artista
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header com foto e info básica */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center">
              <Avatar className="w-32 h-32 mb-4">
                <AvatarImage src={artist.avatar} alt={artist.name} />
                <AvatarFallback className="text-2xl">
                  {artist.name.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <Badge variant="secondary" className="mb-2">{artist.status}</Badge>
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{artist.name}</h2>
                <p className="text-lg text-muted-foreground">{artist.genre}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{artist.profile.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{artist.profile.telefone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{artist.profile.cidade}, {artist.profile.estado}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Nascimento: {artist.profile.dataNascimento}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Estatísticas */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Estatísticas</h3>
            <div className="grid grid-cols-5 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <FolderKanban className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{artist.stats.projetos || 0}</div>
                <div className="text-sm text-muted-foreground">Projetos</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <Music className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{artist.stats.obras}</div>
                <div className="text-sm text-muted-foreground">Obras</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <Disc3 className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{artist.stats.fonogramas || 0}</div>
                <div className="text-sm text-muted-foreground">Fonogramas</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <Rocket className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{artist.stats.lancamentos || 0}</div>
                <div className="text-sm text-muted-foreground">Lançamentos</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <BarChart3 className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{artist.stats.streams || '0'}</div>
                <div className="text-sm text-muted-foreground">Streams</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Redes Sociais */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Redes Sociais</h3>
            <div className="flex gap-4">
              {artist.socialMedia?.instagram && (
                <Button variant="outline" size="sm" className="gap-2" asChild>
                  <a href={artist.socialMedia.instagram} target="_blank" rel="noopener noreferrer">
                    <Instagram className="h-4 w-4" />
                    Instagram
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              )}
              {artist.socialMedia?.facebook && (
                <Button variant="outline" size="sm" className="gap-2" asChild>
                  <a href={artist.socialMedia.facebook} target="_blank" rel="noopener noreferrer">
                    <Facebook className="h-4 w-4" />
                    Facebook
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              )}
              {artist.socialMedia?.youtube && (
                <Button variant="outline" size="sm" className="gap-2" asChild>
                  <a href={artist.socialMedia.youtube} target="_blank" rel="noopener noreferrer">
                    <Youtube className="h-4 w-4" />
                    YouTube
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Informações Adicionais */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Informações Adicionais</h3>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">CPF:</span> {artist.profile.cpf}</div>
              <div><span className="font-medium">RG:</span> {artist.profile.rg}</div>
              <div><span className="font-medium">Gravadora:</span> {artist.gravadora}</div>
              <div><span className="font-medium">Data de Cadastro:</span> {new Date().toLocaleDateString('pt-BR')}</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}