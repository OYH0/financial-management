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
  
  -- Se o vencimento for entre hoje (0) e daqui a 3 dias e a despesa estiver pendente
  if days_diff >= 0 and days_diff <= 3 and NEW.status = 'PENDENTE' then
    
    -- Faz um POST invisível para a sua Edge Function 'check-due-expenses' disparar a notificação
    -- Substituir pela URL do seu projeto
    select
      http_post(
        'https://jkrwxxnhutxpsxkddbym.supabase.co/functions/v1/check-due-expenses',
        '{"expense_id": "' || NEW.id || '"}',
        'application/json',
        '{"Authorization": "Bearer ' || current_setting('request.jwt.sig', true) || '"}' -- Passar JWT no futuro se necessário, mas o Edge function que criamos vai rodar livre.
      )
    into request_id;

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
