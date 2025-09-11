
import React, { useState, useMemo } from 'react';
import { Building2, TrendingUp, DollarSign } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDespesas } from '@/hooks/useDespesas';
import { useReceitas } from '@/hooks/useReceitas';
import NextActions from '@/components/NextActions';
import { filterDataByPeriod } from '@/components/dashboard/utils';
import PeriodSelector from '@/components/PeriodSelector';
import CamerinoCharts from '@/components/camerino/CamerinoCharts';
import CamerinoStats from '@/components/camerino/CamerinoStats';
import CamerinoPasswordProtection from '@/components/CamerinoPasswordProtection';

const CamerinoPage = () => {
  const { data: despesas } = useDespesas();
  const { data: receitas } = useReceitas();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year' | 'custom'>('month');
  const [customMonth, setCustomMonth] = useState<number>(new Date().getMonth() + 1);
  const [customYear, setCustomYear] = useState<number>(new Date().getFullYear());
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Filtrar dados do Camerino - usando várias variações possíveis do nome
  const camerinoDespesas = useMemo(() => {
    return despesas?.filter(d => {
      const empresa = d.empresa?.toLowerCase().trim() || '';
      return empresa === 'camerino' || empresa.includes('camerino');
    }) || [];
  }, [despesas]);
  
  const camerinoReceitas = useMemo(() => {
    return receitas?.filter(r => {
      const empresa = r.empresa?.toLowerCase().trim() || '';
      const isCamerino = empresa === 'camerino' || empresa.includes('camerino');
      
      // Excluir receitas com destino "conta" ou "cofre"
      const destino = (r as any).destino;
      const isDestinoProd = destino === 'total' || !destino;
      
      return isCamerino && isDestinoProd;
    }) || [];
  }, [receitas]);

  // Aplicar filtro de período APENAS para exibição dos cards de estatísticas
  const { filteredDespesas, filteredReceitas } = useMemo(() => {
    return {
      filteredDespesas: filterDataByPeriod(camerinoDespesas, selectedPeriod, customMonth, customYear),
      filteredReceitas: filterDataByPeriod(camerinoReceitas, selectedPeriod, customMonth, customYear)
    };
  }, [camerinoDespesas, camerinoReceitas, selectedPeriod, customMonth, customYear]);

  // Calcular estatísticas
  const totalDespesasPeriodo = useMemo(() => 
    filteredDespesas.reduce((sum, d) => sum + (d.valor_total || d.valor), 0), 
    [filteredDespesas]
  );
  
  const totalReceitasPeriodo = useMemo(() => 
    filteredReceitas.reduce((sum, r) => sum + r.valor, 0), 
    [filteredReceitas]
  );

  const handleCustomDateChange = (month: number, year: number) => {
    setCustomMonth(month);
    setCustomYear(year);
  };

  // Se não estiver autenticado, mostrar tela de senha
  if (!isAuthenticated) {
    return <CamerinoPasswordProtection onPasswordCorrect={() => setIsAuthenticated(true)} />;
  }

  console.log('Camerino - Despesas filtradas:', filteredDespesas.length);
  console.log('Camerino - Despesas por categoria:', filteredDespesas.reduce((acc, d) => {
    const cat = d.categoria || 'SEM_CATEGORIA';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>));

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <Sidebar />
      
      <div className="flex-1 lg:ml-64 transition-all duration-300 p-4 lg:p-8">
        <div className="w-full">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 lg:p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-lg">
                  <Building2 className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent">
                    Camerino
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
          </div>

          {/* Stats Cards */}
          <CamerinoStats 
            despesas={filteredDespesas} 
            receitas={filteredReceitas} 
            selectedPeriod={selectedPeriod}
            allDespesas={camerinoDespesas}
            allReceitas={camerinoReceitas}
          />

          {/* Charts Component */}
          <CamerinoCharts despesas={filteredDespesas} receitas={filteredReceitas} />

          {/* Próximas Ações */}
          <div className="grid grid-cols-1 gap-6">
            <NextActions empresa="Camerino" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CamerinoPage;
