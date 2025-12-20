import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface ReportTemplate {
  id: string;
  name: string;
  format: 'pdf' | 'excel';
  layout: ReportLayout;
  styling: ReportStyling;
  fields: ReportField[];
}

export interface ReportLayout {
  orientation: 'portrait' | 'landscape';
  pageSize: 'A4' | 'A3' | 'Letter';
  margins: { top: number; right: number; bottom: number; left: number; };
  header: { show: boolean; height: number; content: string; };
  footer: { show: boolean; height: number; content: string; };
  logo: { show: boolean; position: 'left' | 'center' | 'right'; size: number; url?: string; };
}

export interface ReportStyling {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
    border: string;
  };
  fonts: {
    title: { family: string; size: number; weight: string; };
    header: { family: string; size: number; weight: string; };
    body: { family: string; size: number; weight: string; };
  };
  tables: {
    showBorders: boolean;
    alternateRows: boolean;
    headerBg: string;
    rowHeight: number;
  };
}

export interface ReportField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'currency' | 'boolean';
  show: boolean;
  width?: number;
  format?: string;
}

// Helper function to format values based on field type
const formatValue = (value: any, field: ReportField): string => {
  if (value === null || value === undefined) return '-';
  
  switch (field.type) {
    case 'currency':
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(numValue || 0);
    
    case 'date':
      if (!value) return '-';
      const date = new Date(value);
      return date.toLocaleDateString('pt-BR');
    
    case 'number':
      const num = typeof value === 'string' ? parseFloat(value) : value;
      return (num || 0).toLocaleString('pt-BR');
    
    case 'boolean':
      return value ? 'Sim' : 'Não';
    
    default:
      return String(value || '-');
  }
};

// Helper function to replace template variables
const replaceVariables = (text: string, data: any[]): string => {
  const now = new Date();
  return text
    .replace(/\{\{companyName\}\}/g, 'GESTÃO 360')
    .replace(/\{\{reportTitle\}\}/g, 'Relatório Personalizado')
    .replace(/\{\{date\}\}/g, now.toLocaleDateString('pt-BR'))
    .replace(/\{\{time\}\}/g, now.toLocaleTimeString('pt-BR'))
    .replace(/\{\{recordCount\}\}/g, String(data.length))
    .replace(/\{\{pageNumber\}\}/g, '1')
    .replace(/\{\{totalPages\}\}/g, '1')
    .replace(/\{\{period\}\}/g, `${now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`);
};

export const generatePDFReport = async (data: any[], config: ReportTemplate) => {
  const pdf = new jsPDF({
    orientation: config.layout.orientation === 'landscape' ? 'l' : 'p',
    unit: 'mm',
    format: config.layout.pageSize.toLowerCase() as any
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const { margins } = config.layout;

  let yPosition = margins.top;

  // Add logo if configured
  if (config.layout.logo.show && config.layout.logo.url) {
    try {
      const logoSize = config.layout.logo.size * 0.264583; // Convert px to mm
      let logoX = margins.left;
      
      if (config.layout.logo.position === 'center') {
        logoX = (pageWidth - logoSize) / 2;
      } else if (config.layout.logo.position === 'right') {
        logoX = pageWidth - margins.right - logoSize;
      }

      pdf.addImage(config.layout.logo.url, 'JPEG', logoX, yPosition, logoSize, logoSize);
      yPosition += logoSize + 5;
    } catch (error) {
      console.warn('Error adding logo to PDF:', error);
    }
  }

  // Add header if configured
  if (config.layout.header.show) {
    pdf.setFont(config.styling.fonts.title.family.toLowerCase());
    pdf.setFontSize(config.styling.fonts.title.size);
    pdf.setTextColor(config.styling.colors.primary);
    
    const headerText = replaceVariables(config.layout.header.content, data);
    const headerLines = pdf.splitTextToSize(headerText, pageWidth - margins.left - margins.right);
    
    pdf.text(headerLines, margins.left, yPosition);
    yPosition += (headerLines.length * config.styling.fonts.title.size * 0.352778) + 10; // Convert pt to mm
  }

  // Prepare table data
  const visibleFields = config.fields.filter(field => field.show);
  const tableHeaders = visibleFields.map(field => field.label);
  const tableData = data.map(row => 
    visibleFields.map(field => formatValue(row[field.name], field))
  );

  // Add table
  (pdf as any).autoTable({
    head: [tableHeaders],
    body: tableData,
    startY: yPosition,
    margin: {
      left: margins.left,
      right: margins.right,
      bottom: config.layout.footer.show ? margins.bottom + (config.layout.footer.height * 0.264583) : margins.bottom
    },
    styles: {
      fontSize: config.styling.fonts.body.size,
      font: config.styling.fonts.body.family.toLowerCase(),
      textColor: config.styling.colors.text,
      lineColor: config.styling.colors.border,
      lineWidth: config.styling.tables.showBorders ? 0.1 : 0
    },
    headStyles: {
      fontSize: config.styling.fonts.header.size,
      font: config.styling.fonts.header.family.toLowerCase(),
      fontStyle: config.styling.fonts.header.weight,
      fillColor: config.styling.tables.headerBg,
      textColor: config.styling.colors.text
    },
    alternateRowStyles: config.styling.tables.alternateRows ? {
      fillColor: config.styling.colors.background
    } : {},
    columnStyles: visibleFields.reduce((styles, field, index) => {
      if (field.width) {
        styles[index] = { cellWidth: field.width * 0.264583 }; // Convert px to mm
      }
      return styles;
    }, {} as any)
  });

  // Add footer if configured
  if (config.layout.footer.show) {
    const footerY = pageHeight - margins.bottom - 5;
    pdf.setFont(config.styling.fonts.body.family.toLowerCase());
    pdf.setFontSize(config.styling.fonts.body.size - 1);
    pdf.setTextColor(config.styling.colors.secondary);
    
    const footerText = replaceVariables(config.layout.footer.content, data);
    pdf.text(footerText, pageWidth / 2, footerY, { align: 'center' });
  }

  // Generate blob and return download info
  const pdfBlob = pdf.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  const filename = `${config.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().getTime()}.pdf`;

  return { url, filename, blob: pdfBlob };
};

export const generateExcelReport = async (data: any[], config: ReportTemplate) => {
  const workbook = XLSX.utils.book_new();
  
  // Prepare data for Excel
  const visibleFields = config.fields.filter(field => field.show);
  const headers = visibleFields.map(field => field.label);
  
  const excelData = [
    // Add title row if header is configured
    ...(config.layout.header.show ? [
      [replaceVariables(config.layout.header.content, data)],
      [] // Empty row
    ] : []),
    // Add headers
    headers,
    // Add data rows
    ...data.map(row => 
      visibleFields.map(field => {
        const value = row[field.name];
        
        // Format values for Excel
        if (field.type === 'currency' && value) {
          return typeof value === 'string' ? parseFloat(value) : value;
        }
        if (field.type === 'number' && value) {
          return typeof value === 'string' ? parseFloat(value) : value;
        }
        if (field.type === 'date' && value) {
          return new Date(value);
        }
        if (field.type === 'boolean') {
          return value ? 'Sim' : 'Não';
        }
        
        return value || '';
      })
    )
  ];

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(excelData);

  // Apply styling (basic Excel formatting)
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  
  // Set column widths
  const colWidths = visibleFields.map(field => ({
    wch: field.width ? Math.max(field.width / 8, 10) : 15 // Convert px to character width
  }));
  worksheet['!cols'] = colWidths;

  // Format header row
  const headerRowIndex = config.layout.header.show ? 2 : 0; // Account for title row
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex, c: col });
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: config.styling.tables.headerBg.replace('#', '') } }
      };
    }
  }

  // Format currency columns
  visibleFields.forEach((field, index) => {
    if (field.type === 'currency') {
      for (let row = headerRowIndex + 1; row <= range.e.r; row++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: index });
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].z = 'R$ #,##0.00';
        }
      }
    }
    if (field.type === 'date') {
      for (let row = headerRowIndex + 1; row <= range.e.r; row++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: index });
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].z = 'dd/mm/yyyy';
        }
      }
    }
  });

  // Add title styling if header is configured
  if (config.layout.header.show) {
    const titleCell = worksheet['A1'];
    if (titleCell) {
      titleCell.s = {
        font: { 
          bold: true, 
          size: config.styling.fonts.title.size,
          color: { rgb: config.styling.colors.primary.replace('#', '') }
        },
        alignment: { horizontal: 'center' }
      };
    }
    
    // Merge title cells
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: visibleFields.length - 1 } }
    ];
  }

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório');

  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const excelBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(excelBlob);
  const filename = `${config.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().getTime()}.xlsx`;

  return { url, filename, blob: excelBlob };
};