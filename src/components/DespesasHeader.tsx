
import React from 'react';
import { TrendingDown } from 'lucide-react';

interface DespesasHeaderProps {
  filteredCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
}

const DespesasHeader: React.FC<DespesasHeaderProps> = ({ 
  filteredCount, 
  totalCount, 
  hasActiveFilters 
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl shadow-lg">
          <TrendingDown className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
            Despesas
          </h1>
          <p className="text-gray-600 text-lg">Gerencie todas as despesas do negócio</p>
          {hasActiveFilters && (
            <p className="text-sm text-purple-600">
              Mostrando {filteredCount} de {totalCount} registros
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DespesasHeader;
