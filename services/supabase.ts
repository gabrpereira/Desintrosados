import { createClient } from '@supabase/supabase-js';

/**
 * Utilitário para detecção robusta de variáveis de ambiente.
 * Prioriza import.meta.env (Vite/Vercel) e process.env (Node).
 */
const getEnv = (key: string): string | undefined => {
  try {
    const viteEnv = (import.meta as any).env?.[key];
    if (viteEnv) return viteEnv;

    if (typeof process !== 'undefined' && process.env?.[key]) {
      return process.env[key];
    }
  } catch (e) {
    // Silencia erros de acesso a globais em ambientes restritos
  }
  return undefined;
};

// Valores de Fallback (Padrão para DESINTROSADOS FC)
const FALLBACK_URL = 'https://noiisnlwdirxkepraejm.supabase.co';
const FALLBACK_KEY = 'sb_publishable_0K1RVdFPtwUrpSejT_WlPA_VZFLupkP';

// Definição final garantindo que nunca sejam undefined se houver fallback
const SUPABASE_URL = getEnv('VITE_SUPABASE_URL') || FALLBACK_URL;
const SUPABASE_KEY = getEnv('VITE_SUPABASE_PUBLISHABLE_KEY') || FALLBACK_KEY;

// Verificação de sanidade - Só loga erro se o URL não tiver o formato esperado
if (!SUPABASE_URL.startsWith('http')) {
  console.error('❌ ERRO CRÍTICO: Configuração do Supabase inválida! Verifique as variáveis VITE_SUPABASE_URL.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
