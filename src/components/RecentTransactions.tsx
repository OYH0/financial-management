
import React, { useMemo } from 'react';
import { getTransactionStatus, getCategoryColor, getStatusColor } from '@/utils/transactionUtils';
import { formatDate } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/formatUtils';

interface RecentTransactionsProps {
  despesas?: any[];
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ despesas }) => {
  
  // Memoize processed transactions for better performance
  const transactions = useMemo(() => {
    return despesas?.slice(0, 5).map(despesa => {
      // Create a complete transaction object for status calculation
      const transaction = {
        id: despesa.id,
        date: despesa.data,
        valor: despesa.valor,
        company: despesa.empresa,
        description: despesa.descricao,
        category: despesa.categoria,
        subcategoria: despesa.subcategoria,
        data_vencimento: despesa.data_vencimento,
        comprovante: despesa.comprovante,
        status: despesa.status,
        user_id: despesa.user_id,
        valor_juros: despesa.valor_juros,
        valor_total: despesa.valor_total,
      };

      return {
        id: despesa.id,
        date: despesa.data,
        company: despesa.empresa,
        description: despesa.descricao,
        category: despesa.categoria,
        value: despesa.valor,
        status: getTransactionStatus(transaction)
      };
    }) || [];
  }, [despesas]);

  const getCompanyColor = (company: string) => {
    const colors = {
      'Churrasco': 'bg-red-500 text-white',
      'Johnny': 'bg-blue-500 text-white',
      'Camerino': 'bg-purple-500 text-white',
      'default': 'bg-gray-500 text-white'
    };
    return colors[company as keyof typeof colors] || colors.default;
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Não há transações para exibir.</p>
        <p className="text-sm mt-2">Adicione transações para visualizá-las aqui.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-gray-500 text-sm">
            <th className="pb-4 font-medium">Data</th>
            <th className="pb-4 font-medium">Empresa</th>
            <th className="pb-4 font-medium">Descrição</th>
            <th className="pb-4 font-medium">Categoria</th>
            <th className="pb-4 font-medium">Valor</th>
            <th className="pb-4 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="border-t border-gray-200">
              <td className="py-3 text-gray-800 text-sm">
                {formatDate(transaction.date)}
              </td>
              <td className="py-3">
                <span className={`px-2 py-1 rounded-2xl text-xs ${getCompanyColor(transaction.company)}`}>
                  {transaction.company}
                </span>
              </td>
              <td className="py-3 text-gray-800 text-sm">{transaction.description}</td>
              <td className="py-3">
                <span className={`px-2 py-1 rounded-2xl text-xs ${getCategoryColor(transaction.category)}`}>
                  {transaction.category}
                </span>
              </td>
              <td className="py-3 text-gray-800 font-medium">
                {formatCurrency(transaction.value)}
              </td>
              <td className="py-3">
                <span className={`px-2 py-1 rounded-2xl text-xs ${getStatusColor(transaction.status)}`}>
                  {transaction.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default React.memo(RecentTransactions);
