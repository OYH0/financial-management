-- Create saldos table for balance tracking
CREATE TABLE public.saldos (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(20) NOT NULL, -- 'conta' ou 'cofre'
  valor DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.saldos ENABLE ROW LEVEL SECURITY;

-- Create policies for saldos table
CREATE POLICY "Everyone can view saldos" 
ON public.saldos 
FOR SELECT 
USING (true);

CREATE POLICY "Admin and Financeiro can update saldos" 
ON public.saldos 
FOR UPDATE 
USING (is_admin_or_financeiro(auth.uid()));

CREATE POLICY "Admin and Financeiro can insert saldos" 
ON public.saldos 
FOR INSERT 
WITH CHECK (is_admin_or_financeiro(auth.uid()));

-- Insert initial values for conta and cofre
INSERT INTO public.saldos (tipo, valor) VALUES ('conta', 0);
INSERT INTO public.saldos (tipo, valor) VALUES ('cofre', 0);

-- Create trigger for updating timestamp
CREATE TRIGGER update_saldos_updated_at
  BEFORE UPDATE ON public.saldos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();