
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';
import { ajustarSaldo, calcularDiferencaSaldo } from '@/utils/saldoUtils';

export interface Despesa {
  id: number;
  data: string | null;
  valor: number;
  empresa: string;
  descricao: string;
  categoria: string;
  subcategoria?: string;
  data_vencimento?: string;
  comprovante?: string;
  status?: string;
  user_id: string;
  valor_juros?: number;
  valor_total?: number;
  origem_pagamento?: string;
}

export const useDespesas = (options?: { mode?: 'all' | 'month'; start?: Date; end?: Date; useCustomDateRange?: boolean }) => {
  const { user } = useAuth();
  
  const query = useQuery({
    queryKey: ['despesas', options?.mode ?? 'all', options?.useCustomDateRange],
    queryFn: async () => {
      const mode = options?.mode ?? 'all';
      const useCustomDateRange = options?.useCustomDateRange ?? false;

      let queryBuilder = supabase
        .from('despesas')
        .select('*');

      // Apenas aplicar filtro de servidor se não estiver usando range personalizado
      let serverFiltered = false;
      if (mode === 'month' && !useCustomDateRange) {
        const now = new Date();
        const start = options?.start ?? new Date(now.getFullYear(), now.getMonth(), 1);
        const end = options?.end ?? new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const toYMD = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const startStr = toYMD(start);
        const endStr = toYMD(end);

        console.info('=== FETCHING DESPESAS (MODE=MONTH, SERVER FILTER) ===', { startStr, endStr });
        queryBuilder = queryBuilder.or(`and(data.gte.${startStr},data.lte.${endStr}),and(data_vencimento.gte.${startStr},data_vencimento.lte.${endStr})`);
        serverFiltered = true;
      } else if (useCustomDateRange && options?.start && options?.end) {
        const toYMD = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const startStr = toYMD(options.start);
        const endStr = toYMD(options.end);
        console.info('=== FETCHING DESPESAS (CUSTOM RANGE, SERVER FILTER) ===', { startStr, endStr });
        queryBuilder = queryBuilder.or(`and(data.gte.${startStr},data.lte.${endStr}),and(data_vencimento.gte.${startStr},data_vencimento.lte.${endStr})`);
        serverFiltered = true;
      } else {
        console.info('=== FETCHING DESPESAS (MODE=ALL OR CUSTOM RANGE WITHOUT DATES) ===');
      }

      if (serverFiltered) {
        const { data, error } = await queryBuilder
          .order('data_vencimento', { ascending: true, nullsFirst: false })
          .order('data', { ascending: false, nullsFirst: false });
        
        if (error) {
          console.error('Error fetching despesas:', error);
          throw error;
        }
        
        return data as Despesa[];
      }

      // Sem filtro no servidor: fazer paginação para evitar limite de 1000 registros
      const pageSize = 1000;
      let from = 0;
      let to = pageSize - 1;
      let allData: Despesa[] = [];

      for (let page = 0; page < 50; page++) { // limite de segurança
        const { data: batch, error: pageError } = await supabase
          .from('despesas')
          .select('*')
          .order('data_vencimento', { ascending: true, nullsFirst: false })
          .order('data', { ascending: false, nullsFirst: false })
          .range(from, to);

        if (pageError) {
          console.error('Error fetching despesas (paged):', pageError);
          throw pageError;
        }

        const list = (batch || []) as Despesa[];
        allData = allData.concat(list);

        if (list.length < pageSize) break; // última página
        from += pageSize;
        to += pageSize;
      }

      console.info('=== FETCHING DESPESAS (PAGINATED, TOTAL) ===', allData.length);
      return allData;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Reduce unnecessary refetches
  });

  // Memoized calculations for better performance
  const processedData = useMemo(() => {
    if (!query.data) return { despesas: [], stats: null };

    const despesas = query.data;
    const totalDespesas = despesas.reduce((sum, d) => sum + (d.valor || 0), 0);
    const totalPagas = despesas
      .filter(d => d.status === 'PAGO')
      .reduce((sum, d) => sum + (d.valor_total || d.valor || 0), 0);
    const totalPendentes = despesas
      .filter(d => d.status !== 'PAGO')
      .reduce((sum, d) => sum + (d.valor || 0), 0);

    return {
      despesas,
      stats: {
        total: totalDespesas,
        pagas: totalPagas,
        pendentes: totalPendentes,
        count: despesas.length,
        pagasCount: despesas.filter(d => d.status === 'PAGO').length,
        pendentesCount: despesas.filter(d => d.status !== 'PAGO').length,
      }
    };
  }, [query.data]);

  return {
    ...query,
    data: processedData.despesas,
    stats: processedData.stats,
  };
};

export const useCreateDespesa = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (despesa: Omit<Despesa, 'id' | 'user_id'>) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      console.log('Creating despesa for user:', user.id);
      
      // Validate required fields
      if (!despesa.valor || despesa.valor <= 0) {
        throw new Error('Valor deve ser maior que zero');
      }
      if (!despesa.descricao?.trim()) {
        throw new Error('Descrição é obrigatória');
      }
      if (!despesa.empresa?.trim()) {
        throw new Error('Empresa é obrigatória');
      }

      const { data, error } = await supabase
        .from('despesas')
        .insert([{ ...despesa, user_id: user.id }])
        .select()
        .single();

      if (error) {
        console.error('Error creating despesa:', error);
        throw error;
      }
      
      // Se a despesa foi paga na criação, ajustar o saldo
      if (data.status === 'PAGO' && data.origem_pagamento) {
        const valorTotal = (data.valor_total || data.valor || 0);
        await ajustarSaldo(data.origem_pagamento as 'conta' | 'cofre', -valorTotal);
      }
      
      console.log('Despesa created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas'] });
      queryClient.invalidateQueries({ queryKey: ['saldos'] });
      queryClient.invalidateQueries({ queryKey: ['receitas'] });
      toast({
        title: "Sucesso",
        description: "Despesa criada com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Erro ao criar despesa:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar despesa. Tente novamente.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateDespesa = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, originalData, ...despesa }: Partial<Despesa> & { id: number; originalData?: Despesa }) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      console.log('Updating despesa:', id);

      // Buscar dados originais se não fornecidos
      if (!originalData) {
        const { data: fetchedData, error: fetchError } = await supabase
          .from('despesas')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        originalData = fetchedData;
      }

      const { data, error } = await supabase
        .from('despesas')
        .update({ ...despesa, user_id: user.id })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating despesa:', error);
        throw error;
      }

      // Ajustar saldos conforme necessário
      const originalPago = originalData.status === 'PAGO';
      const novoPago = data.status === 'PAGO';
      
      if (originalPago && novoPago) {
        // Ambos pagos: ajustar pela diferença de valor
        const valorOriginal = originalData.valor_total || originalData.valor || 0;
        const valorNovo = data.valor_total || data.valor || 0;
        const diferenca = calcularDiferencaSaldo(valorOriginal, valorNovo);
        
        if (diferenca !== 0 && data.origem_pagamento) {
          await ajustarSaldo(data.origem_pagamento as 'conta' | 'cofre', diferenca);
        }
      } else if (!originalPago && novoPago) {
        // Mudou de não pago para pago: subtrair valor total
        const valorTotal = data.valor_total || data.valor || 0;
        if (data.origem_pagamento) {
          await ajustarSaldo(data.origem_pagamento as 'conta' | 'cofre', -valorTotal);
        }
      } else if (originalPago && !novoPago) {
        // Mudou de pago para não pago: somar valor original de volta
        const valorOriginal = originalData.valor_total || originalData.valor || 0;
        if (originalData.origem_pagamento) {
          await ajustarSaldo(originalData.origem_pagamento as 'conta' | 'cofre', valorOriginal);
        }
      }
      
      console.log('Despesa updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas'] });
      queryClient.invalidateQueries({ queryKey: ['saldos'] });
      queryClient.invalidateQueries({ queryKey: ['receitas'] });
      toast({
        title: "Sucesso",
        description: "Despesa atualizada com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar despesa:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao atualizar despesa. Tente novamente.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteDespesa = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (despesa: Despesa) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      console.log('Deleting despesa:', despesa.id);
      
      // Se a despesa estava paga, reverter o valor no saldo
      if (despesa.status === 'PAGO' && despesa.origem_pagamento) {
        const valorTotal = despesa.valor_total || despesa.valor || 0;
        await ajustarSaldo(despesa.origem_pagamento as 'conta' | 'cofre', valorTotal);
      }
      
      const { error } = await supabase
        .from('despesas')
        .delete()
        .eq('id', despesa.id);

      if (error) {
        console.error('Error deleting despesa:', error);
        throw error;
      }
      
      console.log('Despesa deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas'] });
      queryClient.invalidateQueries({ queryKey: ['saldos'] });
      queryClient.invalidateQueries({ queryKey: ['receitas'] });
      toast({
        title: "Sucesso",
        description: "Despesa excluída com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Erro ao excluir despesa:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao excluir despesa. Tente novamente.",
        variant: "destructive",
      });
    },
  });
};
