-- Migration: Normalizar dados legados da "Companhia do Churrasco"
-- Data: 02/11/2025
-- Objetivo: Atualizar todos os registros "Companhia do Churrasco" para "Companhia do Churrasco Cariri"
-- Isso elimina a necessidade de tratamento de dados legados no frontend

-- ========================================
-- 1. ATUALIZAR DESPESAS
-- ========================================

-- Primeiro, vamos verificar quantos registros serão afetados (para log)
DO $$
DECLARE
  count_despesas INTEGER;
  count_receitas INTEGER;
  count_recorrentes INTEGER;
  count_metas INTEGER;
BEGIN
  -- Contar despesas afetadas
  SELECT COUNT(*) INTO count_despesas
  FROM despesas
  WHERE empresa IN ('Companhia do Churrasco', 'Churrasco');
  
  -- Contar receitas afetadas
  SELECT COUNT(*) INTO count_receitas
  FROM receitas
  WHERE empresa IN ('Companhia do Churrasco', 'Churrasco');
  
  -- Contar despesas recorrentes afetadas
  SELECT COUNT(*) INTO count_recorrentes
  FROM despesas_recorrentes
  WHERE empresa IN ('Companhia do Churrasco', 'Churrasco');
  
  -- Contar metas mensais afetadas
  SELECT COUNT(*) INTO count_metas
  FROM metas_mensais
  WHERE empresa IN ('Companhia do Churrasco', 'Churrasco');
  
  RAISE NOTICE 'Migração iniciada:';
  RAISE NOTICE 'Despesas a serem atualizadas: %', count_despesas;
  RAISE NOTICE 'Receitas a serem atualizadas: %', count_receitas;
  RAISE NOTICE 'Despesas recorrentes a serem atualizadas: %', count_recorrentes;
  RAISE NOTICE 'Metas mensais a serem atualizadas: %', count_metas;
END $$;

-- Atualizar despesas
UPDATE despesas 
SET empresa = 'Companhia do Churrasco Cariri'
WHERE empresa = 'Companhia do Churrasco' 
   OR empresa = 'Churrasco';

-- ========================================
-- 2. ATUALIZAR RECEITAS
-- ========================================

UPDATE receitas 
SET empresa = 'Companhia do Churrasco Cariri'
WHERE empresa = 'Companhia do Churrasco' 
   OR empresa = 'Churrasco';

-- ========================================
-- 3. ATUALIZAR DESPESAS RECORRENTES
-- ========================================

UPDATE despesas_recorrentes 
SET empresa = 'Companhia do Churrasco Cariri'
WHERE empresa = 'Companhia do Churrasco' 
   OR empresa = 'Churrasco';

-- ========================================
-- 4. ATUALIZAR METAS MENSAIS
-- ========================================

UPDATE metas_mensais 
SET empresa = 'Companhia do Churrasco Cariri'
WHERE empresa = 'Companhia do Churrasco' 
   OR empresa = 'Churrasco'
   OR empresa = 'Churrasco';

-- ========================================
-- 5. VERIFICAR RESULTADOS
-- ========================================

DO $$
DECLARE
  count_despesas_after INTEGER;
  count_receitas_after INTEGER;
  count_recorrentes_after INTEGER;
  count_metas_after INTEGER;
BEGIN
  -- Verificar se ainda existem registros com nome antigo
  SELECT COUNT(*) INTO count_despesas_after
  FROM despesas
  WHERE empresa IN ('Companhia do Churrasco', 'Churrasco');
  
  SELECT COUNT(*) INTO count_receitas_after
  FROM receitas
  WHERE empresa IN ('Companhia do Churrasco', 'Churrasco');
  
  SELECT COUNT(*) INTO count_recorrentes_after
  FROM despesas_recorrentes
  WHERE empresa IN ('Companhia do Churrasco', 'Churrasco');
  
  SELECT COUNT(*) INTO count_metas_after
  FROM metas_mensais
  WHERE empresa IN ('Companhia do Churrasco', 'Churrasco');
  
  RAISE NOTICE 'Migração concluída:';
  RAISE NOTICE 'Despesas restantes com nome antigo: %', count_despesas_after;
  RAISE NOTICE 'Receitas restantes com nome antigo: %', count_receitas_after;
  RAISE NOTICE 'Despesas recorrentes restantes com nome antigo: %', count_recorrentes_after;
  RAISE NOTICE 'Metas mensais restantes com nome antigo: %', count_metas_after;
  
  IF count_despesas_after > 0 OR count_receitas_after > 0 OR 
     count_recorrentes_after > 0 OR count_metas_after > 0 THEN
    RAISE WARNING 'Ainda existem registros com nome antigo!';
  ELSE
    RAISE NOTICE '✅ Todos os registros foram atualizados com sucesso!';
  END IF;
END $$;

-- ========================================
-- 6. CRIAR CONSTRAINT PARA EVITAR VALORES ANTIGOS NO FUTURO (OPCIONAL)
-- ========================================

-- Comentado por padrão - descomente se quiser evitar que novos registros
-- usem os nomes antigos

-- ALTER TABLE despesas
-- ADD CONSTRAINT check_empresa_despesas 
-- CHECK (empresa NOT IN ('Companhia do Churrasco', 'Churrasco'));

-- ALTER TABLE receitas
-- ADD CONSTRAINT check_empresa_receitas 
-- CHECK (empresa NOT IN ('Companhia do Churrasco', 'Churrasco'));

-- ALTER TABLE despesas_recorrentes
-- ADD CONSTRAINT check_empresa_recorrentes 
-- CHECK (empresa NOT IN ('Companhia do Churrasco', 'Churrasco'));

-- ========================================
-- 7. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ========================================

COMMENT ON TABLE despesas IS 'Tabela de despesas - Após migração 20251102000000, todos os registros "Companhia do Churrasco" foram normalizados para "Companhia do Churrasco Cariri"';
COMMENT ON TABLE receitas IS 'Tabela de receitas - Após migração 20251102000000, todos os registros "Companhia do Churrasco" foram normalizados para "Companhia do Churrasco Cariri"';

-- ========================================
-- ROLLBACK (caso necessário)
-- ========================================

-- Para reverter esta migração (NÃO RECOMENDADO):
-- UPDATE despesas SET empresa = 'Companhia do Churrasco' WHERE empresa = 'Companhia do Churrasco Cariri';
-- UPDATE receitas SET empresa = 'Companhia do Churrasco' WHERE empresa = 'Companhia do Churrasco Cariri';
-- UPDATE despesas_recorrentes SET empresa = 'Companhia do Churrasco' WHERE empresa = 'Companhia do Churrasco Cariri';
-- UPDATE metas_mensais SET empresa = 'Companhia do Churrasco' WHERE empresa = 'Companhia do Churrasco Cariri';

