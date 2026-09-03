import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://tdkixsjweobkshkyqjlq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_uXko26ZQkgPV4UzgAIhH6w_j0aBCNyw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('Verificando tabelas relacionadas a recitativos...');
  
  const res1 = await supabase.from('recitativos').select('id').limit(1);
  console.log('recitativos:', res1.error ? res1.error.message : 'OK');
  
  const res2 = await supabase.from('participantes_recitativo').select('id').limit(1);
  console.log('participantes_recitativo:', res2.error ? res2.error.message : 'OK');
  
  const res3 = await supabase.from('reuniao_participantes').select('id').limit(1);
  console.log('reuniao_participantes:', res3.error ? res3.error.message : 'OK');
}

checkTables();
