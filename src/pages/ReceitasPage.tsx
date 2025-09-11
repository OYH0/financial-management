
import React, { useState, useMemo } from 'react';
import { Plus, TrendingUp, DollarSign, Calendar, Shield, Wallet, Clock } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AddReceitaModal from '@/components/AddReceitaModal';
import ReceitaTable from '@/components/ReceitaTable';
import TransactionHistoryModal from '@/components/TransactionHistoryModal';
import ReceitasFilter from '@/components/ReceitasFilter';
import CamerinoPasswordProtection from '@/components/CamerinoPasswordProtection';
import { useReceitas } from '@/hooks/useReceitas';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { useCamerinoAuth } from '@/hooks/useCamerinoAuth';
import { filterReceitasCurrentMonth } from '@/utils/currentMonthFilter';

const ReceitasPage = () => {
  // Force recompilation to clear cached references
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEmpresa, setFilterEmpresa] = useState('all');
  const [filterCategoria, setFilterCategoria] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const { data: receitas, stats, isLoading } = useReceitas();
  const { isAdmin } = useAdminAccess();
  const { isAuthenticated, authenticate } = useCamerinoAuth();

  // Verificar se precisa autenticar para Camerino
  const needsCamerinoAuth = filterEmpresa === 'Camerino' && !isAuthenticated;

  // Aplicar filtro do mês atual - excluir Camerino apenas quando não há filtro de empresa específico
  const shouldExcludeCamerino = filterEmpresa === 'all';
  const currentMonthReceitas = useMemo(() => {
    console.log('=== DEBUG FILTRO RECEITAS ===');
    console.log('Filtro empresa:', filterEmpresa);
    console.log('Deve excluir Camerino?', shouldExcludeCamerino);
    
    return filterReceitasCurrentMonth(receitas || [], dateFrom, dateTo, shouldExcludeCamerino);
  }, [receitas, dateFrom, dateTo, shouldExcludeCamerino]);

  // Filtrar receitas com base nos outros filtros
  const filteredReceitas = useMemo(() => {
    return currentMonthReceitas.filter(receita => {
      const matchesSearch = receita.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           receita.empresa.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEmpresa = filterEmpresa === 'all' || receita.empresa === filterEmpresa;
      const matchesCategoria = filterCategoria === 'all' || receita.categoria === filterCategoria;
      
      return matchesSearch && matchesEmpresa && matchesCategoria;
    });
  }, [currentMonthReceitas, searchTerm, filterEmpresa, filterCategoria]);

  // Calcular estatísticas baseadas nas receitas exibidas (excluindo apenas pagamentos de despesas e receitas de conta/cofre dos totais)
  const receitasParaEstatisticas = filteredReceitas.filter(r => 
    r.descricao !== 'PAGAMENTO DE DESPESA' &&
    ((r as any).destino === 'total' || !(r as any).destino) // Excluir receitas de conta/cofre apenas dos cálculos
  );
  
  // Calcular totais apenas das receitas de vendas (para estatísticas)
  const receitasVendas = receitasParaEstatisticas.filter(r => 
    r.categoria !== 'EM_COFRE' && 
    r.categoria !== 'EM_CONTA'
  );
  
  const totalReceitas = receitasVendas.reduce((sum, receita) => sum + receita.valor, 0);
  

  // Handle filter empresa change with Camerino auth check
  const handleFilterEmpresaChange = (value: string) => {
    setFilterEmpresa(value);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-100">
        <Sidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <p className="text-lg text-gray-600">Carregando receitas...</p>
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
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-100">
      <Sidebar />
      
      <div className="flex-1 lg:ml-64 transition-all duration-300 p-4 lg:p-8">
        <div className="w-full">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 lg:p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg">
                <TrendingUp className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                  Receitas
                </h1>
                <p className="text-gray-600 text-sm lg:text-lg">Gerencie todas as receitas do negócio</p>
              </div>
            </div>
            
            {isAdmin ? (
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg transform hover:scale-105 transition-all duration-200 rounded-2xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Receita
              </Button>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-blue-800 font-medium">Modo Visualização</p>
                    <p className="text-blue-600 text-sm">Apenas administradores podem adicionar novas receitas.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Filters */}
          <ReceitasFilter
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterEmpresa={filterEmpresa}
            setFilterEmpresa={handleFilterEmpresaChange}
            filterCategoria={filterCategoria}
            setFilterCategoria={setFilterCategoria}
            dateFrom={dateFrom}
            setDateFrom={setDateFrom}
            dateTo={dateTo}
            setDateTo={setDateTo}
          />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 lg:gap-6 mb-8">
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total de Receitas</CardTitle>
                <div className="p-2 bg-gradient-to-r from-green-100 to-green-200 rounded-xl">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                  R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-gray-500 mt-1">{receitasVendas.length} receitas encontradas</p>
              </CardContent>
            </Card>


          </div>

          {/* Main Content Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl rounded-2xl">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-gray-800">Lista de Receitas</CardTitle>
                  <CardDescription className="text-gray-600">
                    {filteredReceitas.length} receita(s) encontrada(s) - Mês atual e recebimentos recentes
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
              <ReceitaTable receitas={filteredReceitas} />
            </CardContent>
          </Card>
        </div>
      </div>

      {isAdmin && (
        <AddReceitaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}

      <TransactionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        transactionId={0}
        transactionType="receita"
      />
    </div>
  );
};

export default ReceitasPage;
