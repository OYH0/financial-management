
import React, { useState } from 'react';
import { Plus, Filter, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DespesasFilter from './DespesasFilter';
import DespesasExport from './DespesasExport';
import { Transaction } from '@/types/transaction';

interface DespesasActionsProps {
  onFilterChange: (filters: any) => void;
  onClearFilters: () => void;
  onAddTransaction?: () => void;
  filteredTransactions: Transaction[];
  hasActiveFilters?: boolean;
}

const DespesasActions: React.FC<DespesasActionsProps> = ({ 
  onFilterChange, 
  onClearFilters, 
  onAddTransaction,
  filteredTransactions,
  hasActiveFilters = false
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showExport, setShowExport] = useState(false);

  return (
    <div className="mb-6">
      {/* Header com título */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-800">Ações</h2>
      </div>

      {/* Card de ações */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-4">
        <div className="flex flex-wrap items-center gap-3">
          {onAddTransaction && (
            <Button 
              onClick={onAddTransaction}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-4 py-2 flex items-center gap-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              Nova Despesa
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className={`rounded-xl border-2 px-4 py-2 flex items-center gap-2 font-medium ${
              showFilters ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtros
            {hasActiveFilters && (
              <span className="bg-blue-500 text-white rounded-full w-2 h-2 ml-1"></span>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setShowExport(!showExport)}
            className={`rounded-xl border-2 px-4 py-2 flex items-center gap-2 font-medium ${
              showExport ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Download className="w-4 h-4" />
            Exportar
          </Button>
          
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              onClick={onClearFilters}
              className="rounded-xl text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-4 py-2 flex items-center gap-2 font-medium"
            >
              <X className="w-4 h-4" />
              Limpar Filtros
            </Button>
          )}
        </div>

        {/* Filtros expansíveis */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <DespesasFilter 
              onFilterChange={onFilterChange} 
              onClearFilters={onClearFilters}
            />
          </div>
        )}

        {/* Exportação expansível */}
        {showExport && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <DespesasExport transactions={filteredTransactions} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DespesasActions;
