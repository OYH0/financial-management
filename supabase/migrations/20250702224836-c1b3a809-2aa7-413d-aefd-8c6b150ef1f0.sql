
-- Drop the existing check constraint
ALTER TABLE public.user_tab_permissions DROP CONSTRAINT IF EXISTS user_tab_permissions_tab_name_check;

-- Add the updated check constraint with all required tab names
ALTER TABLE public.user_tab_permissions ADD CONSTRAINT user_tab_permissions_tab_name_check 
CHECK (tab_name IN ('camerino', 'companhia', 'johnny', 'admin', 'despesas', 'receitas'));
