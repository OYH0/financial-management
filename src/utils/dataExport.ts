
import { jsPDF } from 'jspdf';

export interface ExportData {
  despesas: any[];
  receitas: any[];
  configuracoes: any;
  dataExportacao: string;
}

export const exportDataToPDF = () => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('Relatório de Dados - Sistema Financeiro', 20, 30);
  
  doc.setFontSize(12);
  doc.text(`Data de Exportação: ${new Date().toLocaleDateString('pt-BR')}`, 20, 45);
  
  // Despesas
  doc.setFontSize(16);
  doc.text('Despesas', 20, 65);
  
  // Receitas
  doc.text('Receitas', 20, 120);
  
  // Footer
  doc.setFontSize(10);
  doc.text('Gerado pelo Sistema de Gestão Financeira', 20, 280);
  
  // Save the PDF
  doc.save(`relatorio-financeiro-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportDespesasToPDF = (despesas: any[], filtros?: string) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('Relatório de Despesas', 20, 30);
  
  doc.setFontSize(12);
  doc.text(`Data de Exportação: ${new Date().toLocaleDateString('pt-BR')}`, 20, 45);
  
  if (filtros) {
    doc.text(`Filtros Aplicados: ${filtros}`, 20, 55);
  }
  
  // Summary
  const totalDespesas = despesas.reduce((sum, d) => sum + (d.valor || 0), 0);
  doc.setFontSize(14);
  doc.text('Resumo:', 20, 75);
  doc.setFontSize(12);
  doc.text(`Total de Registros: ${despesas.length}`, 30, 85);
  doc.text(`Valor Total: R$ ${totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 30, 95);
  
  // Table headers
  let y = 115;
  doc.setFontSize(10);
  doc.text('Data', 20, y);
  doc.text('Empresa', 50, y);
  doc.text('Descrição', 80, y);
  doc.text('Categoria', 130, y);
  doc.text('Valor', 170, y);
  
  // Table content
  despesas.slice(0, 20).forEach((despesa, index) => { // Limit to 20 items for PDF
    y += 10;
    if (y > 270) { // New page if needed
      doc.addPage();
      y = 20;
    }
    
    doc.text(new Date(despesa.date || despesa.data).toLocaleDateString('pt-BR'), 20, y);
    doc.text((despesa.company || despesa.empresa || '').substring(0, 15), 50, y);
    doc.text((despesa.description || despesa.descricao || '').substring(0, 25), 80, y);
    doc.text((despesa.category || despesa.categoria || '').substring(0, 15), 130, y);
    doc.text(`R$ ${(despesa.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 170, y);
  });
  
  if (despesas.length > 20) {
    y += 20;
    doc.text(`... e mais ${despesas.length - 20} registros`, 20, y);
  }
  
  // Footer
  doc.setFontSize(8);
  doc.text('Gerado pelo Sistema de Gestão Financeira', 20, 290);
  
  // Save the PDF
  doc.save(`despesas-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportDataToJSON = () => {
  const data: ExportData = {
    despesas: JSON.parse(localStorage.getItem('despesas') || '[]'),
    receitas: JSON.parse(localStorage.getItem('receitas') || '[]'),
    configuracoes: JSON.parse(localStorage.getItem('app-settings') || '{}'),
    dataExportacao: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup-dados-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importDataFromJSON = (file: File): Promise<ExportData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch (error) {
        reject(new Error('Arquivo inválido'));
      }
    };
    
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsText(file);
  });
};
