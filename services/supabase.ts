
import { createClient } from '@supabase/supabase-js';

// Essas chaves são exemplos. O usuário deve substituir pelas chaves do seu projeto Supabase.
const SUPABASE_URL = 'https://noiisnlwdirxkepraejm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_0K1RVdFPtwUrpSejT_WlPA_VZFLupkP';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
