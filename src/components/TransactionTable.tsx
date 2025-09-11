
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction } from '@/types/transaction';
import EditTransactionModal from './EditTransactionModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ViewReceiptModal from './ViewReceiptModal';
import MarkAsPaidModal from './MarkAsPaidModal';
import DescriptionCell from './table/DescriptionCell';
import StatusCell from './table/StatusCell';
import CategoryCell from './table/CategoryCell';
import ActionsCell from './table/ActionsCell';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { useUpdateDespesa } from '@/hooks/useDespesas';

interface TransactionTableProps {
  transactions: Transaction[];
  onTransactionUpdated: () => void;
  type?: 'despesa' | 'receita';
}

const TransactionTable: React.FC<TransactionTableProps> = ({ 
  transactions, 
  onTransactionUpdated,
  type = 'despesa'
}) => {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<Transaction | null>(null);
  const [markingAsPaidTransaction, setMarkingAsPaidTransaction] = useState<Transaction | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Transaction | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });
  
  const { toast } = useToast();
  const { user } = useAuth();
  const { isAdmin } = useAdminAccess();
  const updateDespesa = useUpdateDespesa();

  // Função para formatar data corretamente
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  // Função para obter a data atual no formato correto (YYYY-MM-DD)
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleEdit = (transaction: Transaction) => {
    // Only allow editing if user is admin or owns the transaction
    if (isAdmin || transaction.user_id === user?.id) {
      setEditingTransaction(transaction);
    }
  };

  const handleDelete = (transaction: Transaction) => {
    // Only allow deletion if user is admin or owns the transaction
    if (isAdmin || transaction.user_id === user?.id) {
      setDeletingTransaction(transaction);
    }
  };

  const handleViewReceipt = (transaction: Transaction) => {
    setViewingReceipt(transaction);
  };

  const handleMarkAsPaidRequest = (transaction: Transaction) => {
    if (!user) return;
    
    // Only allow marking as paid if user is admin or owns the transaction
    if (!isAdmin && transaction.user_id !== user?.id) {
      toast({
        title: "Erro",
        description: "Você não tem permissão para alterar esta despesa.",
        variant: "destructive",
      });
      return;
    }

    setMarkingAsPaidTransaction(transaction);
  };

  const handleMarkAsPaidConfirm = async (transaction: Transaction, paymentSource: 'cofre' | 'conta') => {
    if (!user) return;

    try {
      const today = getCurrentDate();
      
      console.log('Marking transaction as paid:', transaction.id, 'Setting payment date to:', today);
      
      const updateData: any = {
        data: today, // Now this represents the payment date
        categoria: transaction.category === 'ATRASADOS' ? 'FIXAS' : transaction.category,
        status: 'PAGO',
        origem_pagamento: paymentSource // Save the payment source
      };

      // Usar o hook de atualização que já gerencia o saldo automaticamente
      const originalData = {
        id: transaction.id,
        data: transaction.date,
        valor: transaction.valor,
        empresa: transaction.company,
        descricao: transaction.description,
        categoria: transaction.category,
        subcategoria: transaction.subcategoria,
        data_vencimento: transaction.data_vencimento,
        comprovante: transaction.comprovante,
        status: transaction.status,
        user_id: transaction.user_id,
        valor_juros: transaction.valor_juros,
        valor_total: transaction.valor_total,
        origem_pagamento: transaction.origem_pagamento
      };

      await updateDespesa.mutateAsync({
        id: transaction.id,
        originalData,
        ...updateData
      });

      console.log('Transaction updated successfully');

      const formattedDate = new Date(today).toLocaleDateString('pt-BR');
      const sourceText = paymentSource === 'cofre' ? 'cofre' : 'conta';

      toast({
        title: "Sucesso",
        description: `Despesa marcada como paga em ${formattedDate} e valor deduzido do ${sourceText}!`,
      });

      setMarkingAsPaidTransaction(null);
      onTransactionUpdated();
    } catch (error) {
      console.error('Erro ao marcar como paga:', error);
      toast({
        title: "Erro",
        description: "Erro ao marcar despesa como paga.",
        variant: "destructive",
      });
    }
  };

  const handleAttachReceipt = async (transaction: Transaction) => {
    if (!user) return;
    
    // Only allow attaching receipt if user is admin or owns the transaction
    if (!isAdmin && transaction.user_id !== user?.id) {
      toast({
        title: "Erro",
        description: "Você não tem permissão para alterar esta despesa.",
        variant: "destructive",
      });
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${transaction.id}_${Date.now()}.${fileExt}`;
        
        console.log('Uploading file:', fileName);
        
        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        console.log('File uploaded successfully, updating database...');

        const { error: updateError } = await supabase
          .from('despesas')
          .update({ comprovante: fileName })
          .eq('id', transaction.id);

        if (updateError) {
          console.error('Database update error:', updateError);
          throw updateError;
        }

        toast({
          title: "Sucesso",
          description: "Comprovante anexado com sucesso!",
        });

        onTransactionUpdated();
      } catch (error) {
        console.error('Erro ao anexar comprovante:', error);
        toast({
          title: "Erro",
          description: error instanceof Error ? error.message : "Erro ao anexar comprovante.",
          variant: "destructive",
        });
      }
    };
    input.click();
  };



  // Sorting logic (useMemo must be after all other hooks)
  const handleSort = (key: keyof Transaction) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedTransactions = useMemo(() => {
    if (!sortConfig.key) return transactions;

    return [...transactions].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [transactions, sortConfig]);

  // EARLY RETURN AFTER ALL HOOKS ARE DECLARED
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhuma {type === 'receita' ? 'receita' : 'despesa'} encontrada.</p>
        <p className="text-sm mt-2">Adicione {type === 'receita' ? 'receitas' : 'despesas'} para visualizá-las aqui.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        {/* Versão desktop da tabela */}
        <div className="hidden lg:block">
          <div className="rounded-xl border bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('date')}>
                    Data
                    {sortConfig.key === 'date' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('description')}>
                    Descrição
                    {sortConfig.key === 'description' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('valor')}>
                    Valor
                    {sortConfig.key === 'valor' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {formatDate(transaction.date)}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-blue-500 text-white">
                        {transaction.company}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {transaction.description}
                    </TableCell>
                    <TableCell>
                      <CategoryCell category={transaction.category} />
                    </TableCell>
                    <TableCell className="font-medium">
                      R$ {transaction.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      {formatDate(transaction.data_vencimento || '')}
                    </TableCell>
                    <TableCell>
                      <StatusCell transaction={transaction} />
                    </TableCell>
                    <TableCell>
                      <ActionsCell
                        transaction={transaction}
                        onTransactionUpdated={onTransactionUpdated}
                        onMarkAsPaidRequest={handleMarkAsPaidRequest}
                        onAttachReceipt={handleAttachReceipt}
                        isAdmin={isAdmin}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Versão mobile - Cards */}
        <div className="lg:hidden space-y-6">
          {sortedTransactions.map((transaction) => (
            <div key={transaction.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 mb-1">
                    <DescriptionCell description={transaction.description} />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 rounded text-xs bg-blue-500 text-white">
                      {transaction.company}
                    </span>
                    <CategoryCell category={transaction.category} />
                  </div>
                </div>
                <StatusCell transaction={transaction} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                <div>
                  <span className="font-medium">Vencimento:</span>
                  <div>{transaction.data_vencimento ? formatDate(transaction.data_vencimento) : '-'}</div>
                </div>
                <div>
                  <span className="font-medium">Pagamento:</span>
                  <div>{transaction.status === 'PAGO' ? formatDate(transaction.date) : '-'}</div>
                </div>
                <div>
                  <span className="font-medium">Valor:</span>
                  <div className="text-gray-900 font-medium">
                    R$ {transaction.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Total:</span>
                  <div className="text-gray-900 font-medium">
                    R$ {(transaction.valor_total || transaction.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {transaction.valor_juros && transaction.valor_juros > 0 && (
                <div className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">Juros:</span> R$ {transaction.valor_juros.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              )}

              <div className="flex justify-end">
                <ActionsCell
                  transaction={transaction}
                  onTransactionUpdated={onTransactionUpdated}
                  onMarkAsPaidRequest={handleMarkAsPaidRequest}
                  onAttachReceipt={handleAttachReceipt}
                  isAdmin={isAdmin}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <EditTransactionModal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        transaction={editingTransaction}
        onTransactionUpdated={onTransactionUpdated}
      />

      <DeleteConfirmationModal
        isOpen={!!deletingTransaction}
        onClose={() => setDeletingTransaction(null)}
        transaction={deletingTransaction}
        onTransactionDeleted={onTransactionUpdated}
        type={type}
      />

      <ViewReceiptModal
        isOpen={!!viewingReceipt}
        onClose={() => setViewingReceipt(null)}
        receiptPath={viewingReceipt?.comprovante || ''}
        transactionDescription={viewingReceipt?.description || ''}
      />

      <MarkAsPaidModal
        isOpen={!!markingAsPaidTransaction}
        onClose={() => setMarkingAsPaidTransaction(null)}
        transaction={markingAsPaidTransaction}
        onConfirm={handleMarkAsPaidConfirm}
      />
    </>
  );
};

export default TransactionTable;
