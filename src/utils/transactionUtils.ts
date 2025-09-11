
import { Transaction } from '@/types/transaction';

export const getTransactionStatus = (transaction: Transaction): string => {
  if (transaction.status === 'PAGO') {
    return 'PAGO';
  }

  if (!transaction.data_vencimento) {
    return 'PENDENTE';
  }

  const today = new Date();
  const dueDate = new Date(transaction.data_vencimento + 'T00:00:00');
  
  if (dueDate < today) {
    return 'ATRASADO';
  }
  
  return 'PENDENTE';
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'PAGO':
      return 'bg-green-100 text-green-800';
    case 'PENDENTE':
      return 'bg-yellow-100 text-yellow-800';
    case 'ATRASADO':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'INSUMOS':
      return 'bg-blue-100 text-blue-800';
    case 'FIXAS':
      return 'bg-purple-100 text-purple-800';
    case 'VARIÁVEIS':
      return 'bg-green-100 text-green-800';
    case 'OBRAS':
      return 'bg-orange-100 text-orange-800';
    case 'RETIRADAS':
      return 'bg-red-100 text-red-800';
    case 'IMPLEMENTACAO':
      return 'bg-indigo-100 text-indigo-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (dateString: string | null): string => {
  if (!dateString) return '-';
  
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('pt-BR');
};

export const truncateDescription = (description: string, maxLength: number = 80): { text: string; isTruncated: boolean } => {
  if (!description || description.length <= maxLength) {
    return {
      text: description || '',
      isTruncated: false
    };
  }
  
  return {
    text: description.substring(0, maxLength) + '...',
    isTruncated: true
  };
};
