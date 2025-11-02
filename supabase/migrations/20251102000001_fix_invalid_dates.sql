-- Migration to fix invalid dates with year 20225 instead of 2025
-- This fixes data quality issues where the year was incorrectly entered

-- Fix receitas table
UPDATE receitas
SET data = REPLACE(data, '20225-', '2025-')
WHERE data LIKE '20225-%';

UPDATE receitas
SET data_recebimento = REPLACE(data_recebimento, '20225-', '2025-')
WHERE data_recebimento LIKE '20225-%';

-- Fix despesas table
UPDATE despesas
SET data = REPLACE(data, '20225-', '2025-')
WHERE data LIKE '20225-%';

UPDATE despesas
SET data_vencimento = REPLACE(data_vencimento, '20225-', '2025-')
WHERE data_vencimento LIKE '20225-%';

UPDATE despesas
SET data_pagamento = REPLACE(data_pagamento, '20225-', '2025-')
WHERE data_pagamento LIKE '20225-%';

-- Check for other potential year typos (2026, 2027, etc with extra digit)
-- Uncomment and modify if needed:
-- UPDATE receitas SET data = REPLACE(data, '20226-', '2026-') WHERE data LIKE '20226-%';
-- UPDATE receitas SET data = REPLACE(data, '20227-', '2027-') WHERE data LIKE '20227-%';

