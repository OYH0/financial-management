
import React, { useState, useMemo } from 'react';
import { Building2 } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { useDespesas } from '@/hooks/useDespesas';
import { useReceitas } from '@/hooks/useReceitas';
import AnalyseCostsModal from '@/components/AnalyseCostsModal';
import ProjectionsModal from '@/components/ProjectionsModal';
import ComparativeModal from '@/components/ComparativeModal';
import JohnnyHeader from '@/components/johnny/JohnnyHeader';
import JohnnyStats from '@/components/johnny/JohnnyStats';
import JohnnyCharts from '@/components/johnny/JohnnyCharts';
import JohnnyInsights from '@/components/johnny/JohnnyInsights';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { filterDataByPeriod } from '@/components/dashboard/utils';
import PeriodSelector from '@/components/PeriodSelector';

const JohnnyPage = () => {
  const { data: despesas } = useDespesas();
  const { data: receitas } = useReceitas();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year' | 'custom'>('month');
  const [customMonth, setCustomMonth] = useState<number>(new Date().getMonth() + 1);
  const [customYear, setCustomYear] = useState<number>(new Date().getFullYear());

  // Filtrar dados do Johnny Rockets - usando várias variações possíveis do nome
  const johnnyDespesas = despesas?.filter(d => {
    const empresa = d.empresa?.toLowerCase().trim() || '';
    return empresa === 'johnny' || 
           empresa === 'johnny rockets' || 
           empresa === 'johnny rocket' ||
           empresa.includes('johnny');
  }) || [];
  
  const johnnyReceitas = receitas?.filter(r => {
    const empresa = r.empresa?.toLowerCase().trim() || '';
    const isJohnny = empresa === 'johnny' || 
           empresa === 'johnny rockets' || 
           empresa === 'johnny rocket' ||
           empresa.includes('johnny');
    
    // Excluir receitas com destino "conta" ou "cofre"
    const destino = (r as any).destino;
    const isDestinoProd = destino === 'total' || !destino;
    
    return isJohnny && isDestinoProd;
  }) || [];

  // Aplicar filtro de período
  const { filteredDespesas, filteredReceitas } = useMemo(() => {
    console.log('=== JOHNNY DEBUG ===');
    console.log('Despesas Johnny antes do filtro de período:', johnnyDespesas.length);
    console.log('Receitas Johnny antes do filtro de período:', johnnyReceitas.length);
    console.log('Período selecionado:', selectedPeriod);
    console.log('Mês customizado:', customMonth, 'Ano customizado:', customYear);
    
    const filtered = {
      filteredDespesas: filterDataByPeriod(johnnyDespesas, selectedPeriod, customMonth, customYear),
      filteredReceitas: filterDataByPeriod(johnnyReceitas, selectedPeriod, customMonth, customYear)
    };
    
    console.log('Despesas Johnny após filtro de período:', filtered.filteredDespesas.length);
    console.log('Receitas Johnny após filtro de período:', filtered.filteredReceitas.length);
    
    // Debug dos totais
    const totalDespesasJohnny = filtered.filteredDespesas.reduce((sum, d) => sum + (d.valor_total || d.valor || 0), 0);
    const totalReceitasJohnny = filtered.filteredReceitas.reduce((sum, r) => sum + (r.valor || 0), 0);
    
    console.log('Total Despesas Johnny:', totalDespesasJohnny.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
    console.log('Total Receitas Johnny:', totalReceitasJohnny.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
    
    return filtered;
  }, [johnnyDespesas, johnnyReceitas, selectedPeriod, customMonth, customYear]);

  const handleCustomDateChange = (month: number, year: number) => {
    setCustomMonth(month);
    setCustomYear(year);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Sidebar />
      
      <div className="flex-1 lg:ml-64 transition-all duration-300 p-4 lg:p-8">
        <div className="w-full">
          <div className="mb-8">
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 lg:p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                  <Building2 className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">
                    Johnny Rockets
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
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl h-10 lg:h-12 text-sm lg:text-base">
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
          
          <JohnnyStats 
            despesas={filteredDespesas} 
            receitas={filteredReceitas} 
            selectedPeriod={selectedPeriod}
            allDespesas={johnnyDespesas}
            allReceitas={johnnyReceitas}
          />
          <JohnnyCharts despesas={filteredDespesas} receitas={filteredReceitas} />
          <JohnnyInsights 
            despesas={filteredDespesas} 
            receitas={filteredReceitas}
            selectedPeriod={selectedPeriod}
            customMonth={customMonth}
            customYear={customYear}
          />
        </div>
      </div>

      <AnalyseCostsModal
        isOpen={activeModal === 'costs'}
        onClose={() => setActiveModal(null)}
        despesas={filteredDespesas}
        allDespesas={johnnyDespesas}
        empresa="Johnny Rockets"
      />

      <ProjectionsModal
        isOpen={activeModal === 'projections'}
        onClose={() => setActiveModal(null)}
        despesas={filteredDespesas}
        receitas={filteredReceitas}
        allDespesas={johnnyDespesas}
        allReceitas={johnnyReceitas}
        empresa="Johnny Rockets"
      />

      <ComparativeModal
        isOpen={activeModal === 'comparative'}
        onClose={() => setActiveModal(null)}
        empresa="Johnny Rockets"
      />
    </div>
  );
};

export default JohnnyPage;
