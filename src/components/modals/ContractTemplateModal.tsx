import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, GripVertical, Save, Upload, X, Image } from 'lucide-react';
import { ContractTemplate, ContractClause, ContractTemplateInsert } from '@/services/contractTemplates';
import { useCreateContractTemplate, useUpdateContractTemplate } from '@/hooks/useContractTemplates';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ContractTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: ContractTemplate | null;
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

export const ContractTemplateModal: React.FC<ContractTemplateModalProps> = ({
  isOpen,
  onClose,
  template,
}) => {
  const createTemplate = useCreateContractTemplate();
  const updateTemplate = useUpdateContractTemplate();
  const { toast } = useToast();
  const headerInputRef = useRef<HTMLInputElement>(null);
  const footerInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    template_type: '',
    description: '',
    header_html: '',
    footer_html: '',
  });

  const [companyData, setCompanyData] = useState({
    company_name: 'Lander Produtora',
    company_type: 'pessoa jurídica de direito privado',
    cnpj: '50.056.858/0001-46',
    company_address: 'Rua A, nº 58, Bairro Vila Império, Governador Valadares/MG, CEP 35050-560',
    representative_name: 'Deyvisson Lander Andrade',
    representative_nationality: 'brasileiro',
    representative_marital_status: 'solteiro',
    representative_profession: 'empresário',
    representative_rg: 'MG17905257',
    representative_cpf: '062.049.196-52',
    representative_address: 'Rua Professor Cid Pitanga, nº 410, Bairro Vila Império, Governador Valadares/MG, CEP 35050-610',
  });

  const [contractedPartyData, setContractedPartyData] = useState({
    full_name: '',
    nationality: 'brasileiro(a)',
    age: '',
    profession: '',
    rg: '',
    rg_issuer: '',
    cpf: '',
    stage_name: '',
    address: '',
  });

  const [clauses, setClauses] = useState<ContractClause[]>([]);
  const [headerPreview, setHeaderPreview] = useState<string | null>(null);
  const [footerPreview, setFooterPreview] = useState<string | null>(null);
  const [isUploadingHeader, setIsUploadingHeader] = useState(false);
  const [isUploadingFooter, setIsUploadingFooter] = useState(false);

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        template_type: template.template_type,
        description: template.description || '',
        header_html: template.header_html || '',
        footer_html: template.footer_html || '',
      });
      setClauses(template.clauses || []);
      
      // Load company data from default_fields if exists
      if (template.default_fields?.company_data) {
        setCompanyData(template.default_fields.company_data);
      }
      
      // Load contracted party data from default_fields if exists
      if (template.default_fields?.contracted_party_data) {
        setContractedPartyData(template.default_fields.contracted_party_data);
      }
      
      // Extract image URL from header_html if exists
      const headerMatch = template.header_html?.match(/src="([^"]+)"/);
      if (headerMatch) setHeaderPreview(headerMatch[1]);
      
      const footerMatch = template.footer_html?.match(/src="([^"]+)"/);
      if (footerMatch) setFooterPreview(footerMatch[1]);
    } else {
      setFormData({
        name: '',
        template_type: '',
        description: '',
        header_html: '',
        footer_html: '',
      });
      setClauses([]);
      setHeaderPreview(null);
      setFooterPreview(null);
      setCompanyData({
        company_name: 'Lander Produtora',
        company_type: 'pessoa jurídica de direito privado',
        cnpj: '50.056.858/0001-46',
        company_address: 'Rua A, nº 58, Bairro Vila Império, Governador Valadares/MG, CEP 35050-560',
        representative_name: 'Deyvisson Lander Andrade',
        representative_nationality: 'brasileiro',
        representative_marital_status: 'solteiro',
        representative_profession: 'empresário',
        representative_rg: 'MG17905257',
        representative_cpf: '062.049.196-52',
        representative_address: 'Rua Professor Cid Pitanga, nº 410, Bairro Vila Império, Governador Valadares/MG, CEP 35050-610',
      });
      setContractedPartyData({
        full_name: '',
        nationality: 'brasileiro(a)',
        age: '',
        profession: '',
        rg: '',
        rg_issuer: '',
        cpf: '',
        stage_name: '',
        address: '',
      });
    }
  }, [template, isOpen]);

  const uploadImage = async (file: File, type: 'header' | 'footer'): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${type}-${Date.now()}.${fileExt}`;
    const filePath = `contract-templates/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('artist-documents')
      .upload(filePath, file);

    if (uploadError) {
      toast({
        title: "Erro no upload",
        description: uploadError.message,
        variant: "destructive"
      });
      return null;
    }

    const { data } = supabase.storage
      .from('artist-documents')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleHeaderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: "Erro", description: "Apenas imagens são permitidas", variant: "destructive" });
      return;
    }

    setIsUploadingHeader(true);
    const url = await uploadImage(file, 'header');
    if (url) {
      setHeaderPreview(url);
      setFormData(prev => ({
        ...prev,
        header_html: `<div style="text-align: center; margin-bottom: 20px;"><img src="${url}" alt="Logo Cabeçalho" style="width: 100%; max-width: 794px; height: auto;" /></div>`
      }));
    }
    setIsUploadingHeader(false);
  };

  const handleFooterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: "Erro", description: "Apenas imagens são permitidas", variant: "destructive" });
      return;
    }

    setIsUploadingFooter(true);
    const url = await uploadImage(file, 'footer');
    if (url) {
      setFooterPreview(url);
      setFormData(prev => ({
        ...prev,
        footer_html: `<div style="text-align: center; margin-top: 20px; border-top: 1px solid #ccc; padding-top: 10px;"><img src="${url}" alt="Logo Rodapé" style="width: 100%; max-width: 794px; height: auto;" /></div>`
      }));
    }
    setIsUploadingFooter(false);
  };

  const handleRemoveHeader = () => {
    setHeaderPreview(null);
    setFormData(prev => ({ ...prev, header_html: '' }));
    if (headerInputRef.current) headerInputRef.current.value = '';
  };

  const handleRemoveFooter = () => {
    setFooterPreview(null);
    setFormData(prev => ({ ...prev, footer_html: '' }));
    if (footerInputRef.current) footerInputRef.current.value = '';
  };

  const handleAddClause = () => {
    const newClause: ContractClause = {
      id: Date.now().toString(),
      title: '',
      content: '',
      isCustom: true,
    };
    setClauses([...clauses, newClause]);
  };

  const handleUpdateClause = (id: string, field: 'title' | 'content', value: string) => {
    setClauses(clauses.map(clause => 
      clause.id === id ? { ...clause, [field]: value } : clause
    ));
  };

  const handleRemoveClause = (id: string) => {
    setClauses(clauses.filter(clause => clause.id !== id));
  };

  const handleSubmit = async () => {
    const data: ContractTemplateInsert = {
      name: formData.name,
      template_type: formData.template_type,
      description: formData.description || undefined,
      header_html: formData.header_html || undefined,
      footer_html: formData.footer_html || undefined,
      clauses: clauses,
      default_fields: {
        company_data: companyData,
        contracted_party_data: contractedPartyData,
      },
    };

    try {
      if (template) {
        await updateTemplate.mutateAsync({ id: template.id, data });
      } else {
        await createTemplate.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const isLoading = createTemplate.isPending || updateTemplate.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Editar Template de Contrato' : 'Novo Template de Contrato'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Template</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Contrato de Agenciamento Artístico"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Contrato</Label>
                  <Select
                    value={formData.template_type}
                    onValueChange={(value) => setFormData({ ...formData, template_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(templateTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição do template..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Company Data */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dados da Empresa (Contratado/Contratante/Representante)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome da Empresa</Label>
                  <Input
                    value={companyData.company_name}
                    onChange={(e) => setCompanyData({ ...companyData, company_name: e.target.value })}
                    placeholder="Ex: Lander Produtora"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo Jurídico</Label>
                  <Input
                    value={companyData.company_type}
                    onChange={(e) => setCompanyData({ ...companyData, company_type: e.target.value })}
                    placeholder="Ex: pessoa jurídica de direito privado"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>CNPJ</Label>
                  <Input
                    value={companyData.cnpj}
                    onChange={(e) => setCompanyData({ ...companyData, cnpj: e.target.value })}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Endereço da Empresa</Label>
                  <Input
                    value={companyData.company_address}
                    onChange={(e) => setCompanyData({ ...companyData, company_address: e.target.value })}
                    placeholder="Rua, número, bairro, cidade/UF, CEP"
                  />
                </div>
              </div>

              <div className="border-t border-border pt-4 mt-4">
                <h4 className="font-medium text-sm mb-4">Representante Legal</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome Completo</Label>
                    <Input
                      value={companyData.representative_name}
                      onChange={(e) => setCompanyData({ ...companyData, representative_name: e.target.value })}
                      placeholder="Nome do representante"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nacionalidade</Label>
                    <Input
                      value={companyData.representative_nationality}
                      onChange={(e) => setCompanyData({ ...companyData, representative_nationality: e.target.value })}
                      placeholder="Ex: brasileiro"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label>Estado Civil</Label>
                    <Input
                      value={companyData.representative_marital_status}
                      onChange={(e) => setCompanyData({ ...companyData, representative_marital_status: e.target.value })}
                      placeholder="Ex: solteiro"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Profissão</Label>
                    <Input
                      value={companyData.representative_profession}
                      onChange={(e) => setCompanyData({ ...companyData, representative_profession: e.target.value })}
                      placeholder="Ex: empresário"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>RG</Label>
                    <Input
                      value={companyData.representative_rg}
                      onChange={(e) => setCompanyData({ ...companyData, representative_rg: e.target.value })}
                      placeholder="Número do RG"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label>CPF</Label>
                    <Input
                      value={companyData.representative_cpf}
                      onChange={(e) => setCompanyData({ ...companyData, representative_cpf: e.target.value })}
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Endereço do Representante</Label>
                    <Input
                      value={companyData.representative_address}
                      onChange={(e) => setCompanyData({ ...companyData, representative_address: e.target.value })}
                      placeholder="Rua, número, bairro, cidade/UF, CEP"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contracted Party Data */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dados da Outra Parte (Contratante/Contratado/Representado)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Preencha os dados padrão ou deixe em branco para preencher no momento da geração do contrato.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input
                    value={contractedPartyData.full_name}
                    onChange={(e) => setContractedPartyData({ ...contractedPartyData, full_name: e.target.value })}
                    placeholder="(nome completo)"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nome Artístico</Label>
                  <Input
                    value={contractedPartyData.stage_name}
                    onChange={(e) => setContractedPartyData({ ...contractedPartyData, stage_name: e.target.value })}
                    placeholder="(nome artístico)"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Nacionalidade</Label>
                  <Input
                    value={contractedPartyData.nationality}
                    onChange={(e) => setContractedPartyData({ ...contractedPartyData, nationality: e.target.value })}
                    placeholder="Ex: brasileiro(a)"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Idade</Label>
                  <Input
                    value={contractedPartyData.age}
                    onChange={(e) => setContractedPartyData({ ...contractedPartyData, age: e.target.value })}
                    placeholder="Ex: maior de idade"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Profissão</Label>
                  <Input
                    value={contractedPartyData.profession}
                    onChange={(e) => setContractedPartyData({ ...contractedPartyData, profession: e.target.value })}
                    placeholder="Ex: cantor(a)"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>RG</Label>
                  <Input
                    value={contractedPartyData.rg}
                    onChange={(e) => setContractedPartyData({ ...contractedPartyData, rg: e.target.value })}
                    placeholder="Número do RG"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Órgão Expedidor</Label>
                  <Input
                    value={contractedPartyData.rg_issuer}
                    onChange={(e) => setContractedPartyData({ ...contractedPartyData, rg_issuer: e.target.value })}
                    placeholder="Ex: SSP/MG"
                  />
                </div>
                <div className="space-y-2">
                  <Label>CPF</Label>
                  <Input
                    value={contractedPartyData.cpf}
                    onChange={(e) => setContractedPartyData({ ...contractedPartyData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Endereço Completo</Label>
                <Input
                  value={contractedPartyData.address}
                  onChange={(e) => setContractedPartyData({ ...contractedPartyData, address: e.target.value })}
                  placeholder="Rua, número, bairro, cidade/UF, CEP"
                />
              </div>
            </CardContent>
          </Card>

          {/* Header & Footer Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cabeçalho e Rodapé</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Header Upload */}
                <div className="space-y-2">
                  <Label>Imagem do Cabeçalho (Logo)</Label>
                  <input
                    ref={headerInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleHeaderUpload}
                    className="hidden"
                  />
                  {headerPreview ? (
                    <div className="relative border border-border rounded-lg p-4 bg-card">
                      <img src={headerPreview} alt="Cabeçalho" className="w-full h-auto" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveHeader}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-24 flex flex-col items-center justify-center gap-2"
                      onClick={() => headerInputRef.current?.click()}
                      disabled={isUploadingHeader}
                    >
                      {isUploadingHeader ? (
                        <span className="text-sm">Carregando...</span>
                      ) : (
                        <>
                          <Image className="h-6 w-6 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Clique para fazer upload</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Footer Upload */}
                <div className="space-y-2">
                  <Label>Imagem do Rodapé</Label>
                  <input
                    ref={footerInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFooterUpload}
                    className="hidden"
                  />
                  {footerPreview ? (
                    <div className="relative border border-border rounded-lg p-4 bg-card">
                      <img src={footerPreview} alt="Rodapé" className="w-full h-auto" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveFooter}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-24 flex flex-col items-center justify-center gap-2"
                      onClick={() => footerInputRef.current?.click()}
                      disabled={isUploadingFooter}
                    >
                      {isUploadingFooter ? (
                        <span className="text-sm">Carregando...</span>
                      ) : (
                        <>
                          <Image className="h-6 w-6 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Clique para fazer upload</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clauses */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Cláusulas</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={handleAddClause}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Cláusula
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {clauses.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Nenhuma cláusula adicionada. Clique em "Adicionar Cláusula" para começar.
                </p>
              ) : (
                clauses.map((clause, index) => (
                  <div key={clause.id} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">Cláusula {index + 1}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveClause(clause.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Título</Label>
                      <Input
                        value={clause.title}
                        onChange={(e) => handleUpdateClause(clause.id, 'title', e.target.value)}
                        placeholder="Ex: DO OBJETO"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Conteúdo</Label>
                      <Textarea
                        value={clause.content}
                        onChange={(e) => handleUpdateClause(clause.id, 'content', e.target.value)}
                        placeholder="Texto da cláusula... Use {{variavel}} para campos dinâmicos."
                        rows={4}
                      />
                      <p className="text-xs text-muted-foreground">
                        Variáveis disponíveis: {'{{contracted_name}}'}, {'{{royalties_percentage}}'}, {'{{start_date}}'}, {'{{end_date}}'}, {'{{fixed_value}}'}, {'{{advance_amount}}'}, {'{{work_title}}'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !formData.name || !formData.template_type}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar Template'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
