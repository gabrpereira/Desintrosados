import React, { useMemo, useState, useEffect } from 'react';
import { Player, TeamStats, Match } from '../types';
import { MONTHLY_FEE, ICONS, DEFAULT_LOGO } from '../constants';
import { supabase } from '../services/supabase';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie 
} from 'recharts';
import { UserPlus, Calendar } from 'lucide-react';

interface DashboardProps {
  players: Player[];
  matches: Match[];
  logo: string;
  isDarkMode: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  players, 
  matches, 
  logo: initialLogo,
  isDarkMode
}) => {
  const [appLogo, setAppLogo] = useState(initialLogo || DEFAULT_LOGO);
  const [logoLoading, setLogoLoading] = useState(true);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const { data } = await supabase.from('app_config').select('logo_data').eq('id', 1).maybeSingle();
        if (data?.logo_data) setAppLogo(data.logo_data);
      } catch (e) {
        console.warn("Falha ao carregar logo no Dashboard");
      } finally {
        setLogoLoading(false);
      }
    };
    fetchLogo();
  }, []);

  const stats: TeamStats = useMemo(() => {
    const totalGoals = players.reduce((acc, p) => acc + p.goals, 0);
    const concludedMatches = matches.filter(m => m.status === 'concluido');
    const totalGames = concludedMatches.length;
    
    const fixos = players.filter(p => !p.isGuest);
    const guests = players.filter(p => p.isGuest);
    const payingPlayers = fixos.filter(p => p.monthlyFeePaid).length;
    
    return {
      totalGoals,
      totalGames,
      activePlayers: fixos.length,
      guestCount: guests.length,
      paymentRate: fixos.length > 0 ? (payingPlayers / fixos.length) * 100 : 0,
      totalRevenue: payingPlayers * MONTHLY_FEE,
      expectedRevenue: fixos.length * MONTHLY_FEE,
      paidCount: payingPlayers
    };
  }, [players, matches]);

  const nextMatch = useMemo(() => {
    return [...matches]
      .filter(m => m.status === 'agendado')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  }, [matches]);

  const lastMatch = useMemo(() => {
    const concluded = [...matches].filter(m => m.status === 'concluido');
    if (concluded.length === 0) return null;
    return concluded.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  }, [matches]);

  const chartData = useMemo(() => {
    return [...players]
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 5)
      .map(p => ({ 
        name: p.name.split(' ')[0], 
        gols: p.goals,
        type: p.isGuest ? 'Convidado' : 'Fixo'
      }));
  }, [players]);

  const financeData = [
    { name: 'Pagos', value: stats.paidCount, color: '#00B8A9' },
    { name: 'Pendentes', value: stats.activePlayers - stats.paidCount, color: '#ef4444' }
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 flex items-center justify-center">
            {logoLoading ? (
              <div className="w-10 h-10 bg-slate-200 dark:bg-white/5 rounded-xl animate-pulse"></div>
            ) : (
              <img src={appLogo} alt="Logo" className="w-full h-full object-contain drop-shadow-md" />
            )}
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-dark dark:text-white uppercase tracking-tight">Dashboard</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Temporada 2026 • DESINTROSADOS FC</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           {nextMatch && (
            <div className="bg-primary/10 dark:bg-primary text-primary dark:text-dark px-4 py-2 rounded-2xl shadow-sm flex items-center space-x-3 border border-primary/20">
              <div className="bg-primary/20 dark:bg-dark/10 p-1.5 rounded-lg">
                <Calendar size={16} />
              </div>
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Próximo Jogo</p>
                <p className="text-[10px] font-bold leading-none">{nextMatch.opponent} • {new Date(nextMatch.date).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}</p>
              </div>
            </div>
           )}
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total de Gols', val: stats.totalGoals, icon: ICONS.Stats, color: 'primary' },
          { label: 'Total de Jogos', val: stats.totalGames, icon: <Calendar size={18}/>, color: 'dark' },
          { label: 'Atletas Fixos', val: stats.activePlayers, icon: ICONS.Players, color: 'primary' },
          { label: 'Convidados', val: stats.guestCount, icon: <UserPlus size={18} />, color: 'accent' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-dark/40 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 hover:shadow-md transition-all group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${
              s.color === 'primary' ? 'bg-primary/10 text-primary' : 
              s.color === 'accent' ? 'bg-accent/10 text-accent' : 'bg-dark/20 text-dark dark:text-slate-200'
            }`}>
              {s.icon}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-xl font-black text-dark dark:text-white font-heading">{s.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-dark/40 p-6 rounded-[40px] shadow-sm border border-slate-100 dark:border-white/5 flex flex-col">
          <h3 className="font-black text-dark dark:text-slate-300 text-sm mb-6 uppercase tracking-widest">Top 5 Artilheiros</h3>
          <div className="w-full h-[320px] min-h-[320px] relative overflow-hidden bg-transparent">
            <ResponsiveContainer width="100%" height="100%" debounce={50}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1a2e2c' : '#f1f5f9'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: isDarkMode ? '#94a3b8' : '#021311' }} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                />
                <Tooltip 
                  cursor={{fill: 'rgba(0,184,169,0.05)'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: isDarkMode ? '#021311' : '#ffffff' }}
                />
                <Bar dataKey="gols" radius={[6, 6, 0, 0]} barSize={32}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.type === 'Convidado' ? '#FBCC01' : '#00B8A9'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-dark/40 p-6 rounded-[40px] shadow-sm border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center">
           <h3 className="font-black text-dark dark:text-slate-300 mb-4 text-xs uppercase tracking-widest text-center">Status Pagamentos</h3>
           <div className="w-full h-[220px] min-h-[220px] relative overflow-hidden bg-transparent">
             <ResponsiveContainer width="100%" height="100%" debounce={50}>
               <PieChart>
                 <Pie
                   data={financeData}
                   cx="50%"
                   cy="50%"
                   innerRadius={55}
                   outerRadius={75}
                   paddingAngle={5}
                   dataKey="value"
                 >
                   {financeData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Saldo em caixa: R$ {stats.totalRevenue.toFixed(0)}</p>
           <div className="mt-4 w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
              <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${stats.paymentRate}%` }}></div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {lastMatch && (
          <div className="bg-dark rounded-[40px] p-8 text-white shadow-xl relative overflow-hidden border border-white/5 flex flex-col md:flex-row items-center justify-between">
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
             
             <div className="mb-6 md:mb-0">
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">Último Resultado</h3>
               <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Partida contra {lastMatch.opponent}</p>
             </div>

             <div className="flex items-center space-x-12">
               <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2">DFC</p>
                  <p className="text-6xl font-black font-heading tracking-tighter">{lastMatch.ourScore}</p>
               </div>
               <div className="text-primary font-black text-2xl opacity-30 italic">VS</div>
               <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2">ADV</p>
                  <p className="text-6xl font-black font-heading tracking-tighter">{lastMatch.opponentScore}</p>
               </div>
             </div>
             
             <div className="hidden md:block">
               <div className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                 lastMatch.ourScore > lastMatch.opponentScore ? 'bg-primary text-dark' : 'bg-slate-800 text-slate-400'
               }`}>
                 {lastMatch.ourScore > lastMatch.opponentScore ? 'Vitória' : lastMatch.ourScore < lastMatch.opponentScore ? 'Derrota' : 'Empate'}
               </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
