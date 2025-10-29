import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DespesaRecorrente {
  id: string;
  user_id: string;
  valor: number;
  descricao: string;
  empresa: string;
  categoria: string;
  subcategoria?: string;
  origem_pagamento?: string;
  dia_vencimento: number;
  ativa: boolean;
  created_at: string;
  updated_at: string;
}

export const useDespesasRecorrentes = () => {
  return useQuery({
    queryKey: ['despesas-recorrentes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('despesas_recorrentes')
        .select('*')
        .order('descricao', { ascending: true });

      if (error) {
        console.error('Erro ao buscar despesas recorrentes:', error);
        throw error;
      }

      return data as DespesaRecorrente[];
    },
  });
};

export const useCreateDespesaRecorrente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (despesa: Omit<DespesaRecorrente, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('despesas_recorrentes')
        .insert([despesa])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas-recorrentes'] });
      toast.success('Despesa recorrente criada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar despesa recorrente:', error);
      toast.error('Erro ao criar despesa recorrente');
    },
  });
};

export const useUpdateDespesaRecorrente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DespesaRecorrente> & { id: string }) => {
      const { data, error } = await supabase
        .from('despesas_recorrentes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas-recorrentes'] });
      toast.success('Despesa recorrente atualizada!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar despesa recorrente:', error);
      toast.error('Erro ao atualizar despesa recorrente');
    },
  });
};

export const useDeleteDespesaRecorrente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('despesas_recorrentes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas-recorrentes'] });
      toast.success('Despesa recorrente removida!');
    },
    onError: (error) => {
      console.error('Erro ao deletar despesa recorrente:', error);
      toast.error('Erro ao deletar despesa recorrente');
    },
  });
};
