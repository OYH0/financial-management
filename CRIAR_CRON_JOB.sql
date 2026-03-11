-- 1. Habilita as extensões necessárias para fazer agendamentos e requisições HTTP (se não estiverem ativas)
create extension if not exists pg_cron with schema extensions;
create extension if not exists http with schema extensions;

-- 2. Tenta remover o agendamento antigo (se existir) ignorando erros caso não exista
DO $$ 
BEGIN
  PERFORM cron.unschedule('diario_lembrete_despesas');
EXCEPTION WHEN others THEN
  -- Ignora o erro se o job não existir na primeira vez
END $$;

-- 3. Cria um job no pg_cron para rodar todos os dias às 11:00 UTC (08:00 no Brasil)
select cron.schedule(
  'diario_lembrete_despesas',     -- Nome do agendamento
  '0 11 * * *',                   -- Cron expression: Todos os dias às 11:00 (Hora UTC)
  $$
    -- Faz um POST vazio para a Edge Function rodar no modo "Cron Job"
    select http_post(
      'https://jkrwxxnhutxpsxkddbym.supabase.co/functions/v1/check-due-expenses',
      '', 
      'application/json',
      '{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imprcnd4eG5odXR4cHN4a2RkYnltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODkwNjEyMiwiZXhwIjoyMDY0NDgyMTIyfQ.jbH30wDFEBIfp2zCwy3iQrShigh9O0-3zwxUhNn7aYU"}' 
    );
  $$
);
