import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

export const useDataExport = () => {
  const { toast } = useToast();

  const exportToExcel = (data: any[], filename: string, sheetName: string = 'Dados') => {
    if (data.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há registros para exportar.",
        variant: "destructive",
      });
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);

    toast({
      title: "Exportação concluída",
      description: `${data.length} registros exportados com sucesso.`,
    });
  };

  const parseExcelFile = async (file: File): Promise<any[]> => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet);
  };

  return {
    exportToExcel,
    parseExcelFile,
  };
};
