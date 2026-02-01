import { createClient } from '@supabase/supabase-js';

/**
 * Função utilitária para buscar variáveis de ambiente de forma segura
 * em diferentes contextos (Vite, Node, Browser Puro).
 */
const getSafeEnv = (key: string): string | undefined => {
  try {
    // Casting to any avoids the "Property 'env' does not exist on type 'ImportMeta'" error
    // while maintaining compatibility with Vite's environment variable system.
    const meta = import.meta as any;
    if (typeof meta !== 'undefined' && meta.env && meta.env[key]) {
      return meta.env[key];
    }
    // @ts-ignore - Tenta padrão Node/Polyfill
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {
    // Silencia erros de acesso a globais não existentes
  }
  return undefined;
};

// Valores que você cadastrou ou os padrões de fallback
const SUPABASE_URL = getSafeEnv('VITE_SUPABASE_URL') || 'https://noiisnlwdirxkepraejm.supabase.co';
const SUPABASE_KEY = getSafeEnv('VITE_SUPABASE_PUBLISHABLE_KEY') || 'sb_publishable_0K1RVdFPtwUrpSejT_WlPA_VZFLupkP';

if (!SUPABASE_URL || SUPABASE_URL.includes('your-project')) {
  console.warn("Supabase: URL não configurada ou usando valor padrão de exemplo.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);