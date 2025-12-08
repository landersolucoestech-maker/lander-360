// OFX Parser utility for importing bank statements

export interface OFXTransaction {
  id: string;
  type: 'credit' | 'debit';
  date: Date;
  amount: number;
  description: string;
  fitId: string;
}

export interface OFXData {
  bankId: string;
  accountId: string;
  accountType: string;
  currency: string;
  startDate: Date;
  endDate: Date;
  transactions: OFXTransaction[];
}

export function parseOFX(content: string): OFXData {
  // Remove SGML headers and get XML-like content
  const lines = content.split('\n');
  let xmlContent = '';
  let inXml = false;
  
  for (const line of lines) {
    if (line.trim().startsWith('<OFX>') || line.trim().startsWith('<OFX ')) {
      inXml = true;
    }
    if (inXml) {
      xmlContent += line + '\n';
    }
  }

  // If no <OFX> tag found, try to parse the whole content
  if (!xmlContent) {
    xmlContent = content;
  }

  const transactions: OFXTransaction[] = [];

  // Extract bank info
  const bankIdMatch = xmlContent.match(/<BANKID>([^<\n]+)/i);
  const accountIdMatch = xmlContent.match(/<ACCTID>([^<\n]+)/i);
  const accountTypeMatch = xmlContent.match(/<ACCTTYPE>([^<\n]+)/i);
  const currencyMatch = xmlContent.match(/<CURDEF>([^<\n]+)/i);
  const startDateMatch = xmlContent.match(/<DTSTART>([^<\n]+)/i);
  const endDateMatch = xmlContent.match(/<DTEND>([^<\n]+)/i);

  // Extract transactions using regex
  const stmtTrnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
  let match;

  while ((match = stmtTrnRegex.exec(xmlContent)) !== null) {
    const trnContent = match[1];
    
    const trnTypeMatch = trnContent.match(/<TRNTYPE>([^<\n]+)/i);
    const dtPostedMatch = trnContent.match(/<DTPOSTED>([^<\n]+)/i);
    const trnAmtMatch = trnContent.match(/<TRNAMT>([^<\n]+)/i);
    const fitIdMatch = trnContent.match(/<FITID>([^<\n]+)/i);
    const memoMatch = trnContent.match(/<MEMO>([^<\n]+)/i);
    const nameMatch = trnContent.match(/<NAME>([^<\n]+)/i);

    if (dtPostedMatch && trnAmtMatch) {
      const amount = parseFloat(trnAmtMatch[1].trim());
      const dateStr = dtPostedMatch[1].trim();
      const date = parseOFXDate(dateStr);
      
      transactions.push({
        id: fitIdMatch?.[1]?.trim() || `trn_${Date.now()}_${Math.random()}`,
        type: amount >= 0 ? 'credit' : 'debit',
        date,
        amount: Math.abs(amount),
        description: memoMatch?.[1]?.trim() || nameMatch?.[1]?.trim() || 'Transação importada',
        fitId: fitIdMatch?.[1]?.trim() || '',
      });
    }
  }

  return {
    bankId: bankIdMatch?.[1]?.trim() || '',
    accountId: accountIdMatch?.[1]?.trim() || '',
    accountType: accountTypeMatch?.[1]?.trim() || 'CHECKING',
    currency: currencyMatch?.[1]?.trim() || 'BRL',
    startDate: startDateMatch ? parseOFXDate(startDateMatch[1].trim()) : new Date(),
    endDate: endDateMatch ? parseOFXDate(endDateMatch[1].trim()) : new Date(),
    transactions,
  };
}

function parseOFXDate(dateStr: string): Date {
  // OFX date format: YYYYMMDDHHMMSS or YYYYMMDD
  const year = parseInt(dateStr.substring(0, 4), 10);
  const month = parseInt(dateStr.substring(4, 6), 10) - 1;
  const day = parseInt(dateStr.substring(6, 8), 10);
  const hour = dateStr.length >= 10 ? parseInt(dateStr.substring(8, 10), 10) : 0;
  const minute = dateStr.length >= 12 ? parseInt(dateStr.substring(10, 12), 10) : 0;
  const second = dateStr.length >= 14 ? parseInt(dateStr.substring(12, 14), 10) : 0;

  return new Date(year, month, day, hour, minute, second);
}

export function exportToCSV(transactions: any[]): string {
  const headers = [
    'Data',
    'Descrição',
    'Tipo',
    'Categoria',
    'Valor',
    'Status',
    'Método de Pagamento',
    'Observações'
  ];

  const rows = transactions.map(t => [
    t.transaction_date || t.date || '',
    t.description || '',
    t.transaction_type || t.type || '',
    t.category || '',
    t.amount?.toString() || '0',
    t.status || '',
    t.payment_method || '',
    t.observations || ''
  ]);

  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(';'))
  ].join('\n');

  return csvContent;
}

export function exportToOFX(transactions: any[], bankInfo?: { bankId?: string; accountId?: string }): string {
  const now = new Date();
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  };

  const transactionEntries = transactions.map((t, index) => {
    const date = t.transaction_date || t.date || new Date().toISOString().split('T')[0];
    const dateObj = new Date(date);
    const amount = t.transaction_type === 'despesas' ? -Math.abs(t.amount || 0) : Math.abs(t.amount || 0);
    const trnType = amount >= 0 ? 'CREDIT' : 'DEBIT';
    
    return `<STMTTRN>
<TRNTYPE>${trnType}
<DTPOSTED>${formatDate(dateObj)}
<TRNAMT>${amount.toFixed(2)}
<FITID>${t.id || `TRN${index + 1}`}
<MEMO>${(t.description || 'Transação').replace(/[<>&]/g, '')}
</STMTTRN>`;
  }).join('\n');

  const dates = transactions
    .map(t => new Date(t.transaction_date || t.date || now))
    .sort((a, b) => a.getTime() - b.getTime());
  
  const startDate = dates.length > 0 ? dates[0] : now;
  const endDate = dates.length > 0 ? dates[dates.length - 1] : now;

  return `OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:USASCII
CHARSET:1252
COMPRESSION:NONE
OLDFILEUID:NONE
NEWFILEUID:NONE

<OFX>
<SIGNONMSGSRSV1>
<SONRS>
<STATUS>
<CODE>0
<SEVERITY>INFO
</STATUS>
<DTSERVER>${formatDate(now)}
<LANGUAGE>POR
</SONRS>
</SIGNONMSGSRSV1>
<BANKMSGSRSV1>
<STMTTRNRS>
<TRNUID>1
<STATUS>
<CODE>0
<SEVERITY>INFO
</STATUS>
<STMTRS>
<CURDEF>BRL
<BANKACCTFROM>
<BANKID>${bankInfo?.bankId || '000'}
<ACCTID>${bankInfo?.accountId || '00000000'}
<ACCTTYPE>CHECKING
</BANKACCTFROM>
<BANKTRANLIST>
<DTSTART>${formatDate(startDate)}
<DTEND>${formatDate(endDate)}
${transactionEntries}
</BANKTRANLIST>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>`;
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
