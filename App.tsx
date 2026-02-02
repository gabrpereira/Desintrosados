import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Player, Match, ViewType } from './types';
import Sidebar from './components/Sidebar';
import { supabase } from './services/supabase';
import { DEFAULT_LOGO } from './constants';

// Carregamento Tardio (Lazy Loading) para performance e estabilidade
const Dashboard = lazy(() => import('./components/Dashboard'));
const PlayerList = lazy(() => import('./components/PlayerList'));
const Finances = lazy(() => import('./components/Finances'));
const StatsView = lazy(() => import('./components/StatsView'));
const MatchList = lazy(() => import('./components/MatchList'));
const UserProfile = lazy(() => import('./components/UserProfile'));
const Auth = lazy(() => import('./components/Auth'));

const PlayerModal = lazy(() => import('./components/PlayerModal'));
const MatchModal = lazy(() => import('./components/MatchModal'));
const PlayerDetailsModal = lazy(() => import('./components/PlayerDetailsModal'));
const MatchDetailsModal = lazy(() => import('./components/MatchDetailsModal'));
const DeleteModal = lazy(() => import('./components/DeleteModal'));
const DeleteMatchModal = lazy(() => import('./components/DeleteMatchModal'));
const LogoutModal = lazy(() => import('./components/LogoutModal'));

const ViewLoader = () => (
  <div className="flex flex-col items-center justify-center py-32 space-y-4">
    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Preparando Vestiário...</p>
  </div>
);

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [userName, setUserName] = useState<string>("");
  const [userAvatar, setUserAvatar] = useState<string>("");
  const [appLogo, setAppLogo] = useState<string>(DEFAULT_LOGO);
  const [view, setView] = useState<ViewType>('dashboard');
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return true;
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteMatchModalOpen, setIsDeleteMatchModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isMatchDetailsModalOpen, setIsMatchDetailsModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  const [editingPlayer, setEditingPlayer] = useState<Player | undefined>();
  const [editingMatch, setEditingMatch] = useState<Match | undefined>();
  const [playerToDelete, setPlayerToDelete] = useState<Player | undefined>();
  const [matchToDelete, setMatchToDelete] = useState<Match | undefined>();
  const [viewingPlayer, setViewingPlayer] = useState<Player | undefined>();
  const [viewingMatch, setViewingMatch] = useState<Match | undefined>();

  const fetchAppConfig = useCallback(async () => {
    try {
      const { data } = await supabase.from('app_config').select('logo_data').eq('id', 1).maybeSingle();
      if (data?.logo_data) setAppLogo(data.logo_data);
    } catch (e) { console.warn("Erro ao buscar logo customizada:", e); }
  }, []);

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase.from('presidents').select('full_name').eq('id', userId).maybeSingle();
      if (data?.full_name) setUserName(data.full_name);
    } catch (e) { console.error("Erro ao carregar perfil:", e); }
  }, []);

  const fetchData = useCallback(async (currentSession: any) => {
    if (!currentSession) return;
    setLoading(true);
    try {
      const [pRes, mRes] = await Promise.all([
        supabase.from('players').select('*').order('name', { ascending: true }),
        supabase.from('matches').select('*').order('date', { ascending: false })
      ]);

      if (pRes.data) {
        setPlayers(pRes.data.map((p: any) => ({
          ...p,
          id: p.id,
          monthlyFeePaid: (p.payment_history || []).includes(new Date().toISOString().slice(0, 7)),
          paymentHistory: p.payment_history || []
        })));
      }
      if (mRes.data) {
        setMatches(mRes.data.map((m: any) => ({
          ...m,
          ourScore: m.our_score || 0,
          opponentScore: m.opponent_score || 0
        })));
      }
    } catch (e) {
      console.error("Erro fatal ao carregar dados:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // Limpeza manual imediata para garantir redirecionamento sem depender apenas do listener
      setSession(null);
      setUserName("");
      setPlayers([]);
      setMatches([]);
      setView('dashboard');
      setIsLogoutModalOpen(false);
    } catch (error) {
      console.error("Erro ao encerrar sessão:", error);
      // Mesmo com erro, forçamos a limpeza local
      setSession(null);
      setIsLogoutModalOpen(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isInitializing) {
        setIsInitializing(false);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [isInitializing]);

  useEffect(() => {
    let isMounted = true;
    
    const initApp = async () => {
      try {
        await fetchAppConfig();
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (!isMounted) return;
        setSession(initialSession);
        if (initialSession?.user) {
          await fetchUserProfile(initialSession.user.id);
          await fetchData(initialSession);
        }
      } catch (err) {
        console.error("Erro na inicialização:", err);
      } finally {
        if (isMounted) setIsInitializing(false);
      }
    };

    initApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      if (newSession?.user) {
        await fetchUserProfile(newSession.user.id);
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          await fetchData(newSession);
        }
      } else {
        // Quando o evento é SIGNED_OUT, newSession é null
        setPlayers([]);
        setMatches([]);
        setUserName("");
      }
      setIsInitializing(false);
    });

    return () => { subscription.unsubscribe(); isMounted = false; };
  }, [fetchUserProfile, fetchData, fetchAppConfig]);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-8">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <div className="mt-8 text-center space-y-2 animate-pulse">
          <p className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">Autenticando...</p>
          <p className="text-slate-600 font-bold uppercase tracking-widest text-[8px]">DESINTROSADOS FC</p>
        </div>
      </div>
    );
  }

  if (!session) return <Suspense fallback={<ViewLoader />}><Auth logo={appLogo} /></Suspense>;

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark flex flex-col md:flex-row transition-colors duration-300">
      <Sidebar 
        logo={appLogo}
        user={session.user} 
        userName={userName}
        userAvatar={userAvatar}
        currentView={view} 
        setView={setView} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme}
        onLogout={() => setIsLogoutModalOpen(true)}
      />
      
      <main className="flex-1 md:pl-24 pt-20 md:pt-12 p-4 md:p-12 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {loading ? <ViewLoader /> : (
            <Suspense fallback={<ViewLoader />}>
              {view === 'dashboard' && <Dashboard logo={appLogo} players={players} matches={matches} isDarkMode={isDarkMode} />}
              {view === 'players' && <PlayerList players={players} onEdit={(p) => { setEditingPlayer(p); setIsModalOpen(true); }} onView={(p) => { setViewingPlayer(p); setIsDetailsModalOpen(true); }} onDelete={(id) => { const player = players.find(p => id === p.id); if (player) { setPlayerToDelete(player); setIsDeleteModalOpen(true); } }} onAdd={() => { setEditingPlayer(undefined); setIsModalOpen(true); }} />}
              {view === 'matches' && <MatchList matches={matches} players={players} onAdd={() => { setEditingMatch(undefined); setIsMatchModalOpen(true); }} onEdit={(m) => { setEditingMatch(m); setIsMatchModalOpen(true); }} onView={(m) => { setViewingMatch(m); setIsMatchDetailsModalOpen(true); }} onDelete={(id) => { const match = matches.find(m => m.id === id); if (match) { setMatchToDelete(match); setIsDeleteMatchModalOpen(true); } }} />}
              {view === 'finances' && <Finances players={players} onTogglePayment={(id, m) => {}} />}
              {view === 'stats' && <StatsView players={players} isDarkMode={isDarkMode} />}
              {view === 'profile' && <UserProfile logo={appLogo} user={session.user} userName={userName} userAvatar={userAvatar} onUpdateLogo={async () => {}} onUpdateAvatar={async () => {}} onLogout={() => setIsLogoutModalOpen(true)} />}
            </Suspense>
          )}
        </div>
      </main>

      <Suspense fallback={null}>
        <PlayerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={() => {}} initialData={editingPlayer} />
        <MatchModal isOpen={isMatchModalOpen} onClose={() => setIsMatchModalOpen(false)} onSave={() => {}} initialData={editingMatch} players={players} />
        <PlayerDetailsModal logo={appLogo} isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} player={viewingPlayer} />
        <MatchDetailsModal logo={appLogo} isOpen={isMatchDetailsModalOpen} onClose={() => setIsMatchDetailsModalOpen(false)} match={viewingMatch} players={players} />
        <DeleteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={() => {}} playerName={playerToDelete?.name} />
        <DeleteMatchModal isOpen={isDeleteMatchModalOpen} onClose={() => setIsDeleteMatchModalOpen(false)} onConfirm={() => {}} matchOpponent={matchToDelete?.opponent} />
        <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} onConfirm={handleLogout} />
      </Suspense>
    </div>
  );
};

export default App;