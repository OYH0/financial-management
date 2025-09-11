-- Corrigir as últimas funções que não têm search_path
CREATE OR REPLACE FUNCTION public.calculate_valor_total()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  -- Calcular valor total como valor + valor_juros
  NEW.valor_total = COALESCE(NEW.valor, 0) + COALESCE(NEW.valor_juros, 0);
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, is_admin)
  VALUES (
    new.id, 
    new.email,
    CASE 
      WHEN new.email = 'oyh013@gmail.com' THEN true 
      ELSE false 
    END
  );
  RETURN new;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;