import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tdkixsjweobkshkyqjlq.supabase.co';
const supabaseKey = 'sb_publishable_uXko26ZQkgPV4UzgAIhH6w_j0aBCNyw';
const supabase = createClient(supabaseUrl, supabaseKey);

const users = [
  { email: 'cooperador@teste.com', nome: 'Cooperador Teste' },
  { email: 'auxiliar@teste.com', nome: 'Auxiliar Teste' },
  { email: 'pai@teste.com', nome: 'Pai Teste' },
  { email: 'jovem@teste.com', nome: 'Jovem Teste' }
];

async function createUsers() {
  for (const u of users) {
    console.log(`Criando ${u.email}...`);
    const { data, error } = await supabase.auth.signUp({
      email: u.email,
      password: 'senha_teste',
      options: {
        data: {
          nome: u.nome
        }
      }
    });
    
    if (error) {
      console.error(`Erro ao criar ${u.email}:`, error.message);
    } else {
      console.log(`Sucesso! ${u.email} criado.`);
    }
  }
  console.log('\nPronto! Agora acesse o sistema com seu usuário administrador, vá em "Aprovar Acessos" e aprove as 4 contas criadas, definindo seus respectivos perfis.');
}

createUsers();
