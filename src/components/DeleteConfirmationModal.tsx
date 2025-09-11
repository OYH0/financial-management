
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDeleteDespesa } from '@/hooks/useDespesas';
import { useDeleteReceita } from '@/hooks/useReceitas';
import { Transaction } from '@/types/transaction';
import { truncateDescription } from '@/utils/transactionUtils';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onTransactionDeleted: () => void;
  type: 'despesa' | 'receita';
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onTransactionDeleted,
  type
}) => {
  const deleteDespesa = useDeleteDespesa();
  const deleteReceita = useDeleteReceita();

  const handleDelete = async () => {
    if (!transaction) return;

    try {
      console.log('=== EXCLUINDO TRANSAÇÃO ===');
      console.log('Tipo:', type);
      console.log('Status:', transaction.status);
      console.log('Origem pagamento:', transaction.origem_pagamento);
      console.log('Valor total:', transaction.valor_total || transaction.valor);

      // Para despesas, o ajuste de saldo agora é feito automaticamente no hook useDeleteDespesa

      // SEGUNDO: Agora excluir a transação
      console.log('EXCLUINDO TRANSAÇÃO DO BANCO...');
      if (type === 'despesa') {
        // Converter Transaction para Despesa
        const despesa = {
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
        await deleteDespesa.mutateAsync(despesa);
      } else {
        await deleteReceita.mutateAsync(transaction.id);
      }
      
      console.log('TRANSAÇÃO EXCLUÍDA COM SUCESSO');
      onTransactionDeleted();
      onClose();
    } catch (error) {
      console.error(`Erro ao excluir ${type}:`, error);
    }
  };

  const isLoading = deleteDespesa.isPending || deleteReceita.isPending;

  // Truncar a descrição para exibição no modal
  const { text: truncatedDescription } = truncateDescription(transaction?.description || '', 50);

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[425px] w-[95vw] max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader className="space-y-3">
          <AlertDialogTitle className="text-lg font-semibold">
            Confirmar Exclusão
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-gray-600">
            Tem certeza que deseja excluir esta {type}? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Empresa:</label>
            <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
              {transaction?.company}
            </p>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Descrição:</label>
            <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border break-words">
              {truncatedDescription}
            </p>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Valor:</label>
            <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border font-medium">
              R$ {transaction?.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <AlertDialogCancel 
            onClick={onClose} 
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={isLoading}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isLoading ? 'Excluindo...' : 'Excluir'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmationModal;
