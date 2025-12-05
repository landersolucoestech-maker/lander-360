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
import { Mail, Instagram, Phone } from "lucide-react";

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

export function ArtistCard({ artist }: ArtistCardProps) {
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

  return (
    <>
      <Card className="p-2">
        <CardContent className="p-0">
          <div className="grid grid-cols-12 gap-3 items-start">
            {/* Left Section - Artist Info */}
            <div className="col-span-3">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground truncate">{artist.name}</h3>
                <p className="text-xs text-muted-foreground">{artist.genre}</p>
                <Badge 
                  variant="default"
                  className="bg-green-500 text-white hover:bg-green-600 text-xs"
                >
                  {artist.status}
                </Badge>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2 flex-wrap">
                  {artist.profile?.telefone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{artist.profile.telefone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{artist.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Section - Social Media & Stats */}
            <div className="col-span-3">
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-medium text-foreground mb-1">Redes Sociais</h4>
                  <div className="flex items-center gap-2">
                    <Instagram className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>

                <div className="flex justify-between text-center gap-2">
                  <div>
                    <div className="text-lg font-bold text-foreground">{artist.stats.projetos ?? 0}</div>
                    <div className="text-[10px] text-muted-foreground">Projetos</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-foreground">{artist.stats.obras}</div>
                    <div className="text-[10px] text-muted-foreground">Obras</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-foreground">{artist.stats.lancamentos}</div>
                    <div className="text-[10px] text-muted-foreground">Lançamentos</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Profile & Actions */}
            <div className="col-span-6">
              <div className="space-y-2">
                <div>
                  <div className="mb-1">
                    <span className="text-xs font-medium text-foreground">Perfil:</span>
                    <span className="text-xs font-medium text-foreground ml-1">{artist.gravadora}</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <div className="truncate"><span className="font-medium text-foreground">Nome:</span> {artist.profile.nome}</div>
                    <div className="truncate"><span className="font-medium text-foreground">Tel:</span> {artist.profile.telefone}</div>
                    <div className="truncate"><span className="font-medium text-foreground">Email:</span> {artist.profile.email}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-1 flex-wrap">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-[10px] h-6 px-2"
                    onClick={() => setProfileModalOpen(true)}
                  >
                    Ver Perfil
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-[10px] h-6 px-2"
                    onClick={() => setHistoryModalOpen(true)}
                  >
                    Histórico
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-[10px] h-6 px-2"
                    onClick={() => setContractModalOpen(true)}
                  >
                    Contrato
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-[10px] h-6 px-2"
                    onClick={() => setEditModalOpen(true)}
                  >
                    Editar
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="text-[10px] h-6 px-2"
                    onClick={() => setDeleteModalOpen(true)}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <ArtistModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        artist={artist}
        mode="edit"
      />
      
      {/* Profile Modal */}
      <ArtistProfileModal
        open={profileModalOpen}
        onOpenChange={setProfileModalOpen}
        artist={artist}
      />
      
      {/* History Modal */}
      <ArtistHistoryModal
        open={historyModalOpen}
        onOpenChange={setHistoryModalOpen}
        artist={artist}
      />
      
      {/* Contract Modal */}
      <ArtistContractModal
        open={contractModalOpen}
        onOpenChange={setContractModalOpen}
        artist={artist}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDelete}
        title="Excluir Artista"
        description={`Tem certeza que deseja excluir o artista "${artist.name}"? Esta ação não pode ser desfeita.`}
        isLoading={deleteArtist.isPending}
      />
    </>
  );
}