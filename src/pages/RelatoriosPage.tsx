
import React, { useState } from 'react';
import { FileText, Download, TrendingUp, DollarSign, Calendar, PieChart as PieChartIcon } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Tooltip, Legend } from 'recharts';
import { useDespesas } from '@/hooks/useDespesas';
import { useReceitas } from '@/hooks/useReceitas';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';

const RelatoriosPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('mes');
  const [selectedType, setSelectedType] = useState('geral');
  
  const { data: despesas } = useDespesas();
  const { data: receitas } = useReceitas();
  const { toast } = useToast();

  // Dados para gráfico de evolução mensal
  const monthlyData = React.useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentYear = new Date().getFullYear();
    
    console.log('=== DEBUG EVOLUÇÃO MENSAL ===');
    console.log('Ano atual:', currentYear);
    console.log('Total de receitas:', receitas?.length || 0);
    console.log('Primeiras 5 receitas:', receitas?.slice(0, 5).map(r => ({
      id: r.id,
      data: r.data,
      valor: r.valor,
      empresa: r.empresa
    })));
    
    return months.map((month, index) => {
      const monthDespesas = despesas?.filter(d => {
        const date = d.data_vencimento ? new Date(d.data_vencimento + 'T12:00:00') : d.data ? new Date(d.data + 'T12:00:00') : null;
        if (!date) return false;
        
        const isCurrentMonth = date.getMonth() === index && date.getFullYear() === currentYear;
        
        if (index === 0 || index === 5) { // Debug para Jan e Jun
          console.log(`Despesa - ${month}: data=${d.data_vencimento || d.data}, parsedDate=${date.toISOString()}, month=${date.getMonth()}, isCurrentMonth=${isCurrentMonth}`);
        }
        
        return isCurrentMonth;
      }).reduce((sum, d) => sum + (d.valor_total || d.valor || 0), 0) || 0;
      
      const monthReceitas = receitas?.filter(r => {
        const date = new Date(r.data + 'T12:00:00');
        const isCurrentMonth = date.getMonth() === index && date.getFullYear() === currentYear;
        
        if (index === 0 || index === 5) { // Debug para Jan e Jun
          console.log(`Receita - ${month}: data=${r.data}, parsedDate=${date.toISOString()}, month=${date.getMonth()}, isCurrentMonth=${isCurrentMonth}, valor=${r.valor}`);
        }
        
        return isCurrentMonth;
      }).reduce((sum, r) => sum + (r.valor || 0), 0) || 0;
      
      return {
        month,
        despesas: monthDespesas,
        receitas: monthReceitas,
        lucro: monthReceitas - monthDespesas
      };
    });
  }, [despesas, receitas]);

  // Dados para gráfico de distribuição por categoria (usando valor_total)
  const categoryData = React.useMemo(() => {
    const categories = ['INSUMOS', 'FIXAS', 'VARIAVEIS', 'ATRASADOS', 'RETIRADAS'];
    const colors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];
    
    return categories.map((category, index) => {
      const value = despesas?.filter(d => d.categoria === category || (category === 'VARIAVEIS' && d.categoria === 'VARIÁVEIS'))
        .reduce((sum, d) => sum + (d.valor_total || d.valor || 0), 0) || 0;
      
      return {
        name: category,
        value: value,
        color: colors[index]
      };
    }).filter(item => item.value > 0);
  }, [despesas]);

  // Dados para gráfico de receitas por empresa
  const receitasEmpresaData = React.useMemo(() => {
    const empresas = ['Churrasco', 'Johnny', 'Camerino'];
    const colors = ['#ef4444', '#3b82f6', '#10b981'];
    
    return empresas.map((empresa, index) => {
      const value = receitas?.filter(r => 
        (r.empresa === empresa || 
        (empresa === 'Churrasco' && r.empresa === 'Companhia do Churrasco') ||
        (empresa === 'Johnny' && r.empresa === 'Johnny Rockets')) &&
        (r.destino === 'total' || !r.destino) // Só contar receitas com destino 'total'
      ).reduce((sum, r) => sum + (r.valor || 0), 0) || 0;
      
      return {
        name: empresa === 'Churrasco' ? 'Companhia do Churrasco' : 
              empresa === 'Johnny' ? 'Johnny Rockets' : 
              empresa === 'Camerino' ? 'Camerino' : empresa,
        value,
        color: colors[index]
      };
    }).filter(item => item.value > 0);
  }, [receitas]);

  // Calcular estatísticas usando valor_total para despesas
  const totalDespesas = despesas?.reduce((sum, d) => sum + (d.valor_total || d.valor || 0), 0) || 0;
  const totalReceitas = receitas?.reduce((sum, r) => sum + (r.valor || 0), 0) || 0;
  const lucroTotal = totalReceitas - totalDespesas;
  const margemLucro = totalReceitas > 0 ? (lucroTotal / totalReceitas) * 100 : 0;

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      let yPosition = margin;

      // Header
      doc.setFontSize(20);
      doc.setTextColor(59, 130, 246);
      doc.text('Relatório Financeiro', margin, yPosition);
      yPosition += 15;

      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Período: ${selectedPeriod === 'mes' ? 'Este Mês' : selectedPeriod === 'trimestre' ? 'Trimestre' : selectedPeriod === 'semestre' ? 'Semestre' : 'Ano'}`, margin, yPosition);
      yPosition += 10;
      doc.text(`Tipo: ${selectedType === 'geral' ? 'Relatório Geral' : selectedType === 'despesas' ? 'Apenas Despesas' : selectedType === 'receitas' ? 'Apenas Receitas' : 'Comparativo'}`, margin, yPosition);
      yPosition += 20;

      // Financial Summary
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Resumo Financeiro', margin, yPosition);
      yPosition += 15;

      doc.setFontSize(12);
      doc.text(`Total de Receitas: R$ ${totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, margin, yPosition);
      yPosition += 8;
      doc.text(`Total de Despesas: R$ ${totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, margin, yPosition);
      yPosition += 8;
      doc.text(`Lucro Líquido: R$ ${lucroTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, margin, yPosition);
      yPosition += 8;
      doc.text(`Margem de Lucro: ${margemLucro.toFixed(1)}%`, margin, yPosition);
      yPosition += 20;

      // Despesas por Categoria
      if (categoryData.length > 0) {
        doc.setFontSize(16);
        doc.text('Despesas por Categoria', margin, yPosition);
        yPosition += 15;

        doc.setFontSize(12);
        categoryData.forEach((category) => {
          doc.text(`${category.name}: R$ ${category.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, margin, yPosition);
          yPosition += 8;
        });
        yPosition += 15;
      }

      // Receitas por Empresa
      if (receitasEmpresaData.length > 0) {
        doc.setFontSize(16);
        doc.text('Receitas por Empresa', margin, yPosition);
        yPosition += 15;

        doc.setFontSize(12);
        receitasEmpresaData.forEach((empresa) => {
          doc.text(`${empresa.name}: R$ ${empresa.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, margin, yPosition);
          yPosition += 8;
        });
        yPosition += 15;
      }

      // Indicadores Principais
      doc.setFontSize(16);
      doc.text('Indicadores Principais', margin, yPosition);
      yPosition += 15;

      doc.setFontSize(12);
      const maiorReceita = Math.max(...(receitas?.map(r => r.valor || 0) || [0]));
      const maiorDespesa = Math.max(...(despesas?.map(d => d.valor_total || d.valor || 0) || [0]));
      const mediaMensal = totalReceitas / 12;
      const totalTransacoes = (despesas?.length || 0) + (receitas?.length || 0);

      doc.text(`Maior Receita: R$ ${maiorReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, margin, yPosition);
      yPosition += 8;
      doc.text(`Maior Despesa: R$ ${maiorDespesa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, margin, yPosition);
      yPosition += 8;
      doc.text(`Média Mensal: R$ ${mediaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, margin, yPosition);
      yPosition += 8;
      doc.text(`Total de Transações: ${totalTransacoes}`, margin, yPosition);

      // Footer
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, margin, doc.internal.pageSize.height - 20);

      const fileName = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast({
        title: "PDF gerado com sucesso!",
        description: `O relatório foi baixado como ${fileName}`,
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao gerar o relatório. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <Sidebar />
      
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                  Relatórios
                </h1>
                <p className="text-gray-600 text-lg">Análises e relatórios financeiros</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48 rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mes">Este Mês</SelectItem>
                  <SelectItem value="trimestre">Trimestre</SelectItem>
                  <SelectItem value="semestre">Semestre</SelectItem>
                  <SelectItem value="ano">Ano</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-48 rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="geral">Relatório Geral</SelectItem>
                  <SelectItem value="despesas">Apenas Despesas</SelectItem>
                  <SelectItem value="receitas">Apenas Receitas</SelectItem>
                  <SelectItem value="comparativo">Comparativo</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                onClick={generatePDF}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg rounded-2xl"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Receitas</CardTitle>
                <div className="p-2 bg-gradient-to-r from-green-100 to-green-200 rounded-xl">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Despesas</CardTitle>
                <div className="p-2 bg-gradient-to-r from-red-100 to-red-200 rounded-xl">
                  <DollarSign className="h-4 w-4 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Lucro Líquido</CardTitle>
                <div className="p-2 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${lucroTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {lucroTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Margem de Lucro</CardTitle>
                <div className="p-2 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl">
                  <PieChartIcon className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${margemLucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {margemLucro.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Evolução Mensal</CardTitle>
                <CardDescription>Receitas vs Despesas por mês</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                      <Legend />
                      <Line type="monotone" dataKey="receitas" stroke="#10b981" strokeWidth={3} name="Receitas" />
                      <Line type="monotone" dataKey="despesas" stroke="#ef4444" strokeWidth={3} name="Despesas" />
                      <Line type="monotone" dataKey="lucro" stroke="#3b82f6" strokeWidth={3} name="Lucro" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Distribuição de Despesas</CardTitle>
                <CardDescription>Por categoria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Receitas por Empresa</CardTitle>
                <CardDescription>Distribuição das receitas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={receitasEmpresaData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                      <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Resumo do Período</CardTitle>
                <CardDescription>Principais indicadores</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                  <span className="text-green-700 font-medium">Maior Receita</span>
                  <span className="text-green-800 font-bold">
                    R$ {Math.max(...(receitas?.map(r => r.valor || 0) || [0])).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl">
                  <span className="text-red-700 font-medium">Maior Despesa</span>
                  <span className="text-red-800 font-bold">
                    R$ {Math.max(...(despesas?.map(d => d.valor_total || d.valor || 0) || [0])).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                  <span className="text-blue-700 font-medium">Média Mensal</span>
                  <span className="text-blue-800 font-bold">
                    R$ {(totalReceitas / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-purple-50 rounded-xl">
                  <span className="text-purple-700 font-medium">Total de Transações</span>
                  <span className="text-purple-800 font-bold">
                    {(despesas?.length || 0) + (receitas?.length || 0)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelatoriosPage;
