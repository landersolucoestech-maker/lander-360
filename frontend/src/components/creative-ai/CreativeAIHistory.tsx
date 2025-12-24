import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { History, Search, Download, Trash2, Eye, ThumbsUp, ThumbsDown, FileText } from 'lucide-react';
import { useCreativeIdeas, useUpdateIdea, useDeleteIdea, CreativeIdea } from '@/hooks/useCreativeAI';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDateBR } from '@/lib/utils';
import { useArtists } from '@/hooks/useArtists';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export const CreativeAIHistory = () => {
  const { data: artists } = useArtists();
  const [filters, setFilters] = useState<{
    artistId?: string;
    objective?: string;
    channel?: string;
    status?: string;
  }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const { data: ideas, isLoading } = useCreativeIdeas(filters);
  const updateIdea = useUpdateIdea();
  const deleteIdea = useDeleteIdea();

  const filteredIdeas = ideas?.filter(idea => 
    idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    idea.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFeedback = async (id: string, isUseful: boolean) => {
    await updateIdea.mutateAsync({
      id,
      data: { is_useful: isUseful },
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta ideia?')) {
      await deleteIdea.mutateAsync(id);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Histórico de Ideias Criativas', 20, 20);
    doc.setFontSize(10);
    doc.text(`Exportado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30);

    let yPos = 45;
    filteredIdeas?.forEach((idea, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      doc.text(`${index + 1}. ${idea.title}`, 20, yPos);
      yPos += 7;
      
      doc.setFontSize(9);
      doc.text(`Canal: ${idea.suggested_channel || 'N/A'} | Formato: ${idea.content_format || 'N/A'}`, 20, yPos);
      yPos += 5;
      
      const descLines = doc.splitTextToSize(idea.description, 170);
      doc.text(descLines.slice(0, 3), 20, yPos);
      yPos += descLines.slice(0, 3).length * 4 + 10;
    });

    doc.save('historico-ideias-criativas.pdf');
  };

  const handleExportCSV = () => {
    const exportData = filteredIdeas?.map(idea => ({
      'Título': idea.title,
      'Descrição': idea.description,
      'Objetivo': idea.objective,
      'Canal Sugerido': idea.suggested_channel,
      'Formato': idea.content_format,
      'Prioridade': idea.priority,
      'Status': idea.status,
      'Útil': idea.is_useful === true ? 'Sim' : idea.is_useful === false ? 'Não' : 'N/A',
      'Data Criação': formatDateBR(idea.created_at),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData || []);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ideias');
    XLSX.writeFile(wb, 'historico-ideias-criativas.xlsx');
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority?.toLowerCase()) {
      case 'alta': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'média': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'baixa': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'saved': return 'bg-blue-500/20 text-blue-400';
      case 'used': return 'bg-green-500/20 text-green-400';
      case 'archived': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar ideias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select 
              value={filters.artistId || 'all'} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, artistId: value === 'all' ? undefined : value }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Artista" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {artists?.filter(artist => artist.id).map(artist => (
                  <SelectItem key={artist.id} value={artist.id}>
                    {artist.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={filters.objective || 'all'} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, objective: value === 'all' ? undefined : value }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Objetivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="campanha">Campanha</SelectItem>
                <SelectItem value="post">Post</SelectItem>
                <SelectItem value="roteiro">Roteiro</SelectItem>
                <SelectItem value="estrategia">Estratégia</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={filters.status || 'all'} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === 'all' ? undefined : value }))}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="saved">Salvas</SelectItem>
                <SelectItem value="used">Usadas</SelectItem>
                <SelectItem value="archived">Arquivadas</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportPDF}>
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ideas Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Histórico de Ideias ({filteredIdeas?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : filteredIdeas?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma ideia encontrada
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Artista</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Feedback</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIdeas?.map((idea: any) => (
                  <TableRow key={idea.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {idea.title}
                    </TableCell>
                    <TableCell>
                      {idea.artists?.name || idea.artists?.name || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{idea.suggested_channel || '—'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(idea.priority)}>
                        {idea.priority || 'Média'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(idea.status)}>
                        {idea.status === 'saved' ? 'Salva' : 
                         idea.status === 'used' ? 'Usada' : 
                         idea.status === 'archived' ? 'Arquivada' : 'Rascunho'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={idea.is_useful === true ? 'text-green-500' : 'text-muted-foreground'}
                          onClick={() => handleFeedback(idea.id, true)}
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={idea.is_useful === false ? 'text-red-500' : 'text-muted-foreground'}
                          onClick={() => handleFeedback(idea.id, false)}
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateBR(idea.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedIdea(idea);
                            setViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(idea.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedIdea?.title}</DialogTitle>
          </DialogHeader>
          {selectedIdea && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className={getPriorityColor(selectedIdea.priority)}>
                  {selectedIdea.priority || 'Média'}
                </Badge>
                <Badge variant="outline">{selectedIdea.suggested_channel}</Badge>
                <Badge variant="secondary">{selectedIdea.content_format}</Badge>
              </div>

              <div>
                <h4 className="font-medium mb-2">Descrição</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedIdea.description}
                </p>
              </div>

              {selectedIdea.execution_notes && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <h4 className="font-medium mb-1">Notas de Execução</h4>
                  <p className="text-sm text-muted-foreground">{selectedIdea.execution_notes}</p>
                </div>
              )}

              {selectedIdea.engagement_strategies?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Estratégias de Engajamento</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {selectedIdea.engagement_strategies.map((s: string, idx: number) => (
                      <li key={idx}>• {s}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Artista</p>
                  <p className="text-sm">{selectedIdea.artists?.name || selectedIdea.artists?.name || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Objetivo</p>
                  <p className="text-sm">{selectedIdea.objective}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Criado em</p>
                  <p className="text-sm">{formatDateBR(selectedIdea.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Versão</p>
                  <p className="text-sm">v{selectedIdea.version}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
