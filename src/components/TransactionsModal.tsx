import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Building2, Tag } from 'lucide-react';
import { formatCurrency } from '@/utils/formatUtils';
import { prettyLabel } from '@/utils/labelUtils';


interface TransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'receitas' | 'despesas';
  transactions: any[];
  empresa: string;
  title: string;
}

const TransactionsModal: React.FC<TransactionsModalProps> = ({ 
  isOpen, 
  onClose, 
  type, 
  transactions, 
  empresa, 
  title 
}) => {
  const formatDate = (date: string) => {
    if (!date) return 'Não informado';
    return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (transaction: any) => {
    if (type === 'despesas') {
      const hoje = new Date();
      const venc = transaction.data_vencimento ? new Date(transaction.data_vencimento + 'T00:00:00') : null;
      if (transaction.data) {
        return <Badge variant="default" className="bg-green-100 text-green-800">Pago</Badge>;
      }
      if (!transaction.data && venc && venc < hoje) {
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Atrasado</Badge>;
      }
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
    } else {
      if (transaction.data_recebimento) {
        return <Badge variant="default" className="bg-green-100 text-green-800">Recebido</Badge>;
      } else {
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      }
    }
  };

  const getValue = (transaction: any) => {
    if (type === 'despesas') {
      return transaction.valor_total || transaction.valor || 0;
    }
    return transaction.valor || 0;
  };

  const total = transactions.reduce((sum, t) => sum + getValue(t), 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {type === 'receitas' ? <DollarSign className="h-6 w-6 text-green-500" /> : <DollarSign className="h-6 w-6 text-red-500" />}
            {title} - {empresa}
          </DialogTitle>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{transactions.length} transações</span>
            <span>Total: {formatCurrency(total)}</span>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma transação encontrada para o período selecionado</p>
            </div>
          ) : (
            transactions.map((transaction, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {transaction.descricao || 'Sem descrição'}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {type === 'despesas' ? (
                            <span>Venc: {formatDate(transaction.data_vencimento)}</span>
                          ) : (
                            <span>Data: {formatDate(transaction.data)}</span>
                          )}
                        </div>
                        {transaction.categoria && (
                          <div className="flex items-center gap-1">
                            <Tag className="h-4 w-4" />
                            <span>{prettyLabel(transaction.categoria)}</span>
                          </div>
                        )}
                        {transaction.subcategoria && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400">•</span>
                            <span>{prettyLabel(transaction.subcategoria)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${type === 'receitas' ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(getValue(transaction))}
                      </div>
                      {getStatusBadge(transaction)}
                    </div>
                  </div>
                  
                  {type === 'despesas' && transaction.data && (
                    <div className="text-sm text-gray-600">
                      <span>Pago em: {formatDate(transaction.data)}</span>
                    </div>
                  )}
                  
                  {type === 'receitas' && transaction.data_recebimento && (
                    <div className="text-sm text-gray-600">
                      <span>Recebido em: {formatDate(transaction.data_recebimento)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionsModal;