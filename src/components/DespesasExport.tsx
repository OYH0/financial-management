
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Download, FileText, FileJson } from 'lucide-react';
import { Transaction } from '@/types/transaction';
import { exportDataToPDF, exportDataToJSON } from '@/utils/dataExport';

interface DespesasExportProps {
  transactions: Transaction[];
}

const DespesasExport: React.FC<DespesasExportProps> = ({ transactions }) => {
  const [exportFormat, setExportFormat] = useState('pdf');
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = () => {
    if (exportFormat === 'pdf') {
      exportDespesasToPDF();
    } else if (exportFormat === 'json') {
      exportDespesasToJSON();
    } else if (exportFormat === 'csv') {
      exportDespesasToCSV();
    }
    setIsOpen(false);
  };

  const exportDespesasToPDF = () => {
    // Usar a função existente mas adaptar para despesas
    exportDataToPDF();
  };

  const exportDespesasToJSON = () => {
    const despesasData = {
      despesas: transactions,
      totalRegistros: transactions.length,
      totalValor: transactions.reduce((sum, t) => sum + t.valor, 0),
      dataExportacao: new Date().toISOString(),
      filtros: 'Todos os registros'
    };

    const blob = new Blob([JSON.stringify(despesasData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `despesas-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportDespesasToCSV = () => {
    const headers = ['Data', 'Empresa', 'Descrição', 'Categoria', 'Valor', 'Status'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => [
        new Date(t.date).toLocaleDateString('pt-BR'),
        t.company,
        `"${t.description}"`,
        t.category,
        t.valor.toFixed(2).replace('.', ','),
        getTransactionStatus(t)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `despesas-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTransactionStatus = (transaction: Transaction) => {
    const today = new Date();
    const transactionDate = new Date(transaction.date);
    const dueDate = transaction.data_vencimento ? new Date(transaction.data_vencimento) : transactionDate;
    
    if (transaction.data_vencimento && dueDate < today) {
      return 'ATRASADO';
    }
    
    if (transaction.category === 'ATRASADOS') {
      return 'ATRASADO';
    }
    
    if (transactionDate > today) {
      return 'PENDENTE';
    }
    
    return 'PAGO';
  };

  const getFormatIcon = () => {
    switch (exportFormat) {
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'json':
        return <FileJson className="h-4 w-4" />;
      case 'csv':
        return <FileText className="h-4 w-4" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 bg-white/50 hover:bg-white/80 border-gray-200">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="start">
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800">Exportar Despesas</h3>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Formato</label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-gray-600">
            <p>{transactions.length} registros serão exportados</p>
            <p>Total: R$ {transactions.reduce((sum, t) => sum + t.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>

          <Button 
            onClick={handleExport} 
            className="w-full flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            {getFormatIcon()}
            Exportar {exportFormat.toUpperCase()}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DespesasExport;
