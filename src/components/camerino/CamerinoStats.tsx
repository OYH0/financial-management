import React, { useState } from 'react';
import { TrendingUp, DollarSign, BarChart3, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TransactionsModal from '@/components/TransactionsModal';

interface CamerinoStatsProps {
  despesas: any[];
  receitas: any[];
  selectedPeriod: 'today' | 'week' | 'month' | 'year' | 'custom';
  allDespesas?: any[];
  allReceitas?: any[];
}

const CamerinoStats: React.FC<CamerinoStatsProps> = ({ despesas, receitas, selectedPeriod, allDespesas = [], allReceitas = [] }) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'receitas' | 'despesas';
    title: string;
  }>({
    isOpen: false,
    type: 'receitas',
    title: ''
  });

  // Filtrar receitas para excluir valores que não são vendas reais
  const receitasVendas = receitas.filter(r => 
    r.categoria !== 'EM_COFRE' && 
    r.categoria !== 'EM_CONTA' && 
    !r.descricao?.toUpperCase().includes('PAGAMENTO DE DESPESA') &&
    ((r as any).destino === 'total' || !(r as any).destino) // Excluir receitas de conta/cofre
  );
  
  // Usar dados filtrados por período para todos os cálculos
  const totalDespesas = despesas.reduce((sum, d) => sum + (d.valor_total || d.valor), 0);
  const totalReceitas = receitasVendas.reduce((sum, r) => sum + r.valor, 0);
  const lucroLiquido = totalReceitas - totalDespesas;
  const margemLucro = totalReceitas > 0 ? (lucroLiquido / totalReceitas) * 100 : 0;

  const openModal = (type: 'receitas' | 'despesas', title: string) => {
    setModalState({ isOpen: true, type, title });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, type: 'receitas', title: '' });
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Receita Total</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-3xl font-bold text-green-600 mb-2">
              R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {selectedPeriod === 'month' ? 'Este mês' : 'Período selecionado'}
              </p>
              <Button size="sm" variant="outline" onClick={() => openModal('receitas', 'Receitas')} className="h-6 px-2 text-xs">
                <Eye className="h-3 w-3 mr-1" />Ver
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Despesas Totais</CardTitle>
            <DollarSign className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-3xl font-bold text-red-600 mb-2">
              R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {selectedPeriod === 'month' ? 'Este mês' : 'Período selecionado'}
              </p>
              <Button size="sm" variant="outline" onClick={() => openModal('despesas', 'Despesas')} className="h-6 px-2 text-xs">
                <Eye className="h-3 w-3 mr-1" />Ver
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Lucro Líquido</CardTitle>
            <BarChart3 className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-xl lg:text-3xl font-bold ${lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-500 mt-1">{margemLucro.toFixed(1)}% margem</p>
          </CardContent>
        </Card>
      </div>

      <TransactionsModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        type={modalState.type}
        transactions={modalState.type === 'receitas' ? receitasVendas : despesas}
        empresa="Camerino"
        title={modalState.title}
      />
    </>
  );
};

export default CamerinoStats;