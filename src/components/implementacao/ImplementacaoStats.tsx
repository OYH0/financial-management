import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, DollarSign, AlertCircle, Eye, History } from 'lucide-react';
import TransactionsModal from '@/components/TransactionsModal';
import { calcularSaldoMesAnterior } from '@/utils/saldoMesAnterior';

interface ImplementacaoStatsProps {
  despesas: any[];
  receitas: any[];
  allDespesas?: any[];
  allReceitas?: any[];
}

const ImplementacaoStats: React.FC<ImplementacaoStatsProps> = ({ despesas, receitas, allDespesas = [], allReceitas = [] }) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'receitas' | 'despesas';
    title: string;
  }>({
    isOpen: false,
    type: 'receitas',
    title: ''
  });

  const despesasPagas = despesas.filter(d => d.status === 'PAGO');

  const { saldoMesAnterior, saldoRestante, despesasEfetivas, receitasVendas: totalReceitas } = calcularSaldoMesAnterior(receitas, despesasPagas);

  const receitasVendas = receitas.filter(r =>
    r.categoria !== 'SALDO_MES_ANTERIOR' &&
    r.categoria !== 'EM_COFRE' &&
    r.categoria !== 'EM_CONTA' &&
    !r.descricao?.toUpperCase().includes('PAGAMENTO DE DESPESA') &&
    ((r as any).destino === 'total' || !(r as any).destino)
  );

  const totalDespesas = despesas.reduce((sum, despesa) => sum + (despesa.valor_total || despesa.valor || 0), 0);
  const valorRestante = totalReceitas - despesasEfetivas;
  const despesasPendentes = despesas.filter(d => d.status === 'Pendente').length;

  const openModal = (type: 'receitas' | 'despesas', title: string) => {
    setModalState({ isOpen: true, type, title });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, type: 'receitas', title: '' });
  };

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-6 mb-8">
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Receitas</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-3xl font-bold text-green-600 mb-2">
              R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">{receitasVendas.length} vendas encontradas</p>
              <Button size="sm" variant="outline" onClick={() => openModal('receitas', 'Receitas')} className="h-6 px-2 text-xs">
                <Eye className="h-3 w-3 mr-1" />Ver
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl rounded-2xl border-amber-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Saldo Mês Anterior</CardTitle>
            <History className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-3xl font-bold text-amber-600 mb-1">
              R$ {saldoRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            {saldoMesAnterior > 0 && saldoMesAnterior !== saldoRestante && (
              <p className="text-xs text-gray-500">
                Inicial: R$ {saldoMesAnterior.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {saldoRestante > 0
                ? `R$ ${Math.min(saldoMesAnterior, totalDespesas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} abatido`
                : saldoMesAnterior > 0 ? 'Totalmente consumido' : 'Sem saldo'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Despesas Efetivas</CardTitle>
            <DollarSign className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-3xl font-bold text-red-600 mb-2">
              R$ {despesasEfetivas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {totalDespesas !== despesasEfetivas
                  ? `Total: R$ ${totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                  : `${despesas.length} despesas`}
              </p>
              <Button size="sm" variant="outline" onClick={() => openModal('despesas', 'Despesas')} className="h-6 px-2 text-xs">
                <Eye className="h-3 w-3 mr-1" />Ver
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Despesas Pagas</CardTitle>
            <DollarSign className="h-5 w-5 text-red-700" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-3xl font-bold text-red-700 mb-2">
              R$ {despesasPagas.reduce((sum, d) => sum + (d.valor_total || d.valor), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {despesasPagas.length} despesas pagas
              </p>
              <Button size="sm" variant="outline" onClick={() => openModal('despesas', 'Despesas Pagas')} className="h-6 px-2 text-xs">
                <Eye className="h-3 w-3 mr-1" />Ver
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Valor Restante</CardTitle>
            <div className={`p-2 bg-gradient-to-r rounded-xl ${valorRestante >= 0
                ? 'from-purple-100 to-purple-200'
                : 'from-red-100 to-red-200'
              }`}>
              <DollarSign className={`h-4 w-4 ${valorRestante >= 0 ? 'text-purple-600' : 'text-red-600'
                }`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-xl lg:text-3xl font-bold ${valorRestante >= 0
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent'
              }`}>
              R$ {Math.abs(valorRestante).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className={`text-xs mt-1 ${valorRestante >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
              {valorRestante >= 0 ? 'Lucro' : 'Prejuízo'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Despesas Pendentes</CardTitle>
            <div className="p-2 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-xl">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-3xl font-bold text-gray-800">{despesasPendentes}</div>
            <p className="text-xs text-gray-500 mt-1">Aguardando pagamento</p>
          </CardContent>
        </Card>
      </div>

      <TransactionsModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        type={modalState.type}
        transactions={modalState.type === 'receitas' ? receitasVendas : (modalState.title === 'Despesas Pagas' ? despesasPagas : despesas)}
        empresa="Implementação"
        title={modalState.title}
      />
    </>
  );
};

export default ImplementacaoStats;
