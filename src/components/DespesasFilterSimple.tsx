
import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface DespesasFilterSimpleProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterEmpresa: string;
  setFilterEmpresa: (value: string) => void;
  filterCategoria: string;
  setFilterCategoria: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  dateFrom: string;
  setDateFrom: (value: string) => void;
  dateTo: string;
  setDateTo: (value: string) => void;
}

const DespesasFilterSimple: React.FC<DespesasFilterSimpleProps> = ({
  searchTerm,
  setSearchTerm,
  filterEmpresa,
  setFilterEmpresa,
  filterCategoria,
  setFilterCategoria,
  filterStatus,
  setFilterStatus,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo
}) => {
  const clearFilters = () => {
    setSearchTerm('');
    setFilterEmpresa('all');
    setFilterCategoria('all');
    setFilterStatus('all');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = searchTerm || filterEmpresa !== 'all' || filterCategoria !== 'all' ||
    filterStatus !== 'all' || dateFrom || dateTo;

  return (
    <div className="bg-white/90 backdrop-blur-xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-5 mb-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-50 rounded-xl">
            <Filter className="h-4 w-4 text-gray-600" />
          </div>
          <h3 className="text-base font-semibold text-gray-800">Filtros de Busca</h3>
        </div>
        <div className="flex gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl text-xs transition-colors"
            >
              <X className="h-4 w-4 mr-1" />
              Limpar Filtros
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Search */}
        <div className="relative group lg:col-span-2">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
            <Search className="h-4 w-4" />
          </div>
          <Input
            placeholder="Buscar despesas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 rounded-2xl bg-gray-50/50 border-gray-200 hover:bg-white focus:bg-white transition-all shadow-sm"
          />
        </div>

        {/* Empresa */}
        <div className="lg:col-span-1">
          <Select value={filterEmpresa} onValueChange={setFilterEmpresa}>
            <SelectTrigger className="h-11 rounded-2xl bg-gray-50/50 border-gray-200 hover:bg-white transition-all shadow-sm">
              <SelectValue placeholder="Empresa" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl shadow-xl border-gray-100">
              <SelectItem value="all" className="rounded-xl">Todas Empresas</SelectItem>
              <SelectItem value="Companhia do Churrasco Cariri" className="rounded-xl">Churrasco - Cariri</SelectItem>
              <SelectItem value="Companhia do Churrasco Fortaleza" className="rounded-xl">Churrasco - Fortaleza</SelectItem>
              <SelectItem value="Johnny" className="rounded-xl">Johnny</SelectItem>
              <SelectItem value="Camerino" className="rounded-xl">Camerino</SelectItem>
              <SelectItem value="Implementação" className="rounded-xl">Implementação</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Categoria */}
        <div className="lg:col-span-1">
          <Select value={filterCategoria} onValueChange={setFilterCategoria}>
            <SelectTrigger className="h-11 rounded-2xl bg-gray-50/50 border-gray-200 hover:bg-white transition-all shadow-sm">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl shadow-xl border-gray-100">
              <SelectItem value="all" className="rounded-xl">Todas Categorias</SelectItem>
              <SelectItem value="INSUMOS" className="rounded-xl">Insumos</SelectItem>
              <SelectItem value="FIXAS" className="rounded-xl">Fixas</SelectItem>
              <SelectItem value="VARIÁVEIS" className="rounded-xl">Variáveis</SelectItem>
              <SelectItem value="RETIRADAS" className="rounded-xl">Retiradas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="lg:col-span-1">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-11 rounded-2xl bg-gray-50/50 border-gray-200 hover:bg-white transition-all shadow-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl shadow-xl border-gray-100">
              <SelectItem value="all" className="rounded-xl">Todos Status</SelectItem>
              <SelectItem value="PAGO" className="rounded-xl">Pago</SelectItem>
              <SelectItem value="PENDENTE" className="rounded-xl">Pendente</SelectItem>
              <SelectItem value="ATRASADO" className="rounded-xl">Atrasado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Datas ( agrupadas ) */}
        <div className="lg:col-span-1 flex flex-col sm:flex-row gap-2">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-11 rounded-2xl bg-gray-50/50 border-gray-200 hover:bg-white focus:bg-white transition-all shadow-sm flex-1 text-sm"
            placeholder="De"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-11 rounded-2xl bg-gray-50/50 border-gray-200 hover:bg-white focus:bg-white transition-all shadow-sm flex-1 text-sm"
            placeholder="Até"
          />
        </div>
      </div>
    </div>
  );
};

export default DespesasFilterSimple;
