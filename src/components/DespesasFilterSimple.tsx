
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

  const clearDateFilters = () => {
    console.log('=== FORÇANDO LIMPEZA DOS FILTROS DE DATA ===');
    console.log('dateFrom atual:', dateFrom);
    console.log('dateTo atual:', dateTo);
    setDateFrom('');
    setDateTo('');
    console.log('Filtros de data FORÇADAMENTE limpos');
  };

  const hasActiveFilters = searchTerm || filterEmpresa !== 'all' || filterCategoria !== 'all' || 
                          filterStatus !== 'all' || dateFrom || dateTo;
  
  const hasDateFilters = dateFrom || dateTo;

  // Limpar filtros de data automaticamente quando o componente for montado
  React.useEffect(() => {
    if (dateFrom || dateTo) {
      console.log('🚨 FILTROS DE DATA ENCONTRADOS NA MONTAGEM - LIMPANDO:', { dateFrom, dateTo });
      clearDateFilters();
    }
  }, []);

  // Log dos filtros atuais
  React.useEffect(() => {
    if (dateFrom || dateTo) {
      console.log('⚠️ FILTROS DE DATA DETECTADOS:', { dateFrom, dateTo });
    }
  }, [dateFrom, dateTo]);

  return (
    <div className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl rounded-2xl p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Filter className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
        <div className="ml-auto flex gap-2">
          {hasDateFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearDateFilters}
              className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300 rounded-xl"
            >
              <X className="h-4 w-4 mr-1" />
              Mostrar Mês Completo
            </Button>
          )}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-700 rounded-xl"
            >
              <X className="h-4 w-4 mr-1" />
              Limpar Todos
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar despesas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl border-gray-200"
          />
        </div>

        {/* Empresa */}
        <Select value={filterEmpresa} onValueChange={setFilterEmpresa}>
          <SelectTrigger className="rounded-xl border-gray-200">
            <SelectValue placeholder="Empresa" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">Todas Empresas</SelectItem>
            <SelectItem value="Churrasco">Churrasco</SelectItem>
            <SelectItem value="Johnny">Johnny</SelectItem>
            <SelectItem value="Camerino">Camerino</SelectItem>
            <SelectItem value="Implementação">Implementação</SelectItem>
          </SelectContent>
        </Select>

        {/* Categoria */}
        <Select value={filterCategoria} onValueChange={setFilterCategoria}>
          <SelectTrigger className="rounded-xl border-gray-200">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">Todas Categorias</SelectItem>
            <SelectItem value="INSUMOS">Insumos</SelectItem>
            <SelectItem value="FIXAS">Fixas</SelectItem>
            <SelectItem value="VARIÁVEIS">Variáveis</SelectItem>
            <SelectItem value="RETIRADAS">Retiradas</SelectItem>
          </SelectContent>
        </Select>

        {/* Status */}
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="rounded-xl border-gray-200">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="PAGO">Pago</SelectItem>
            <SelectItem value="PENDENTE">Pendente</SelectItem>
            <SelectItem value="ATRASADO">Atrasado</SelectItem>
          </SelectContent>
        </Select>

        {/* Data De */}
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="rounded-xl border-gray-200"
          placeholder="Data de..."
        />

        {/* Data Até */}
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="rounded-xl border-gray-200"
          placeholder="Data até..."
        />
      </div>
    </div>
  );
};

export default DespesasFilterSimple;
