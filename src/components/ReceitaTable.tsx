
import React, { useState } from 'react';
import { Edit, Trash2, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Receita, useDeleteReceita } from '@/hooks/useReceitas';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { useAuth } from '@/contexts/AuthContext';
import EditReceitaModal from '@/components/EditReceitaModal';
import { prettyLabel } from '@/utils/labelUtils';
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

interface ReceitaTableProps {
  receitas: Receita[];
}

const ReceitaTable: React.FC<ReceitaTableProps> = ({ receitas }) => {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editingReceita, setEditingReceita] = useState<Receita | null>(null);
  const deleteReceita = useDeleteReceita();
  const { isAdmin } = useAdminAccess();
  const { user } = useAuth();

  const handleDelete = () => {
    if (deleteId) {
      const receita = receitas.find(r => r.id === deleteId);
      
      deleteReceita.mutate(deleteId, {
        onSuccess: () => {
          setDeleteId(null);
        }
      });
    }
  };

  const canEditReceita = (receita: Receita) => {
    return isAdmin || receita.user_id === user?.id;
  };

  const getCategoryBadge = (categoria: string) => {
    const colors = {
      VENDAS: 'bg-green-500',
      VENDAS_DIARIAS: 'bg-emerald-500',
      SERVICOS: 'bg-blue-500',
      OUTROS: 'bg-gray-500'
    };
    return colors[categoria as keyof typeof colors] || 'bg-gray-500';
  };

  const getEmpresaBadge = (empresa: string) => {
    const colors = {
      Churrasco: 'bg-red-500',
      Johnny: 'bg-blue-600',
      Camerino: 'bg-purple-500',
      Outros: 'bg-gray-600'
    };
    return colors[empresa as keyof typeof colors] || 'bg-gray-600';
  };

  // Function to format date correctly
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  };




  if (receitas.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhuma receita encontrada.</p>
        <p className="text-sm mt-2">Adicione receitas para visualizá-las aqui.</p>
      </div>
    );
  }

  return (
    <>
      {/* Versão desktop - Cards compactos ao invés de tabela larga */}
      <div className="hidden lg:block space-y-3">
        {receitas.map((receita) => {
          const canEdit = canEditReceita(receita);
          
          return (
            <div key={receita.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="grid grid-cols-12 gap-3 items-start">
                {/* Coluna 1: Data e Empresa (2 colunas) */}
                <div className="col-span-2 text-sm">
                  <div className="text-gray-900 font-medium">
                    {formatDate(receita.data)}
                  </div>
                  <Badge className={`${getEmpresaBadge(receita.empresa)} text-white text-xs mt-1`}>
                    {receita.empresa}
                  </Badge>
                </div>

                {/* Coluna 2: Descrição e Categoria (4 colunas) */}
                <div className="col-span-4">
                  <div className="text-sm font-medium text-gray-900 mb-1 break-words">
                    {receita.descricao}
                  </div>
                  <Badge className={`${getCategoryBadge(receita.categoria)} text-white text-xs`}>
                    {prettyLabel(receita.categoria)}
                  </Badge>
                </div>

                {/* Coluna 3: Valor (2 colunas) */}
                <div className="col-span-2 text-sm">
                  <div className="text-gray-600 text-xs mb-1">Valor:</div>
                  <div className="font-bold text-gray-900">
                    R$ {receita.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                {/* Coluna 4: Status de Recebimento (2 colunas) */}
                <div className="col-span-2 flex justify-center items-start">
                  {receita.data_recebimento ? (
                    <div className="text-center">
                      <div className="text-xs text-gray-600 mb-1">Recebido em:</div>
                      <Badge className="bg-green-500 text-white text-xs">
                        {formatDate(receita.data_recebimento)}
                      </Badge>
                    </div>
                  ) : (
                    <Badge className="bg-yellow-500 text-white text-xs">Pendente</Badge>
                  )}
                </div>

                {/* Coluna 5: Ações (2 colunas) */}
                <div className="col-span-2 flex justify-end gap-2">
                  {canEdit ? (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setEditingReceita(receita)}
                    >
                      <Edit size={16} />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" disabled className="opacity-50">
                      <Lock size={16} className="text-gray-400" />
                    </Button>
                  )}
                  
                  {canEdit ? (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setDeleteId(receita.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" disabled className="opacity-50">
                      <Lock size={16} className="text-gray-400" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Versão mobile - Cards */}
      <div className="lg:hidden space-y-3">
        {receitas.map((receita) => {
          const canEdit = canEditReceita(receita);
          
          return (
            <div key={receita.id} className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900 mb-1 break-words">
                    {receita.descricao}
                  </div>
                  <div className="flex flex-wrap items-center gap-1 mb-1">
                    <Badge className={`${getEmpresaBadge(receita.empresa)} text-white text-xs`}>
                      {receita.empresa}
                    </Badge>
                    <Badge className={`${getCategoryBadge(receita.categoria)} text-white text-xs`}>
                      {prettyLabel(receita.categoria)}
                    </Badge>
                  </div>
                </div>
                {receita.data_recebimento ? (
                  <Badge className="bg-green-500 text-white text-xs">
                    Recebido
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-500 text-white text-xs">Pendente</Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                <div>
                  <span className="font-medium">Data:</span>
                  <div>{formatDate(receita.data)}</div>
                </div>
                <div>
                  <span className="font-medium">Recebimento:</span>
                  <div>{receita.data_recebimento ? formatDate(receita.data_recebimento) : '-'}</div>
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Valor:</span>
                  <div className="text-gray-900 font-medium">
                    R$ {receita.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
                {canEdit ? (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setEditingReceita(receita)}
                  >
                    <Edit size={16} />
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" disabled className="opacity-50">
                    <Lock size={16} className="text-gray-400" />
                  </Button>
                )}
                
                {canEdit ? (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setDeleteId(receita.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" disabled className="opacity-50">
                    <Lock size={16} className="text-gray-400" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      <EditReceitaModal
        isOpen={!!editingReceita}
        onClose={() => setEditingReceita(null)}
        receita={editingReceita}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta receita? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ReceitaTable;
