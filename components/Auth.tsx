import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Mail, Lock, LogIn, UserPlus, Loader2, AlertCircle, Eye, EyeOff, User } from 'lucide-react';
import { DEFAULT_LOGO } from '../constants';

interface AuthProps {
  logo: string;
}

const Auth: React.FC<AuthProps> = ({ logo: initialLogo }) => {
  const [loading, setLoading] = useState(false);
  const [logoLoading, setLogoLoading] = useState(true);
  const [appLogo, setAppLogo] = useState(initialLogo || DEFAULT_LOGO);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const { data } = await supabase.from('app_config').select('logo_data').eq('id', 1).maybeSingle();
        if (data?.logo_data) setAppLogo(data.logo_data);
      } catch (e) {
        console.warn("Falha ao carregar logo na Auth");
      } finally {
        setLogoLoading(false);
      }
    };
    fetchLogo();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        if (signUpError) throw signUpError;

        if (data.user) {
          await supabase.from('presidents').insert([
            { id: data.user.id, full_name: fullName }
          ]);
        }
        
        setError("Conta criada! Verifique seu e-mail para confirmar.");
      }
    } catch (err: any) {
      console.error("Erro Auth:", err);
      setError(err.message || "Erro na autenticação. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4 relative overflow-hidden" role="main">
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center rotate-3 relative">
            {logoLoading ? (
              <div className="w-20 h-20 bg-white/5 rounded-3xl animate-pulse border border-white/10 flex items-center justify-center text-[8px] font-black text-slate-600 uppercase tracking-tighter">Escudo...</div>
            ) : (
              <img src={appLogo} alt="Logo Desintrosados FC" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(0,184,169,0.3)]" />
            )}
          </div>
          <h1 className="text-4xl font-black font-heading text-white tracking-tighter uppercase">
            DESINTROSADOS <span className="text-primary">FC</span>
          </h1>
          <p className="text-slate-400 text-sm font-bold mt-2 tracking-widest uppercase">Área da Presidência</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[40px] border border-white/10 shadow-2xl">
          <h2 className="sr-only" id="auth-title">{isLogin ? 'Fazer Login' : 'Criar Conta'}</h2>
          
          <div className="flex bg-dark/50 p-1 rounded-2xl mb-8">
            <button 
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${isLogin ? 'bg-primary text-dark shadow-lg' : 'text-slate-500'}`}
            >
              Login
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${!isLogin ? 'bg-primary text-dark shadow-lg' : 'text-slate-500'}`}
            >
              Cadastro
            </button>
          </div>

          <form aria-labelledby="auth-title" onSubmit={handleAuth} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2 animate-in slide-in-from-top-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Presidente</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    required
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-dark/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-primary transition-all font-bold"
                    placeholder="Seu Nome e Sobrenome"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-dark/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-primary transition-all font-bold"
                  placeholder="presidencia@time.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha de Acesso</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-dark/50 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white outline-none focus:ring-2 focus:ring-primary transition-all font-bold"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary transition-colors focus:outline-none"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center space-x-3 text-red-400 animate-in slide-in-from-top-1" role="alert">
                <AlertCircle size={18} className="shrink-0" />
                <p className="text-xs font-bold leading-tight">{error}</p>
              </div>
            )}

            <button 
              disabled={loading}
              type="submit"
              className="w-full py-5 bg-primary text-dark font-black text-xs uppercase tracking-[0.3em] rounded-2xl hover:bg-white transition-all active:scale-95 shadow-xl shadow-primary/20 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
                  <span>{isLogin ? 'Entrar no Vestiário' : 'Cadastrar Presidente'}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
