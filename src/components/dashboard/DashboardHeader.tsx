
import React from 'react';

interface DashboardHeaderProps {
  selectedPeriod: 'today' | 'week' | 'month' | 'year';
  onPeriodChange: (period: 'today' | 'week' | 'month' | 'year') => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ selectedPeriod, onPeriodChange }) => {
  return (
    <div className="mb-6">
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 justify-start md:justify-end">
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
  );
};

export default DashboardHeader;
