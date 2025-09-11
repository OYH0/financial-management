-- Remove a constraint atual do action_type se existir
ALTER TABLE public.transaction_history DROP CONSTRAINT IF EXISTS transaction_history_action_type_check;

-- Adicionar nova constraint que permite os valores corretos
ALTER TABLE public.transaction_history ADD CONSTRAINT transaction_history_action_type_check 
CHECK (action_type IN ('CREATE', 'UPDATE', 'DELETE'));