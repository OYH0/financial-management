-- ============================================
-- CORRIGIR DATAS INVÁLIDAS (Ano 20225 -> 2025)
-- ============================================
-- Execute este SQL no Supabase Dashboard
-- (Dashboard > SQL Editor > New query > Cole e Execute)

-- 1. Corrigir datas na tabela receitas
UPDATE receitas
SET data = REPLACE(data, '20225-', '2025-')
WHERE data LIKE '20225-%';

UPDATE receitas
SET data_recebimento = REPLACE(data_recebimento, '20225-', '2025-')
WHERE data_recebimento LIKE '20225-%';

-- 2. Corrigir datas na tabela despesas
UPDATE despesas
SET data = REPLACE(data, '20225-', '2025-')
WHERE data LIKE '20225-%';

UPDATE despesas
SET data_vencimento = REPLACE(data_vencimento, '20225-', '2025-')
WHERE data_vencimento LIKE '20225-%';

UPDATE despesas
SET data_pagamento = REPLACE(data_pagamento, '20225-', '2025-')
WHERE data_pagamento LIKE '20225-%';

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================
-- Execute estas queries para verificar se ainda existem datas inválidas:

SELECT COUNT(*) as receitas_com_datas_invalidas
FROM receitas
WHERE data LIKE '20225-%' OR data_recebimento LIKE '20225-%';

SELECT COUNT(*) as despesas_com_datas_invalidas
FROM despesas
WHERE data LIKE '20225-%' 
   OR data_vencimento LIKE '20225-%' 
   OR data_pagamento LIKE '20225-%';

-- Se as queries acima retornarem 0, as datas foram corrigidas com sucesso! ✅

