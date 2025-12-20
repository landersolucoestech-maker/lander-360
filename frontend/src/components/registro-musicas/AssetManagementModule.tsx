import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMusicRegistry } from "@/hooks/useMusicRegistry";
import { usePhonograms } from "@/hooks/usePhonograms";
import { 
  Music, Folder, Play, Pause, Upload, Download, 
  Tag, Clock, FileAudio, Layers, Globe, FileText,
  Search, Filter, Eye, Edit, Trash2
} from "lucide-react";

interface MasterAsset {
  id: string;
  title: string;
  artist: string;
  isrc: string;
  version: string;
  type: 'master' | 'stem' | 'instrumental' | 'acapella';
  format: string;
  duration: string;
  tags: string[];
  uploadDate: string;
  fileSize: string;
}

interface PublishingData {
  id: string;
  title: string;
  iswc: string;
  writers: string[];
  publishers: string[];
  territories: string[];
  status: 'active' | 'pending' | 'disputed';
  pro: string;
  share: number;
}

interface SyncProposal {
  id: string;
  title: string;
  client: string;
  usage: string;
  territory: string;
  fee: number;
  status: 'pending' | 'approved' | 'rejected' | 'negotiating';
  deadline: string;
}

const AssetManagementModule = () => {
  const { toast } = useToast();
  const { data: musicRegistry = [] } = useMusicRegistry();
  const { data: phonograms = [] } = usePhonograms();
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [activeTab, setActiveTab] = useState("masters");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Empty arrays - will be populated from database when tables are created
  const [masterAssets] = useState<MasterAsset[]>([]);
  const [publishingData] = useState<PublishingData[]>([]);
  const [syncProposals] = useState<SyncProposal[]>([]);

  const handlePlay = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
    }
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'master': return 'bg-blue-500';
      case 'stem': return 'bg-purple-500';
      case 'instrumental': return 'bg-green-500';
      case 'acapella': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'negotiating': return 'secondary';
      case 'rejected': return 'destructive';
      case 'disputed': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Folder className="h-6 w-6 text-primary" />
            Asset Management
          </h2>
          <p className="text-muted-foreground">
            Masters, Stems, Publishing & Sync
          </p>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Asset
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <FileAudio className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{masterAssets.filter(a => a.type === 'master').length}</p>
                <p className="text-xs text-muted-foreground">Masters</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Layers className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{masterAssets.filter(a => a.type === 'stem').length}</p>
                <p className="text-xs text-muted-foreground">Stems</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{publishingData.length}</p>
                <p className="text-xs text-muted-foreground">Publishing</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Globe className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{syncProposals.length}</p>
                <p className="text-xs text-muted-foreground">Sync Proposals</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="masters" className="flex items-center gap-2">
            <FileAudio className="h-4 w-4" />
            Masters & Stems
          </TabsTrigger>
          <TabsTrigger value="publishing" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Publishing
          </TabsTrigger>
          <TabsTrigger value="sync" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Sync & Licenciamento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="masters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Versionamento de Masters & Stems</CardTitle>
              <CardDescription>
                Gerencie todas as versões e stems dos seus masters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar assets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="master">Master</SelectItem>
                    <SelectItem value="stem">Stem</SelectItem>
                    <SelectItem value="instrumental">Instrumental</SelectItem>
                    <SelectItem value="acapella">Acapella</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {masterAssets
                  .filter(a => 
                    (selectedType === 'all' || a.type === selectedType) &&
                    (a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     a.artist.toLowerCase().includes(searchTerm.toLowerCase()))
                  )
                  .map(asset => (
                    <div key={asset.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-12 w-12 rounded-full"
                        onClick={() => handlePlay(asset.id)}
                      >
                        {playingId === asset.id ? (
                          <Pause className="h-6 w-6" />
                        ) : (
                          <Play className="h-6 w-6" />
                        )}
                      </Button>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{asset.title}</p>
                          <Badge className={getTypeColor(asset.type)}>
                            {asset.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {asset.artist} • {asset.version}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {asset.duration}
                          </span>
                          <span>{asset.format}</span>
                          <span>{asset.fileSize}</span>
                        </div>
                        <div className="flex gap-1 mt-2">
                          {asset.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                }
              </div>

              {/* Waveform placeholder */}
              {playingId && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <div className="h-16 flex items-center justify-center">
                    <div className="flex items-end gap-0.5 h-full">
                      {Array.from({ length: 50 }).map((_, i) => (
                        <div 
                          key={i} 
                          className="w-1 bg-primary rounded-full animate-pulse"
                          style={{ 
                            height: `${Math.random() * 100}%`,
                            animationDelay: `${i * 50}ms`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    Player com waveform (demonstração)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="publishing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Publishing Avançado</CardTitle>
              <CardDescription>
                Matching global e dados de PROs (ASCAP/BMI/PRS)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Obra</TableHead>
                    <TableHead>ISWC</TableHead>
                    <TableHead>Compositores</TableHead>
                    <TableHead>Editora</TableHead>
                    <TableHead>PRO</TableHead>
                    <TableHead>Share</TableHead>
                    <TableHead>Territórios</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {publishingData.map(pub => (
                    <TableRow key={pub.id}>
                      <TableCell className="font-medium">{pub.title}</TableCell>
                      <TableCell className="font-mono text-xs">{pub.iswc}</TableCell>
                      <TableCell>{pub.writers.join(", ")}</TableCell>
                      <TableCell>{pub.publishers.join(", ")}</TableCell>
                      <TableCell><Badge variant="outline">{pub.pro}</Badge></TableCell>
                      <TableCell>{pub.share}%</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{pub.territories[0]}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(pub.status) as any}>
                          {pub.status === 'active' ? 'Ativo' : pub.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-6 flex gap-3">
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Importar ASCAP
                </Button>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Importar BMI
                </Button>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Importar PRS
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sync & Licenciamento</CardTitle>
                  <CardDescription>
                    Gestão de propostas de sync e catálogo licenciado
                  </CardDescription>
                </div>
                <Button>
                  Nova Proposta
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Obra</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Uso</TableHead>
                    <TableHead>Território</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syncProposals.map(proposal => (
                    <TableRow key={proposal.id}>
                      <TableCell className="font-medium">{proposal.title}</TableCell>
                      <TableCell>{proposal.client}</TableCell>
                      <TableCell>{proposal.usage}</TableCell>
                      <TableCell><Badge variant="outline">{proposal.territory}</Badge></TableCell>
                      <TableCell className="text-green-600 font-bold">{formatCurrency(proposal.fee)}</TableCell>
                      <TableCell>{proposal.deadline}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(proposal.status) as any}>
                          {proposal.status === 'pending' ? 'Pendente' : 
                           proposal.status === 'negotiating' ? 'Negociando' :
                           proposal.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssetManagementModule;
