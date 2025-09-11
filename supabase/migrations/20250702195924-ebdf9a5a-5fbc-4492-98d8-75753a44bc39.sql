
-- Adicionar coluna subcategoria à tabela despesas
ALTER TABLE public.despesas 
ADD COLUMN subcategoria text;

-- Comentário para documentar a coluna
COMMENT ON COLUMN public.despesas.subcategoria IS 'Subcategoria da despesa (ex: Descartáveis, Limpeza, etc.)';
