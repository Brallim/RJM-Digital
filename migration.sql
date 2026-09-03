-- 1. Adicionar a coluna de status
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pendente';

-- 2. Migrar os dados existentes
UPDATE public.usuarios
SET status = 'ativo'
WHERE ativo = true;

UPDATE public.usuarios
SET status = 'pendente'
WHERE ativo = false OR perfil = 'pendente';

-- 3. Caso o perfil estivesse como pendente, limpar para ficar nulo até ser aprovado
UPDATE public.usuarios
SET perfil = null
WHERE perfil = 'pendente';

-- 4. Atualizar o trigger de criação de novo usuário para não usar 'pendente' como perfil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.usuarios (id, email, nome, status, ativo)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    'pendente',
    false
  );
  RETURN NEW;
END;
$function$;
