
import React, { useState } from 'react';
import { Filter, X, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { prettyLabel } from '@/utils/labelUtils';

interface ReceitasFilterProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterEmpresa: string;
  setFilterEmpresa: (value: string) => void;
  filterCategoria: string;
  setFilterCategoria: (value: string) => void;
  dateFrom?: string;
  setDateFrom?: (value: string) => void;
  dateTo?: string;
  setDateTo?: (value: string) => void;
}

const ReceitasFilter: React.FC<ReceitasFilterProps> = ({
  searchTerm,
  setSearchTerm,
  filterEmpresa,
  setFilterEmpresa,
  filterCategoria,
  setFilterCategoria,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo
}) => {
  const hasActiveFilters = searchTerm !== '' || 
    filterEmpresa !== 'all' || 
    filterCategoria !== 'all' ||
    (dateFrom && dateFrom !== '') ||
    (dateTo && dateTo !== '');

  const clearFilters = () => {
    setSearchTerm('');
    setFilterEmpresa('all');
    setFilterCategoria('all');
    if (setDateFrom) setDateFrom('');
    if (setDateTo) setDateTo('');
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl rounded-2xl mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-gray-600" />
            <CardTitle className="text-xl text-gray-800">Filtros</CardTitle>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-700 rounded-full h-8 px-3"
            >
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[280px]">
            <Input
              placeholder="Buscar por descrição ou empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-xl h-9"
            />
          </div>
          <div className="min-w-[140px]">
            <Select value={filterEmpresa} onValueChange={setFilterEmpresa}>
              <SelectTrigger className="rounded-xl h-9 text-sm">
                <SelectValue placeholder="Empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as empresas</SelectItem>
                <SelectItem value="Churrasco">Companhia do Churrasco</SelectItem>
                <SelectItem value="Johnny">Johnny Rockets</SelectItem>
                <SelectItem value="Camerino">Camerino</SelectItem>
                <SelectItem value="Implementação">Implementação</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[130px]">
            <Select value={filterCategoria} onValueChange={setFilterCategoria}>
              <SelectTrigger className="rounded-xl h-9 text-sm">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                <SelectItem value="VENDAS">{prettyLabel('VENDAS')}</SelectItem>
                <SelectItem value="VENDAS_DIARIAS">{prettyLabel('VENDAS_DIARIAS')}</SelectItem>
                <SelectItem value="OUTROS">{prettyLabel('OUTROS')}</SelectItem>
                <SelectItem value="EM_COFRE">{prettyLabel('EM_COFRE')}</SelectItem>
                <SelectItem value="EM_CONTA">{prettyLabel('EM_CONTA')}</SelectItem>
                <SelectItem value="PAGAMENTO_DESPESA">Pagamento de Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Filtros de Data */}
          {setDateFrom && setDateTo && (
            <>
              <div className="min-w-[130px]">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <Input
                    type="date"
                    placeholder="Data inicial"
                    value={dateFrom || ''}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="rounded-xl pl-8 h-9 text-sm"
                  />
                </div>
              </div>
              <div className="min-w-[130px]">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <Input
                    type="date"
                    placeholder="Data final"
                    value={dateTo || ''}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="rounded-xl pl-8 h-9 text-sm"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReceitasFilter;
