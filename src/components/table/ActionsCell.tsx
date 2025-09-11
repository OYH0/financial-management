import React, { useState, memo } from 'react';
import { Eye, Edit, Trash2, Paperclip, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EditTransactionModal from '@/components/EditTransactionModal';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import ViewReceiptModal from '@/components/ViewReceiptModal';
import { Transaction } from '@/types/transaction';

interface ActionsCellProps {
  transaction: Transaction;
  onTransactionUpdated: () => void;
  onMarkAsPaidRequest?: (transaction: Transaction) => void;
  onAttachReceipt?: (transaction: Transaction) => void;
  isAdmin: boolean;
}

const ActionsCell: React.FC<ActionsCellProps> = memo(({ transaction, onTransactionUpdated, onMarkAsPaidRequest, onAttachReceipt, isAdmin }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  return (
    <div className="flex items-center justify-center gap-1">
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 w-8 p-0" 
        onClick={() => setIsReceiptModalOpen(true)}
        title="Ver Comprovante"
      >
        <Eye className="h-4 w-4" />
      </Button>
      
      {isAdmin && (
        <>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => setIsEditModalOpen(true)}
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => setIsDeleteModalOpen(true)}
            title="Excluir"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => onAttachReceipt?.(transaction)}
            title="Anexar Comprovante"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          {transaction.status !== 'PAGO' && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => onMarkAsPaidRequest?.(transaction)}
              title="Confirmar Pagamento"
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
        </>
      )}

      {isAdmin && (
        <EditTransactionModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          transaction={transaction}
          onTransactionUpdated={onTransactionUpdated}
        />
      )}

      {isAdmin && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          transaction={transaction}
          onTransactionDeleted={onTransactionUpdated}
          type="despesa"
        />
      )}

      <ViewReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        receiptPath={transaction.comprovante || ''}
        transactionDescription={transaction.description}
      />

    </div>
  );
});

ActionsCell.displayName = 'ActionsCell';

export default ActionsCell;