
import React from 'react';
import RecentTransactions from '../RecentTransactions';
import { Card } from '@/components/ui/card';
import { Despesa } from '@/hooks/useDespesas';

interface DashboardTransactionsProps {
  despesas: Despesa[];
}

const DashboardTransactions: React.FC<DashboardTransactionsProps> = ({ despesas }) => {
  // Filtrar despesas para excluir Camerino
  const despesasSemCamerino = despesas.filter(despesa => {
    const empresa = despesa.empresa?.toLowerCase().trim() || '';
    return !empresa.includes('camerino');
  });

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Últimas Transações</h3>
      </div>
      {despesasSemCamerino && despesasSemCamerino.length > 0 ? (
        <RecentTransactions despesas={despesasSemCamerino} />
      ) : (
        <Card className="p-6 text-center text-gray-600">
          <p>Não há transações recentes para mostrar.</p>
          <p className="text-sm mt-2">Adicione transações para ver os dados aqui.</p>
        </Card>
      )}
    </div>
  );
};

export default DashboardTransactions;
