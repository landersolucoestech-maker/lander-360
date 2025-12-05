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
import { 
  Eye, 
  History, 
  FileText, 
  Edit, 
  Trash2, 
  Mail, 
  Instagram 
} from "lucide-react";

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
      <Card className="p-3">
        <CardContent className="p-0">
          <div className="grid grid-cols-12 gap-8 items-start">
            {/* Left Section - Artist Info */}
            <div className="col-span-3">
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-foreground">{artist.name}</h3>
                <p className="text-sm text-muted-foreground">{artist.genre}</p>
                <Badge 
                  variant="default"
                  className="bg-green-500 text-white hover:bg-green-600 text-xs"
                >
                  {artist.status}
                </Badge>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
                  <Mail className="h-4 w-4" />
                  <span>{artist.email}</span>
                </div>
              </div>
            </div>

            {/* Middle Section - Social Media & Stats */}
            <div className="col-span-3">
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-foreground mb-3">Redes Sociais</h4>
                  <div className="flex items-center gap-2">
                    <Instagram className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="flex justify-between text-center gap-4">
                  <div>
                    <div className="text-2xl font-bold text-foreground">{artist.stats.projetos ?? 0}</div>
                    <div className="text-xs text-muted-foreground">Projetos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{artist.stats.obras}</div>
                    <div className="text-xs text-muted-foreground">Obras/Fonogramas</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{artist.stats.lancamentos}</div>
                    <div className="text-xs text-muted-foreground">Lançamentos</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Profile & Actions */}
            <div className="col-span-6">
              <div className="space-y-4">
                <div>
                  <div className="mb-2">
                    <span className="font-medium text-foreground">Perfil:</span>
                    <span className="font-medium text-foreground ml-1">{artist.gravadora}</span>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div><span className="font-medium text-foreground">Nome:</span> {artist.profile.nome}</div>
                    <div><span className="font-medium text-foreground">Email:</span> {artist.profile.email}</div>
                    <div><span className="font-medium text-foreground">Telefone:</span> {artist.profile.telefone}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-1 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1 text-xs h-7 px-2"
                    onClick={() => setProfileModalOpen(true)}
                  >
                    <Eye className="h-3 w-3" />
                    Ver Perfil
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1 text-xs h-7 px-2"
                    onClick={() => setHistoryModalOpen(true)}
                  >
                    <History className="h-3 w-3" />
                    Histórico
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1 text-xs h-7 px-2"
                    onClick={() => setContractModalOpen(true)}
                  >
                    <FileText className="h-3 w-3" />
                    Contrato
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1 text-xs h-7 px-2"
                    onClick={() => setEditModalOpen(true)}
                  >
                    <Edit className="h-3 w-3" />
                    Editar
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="gap-1 text-xs h-7 px-2"
                    onClick={() => setDeleteModalOpen(true)}
                  >
                    <Trash2 className="h-3 w-3" />
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