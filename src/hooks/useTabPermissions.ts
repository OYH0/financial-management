
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TabPermission {
  id: string;
  user_id: string;
  tab_name: string;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

interface UserTabPermissions {
  [key: string]: {
    camerino: boolean;
    companhia: boolean;
    johnny: boolean;
    admin: boolean;
    despesas: boolean;
    receitas: boolean;
  };
}

export const useTabPermissions = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<TabPermission[]>([]);
  const [userPermissions, setUserPermissions] = useState<UserTabPermissions>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_tab_permissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tab permissions:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar permissões de tabs",
          variant: "destructive"
        });
      } else {
        setPermissions(data || []);
        
        // Organizar permissões por usuário
        const organized: UserTabPermissions = {};
        data?.forEach(perm => {
          if (!organized[perm.user_id]) {
            organized[perm.user_id] = {
              camerino: true,
              companhia: true,
              johnny: true,
              admin: true,
              despesas: true,
              receitas: true
            };
          }
          const tabName = perm.tab_name as keyof typeof organized[string];
          organized[perm.user_id][tabName] = perm.is_visible;
        });
        
        setUserPermissions(organized);
      }
    } catch (error) {
      console.error('Error fetching tab permissions:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar permissões de tabs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const updateTabPermission = async (userId: string, tabName: string, isVisible: boolean) => {
    try {
      // Verificar se já existe uma permissão para este usuário e tab
      const existingPermission = permissions.find(p => p.user_id === userId && p.tab_name === tabName);

      if (existingPermission) {
        // Atualizar permissão existente
        const { error } = await supabase
          .from('user_tab_permissions')
          .update({ is_visible: isVisible })
          .eq('id', existingPermission.id);

        if (error) {
          console.error('Error updating tab permission:', error);
          toast({
            title: "Erro",
            description: "Erro ao atualizar permissão de tab",
            variant: "destructive"
          });
          return false;
        }
      } else {
        // Criar nova permissão
        const { error } = await supabase
          .from('user_tab_permissions')
          .insert({
            user_id: userId,
            tab_name: tabName,
            is_visible: isVisible
          });

        if (error) {
          console.error('Error creating tab permission:', error);
          toast({
            title: "Erro",
            description: "Erro ao criar permissão de tab",
            variant: "destructive"
          });
          return false;
        }
      }

      toast({
        title: "Sucesso",
        description: `Permissão da aba ${tabName} atualizada com sucesso`,
      });

      fetchPermissions(); // Refresh data
      return true;
    } catch (error) {
      console.error('Error updating tab permission:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar permissão de tab",
        variant: "destructive"
      });
      return false;
    }
  };

  const getUserTabVisibility = (userId?: string) => {
    if (!userId) return { camerino: true, companhia: true, johnny: true, admin: true, despesas: true, receitas: true };
    
    return userPermissions[userId] || { camerino: true, companhia: true, johnny: true, admin: true, despesas: true, receitas: true };
  };

  const getMyTabVisibility = () => {
    return getUserTabVisibility(user?.id);
  };

  return {
    permissions,
    userPermissions,
    loading,
    updateTabPermission,
    getUserTabVisibility,
    getMyTabVisibility,
    refetch: fetchPermissions
  };
};
