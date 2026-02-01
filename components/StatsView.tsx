
import React, { useMemo } from 'react';
import { Player } from '../types';
import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell } from 'recharts';

interface StatsViewProps {
  players: Player[];
  isDarkMode: boolean;
}

const StatsView: React.FC<StatsViewProps> = ({ players, isDarkMode }) => {
  const topScorers = useMemo(() => 
    [...players].sort((a, b) => b.goals - a.goals).slice(0, 5), 
  [players]);

  const mostGames = useMemo(() => 
    [...players].sort((a, b) => b.games - a.games).slice(0, 5), 
  [players]);

  const positionData = useMemo(() => {
    const counts: Record<string, number> = {};
    players.forEach(p => {
      counts[p.position] = (counts[p.position] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [players]);

  const COLORS = ['#00B8A9', '#FBCC01', '#00635B', '#4ade80', '#cbd5e1'];

  if (players.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-dark/40 rounded-3xl border border-dashed border-slate-200 dark:border-white/10 animate-in fade-in">
        <h2 className="text-xl font-black text-dark dark:text-white uppercase tracking-widest">Sem dados disponíveis</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Cadastre jogadores para gerar o scout do time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold font-heading text-dark dark:text-white uppercase tracking-tight">Scout Técnico</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Análise de performance individual e coletiva.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ranking de Gols */}
        <div className="bg-white dark:bg-dark/40 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5">
          <h3 className="font-black text-dark dark:text-slate-300 mb-6 uppercase text-xs tracking-[0.2em] border-l-4 border-accent pl-4">Os Matadores</h3>
          <div className="space-y-4">
            {topScorers.map((p, idx) => (
              <div key={p.id} className="flex items-center justify-between group">
                <div className="flex items-center space-x-4">
                  <span className={`w-6 text-sm font-black ${idx === 0 ? 'text-accent' : 'text-slate-200 dark:text-slate-700'}`}>#{idx + 1}</span>
                  <div className="w-9 h-9 rounded-xl bg-dark dark:bg-slate-800 text-white flex items-center justify-center font-black text-xs border-b-2 border-primary/40">
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-dark dark:text-slate-200">{p.name}</p>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">{p.position}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-primary font-mono">{p.goals}</p>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">Gols</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ranking de Jogos */}
        <div className="bg-white dark:bg-dark/40 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5">
          <h3 className="font-black text-dark dark:text-slate-300 mb-6 uppercase text-xs tracking-[0.2em] border-l-4 border-primary pl-4">Mais Jogos</h3>
          <div className="space-y-4">
            {mostGames.map((p, idx) => (
              <div key={p.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="w-6 text-sm font-black text-slate-200 dark:text-slate-700">#{idx + 1}</span>
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-xs text-dark dark:text-white">
                    {p.name.charAt(0)}
                  </div>
                  <p className="text-sm font-bold text-dark dark:text-slate-200">{p.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-dark dark:text-white opacity-40 dark:opacity-60 font-mono">{p.games}</p>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">Partidas</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distribuição por Posição */}
        <div className="bg-white dark:bg-dark/40 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 flex flex-col">
          <h3 className="font-black text-dark dark:text-slate-300 mb-2 uppercase text-xs tracking-[0.2em]">Formação do Elenco</h3>
          <div className="w-full h-[280px] min-h-[280px] relative overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={positionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {positionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#021311' : '#ffffff', border: 'none', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-2 shrink-0">
             {positionData.map((entry, index) => (
               <div key={index} className="flex items-center space-x-1.5">
                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{entry.name}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Média de Gols por Jogo */}
        <div className="bg-dark rounded-[32px] shadow-2xl flex flex-col justify-center relative overflow-hidden border border-white/5 p-8">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <h3 className="text-primary font-black mb-6 uppercase text-xs tracking-[0.3em]">Eficiência Ofensiva</h3>
          <div className="space-y-6 relative z-10">
            <div className="flex items-end space-x-3 text-white">
              <span className="text-7xl font-black font-heading leading-none">
                {(players.reduce((a, b) => a + b.goals, 0) / (players.reduce((a, b) => a + b.games, 0) || 1)).toFixed(2)}
              </span>
              <div className="mb-2">
                 <p className="text-accent font-black text-sm uppercase tracking-widest">Gols / Jogo</p>
                 <p className="text-slate-500 text-[10px] font-bold uppercase">Média Geral do Time</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed italic border-l-2 border-primary/30 pl-4">
              "Dados reais baseados em cada minuto jogado pelos atletas do Desintrosados FC nesta temporada."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsView;
