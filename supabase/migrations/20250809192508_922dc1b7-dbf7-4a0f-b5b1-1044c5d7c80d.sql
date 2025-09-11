-- Adicionar coluna origem_pagamento à tabela despesas
ALTER TABLE public.despesas 
ADD COLUMN IF NOT EXISTS origem_pagamento TEXT;

-- Criar tabela de histórico de transações para auditoria
CREATE TABLE IF NOT EXISTS public.transaction_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('despesa', 'receita')),
  transaction_id BIGINT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('create', 'update', 'delete')),
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  user_id UUID NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Criar índices para melhor performance
CREATE INDEX idx_transaction_history_type_id ON public.transaction_history (transaction_type, transaction_id);
CREATE INDEX idx_transaction_history_user_id ON public.transaction_history (user_id);
CREATE INDEX idx_transaction_history_timestamp ON public.transaction_history (timestamp DESC);

-- Habilitar RLS
ALTER TABLE public.transaction_history ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para o histórico
CREATE POLICY "Users can view all transaction history" 
ON public.transaction_history 
FOR SELECT 
USING (true);

CREATE POLICY "System can create transaction history" 
ON public.transaction_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Função para normalizar categorias/subcategorias nos rótulos bonitos
CREATE OR REPLACE FUNCTION public.normalize_category_label(category_code TEXT)
RETURNS TEXT AS $$
BEGIN
  CASE UPPER(category_code)
    WHEN 'TAXA_OCUPACAO' THEN RETURN 'Taxa de Ocupação';
    WHEN 'EMPRESTIMOS_PRESTACOES' THEN RETURN 'Empréstimos e Prestações';
    WHEN 'FOLHA_SALARIAL' THEN RETURN 'Folha Salarial';
    WHEN 'DESCARTAVEIS_LIMPEZA' THEN RETURN 'Descartáveis e Limpeza';
    WHEN 'MERCADO_COMUM' THEN RETURN 'Mercado Comum';
    WHEN 'HORTIFRUTI' THEN RETURN 'Hortifruti';
    WHEN 'PROTEINAS' THEN RETURN 'Proteínas';
    WHEN 'COMBUSTIVEL_TRANSPORTE' THEN RETURN 'Combustível e Transporte';
    WHEN 'SAZONAIS' THEN RETURN 'Sazonais';
    WHEN 'PROLABORE' THEN RETURN 'Prolabore';
    WHEN 'IMPLEMENTACAO' THEN RETURN 'Implementação';
    WHEN 'VARIAVEIS' THEN RETURN 'Variáveis';
    WHEN 'VARIÁVEIS' THEN RETURN 'Variáveis';
    WHEN 'FIXAS' THEN RETURN 'Fixas';
    WHEN 'INSUMOS' THEN RETURN 'Insumos';
    WHEN 'ATRASADOS' THEN RETURN 'Atrasados';
    WHEN 'RETIRADAS' THEN RETURN 'Retiradas';
    WHEN 'VENDAS' THEN RETURN 'Vendas';
    WHEN 'VENDAS_DIARIAS' THEN RETURN 'Vendas Diárias';
    WHEN 'OUTROS' THEN RETURN 'Outros';
    WHEN 'EM_COFRE' THEN RETURN 'Em Cofre';
    WHEN 'EM_CONTA' THEN RETURN 'Em Conta';
    ELSE RETURN INITCAP(REPLACE(category_code, '_', ' '));
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;