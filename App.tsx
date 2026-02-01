
import React, { useState, useEffect, useCallback } from 'react';
import { Player, Match, ViewType } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PlayerList from './components/PlayerList';
import Finances from './components/Finances';
import PlayerModal from './components/PlayerModal';
import StatsView from './components/StatsView';
import DeleteModal from './components/DeleteModal';
import DeleteMatchModal from './components/DeleteMatchModal';
import PlayerDetailsModal from './components/PlayerDetailsModal';
import MatchList from './components/MatchList';
import MatchModal from './components/MatchModal';
import MatchDetailsModal from './components/MatchDetailsModal';
import UserProfile from './components/UserProfile';
import LogoutModal from './components/LogoutModal';
import Auth from './components/Auth';
import { supabase } from './services/supabase';
import { DEFAULT_LOGO } from './constants';

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
      const { data } = await supabase
        .from('app_config')
        .select('logo_data')
        .eq('id', 1)
        .maybeSingle();
      
      if (data?.logo_data) {
        setAppLogo(data.logo_data);
      }
    } catch (e) {
      console.warn("Erro ao buscar logo:", e);
    }
  }, []);

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('presidents')
        .select('full_name')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) throw error;

      if (data && data.full_name) {
        setUserName(data.full_name);
      }
    } catch (e) {
      console.error("Erro ao carregar perfil do presidente:", e);
    }
  }, []);

  const mapPlayerFromDb = (dbPlayer: any): Player => {
    const currentYearMonth = new Date().toISOString().slice(0, 7);
    const history = dbPlayer.payment_history || [];
    const isPaidThisMonth = history.includes(currentYearMonth);

    return {
      id: dbPlayer.id,
      name: dbPlayer.name,
      goals: dbPlayer.goals || 0,
      games: dbPlayer.games || 0,
      monthlyFeePaid: isPaidThisMonth,
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
      const [{ data: pData }, { data: mData }] = await Promise.all([
        supabase.from('players').select('*').order('name', { ascending: true }),
        supabase.from('matches').select('*').order('date', { ascending: false })
      ]);

      setPlayers((pData || []).map(mapPlayerFromDb));
      setMatches((mData || []).map(mapMatchFromDb));
    } catch (e) {
      console.error("Erro ao carregar dados:", e);
    } finally {
      setTimeout(() => setLoading(false), 300);
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
      } else {
        setUserName("");
        setUserAvatar("");
        setPlayers([]);
        setMatches([]);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile, fetchData, fetchAppConfig]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);
  const getPresidentName = () => userName || "Presidente";

  const handleUpdateLogo = async (newLogo: string) => {
    try {
      await supabase.from('app_config').upsert({ 
        id: 1,
        logo_data: newLogo,
        updated_by: getPresidentName(),
        updated_at: new Date().toISOString()
      });
      setAppLogo(newLogo);
    } catch (e) {
      alert("Erro ao atualizar o logo do clube.");
    }
  };

  const handleUpdateUserAvatar = async (newAvatar: string) => {
    setUserAvatar(newAvatar);
  };

  const handleConfirmLogout = async () => {
    await supabase.auth.signOut();
    setIsLogoutModalOpen(false);
  };

  const syncPlayerStats = async () => {
    try {
      const { data: concludedMatches } = await supabase
        .from('matches')
        .select('scorers, attendance')
        .eq('status', 'concluido');

      const totals: Record<string, { goals: number, games: number }> = {};
      
      concludedMatches?.forEach(match => {
        const matchScorers = match.scorers || {};
        Object.entries(matchScorers).forEach(([playerId, goals]) => {
          if (!totals[playerId]) totals[playerId] = { goals: 0, games: 0 };
          totals[playerId].goals += (goals as number);
        });
        
        const attendance = match.attendance || [];
        attendance.forEach((playerId: string) => {
          if (!totals[playerId]) totals[playerId] = { goals: 0, games: 0 };
          totals[playerId].games += 1;
        });
      });

      const updatePromises = players.map(async (p) => {
        const stats = totals[p.id] || { goals: 0, games: 0 };
        return supabase.from('players').update({
          goals: stats.goals,
          games: stats.games,
          updated_by: getPresidentName()
        }).eq('id', p.id);
      });

      await Promise.all(updatePromises);
      await fetchData(session);
    } catch (error) {
      console.error("Erro ao sincronizar estatísticas:", error);
    }
  };

  const handleSavePlayer = async (formData: Omit<Player, 'id' | 'addedAt' | 'paymentHistory'>) => {
    const presidentName = getPresidentName();
    try {
      const dbData: any = {
        name: formData.name,
        goals: formData.goals,
        games: formData.games,
        position: formData.position,
        is_guest: formData.isGuest,
        shirt_number: formData.isGuest ? null : formData.shirtNumber,
        uniform_size: formData.isGuest ? null : formData.uniformSize,
        updated_by: presidentName
      };

      if (editingPlayer) {
        await supabase.from('players').update(dbData).eq('id', editingPlayer.id);
      } else {
        await supabase.from('players').insert([dbData]);
      }
      await fetchData(session);
      setIsModalOpen(false);
    } catch (e: any) { alert(`Erro ao salvar: ${e.message}`); }
  };

  const handleTogglePayment = async (id: string, targetMonth?: string) => {
    const player = players.find(p => p.id === id);
    if (!player || player.isGuest) return;
    
    const presidentName = getPresidentName();
    const monthToToggle = targetMonth || new Date().toISOString().slice(0, 7);
    const newHistory = player.paymentHistory ? [...player.paymentHistory] : [];
    const isPaid = newHistory.includes(monthToToggle);
    
    const updatedHistory = isPaid ? newHistory.filter(m => m !== monthToToggle) : [...newHistory, monthToToggle];
    const currentYearMonth = new Date().toISOString().slice(0, 7);

    try {
      await supabase.from('players').update({ 
        monthly_fee_paid: updatedHistory.includes(currentYearMonth),
        payment_history: updatedHistory,
        updated_by: presidentName
      }).eq('id', id);
      await fetchData(session);
    } catch (e) { alert("Erro ao atualizar pagamento."); }
  };

  const handleSaveMatch = async (formData: Omit<Match, 'id'>, goalsMap?: Record<string, number>) => {
    const presidentName = getPresidentName();
    try {
      const dbData = {
        opponent: formData.opponent,
        date: formData.date,
        location: formData.location,
        our_score: formData.ourScore,
        opponent_score: formData.opponentScore,
        status: formData.status,
        scorers: goalsMap || {},
        attendance: formData.attendance || [],
        updated_by: presidentName
      };

      if (editingMatch) {
        await supabase.from('matches').update(dbData).eq('id', editingMatch.id);
      } else {
        await supabase.from('matches').insert([dbData]);
      }
      await syncPlayerStats();
      setIsMatchModalOpen(false);
    } catch (e) { alert("Erro ao salvar partida."); }
  };

  const handleDeleteMatch = async () => {
    if (!matchToDelete) return;
    try {
      await supabase.from('matches').delete().eq('id', matchToDelete.id);
      await syncPlayerStats();
      setIsDeleteMatchModalOpen(false);
    } catch (e) { alert("Erro ao excluir partida."); }
  };

  const confirmDeletePlayer = async () => {
    if (!playerToDelete) return;
    try {
      await supabase.from('players').delete().eq('id', playerToDelete.id);
      await fetchData(session);
      setIsDeleteModalOpen(false);
    } catch (e) { alert("Erro ao remover jogador."); }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#021311] flex flex-col items-center justify-center p-8">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <img src={appLogo} alt="Logo" className="w-12 h-12 object-contain grayscale opacity-30" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-primary font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Sincronizando Vestiário</p>
          <p className="text-slate-600 text-[8px] font-bold uppercase tracking-widest">Desintrosados FC • Presidência</p>
        </div>
      </div>
    );
  }

  if (!session) return <Auth logo={appLogo} />;

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark text-dark dark:text-slate-200 flex flex-col md:flex-row transition-colors duration-300">
      <Sidebar 
        logo={appLogo}
        user={session?.user} 
        userName={userName}
        userAvatar={userAvatar}
        currentView={view} 
        setView={setView} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme}
        onLogout={() => setIsLogoutModalOpen(true)}
      />
      {/* Ajustado padding top no mobile (pt-20) para dar espaço ao header fixo */}
      <main className="flex-1 md:pl-24 pt-20 md:pt-12 pb-12 transition-all duration-300 min-h-screen p-4 md:p-12 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
               <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
               <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Atualizando dados do clube...</p>
            </div>
          ) : (
            <>
              {view === 'dashboard' && <Dashboard logo={appLogo} players={players} matches={matches} isDarkMode={isDarkMode} />}
              {view === 'players' && <PlayerList players={players} onEdit={(p) => { setEditingPlayer(p); setIsModalOpen(true); }} onView={(p) => { setViewingPlayer(p); setIsDetailsModalOpen(true); }} onDelete={(id) => { const player = players.find(p => id === p.id); if (player) { setPlayerToDelete(player); setIsDeleteModalOpen(true); } }} onAdd={() => { setEditingPlayer(undefined); setIsModalOpen(true); }} />}
              {view === 'matches' && <MatchList matches={matches} players={players} onAdd={() => { setEditingMatch(undefined); setIsMatchModalOpen(true); }} onEdit={(m) => { setEditingMatch(m); setIsMatchModalOpen(true); }} onView={(m) => { setViewingMatch(m); setIsMatchDetailsModalOpen(true); }} onDelete={(id) => { const match = matches.find(m => m.id === id); if (match) { setMatchToDelete(match); setIsDeleteMatchModalOpen(true); } }} />}
              {view === 'finances' && <Finances players={players} onTogglePayment={handleTogglePayment} />}
              {view === 'stats' && <StatsView players={players} isDarkMode={isDarkMode} />}
              {view === 'profile' && (
                <UserProfile 
                  logo={appLogo} 
                  onUpdateLogo={handleUpdateLogo} 
                  user={session?.user} 
                  userName={userName} 
                  userAvatar={userAvatar}
                  onUpdateAvatar={handleUpdateUserAvatar}
                  onLogout={() => setIsLogoutModalOpen(true)}
                />
              )}
            </>
          )}
        </div>
      </main>

      <PlayerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSavePlayer} initialData={editingPlayer} />
      <MatchModal isOpen={isMatchModalOpen} onClose={() => setIsMatchModalOpen(false)} onSave={handleSaveMatch} initialData={editingMatch} players={players} />
      <PlayerDetailsModal logo={appLogo} isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} player={viewingPlayer} />
      <MatchDetailsModal logo={appLogo} isOpen={isMatchDetailsModalOpen} onClose={() => setIsMatchDetailsModalOpen(false)} match={viewingMatch} players={players} />
      <DeleteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDeletePlayer} playerName={playerToDelete?.name} />
      <DeleteMatchModal isOpen={isDeleteMatchModalOpen} onClose={() => setIsDeleteMatchModalOpen(false)} onConfirm={handleDeleteMatch} matchOpponent={matchToDelete?.opponent} />
      <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} onConfirm={handleConfirmLogout} />
    </div>
  );
};

export default App;
