import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://tdkixsjweobkshkyqjlq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_uXko26ZQkgPV4UzgAIhH6w_j0aBCNyw';

const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: { transport: ws }
});

async function fix() {
  const { data, error } = await supabase
    .from('usuarios')
    .update({ perfil: 'cooperador' })
    .ilike('nome', '%almir%')
    .select();
  
  if (error) console.error(error);
  else console.log('Fixed:', data);
}
fix();
