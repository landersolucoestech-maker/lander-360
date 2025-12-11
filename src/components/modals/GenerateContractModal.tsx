import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Download, Send, Eye, Edit2, Plus, Trash2 } from 'lucide-react';
import { DateInput } from '@/components/ui/date-input';
import { ContractTemplate, ContractClause } from '@/services/contractTemplates';
import { ContractData, downloadContractPDF, generateContractHTML, getContractPDFBlob } from '@/lib/contract-document-generator';
import { useContractTemplates } from '@/hooks/useContractTemplates';
import { useArtists } from '@/hooks/useArtists';
import { Contract } from '@/types/database';
import { AutoContractService } from '@/services/autoContractService';
import { useToast } from '@/hooks/use-toast';
import { formatDateBR } from '@/lib/utils';

interface GenerateContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract?: Contract | null;
  onDocumentGenerated?: (contractId: string, documentContent: string) => void;
}

const templateTypeLabels: Record<string, string> = {
  agenciamento: 'Agenciamento',
  gestao: 'Gestão',
  empresariamento: 'Empresariamento',
  producao_musical: 'Produção Musical',
  producao_audiovisual: 'Produção Audiovisual',
  edicao: 'Edição',
  distribuicao: 'Distribuição',
  marketing: 'Marketing',
  licenciamento: 'Licenciamento',
  termo_fonograma: 'Termo de Autorização de Fonograma',
};

export const GenerateContractModal: React.FC<GenerateContractModalProps> = ({
  isOpen,
  onClose,
  contract,
  onDocumentGenerated,
}) => {
  const { data: templates = [] } = useContractTemplates();
  const { data: artists = [] } = useArtists();
  const { toast } = useToast();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [customClauses, setCustomClauses] = useState<ContractClause[]>([]);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [isSending, setIsSending] = useState(false);

  const [contractData, setContractData] = useState<ContractData>({
    company_name: 'LANDER RECORDS LTDA',
    company_cnpj: '',
    company_address: 'São Paulo/SP',
    company_email: 'contato@lander360.com',
    contracted_name: '',
    contracted_cpf_cnpj: '',
    contracted_address: '',
    contracted_email: '',
    contracted_stage_name: '',
    contract_title: '',
    service_type: '',
    start_date: '',
    end_date: '',
    fixed_value: undefined,
    royalties_percentage: undefined,
    advance_amount: undefined,
    work_title: '',
  });

  // Load contract data if editing
  useEffect(() => {
    if (contract && isOpen) {
      const artist = artists.find(a => a.id === contract.artist_id);
      
      setContractData(prev => ({
        ...prev,
        contracted_name: artist?.full_name || artist?.name || '',
        contracted_cpf_cnpj: artist?.cpf_cnpj || '',
        contracted_address: artist?.full_address || '',
        contracted_email: artist?.email || '',
        contracted_stage_name: artist?.stage_name || '',
        contract_title: contract.title,
        service_type: contract.service_type || '',
        start_date: contract.effective_from || contract.start_date || '',
        end_date: contract.effective_to || contract.end_date || '',
        fixed_value: contract.fixed_value || contract.value || undefined,
        royalties_percentage: contract.royalties_percentage || contract.royalty_rate || undefined,
        advance_amount: contract.advance_amount || undefined,
      }));

      // Find matching template
      const matchingTemplate = templates.find(t => t.template_type === contract.service_type);
      if (matchingTemplate) {
        setSelectedTemplateId(matchingTemplate.id);
        setSelectedTemplate(matchingTemplate);
        setCustomClauses(matchingTemplate.clauses);
      }
    }
  }, [contract, artists, templates, isOpen]);

  // Update selected template
  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find(t => t.id === selectedTemplateId);
      if (template) {
        setSelectedTemplate(template);
        setCustomClauses(template.clauses);
      }
    }
  }, [selectedTemplateId, templates]);

  // Generate preview
  useEffect(() => {
    if (selectedTemplate && contractData.contracted_name) {
      const html = generateContractHTML(selectedTemplate, contractData, customClauses);
      setPreviewHtml(html);
    }
  }, [selectedTemplate, contractData, customClauses]);

  const handleArtistSelect = (artistId: string) => {
    const artist = artists.find(a => a.id === artistId);
    if (artist) {
      setContractData(prev => ({
        ...prev,
        contracted_name: artist.full_name || artist.name,
        contracted_cpf_cnpj: artist.cpf_cnpj || '',
        contracted_address: artist.full_address || '',
        contracted_email: artist.email || '',
        contracted_stage_name: artist.stage_name || '',
      }));
    }
  };

  const handleAddClause = () => {
    const newClause: ContractClause = {
      id: Date.now().toString(),
      title: '',
      content: '',
      isCustom: true,
    };
    setCustomClauses([...customClauses, newClause]);
  };

  const handleUpdateClause = (id: string, field: 'title' | 'content', value: string) => {
    setCustomClauses(customClauses.map(clause =>
      clause.id === id ? { ...clause, [field]: value } : clause
    ));
  };

  const handleRemoveClause = (id: string) => {
    setCustomClauses(customClauses.filter(clause => clause.id !== id));
  };

  const handleDownloadPDF = () => {
    if (selectedTemplate) {
      downloadContractPDF(selectedTemplate, contractData, customClauses);
      toast({
        title: 'PDF gerado',
        description: 'O contrato foi baixado com sucesso.',
      });
    }
  };

  const handleSendToSignature = async () => {
    if (!contract || !selectedTemplate) {
      toast({
        title: 'Erro',
        description: 'Selecione um contrato e template para enviar para assinatura.',
        variant: 'destructive',
      });
      return;
    }

    if (!contractData.contracted_email) {
      toast({
        title: 'E-mail obrigatório',
        description: 'O e-mail do contratado é necessário para assinatura digital.',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    try {
      // Generate HTML content and save to contract
      const htmlContent = generateContractHTML(selectedTemplate, contractData, customClauses);
      
      if (onDocumentGenerated) {
        onDocumentGenerated(contract.id, htmlContent);
      }

      // Request digital signature via Autentique
      const result = await AutoContractService.requestDigitalSignature(contract.id);
      
      if (result.success) {
        toast({
          title: 'Enviado para assinatura',
          description: 'O contrato foi enviado para assinatura digital via Autentique.',
        });
        onClose();
      } else {
        throw new Error(result.error || 'Erro ao enviar para assinatura');
      }
    } catch (error: any) {
      console.error('Error sending to signature:', error);
      toast({
        title: 'Erro ao enviar',
        description: error.message || 'Não foi possível enviar o contrato para assinatura.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Gerar Documento de Contrato
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="data" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="data">Dados</TabsTrigger>
            <TabsTrigger value="clauses">Cláusulas</TabsTrigger>
            <TabsTrigger value="preview">Prévia</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <TabsContent value="data" className="mt-4 space-y-4 p-1">
              {/* Template Selection */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Template do Contrato</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                          <Badge variant="secondary" className="ml-2">
                            {templateTypeLabels[template.template_type]}
                          </Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Contractor Data */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Dados da Contratante (Lander Records)</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Razão Social</Label>
                    <Input
                      value={contractData.company_name}
                      onChange={(e) => setContractData({ ...contractData, company_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CNPJ</Label>
                    <Input
                      value={contractData.company_cnpj}
                      onChange={(e) => setContractData({ ...contractData, company_cnpj: e.target.value })}
                      placeholder="XX.XXX.XXX/0001-XX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Endereço</Label>
                    <Input
                      value={contractData.company_address}
                      onChange={(e) => setContractData({ ...contractData, company_address: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail</Label>
                    <Input
                      value={contractData.company_email}
                      onChange={(e) => setContractData({ ...contractData, company_email: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contracted Party Data */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Dados do Contratado</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Selecionar Artista</Label>
                    <Select onValueChange={handleArtistSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Buscar artista cadastrado..." />
                      </SelectTrigger>
                      <SelectContent>
                        {artists.map((artist) => (
                          <SelectItem key={artist.id} value={artist.id}>
                            {artist.stage_name || artist.name}
                            {artist.full_name && artist.full_name !== artist.name && (
                              <span className="text-muted-foreground ml-2">({artist.full_name})</span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome Completo</Label>
                      <Input
                        value={contractData.contracted_name}
                        onChange={(e) => setContractData({ ...contractData, contracted_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nome Artístico</Label>
                      <Input
                        value={contractData.contracted_stage_name}
                        onChange={(e) => setContractData({ ...contractData, contracted_stage_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CPF/CNPJ</Label>
                      <Input
                        value={contractData.contracted_cpf_cnpj}
                        onChange={(e) => setContractData({ ...contractData, contracted_cpf_cnpj: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>E-mail</Label>
                      <Input
                        value={contractData.contracted_email}
                        onChange={(e) => setContractData({ ...contractData, contracted_email: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label>Endereço</Label>
                      <Input
                        value={contractData.contracted_address}
                        onChange={(e) => setContractData({ ...contractData, contracted_address: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contract Details */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Detalhes do Contrato</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Data de Início</Label>
                    <DateInput
                      value={contractData.start_date ? new Date(contractData.start_date) : undefined}
                      onChange={(date) => setContractData({ ...contractData, start_date: date?.toISOString().split('T')[0] || '' })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data de Término</Label>
                    <DateInput
                      value={contractData.end_date ? new Date(contractData.end_date) : undefined}
                      onChange={(date) => setContractData({ ...contractData, end_date: date?.toISOString().split('T')[0] || '' })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Royalties (%)</Label>
                    <Input
                      type="number"
                      value={contractData.royalties_percentage || ''}
                      onChange={(e) => setContractData({ ...contractData, royalties_percentage: parseFloat(e.target.value) || undefined })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valor Fixo (R$)</Label>
                    <Input
                      type="number"
                      value={contractData.fixed_value || ''}
                      onChange={(e) => setContractData({ ...contractData, fixed_value: parseFloat(e.target.value) || undefined })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Adiantamento (R$)</Label>
                    <Input
                      type="number"
                      value={contractData.advance_amount || ''}
                      onChange={(e) => setContractData({ ...contractData, advance_amount: parseFloat(e.target.value) || undefined })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Título da Obra</Label>
                    <Input
                      value={contractData.work_title || ''}
                      onChange={(e) => setContractData({ ...contractData, work_title: e.target.value })}
                      placeholder="Para contratos de edição/licenciamento"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="clauses" className="mt-4 space-y-4 p-1">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Cláusulas do Contrato</h3>
                <Button variant="outline" size="sm" onClick={handleAddClause}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Cláusula
                </Button>
              </div>

              {customClauses.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <p>Selecione um template para carregar as cláusulas padrão.</p>
                  </CardContent>
                </Card>
              ) : (
                customClauses.map((clause, index) => (
                  <Card key={clause.id}>
                    <CardHeader className="py-3 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                          Cláusula {index + 1}
                        </span>
                        {clause.isCustom && <Badge variant="outline">Personalizada</Badge>}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveClause(clause.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Label>Título</Label>
                        <Input
                          value={clause.title}
                          onChange={(e) => handleUpdateClause(clause.id, 'title', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Conteúdo</Label>
                        <Textarea
                          value={clause.content}
                          onChange={(e) => handleUpdateClause(clause.id, 'content', e.target.value)}
                          rows={4}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="preview" className="mt-4 p-1">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Prévia do Documento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {previewHtml ? (
                    <div 
                      className="border border-border rounded-lg p-4 bg-white text-black min-h-[500px] overflow-auto"
                      style={{ fontFamily: 'Times New Roman, serif' }}
                      dangerouslySetInnerHTML={{ __html: previewHtml }}
                    />
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Preencha os dados e selecione um template para visualizar a prévia.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleDownloadPDF}
              disabled={!selectedTemplate || !contractData.contracted_name}
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar PDF
            </Button>
            <Button
              onClick={handleSendToSignature}
              disabled={!selectedTemplate || !contractData.contracted_name || !contractData.contracted_email || isSending}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSending ? 'Enviando...' : 'Enviar para Assinatura'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
