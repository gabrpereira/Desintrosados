import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Player, Match, ViewType } from './types';
import Sidebar from './components/Sidebar';
import { supabase } from './services/supabase';
import { DEFAULT_LOGO } from './constants';

// Carregamento Tardio (Lazy Loading)
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
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
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
    } catch (e) { console.warn("Erro ao buscar logo:", e); }
  }, []);

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase.from('presidents').select('full_name').eq('id', userId).maybeSingle();
      if (data?.full_name) setUserName(data.full_name);
    } catch (e) { console.error("Erro ao carregar perfil:", e); }
  }, []);

  const mapPlayerFromDb = (dbPlayer: any): Player => {
    const currentYearMonth = new Date().toISOString().slice(0, 7);
    const history = dbPlayer.payment_history || [];
    return {
      id: dbPlayer.id,
      name: dbPlayer.name,
      goals: dbPlayer.goals || 0,
      games: dbPlayer.games || 0,
      monthlyFeePaid: history.includes(currentYearMonth),
      position: dbPlayer.position,
      shirtNumber: dbPlayer.shirt_number || 0,
      uniformSize: dbPlayer.uniform_size || 'M',
      isGuest: dbPlayer.is_guest || false,
      addedAt: dbPlayer.added_at,
      paymentHistory: history,
      updatedBy: dbPlayer.updated_by
    };
  };

  const mapMatchFromDb = (dbMatch: any): Match => ({
    id: dbMatch.id,
    opponent: dbMatch.opponent,
    date: dbMatch.date,
    location: dbMatch.location,
    ourScore: dbMatch.our_score || 0,
    opponentScore: dbMatch.opponent_score || 0,
    status: dbMatch.status,
    scorers: dbMatch.scorers || {},
    attendance: dbMatch.attendance || [],
    updatedBy: dbMatch.updated_by
  });

  const fetchData = useCallback(async (currentSession: any) => {
    if (!currentSession) return;
    setLoading(true);
    try {
      const [{ data: pData, error: pError }, { data: mData, error: mError }] = await Promise.all([
        supabase.from('players').select('*').order('name', { ascending: true }),
        supabase.from('matches').select('*').order('date', { ascending: false })
      ]);

      console.log('Dados Jogadores:', pData, 'Erro:', pError);
      console.log('Dados Partidas:', mData, 'Erro:', mError);

      setPlayers((pData || []).map(mapPlayerFromDb));
      setMatches((mData || []).map(mapMatchFromDb));
    } catch (e) {
      console.error("Erro fatal ao carregar dados:", e);
    } finally {
      setLoading(false);
    }
  }, []);

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
      }
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
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-primary font-black uppercase tracking-[0.4em] text-[10px]">Autenticando...</p>
      </div>
    );
  }

  if (!session) return <Suspense fallback={<ViewLoader />}><Auth logo={appLogo} /></Suspense>;

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark flex flex-col md:flex-row">
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
      
      <main className="flex-1 md:pl-24 pt-20 md:pt-12 p-4 md:p-12">
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
        <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} onConfirm={async () => { await supabase.auth.signOut(); setIsLogoutModalOpen(false); }} />
      </Suspense>
    </div>
  );
};

export default App;