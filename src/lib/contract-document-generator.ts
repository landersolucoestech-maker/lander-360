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

export function generateContractHTML(template: ContractTemplate, data: ContractData, customClauses?: ContractClause[]): string {
  const clauses = customClauses || template.clauses;
  
  // Generate header HTML - use template header_html if available
  const headerContent = template.header_html 
    ? template.header_html 
    : `<div class="header">
        <div class="logo-text">LANDER RECORDS</div>
        <div class="tagline">360º Artist Management</div>
      </div>`;
  
  // Generate footer HTML - use template footer_html if available
  const footerContent = template.footer_html 
    ? template.footer_html 
    : '';
  
  let html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      margin: 2.5cm;
      @top-center {
        content: element(header);
      }
      @bottom-center {
        content: element(footer);
      }
    }
    body {
      font-family: 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #000;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #c41e3a;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header img {
      width: 100%;
      max-width: 794px;
      height: auto;
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
      text-indent: 2em;
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
    .footer {
      text-align: center;
      font-size: 9pt;
      color: #666;
      border-top: 1px solid #c41e3a;
      padding-top: 10px;
      margin-top: 40px;
    }
    .footer img {
      width: 100%;
      max-width: 794px;
      height: auto;
    }
    .template-footer {
      text-align: center;
      margin-top: 40px;
    }
    .template-footer img {
      width: 100%;
      max-width: 794px;
      height: auto;
    }
  </style>
</head>
<body>
  ${headerContent}

  <div class="title">${replaceVariables(template.name, data)}</div>

  <div class="parties">
    <div class="party">
      <span class="party-label">CONTRATANTE:</span> ${data.company_name || 'LANDER RECORDS LTDA'}, pessoa jurídica de direito privado, inscrita no CNPJ sob nº ${data.company_cnpj || 'XX.XXX.XXX/0001-XX'}, com sede em ${data.company_address || 'São Paulo/SP'}, neste ato representada por seu representante legal.
    </div>
    <div class="party">
      <span class="party-label">CONTRATADO(A):</span> ${data.contracted_name}${data.contracted_stage_name && data.contracted_stage_name !== data.contracted_name ? `, nome artístico "${data.contracted_stage_name}"` : ''}, inscrito(a) no CPF/CNPJ sob nº ${data.contracted_cpf_cnpj || 'XXX.XXX.XXX-XX'}, residente em ${data.contracted_address || 'endereço a informar'}.
    </div>
  </div>

  <p style="text-align: justify;">As partes acima identificadas têm, entre si, justo e acordado o presente instrumento particular, que se regerá pelas cláusulas seguintes e pelas condições descritas no presente.</p>
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

  // Add signatures
  html += `
  <p style="text-align: justify; margin-top: 40px;">E, por estarem assim justos e contratados, firmam o presente instrumento, em 2 (duas) vias de igual teor, juntamente com 2 (duas) testemunhas.</p>

  <p style="text-align: center; margin-top: 30px;">${data.company_address || 'São Paulo/SP'}, ${formatDateBR(new Date().toISOString())}.</p>

  <div class="signatures">
    <div class="signature-block">
      <div class="signature-line">
        <strong>${data.company_name || 'LANDER RECORDS LTDA'}</strong><br>
        CONTRATANTE
      </div>
    </div>
    <div class="signature-block">
      <div class="signature-line">
        <strong>${data.contracted_name}</strong><br>
        CONTRATADO(A)
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

  ${footerContent ? `<div class="template-footer">${footerContent}</div>` : ''}

  <div class="footer">
    <p>LANDER RECORDS LTDA | ${data.company_email || 'contato@lander360.com'} | ${data.company_address || 'São Paulo/SP'}</p>
    <p>Este documento foi gerado eletronicamente pelo sistema Lander 360º</p>
  </div>
</body>
</html>
`;

  return html;
}

export function generateContractPDF(template: ContractTemplate, data: ContractData, customClauses?: ContractClause[]): jsPDF {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const clauses = customClauses || template.clauses;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 25;
  const contentWidth = pageWidth - (margin * 2);
  let yPosition = margin;

  const addHeader = () => {
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
  };

  const addFooter = () => {
    const footerY = pageHeight - 15;
    pdf.setDrawColor(196, 30, 58);
    pdf.setLineWidth(0.3);
    pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`LANDER RECORDS LTDA | ${data.company_email || 'contato@lander360.com'} | ${data.company_address || 'São Paulo/SP'}`, pageWidth / 2, footerY, { align: 'center' });
    pdf.text(`Página ${pdf.getNumberOfPages()}`, pageWidth / 2, footerY + 4, { align: 'center' });
  };

  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - 30) {
      addFooter();
      pdf.addPage();
      yPosition = margin;
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

  // Parties
  pdf.setFontSize(11);
  pdf.setFont('times', 'bold');
  pdf.text('CONTRATANTE:', margin, yPosition);
  yPosition += 5;
  
  pdf.setFont('times', 'normal');
  const contractorText = `${data.company_name || 'LANDER RECORDS LTDA'}, pessoa jurídica de direito privado, inscrita no CNPJ sob nº ${data.company_cnpj || 'XX.XXX.XXX/0001-XX'}, com sede em ${data.company_address || 'São Paulo/SP'}, neste ato representada por seu representante legal.`;
  addWrappedText(contractorText, 11);
  yPosition += 8;

  pdf.setFont('times', 'bold');
  pdf.text('CONTRATADO(A):', margin, yPosition);
  yPosition += 5;
  
  pdf.setFont('times', 'normal');
  const contractedText = `${data.contracted_name}${data.contracted_stage_name && data.contracted_stage_name !== data.contracted_name ? `, nome artístico "${data.contracted_stage_name}"` : ''}, inscrito(a) no CPF/CNPJ sob nº ${data.contracted_cpf_cnpj || 'XXX.XXX.XXX-XX'}, residente em ${data.contracted_address || 'endereço a informar'}.`;
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
  pdf.text(`${data.company_address || 'São Paulo/SP'}, ${formatDateBR(new Date().toISOString())}.`, pageWidth / 2, yPosition, { align: 'center' });
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
  pdf.text(data.company_name || 'LANDER RECORDS LTDA', leftSigX + sigWidth / 2, yPosition, { align: 'center' });
  pdf.text(data.contracted_name, rightSigX + sigWidth / 2, yPosition, { align: 'center' });
  yPosition += 4;
  
  pdf.setFont('times', 'normal');
  pdf.text('CONTRATANTE', leftSigX + sigWidth / 2, yPosition, { align: 'center' });
  pdf.text('CONTRATADO(A)', rightSigX + sigWidth / 2, yPosition, { align: 'center' });
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

export function downloadContractPDF(template: ContractTemplate, data: ContractData, customClauses?: ContractClause[]): void {
  const pdf = generateContractPDF(template, data, customClauses);
  const filename = `contrato_${template.template_type}_${data.contracted_name.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);
}

export function getContractPDFBlob(template: ContractTemplate, data: ContractData, customClauses?: ContractClause[]): Blob {
  const pdf = generateContractPDF(template, data, customClauses);
  return pdf.output('blob');
}
