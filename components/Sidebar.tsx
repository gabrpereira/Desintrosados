import React, { useState, useEffect } from 'react';
import { ViewType } from '../types';
import { ICONS, DEFAULT_LOGO } from '../constants';
import { supabase } from '../services/supabase';
import { Sun, Moon, LogOut, User, ChevronRight, Menu, X } from 'lucide-react';

interface SidebarProps {
  user?: any;
  userName?: string;
  userAvatar?: string;
  logo: string;
  currentView: ViewType;
  setView: (view: ViewType) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, userName, userAvatar, logo: initialLogo, currentView, setView, isDarkMode, toggleTheme, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [appLogo, setAppLogo] = useState(initialLogo || DEFAULT_LOGO);
  const [logoLoading, setLogoLoading] = useState(true);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const { data } = await supabase.from('app_config').select('logo_data').eq('id', 1).maybeSingle();
        if (data?.logo_data) setAppLogo(data.logo_data);
      } catch (e) {
        console.warn("Falha ao carregar logo na Sidebar");
      } finally {
        setLogoLoading(false);
      }
    };
    fetchLogo();
  }, []);

  const menuItems: { id: ViewType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: ICONS.Dashboard },
    { id: 'players', label: 'Jogadores', icon: ICONS.Players },
    { id: 'matches', label: 'Partidas', icon: ICONS.Matches },
    { id: 'finances', label: 'Finanças', icon: ICONS.Finances },
    { id: 'stats', label: 'Estatísticas', icon: ICONS.Stats },
  ];

  const displayName = userName || "Presidente";

  const handleMobileNav = (view: ViewType) => {
    setView(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <aside 
        className="hidden md:flex fixed left-0 top-4 bottom-4 bg-dark text-white z-[100] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] w-20 hover:w-80 rounded-r-[40px] border-y border-r border-white/5 dark:border-primary/10 group shadow-[10px_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex-col py-8"
      >
        <div className="px-3 mb-10 flex items-center h-14 overflow-hidden shrink-0">
          <div className="w-14 min-w-[56px] flex items-center justify-center shrink-0 cursor-pointer" onClick={() => setView('dashboard')}>
            <div className="w-14 h-14 flex items-center justify-center transition-all duration-500 hover:scale-110">
              {logoLoading ? (
                <div className="w-10 h-10 bg-white/5 rounded-xl animate-pulse"></div>
              ) : (
                <img 
                  src={appLogo} 
                  alt="Desintrosados FC" 
                  className="w-full h-full object-contain rotate-3 group-hover:rotate-0 transition-transform duration-500" 
                />
              )}
            </div>
          </div>
          <div className="overflow-hidden opacity-0 group-hover:opacity-100 transition-all duration-500 whitespace-nowrap">
            <h1 className="text-lg font-black tracking-tighter font-heading text-white translate-x-2 group-hover:translate-x-0 transition-transform duration-500 pl-2">
              DESINTROSADOS <span className="text-primary">FC</span>
            </h1>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-3 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full grid grid-cols-[56px_1fr] items-center rounded-[20px] transition-all duration-300 h-14 relative group/item overflow-hidden shrink-0 ${
                  isActive 
                    ? 'bg-primary text-dark shadow-lg shadow-primary/30' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="w-14 h-14 flex items-center justify-center shrink-0">
                  <span className={`flex items-center justify-center transition-all duration-300 ${isActive ? 'text-dark scale-110' : 'text-primary'}`}>
                    {item.icon}
                  </span>
                </div>
                <div className="overflow-hidden opacity-0 group-hover:opacity-100 transition-all duration-500 text-left">
                  <span className={`font-bold text-sm whitespace-nowrap block pl-2 translate-x-2 group-hover:translate-x-0 transition-transform duration-500 ${isActive ? 'text-dark' : 'text-slate-300'}`}>
                    {item.label}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="px-3 pt-6 border-t border-white/5 shrink-0 space-y-3">
          <button 
            onClick={() => setView('profile')}
            className={`w-full grid grid-cols-[56px_1fr] items-center h-14 overflow-hidden rounded-[20px] transition-all duration-300 hover:bg-white/5 ${currentView === 'profile' ? 'bg-primary/10 border border-primary/20' : ''}`}
          >
            <div className="w-14 h-14 flex items-center justify-center shrink-0">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all overflow-hidden ${currentView === 'profile' ? 'bg-primary text-dark ring-2 ring-primary/20' : 'bg-primary/20 text-primary border border-primary/20'}`}>
                {userAvatar ? (
                  <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={18} />
                )}
              </div>
            </div>
            <div className="overflow-hidden opacity-0 group-hover:opacity-100 transition-all duration-500 whitespace-nowrap text-left pl-2 flex items-center justify-between pr-4">
              <div>
                <p className="text-[10px] font-black uppercase text-primary tracking-widest leading-none">Presidente</p>
                <p className="text-[11px] font-black text-slate-200 truncate mt-1">{displayName}</p>
              </div>
              <ChevronRight size={14} className="text-slate-500" />
            </div>
          </button>

          <button 
            onClick={toggleTheme}
            className="w-full grid grid-cols-[56px_1fr] items-center rounded-[20px] h-14 overflow-hidden bg-white/5 hover:bg-white/10 transition-all duration-300 text-slate-400 hover:text-white"
          >
            <div className="w-14 h-14 flex items-center justify-center shrink-0">
              {isDarkMode ? <Sun size={20} className="text-accent" /> : <Moon size={20} className="text-primary" />}
            </div>
            <div className="overflow-hidden opacity-0 group-hover:opacity-100 transition-all duration-500 whitespace-nowrap text-left">
              <span className="text-xs font-bold uppercase tracking-widest pl-2">
                {isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
              </span>
            </div>
          </button>

          <button 
            onClick={onLogout}
            className="w-full grid grid-cols-[56px_1fr] items-center rounded-[20px] h-14 overflow-hidden bg-red-500/10 hover:bg-red-500/20 transition-all duration-300 text-red-400 hover:text-red-300"
          >
            <div className="w-14 h-14 flex items-center justify-center shrink-0">
              <LogOut size={20} />
            </div>
            <div className="overflow-hidden opacity-0 group-hover:opacity-100 transition-all duration-500 whitespace-nowrap text-left">
              <span className="text-xs font-black uppercase tracking-widest pl-2">
                Sair
              </span>
            </div>
          </button>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-dark/95 backdrop-blur-xl border-b border-white/5 z-[150] flex items-center justify-between px-6 shadow-2xl">
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 -ml-2 text-primary active:scale-90 transition-transform"
        >
          <Menu size={28} />
        </button>
        
        <div className="flex items-center space-x-2" onClick={() => handleMobileNav('dashboard')}>
          <h2 className="text-sm font-black font-heading tracking-tight text-white uppercase">
            DESINTROSADOS <span className="text-primary">FC</span>
          </h2>
          <div className="w-8 h-8 flex items-center justify-center">
            {logoLoading ? (
              <div className="w-6 h-6 bg-white/5 rounded-lg animate-pulse"></div>
            ) : (
              <img src={appLogo} alt="Logo" className="w-full h-full object-contain" />
            )}
          </div>
        </div>

        <div className="w-8"></div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[200] animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute top-0 left-0 bottom-0 w-[280px] bg-[#020d0c] border-r border-white/5 flex flex-col p-6 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-10">
              <div className="w-10 h-10">
                {logoLoading ? (
                  <div className="w-8 h-8 bg-white/5 rounded-xl animate-pulse"></div>
                ) : (
                  <img src={appLogo} alt="Logo" className="w-full h-full object-contain" />
                )}
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 bg-white/5 rounded-full text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-4 ml-4">Navegação Principal</p>
              {menuItems.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMobileNav(item.id)}
                    className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all ${
                      isActive 
                        ? 'bg-primary text-dark font-black' 
                        : 'text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <span className={isActive ? 'text-dark' : 'text-primary'}>{item.icon}</span>
                    <span className="text-sm uppercase tracking-widest">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="pt-6 mt-6 border-t border-white/5 space-y-3">
              <button 
                onClick={() => handleMobileNav('profile')}
                className={`w-full flex items-center justify-between p-4 rounded-2xl ${currentView === 'profile' ? 'bg-primary/10 border border-primary/20' : 'bg-white/5'}`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center border border-primary/30">
                    {userAvatar ? (
                      <img src={userAvatar} alt="Perfil" className="w-full h-full object-cover" />
                    ) : (
                      <User size={16} className="text-primary" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-[8px] font-black text-primary uppercase tracking-widest">Presidente</p>
                    <p className="text-xs font-bold text-white truncate max-w-[120px]">{displayName}</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-600" />
              </button>

              <div className="flex space-x-2">
                <button 
                  onClick={toggleTheme}
                  className="flex-1 flex items-center justify-center p-4 bg-white/5 rounded-2xl text-slate-400"
                >
                  {isDarkMode ? <Sun size={20} className="text-accent" /> : <Moon size={20} className="text-primary" />}
                </button>
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); onLogout(); }}
                  className="flex-[2] flex items-center justify-center space-x-3 p-4 bg-red-500/10 text-red-400 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                >
                  <LogOut size={18} />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
