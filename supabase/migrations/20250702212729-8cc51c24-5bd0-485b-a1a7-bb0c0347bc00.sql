
-- Criar tabela para armazenar permissões de tabs por usuário
CREATE TABLE public.user_tab_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tab_name TEXT NOT NULL CHECK (tab_name IN ('camerino', 'companhia', 'johnny', 'admin', 'despesas', 'receitas')),
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, tab_name)
);

-- Habilitar RLS
ALTER TABLE public.user_tab_permissions ENABLE ROW LEVEL SECURITY;

-- Política para admins poderem ver todas as permissões
CREATE POLICY "Admins can view all tab permissions" 
  ON public.user_tab_permissions 
  FOR SELECT 
  USING (is_admin_user(auth.uid()));

-- Política para admins poderem criar permissões
CREATE POLICY "Admins can create tab permissions" 
  ON public.user_tab_permissions 
  FOR INSERT 
  WITH CHECK (is_admin_user(auth.uid()));

-- Política para admins poderem atualizar permissões
CREATE POLICY "Admins can update tab permissions" 
  ON public.user_tab_permissions 
  FOR UPDATE 
  USING (is_admin_user(auth.uid()));

-- Política para usuários poderem ver suas próprias permissões
CREATE POLICY "Users can view their own tab permissions" 
  ON public.user_tab_permissions 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_tab_permissions_updated_at
  BEFORE UPDATE ON public.user_tab_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
