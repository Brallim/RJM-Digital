-- ==========================================
-- MIGRAÇÃO DA TABELA DE USUÁRIOS
-- Adicionando a coluna dados_cadastro
-- ==========================================

-- Adicionar a coluna
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS "dadosCadastro" jsonb DEFAULT '{}'::jsonb;

-- Atualizar o gatilho automático de novos cadastros para salvar os dados
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.usuarios (id, email, nome, status, ativo, "dadosCadastro")
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    'pendente',
    false,
    COALESCE(NEW.raw_user_meta_data->'dadosCadastro', '{}'::jsonb)
  );
  RETURN NEW;
END;
$function$;
