
import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PeriodSelectorProps {
  selectedPeriod: 'today' | 'week' | 'month' | 'year' | 'custom';
  onPeriodChange: (period: 'today' | 'week' | 'month' | 'year' | 'custom') => void;
  customMonth?: number;
  customYear?: number;
  onCustomDateChange?: (month: number, year: number) => void;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  selectedPeriod,
  onPeriodChange,
  customMonth = new Date().getMonth() + 1,
  customYear = new Date().getFullYear(),
  onCustomDateChange
}) => {
  const [tempMonth, setTempMonth] = useState(customMonth);
  const [tempYear, setTempYear] = useState(customYear);

  const months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
  ];

  const years = [];
  for (let year = new Date().getFullYear() - 5; year <= new Date().getFullYear() + 5; year++) {
    years.push(year);
  }

  const handleCustomSelection = () => {
    onCustomDateChange?.(tempMonth, tempYear);
    onPeriodChange('custom');
  };

  const getCustomLabel = () => {
    if (selectedPeriod === 'custom') {
      const monthName = months.find(m => m.value === customMonth)?.label;
      return `${monthName} ${customYear}`;
    }
    return 'Personalizado';
  };

  return (
    <div className="overflow-x-auto no-scrollbar -mx-1 px-1">
      <div className="flex gap-2 w-max">
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

        {/* Custom Period Selector */}
        <Popover>
          <PopoverTrigger asChild>
            <button 
              className={`shrink-0 px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm rounded-2xl flex items-center gap-2 ${
                selectedPeriod === 'custom' 
                  ? 'bg-black text-white' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Calendar className="h-4 w-4" />
              {getCustomLabel()}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Selecionar Período Personalizado</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600">Mês</label>
                  <Select value={tempMonth.toString()} onValueChange={(value) => setTempMonth(parseInt(value))}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value.toString()}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600">Ano</label>
                  <Select value={tempYear.toString()} onValueChange={(value) => setTempYear(parseInt(value))}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleCustomSelection} className="w-full h-9">
                Aplicar Filtro
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default PeriodSelector;
