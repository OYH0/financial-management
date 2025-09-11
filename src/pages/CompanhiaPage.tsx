
import React, { useState, useMemo } from 'react';
import { Building2, TrendingUp, DollarSign, Users, BarChart3, Package } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import PeriodSelector from '@/components/PeriodSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDespesas } from '@/hooks/useDespesas';
import { useReceitas } from '@/hooks/useReceitas';
import AnalyseCostsModal from '@/components/AnalyseCostsModal';
import ProjectionsModal from '@/components/ProjectionsModal';
import ComparativeModal from '@/components/ComparativeModal';
import MonthlyGoals from '@/components/MonthlyGoals';
import NextActions from '@/components/NextActions';
import { filterDataByPeriod } from '@/components/dashboard/utils';
import { calculateProfitByPeriod } from '@/utils/dateUtils';
import CompanhiaCharts from '@/components/companhia/CompanhiaCharts';
import CompanhiaStats from '@/components/companhia/CompanhiaStats';

const CompanhiaPage = () => {
  const { data: despesas } = useDespesas();
  const { data: receitas } = useReceitas();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year' | 'custom'>('month');
  const [customMonth, setCustomMonth] = useState<number>(new Date().getMonth() + 1);
  const [customYear, setCustomYear] = useState<number>(new Date().getFullYear());

  // Filtrar dados da Companhia do Churrasco - usando várias variações possíveis do nome
  const companhiaDespesas = despesas?.filter(d => {
    const empresa = d.empresa?.toLowerCase().trim() || '';
    return empresa === 'churrasco' || 
           empresa === 'companhia do churrasco' || 
           empresa === 'cia do churrasco' ||
           empresa.includes('churrasco');
  }) || [];
  
  const companhiaReceitas = receitas?.filter(r => {
    const empresa = r.empresa?.toLowerCase().trim() || '';
    const isCompanhia = empresa === 'churrasco' || 
           empresa === 'companhia do churrasco' || 
           empresa === 'cia do churrasco' ||
           empresa.includes('churrasco');
    
    // Excluir receitas com destino "conta" ou "cofre"
    const destino = (r as any).destino;
    const isDestinoProd = destino === 'total' || !destino;
    
    return isCompanhia && isDestinoProd;
  }) || [];

  // Aplicar filtro de período usando a mesma lógica da aba de receitas
  const { filteredDespesas, filteredReceitas } = useMemo(() => {
    // Se for "month" (mês atual), usar a mesma lógica da ReceitasPage
    if (selectedPeriod === 'month') {
      console.log('=== COMPANHIA - Usando filtro mês atual igual ReceitasPage ===');
      const currentMonthDespesas = filterDataByPeriod(companhiaDespesas, selectedPeriod, customMonth, customYear);
      const currentMonthReceitas = filterDataByPeriod(companhiaReceitas, selectedPeriod, customMonth, customYear);
      
      return {
        filteredDespesas: currentMonthDespesas,
        filteredReceitas: currentMonthReceitas
      };
    } else {
      // Para outros períodos, usar filterDataByPeriod normal
      return {
        filteredDespesas: filterDataByPeriod(companhiaDespesas, selectedPeriod, customMonth, customYear),
        filteredReceitas: filterDataByPeriod(companhiaReceitas, selectedPeriod, customMonth, customYear)
      };
    }
  }, [companhiaDespesas, companhiaReceitas, selectedPeriod, customMonth, customYear]);

  console.log('=== COMPANHIA DEBUG ===');
  console.log('Churrasco - Receitas filtradas:', filteredReceitas.length);
  console.log('Churrasco - Total receitas período:', filteredReceitas.reduce((sum, r) => sum + r.valor, 0));
  console.log('Churrasco - Despesas filtradas:', filteredDespesas.length);
  console.log('Churrasco - Total despesas período:', filteredDespesas.reduce((sum, d) => sum + (d.valor_total || d.valor), 0));

  // Calcular estatísticas - usar nova lógica de lucro por período
  const totalDespesasPeriodo = filteredDespesas.reduce((sum, d) => sum + (d.valor_total || d.valor), 0);
  const totalReceitasPeriodo = filteredReceitas.reduce((sum, r) => sum + r.valor, 0);
  
  // Calcular lucro simples baseado nos dados já filtrados pelo período
  const lucroCalculado = totalReceitasPeriodo - totalDespesasPeriodo;
  const margemLucro = totalReceitasPeriodo > 0 ? (lucroCalculado / totalReceitasPeriodo) * 100 : 0;

  // Calcular CMV (Custo da Mercadoria Vendida) - apenas despesas de INSUMOS
  const cmvTotal = filteredDespesas
    .filter(d => d.categoria?.toUpperCase().includes('INSUMOS'))
    .reduce((sum, d) => sum + (d.valor_total || d.valor), 0);
  
  const percentualCMV = totalReceitasPeriodo > 0 ? (cmvTotal / totalReceitasPeriodo) * 100 : 0;

  // Para os indicadores (ROI e Break Even), usar dados acumulados totais
  const totalDespesasAcumulado = companhiaDespesas.reduce((sum, d) => sum + (d.valor_total || d.valor), 0);
  const totalReceitasAcumulado = companhiaReceitas.reduce((sum, r) => sum + r.valor, 0);

  // Determinar o label do lucro baseado no período
  const getLucroLabel = () => {
    switch (selectedPeriod) {
      case 'today': return 'Lucro Líquido Hoje';
      case 'week': return 'Lucro Líquido Semanal';
      case 'month': return 'Lucro Líquido Mensal';
      case 'year': return 'Lucro Líquido Anual';
      case 'custom': return 'Lucro Líquido Personalizado';
      default: return 'Lucro Líquido';
    }
  };

  const handleCustomDateChange = (month: number, year: number) => {
    setCustomMonth(month);
    setCustomYear(year);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <Sidebar />
      
      <div className="flex-1 lg:ml-64 transition-all duration-300 p-4 lg:p-8">
        <div className="w-full">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 lg:p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl shadow-lg">
                  <Building2 className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-red-600 via-red-700 to-red-800 bg-clip-text text-transparent">
                    Companhia do Churrasco
                  </h1>
                  <p className="text-gray-600 text-sm lg:text-lg">Análise financeira detalhada da empresa</p>
                </div>
              </div>

              {/* Filtros de Período */}
              <div className="w-full lg:w-auto">
                <PeriodSelector
                  selectedPeriod={selectedPeriod}
                  onPeriodChange={setSelectedPeriod}
                  customMonth={customMonth}
                  customYear={customYear}
                  onCustomDateChange={handleCustomDateChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
              <Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl h-10 lg:h-12 text-sm lg:text-base">
                Relatório Mensal
              </Button>
              <Button 
                variant="outline" 
                className="rounded-2xl h-10 lg:h-12 text-sm lg:text-base"
                onClick={() => setActiveModal('costs')}
              >
                Análise de Custos
              </Button>
              <Button 
                variant="outline" 
                className="rounded-2xl h-10 lg:h-12 text-sm lg:text-base"
                onClick={() => setActiveModal('projections')}
              >
                Projeções
              </Button>
              <Button 
                variant="outline" 
                className="rounded-2xl h-10 lg:h-12 text-sm lg:text-base"
                onClick={() => setActiveModal('comparative')}
              >
                Comparativo
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <CompanhiaStats 
            despesas={filteredDespesas} 
            receitas={filteredReceitas} 
            selectedPeriod={selectedPeriod}
            allDespesas={companhiaDespesas}
            allReceitas={companhiaReceitas}
          />

          {/* Charts Component */}
          <CompanhiaCharts despesas={filteredDespesas} receitas={filteredReceitas} />

          {/* Informações Adicionais */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Indicadores de Performance */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Indicadores</CardTitle>
                <CardDescription>KPIs principais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                  <span className="text-red-700 font-medium">ROI</span>
                  <span className="text-red-800 font-bold">
                    {totalDespesasAcumulado > 0 ? (((totalReceitasAcumulado - totalDespesasAcumulado) / totalDespesasAcumulado) * 100).toFixed(1) : '0'}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl">
                  <span className="text-orange-700 font-medium">Break Even</span>
                  <span className="text-orange-800 font-bold">
                    R$ {totalDespesasAcumulado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-xl">
                  <span className="text-yellow-700 font-medium">Crescimento</span>
                  <span className="text-yellow-800 font-bold">+12.5%</span>
                </div>
              </CardContent>
            </Card>

            {/* Metas e Objetivos - Now properly connected to period selection */}
            <MonthlyGoals 
              empresa="Churrasco" 
              selectedPeriod={selectedPeriod}
              customMonth={customMonth}
              customYear={customYear}
            />

            {/* Próximas Ações */}
            <NextActions empresa="Companhia do Churrasco" />
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnalyseCostsModal
        isOpen={activeModal === 'costs'}
        onClose={() => setActiveModal(null)}
        despesas={filteredDespesas}
        allDespesas={companhiaDespesas}
        empresa="Companhia do Churrasco"
      />

      <ProjectionsModal
        isOpen={activeModal === 'projections'}
        onClose={() => setActiveModal(null)}
        despesas={filteredDespesas}
        receitas={filteredReceitas}
        allDespesas={companhiaDespesas}
        allReceitas={companhiaReceitas}
        empresa="Companhia do Churrasco"
      />

      <ComparativeModal
        isOpen={activeModal === 'comparative'}
        onClose={() => setActiveModal(null)}
        empresa="Companhia do Churrasco"
      />
    </div>
  );
};

export default CompanhiaPage;
