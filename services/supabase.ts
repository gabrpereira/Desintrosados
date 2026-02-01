
import { createClient } from '@supabase/supabase-js';

// Essas chaves são exemplos. O usuário deve substituir pelas chaves do seu projeto Supabase.
const VITE_SUPABASE_URL = 'https://noiisnlwdirxkepraejm.supabase.co';
const VITE_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_0K1RVdFPtwUrpSejT_WlPA_VZFLupkP';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
