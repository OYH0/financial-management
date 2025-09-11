import React, { memo } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/types/transaction';
import CategoryCell from '@/components/table/CategoryCell';
import StatusCell from '@/components/table/StatusCell';
import ActionsCell from '@/components/table/ActionsCell';

interface MemoizedTransactionRowProps {
  transaction: Transaction;
  onTransactionUpdated: () => void;
  onMarkAsPaidRequest: (transaction: Transaction) => void;
  onAttachReceipt: (transaction: Transaction) => void;
  isAdmin: boolean;
  formatDate: (dateString: string) => string;
}

const MemoizedTransactionRow: React.FC<MemoizedTransactionRowProps> = memo(({
  transaction,
  onTransactionUpdated,
  onMarkAsPaidRequest,
  onAttachReceipt,
  isAdmin,
  formatDate
}) => {
  return (
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
        <StatusCell transaction={transaction} />
      </TableCell>
      <TableCell>
        <ActionsCell
          transaction={transaction}
          onTransactionUpdated={onTransactionUpdated}
          onMarkAsPaidRequest={onMarkAsPaidRequest}
          onAttachReceipt={onAttachReceipt}
          isAdmin={isAdmin}
        />
      </TableCell>
    </TableRow>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better memoization
  return (
    prevProps.transaction.id === nextProps.transaction.id &&
    prevProps.transaction.status === nextProps.transaction.status &&
    prevProps.transaction.valor === nextProps.transaction.valor &&
    prevProps.transaction.comprovante === nextProps.transaction.comprovante &&
    prevProps.isAdmin === nextProps.isAdmin
  );
});

MemoizedTransactionRow.displayName = 'MemoizedTransactionRow';

export default MemoizedTransactionRow;