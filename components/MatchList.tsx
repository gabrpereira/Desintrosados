
import React, { useMemo } from 'react';
import { Match, Player } from '../types';
import { ICONS } from '../constants';
import { Calendar, MapPin, Clock, Edit3, Trash2, Maximize2, ChevronRight, ShieldCheck } from 'lucide-react';

interface MatchListProps {
  matches: Match[];
  players: Player[];
  onAdd: () => void;
  onEdit: (match: Match) => void;
  onView: (match: Match) => void;
  onDelete: (id: string) => void;
}

const MatchList: React.FC<MatchListProps> = ({ matches, players, onAdd, onEdit, onView, onDelete }) => {
  const groupedMatches = useMemo(() => {
    const groups: Record<string, Match[]> = {};
    
    [...matches]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .forEach(match => {
        const date = new Date(match.date);
        const monthYear = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
        const key = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
        
        if (!groups[key]) groups[key] = [];
        groups[key].push(match);
      });
      
    return groups;
  }, [matches]);

  const handleDeleteClick = (e: React.MouseEvent, matchId: string) => {
    e.stopPropagation();
    onDelete(matchId);
  };

  const handleEditClick = (e: React.MouseEvent, match: Match) => {
    e.stopPropagation();
    onEdit(match);
  };

  const getResultBadge = (match: Match) => {
    if (match.status !== 'concluido') return null;
    
    if (match.ourScore > match.opponentScore) {
      return <span className="bg-primary/20 text-primary px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border border-primary/20">Vitória</span>;
    } else if (match.ourScore < match.opponentScore) {
      return <span className="bg-red-500/20 text-red-500 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border border-red-500/20">Derrota</span>;
    }
    return <span className="bg-slate-500/20 text-slate-400 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border border-slate-500/20">Empate</span>;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-dark dark:text-white uppercase tracking-tight">Partidas</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Calendário e resultados do Desintrosados FC.</p>
        </div>
        <button 
          onClick={onAdd}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-primary text-dark px-6 py-4 sm:py-3 rounded-xl font-black uppercase tracking-widest hover:bg-secondary hover:text-white shadow-lg shadow-primary/20 active:scale-95 transition-all text-xs"
        >
          {ICONS.Plus}
          <span>Marcar Jogo</span>
        </button>
      </div>

      {Object.keys(groupedMatches).length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-dark/40 rounded-3xl border border-dashed border-slate-200 dark:border-white/10">
          <div className="w-16 h-16 bg-slate-50 dark:bg-dark/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300 dark:text-slate-700">
            <Calendar size={32} />
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-bold">Nenhuma partida agendada.</p>
          <button onClick={onAdd} className="mt-4 text-primary font-black text-xs uppercase tracking-widest hover:underline">Cadastrar agora</button>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(groupedMatches).map(([month, monthMatches]) => (
            <section key={month} className="space-y-6">
              <div className="flex items-center space-x-4">
                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-dark dark:text-slate-300 whitespace-nowrap">{month}</h3>
                <div className="h-px bg-slate-100 dark:bg-white/5 w-full"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(monthMatches as Match[]).map(match => (
                  <div 
                    key={match.id} 
                    onClick={() => onView(match)}
                    className="bg-white dark:bg-dark/40 rounded-3xl p-6 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden group cursor-pointer active:scale-[0.98]"
                  >
                    <div className={`absolute top-0 right-0 w-1.5 h-full ${
                      match.status === 'concluido' ? 'bg-primary' : match.status === 'cancelado' ? 'bg-red-500' : 'bg-accent'
                    }`}></div>

                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <Calendar size={12} className="text-primary" />
                          <span>{new Date(match.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <MapPin size={12} className="text-primary" />
                          <span className="truncate max-w-[120px] sm:max-w-[140px]">{match.location}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {getResultBadge(match)}
                        {match.status === 'cancelado' && (
                          <span className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">Cancelado</span>
                        )}
                        {match.status === 'agendado' && (
                          <span className="bg-accent/10 text-accent px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">Agendado</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-slate-50 dark:bg-dark/50 p-4 rounded-2xl mb-4">
                      <div className="flex flex-col items-center flex-1 text-center">
                        <div className="w-10 h-10 bg-primary text-dark rounded-xl flex items-center justify-center font-black text-xs mb-2 shadow-sm shrink-0">DFC</div>
                        <span className="text-[9px] font-black text-dark dark:text-slate-200 uppercase tracking-tighter truncate w-full px-1">Desintrosados</span>
                      </div>
                      
                      <div className="flex flex-col items-center px-4 shrink-0">
                        <div className="text-2xl font-black text-dark dark:text-white font-heading">
                          {match.status === 'agendado' ? 'vs' : `${match.ourScore} - ${match.opponentScore}`}
                        </div>
                        {match.status === 'agendado' && (
                          <span className="text-[9px] font-bold text-accent flex items-center mt-1">
                            <Clock size={10} className="mr-1" />
                            {new Date(match.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col items-center flex-1 text-center">
                        <div className="w-10 h-10 bg-dark dark:bg-slate-800 text-white rounded-xl flex items-center justify-center font-black text-xs mb-2 shadow-sm border border-white/5 shrink-0">ADV</div>
                        <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter truncate w-full px-1">{match.opponent}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex flex-col">
                        <div className="flex items-center text-[8px] font-black text-primary uppercase tracking-widest sm:opacity-0 group-hover:opacity-100 transition-opacity">
                           <Maximize2 size={10} className="mr-1" />
                           Ver Detalhes
                           <ChevronRight size={10} className="ml-1 sm:hidden" />
                        </div>
                        {match.updatedBy && (
                          <div className="flex items-center space-x-1 mt-1 text-[7px] font-black text-slate-400 uppercase opacity-60">
                             <ShieldCheck size={8} />
                             <span className="truncate max-w-[80px]">Resp: {match.updatedBy}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <button 
                          type="button"
                          onClick={(e) => handleEditClick(e, match)}
                          className="p-3 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                          aria-label="Editar"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => handleDeleteClick(e, match.id)}
                          className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                          aria-label="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchList;
