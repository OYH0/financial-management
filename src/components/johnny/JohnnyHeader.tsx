
import React from 'react';
import { Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface JohnnyHeaderProps {
  onModalOpen: (modal: string) => void;
  selectedPeriod: 'today' | 'week' | 'month' | 'year' | 'custom';
  onPeriodChange: (period: 'today' | 'week' | 'month' | 'year' | 'custom') => void;
}

const JohnnyHeader: React.FC<JohnnyHeaderProps> = ({ onModalOpen, selectedPeriod, onPeriodChange }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">
              Johnny Rockets
            </h1>
            <p className="text-gray-600 text-lg">Análise financeira detalhada da empresa</p>
          </div>
        </div>

        {/* Filtros de Período */}
        <div className="w-full md:w-auto flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
          <button 
            className={`shrink-0 px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm rounded-2xl ${
              selectedPeriod === 'today' 
                ? 'bg-black text-white' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => onPeriodChange('today')}
          >
            Hoje
          </button>
          <button 
            className={`shrink-0 px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm rounded-2xl ${
              selectedPeriod === 'week' 
                ? 'bg-black text-white' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => onPeriodChange('week')}
          >
            Semana
          </button>
          <button 
            className={`shrink-0 px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm rounded-2xl ${
              selectedPeriod === 'month' 
                ? 'bg-black text-white' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => onPeriodChange('month')}
          >
            Mês
          </button>
          <button 
            className={`shrink-0 px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm rounded-2xl ${
              selectedPeriod === 'year' 
                ? 'bg-black text-white' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => onPeriodChange('year')}
          >
            Ano
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl h-12">
          Relatório Mensal
        </Button>
        <Button 
          variant="outline" 
          className="rounded-2xl h-12"
          onClick={() => onModalOpen('costs')}
        >
          Análise de Custos
        </Button>
        <Button 
          variant="outline" 
          className="rounded-2xl h-12"
          onClick={() => onModalOpen('projections')}
        >
          Projeções
        </Button>
        <Button 
          variant="outline" 
          className="rounded-2xl h-12"
          onClick={() => onModalOpen('comparative')}
        >
          Comparativo
        </Button>
      </div>
    </div>
  );
};

export default JohnnyHeader;
