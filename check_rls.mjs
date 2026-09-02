import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const supabaseUrl = 'https://tdkixsjweobkshkyqjlq.supabase.co';
const supabaseKey = 'sb_publishable_uXko26ZQkgPV4UzgAIhH6w_j0aBCNyw';

const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: { transport: ws }
});

async function checkPolicies() {
  // First, let's try to sign in as the user to simulate the real scenario
  console.log('=== Teste de DELETE em pessoas ===\n');

  // List a real pessoa
  const { data: pessoas } = await supabase
    .from('pessoas')
    .select('id, nomeCompleto')
    .limit(5);
  
  console.log('Pessoas encontradas:');
  pessoas?.forEach(p => console.log(`  - ${p.nomeCompleto} (${p.id})`));

  if (!pessoas || pessoas.length === 0) {
    console.log('Nenhuma pessoa encontrada.');
    process.exit(0);
  }

  // Try a real delete on a specific person (pick the last one as test)
  // IMPORTANT: We'll actually try to delete and see the real error
  const testPessoa = pessoas[pessoas.length - 1];
  console.log(`\nTentando deletar: "${testPessoa.nomeCompleto}" (${testPessoa.id})`);

  // Step 1: Delete frequencias
  const { error: freqErr, count: freqCount } = await supabase
    .from('frequencias')
    .delete({ count: 'exact' })
    .eq('pessoaId', testPessoa.id);
  console.log(`\n1. Delete frequencias: error=${freqErr ? JSON.stringify(freqErr) : 'none'}, count=${freqCount}`);

  // Step 2: Update usuarios 
  const { error: usrErr, count: usrCount } = await supabase
    .from('usuarios')
    .update({ pessoaId: null })
    .eq('pessoaId', testPessoa.id)
    .select();
  console.log(`2. Update usuarios: error=${usrErr ? JSON.stringify(usrErr) : 'none'}`);

  // Step 3: Delete the pessoa
  const { error: delErr, count: delCount, status, statusText } = await supabase
    .from('pessoas')
    .delete({ count: 'exact' })
    .eq('id', testPessoa.id);
  console.log(`3. Delete pessoa: error=${delErr ? JSON.stringify(delErr) : 'none'}, count=${delCount}, status=${status}, statusText=${statusText}`);

  // Verify if it was deleted
  const { data: check } = await supabase
    .from('pessoas')
    .select('id')
    .eq('id', testPessoa.id);
  console.log(`\n4. Verificação: Pessoa ainda existe? ${check && check.length > 0 ? 'SIM (não foi deletada!)' : 'NÃO (deletada com sucesso!)'}`);

  process.exit(0);
}

checkPolicies().catch(e => { console.error(e); process.exit(1); });
