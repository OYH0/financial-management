import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FilterOptions {
  empresa?: string;
  categoria?: string;
  dataInicio?: Date;
  dataFim?: Date;
  valorMin?: number;
  valorMax?: number;
  status?: string;
}

interface DespesasFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
}

const DespesasFilter: React.FC<DespesasFilterProps> = ({ onFilterChange, onClearFilters }) => {
  const [filters, setFilters] = useState<FilterOptions>({});

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const filterValue = value === 'all' ? undefined : value;
    const newFilters = { ...filters, [key]: filterValue };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    onClearFilters();
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Filtrar Despesas</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-gray-500 hover:text-gray-700 rounded-full h-8 px-3"
          >
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Empresa */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Empresa</label>
          <Select value={filters.empresa || 'all'} onValueChange={(value) => handleFilterChange('empresa', value)}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Todas as empresas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as empresas</SelectItem>
              <SelectItem value="Churrasco">Churrasco</SelectItem>
              <SelectItem value="Johnny">Johnny</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Categoria */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Categoria</label>
          <Select value={filters.categoria || 'all'} onValueChange={(value) => handleFilterChange('categoria', value)}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              <SelectItem value="INSUMOS">Insumos</SelectItem>
              <SelectItem value="FIXAS">Fixas</SelectItem>
              <SelectItem value="VARIÁVEIS">Variáveis</SelectItem>
              <SelectItem value="RETIRADAS">Retiradas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value)}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="PAGO">Pago</SelectItem>
              <SelectItem value="PENDENTE">Pendente</SelectItem>
              <SelectItem value="ATRASADO">Atrasado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Data Início */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Data Início</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-start text-left font-normal rounded-xl"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dataInicio ? format(filters.dataInicio, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecionar'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dataInicio}
                onSelect={(date) => handleFilterChange('dataInicio', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Data Fim */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Data Fim</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-start text-left font-normal rounded-xl"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dataFim ? format(filters.dataFim, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecionar'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dataFim}
                onSelect={(date) => handleFilterChange('dataFim', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Valor Mínimo */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Valor Mínimo (R$)</label>
          <Input
            type="number"
            placeholder="0,00"
            value={filters.valorMin || ''}
            onChange={(e) => handleFilterChange('valorMin', parseFloat(e.target.value) || undefined)}
            className="rounded-xl"
          />
        </div>

        {/* Valor Máximo */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Valor Máximo (R$)</label>
          <Input
            type="number"
            placeholder="0,00"
            value={filters.valorMax || ''}
            onChange={(e) => handleFilterChange('valorMax', parseFloat(e.target.value) || undefined)}
            className="rounded-xl"
          />
        </div>
      </div>

      {/* Resumo dos filtros ativos */}
      {hasActiveFilters && (
        <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm text-blue-800 font-medium">Filtros Ativos:</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {filters.empresa && (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs">
                Empresa: {filters.empresa}
              </span>
            )}
            {filters.categoria && (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs">
                Categoria: {filters.categoria}
              </span>
            )}
            {filters.status && (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs">
                Status: {filters.status}
              </span>
            )}
            {filters.dataInicio && (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs">
                De: {format(filters.dataInicio, 'dd/MM/yyyy', { locale: ptBR })}
              </span>
            )}
            {filters.dataFim && (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs">
                Até: {format(filters.dataFim, 'dd/MM/yyyy', { locale: ptBR })}
              </span>
            )}
            {filters.valorMin && (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs">
                Min: R$ {filters.valorMin.toFixed(2)}
              </span>
            )}
            {filters.valorMax && (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs">
                Max: R$ {filters.valorMax.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DespesasFilter;
