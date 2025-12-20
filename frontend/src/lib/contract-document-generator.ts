import jsPDF from 'jspdf';
import { ContractTemplate, ContractClause } from '@/services/contractTemplates';
import { formatDateBR } from '@/lib/utils';

export interface ContractData {
  // Contractor data (Lander Records)
  company_name: string;
  company_cnpj: string;
  company_address: string;
  company_email?: string;
  company_phone?: string;
  
  // Contracted party data
  contracted_name: string;
  contracted_cpf_cnpj: string;
  contracted_address: string;
  contracted_email?: string;
  contracted_phone?: string;
  contracted_stage_name?: string;
  
  // Contract details
  contract_title: string;
  service_type: string;
  start_date: string;
  end_date: string;
  
  // Financial data
  fixed_value?: number;
  royalties_percentage?: number;
  advance_amount?: number;
  financial_support?: number;
  
  // Work/phonogram data
  work_title?: string;
  phonogram_title?: string;
  isrc?: string;
  
  // Additional fields
  license_purpose?: string;
  license_type?: string;
  territory?: string;
  artist_percentage?: number;
  
  // Custom fields
  custom_fields?: Record<string, string>;
}

const LANDER_LOGO_BASE64 = ''; // Will use text header instead

// Default company data for Lander Produtora (fallback)
const DEFAULT_COMPANY_DATA = {
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
};

interface CompanyData {
  company_name: string;
  company_type: string;
  cnpj: string;
  company_address: string;
  representative_name: string;
  representative_nationality: string;
  representative_marital_status: string;
  representative_profession: string;
  representative_rg: string;
  representative_cpf: string;
  representative_address: string;
}

function getCompanyData(template: ContractTemplate): CompanyData {
  if (template.default_fields?.company_data) {
    return { ...DEFAULT_COMPANY_DATA, ...template.default_fields.company_data };
  }
  return DEFAULT_COMPANY_DATA;
}

// Contract types that use specific party structures
const PRODUCTION_CONTRACTS = ['producao_musical', 'producao_audiovisual', 'marketing', 'shows', 'distribuicao', 'licenciamento', 'edicao'];
const COLLABORATOR_CONTRACTS = ['colaborador', 'prestacao_servico'];
const AGENCY_CONTRACTS = ['agenciamento', 'gestao', 'empresariamento'];

// Helper function to determine party structure based on template type
function getPartyStructure(templateType: string): 'production' | 'collaborator' | 'agency' {
  const normalizedType = templateType.toLowerCase().replace(/[_\s-]/g, '_');
  
  if (AGENCY_CONTRACTS.some(t => normalizedType.includes(t))) {
    return 'agency';
  }
  if (COLLABORATOR_CONTRACTS.some(t => normalizedType.includes(t))) {
    return 'collaborator';
  }
  // Default to production structure for most contract types
  return 'production';
}

// Generate party text based on contract type
function generatePartiesHTML(templateType: string, data: ContractData, companyData: CompanyData): string {
  const structure = getPartyStructure(templateType);
  
  const landerFullText = `${companyData.company_name}, ${companyData.company_type}, inscrita no CNPJ nº ${companyData.cnpj}, com sede na ${companyData.company_address}, representada por ${companyData.representative_name}, ${companyData.representative_nationality}, ${companyData.representative_marital_status}, ${companyData.representative_profession}, portador do RG nº ${companyData.representative_rg} e CPF nº ${companyData.representative_cpf}, residente e domiciliado na ${companyData.representative_address}`;
  
  const contractedFullText = `${data.contracted_name || '(nome completo)'}, (nacionalidade), (idade), (profissão), portador(a) do RG nº _________ (órgão expedidor), CPF nº ${data.contracted_cpf_cnpj || '_______'}${data.contracted_stage_name ? `, cujo nome artístico é "${data.contracted_stage_name}"` : ''}, residente e domiciliado(a) em ${data.contracted_address || '(endereço completo)'}`;

  switch (structure) {
    case 'production':
      // Lander is CONTRATADO(A), Artist is CONTRATANTE
      return `
        <div class="party">
          <strong>CONTRATADO(A):</strong> ${landerFullText}, doravante denominado "<strong>CONTRATADO(A)</strong>".
        </div>
        <div class="party">
          <strong>CONTRATANTE:</strong> ${contractedFullText}, doravante denominado(a) "<strong>CONTRATANTE</strong>".
        </div>
      `;
    
    case 'collaborator':
      // Lander is CONTRATANTE, Collaborator is CONTRATADO(A)
      return `
        <div class="party">
          <strong>CONTRATANTE:</strong> ${landerFullText}, doravante denominado "<strong>CONTRATANTE</strong>".
        </div>
        <div class="party">
          <strong>CONTRATADO(A):</strong> ${contractedFullText}, doravante denominado(a) "<strong>CONTRATADO(A)</strong>".
        </div>
      `;
    
    case 'agency':
      // Lander is REPRESENTANTE, Artist is REPRESENTADO(A)
      return `
        <div class="party">
          <strong>REPRESENTANTE:</strong> ${landerFullText}, doravante denominado "<strong>REPRESENTANTE</strong>".
        </div>
        <div class="party">
          <strong>REPRESENTADO(A):</strong> ${contractedFullText}, doravante denominado(a) "<strong>REPRESENTADO(A)</strong>".
        </div>
      `;
  }
}

// Generate signatures based on contract type
function generateSignaturesHTML(templateType: string, data: ContractData, companyData: CompanyData): { leftLabel: string; rightLabel: string; leftName: string; rightName: string } {
  const structure = getPartyStructure(templateType);
  
  switch (structure) {
    case 'production':
      return {
        leftLabel: 'CONTRATADO(A)',
        rightLabel: 'CONTRATANTE',
        leftName: companyData.company_name,
        rightName: data.contracted_name
      };
    case 'collaborator':
      return {
        leftLabel: 'CONTRATANTE',
        rightLabel: 'CONTRATADO(A)',
        leftName: companyData.company_name,
        rightName: data.contracted_name
      };
    case 'agency':
      return {
        leftLabel: 'REPRESENTANTE',
        rightLabel: 'REPRESENTADO(A)',
        leftName: companyData.company_name,
        rightName: data.contracted_name
      };
  }
}

function numberToWords(num: number): string {
  const units = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const teens = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const tens = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const hundreds = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

  if (num === 0) return 'zero';
  if (num === 100) return 'cem';
  
  let words = '';
  
  if (num >= 100) {
    words += hundreds[Math.floor(num / 100)];
    num %= 100;
    if (num > 0) words += ' e ';
  }
  
  if (num >= 20) {
    words += tens[Math.floor(num / 10)];
    num %= 10;
    if (num > 0) words += ' e ';
  } else if (num >= 10) {
    words += teens[num - 10];
    return words;
  }
  
  if (num > 0) {
    words += units[num];
  }
  
  return words;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function replaceVariables(text: string, data: ContractData): string {
  const replacements: Record<string, string> = {
    '{{company_name}}': data.company_name || 'LANDER RECORDS LTDA',
    '{{company_cnpj}}': data.company_cnpj || '',
    '{{company_address}}': data.company_address || 'São Paulo/SP',
    '{{company_email}}': data.company_email || 'contato@lander360.com',
    '{{company_phone}}': data.company_phone || '',
    '{{contracted_name}}': data.contracted_name || '',
    '{{contracted_cpf_cnpj}}': data.contracted_cpf_cnpj || '',
    '{{contracted_address}}': data.contracted_address || '',
    '{{contracted_email}}': data.contracted_email || '',
    '{{contracted_phone}}': data.contracted_phone || '',
    '{{contracted_stage_name}}': data.contracted_stage_name || data.contracted_name || '',
    '{{contract_title}}': data.contract_title || '',
    '{{service_type}}': data.service_type || '',
    '{{start_date}}': formatDateBR(data.start_date) || '',
    '{{end_date}}': formatDateBR(data.end_date) || '',
    '{{fixed_value}}': data.fixed_value ? formatCurrency(data.fixed_value) : '',
    '{{royalties_percentage}}': data.royalties_percentage?.toString() || '',
    '{{royalties_percentage_extenso}}': data.royalties_percentage ? numberToWords(data.royalties_percentage) + ' por cento' : '',
    '{{advance_amount}}': data.advance_amount ? formatCurrency(data.advance_amount) : '',
    '{{financial_support}}': data.financial_support ? formatCurrency(data.financial_support) : '',
    '{{work_title}}': data.work_title || '',
    '{{phonogram_title}}': data.phonogram_title || '',
    '{{isrc}}': data.isrc || '',
    '{{license_purpose}}': data.license_purpose || '',
    '{{license_type}}': data.license_type || '',
    '{{territory}}': data.territory || 'Brasil',
    '{{artist_percentage}}': data.artist_percentage?.toString() || '',
    '{{current_date}}': formatDateBR(new Date().toISOString()) || '',
    '{{current_year}}': new Date().getFullYear().toString(),
  };

  // Add custom fields
  if (data.custom_fields) {
    Object.entries(data.custom_fields).forEach(([key, value]) => {
      replacements[`{{${key}}}`] = value;
    });
  }

  let result = text;
  Object.entries(replacements).forEach(([placeholder, value]) => {
    result = result.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
  });


  return result;
}

// Helper function to extract image URL from HTML
function extractImageUrl(html: string | null): string | null {
  if (!html) return null;
  const match = html.match(/src=["']([^"']+)["']/);
  return match ? match[1] : null;
}

export function generateContractHTML(template: ContractTemplate, data: ContractData, customClauses?: ContractClause[]): string {
  // Use custom clauses if provided, otherwise use template clauses
  const clauses = customClauses && customClauses.length > 0 ? customClauses : (template.clauses || []);
  console.log('generateContractHTML - template:', template.name);
  console.log('generateContractHTML - customClauses provided:', customClauses?.length || 0);
  console.log('generateContractHTML - template.clauses:', template.clauses?.length || 0);
  console.log('generateContractHTML - using clauses count:', clauses.length);
  
  const companyData = getCompanyData(template);
  
  // Generate header HTML - use template header_html if available, with full width
  const headerImageUrl = extractImageUrl(template.header_html);
  const headerContent = headerImageUrl 
    ? `<div class="header-container"><img src="${headerImageUrl}" alt="Cabeçalho" /></div>`
    : `<div class="header">
        <div class="logo-text">LANDER RECORDS</div>
        <div class="tagline">360º Artist Management</div>
      </div>`;
  
  // Generate footer HTML - use template footer_html if available, with full width
  const footerImageUrl = extractImageUrl(template.footer_html);
  const footerContent = footerImageUrl 
    ? `<div class="footer-container"><img src="${footerImageUrl}" alt="Rodapé" /></div>`
    : '';
  
  let html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      margin: 0;
    }
    body {
      font-family: 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #000;
      margin: 0;
      padding: 0;
      text-align: justify;
    }
    .header-container {
      width: 100%;
      margin: 0;
      padding: 0;
    }
    .header-container img {
      width: 100%;
      display: block;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #c41e3a;
      padding: 20px 25mm;
      margin-bottom: 30px;
    }
    .logo-text {
      font-size: 24pt;
      font-weight: bold;
      color: #c41e3a;
      letter-spacing: 2px;
    }
    .tagline {
      font-size: 10pt;
      color: #666;
      margin-top: 5px;
    }
    .content {
      padding: 20px 25mm;
      text-align: justify;
    }
    .title {
      font-size: 16pt;
      font-weight: bold;
      text-align: center;
      margin: 30px 0;
      text-transform: uppercase;
    }
    .parties {
      margin-bottom: 30px;
    }
    .party {
      margin-bottom: 20px;
      text-align: justify;
    }
    .party-label {
      font-weight: bold;
      text-transform: uppercase;
    }
    .clause {
      margin-bottom: 20px;
      text-align: justify;
    }
    .clause-title {
      font-weight: bold;
      margin-bottom: 10px;
    }
    .clause-content {
      text-align: justify;
    }
    .signatures {
      margin-top: 60px;
      display: flex;
      justify-content: space-between;
    }
    .signature-block {
      text-align: center;
      width: 45%;
    }
    .signature-line {
      border-top: 1px solid #000;
      margin-top: 60px;
      padding-top: 10px;
    }
    .footer-container {
      width: 100%;
      margin: 0;
      padding: 0;
      margin-top: 40px;
    }
    .footer-container img {
      width: 100%;
      display: block;
    }
    .footer {
      text-align: center;
      font-size: 9pt;
      color: #666;
      border-top: 1px solid #c41e3a;
      padding-top: 10px;
      margin-top: 40px;
    }
  </style>
</head>
<body>
  ${headerContent}

  <div class="content">
    <div class="title">${replaceVariables(template.name, data)}</div>

    <div class="parties">
      ${generatePartiesHTML(template.template_type, data, companyData)}
    </div>

    <p style="text-align: justify; margin-bottom: 20px;">As partes acima identificadas têm, entre si, justo e acordado o presente instrumento particular, que se regerá pelas cláusulas seguintes e pelas condições descritas no presente.</p>
`;

  // Add clauses
  clauses.forEach((clause, index) => {
    const clauseNumber = index + 1;
    html += `
    <div class="clause">
      <div class="clause-title">CLÁUSULA ${clauseNumber}ª - ${clause.title}</div>
      <div class="clause-content">${replaceVariables(clause.content, data)}</div>
    </div>
`;
  });

  // Get signature labels based on contract type
  const signatures = generateSignaturesHTML(template.template_type, data, companyData);

  // Add signatures
  html += `
    <p style="text-align: justify; margin-top: 40px;">E, por estarem assim justos e contratados, firmam o presente instrumento, em 2 (duas) vias de igual teor, juntamente com 2 (duas) testemunhas.</p>

    

    <div class="signatures">
      <div class="signature-block">
        <div class="signature-line">
          <strong>${signatures.leftName}</strong><br>
          <strong>${signatures.leftLabel}</strong>
        </div>
      </div>
      <div class="signature-block">
        <div class="signature-line">
          <strong>${signatures.rightName}</strong><br>
          <strong>${signatures.rightLabel}</strong>
        </div>
      </div>
    </div>

    <div style="margin-top: 60px;">
      <p><strong>TESTEMUNHAS:</strong></p>
      <div class="signatures">
        <div class="signature-block">
          <div class="signature-line">
            Nome:<br>
            CPF:
          </div>
        </div>
        <div class="signature-block">
          <div class="signature-line">
            Nome:<br>
            CPF:
          </div>
        </div>
      </div>
    </div>

  </div>

  ${footerContent}
</body>
</html>
`;

  return html;
}

// Helper function to load image as base64
async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error loading image:', error);
    return null;
  }
}

// Helper function to get image dimensions
function getImageDimensions(base64: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = base64;
  });
}

export async function generateContractPDF(template: ContractTemplate, data: ContractData, customClauses?: ContractClause[]): Promise<jsPDF> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const clauses = customClauses || template.clauses;
  const companyData = getCompanyData(template);
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 25;
  const contentWidth = pageWidth - (margin * 2);
  let yPosition = 0;

  // Load header and footer images
  const headerImageUrl = extractImageUrl(template.header_html);
  const footerImageUrl = extractImageUrl(template.footer_html);
  
  let headerBase64: string | null = null;
  let footerBase64: string | null = null;
  let headerHeight = 0;
  let footerHeight = 0;

  if (headerImageUrl) {
    headerBase64 = await loadImageAsBase64(headerImageUrl);
    if (headerBase64) {
      const dims = await getImageDimensions(headerBase64);
      // Calculate height maintaining aspect ratio for full width
      headerHeight = (dims.height / dims.width) * pageWidth;
    }
  }

  if (footerImageUrl) {
    footerBase64 = await loadImageAsBase64(footerImageUrl);
    if (footerBase64) {
      const dims = await getImageDimensions(footerBase64);
      // Calculate height maintaining aspect ratio for full width
      footerHeight = (dims.height / dims.width) * pageWidth;
    }
  }

  const addHeader = () => {
    if (headerBase64) {
      pdf.addImage(headerBase64, 'PNG', 0, 0, pageWidth, headerHeight);
      yPosition = headerHeight + 10;
    } else {
      yPosition = margin;
      // Logo text
      pdf.setFontSize(24);
      pdf.setTextColor(196, 30, 58); // #c41e3a
      pdf.setFont('helvetica', 'bold');
      pdf.text('LANDER RECORDS', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;

      // Tagline
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.setFont('helvetica', 'normal');
      pdf.text('360º Artist Management', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 5;

      // Line
      pdf.setDrawColor(196, 30, 58);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 15;
    }
  };

  const addFooter = () => {
    if (footerBase64) {
      const footerY = pageHeight - footerHeight;
      pdf.addImage(footerBase64, 'PNG', 0, footerY, pageWidth, footerHeight);
    } else {
      const footerY = pageHeight - 15;
      pdf.setDrawColor(196, 30, 58);
      pdf.setLineWidth(0.3);
      pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
      
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${companyData.company_name} | ${data.company_email || 'contato@lander360.com'} | ${companyData.company_address}`, pageWidth / 2, footerY, { align: 'center' });
    }
    // Page numbering removed as per requirement
  };

  const getContentEndY = () => {
    return footerBase64 ? pageHeight - footerHeight - 10 : pageHeight - 30;
  };

  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > getContentEndY()) {
      addFooter();
      pdf.addPage();
      addHeader();
    }
  };

  const addWrappedText = (text: string, fontSize: number, fontStyle: string = 'normal', indent: number = 0) => {
    pdf.setFontSize(fontSize);
    pdf.setFont('times', fontStyle);
    pdf.setTextColor(0, 0, 0);
    
    const processedText = replaceVariables(text, data);
    const lines = pdf.splitTextToSize(processedText, contentWidth - indent);
    
    lines.forEach((line: string) => {
      checkPageBreak(6);
      pdf.text(line, margin + indent, yPosition);
      yPosition += fontSize * 0.4;
    });
    
    return lines.length;
  };

  // Start document
  addHeader();

  // Title
  pdf.setFontSize(14);
  pdf.setFont('times', 'bold');
  pdf.setTextColor(0, 0, 0);
  const titleText = replaceVariables(template.name.toUpperCase(), data);
  pdf.text(titleText, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Get party structure based on template type
  const partyStructure = getPartyStructure(template.template_type);
  const signatures = generateSignaturesHTML(template.template_type, data, companyData);
  
  // Determine labels based on contract type
  let firstPartyLabel = 'CONTRATANTE:';
  let secondPartyLabel = 'CONTRATADO(A):';
  
  if (partyStructure === 'production') {
    firstPartyLabel = 'CONTRATADO(A):';
    secondPartyLabel = 'CONTRATANTE:';
  } else if (partyStructure === 'agency') {
    firstPartyLabel = 'REPRESENTANTE:';
    secondPartyLabel = 'REPRESENTADO(A):';
  }

  // Parties - Lander first
  pdf.setFontSize(11);
  pdf.setFont('times', 'bold');
  pdf.text(firstPartyLabel, margin, yPosition);
  yPosition += 5;
  
  pdf.setFont('times', 'normal');
  const landerText = `${companyData.company_name}, ${companyData.company_type}, inscrita no CNPJ nº ${companyData.cnpj}, com sede na ${companyData.company_address}, representada por ${companyData.representative_name}, ${companyData.representative_nationality}, ${companyData.representative_marital_status}, ${companyData.representative_profession}, portador do RG nº ${companyData.representative_rg} e CPF nº ${companyData.representative_cpf}, residente e domiciliado na ${companyData.representative_address}, doravante denominado "${firstPartyLabel.replace(':', '')}".`;
  addWrappedText(landerText, 11);
  yPosition += 8;

  pdf.setFont('times', 'bold');
  pdf.text(secondPartyLabel, margin, yPosition);
  yPosition += 5;
  
  pdf.setFont('times', 'normal');
  const contractedText = `${data.contracted_name || '(nome completo)'}, (nacionalidade), (idade), (profissão), portador(a) do RG nº _________ (órgão expedidor), CPF nº ${data.contracted_cpf_cnpj || '_______'}${data.contracted_stage_name ? `, cujo nome artístico é "${data.contracted_stage_name}"` : ''}, residente e domiciliado(a) em ${data.contracted_address || '(endereço completo)'}, doravante denominado(a) "${secondPartyLabel.replace(':', '')}".`;
  addWrappedText(contractedText, 11);
  yPosition += 10;

  // Intro text
  addWrappedText('As partes acima identificadas têm, entre si, justo e acordado o presente instrumento particular, que se regerá pelas cláusulas seguintes e pelas condições descritas no presente.', 11);
  yPosition += 10;

  // Clauses
  clauses.forEach((clause, index) => {
    checkPageBreak(20);
    
    const clauseNumber = index + 1;
    pdf.setFont('times', 'bold');
    pdf.setFontSize(11);
    pdf.text(`CLÁUSULA ${clauseNumber}ª - ${clause.title}`, margin, yPosition);
    yPosition += 6;
    
    pdf.setFont('times', 'normal');
    addWrappedText(clause.content, 11, 'normal', 10);
    yPosition += 8;
  });

  // Closing
  yPosition += 10;
  addWrappedText('E, por estarem assim justos e contratados, firmam o presente instrumento, em 2 (duas) vias de igual teor, juntamente com 2 (duas) testemunhas.', 11);
  yPosition += 15;

  // Date and place
  pdf.setFont('times', 'normal');
  pdf.text(`${companyData.company_address.split(',').slice(0, 2).join(',')}, ${formatDateBR(new Date().toISOString())}.`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 30;

  // Signatures
  checkPageBreak(60);
  
  const sigWidth = (contentWidth - 20) / 2;
  const leftSigX = margin;
  const rightSigX = margin + sigWidth + 20;
  
  // Signature lines
  pdf.setLineWidth(0.3);
  pdf.setDrawColor(0, 0, 0);
  pdf.line(leftSigX, yPosition, leftSigX + sigWidth, yPosition);
  pdf.line(rightSigX, yPosition, rightSigX + sigWidth, yPosition);
  yPosition += 5;
  
  pdf.setFont('times', 'bold');
  pdf.setFontSize(10);
  pdf.text(signatures.leftName, leftSigX + sigWidth / 2, yPosition, { align: 'center' });
  pdf.text(signatures.rightName, rightSigX + sigWidth / 2, yPosition, { align: 'center' });
  yPosition += 4;
  
  pdf.setFont('times', 'bold');
  pdf.text(signatures.leftLabel, leftSigX + sigWidth / 2, yPosition, { align: 'center' });
  pdf.text(signatures.rightLabel, rightSigX + sigWidth / 2, yPosition, { align: 'center' });
  yPosition += 25;

  // Witnesses
  checkPageBreak(40);
  pdf.setFont('times', 'bold');
  pdf.text('TESTEMUNHAS:', margin, yPosition);
  yPosition += 20;
  
  pdf.line(leftSigX, yPosition, leftSigX + sigWidth, yPosition);
  pdf.line(rightSigX, yPosition, rightSigX + sigWidth, yPosition);
  yPosition += 5;
  
  pdf.setFont('times', 'normal');
  pdf.setFontSize(9);
  pdf.text('Nome:', leftSigX, yPosition);
  pdf.text('Nome:', rightSigX, yPosition);
  yPosition += 4;
  pdf.text('CPF:', leftSigX, yPosition);
  pdf.text('CPF:', rightSigX, yPosition);

  // Add footer to last page
  addFooter();

  return pdf;
}

export async function downloadContractPDF(template: ContractTemplate, data: ContractData, customClauses?: ContractClause[]): Promise<void> {
  const pdf = await generateContractPDF(template, data, customClauses);
  const filename = `contrato_${template.template_type}_${data.contracted_name.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);
}

export async function getContractPDFBlob(template: ContractTemplate, data: ContractData, customClauses?: ContractClause[]): Promise<Blob> {
  const pdf = await generateContractPDF(template, data, customClauses);
  return pdf.output('blob');
}
