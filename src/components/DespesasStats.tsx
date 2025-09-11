import React, { useMemo } from 'react';
import { DollarSign, CheckCircle, Clock, AlertTriangle, Wallet, Vault, Percent } from 'lucide-react';
import { useSaldos } from '@/hooks/useSaldos';
import { useReceitas } from '@/hooks/useReceitas';
import { Transaction } from '@/types/transaction';

interface DespesasStatsProps {
  totalDespesas: number;
  totalJuros: number;
  valorPago: number;
  valorPendente: number;
  valorAtrasado: number;
  despesasPagasCount: number;
  despesasPendentesCount: number;
  despesasAtrasadasCount: number;
  filteredTransactionsCount: number;
  filterEmpresa: string;
  dateFrom?: string;
  dateTo?: string;
  allTransactions: Transaction[];
}

const DespesasStats: React.FC<DespesasStatsProps> = ({
  totalDespesas,
  totalJuros,
  valorPago,
  valorPendente,
  valorAtrasado,
  despesasPagasCount,
  despesasPendentesCount,
  despesasAtrasadasCount,
  filteredTransactionsCount,
  filterEmpresa,
  dateFrom,
  dateTo,
  allTransactions // Adicionar as transações para calcular débitos
}) => {
  const { data: saldos, isLoading: saldosLoading } = useSaldos();
  const { data: receitas, isLoading: receitasLoading } = useReceitas();
  
  // Função para calcular totais seguindo a lógica fornecida pelo usuário
  const calcularTotais = useMemo(() => {
    // Verificações de segurança
    if (!receitas || !allTransactions) return { saldoConta: 0, saldoCofre: 0 };
    
    console.log('=== CALCULANDO SALDOS (Nova Lógica) ===');
    console.log('Empresa:', filterEmpresa);
    console.log('Período:', dateFrom, 'até', dateTo);
    
    // Função para verificar se a data está no período
    const isInPeriod = (date: string) => {
      try {
        if (dateFrom || dateTo) {
          const itemDate = new Date(date);
          const fromDate = dateFrom ? new Date(dateFrom) : null;
          const toDate = dateTo ? new Date(dateTo) : null;
          
          if (fromDate && itemDate < fromDate) return false;
          if (toDate && itemDate > toDate) return false;
          return true;
        } else {
          // Se não há filtro manual, usar mês atual
          const now = new Date();
          const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
          const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          const itemDate = new Date(date);
          
          return itemDate >= firstDay && itemDate <= lastDay;
        }
      } catch (error) {
        console.warn('Erro ao verificar período:', error);
        return false;
      }
    };
    
    // Filtrar receitas
    const filteredReceitas = receitas?.filter(receita => {
      try {
        if (!receita || !receita.data) return false;
        const matchEmpresa = filterEmpresa === 'all' || receita.empresa === filterEmpresa;
        return matchEmpresa && isInPeriod(receita.data);
      } catch (error) {
        console.warn('Erro ao filtrar receita:', error, receita);
        return false;
      }
    }) || [];
    
    // Filtrar despesas PAGAS
    const filteredDespesasPagas = allTransactions?.filter(despesa => {
      try {
        if (!despesa || !despesa.date || despesa.status !== 'PAGO') return false;
        const matchEmpresa = filterEmpresa === 'all' || despesa.company === filterEmpresa;
        return matchEmpresa && isInPeriod(despesa.date);
      } catch (error) {
        console.warn('Erro ao filtrar despesa:', error, despesa);
        return false;
      }
    }) || [];
    
    console.log('Receitas filtradas:', filteredReceitas.length);
    console.log('Despesas pagas filtradas:', filteredDespesasPagas.length);
    
    let totalCofre = 0;
    let totalConta = 0;

    // ✅ Adiciona receitas por destino
    filteredReceitas.forEach(r => {
      if (r.destino === "cofre") totalCofre += Number(r.valor || 0);
      if (r.destino === "conta") totalConta += Number(r.valor || 0);
    });

    // ✅ Subtrai despesas PAGAS por origem_pagamento
    filteredDespesasPagas.forEach(d => {
      const valor = Number(d.valor_total || d.valor || 0);
      if (d.origem_pagamento === "cofre") totalCofre -= valor;
      if (d.origem_pagamento === "conta") totalConta -= valor;
    });
    
    console.log('Total cofre (receitas - despesas):', totalCofre);
    console.log('Total conta (receitas - despesas):', totalConta);
    
    return { saldoConta: totalConta, saldoCofre: totalCofre };
  }, [receitas, allTransactions, filterEmpresa, dateFrom, dateTo]);

  const { saldoConta, saldoCofre } = calcularTotais;
  
  const isLoading = saldosLoading || receitasLoading;
  
  // Forçar recálculo sempre que os dados mudarem
  React.useEffect(() => {
    console.log('=== DEPS CHANGED - FORÇANDO RECÁLCULO ===');
    console.log('Saldos loading:', saldosLoading, 'Receitas loading:', receitasLoading);
    console.log('Número de receitas:', receitas?.length);
    console.log('Número de transações:', allTransactions?.length);
  }, [receitas, saldos, allTransactions, saldosLoading, receitasLoading]);

  return (
    <div className="mb-8 space-y-6">
      {/* Primeira linha: Stats principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-red-100 to-red-200 rounded-2xl">
              <DollarSign className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Total de Despesas</h3>
              <p className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-500">{filteredTransactionsCount} registros</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-orange-100 to-orange-200 rounded-2xl">
              <Percent className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Total em Juros</h3>
              <p className="text-2xl font-bold text-orange-600">
                R$ {totalJuros.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-500">Juros aplicados</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-green-100 to-green-200 rounded-2xl">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Pagas</h3>
              <p className="text-2xl font-bold text-green-600">
                R$ {valorPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-500">{despesasPagasCount} despesas</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-2xl">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Pendentes</h3>
              <p className="text-2xl font-bold text-yellow-600">
                R$ {valorPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-500">{despesasPendentesCount} despesas</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-red-100 to-red-200 rounded-2xl">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Atrasadas</h3>
              <p className="text-2xl font-bold text-red-600">
                R$ {valorAtrasado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-500">{despesasAtrasadasCount} despesas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Segunda linha: Saldos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-100 to-blue-200 rounded-2xl">
              <Wallet className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Total em Conta</h3>
              <p className="text-2xl font-bold text-blue-600">
                {isLoading ? 'Carregando...' : `R$ ${saldoConta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              </p>
              <p className="text-xs text-gray-500">Saldo atual</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-purple-100 to-purple-200 rounded-2xl">
              <Vault className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Total em Cofre</h3>
              <p className="text-2xl font-bold text-purple-600">
                {isLoading ? 'Carregando...' : `R$ ${saldoCofre.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              </p>
              <p className="text-xs text-gray-500">Saldo atual</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DespesasStats;