-- Add destino column to receitas table if it doesn't exist
ALTER TABLE receitas ADD COLUMN IF NOT EXISTS destino VARCHAR(30) DEFAULT 'total';