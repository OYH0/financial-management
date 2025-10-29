-- Criar tabela para despesas recorrentes
CREATE TABLE public.despesas_recorrentes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  valor numeric NOT NULL,
  descricao text NOT NULL,
  empresa text NOT NULL,
  categoria text NOT NULL,
  subcategoria text,
  origem_pagamento text,
  dia_vencimento integer NOT NULL CHECK (dia_vencimento >= 1 AND dia_vencimento <= 28),
  ativa boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.despesas_recorrentes ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Todos podem visualizar despesas recorrentes"
ON public.despesas_recorrentes
FOR SELECT
USING (true);

CREATE POLICY "Admin e Financeiro podem criar despesas recorrentes"
ON public.despesas_recorrentes
FOR INSERT
WITH CHECK (is_admin_or_financeiro(auth.uid()));

CREATE POLICY "Admin e Financeiro podem atualizar despesas recorrentes"
ON public.despesas_recorrentes
FOR UPDATE
USING (is_admin_or_financeiro(auth.uid()));

CREATE POLICY "Admin e Financeiro podem deletar despesas recorrentes"
ON public.despesas_recorrentes
FOR DELETE
USING (is_admin_or_financeiro(auth.uid()));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_despesas_recorrentes_updated_at
BEFORE UPDATE ON public.despesas_recorrentes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();