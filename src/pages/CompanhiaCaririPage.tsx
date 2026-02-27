import React, { useState, useMemo } from 'react';
import { Building2 } from 'lucide-react';
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
import CompanhiaCharts from '@/components/companhia/CompanhiaCharts';
import CompanhiaStats from '@/components/companhia/CompanhiaStats';

const CompanhiaCaririPage = () => {
  const { data: despesas } = useDespesas();
  const { data: receitas } = useReceitas();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year' | 'custom'>('month');
  const [customMonth, setCustomMonth] = useState<number>(new Date().getMonth() + 1);
  const [customYear, setCustomYear] = useState<number>(new Date().getFullYear());

  // Filtrar dados da Companhia do Churrasco Cariri (incluindo dados legados)
  const companhiaDespesas = despesas?.filter(d =>
    d.empresa === 'Companhia do Churrasco Cariri' ||
    d.empresa === 'Companhia do Churrasco'
  ) || [];

  const companhiaReceitas = receitas?.filter(r => {
    const destino = (r as any).destino;
    const isDestinoProd = destino === 'total' || !destino;
    const isCariri = r.empresa === 'Companhia do Churrasco Cariri' ||
      r.empresa === 'Companhia do Churrasco';
    return isCariri && isDestinoProd;
  }) || [];

  // Aplicar filtro de período
  const { filteredDespesas, filteredReceitas } = useMemo(() => {
    if (selectedPeriod === 'month') {
      const currentMonthDespesas = filterDataByPeriod(companhiaDespesas, selectedPeriod, customMonth, customYear);
      const currentMonthReceitas = filterDataByPeriod(companhiaReceitas, selectedPeriod, customMonth, customYear);

      return {
        filteredDespesas: currentMonthDespesas,
        filteredReceitas: currentMonthReceitas
      };
    } else {
      return {
        filteredDespesas: filterDataByPeriod(companhiaDespesas, selectedPeriod, customMonth, customYear),
        filteredReceitas: filterDataByPeriod(companhiaReceitas, selectedPeriod, customMonth, customYear)
      };
    }
  }, [companhiaDespesas, companhiaReceitas, selectedPeriod, customMonth, customYear]);

  // Calcular estatísticas
  const totalDespesasPeriodo = filteredDespesas.reduce((sum, d) => sum + (d.valor_total || d.valor), 0);
  const totalReceitasPeriodo = filteredReceitas.reduce((sum, r) => sum + r.valor, 0);
  const lucroCalculado = totalReceitasPeriodo - totalDespesasPeriodo;

  // Para os indicadores (ROI e Break Even), usar dados acumulados totais
  const totalDespesasAcumulado = companhiaDespesas.reduce((sum, d) => sum + (d.valor_total || d.valor), 0);
  const totalReceitasAcumulado = companhiaReceitas.reduce((sum, r) => sum + r.valor, 0);

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
                    Companhia do Churrasco - Cariri
                  </h1>
                  <p className="text-gray-600 text-sm lg:text-lg">Análise financeira detalhada da unidade Cariri</p>
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
          <CompanhiaCharts
            despesas={filteredDespesas}
            receitas={filteredReceitas}
            selectedCompany="cariri"
          />

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

            {/* Metas e Objetivos */}
            <MonthlyGoals
              empresa="Churrasco"
              selectedPeriod={selectedPeriod}
              customMonth={customMonth}
              customYear={customYear}
            />

            {/* Próximas Ações */}
            <NextActions empresa="Companhia do Churrasco - Cariri" />
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnalyseCostsModal
        isOpen={activeModal === 'costs'}
        onClose={() => setActiveModal(null)}
        despesas={filteredDespesas}
        allDespesas={companhiaDespesas}
        empresa="Companhia do Churrasco - Cariri"
      />

      <ProjectionsModal
        isOpen={activeModal === 'projections'}
        onClose={() => setActiveModal(null)}
        despesas={filteredDespesas}
        receitas={filteredReceitas}
        allDespesas={companhiaDespesas}
        allReceitas={companhiaReceitas}
        empresa="Companhia do Churrasco - Cariri"
      />

      <ComparativeModal
        isOpen={activeModal === 'comparative'}
        onClose={() => setActiveModal(null)}
        empresa="Companhia do Churrasco - Cariri"
      />
    </div>
  );
};

export default CompanhiaCaririPage;
