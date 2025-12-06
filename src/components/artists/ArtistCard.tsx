import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArtistModal } from "@/components/modals/ArtistModal";
import { ArtistProfileModal } from "@/components/modals/ArtistProfileModal";
import { ArtistHistoryModal } from "@/components/modals/ArtistHistoryModal";
import { ArtistContractModal } from "@/components/modals/ArtistContractModal";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import { useDeleteArtist } from "@/hooks/useArtists";
import { Mail, Phone } from "lucide-react";
import { FaInstagram, FaSpotify, FaYoutube, FaTiktok, FaSoundcloud } from "react-icons/fa";

interface ArtistCardProps {
  artist: {
    id: number;
    name: string;
    genre: string;
    status: string;
    email: string;
    avatar?: string;
    socialMedia?: {
      instagram?: string;
      spotify?: string;
      youtube?: string;
      tiktok?: string;
      soundcloud?: string;
    };
    stats: {
      projetos?: number;
      obras: number;
      lancamentos: number;
    };
    profile: {
      nome: string;
      email: string;
      telefone: string;
    };
    gravadora: string;
  };
}
export function ArtistCard({
  artist
}: ArtistCardProps) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const deleteArtist = useDeleteArtist();
  const handleDelete = async () => {
    try {
      await deleteArtist.mutateAsync(artist.id.toString());
      setDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting artist:', error);
    }
  };
  return <>
      <Card className="py-4 px-5 md:py-5 md:px-6">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-start">
            {/* Left Section - Avatar & Artist Info */}
            <div className="md:col-span-3">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 md:h-20 md:w-20 flex-shrink-0 border-2 border-border">
                  <AvatarImage src={artist.avatar} alt={artist.name} className="object-cover" />
                  <AvatarFallback className="text-lg md:text-xl font-bold bg-muted">
                    {artist.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1.5 min-w-0 flex-1">
                  <h3 className="text-lg md:text-xl font-bold text-foreground truncate">{artist.name}</h3>
                  <p className="text-sm md:text-base text-muted-foreground">{artist.genre}</p>
                  <Badge variant="default" className="bg-green-500 text-white hover:bg-green-600 text-xs md:text-sm">
                    {artist.status}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-3 flex-wrap">
                {artist.profile?.telefone && <div className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{artist.profile.telefone}</span>
                  </div>}
                <div className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{artist.email}</span>
                </div>
              </div>
            </div>

            {/* Middle Section - Social Media & Stats */}
            <div className="md:col-span-3">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm md:text-base font-medium text-foreground mb-2">Redes Sociais</h4>
                  <div className="flex items-center gap-3 flex-wrap">
                    {artist.socialMedia?.instagram && (
                      <a href={artist.socialMedia.instagram.startsWith('http') ? artist.socialMedia.instagram : `https://instagram.com/${artist.socialMedia.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-pink-500 transition-colors">
                        <FaInstagram className="h-5 w-5" />
                      </a>
                    )}
                    {artist.socialMedia?.spotify && (
                      <a href={artist.socialMedia.spotify.startsWith('http') ? artist.socialMedia.spotify : `https://open.spotify.com/artist/${artist.socialMedia.spotify}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-green-500 transition-colors">
                        <FaSpotify className="h-5 w-5" />
                      </a>
                    )}
                    {artist.socialMedia?.youtube && (
                      <a href={artist.socialMedia.youtube.startsWith('http') ? artist.socialMedia.youtube : `https://youtube.com/${artist.socialMedia.youtube}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-red-500 transition-colors">
                        <FaYoutube className="h-5 w-5" />
                      </a>
                    )}
                    {artist.socialMedia?.tiktok && (
                      <a href={artist.socialMedia.tiktok.startsWith('http') ? artist.socialMedia.tiktok : `https://tiktok.com/@${artist.socialMedia.tiktok.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                        <FaTiktok className="h-5 w-5" />
                      </a>
                    )}
                    {artist.socialMedia?.soundcloud && (
                      <a href={artist.socialMedia.soundcloud.startsWith('http') ? artist.socialMedia.soundcloud : `https://soundcloud.com/${artist.socialMedia.soundcloud}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-orange-500 transition-colors">
                        <FaSoundcloud className="h-5 w-5" />
                      </a>
                    )}
                    {!artist.socialMedia?.instagram && !artist.socialMedia?.spotify && !artist.socialMedia?.youtube && !artist.socialMedia?.tiktok && !artist.socialMedia?.soundcloud && (
                      <span className="text-xs text-muted-foreground">Nenhuma rede cadastrada</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between text-center gap-3">
                  <div>
                    <div className="text-xl md:text-2xl font-bold text-foreground">{artist.stats.projetos ?? 0}</div>
                    <div className="text-xs md:text-sm text-muted-foreground">Projetos</div>
                  </div>
                  <div>
                    <div className="text-xl md:text-2xl font-bold text-foreground">{artist.stats.obras}</div>
                    <div className="text-xs md:text-sm text-muted-foreground">Obras</div>
                  </div>
                  <div>
                    <div className="text-xl md:text-2xl font-bold text-foreground">{artist.stats.lancamentos}</div>
                    <div className="text-xs md:text-sm text-muted-foreground">Lançamentos</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Profile & Actions */}
            <div className="md:col-span-6">
              <div className="space-y-3">
                <div>
                  <div className="mb-2">
                    <span className="text-sm md:text-base font-medium text-foreground">Perfil:</span>
                    <span className="text-sm md:text-base font-medium text-foreground ml-1">{artist.gravadora}</span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="truncate"><span className="font-medium text-foreground">Nome:</span> {artist.profile.nome}</div>
                    <div className="truncate"><span className="font-medium text-foreground">Tel:</span> {artist.profile.telefone}</div>
                    <div className="truncate"><span className="font-medium text-foreground">Email:</span> {artist.profile.email}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" className="text-xs md:text-sm h-8 px-3" onClick={() => setProfileModalOpen(true)}>
                    Ver Perfil
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs md:text-sm h-8 px-3" onClick={() => setHistoryModalOpen(true)}>
                    Histórico
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs md:text-sm h-8 px-3" onClick={() => setContractModalOpen(true)}>
                    Contrato
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs md:text-sm h-8 px-3" onClick={() => setEditModalOpen(true)}>
                    Editar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setDeleteModalOpen(true)} className="text-xs md:text-sm h-8 px-3 text-primary-foreground">
                    Excluir
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <ArtistModal open={editModalOpen} onOpenChange={setEditModalOpen} artist={artist} mode="edit" />
      
      {/* Profile Modal */}
      <ArtistProfileModal open={profileModalOpen} onOpenChange={setProfileModalOpen} artist={artist} />
      
      {/* History Modal */}
      <ArtistHistoryModal open={historyModalOpen} onOpenChange={setHistoryModalOpen} artist={artist} />
      
      {/* Contract Modal */}
      <ArtistContractModal open={contractModalOpen} onOpenChange={setContractModalOpen} artist={artist} />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal open={deleteModalOpen} onOpenChange={setDeleteModalOpen} onConfirm={handleDelete} title="Excluir Artista" description={`Tem certeza que deseja excluir o artista "${artist.name}"? Esta ação não pode ser desfeita.`} isLoading={deleteArtist.isPending} />
    </>;
}