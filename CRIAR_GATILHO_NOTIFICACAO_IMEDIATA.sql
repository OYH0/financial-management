-- Habilita a extensão de requisições HTTP do Supabase (para que o banco consiga chamar a Edge Function)
create extension if not exists http with schema extensions;

-- Criação da função de trigger
create or replace function public.notify_due_expense_on_insert()
returns trigger
language plpgsql
security definer
as $$
declare
  days_diff int;
  request_id bigint;
begin
  -- Verifica diferença de dias entre vencimento e hoje
  days_diff := extract(day from (NEW.data_vencimento::timestamp - current_date::timestamp));
  
  -- Se o vencimento for entre hoje (0) e daqui a 3 dias e a despesa estiver pendente (ou null)
  if days_diff >= 0 and days_diff <= 3 and (NEW.status = 'PENDENTE' or NEW.status is null) then
    
    -- Faz um POST invisível para a sua Edge Function 'check-due-expenses' disparar a notificação
    -- Usando a sintaxe correta do pgsql-http para incluir headers
    perform extensions.http((
      'POST',
      'https://jkrwxxnhutxpsxkddbym.supabase.co/functions/v1/check-due-expenses',
      ARRAY[extensions.http_header('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imprcnd4eG5odXR4cHN4a2RkYnltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODkwNjEyMiwiZXhwIjoyMDY0NDgyMTIyfQ.jbH30wDFEBIfp2zCwy3iQrShigh9O0-3zwxUhNn7aYU')],
      'application/json',
      '{"expense_id": ' || NEW.id || '}'
    )::extensions.http_request);

  end if;

  return NEW;
end;
$$;

-- Criar o gatilho na tabela 'despesas' (After Insert)
drop trigger if exists trigger_notify_due_expense on public.despesas;

create trigger trigger_notify_due_expense
after insert on public.despesas
for each row
execute function public.notify_due_expense_on_insert();
