import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Saldo {
  id: number;
  tipo: 'conta' | 'cofre';
  valor: number;
}

export const useSaldos = () => {
  return useQuery({
    queryKey: ['saldos'],
    queryFn: async () => {
      console.log('=== FETCHING SALDOS ===');
      const { data, error } = await supabase
        .from('saldos')
        .select('*')
        .order('tipo');
      
      if (error) throw error;
      console.log('Saldos fetched:', data);
      return data as Saldo[];
    },
    staleTime: 0, // Sem cache para garantir atualizações imediatas
    gcTime: 0, // Remover cache para forçar refetch
  });
};

export const useUpdateSaldo = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ tipo, valor }: { tipo: 'conta' | 'cofre'; valor: number }) => {
      // Get current saldo or create if doesn't exist
      const { data: currentSaldo, error: fetchError } = await supabase
        .from('saldos')
        .select('*')
        .eq('tipo', tipo)
        .maybeSingle();

      if (fetchError) throw fetchError;

      const newValor = (currentSaldo?.valor || 0) + valor;
      
      if (currentSaldo) {
        // Update existing record
        const { data, error } = await supabase
          .from('saldos')
          .update({ valor: newValor })
          .eq('tipo', tipo)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('saldos')
          .insert({ tipo, valor: newValor })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saldos'] });
    },
    onError: (error) => {
      console.error('Erro ao atualizar saldo:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar saldo',
        variant: 'destructive',
      });
    },
  });
};