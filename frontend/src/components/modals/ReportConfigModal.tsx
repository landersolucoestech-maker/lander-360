import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Palette, Settings, Eye, Save, Upload, Image, Type, LayoutTemplate, Plus, Trash2, Copy, RefreshCw } from "lucide-react";
import { generatePDFReport, generateExcelReport } from "@/lib/report-generator";
interface ReportConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportType?: string;
  data?: any[];
}
interface ReportTemplate {
  id: string;
  name: string;
  format: 'pdf' | 'excel';
  layout: ReportLayout;
  styling: ReportStyling;
  fields: ReportField[];
}
interface ReportLayout {
  orientation: 'portrait' | 'landscape';
  pageSize: 'A4' | 'A3' | 'Letter';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  header: {
    show: boolean;
    height: number;
    content: string;
  };
  footer: {
    show: boolean;
    height: number;
    content: string;
  };
  logo: {
    show: boolean;
    position: 'left' | 'center' | 'right';
    size: number;
    url?: string;
  };
}
interface ReportStyling {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
    border: string;
  };
  fonts: {
    title: {
      family: string;
      size: number;
      weight: string;
    };
    header: {
      family: string;
      size: number;
      weight: string;
    };
    body: {
      family: string;
      size: number;
      weight: string;
    };
  };
  tables: {
    showBorders: boolean;
    alternateRows: boolean;
    headerBg: string;
    rowHeight: number;
  };
}
interface ReportField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'currency' | 'boolean';
  show: boolean;
  width?: number;
  format?: string;
}
export function ReportConfigModal({
  open,
  onOpenChange,
  reportType = "custom",
  data = []
}: ReportConfigModalProps) {
  const [activeTab, setActiveTab] = useState("layout");
  const [selectedTemplate, setSelectedTemplate] = useState<string>(reportType);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    toast
  } = useToast();

  // Default configuration
  const [config, setConfig] = useState<ReportTemplate>({
    id: 'custom',
    name: 'Relatório Personalizado',
    format: 'pdf',
    layout: {
      orientation: 'portrait',
      pageSize: 'A4',
      margins: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      },
      header: {
        show: true,
        height: 60,
        content: '{{companyName}} - {{reportTitle}}'
      },
      footer: {
        show: true,
        height: 40,
        content: 'Página {{pageNumber}} de {{totalPages}} - Gerado em {{date}}'
      },
      logo: {
        show: true,
        position: 'left',
        size: 50
      }
    },
    styling: {
      colors: {
        primary: '#1f2937',
        secondary: '#6b7280',
        accent: '#3b82f6',
        text: '#374151',
        background: '#ffffff',
        border: '#e5e7eb'
      },
      fonts: {
        title: {
          family: 'Arial',
          size: 24,
          weight: 'bold'
        },
        header: {
          family: 'Arial',
          size: 14,
          weight: 'bold'
        },
        body: {
          family: 'Arial',
          size: 11,
          weight: 'normal'
        }
      },
      tables: {
        showBorders: true,
        alternateRows: true,
        headerBg: '#f3f4f6',
        rowHeight: 25
      }
    },
    fields: [{
      id: 'name',
      name: 'name',
      label: 'Nome',
      type: 'text',
      show: true,
      width: 200
    }, {
      id: 'date',
      name: 'date',
      label: 'Data',
      type: 'date',
      show: true,
      width: 120
    }, {
      id: 'value',
      name: 'value',
      label: 'Valor',
      type: 'currency',
      show: true,
      width: 100
    }]
  });

  // Predefined templates
  const templates: ReportTemplate[] = [{
    id: 'financial',
    name: 'Relatório Financeiro',
    format: 'pdf',
    layout: {
      orientation: 'landscape',
      pageSize: 'A4',
      margins: {
        top: 25,
        right: 25,
        bottom: 25,
        left: 25
      },
      header: {
        show: true,
        height: 80,
        content: 'RELATÓRIO FINANCEIRO - {{period}}'
      },
      footer: {
        show: true,
        height: 50,
        content: 'Confidencial - {{companyName}} | Página {{pageNumber}}'
      },
      logo: {
        show: true,
        position: 'right',
        size: 60
      }
    },
    styling: {
      colors: {
        primary: '#059669',
        secondary: '#10b981',
        accent: '#34d399',
        text: '#1f2937',
        background: '#ffffff',
        border: '#d1fae5'
      },
      fonts: {
        title: {
          family: 'Helvetica',
          size: 20,
          weight: 'bold'
        },
        header: {
          family: 'Helvetica',
          size: 12,
          weight: 'bold'
        },
        body: {
          family: 'Helvetica',
          size: 10,
          weight: 'normal'
        }
      },
      tables: {
        showBorders: true,
        alternateRows: true,
        headerBg: '#ecfdf5',
        rowHeight: 28
      }
    },
    fields: [{
      id: 'client_type',
      name: 'client_type',
      label: 'Tipo Cliente',
      type: 'text',
      show: true,
      width: 100
    }, {
      id: 'client_name',
      name: 'client_name',
      label: 'Cliente',
      type: 'text',
      show: true,
      width: 200
    }, {
      id: 'transaction_type',
      name: 'transaction_type',
      label: 'Tipo Transação',
      type: 'text',
      show: true,
      width: 120
    }, {
      id: 'description',
      name: 'description',
      label: 'Descrição',
      type: 'text',
      show: true,
      width: 300
    }, {
      id: 'category',
      name: 'category',
      label: 'Categoria',
      type: 'text',
      show: true,
      width: 150
    }, {
      id: 'amount',
      name: 'amount',
      label: 'Valor',
      type: 'currency',
      show: true,
      width: 120
    }, {
      id: 'transaction_date',
      name: 'transaction_date',
      label: 'Data',
      type: 'date',
      show: true,
      width: 100
    }, {
      id: 'status',
      name: 'status',
      label: 'Status',
      type: 'text',
      show: true,
      width: 100
    }]
  }, {
    id: 'artists',
    name: 'Relatório de Artistas',
    format: 'excel',
    layout: {
      orientation: 'portrait',
      pageSize: 'A4',
      margins: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      },
      header: {
        show: true,
        height: 70,
        content: 'CADASTRO DE ARTISTAS'
      },
      footer: {
        show: true,
        height: 40,
        content: 'Total de {{recordCount}} artistas cadastrados'
      },
      logo: {
        show: true,
        position: 'center',
        size: 80
      }
    },
    styling: {
      colors: {
        primary: '#7c3aed',
        secondary: '#a855f7',
        accent: '#c084fc',
        text: '#1f2937',
        background: '#ffffff',
        border: '#ede9fe'
      },
      fonts: {
        title: {
          family: 'Arial',
          size: 18,
          weight: 'bold'
        },
        header: {
          family: 'Arial',
          size: 11,
          weight: 'bold'
        },
        body: {
          family: 'Arial',
          size: 9,
          weight: 'normal'
        }
      },
      tables: {
        showBorders: true,
        alternateRows: true,
        headerBg: '#f3f4f6',
        rowHeight: 22
      }
    },
    fields: [{
      id: 'name',
      name: 'name',
      label: 'Nome Civil',
      type: 'text',
      show: true,
      width: 200
    }, {
      id: 'full_name',
      name: 'full_name',
      label: 'Nome Artístico',
      type: 'text',
      show: true,
      width: 180
    }, {
      id: 'email',
      name: 'email',
      label: 'Email',
      type: 'text',
      show: true,
      width: 220
    }, {
      id: 'phone',
      name: 'phone',
      label: 'Telefone',
      type: 'text',
      show: true,
      width: 130
    }, {
      id: 'genre',
      name: 'genre',
      label: 'Gênero Musical',
      type: 'text',
      show: true,
      width: 120
    }, {
      id: 'bio',
      name: 'bio',
      label: 'Biografia',
      type: 'text',
      show: true,
      width: 300
    }, {
      id: 'instagram',
      name: 'instagram',
      label: 'Instagram',
      type: 'text',
      show: false,
      width: 150
    }, {
      id: 'youtube',
      name: 'youtube',
      label: 'YouTube',
      type: 'text',
      show: false,
      width: 150
    }, {
      id: 'spotify',
      name: 'spotify',
      label: 'Spotify',
      type: 'text',
      show: false,
      width: 150
    }, {
      id: 'website',
      name: 'website',
      label: 'Website',
      type: 'text',
      show: false,
      width: 150
    }]
  }, {
    id: 'projects',
    name: 'Relatório de Projetos',
    format: 'pdf',
    layout: {
      orientation: 'landscape',
      pageSize: 'A4',
      margins: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      },
      header: {
        show: true,
        height: 70,
        content: 'RELATÓRIO DE PROJETOS'
      },
      footer: {
        show: true,
        height: 40,
        content: 'Página {{pageNumber}} de {{totalPages}}'
      },
      logo: {
        show: true,
        position: 'left',
        size: 60
      }
    },
    styling: {
      colors: {
        primary: '#dc2626',
        secondary: '#ef4444',
        accent: '#f87171',
        text: '#1f2937',
        background: '#ffffff',
        border: '#fee2e2'
      },
      fonts: {
        title: {
          family: 'Arial',
          size: 18,
          weight: 'bold'
        },
        header: {
          family: 'Arial',
          size: 11,
          weight: 'bold'
        },
        body: {
          family: 'Arial',
          size: 9,
          weight: 'normal'
        }
      },
      tables: {
        showBorders: true,
        alternateRows: true,
        headerBg: '#fef2f2',
        rowHeight: 24
      }
    },
    fields: [{
      id: 'name',
      name: 'name',
      label: 'Nome do Projeto',
      type: 'text',
      show: true,
      width: 200
    }, {
      id: 'release_type',
      name: 'release_type',
      label: 'Tipo Lançamento',
      type: 'text',
      show: true,
      width: 120
    }, {
      id: 'status',
      name: 'status',
      label: 'Status',
      type: 'text',
      show: true,
      width: 100
    }, {
      id: 'song_name',
      name: 'song_name',
      label: 'Nome da Música',
      type: 'text',
      show: true,
      width: 200
    }, {
      id: 'genre',
      name: 'genre',
      label: 'Gênero',
      type: 'text',
      show: true,
      width: 120
    }, {
      id: 'collaboration_type',
      name: 'collaboration_type',
      label: 'Solo/Feat',
      type: 'text',
      show: true,
      width: 80
    }, {
      id: 'track_type',
      name: 'track_type',
      label: 'Original/Remix',
      type: 'text',
      show: true,
      width: 100
    }, {
      id: 'instrumental',
      name: 'instrumental',
      label: 'Instrumental',
      type: 'text',
      show: false,
      width: 80
    }, {
      id: 'created_at',
      name: 'created_at',
      label: 'Data Criação',
      type: 'date',
      show: true,
      width: 100
    }]
  }, {
    id: 'notas-fiscais',
    name: 'Relatório de Notas Fiscais',
    format: 'excel',
    layout: {
      orientation: 'landscape',
      pageSize: 'A4',
      margins: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      },
      header: {
        show: true,
        height: 70,
        content: 'RELATÓRIO DE NOTAS FISCAIS'
      },
      footer: {
        show: true,
        height: 40,
        content: 'Documento fiscal - {{companyName}}'
      },
      logo: {
        show: true,
        position: 'center',
        size: 60
      }
    },
    styling: {
      colors: {
        primary: '#0891b2',
        secondary: '#06b6d4',
        accent: '#67e8f9',
        text: '#1f2937',
        background: '#ffffff',
        border: '#cffafe'
      },
      fonts: {
        title: {
          family: 'Arial',
          size: 18,
          weight: 'bold'
        },
        header: {
          family: 'Arial',
          size: 11,
          weight: 'bold'
        },
        body: {
          family: 'Arial',
          size: 9,
          weight: 'normal'
        }
      },
      tables: {
        showBorders: true,
        alternateRows: true,
        headerBg: '#f0fdfa',
        rowHeight: 26
      }
    },
    fields: [{
      id: 'recipientName',
      name: 'recipientName',
      label: 'Cliente',
      type: 'text',
      show: true,
      width: 200
    }, {
      id: 'recipientDocument',
      name: 'recipientDocument',
      label: 'CPF/CNPJ',
      type: 'text',
      show: true,
      width: 150
    }, {
      id: 'serviceType',
      name: 'serviceType',
      label: 'Tipo Serviço',
      type: 'text',
      show: true,
      width: 150
    }, {
      id: 'description',
      name: 'description',
      label: 'Descrição',
      type: 'text',
      show: true,
      width: 300
    }, {
      id: 'amount',
      name: 'amount',
      label: 'Valor',
      type: 'currency',
      show: true,
      width: 120
    }, {
      id: 'issueDate',
      name: 'issueDate',
      label: 'Data Emissão',
      type: 'date',
      show: true,
      width: 100
    }, {
      id: 'dueDate',
      name: 'dueDate',
      label: 'Vencimento',
      type: 'date',
      show: true,
      width: 100
    }, {
      id: 'cfop',
      name: 'cfop',
      label: 'CFOP',
      type: 'text',
      show: false,
      width: 80
    }, {
      id: 'cst',
      name: 'cst',
      label: 'CST',
      type: 'text',
      show: false,
      width: 80
    }]
  }, {
    id: 'marketing',
    name: 'Relatório de Marketing',
    format: 'pdf',
    layout: {
      orientation: 'landscape',
      pageSize: 'A4',
      margins: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      },
      header: {
        show: true,
        height: 70,
        content: 'RELATÓRIO DE MARKETING'
      },
      footer: {
        show: true,
        height: 40,
        content: 'Performance de Campanhas - {{date}}'
      },
      logo: {
        show: true,
        position: 'right',
        size: 60
      }
    },
    styling: {
      colors: {
        primary: '#ea580c',
        secondary: '#fb923c',
        accent: '#fdba74',
        text: '#1f2937',
        background: '#ffffff',
        border: '#fed7aa'
      },
      fonts: {
        title: {
          family: 'Arial',
          size: 18,
          weight: 'bold'
        },
        header: {
          family: 'Arial',
          size: 11,
          weight: 'bold'
        },
        body: {
          family: 'Arial',
          size: 9,
          weight: 'normal'
        }
      },
      tables: {
        showBorders: true,
        alternateRows: true,
        headerBg: '#fff7ed',
        rowHeight: 25
      }
    },
    fields: [{
      id: 'name',
      name: 'name',
      label: 'Nome Campanha',
      type: 'text',
      show: true,
      width: 200
    }, {
      id: 'platform',
      name: 'platform',
      label: 'Plataforma',
      type: 'text',
      show: true,
      width: 120
    }, {
      id: 'status',
      name: 'status',
      label: 'Status',
      type: 'text',
      show: true,
      width: 100
    }, {
      id: 'budget',
      name: 'budget',
      label: 'Orçamento',
      type: 'currency',
      show: true,
      width: 120
    }, {
      id: 'spent',
      name: 'spent',
      label: 'Gasto',
      type: 'currency',
      show: true,
      width: 120
    }, {
      id: 'impressions',
      name: 'impressions',
      label: 'Impressões',
      type: 'number',
      show: true,
      width: 100
    }, {
      id: 'clicks',
      name: 'clicks',
      label: 'Cliques',
      type: 'number',
      show: true,
      width: 80
    }, {
      id: 'ctr',
      name: 'ctr',
      label: 'CTR (%)',
      type: 'number',
      show: true,
      width: 80
    }, {
      id: 'start_date',
      name: 'start_date',
      label: 'Início',
      type: 'date',
      show: true,
      width: 100
    }, {
      id: 'end_date',
      name: 'end_date',
      label: 'Fim',
      type: 'date',
      show: true,
      width: 100
    }]
  }, {
    id: 'musicas',
    name: 'Relatório de Músicas',
    format: 'excel',
    layout: {
      orientation: 'landscape',
      pageSize: 'A4',
      margins: { top: 20, right: 20, bottom: 20, left: 20 },
      header: { show: true, height: 70, content: 'REGISTRO DE MÚSICAS' },
      footer: { show: true, height: 40, content: 'Total de {{recordCount}} músicas' },
      logo: { show: true, position: 'center', size: 60 }
    },
    styling: {
      colors: { primary: '#2563eb', secondary: '#60a5fa', accent: '#93c5fd', text: '#1f2937', background: '#ffffff', border: '#dbeafe' },
      fonts: { title: { family: 'Arial', size: 18, weight: 'bold' }, header: { family: 'Arial', size: 11, weight: 'bold' }, body: { family: 'Arial', size: 9, weight: 'normal' } },
      tables: { showBorders: true, alternateRows: true, headerBg: '#eff6ff', rowHeight: 24 }
    },
    fields: [
      { id: 'title', name: 'title', label: 'Título', type: 'text', show: true, width: 220 },
      { id: 'genre', name: 'genre', label: 'Gênero', type: 'text', show: true, width: 120 },
      { id: 'duration', name: 'duration', label: 'Duração (s)', type: 'number', show: true, width: 120 },
      { id: 'isrc', name: 'isrc', label: 'ISRC', type: 'text', show: true, width: 140 },
      { id: 'iswc', name: 'iswc', label: 'ISWC', type: 'text', show: true, width: 140 },
      { id: 'ecad_code', name: 'ecad_code', label: 'Código ECAD', type: 'text', show: false, width: 140 },
      { id: 'recording_date', name: 'recording_date', label: 'Gravação', type: 'date', show: true, width: 110 },
      { id: 'status', name: 'status', label: 'Status', type: 'text', show: true, width: 110 }
    ]
  }, {
    id: 'lancamentos',
    name: 'Relatório de Lançamentos',
    format: 'pdf',
    layout: {
      orientation: 'landscape',
      pageSize: 'A4',
      margins: { top: 20, right: 20, bottom: 20, left: 20 },
      header: { show: true, height: 70, content: 'RELATÓRIO DE LANÇAMENTOS' },
      footer: { show: true, height: 40, content: 'Distribuição - {{period}}' },
      logo: { show: true, position: 'right', size: 60 }
    },
    styling: {
      colors: { primary: '#0ea5e9', secondary: '#38bdf8', accent: '#7dd3fc', text: '#1f2937', background: '#ffffff', border: '#bae6fd' },
      fonts: { title: { family: 'Helvetica', size: 18, weight: 'bold' }, header: { family: 'Helvetica', size: 11, weight: 'bold' }, body: { family: 'Helvetica', size: 9, weight: 'normal' } },
      tables: { showBorders: true, alternateRows: true, headerBg: '#e0f2fe', rowHeight: 24 }
    },
    fields: [
      { id: 'release_title', name: 'release_title', label: 'Título', type: 'text', show: true, width: 220 },
      { id: 'artist_name', name: 'artist_name', label: 'Artista', type: 'text', show: true, width: 180 },
      { id: 'release_type', name: 'release_type', label: 'Tipo', type: 'text', show: true, width: 100 },
      { id: 'genre', name: 'genre', label: 'Gênero', type: 'text', show: true, width: 120 },
      { id: 'release_date', name: 'release_date', label: 'Data Lançamento', type: 'date', show: true, width: 120 },
      { id: 'status', name: 'status', label: 'Status', type: 'text', show: true, width: 100 },
      { id: 'platforms', name: 'platforms', label: 'Plataformas', type: 'text', show: true, width: 180 },
      { id: 'label', name: 'label', label: 'Selo/Label', type: 'text', show: false, width: 140 },
      { id: 'copyright', name: 'copyright', label: 'Copyright', type: 'text', show: false, width: 160 }
    ]
  }, {
    id: 'inventario',
    name: 'Relatório de Inventário',
    format: 'excel',
    layout: {
      orientation: 'landscape',
      pageSize: 'A4',
      margins: { top: 20, right: 20, bottom: 20, left: 20 },
      header: { show: true, height: 70, content: 'INVENTÁRIO DE ITENS' },
      footer: { show: true, height: 40, content: 'Total de {{recordCount}} itens' },
      logo: { show: true, position: 'left', size: 60 }
    },
    styling: {
      colors: { primary: '#16a34a', secondary: '#22c55e', accent: '#86efac', text: '#1f2937', background: '#ffffff', border: '#dcfce7' },
      fonts: { title: { family: 'Arial', size: 18, weight: 'bold' }, header: { family: 'Arial', size: 11, weight: 'bold' }, body: { family: 'Arial', size: 9, weight: 'normal' } },
      tables: { showBorders: true, alternateRows: true, headerBg: '#ecfdf5', rowHeight: 24 }
    },
    fields: [
      { id: 'sector', name: 'sector', label: 'Setor', type: 'text', show: true, width: 140 },
      { id: 'category', name: 'category', label: 'Categoria', type: 'text', show: true, width: 140 },
      { id: 'name', name: 'name', label: 'Item', type: 'text', show: true, width: 220 },
      { id: 'quantity', name: 'quantity', label: 'Qtd', type: 'number', show: true, width: 80 },
      { id: 'location', name: 'location', label: 'Localização', type: 'text', show: true, width: 160 },
      { id: 'responsible', name: 'responsible', label: 'Responsável', type: 'text', show: true, width: 160 },
      { id: 'status', name: 'status', label: 'Status', type: 'text', show: true, width: 120 },
      { id: 'purchaseLocation', name: 'purchaseLocation', label: 'Local Compra', type: 'text', show: false, width: 160 },
      { id: 'invoiceNumber', name: 'invoiceNumber', label: 'Nota Fiscal', type: 'text', show: false, width: 140 },
      { id: 'entryDate', name: 'entryDate', label: 'Entrada', type: 'date', show: false, width: 120 },
      { id: 'unitValue', name: 'unitValue', label: 'Valor Unitário', type: 'currency', show: false, width: 140 }
    ]
  }, {
    id: 'crm',
    name: 'Relatório CRM',
    format: 'excel',
    layout: {
      orientation: 'portrait',
      pageSize: 'A4',
      margins: { top: 20, right: 20, bottom: 20, left: 20 },
      header: { show: true, height: 70, content: 'RELATÓRIO CRM' },
      footer: { show: true, height: 40, content: 'Contatos - {{recordCount}}' },
      logo: { show: true, position: 'center', size: 60 }
    },
    styling: {
      colors: { primary: '#7c3aed', secondary: '#a78bfa', accent: '#c4b5fd', text: '#1f2937', background: '#ffffff', border: '#ede9fe' },
      fonts: { title: { family: 'Arial', size: 18, weight: 'bold' }, header: { family: 'Arial', size: 11, weight: 'bold' }, body: { family: 'Arial', size: 9, weight: 'normal' } },
      tables: { showBorders: true, alternateRows: true, headerBg: '#f3f4f6', rowHeight: 24 }
    },
    fields: [
      { id: 'name', name: 'name', label: 'Nome', type: 'text', show: true, width: 200 },
      { id: 'email', name: 'email', label: 'Email', type: 'text', show: true, width: 220 },
      { id: 'phone', name: 'phone', label: 'Telefone', type: 'text', show: true, width: 140 },
      { id: 'type', name: 'type', label: 'Tipo', type: 'text', show: true, width: 120 },
      { id: 'status', name: 'status', label: 'Status', type: 'text', show: true, width: 120 },
      { id: 'priority', name: 'priority', label: 'Prioridade', type: 'text', show: true, width: 120 },
      { id: 'company', name: 'company', label: 'Empresa', type: 'text', show: false, width: 160 },
      { id: 'position', name: 'position', label: 'Cargo', type: 'text', show: false, width: 140 },
      { id: 'nextAction', name: 'nextAction', label: 'Próxima Ação', type: 'text', show: false, width: 200 },
      { id: 'notes', name: 'notes', label: 'Observações', type: 'text', show: false, width: 260 }
    ]
  }, {
    id: 'contracts',
    name: 'Relatório de Contratos',
    format: 'excel',
    layout: {
      orientation: 'landscape',
      pageSize: 'A4',
      margins: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      },
      header: {
        show: true,
        height: 70,
        content: 'RELATÓRIO DE CONTRATOS'
      },
      footer: {
        show: true,
        height: 40,
        content: 'Situação Contratual - {{companyName}}'
      },
      logo: {
        show: true,
        position: 'left',
        size: 60
      }
    },
    styling: {
      colors: {
        primary: '#7c2d12',
        secondary: '#a3533c',
        accent: '#d97706',
        text: '#1f2937',
        background: '#ffffff',
        border: '#fed7aa'
      },
      fonts: {
        title: {
          family: 'Arial',
          size: 18,
          weight: 'bold'
        },
        header: {
          family: 'Arial',
          size: 11,
          weight: 'bold'
        },
        body: {
          family: 'Arial',
          size: 9,
          weight: 'normal'
        }
      },
      tables: {
        showBorders: true,
        alternateRows: true,
        headerBg: '#fef3c7',
        rowHeight: 26
      }
    },
    fields: [{
      id: 'title',
      name: 'title',
      label: 'Título Contrato',
      type: 'text',
      show: true,
      width: 250
    }, {
      id: 'client_type',
      name: 'client_type',
      label: 'Tipo Cliente',
      type: 'text',
      show: true,
      width: 100
    }, {
      id: 'service_type',
      name: 'service_type',
      label: 'Tipo Serviço',
      type: 'text',
      show: true,
      width: 150
    }, {
      id: 'status',
      name: 'status',
      label: 'Status',
      type: 'text',
      show: true,
      width: 100
    }, {
      id: 'responsible_person',
      name: 'responsible_person',
      label: 'Responsável',
      type: 'text',
      show: true,
      width: 150
    }, {
      id: 'start_date',
      name: 'start_date',
      label: 'Data Início',
      type: 'date',
      show: true,
      width: 100
    }, {
      id: 'end_date',
      name: 'end_date',
      label: 'Data Fim',
      type: 'date',
      show: true,
      width: 100
    }, {
      id: 'registry_office',
      name: 'registry_office',
      label: 'Registrado Cartório',
      type: 'boolean',
      show: true,
      width: 120
    }, {
      id: 'registry_date',
      name: 'registry_date',
      label: 'Data Registro',
      type: 'date',
      show: false,
      width: 100
    }, {
      id: 'fixed_value',
      name: 'fixed_value',
      label: 'Valor Fixo',
      type: 'currency',
      show: false,
      width: 120
    }, {
      id: 'royalties_percentage',
      name: 'royalties_percentage',
      label: 'Royalties (%)',
      type: 'number',
      show: false,
      width: 100
    }, {
      id: 'advance_payment',
      name: 'advance_payment',
      label: 'Adiantamento',
      type: 'currency',
      show: false,
      width: 120
    }]
  }, {
    id: 'agenda',
    name: 'Relatório de Agenda',
    format: 'pdf',
    layout: {
      orientation: 'portrait',
      pageSize: 'A4',
      margins: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      },
      header: {
        show: true,
        height: 70,
        content: 'RELATÓRIO DE AGENDA'
      },
      footer: {
        show: true,
        height: 40,
        content: 'Compromissos e Eventos - {{period}}'
      },
      logo: {
        show: true,
        position: 'center',
        size: 60
      }
    },
    styling: {
      colors: {
        primary: '#1e40af',
        secondary: '#3b82f6',
        accent: '#93c5fd',
        text: '#1f2937',
        background: '#ffffff',
        border: '#dbeafe'
      },
      fonts: {
        title: {
          family: 'Arial',
          size: 18,
          weight: 'bold'
        },
        header: {
          family: 'Arial',
          size: 11,
          weight: 'bold'
        },
        body: {
          family: 'Arial',
          size: 9,
          weight: 'normal'
        }
      },
      tables: {
        showBorders: true,
        alternateRows: true,
        headerBg: '#eff6ff',
        rowHeight: 28
      }
    },
    fields: [{
      id: 'event_name',
      name: 'event_name',
      label: 'Evento',
      type: 'text',
      show: true,
      width: 200
    }, {
      id: 'event_type',
      name: 'event_type',
      label: 'Tipo',
      type: 'text',
      show: true,
      width: 150
    }, {
      id: 'artist_name',
      name: 'artist_name',
      label: 'Artista',
      type: 'text',
      show: true,
      width: 150
    }, {
      id: 'status',
      name: 'status',
      label: 'Status',
      type: 'text',
      show: true,
      width: 100
    }, {
      id: 'start_date',
      name: 'start_date',
      label: 'Data',
      type: 'date',
      show: true,
      width: 100
    }, {
      id: 'start_time',
      name: 'start_time',
      label: 'Horário',
      type: 'text',
      show: true,
      width: 80
    }, {
      id: 'location',
      name: 'location',
      label: 'Local',
      type: 'text',
      show: true,
      width: 200
    }, {
      id: 'venue_name',
      name: 'venue_name',
      label: 'Nome do Venue',
      type: 'text',
      show: false,
      width: 150
    }, {
      id: 'venue_contact',
      name: 'venue_contact',
      label: 'Contato',
      type: 'text',
      show: false,
      width: 120
    }]
  }, {
    id: 'gerencial',
    name: 'Relatório Gerencial',
    format: 'pdf',
    layout: {
      orientation: 'landscape',
      pageSize: 'A4',
      margins: {
        top: 25,
        right: 25,
        bottom: 25,
        left: 25
      },
      header: {
        show: true,
        height: 80,
        content: 'RELATÓRIO GERENCIAL - {{period}}'
      },
      footer: {
        show: true,
        height: 50,
        content: 'Visão Geral do Negócio - {{companyName}}'
      },
      logo: {
        show: true,
        position: 'center',
        size: 80
      }
    },
    styling: {
      colors: {
        primary: '#111827',
        secondary: '#374151',
        accent: '#6b7280',
        text: '#1f2937',
        background: '#ffffff',
        border: '#e5e7eb'
      },
      fonts: {
        title: {
          family: 'Helvetica',
          size: 22,
          weight: 'bold'
        },
        header: {
          family: 'Helvetica',
          size: 14,
          weight: 'bold'
        },
        body: {
          family: 'Helvetica',
          size: 11,
          weight: 'normal'
        }
      },
      tables: {
        showBorders: true,
        alternateRows: true,
        headerBg: '#f9fafb',
        rowHeight: 30
      }
    },
    fields: [{
      id: 'category',
      name: 'category',
      label: 'Categoria',
      type: 'text',
      show: true,
      width: 150
    }, {
      id: 'total_items',
      name: 'total_items',
      label: 'Total Itens',
      type: 'number',
      show: true,
      width: 100
    }, {
      id: 'total_value',
      name: 'total_value',
      label: 'Valor Total',
      type: 'currency',
      show: true,
      width: 120
    }, {
      id: 'percentage',
      name: 'percentage',
      label: 'Percentual (%)',
      type: 'number',
      show: true,
      width: 100
    }, {
      id: 'status_summary',
      name: 'status_summary',
      label: 'Status',
      type: 'text',
      show: true,
      width: 150
    }, {
      id: 'period',
      name: 'period',
      label: 'Período',
      type: 'text',
      show: true,
      width: 120
    }]
  }];

  // Set initial template based on reportType
  useEffect(() => {
    if (reportType && reportType !== "custom") {
      const template = templates.find(t => t.id === reportType);
      if (template) {
        setSelectedTemplate(reportType);
        setConfig(template);
      }
    }
  }, [reportType]);
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setConfig(template);
    }
  };
  const handleConfigChange = (section: string, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof ReportTemplate] as object || {}),
        [field]: value
      }
    }));
  };
  const handleNestedConfigChange = (section: string, subsection: string, field: string, value: any) => {
    setConfig(prev => {
      const sectionData = prev[section as keyof ReportTemplate] as any;
      return {
        ...prev,
        [section]: {
          ...sectionData,
          [subsection]: {
            ...sectionData[subsection],
            [field]: value
          }
        }
      };
    });
  };
  const handleFieldToggle = (fieldId: string) => {
    setConfig(prev => ({
      ...prev,
      fields: prev.fields.map(field => field.id === fieldId ? {
        ...field,
        show: !field.show
      } : field)
    }));
  };
  const addCustomField = () => {
    const newField: ReportField = {
      id: `custom_field_${Date.now()}`,
      name: 'custom_field',
      label: 'Novo Campo',
      type: 'text',
      show: true,
      width: 150
    };
    setConfig(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };
  const removeField = (index: number) => {
    setConfig(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }));
  };
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        const url = e.target?.result as string;
        setConfig(prev => ({
          ...prev,
          layout: {
            ...prev.layout,
            logo: {
              ...prev.layout.logo,
              url
            }
          }
        }));
        toast({
          title: "Logo carregado",
          description: "Logo foi adicionado ao relatório"
        });
      };
      reader.readAsDataURL(file);
    }
  };
  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      let result;
      if (config.format === 'pdf') {
        result = await generatePDFReport(data, config);
      } else {
        result = await generateExcelReport(data, config);
      }

      // Trigger download
      const link = document.createElement('a');
      link.href = result.url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: "Relatório gerado",
        description: `${result.filename} foi baixado com sucesso!`
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Erro",
        description: "Falha ao gerar relatório. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  const handleSaveTemplate = () => {
    // TODO: Save template to local storage or database
    toast({
      title: "Template salvo",
      description: `Template "${config.name}" foi salvo com sucesso!`
    });
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] max-w-7xl max-h-[95vh] overflow-hidden p-3 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <FileText className="h-5 w-5" />
            Configuração Avançada de Relatórios
          </DialogTitle>
          <DialogDescription className="text-sm">
            Personalize completamente o visual e conteúdo dos seus relatórios exportáveis
          </DialogDescription>
        </DialogHeader>

        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          {/* Left Panel - Configuration */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="template">Template</TabsTrigger>
                <TabsTrigger value="layout">Layout</TabsTrigger>
                <TabsTrigger value="styling">Visual</TabsTrigger>
                <TabsTrigger value="fields">Campos</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              
              <ScrollArea className="h-[600px] mt-4">
                {/* Template Selection Tab */}
                <TabsContent value="template" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Escolher Template</CardTitle>
                      <CardDescription>
                        Selecione um template predefinido ou crie um personalizado
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[{
                        id: 'custom',
                        name: 'Personalizado',
                        description: 'Crie do zero'
                      }, ...templates].map(template => <Card key={template.id} className={`cursor-pointer transition-all ${selectedTemplate === template.id ? 'ring-2 ring-primary' : 'hover:bg-accent'}`} onClick={() => handleTemplateChange(template.id)}>
                            <CardContent className="p-4">
                              <h4 className="font-medium">{template.name}</h4>
                              {'description' in template ? <p className="text-sm text-muted-foreground">{template.description}</p> : <div className="flex gap-2 mt-2">
                                  <Badge variant="outline">{template.format.toUpperCase()}</Badge>
                                  <Badge variant="secondary">{template.layout.orientation}</Badge>
                                </div>}
                            </CardContent>
                          </Card>)}
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-3">
                        <Label>Nome do Template</Label>
                        <Input value={config.name} onChange={e => setConfig(prev => ({
                        ...prev,
                        name: e.target.value
                      }))} placeholder="Digite o nome do template" />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Layout Tab */}
                <TabsContent value="layout" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Configurações de Layout</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Format and Page Setup */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Formato</Label>
                          <Select value={config.format} onValueChange={(value: 'pdf' | 'excel') => setConfig(prev => ({
                          ...prev,
                          format: value
                        }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pdf">PDF</SelectItem>
                              <SelectItem value="excel">Excel (XLSX)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Orientação</Label>
                          <Select value={config.layout.orientation} onValueChange={value => handleConfigChange('layout', 'orientation', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="portrait">Retrato</SelectItem>
                                <SelectItem value="landscape">Paisagem</SelectItem>
                              </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Tamanho da Página</Label>
                          <Select value={config.layout.pageSize} onValueChange={value => handleConfigChange('layout', 'pageSize', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A4">A4</SelectItem>
                              <SelectItem value="A3">A3</SelectItem>
                              <SelectItem value="Letter">Letter</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Margins */}
                      <div className="space-y-3">
                        <Label>Margens (mm)</Label>
                        <div className="grid grid-cols-4 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Superior</Label>
                            <Input type="number" value={config.layout.margins.top} onChange={e => handleNestedConfigChange('layout', 'margins', 'top', Number(e.target.value))} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Direita</Label>
                            <Input type="number" value={config.layout.margins.right} onChange={e => handleNestedConfigChange('layout', 'margins', 'right', Number(e.target.value))} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Inferior</Label>
                            <Input type="number" value={config.layout.margins.bottom} onChange={e => handleNestedConfigChange('layout', 'margins', 'bottom', Number(e.target.value))} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Esquerda</Label>
                            <Input type="number" value={config.layout.margins.left} onChange={e => handleNestedConfigChange('layout', 'margins', 'left', Number(e.target.value))} />
                          </div>
                        </div>
                      </div>

                      {/* Header Configuration */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Switch checked={config.layout.header.show} onCheckedChange={checked => handleNestedConfigChange('layout', 'header', 'show', checked)} />
                          <Label>Mostrar Cabeçalho</Label>
                        </div>
                        {config.layout.header.show && <div className="space-y-3 pl-6 border-l-2 border-muted">
                            <div className="space-y-2">
                              <Label>Conteúdo do Cabeçalho</Label>
                              <Textarea value={config.layout.header.content} onChange={e => handleNestedConfigChange('layout', 'header', 'content', e.target.value)} placeholder="Use {{companyName}}, {{reportTitle}}, {{date}} como variáveis" />
                              <p className="text-xs text-muted-foreground">
                                Variáveis disponíveis: {"{{companyName}}, {{reportTitle}}, {{date}}, {{time}}"}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <Label>Altura (px)</Label>
                              <Input type="number" value={config.layout.header.height} onChange={e => handleNestedConfigChange('layout', 'header', 'height', Number(e.target.value))} />
                            </div>
                          </div>}
                      </div>

                      {/* Footer Configuration */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Switch checked={config.layout.footer.show} onCheckedChange={checked => handleNestedConfigChange('layout', 'footer', 'show', checked)} />
                          <Label>Mostrar Rodapé</Label>
                        </div>
                        {config.layout.footer.show && <div className="space-y-3 pl-6 border-l-2 border-muted">
                            <div className="space-y-2">
                              <Label>Conteúdo do Rodapé</Label>
                              <Textarea value={config.layout.footer.content} onChange={e => handleNestedConfigChange('layout', 'footer', 'content', e.target.value)} placeholder="Use {{pageNumber}}, {{totalPages}}, {{date}} como variáveis" />
                              <p className="text-xs text-muted-foreground">
                                Variáveis disponíveis: {"{{pageNumber}}, {{totalPages}}, {{date}}, {{recordCount}}"}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <Label>Altura (px)</Label>
                              <Input type="number" value={config.layout.footer.height} onChange={e => handleNestedConfigChange('layout', 'footer', 'height', Number(e.target.value))} />
                            </div>
                          </div>}
                      </div>

                      {/* Logo Configuration */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Switch checked={config.layout.logo.show} onCheckedChange={checked => handleNestedConfigChange('layout', 'logo', 'show', checked)} />
                          <Label>Mostrar Logo</Label>
                        </div>
                        {config.layout.logo.show && <div className="space-y-3 pl-6 border-l-2 border-muted">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label>Posição</Label>
                                <Select value={config.layout.logo.position} onValueChange={value => handleNestedConfigChange('layout', 'logo', 'position', value)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="left">Esquerda</SelectItem>
                                    <SelectItem value="center">Centro</SelectItem>
                                    <SelectItem value="right">Direita</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Tamanho (px)</Label>
                                <Input type="number" value={config.layout.logo.size} onChange={e => handleNestedConfigChange('layout', 'logo', 'size', Number(e.target.value))} />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Upload do Logo</Label>
                              <div className="flex gap-2">
                                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="flex-1">
                                  <Upload className="h-4 w-4 mr-2" />
                                  Escolher Arquivo
                                </Button>
                                {config.layout.logo.url && <Button variant="outline" onClick={() => handleNestedConfigChange('layout', 'logo', 'url', undefined)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>}
                              </div>
                              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                              {config.layout.logo.url && <div className="mt-2">
                                  <img src={config.layout.logo.url} alt="Logo preview" className="max-h-16 max-w-32 object-contain border rounded" />
                                </div>}
                            </div>
                          </div>}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Styling Tab */}
                <TabsContent value="styling" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Configurações Visuais</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Colors */}
                      <div className="space-y-4">
                        <h4 className="font-medium flex items-center gap-2">
                          <Palette className="h-4 w-4" />
                          Cores do Tema
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {Object.entries(config.styling.colors).map(([key, value]) => <div key={key} className="space-y-2">
                              <Label className="capitalize">{key === 'primary' ? 'Primária' : key === 'secondary' ? 'Secundária' : key === 'accent' ? 'Destaque' : key === 'text' ? 'Texto' : key === 'background' ? 'Fundo' : 'Borda'}</Label>
                              <div className="flex gap-2">
                                <Input type="color" value={value} onChange={e => handleNestedConfigChange('styling', 'colors', key, e.target.value)} className="w-16 h-10 p-1 border rounded" />
                                <Input value={value} onChange={e => handleNestedConfigChange('styling', 'colors', key, e.target.value)} placeholder="#000000" className="flex-1" />
                              </div>
                            </div>)}
                        </div>
                      </div>

                      <Separator />

                      {/* Fonts */}
                      <div className="space-y-4">
                        <h4 className="font-medium flex items-center gap-2">
                          <Type className="h-4 w-4" />
                          Configurações de Fonte
                        </h4>
                        {Object.entries(config.styling.fonts).map(([fontType, fontConfig]) => <div key={fontType} className="space-y-3 p-4 border rounded-lg">
                            <h5 className="font-medium capitalize">
                              {fontType === 'title' ? 'Título' : fontType === 'header' ? 'Cabeçalhos' : 'Corpo do Texto'}
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="space-y-2">
                                <Label>Família</Label>
                                <Select value={fontConfig.family} onValueChange={value => handleNestedConfigChange('styling', 'fonts', fontType, {
                              ...fontConfig,
                              family: value
                            })}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Arial">Arial</SelectItem>
                                    <SelectItem value="Helvetica">Helvetica</SelectItem>
                                    <SelectItem value="Times">Times New Roman</SelectItem>
                                    <SelectItem value="Georgia">Georgia</SelectItem>
                                    <SelectItem value="Verdana">Verdana</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Tamanho (pt)</Label>
                                <Input type="number" value={fontConfig.size} onChange={e => handleNestedConfigChange('styling', 'fonts', fontType, {
                              ...fontConfig,
                              size: Number(e.target.value)
                            })} />
                              </div>
                              <div className="space-y-2">
                                <Label>Peso</Label>
                                <Select value={fontConfig.weight} onValueChange={value => handleNestedConfigChange('styling', 'fonts', fontType, {
                              ...fontConfig,
                              weight: value
                            })}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="bold">Negrito</SelectItem>
                                    <SelectItem value="lighter">Mais Fino</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>)}
                      </div>

                      <Separator />

                      {/* Table Styling */}
                      <div className="space-y-4">
                        <h4 className="font-medium">Estilo das Tabelas</h4>
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Switch checked={config.styling.tables.showBorders} onCheckedChange={checked => handleNestedConfigChange('styling', 'tables', 'showBorders', checked)} />
                            <Label>Mostrar Bordas</Label>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Switch checked={config.styling.tables.alternateRows} onCheckedChange={checked => handleNestedConfigChange('styling', 'tables', 'alternateRows', checked)} />
                            <Label>Linhas Alternadas</Label>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Cor do Cabeçalho</Label>
                              <div className="flex gap-2">
                                <Input type="color" value={config.styling.tables.headerBg} onChange={e => handleNestedConfigChange('styling', 'tables', 'headerBg', e.target.value)} className="w-16 h-10 p-1 border rounded" />
                                <Input value={config.styling.tables.headerBg} onChange={e => handleNestedConfigChange('styling', 'tables', 'headerBg', e.target.value)} className="flex-1" />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Altura das Linhas (px)</Label>
                              <Input type="number" value={config.styling.tables.rowHeight} onChange={e => handleNestedConfigChange('styling', 'tables', 'rowHeight', Number(e.target.value))} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                 {/* Fields Tab */}
                <TabsContent value="fields" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Configuração dos Campos</CardTitle>
                          <CardDescription>
                            Selecione quais campos incluir no relatório e configure sua formatação
                          </CardDescription>
                        </div>
                        <Button onClick={addCustomField} variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Campo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {config.fields.map((field, index) => <div key={field.id} className="flex items-center gap-4 p-4 border rounded-lg">
                          <Switch checked={field.show} onCheckedChange={() => handleFieldToggle(field.id)} />
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Rótulo</Label>
                              <Input value={field.label} onChange={e => {
                            const newFields = [...config.fields];
                            newFields[index] = {
                              ...field,
                              label: e.target.value
                            };
                            setConfig(prev => ({
                              ...prev,
                              fields: newFields
                            }));
                          }} disabled={!field.show} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Campo</Label>
                              <Input value={field.name} onChange={e => {
                            const newFields = [...config.fields];
                            newFields[index] = {
                              ...field,
                              name: e.target.value
                            };
                            setConfig(prev => ({
                              ...prev,
                              fields: newFields
                            }));
                          }} placeholder="nome_do_campo" disabled={!field.show} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Tipo</Label>
                              <Select value={field.type} onValueChange={(value: 'text' | 'number' | 'date' | 'currency' | 'boolean') => {
                            const newFields = [...config.fields];
                            newFields[index] = {
                              ...field,
                              type: value
                            };
                            setConfig(prev => ({
                              ...prev,
                              fields: newFields
                            }));
                          }} disabled={!field.show}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="text">Texto</SelectItem>
                                  <SelectItem value="number">Número</SelectItem>
                                  <SelectItem value="date">Data</SelectItem>
                                  <SelectItem value="currency">Moeda</SelectItem>
                                  <SelectItem value="boolean">Verdadeiro/Falso</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Largura (px)</Label>
                              <Input type="number" value={field.width || 100} onChange={e => {
                            const newFields = [...config.fields];
                            newFields[index] = {
                              ...field,
                              width: Number(e.target.value)
                            };
                            setConfig(prev => ({
                              ...prev,
                              fields: newFields
                            }));
                          }} disabled={!field.show} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Formato</Label>
                              <Input value={field.format || ''} onChange={e => {
                            const newFields = [...config.fields];
                            newFields[index] = {
                              ...field,
                              format: e.target.value
                            };
                            setConfig(prev => ({
                              ...prev,
                              fields: newFields
                            }));
                          }} placeholder="dd/MM/yyyy, R$ 0,00..." disabled={!field.show} />
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => removeField(index)} disabled={config.fields.length <= 1} className="ml-2">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>)}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Preview Tab */}
                <TabsContent value="preview" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Preview do Relatório</CardTitle>
                      <CardDescription>
                        Visualize como seu relatório ficará antes de gerar
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-lg p-6 bg-white" style={{
                      fontFamily: config.styling.fonts.body.family,
                      fontSize: `${config.styling.fonts.body.size}pt`,
                      color: config.styling.colors.text
                    }}>
                        {/* Header Preview */}
                        {config.layout.header.show && <div className="mb-4 pb-2 border-b" style={{
                        height: `${config.layout.header.height}px`,
                        backgroundColor: config.styling.colors.background,
                        borderColor: config.styling.colors.border
                      }}>
                            <div className="flex items-center justify-between">
                              {config.layout.logo.show && config.layout.logo.position === 'left' && config.layout.logo.url && <img src={config.layout.logo.url} alt="Logo" style={{
                            height: `${config.layout.logo.size}px`
                          }} className="object-contain" />}
                              <div className={`${config.layout.logo.position === 'center' ? 'text-center flex-1' : ''}`} style={{
                            fontFamily: config.styling.fonts.title.family,
                            fontSize: `${config.styling.fonts.title.size}pt`,
                            fontWeight: config.styling.fonts.title.weight,
                            color: config.styling.colors.primary
                          }}>
                                {config.layout.header.content.replace('{{companyName}}', 'GESTÃO 360').replace('{{reportTitle}}', config.name).replace('{{date}}', new Date().toLocaleDateString('pt-BR'))}
                              </div>
                              {config.layout.logo.show && config.layout.logo.position === 'right' && config.layout.logo.url && <img src={config.layout.logo.url} alt="Logo" style={{
                            height: `${config.layout.logo.size}px`
                          }} className="object-contain" />}
                            </div>
                            {config.layout.logo.show && config.layout.logo.position === 'center' && config.layout.logo.url && <div className="text-center mt-2">
                                <img src={config.layout.logo.url} alt="Logo" style={{
                            height: `${config.layout.logo.size}px`
                          }} className="inline-block object-contain" />
                              </div>}
                          </div>}

                        {/* Table Preview */}
                        <div className="overflow-x-auto">
                          <table className="w-full" style={{
                          borderCollapse: 'collapse',
                          border: config.styling.tables.showBorders ? `1px solid ${config.styling.colors.border}` : 'none'
                        }}>
                            <thead>
                              <tr style={{
                              backgroundColor: config.styling.tables.headerBg
                            }}>
                                {config.fields.filter(f => f.show).map(field => <th key={field.id} className="p-2 text-left" style={{
                                border: config.styling.tables.showBorders ? `1px solid ${config.styling.colors.border}` : 'none',
                                fontFamily: config.styling.fonts.header.family,
                                fontSize: `${config.styling.fonts.header.size}pt`,
                                fontWeight: config.styling.fonts.header.weight,
                                width: `${field.width}px`
                              }}>
                                    {field.label}
                                  </th>)}
                              </tr>
                            </thead>
                            <tbody>
                              {[1, 2, 3].map(rowIndex => <tr key={rowIndex} style={{
                              backgroundColor: config.styling.tables.alternateRows && rowIndex % 2 === 0 ? `${config.styling.colors.background}` : 'transparent',
                              height: `${config.styling.tables.rowHeight}px`
                            }}>
                                  {config.fields.filter(f => f.show).map(field => <td key={field.id} className="p-2" style={{
                                border: config.styling.tables.showBorders ? `1px solid ${config.styling.colors.border}` : 'none'
                              }}>
                                      {field.type === 'text' && `Texto ${rowIndex}`}
                                      {field.type === 'number' && `${rowIndex}00`}
                                      {field.type === 'date' && new Date().toLocaleDateString('pt-BR')}
                                      {field.type === 'currency' && `R$ ${(rowIndex * 1000).toLocaleString('pt-BR', {
                                  minimumFractionDigits: 2
                                })}`}
                                      {field.type === 'boolean' && (rowIndex % 2 === 0 ? 'Sim' : 'Não')}
                                    </td>)}
                                </tr>)}
                            </tbody>
                          </table>
                        </div>

                        {/* Footer Preview */}
                        {config.layout.footer.show && <div className="mt-4 pt-2 border-t text-center" style={{
                        height: `${config.layout.footer.height}px`,
                        borderColor: config.styling.colors.border,
                        fontSize: `${config.styling.fonts.body.size - 1}pt`,
                        color: config.styling.colors.secondary
                      }}>
                            {config.layout.footer.content.replace('{{pageNumber}}', '1').replace('{{totalPages}}', '1').replace('{{date}}', new Date().toLocaleDateString('pt-BR')).replace('{{recordCount}}', '3')}
                          </div>}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>

          {/* Right Panel - Actions */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={handleGenerateReport} disabled={isGenerating} className="w-full">
                  {isGenerating ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                  {isGenerating ? 'Gerando...' : 'Gerar Relatório'}
                </Button>
                
                <Button variant="outline" onClick={handleSaveTemplate} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Template
                </Button>
                
                <Button variant="outline" onClick={() => setActiveTab('preview')} className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Preview
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Formato:</span>
                  <Badge variant="outline">{config.format.toUpperCase()}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Campos Ativos:</span>
                  <span>{config.fields.filter(f => f.show).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Registros:</span>
                  <span>{data.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
}