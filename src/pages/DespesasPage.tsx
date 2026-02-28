
import React, { useState, useMemo } from 'react';
import { Plus, TrendingDown, DollarSign, CheckCircle, Clock, AlertTriangle, Shield, Download } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import TransactionTable from '@/components/TransactionTable';
import AddTransactionModal from '@/components/AddTransactionModal';
import TransactionHistoryModal from '@/components/TransactionHistoryModal';
import DespesasFilterSimple from '@/components/DespesasFilterSimple';
import DespesasStats from '@/components/DespesasStats';
import CamerinoPasswordProtection from '@/components/CamerinoPasswordProtection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDespesas, useDespesasAtrasadas } from '@/hooks/useDespesas';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { useCamerinoAuth } from '@/hooks/useCamerinoAuth';
import { Transaction } from '@/types/transaction';
import { getTransactionStatus } from '@/utils/transactionUtils';
import { filterDespesasCurrentMonth, parseDateFlexible } from '@/utils/currentMonthFilter';
import { exportDespesasToPDF } from '@/utils/dataExport';

const DespesasPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEmpresa, setFilterEmpresa] = useState('all');
  const [filterCategoria, setFilterCategoria] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  // Limpar filtros de data para mostrar todo o mês atual
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const hasCustomDateRange = !!(dateFrom || dateTo);
  const startDate = hasCustomDateRange && dateFrom ? new Date(`${dateFrom}T00:00:00`) : undefined;
  const endDate = hasCustomDateRange && dateTo ? new Date(`${dateTo}T23:59:59`) : undefined;

  // Usa o startDate para determinar os atrasos anteriores. Se startDate for indefinido, usa o início do mês atual.
  const now = new Date();
  const atrasadasDateRef = startDate || new Date(now.getFullYear(), now.getMonth(), 1);

  const { data: despesas = [], isLoading, refetch } = useDespesas({
    mode: 'month',
    useCustomDateRange: hasCustomDateRange,
    start: startDate,
    end: endDate
  });

  const { data: despesasAtrasadasBruto = [], refetch: refetchAtrasadas } = useDespesasAtrasadas(atrasadasDateRef);

  const { user } = useAuth();
  const { isAdmin } = useAdminAccess();
  const { isAuthenticated, authenticate } = useCamerinoAuth();

  // Removido useEffect que causava recarregamento ao selecionar datas

  // Verificar se precisa autenticar para Camerino
  const needsCamerinoAuth = filterEmpresa === 'Camerino' && !isAuthenticated;

  // Converter Despesa para Transaction
  const allTransactions: Transaction[] = despesas.map(despesa => ({
    id: despesa.id,
    date: despesa.data,
    valor: despesa.valor,
    company: despesa.empresa || 'Não informado',
    description: despesa.descricao || 'Sem descrição',
    category: despesa.categoria || 'Sem categoria',
    subcategoria: despesa.subcategoria,
    detalhe_subcategoria: despesa.detalhe_subcategoria,
    data_vencimento: despesa.data_vencimento,
    comprovante: despesa.comprovante,
    status: despesa.status || null,
    user_id: despesa.user_id,
    valor_juros: despesa.valor_juros || 0,
    valor_total: despesa.valor_total || despesa.valor,
    origem_pagamento: despesa.origem_pagamento
  }));

  // Aplicar filtro baseado nas datas selecionadas
  const currentMonthTransactions = useMemo(() => {
    // Se há filtros de data específicos, aplicar apenas esses filtros
    if (dateFrom || dateTo) {
      const filtered = allTransactions.filter(transaction => {
        const transactionDateStr = transaction.data_vencimento || transaction.date;
        if (!transactionDateStr) return false;

        const itemDate = new Date(transactionDateStr + 'T00:00:00');
        const fromDate = dateFrom ? new Date(dateFrom + 'T00:00:00') : null;
        const toDate = dateTo ? new Date(dateTo + 'T23:59:59') : null;

        if (fromDate && itemDate < fromDate) return false;
        if (toDate && itemDate > toDate) return false;
        return true;
      });

      return filtered;
    }

    // Caso contrário, usar o filtro do mês atual (excluindo Camerino apenas se não houver filtro de empresa)
    const shouldExcludeCamerino = filterEmpresa === 'all';
    return filterDespesasCurrentMonth(allTransactions, dateFrom, dateTo, shouldExcludeCamerino);
  }, [allTransactions, dateFrom, dateTo, filterEmpresa]);

  // Filtrar despesas com base nos outros filtros
  const filteredTransactions = useMemo(() => {
    return currentMonthTransactions.filter(transaction => {
      const status = getTransactionStatus(transaction);

      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.company.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro de empresa com suporte a dados legados
      let matchesEmpresa = filterEmpresa === 'all';
      if (!matchesEmpresa) {
        if (filterEmpresa === 'Companhia do Churrasco Cariri') {
          // Incluir tanto "Companhia do Churrasco Cariri" quanto "Companhia do Churrasco" (dados legados)
          matchesEmpresa = transaction.company === 'Companhia do Churrasco Cariri' ||
            transaction.company === 'Companhia do Churrasco';
        } else if (filterEmpresa === 'Companhia do Churrasco Fortaleza') {
          // Apenas "Companhia do Churrasco Fortaleza"
          matchesEmpresa = transaction.company === 'Companhia do Churrasco Fortaleza';
        } else {
          matchesEmpresa = transaction.company === filterEmpresa;
        }
      }

      const matchesCategoria = filterCategoria === 'all' || transaction.category === filterCategoria;
      const matchesStatus = filterStatus === 'all' || status === filterStatus;

      return matchesSearch && matchesEmpresa && matchesCategoria && matchesStatus;
    });
  }, [currentMonthTransactions, searchTerm, filterEmpresa, filterCategoria, filterStatus]);

  // Lista de transacoes de meses passados atrasadas (mesmo filtro visual)
  const pastAtrasadasFiltered = useMemo(() => {
    // Converter despesas brutas passadas para formato Transaction
    const allPastTx: Transaction[] = despesasAtrasadasBruto.map(despesa => ({
      id: despesa.id,
      date: despesa.data,
      valor: despesa.valor,
      company: despesa.empresa || 'Não informado',
      description: despesa.descricao || 'Sem descrição',
      category: despesa.categoria || 'Sem categoria',
      subcategoria: despesa.subcategoria,
      detalhe_subcategoria: despesa.detalhe_subcategoria,
      data_vencimento: despesa.data_vencimento,
      comprovante: despesa.comprovante,
      status: despesa.status || null,
      user_id: despesa.user_id,
      valor_juros: despesa.valor_juros || 0,
      valor_total: despesa.valor_total || despesa.valor,
      origem_pagamento: despesa.origem_pagamento
    }));

    return allPastTx.filter(transaction => {
      // Filtros visuais repetidos para as atrasadas do passado
      const status = getTransactionStatus(transaction);
      if (status === 'PAGO') return false; // Nao exibir se for pago

      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.company.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesEmpresa = filterEmpresa === 'all';
      if (!matchesEmpresa) {
        if (filterEmpresa === 'Companhia do Churrasco Cariri') {
          matchesEmpresa = transaction.company === 'Companhia do Churrasco Cariri' ||
            transaction.company === 'Companhia do Churrasco';
        } else if (filterEmpresa === 'Companhia do Churrasco Fortaleza') {
          matchesEmpresa = transaction.company === 'Companhia do Churrasco Fortaleza';
        } else {
          matchesEmpresa = transaction.company === filterEmpresa;
        }
      }

      const matchesCategoria = filterCategoria === 'all' || transaction.category === filterCategoria;
      const matchesStatus = filterStatus === 'all' || status === filterStatus;

      return matchesSearch && matchesEmpresa && matchesCategoria && matchesStatus;
    });
  }, [despesasAtrasadasBruto, searchTerm, filterEmpresa, filterCategoria, filterStatus]);

  // Separar as despesas que são de meses passados mas foram pagas neste mês
  const pastExpensesPaidThisMonth = useMemo(() => {
    return filteredTransactions.filter(t => {
      const status = getTransactionStatus(t);
      if (status !== 'PAGO') return false;

      const vencimento = parseDateFlexible(t.data_vencimento);
      const pagamento = parseDateFlexible(t.date);

      let periodStart = atrasadasDateRef;
      if (dateFrom) {
        periodStart = new Date(dateFrom + 'T00:00:00');
      }

      if (vencimento && pagamento) {
        if (vencimento < periodStart && pagamento >= periodStart) {
          return true;
        }
      }
      return false;
    });
  }, [filteredTransactions, atrasadasDateRef, dateFrom]);

  // A lista principal deve excluir essas despesas para não duplicar visualmente
  const mainFilteredTransactions = useMemo(() => {
    return filteredTransactions.filter(t => !pastExpensesPaidThisMonth.includes(t));
  }, [filteredTransactions, pastExpensesPaidThisMonth]);

  // Calcular estatísticas usando valor_total
  const totalDespesas = filteredTransactions.reduce((sum, transaction) => sum + (transaction.valor_total || transaction.valor), 0);
  const totalJuros = filteredTransactions.reduce((sum, transaction) => sum + (transaction.valor_juros || 0), 0);
  const despesasPagas = filteredTransactions.filter(t => getTransactionStatus(t) === 'PAGO');
  const despesasPendentes = filteredTransactions.filter(t => getTransactionStatus(t) === 'PENDENTE');
  const despesasAtrasadas = filteredTransactions.filter(t => getTransactionStatus(t) === 'ATRASADO');

  const valorPago = despesasPagas.reduce((sum, t) => sum + (t.valor_total || t.valor), 0);
  const valorPendente = despesasPendentes.reduce((sum, t) => sum + (t.valor_total || t.valor), 0);
  const valorAtrasado = despesasAtrasadas.reduce((sum, t) => sum + (t.valor_total || t.valor), 0);

  const handleTransactionAdded = () => {
    refetch();
    refetchAtrasadas();
    setIsModalOpen(false);
  };

  const handleTransactionUpdated = () => {
    refetch();
    refetchAtrasadas();
  };

  const handleExportPDF = () => {
    const filters = [
      filterEmpresa !== 'all' ? `Empresa: ${filterEmpresa}` : '',
      filterCategoria !== 'all' ? `Categoria: ${filterCategoria}` : '',
      filterStatus !== 'all' ? `Status: ${filterStatus}` : '',
      dateFrom ? `De: ${new Date(dateFrom).toLocaleDateString('pt-BR')}` : '',
      dateTo ? `Até: ${new Date(dateTo).toLocaleDateString('pt-BR')}` : '',
    ].filter(Boolean).join(' | ');

    exportDespesasToPDF(filteredTransactions, filters);
  };

  // Handle filter empresa change with Camerino auth check
  const handleFilterEmpresaChange = (value: string) => {
    setFilterEmpresa(value);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-red-100">
        <Sidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <p className="text-lg text-gray-600">Carregando despesas...</p>
        </div>
      </div>
    );
  }

  // Se precisar autenticar para Camerino, mostrar tela de senha
  if (needsCamerinoAuth) {
    return (
      <CamerinoPasswordProtection onPasswordCorrect={authenticate} />
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-red-100">
      <Sidebar />

      <div className="flex-1 lg:ml-64 transition-all duration-300 p-4 lg:p-6">
        <div className="w-full">
          {/* Header Section */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 lg:p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl shadow-lg">
                <TrendingDown className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                  Despesas
                </h1>
                <p className="text-gray-600 text-xs lg:text-sm">Gerencie todas as despesas do negócio</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleExportPDF}
                variant="outline"
                className="bg-white border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 shadow-sm rounded-2xl"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>

              {isAdmin ? (
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg transform hover:scale-105 transition-all duration-200 rounded-2xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Despesa
                </Button>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-blue-800 font-medium">Modo Visualização</p>
                      <p className="text-blue-600 text-sm">Apenas administradores podem adicionar novas despesas.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Filters */}
          <DespesasFilterSimple
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterEmpresa={filterEmpresa}
            setFilterEmpresa={handleFilterEmpresaChange}
            filterCategoria={filterCategoria}
            setFilterCategoria={setFilterCategoria}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            dateFrom={dateFrom}
            setDateFrom={setDateFrom}
            dateTo={dateTo}
            setDateTo={setDateTo}
          />

          {/* Stats Cards */}
          <DespesasStats
            totalDespesas={totalDespesas}
            totalJuros={totalJuros}
            valorPago={valorPago}
            valorPendente={valorPendente}
            valorAtrasado={valorAtrasado}
            despesasPagasCount={despesasPagas.length}
            despesasPendentesCount={despesasPendentes.length}
            despesasAtrasadasCount={despesasAtrasadas.length}
            filteredTransactionsCount={filteredTransactions.length}
          />

          {pastAtrasadasFiltered.length > 0 && (
            <Card className="mb-8 bg-white/80 backdrop-blur-sm border border-red-200 shadow-xl rounded-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
              <CardHeader className="border-b border-red-100 bg-red-50/50">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div>
                    <CardTitle className="text-xl text-red-800">Despesas Atrasadas de Meses Anteriores</CardTitle>
                    <CardDescription className="text-red-600/80 font-medium">
                      {pastAtrasadasFiltered.length} conta(s) encontrada(s) pendente(s) de antes de {atrasadasDateRef.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <TransactionTable
                  transactions={pastAtrasadasFiltered}
                  onTransactionUpdated={handleTransactionUpdated}
                />
              </CardContent>
            </Card>
          )}

          {/* Past Expenses Paid THIS Month Section */}
          {pastExpensesPaidThisMonth.length > 0 && (
            <Card className="mb-8 bg-white/80 backdrop-blur-sm border border-blue-200 shadow-xl rounded-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <CardHeader className="border-b border-blue-100 bg-blue-50/50">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                  <div>
                    <CardTitle className="text-xl text-blue-800">Despesas de Meses Passados (Pagas Neste Mês)</CardTitle>
                    <CardDescription className="text-blue-600/80 font-medium">
                      {pastExpensesPaidThisMonth.length} conta(s) que venceram no passado, mas foram pagas no período atual
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <TransactionTable
                  transactions={pastExpensesPaidThisMonth}
                  onTransactionUpdated={handleTransactionUpdated}
                />
              </CardContent>
            </Card>
          )}

          {/* Main Content Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl rounded-2xl">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-gray-800">Lista de Despesas do Período</CardTitle>
                  <CardDescription className="text-gray-600">
                    {mainFilteredTransactions.length} despesa(s) gerada(s) ou vencendo neste período
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsHistoryModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Histórico
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <TransactionTable
                transactions={mainFilteredTransactions}
                onTransactionUpdated={handleTransactionUpdated}
              />
            </CardContent>
          </Card>



        </div>
      </div>

      {isAdmin && (
        <AddTransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onTransactionAdded={handleTransactionAdded}
        />
      )}

      <TransactionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        transactionId={0}
        transactionType="despesa"
      />
    </div>
  );
};

export default DespesasPage;
