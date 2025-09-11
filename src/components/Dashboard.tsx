
import React, { useState, useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import Sidebar from './Sidebar';
import DashboardHeader from './dashboard/DashboardHeader';
import DashboardCards from './dashboard/DashboardCards';
import DashboardTransactions from './dashboard/DashboardTransactions';
import DashboardCharts from './dashboard/DashboardCharts';
import PeriodSelector from './PeriodSelector';
import { useDespesas } from '@/hooks/useDespesas';
import { useReceitas } from '@/hooks/useReceitas';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { filterDataByPeriod, getPeriodString } from './dashboard/utils';

const Dashboard = () => {
  const { data: despesas, isLoading: isLoadingDespesas, stats: despesasStats } = useDespesas();
  const { data: receitas, isLoading: isLoadingReceitas, stats: receitasStats } = useReceitas();
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year' | 'custom'>('month');
  const [customMonth, setCustomMonth] = useState<number>(new Date().getMonth() + 1);
  const [customYear, setCustomYear] = useState<number>(new Date().getFullYear());

  console.log('Dashboard - despesas count:', despesas?.length || 0);
  console.log('Dashboard - receitas count:', receitas?.length || 0);
  console.log('Dashboard - despesas stats:', despesasStats);
  console.log('Dashboard - receitas stats:', receitasStats);

  // Verificar se o usuário está autenticado
  if (!user) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Restrito</h2>
              <p className="text-gray-600 mb-8">Você precisa estar logado para acessar o dashboard.</p>
              <Button onClick={() => window.location.href = '/auth'}>
                Fazer Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isLoading = isLoadingDespesas || isLoadingReceitas;

  // Memoize filtered data for better performance
  const { filteredDespesas, filteredReceitas } = useMemo(() => {
    return {
      filteredDespesas: filterDataByPeriod(despesas || [], selectedPeriod, customMonth, customYear),
      filteredReceitas: filterDataByPeriod(receitas || [], selectedPeriod, customMonth, customYear)
    };
  }, [despesas, receitas, selectedPeriod, customMonth, customYear]);

  const period = getPeriodString(selectedPeriod, customMonth, customYear);

  const handleCustomDateChange = (month: number, year: number) => {
    setCustomMonth(month);
    setCustomYear(year);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 lg:ml-64 transition-all duration-300 p-4 lg:p-8">
        <div className="w-full">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 lg:p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                  <BarChart3 className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">
                    Dashboard Financeiro
                  </h1>
                  <p className="text-gray-600 text-sm lg:text-lg">Visão geral de todas as empresas</p>
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

          {isLoading ? (
            <div className="grid place-items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-lg text-gray-600">Carregando dados...</p>
              </div>
            </div>
          ) : (
            <>
              <DashboardCards 
                despesas={filteredDespesas} 
                period={period} 
                stats={despesasStats}
              />
              <DashboardTransactions despesas={filteredDespesas} />
              <DashboardCharts 
                despesas={despesas || []} 
                selectedPeriod={selectedPeriod}
                customYear={customYear}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Dashboard);
