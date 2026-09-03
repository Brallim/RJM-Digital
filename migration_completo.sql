-- ==========================================
-- 1. MIGRAÇÃO DA TABELA DE USUÁRIOS
-- (Separa o Perfil do Status de Acesso)
-- ==========================================

-- Adicionar a coluna de status
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pendente';

-- Migrar os dados existentes
UPDATE public.usuarios SET status = 'ativo' WHERE ativo = true;
UPDATE public.usuarios SET status = 'pendente' WHERE ativo = false OR perfil = 'pendente';

-- Limpar o perfil daqueles que estavam como "pendente" (para aguardarem aprovação limpos)
UPDATE public.usuarios SET perfil = null WHERE perfil = 'pendente';

-- Atualizar o gatilho automático de novos cadastros
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

-- ==========================================
-- 2. MIGRAÇÃO DA TABELA DE REUNIÕES (RECITATIVOS)
-- (Prepara o terreno para a próxima funcionalidade)
-- ==========================================

ALTER TABLE public.reunioes
ADD COLUMN IF NOT EXISTS "recitantesMeninas" text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "recitantesMocas" text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "recitantesMeninos" text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "recitantesMocos" text[] DEFAULT '{}';
