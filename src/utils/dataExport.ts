import { jsPDF } from 'jspdf';
import { parseDateFlexible } from './currentMonthFilter';

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

  let y = 55;
  if (filtros) {
    doc.text(`Filtros Aplicados: ${filtros}`, 20, y);
    y += 10;
  }

  // Summary
  const totalDespesas = despesas.reduce((sum, d) => sum + (d.valor_total || d.valor || 0), 0);
  doc.setFontSize(14);
  doc.text('Resumo:', 20, y);
  y += 10;
  doc.setFontSize(12);
  doc.text(`Total de Registros: ${despesas.length}`, 30, y);
  y += 10;
  doc.text(`Valor Total: R$ ${totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 30, y);
  y += 20;

  // Table headers
  doc.setFontSize(10);
  doc.text('Venc/Pagamento', 20, y);
  doc.text('Empresa', 50, y);
  doc.text('Descrição', 90, y);
  doc.text('Categoria', 145, y);
  doc.text('Valor', 180, y);

  // Table content
  despesas.forEach((despesa) => {
    y += 10;
    if (y > 270) { // New page if needed
      doc.addPage();
      y = 20;
      // Re-print headers
      doc.setFontSize(10);
      doc.text('Venc/Pagamento', 20, y);
      doc.text('Empresa', 50, y);
      doc.text('Descrição', 90, y);
      doc.text('Categoria', 145, y);
      doc.text('Valor', 180, y);
      y += 10;
    }

    // Proper date formatting
    const dateStr = despesa.data_vencimento || despesa.date || despesa.data || despesa.data_pagamento;
    const parsed = parseDateFlexible(dateStr);
    const displayDate = parsed ? parsed.toLocaleDateString('pt-BR') : '--/--/----';

    const empresaName = (despesa.company || despesa.empresa || '').substring(0, 18);
    const descText = (despesa.description || despesa.descricao || '').substring(0, 30);
    const catText = (despesa.category || despesa.categoria || '').substring(0, 18);
    const valueNum = despesa.valor_total || despesa.valor || 0;
    const valueText = `R$ ${valueNum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    doc.text(displayDate, 20, y);
    doc.text(empresaName, 50, y);
    doc.text(descText, 90, y);
    doc.text(catText, 145, y);
    doc.text(valueText, 180, y);
  });

  // Footer
  doc.setFontSize(8);
  if (y > 280) {
    doc.addPage();
    y = 20;
  }
  y += 10;
  doc.text('Gerado pelo Sistema de Gestão Financeira', 20, y);

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
