
export interface Transaction {
  id: number;
  date: string;
  valor: number;
  company: string;
  description: string;
  category: string;
  subcategoria?: string;
  data_vencimento?: string;
  comprovante?: string;
  status?: string;
  user_id: string;
  valor_juros?: number;
  valor_total?: number;
  origem_pagamento?: string;
}

export type TransactionStatus = 'PAGO' | 'PENDENTE' | 'ATRASADO';
