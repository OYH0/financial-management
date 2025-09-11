
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface MetaMensal {
  id: string;
  nome_meta: string;
  empresa: string;
  valor_meta: number;
  valor_atual: number;
  mes: number;
  ano: number;
  cor: string;
  categoria_receita: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export const useMetasMensais = (empresa?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['metas-mensais', empresa],
    queryFn: async () => {
      let query = supabase
        .from('metas_mensais')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (empresa) {
        query = query.eq('empresa', empresa);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MetaMensal[];
    },
    enabled: !!user,
  });
};

export const useCreateMetaMensal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (meta: Omit<MetaMensal, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase
        .from('metas_mensais')
        .insert([{ ...meta, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metas-mensais'] });
      toast({
        title: "Sucesso",
        description: "Meta criada com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Erro ao criar meta:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar meta. Tente novamente.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateMetaMensal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...meta }: Partial<MetaMensal> & { id: string }) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase
        .from('metas_mensais')
        .update({ ...meta, user_id: user.id })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metas-mensais'] });
      toast({
        title: "Sucesso",
        description: "Meta atualizada com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar meta:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar meta. Tente novamente.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteMetaMensal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      const { error } = await supabase
        .from('metas_mensais')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metas-mensais'] });
      toast({
        title: "Sucesso",
        description: "Meta excluída com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Erro ao excluir meta:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir meta. Tente novamente.",
        variant: "destructive",
      });
    },
  });
};
