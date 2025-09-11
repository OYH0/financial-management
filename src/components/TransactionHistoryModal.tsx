import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, Edit, Trash2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { prettyLabel } from '@/utils/labelUtils';

interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: number;
  transactionType: 'despesa' | 'receita';
}

const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({
  isOpen,
  onClose,
  transactionId,
  transactionType
}) => {
  const { data: history, isLoading } = useQuery({
    queryKey: ['transaction-history', transactionType, transactionId],
    queryFn: async () => {
      let query = supabase
        .from('transaction_history')
        .select('*')
        .eq('transaction_type', transactionType);
      
      // Se transactionId for 0, buscar todo o histórico do tipo
      if (transactionId !== 0) {
        query = query.eq('transaction_id', transactionId);
      }
      
      const { data, error } = await query.order('timestamp', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: isOpen
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getActionIcon = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE': return <Plus className="h-4 w-4 text-green-500" />;
      case 'UPDATE': return <Edit className="h-4 w-4 text-blue-500" />;
      case 'DELETE': return <Trash2 className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE': return 'Criado';
      case 'UPDATE': return 'Atualizado';
      case 'DELETE': return 'Excluído';
      default: return action;
    }
  };

  const getChangedFieldsText = (changedFields: string[]) => {
    if (!changedFields || changedFields.length === 0) return '';
    return changedFields.map(field => {
      switch (field) {
        case 'valor': return 'Valor';
        case 'descricao': return 'Descrição';
        case 'empresa': return 'Empresa';
        case 'categoria': return 'Categoria';
        case 'subcategoria': return 'Subcategoria';
        case 'data': return 'Data de Pagamento';
        case 'data_vencimento': return 'Data de Vencimento';
        case 'valor_juros': return 'Valor dos Juros';
        case 'origem_pagamento': return 'Origem do Pagamento';
        case 'status': return 'Status';
        default: return field;
      }
    }).join(', ');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {transactionId === 0 
              ? `Histórico Completo de ${transactionType === 'despesa' ? 'Despesas' : 'Receitas'}`
              : 'Histórico da Transação'
            }
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Carregando histórico...</p>
            </div>
          ) : history && history.length > 0 ? (
            history.map((entry, index) => (
              <Card key={entry.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getActionIcon(entry.action_type)}
                      <CardTitle className="text-lg">
                        {getActionLabel(entry.action_type)}
                        {transactionId === 0 && (
                          <span className="text-sm font-normal text-gray-600 ml-2">
                            - ID: {entry.transaction_id}
                          </span>
                        )}
                      </CardTitle>
                    </div>
                    <Badge variant="outline">
                      {formatDate(entry.timestamp)}
                    </Badge>
                  </div>
                  {transactionId === 0 && entry.new_data && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Descrição: </span>
                      {(entry.new_data as any)?.descricao || 'N/A'} - 
                      <span className="font-medium"> Empresa: </span>
                      {(entry.new_data as any)?.empresa || 'N/A'}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {entry.changed_fields && entry.changed_fields.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Campos alterados: 
                        </span>
                        <span className="text-sm text-gray-600 ml-1">
                          {getChangedFieldsText(entry.changed_fields)}
                        </span>
                      </div>
                    )}
                    
                    {entry.action_type === 'update' && entry.old_data && entry.new_data && (
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <h4 className="text-sm font-medium text-red-700 mb-2">Valores Anteriores:</h4>
                          <div className="bg-red-50 p-3 rounded-lg text-sm">
                            {entry.changed_fields?.map(field => (
                              <div key={field} className="mb-1">
                                <span className="font-medium">{getChangedFieldsText([field])}:</span>{' '}
                                <span className="text-gray-600">
                                  {field === 'categoria' || field === 'subcategoria'
                                    ? prettyLabel((entry.old_data as any)?.[field])
                                    : (entry.old_data as any)?.[field] || 'Não informado'
                                  }
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-green-700 mb-2">Novos Valores:</h4>
                          <div className="bg-green-50 p-3 rounded-lg text-sm">
                            {entry.changed_fields?.map(field => (
                              <div key={field} className="mb-1">
                                <span className="font-medium">{getChangedFieldsText([field])}:</span>{' '}
                                <span className="text-gray-600">
                                  {field === 'categoria' || field === 'subcategoria'
                                    ? prettyLabel((entry.new_data as any)?.[field])
                                    : (entry.new_data as any)?.[field] || 'Não informado'
                                  }
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {entry.action_type === 'create' && entry.new_data && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-green-700 mb-2">Dados da Criação:</h4>
                        <div className="bg-green-50 p-3 rounded-lg text-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div><span className="font-medium">Valor:</span> R$ {(entry.new_data as any)?.valor || 'N/A'}</div>
                            <div><span className="font-medium">Empresa:</span> {(entry.new_data as any)?.empresa || 'N/A'}</div>
                            <div><span className="font-medium">Categoria:</span> {prettyLabel((entry.new_data as any)?.categoria)}</div>
                            <div><span className="font-medium">Descrição:</span> {(entry.new_data as any)?.descricao || 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {transactionId === 0 
                  ? `Nenhum histórico encontrado para ${transactionType === 'despesa' ? 'despesas' : 'receitas'}.`
                  : 'Nenhum histórico encontrado para esta transação.'
                }
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionHistoryModal;