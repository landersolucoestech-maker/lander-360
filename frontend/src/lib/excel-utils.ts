import * as XLSX from 'xlsx-js-style';

// Status color mapping for Excel exports
const STATUS_COLOR_MAP: Record<string, { fgColor: string; bgColor: string }> = {
  'em análise': { fgColor: '000000', bgColor: 'FFEB3B' },
  'em analise': { fgColor: '000000', bgColor: 'FFEB3B' },
  'em análise na distribuidora': { fgColor: '000000', bgColor: 'FFEB3B' },
  'em espera': { fgColor: 'FFFFFF', bgColor: 'F44336' },
  'espera': { fgColor: 'FFFFFF', bgColor: 'F44336' },
  'pendente': { fgColor: 'FFFFFF', bgColor: 'F44336' },
  'lançada': { fgColor: 'FFFFFF', bgColor: '2196F3' },
  'lancada': { fgColor: 'FFFFFF', bgColor: '2196F3' },
  'lançado': { fgColor: 'FFFFFF', bgColor: '2196F3' },
  'lancado': { fgColor: 'FFFFFF', bgColor: '2196F3' },
  'música lançada': { fgColor: 'FFFFFF', bgColor: '2196F3' },
  'pronta': { fgColor: 'FFFFFF', bgColor: '4CAF50' },
  'pronto': { fgColor: 'FFFFFF', bgColor: '4CAF50' },
  'concluído': { fgColor: 'FFFFFF', bgColor: '4CAF50' },
  'concluido': { fgColor: 'FFFFFF', bgColor: '4CAF50' },
  'ativo': { fgColor: 'FFFFFF', bgColor: '4CAF50' },
  'aprovado': { fgColor: 'FFFFFF', bgColor: '4CAF50' },
  'aceita': { fgColor: 'FFFFFF', bgColor: '4CAF50' },
  'pronta para registro': { fgColor: 'FFFFFF', bgColor: '4CAF50' },
  'takedown': { fgColor: 'FFFFFF', bgColor: '9C27B0' },
  'removido': { fgColor: 'FFFFFF', bgColor: '9C27B0' },
  'cancelado': { fgColor: 'FFFFFF', bgColor: '9C27B0' },
};

const getStatusColor = (value: string) => {
  if (!value) return null;
  const normalizedValue = value.toLowerCase().trim();
  return STATUS_COLOR_MAP[normalizedValue] || null;
};

/**
 * Apply status-based row coloring to an Excel worksheet
 * @param worksheet - The XLSX worksheet to style
 * @param data - The data array used to generate the worksheet
 * @param statusColumnLabels - Column labels to search for status values
 */
export const applyStatusColoring = (
  worksheet: XLSX.WorkSheet,
  data: any[],
  statusColumnLabels: string[] = ['Status', 'status', 'Status Contrato']
) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  let statusColumnIndex = -1;
  
  headers.forEach((header, index) => {
    if (statusColumnLabels.some(label => 
      header.toLowerCase().includes(label.toLowerCase())
    )) {
      statusColumnIndex = index;
    }
  });

  if (statusColumnIndex === -1) return;

  data.forEach((row, rowIndex) => {
    const statusHeader = headers[statusColumnIndex];
    const statusValue = row[statusHeader];
    const color = getStatusColor(String(statusValue || ''));
    
    if (color) {
      headers.forEach((header, colIndex) => {
        const cellAddress = XLSX.utils.encode_cell({ r: rowIndex + 1, c: colIndex });
        
        if (!worksheet[cellAddress]) {
          worksheet[cellAddress] = { v: row[header] || '' };
        }
        
        worksheet[cellAddress].s = {
          fill: {
            patternType: 'solid',
            fgColor: { rgb: color.bgColor },
            bgColor: { rgb: color.bgColor },
          },
          font: {
            color: { rgb: color.fgColor },
            bold: colIndex === statusColumnIndex,
          },
          alignment: {
            horizontal: 'center',
            vertical: 'center',
          },
        };
      });
    }
  });
};

/**
 * Apply header styling to an Excel worksheet
 * @param worksheet - The XLSX worksheet to style
 * @param data - The data array used to generate the worksheet
 */
export const applyHeaderStyling = (
  worksheet: XLSX.WorkSheet,
  data: any[]
) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  
  headers.forEach((_, colIndex) => {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: colIndex });
    
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].s = {
        fill: {
          patternType: 'solid',
          fgColor: { rgb: '1976D2' },
          bgColor: { rgb: '1976D2' },
        },
        font: {
          color: { rgb: 'FFFFFF' },
          bold: true,
        },
        alignment: {
          horizontal: 'center',
          vertical: 'center',
        },
      };
    }
  });
};

/**
 * Create a styled Excel workbook from data
 * @param data - Array of objects to export
 * @param sheetName - Name of the worksheet
 * @param applyStatusColors - Whether to apply status-based coloring
 */
export const createStyledWorkbook = (
  data: any[],
  sheetName: string = 'Dados',
  applyStatusColors: boolean = true
) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  applyHeaderStyling(worksheet, data);
  
  if (applyStatusColors) {
    applyStatusColoring(worksheet, data);
  }
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  return workbook;
};

/**
 * Download a styled Excel file
 * @param data - Array of objects to export
 * @param filename - Filename without extension
 * @param sheetName - Name of the worksheet
 */
export const downloadStyledExcel = (
  data: any[],
  filename: string,
  sheetName: string = 'Dados'
) => {
  const workbook = createStyledWorkbook(data, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};