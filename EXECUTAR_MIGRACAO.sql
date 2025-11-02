-- ========================================
-- MIGRAÇÃO: Normalizar "Companhia do Churrasco"
-- Execute este SQL diretamente no Supabase Dashboard
-- ========================================

-- PASSO 1: Verificar dados ANTES
SELECT 'ANTES DA MIGRAÇÃO' as status;
SELECT empresa, COUNT(*) as total FROM despesas WHERE empresa IN ('Companhia do Churrasco', 'Churrasco') GROUP BY empresa;
SELECT empresa, COUNT(*) as total FROM receitas WHERE empresa IN ('Companhia do Churrasco', 'Churrasco') GROUP BY empresa;

-- PASSO 2: Atualizar DESPESAS
UPDATE despesas 
SET empresa = 'Companhia do Churrasco Cariri'
WHERE empresa = 'Companhia do Churrasco' 
   OR empresa = 'Churrasco';

-- PASSO 3: Atualizar RECEITAS
UPDATE receitas 
SET empresa = 'Companhia do Churrasco Cariri'
WHERE empresa = 'Companhia do Churrasco' 
   OR empresa = 'Churrasco';

-- PASSO 4: Atualizar DESPESAS RECORRENTES
UPDATE despesas_recorrentes 
SET empresa = 'Companhia do Churrasco Cariri'
WHERE empresa = 'Companhia do Churrasco' 
   OR empresa = 'Churrasco';

-- PASSO 5: Atualizar METAS MENSAIS
UPDATE metas_mensais 
SET empresa = 'Companhia do Churrasco Cariri'
WHERE empresa = 'Companhia do Churrasco' 
   OR empresa = 'Churrasco';

-- PASSO 6: Verificar dados DEPOIS
SELECT 'DEPOIS DA MIGRAÇÃO' as status;
SELECT empresa, COUNT(*) as total FROM despesas WHERE empresa LIKE '%Churrasco%' GROUP BY empresa;
SELECT empresa, COUNT(*) as total FROM receitas WHERE empresa LIKE '%Churrasco%' GROUP BY empresa;

-- ========================================
-- RESULTADO ESPERADO:
-- Todos os "Companhia do Churrasco" e "Churrasco" devem virar "Companhia do Churrasco Cariri"
-- ========================================

