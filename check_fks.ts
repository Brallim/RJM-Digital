import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function check() {
  const { data, error } = await supabase.rpc('get_foreign_keys');
  if (error) {
    console.error("RPC Error:", error.message);
  } else {
    console.log(data);
  }
}
check();
