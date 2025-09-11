-- Corrigir warnings de segurança adicionando SET search_path para funções existentes

-- Atualizar função log_transaction_changes com search_path seguro
CREATE OR REPLACE FUNCTION public.log_transaction_changes()
RETURNS TRIGGER AS $$
DECLARE
    changed_fields_array text[] := '{}';
    field_name text;
    old_val text;
    new_val text;
    transaction_type_val text;
    table_name_val text;
BEGIN
    -- Determinar o tipo de transação baseado na tabela
    table_name_val := TG_TABLE_NAME;
    IF table_name_val = 'despesas' THEN
        transaction_type_val := 'despesa';
    ELSIF table_name_val = 'receitas' THEN
        transaction_type_val := 'receita';
    ELSE
        transaction_type_val := 'unknown';
    END IF;

    -- Para INSERT
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.transaction_history (
            transaction_id,
            transaction_type,
            action_type,
            new_data,
            old_data,
            changed_fields,
            user_id,
            ip_address
        ) VALUES (
            NEW.id,
            transaction_type_val,
            'CREATE',
            row_to_json(NEW),
            NULL,
            NULL,
            NEW.user_id,
            inet_client_addr()
        );
        RETURN NEW;
    END IF;

    -- Para UPDATE
    IF TG_OP = 'UPDATE' THEN
        -- Identificar campos alterados
        IF table_name_val = 'despesas' THEN
            IF OLD.data IS DISTINCT FROM NEW.data THEN
                changed_fields_array := array_append(changed_fields_array, 'data');
            END IF;
            IF OLD.valor IS DISTINCT FROM NEW.valor THEN
                changed_fields_array := array_append(changed_fields_array, 'valor');
            END IF;
            IF OLD.valor_juros IS DISTINCT FROM NEW.valor_juros THEN
                changed_fields_array := array_append(changed_fields_array, 'valor_juros');
            END IF;
            IF OLD.valor_total IS DISTINCT FROM NEW.valor_total THEN
                changed_fields_array := array_append(changed_fields_array, 'valor_total');
            END IF;
            IF OLD.descricao IS DISTINCT FROM NEW.descricao THEN
                changed_fields_array := array_append(changed_fields_array, 'descricao');
            END IF;
            IF OLD.empresa IS DISTINCT FROM NEW.empresa THEN
                changed_fields_array := array_append(changed_fields_array, 'empresa');
            END IF;
            IF OLD.categoria IS DISTINCT FROM NEW.categoria THEN
                changed_fields_array := array_append(changed_fields_array, 'categoria');
            END IF;
            IF OLD.subcategoria IS DISTINCT FROM NEW.subcategoria THEN
                changed_fields_array := array_append(changed_fields_array, 'subcategoria');
            END IF;
            IF OLD.status IS DISTINCT FROM NEW.status THEN
                changed_fields_array := array_append(changed_fields_array, 'status');
            END IF;
            IF OLD.data_vencimento IS DISTINCT FROM NEW.data_vencimento THEN
                changed_fields_array := array_append(changed_fields_array, 'data_vencimento');
            END IF;
            IF OLD.origem_pagamento IS DISTINCT FROM NEW.origem_pagamento THEN
                changed_fields_array := array_append(changed_fields_array, 'origem_pagamento');
            END IF;
            IF OLD.comprovante IS DISTINCT FROM NEW.comprovante THEN
                changed_fields_array := array_append(changed_fields_array, 'comprovante');
            END IF;
        ELSIF table_name_val = 'receitas' THEN
            IF OLD.data IS DISTINCT FROM NEW.data THEN
                changed_fields_array := array_append(changed_fields_array, 'data');
            END IF;
            IF OLD.valor IS DISTINCT FROM NEW.valor THEN
                changed_fields_array := array_append(changed_fields_array, 'valor');
            END IF;
            IF OLD.descricao IS DISTINCT FROM NEW.descricao THEN
                changed_fields_array := array_append(changed_fields_array, 'descricao');
            END IF;
            IF OLD.empresa IS DISTINCT FROM NEW.empresa THEN
                changed_fields_array := array_append(changed_fields_array, 'empresa');
            END IF;
            IF OLD.categoria IS DISTINCT FROM NEW.categoria THEN
                changed_fields_array := array_append(changed_fields_array, 'categoria');
            END IF;
            IF OLD.data_recebimento IS DISTINCT FROM NEW.data_recebimento THEN
                changed_fields_array := array_append(changed_fields_array, 'data_recebimento');
            END IF;
        END IF;

        -- Inserir registro de mudança apenas se houve alterações
        IF array_length(changed_fields_array, 1) > 0 THEN
            INSERT INTO public.transaction_history (
                transaction_id,
                transaction_type,
                action_type,
                new_data,
                old_data,
                changed_fields,
                user_id,
                ip_address
            ) VALUES (
                NEW.id,
                transaction_type_val,
                'UPDATE',
                row_to_json(NEW),
                row_to_json(OLD),
                changed_fields_array,
                NEW.user_id,
                inet_client_addr()
            );
        END IF;
        RETURN NEW;
    END IF;

    -- Para DELETE
    IF TG_OP = 'DELETE' THEN
        INSERT INTO public.transaction_history (
            transaction_id,
            transaction_type,
            action_type,
            new_data,
            old_data,
            changed_fields,
            user_id,
            ip_address
        ) VALUES (
            OLD.id,
            transaction_type_val,
            'DELETE',
            NULL,
            row_to_json(OLD),
            NULL,
            OLD.user_id,
            inet_client_addr()
        );
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Atualizar outras funções para adicionar search_path
CREATE OR REPLACE FUNCTION public.has_user_role(user_id uuid, required_role user_role)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT COALESCE(
    (SELECT role = required_role FROM public.profiles WHERE id = user_id),
    false
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_admin_user(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = user_id),
    false
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_admin_or_financeiro(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT COALESCE(
    (SELECT role IN ('admin', 'financeiro') FROM public.profiles WHERE id = user_id),
    false
  );
$function$;

CREATE OR REPLACE FUNCTION public.normalize_category_label(category_code text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = 'public'
AS $function$
BEGIN
  CASE UPPER(category_code)
    WHEN 'TAXA_OCUPACAO' THEN RETURN 'Taxa de Ocupação';
    WHEN 'EMPRESTIMOS_PRESTACOES' THEN RETURN 'Empréstimos e Prestações';
    WHEN 'FOLHA_SALARIAL' THEN RETURN 'Folha Salarial';
    WHEN 'DESCARTAVEIS_LIMPEZA' THEN RETURN 'Descartáveis e Limpeza';
    WHEN 'MERCADO_COMUM' THEN RETURN 'Mercado Comum';
    WHEN 'HORTIFRUTI' THEN RETURN 'Hortifruti';
    WHEN 'PROTEINAS' THEN RETURN 'Proteínas';
    WHEN 'COMBUSTIVEL_TRANSPORTE' THEN RETURN 'Combustível e Transporte';
    WHEN 'SAZONAIS' THEN RETURN 'Sazonais';
    WHEN 'PROLABORE' THEN RETURN 'Prolabore';
    WHEN 'IMPLEMENTACAO' THEN RETURN 'Implementação';
    WHEN 'VARIAVEIS' THEN RETURN 'Variáveis';
    WHEN 'VARIÁVEIS' THEN RETURN 'Variáveis';
    WHEN 'FIXAS' THEN RETURN 'Fixas';
    WHEN 'INSUMOS' THEN RETURN 'Insumos';
    WHEN 'ATRASADOS' THEN RETURN 'Atrasados';
    WHEN 'RETIRADAS' THEN RETURN 'Retiradas';
    WHEN 'VENDAS' THEN RETURN 'Vendas';
    WHEN 'VENDAS_DIARIAS' THEN RETURN 'Vendas Diárias';
    WHEN 'OUTROS' THEN RETURN 'Outros';
    WHEN 'EM_COFRE' THEN RETURN 'Em Cofre';
    WHEN 'EM_CONTA' THEN RETURN 'Em Conta';
    ELSE RETURN INITCAP(REPLACE(category_code, '_', ' '));
  END CASE;
END;
$function$;