-- Add destino column to receitas table if it doesn't exist
ALTER TABLE receitas ADD COLUMN IF NOT EXISTS destino VARCHAR(30) DEFAULT 'total';

-- Ensure saldos table exists with proper structure
CREATE TABLE IF NOT EXISTS saldos (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL, -- 'conta' ou 'cofre'
    valor DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert initial records if they don't exist
INSERT INTO saldos (tipo, valor) 
SELECT 'conta', 0 
WHERE NOT EXISTS (SELECT 1 FROM saldos WHERE tipo = 'conta');

INSERT INTO saldos (tipo, valor) 
SELECT 'cofre', 0 
WHERE NOT EXISTS (SELECT 1 FROM saldos WHERE tipo = 'cofre');

-- Enable RLS on saldos table
ALTER TABLE saldos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for saldos table
CREATE POLICY "Everyone can view saldos" ON saldos FOR SELECT USING (true);
CREATE POLICY "Admin and Financeiro can update saldos" ON saldos FOR UPDATE USING (is_admin_or_financeiro(auth.uid()));
CREATE POLICY "Admin and Financeiro can insert saldos" ON saldos FOR INSERT WITH CHECK (is_admin_or_financeiro(auth.uid()));

-- Create trigger for updating updated_at on saldos
CREATE TRIGGER update_saldos_updated_at
    BEFORE UPDATE ON saldos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();