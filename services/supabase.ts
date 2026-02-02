import { createClient } from '@supabase/supabase-js';

/**
 * Utilitário para detecção segura de variáveis de ambiente.
 * Suporta Vite (import.meta.env) e Node/Polyfills (process.env).
 */
const getEnv = (key: string): string | undefined => {
  try {
    const meta = (import.meta as any).env;
    if (meta && meta[key]) return meta[key];
    
    const proc = (typeof process !== 'undefined' ? process : null) as any;
    if (proc && proc.env && proc.env[key]) return proc.env[key];
  } catch (e) {
    // Silencia erros de acesso a globais
  }
  return undefined;
};

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL') || 'https://noiisnlwdirxkepraejm.supabase.co';
const SUPABASE_KEY = getEnv('VITE_SUPABASE_PUBLISHABLE_KEY') || 'sb_publishable_0K1RVdFPtwUrpSejT_WlPA_VZFLupkP';

// Exportação do cliente com tratamento de erro básico
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);