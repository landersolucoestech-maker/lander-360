import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Send, Printer, Mail } from 'lucide-react';
import { ContractTemplate, ContractClause } from '@/services/contractTemplates';
import { ContractData, downloadContractPDF, generateContractHTML, getContractPDFBlob } from '@/lib/contract-document-generator';
import { useContractTemplates } from '@/hooks/useContractTemplates';
import { useArtists } from '@/hooks/useArtists';
import { Contract } from '@/types/database';
import { AutoContractService } from '@/services/autoContractService';
import { useToast } from '@/hooks/use-toast';

interface GenerateContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract?: Contract | null;
  onDocumentGenerated?: (contractId: string, documentContent: string) => void;
}

export const GenerateContractModal: React.FC<GenerateContractModalProps> = ({
  isOpen,
  onClose,
  contract,
  onDocumentGenerated,
}) => {
  const { data: templates = [] } = useContractTemplates();
  const { data: artists = [] } = useArtists();
  const { toast } = useToast();

  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [customClauses, setCustomClauses] = useState<ContractClause[]>([]);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [isSending, setIsSending] = useState(false);

  const [contractData, setContractData] = useState<ContractData>({
    company_name: 'Lander Produtora',
    company_cnpj: '50.056.858/0001-46',
    company_address: 'Rua A, nº 58, Bairro Vila Império, Governador Valadares/MG, CEP 35050-560',
    company_email: 'contato@lander360.com',
    contracted_name: '',
    contracted_cpf_cnpj: '',
    contracted_address: '',
    contracted_email: '',
    contracted_artistic_name: '',
    contract_title: '',
    service_type: '',
    start_date: '',
    end_date: '',
    fixed_value: undefined,
    royalties_percentage: undefined,
    advance_amount: undefined,
    work_title: '',
  });

  // Load contract data and template when modal opens
  useEffect(() => {
    if (!contract || !isOpen) {
      return;
    }
    
    // Wait for templates to be loaded
    if (templates.length === 0) {
      console.log('GenerateContractModal - Templates not loaded yet');
      return;
    }
    
    const artist = artists.find(a => a.id === contract.artist_id);
      
      // Find matching template - first by template_id, then by name (title), then by service_type
      let matchingTemplate = null;
      
      if (contract.template_id) {
        matchingTemplate = templates.find(t => t.id === contract.template_id);
      }
      
      if (!matchingTemplate && contract.title) {
        matchingTemplate = templates.find(t => t.name === contract.title);
      }
      
      if (!matchingTemplate && contract.service_type) {
        matchingTemplate = templates.find(t => t.template_type === contract.service_type);
      }

      console.log('GenerateContractModal - Contract:', contract);
      console.log('GenerateContractModal - Contract title:', contract.title);
      console.log('GenerateContractModal - Matching template:', matchingTemplate);
      console.log('GenerateContractModal - Template clauses:', matchingTemplate?.clauses);
      console.log('GenerateContractModal - Available templates:', templates.map(t => ({ id: t.id, name: t.name, type: t.template_type, clausesCount: t.clauses?.length })));
      
      if (matchingTemplate) {
        // Ensure clauses is an array
        const templateClauses = Array.isArray(matchingTemplate.clauses) 
          ? matchingTemplate.clauses 
          : [];
        
        console.log('GenerateContractModal - Using clauses:', templateClauses);
        
        setSelectedTemplate(matchingTemplate);
        setCustomClauses(templateClauses);
        
        // Load company data from template default_fields
        const defaultFields = matchingTemplate.default_fields || {};
        const companyData = defaultFields.companyData || {};
        
        setContractData({
          company_name: companyData.legal_name || companyData.company_name || 'Lander Produtora',
          company_cnpj: companyData.cnpj || companyData.company_cnpj || '50.056.858/0001-46',
          company_address: companyData.address || companyData.company_address || 'Rua A, nº 58, Bairro Vila Império, Governador Valadares/MG, CEP 35050-560',
          company_email: companyData.email || companyData.company_email || 'contato@lander360.com',
          contracted_name: artist?.full_name || artist?.name || '',
          // Note: cpf_cnpj and full_address are now in artist_sensitive_data table (admin only)
          contracted_cpf_cnpj: '',
          contracted_address: '',
          contracted_email: artist?.email || '',
          contracted_artistic_name: artist?.name || '',
          contract_title: contract.title,
          service_type: contract.service_type || matchingTemplate.template_type || '',
          start_date: contract.effective_from || contract.start_date || '',
          end_date: contract.effective_to || contract.end_date || '',
          fixed_value: contract.fixed_value || contract.value || undefined,
          royalties_percentage: contract.royalties_percentage || contract.royalty_rate || undefined,
          advance_amount: contract.advance_amount || undefined,
          work_title: contract.title || '',
        });
      } else {
        // No template found, reset states
        setSelectedTemplate(null);
        setCustomClauses([]);
        setContractData(prev => ({
          ...prev,
          contracted_name: artist?.full_name || artist?.name || '',
          // Note: cpf_cnpj and full_address are now in artist_sensitive_data table (admin only)
          contracted_cpf_cnpj: '',
          contracted_address: '',
          contracted_email: artist?.email || '',
          contracted_artistic_name: artist?.name || '',
          contract_title: contract.title,
          service_type: contract.service_type || '',
          start_date: contract.effective_from || contract.start_date || '',
          end_date: contract.effective_to || contract.end_date || '',
          fixed_value: contract.fixed_value || contract.value || undefined,
          royalties_percentage: contract.royalties_percentage || contract.royalty_rate || undefined,
          advance_amount: contract.advance_amount || undefined,
          work_title: contract.title || '',
        }));
      }
  }, [contract, artists, templates, isOpen]);

  // Generate preview when template or data changes
  useEffect(() => {
    console.log('Preview generation check - selectedTemplate:', selectedTemplate);
    console.log('Preview generation check - contractData.contracted_name:', contractData.contracted_name);
    console.log('Preview generation check - customClauses:', customClauses);
    
    if (selectedTemplate) {
      // Use customClauses if available, otherwise use template clauses
      const clausesToUse = customClauses.length > 0 ? customClauses : selectedTemplate.clauses || [];
      console.log('Preview generation - using clauses:', clausesToUse);
      
      const html = generateContractHTML(selectedTemplate, contractData, clausesToUse);
      console.log('Preview generation - generated HTML length:', html.length);
      setPreviewHtml(html);
    } else {
      setPreviewHtml('');
    }
  }, [selectedTemplate, contractData, customClauses]);

  const handlePrint = () => {
    if (!previewHtml) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Contrato - ${contractData.contract_title}</title>
            <style>
              @media print {
                body { margin: 0; padding: 20px; }
              }
            </style>
          </head>
          <body>
            ${previewHtml}
            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() { window.close(); }
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleDownloadPDF = async () => {
    if (selectedTemplate) {
      try {
        await downloadContractPDF(selectedTemplate, contractData, customClauses);
        toast({
          title: 'PDF gerado',
          description: 'O contrato foi baixado com sucesso.',
        });
      } catch (error) {
        console.error('Error generating PDF:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao gerar o PDF.',
          variant: 'destructive',
        });
      }
    }
  };

  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleSendEmail = async () => {
    if (!contractData.contracted_email) {
      toast({
        title: 'E-mail não encontrado',
        description: 'O contratado não possui e-mail cadastrado.',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedTemplate) {
      toast({
        title: 'Template não encontrado',
        description: 'Selecione um template para gerar o contrato.',
        variant: 'destructive',
      });
      return;
    }

    setIsSendingEmail(true);
    try {
      // Generate PDF as base64
      const pdfBlob = await getContractPDFBlob(selectedTemplate, contractData, customClauses);
      const pdfBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(pdfBlob);
      });

      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase.functions.invoke('send-contract-email', {
        body: {
          to: contractData.contracted_email,
          recipientName: contractData.contracted_name || 'Prezado(a)',
          contractTitle: contractData.contract_title || contract?.title || 'Contrato',
          pdfBase64: pdfBase64,
          companyName: contractData.company_name,
        },
      });

      if (error) throw error;

      toast({
        title: 'E-mail enviado',
        description: `O contrato foi enviado para ${contractData.contracted_email}.`,
      });
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast({
        title: 'Erro ao enviar e-mail',
        description: error.message || 'Não foi possível enviar o e-mail.',
        variant: 'destructive',
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleSendToSignature = async () => {
    if (!contract || !selectedTemplate) {
      toast({
        title: 'Erro',
        description: 'Contrato ou template não encontrado.',
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
      const htmlContent = generateContractHTML(selectedTemplate, contractData, customClauses);
      
      if (onDocumentGenerated) {
        onDocumentGenerated(contract.id, htmlContent);
      }

      // Generate PDF as base64 for Autentique
      const pdfBlob = await getContractPDFBlob(selectedTemplate, contractData, customClauses);
      const pdfBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(pdfBlob);
      });

      const result = await AutoContractService.requestDigitalSignature(contract.id, pdfBase64);
      
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

  const hasPreview = !!previewHtml;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <FileText className="h-5 w-5" />
            Prévia do Contrato
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto max-h-[65vh]">
          <Card className="m-1">
            <CardHeader className="py-3">
              <CardTitle className="text-sm">
                {contractData.contract_title || 'Documento do Contrato'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasPreview ? (
                <div 
                  className="border border-border rounded-lg p-4 sm:p-6 bg-white text-black"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum template encontrado para este tipo de serviço.</p>
                  <p className="text-sm mt-2">Cadastre um template em Configurações &gt; Templates de Contrato.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Fechar
          </Button>
          
          <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              onClick={handlePrint}
              disabled={!hasPreview}
              className="flex-1 sm:flex-none"
            >
              <Printer className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Imprimir</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={handleDownloadPDF}
              disabled={!hasPreview}
              className="flex-1 sm:flex-none"
            >
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Baixar PDF</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={handleSendEmail}
              disabled={!hasPreview || !contractData.contracted_email || isSendingEmail}
              className="flex-1 sm:flex-none"
            >
              <Mail className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{isSendingEmail ? 'Enviando...' : 'E-mail'}</span>
            </Button>
            
            <Button
              onClick={handleSendToSignature}
              disabled={!hasPreview || !contractData.contracted_email || isSending}
              className="flex-1 sm:flex-none"
            >
              <Send className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{isSending ? 'Enviando...' : 'Autentique'}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
