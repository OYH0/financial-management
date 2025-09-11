
import React from 'react';
import { Transaction } from '@/types/transaction';
import { getTransactionStatus, getStatusColor } from '@/utils/transactionUtils';

interface StatusCellProps {
  transaction: Transaction;
}

const StatusCell: React.FC<StatusCellProps> = ({ transaction }) => {
  const status = getTransactionStatus(transaction);
  
  return (
    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(status)}`}>
      {status}
    </span>
  );
};

export default StatusCell;
