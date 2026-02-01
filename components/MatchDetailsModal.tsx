
import React from 'react';
import { Match, Player } from '../types';
import { X, Calendar, MapPin, Trophy, Clock, Swords, CheckCircle2, Users, ShieldCheck, Share2 } from 'lucide-react';

interface MatchDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  match?: Match;
  players: Player[];
  logo: string;
}

const MatchDetailsModal: React.FC<MatchDetailsModalProps> = ({ isOpen, onClose, match, players, logo }) => {
  if (!isOpen || !match) return null;

  const dateStr = new Date(match.date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  
  const timeStr = new Date(match.date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const attendingPlayers = players.filter(p => match.attendance?.includes(p.id));
  const groupedAttendance = attendingPlayers.reduce((acc, p) => {
    if (!acc[p.position]) acc[p.position] = [];
    acc[p.position].push(p);
    return acc;
  }, {} as Record<string, Player[]>);

  const POSITIONS_ORDER = ['Goleiro', 'Zagueiro', 'Meio-Campo', 'Atacante'];

  const handleWhatsAppShare = () => {
    const statusText = match.status === 'agendado' ? '*PRÓXIMO JOGO*' : '*RESULTADO DO JOGO*';
    const scoreText = match.status === 'concluido' 
      ? `\n🏆 *Placar:* Desintrosados ${match.ourScore} x ${match.opponentScore} ${match.opponent}` 
      : '';
    
    const text = `${statusText}
⚽ *Adversário:* ${match.opponent}
📅 *Data:* ${dateStr}
⏰ *Hora:* ${timeStr}
📍 *Local:* ${match.location}${scoreText}

_Enviado via Gestão Desintrosados FC_`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 bg-dark/95 backdrop-blur-xl flex items-center justify-center z-[200] p-0 sm:p-4 transition-all duration-500"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-dark w-full max-w-3xl h-full sm:h-auto sm:max-h-[90vh] sm:rounded-[48px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border dark:border-white/10 flex flex-col">
        <div className="relative p-8 sm:p-12 bg-dark text-white text-center shrink-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary rounded-full blur-[100px]"></div>
             <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-accent rounded-full blur-[100px]"></div>
          </div>

          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all z-30"
          >
            <X size={24} />
          </button>

          <div className="relative z-10 flex flex-col items-center">
            <div className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 mb-8 sm:mb-10">
              <Swords size={14} className="text-primary" />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-slate-300">Sumário da Partida</span>
            </div>

            <div className="grid grid-cols-3 items-center w-full gap-2 sm:gap-8">
               <div className="flex flex-col items-center">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-primary text-dark rounded-[24px] sm:rounded-[32px] flex items-center justify-center font-black text-xl sm:text-3xl shadow-2xl shadow-primary/20 mb-3 border-4 border-white/10">
                    DFC
                  </div>
                  <span className="text-[10px] sm:text-xs font-black uppercase text-primary tracking-widest hidden sm:block">Desintrosados</span>
               </div>

               <div className="flex flex-col items-center">
                  <div className="text-5xl sm:text-7xl md:text-8xl font-black font-heading tracking-tighter tabular-nums flex items-center space-x-2 sm:space-x-4">
                    {match.status === 'agendado' ? (
                      <span className="text-3xl sm:text-5xl opacity-20">VS</span>
                    ) : (
                      <>
                        <span>{match.ourScore}</span>
                        <span className="text-2xl sm:text-4xl opacity-30 font-light">-</span>
                        <span>{match.opponentScore}</span>
                      </>
                    )}
                  </div>
                  {match.status === 'concluido' && (
                    <div className={`mt-4 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 ${
                      match.ourScore > match.opponentScore ? 'bg-primary text-dark' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {match.ourScore > match.opponentScore && <CheckCircle2 size={12} />}
                      <span>{match.ourScore > match.opponentScore ? 'Vitória' : match.ourScore < match.opponentScore ? 'Derrota' : 'Empate'}</span>
                    </div>
                  )}
               </div>

               <div className="flex flex-col items-center">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-slate-800 text-white rounded-[24px] sm:rounded-[32px] flex items-center justify-center font-black text-xl sm:text-3xl shadow-xl mb-3 border-4 border-white/5">
                    ADV
                  </div>
                  <span className="text-[10px] sm:text-xs font-black uppercase text-slate-400 tracking-widest truncate max-w-[80px] sm:max-w-none">{match.opponent}</span>
               </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-6 sm:p-10 space-y-8 bg-slate-50 dark:bg-dark">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-4 bg-white dark:bg-white/5 p-4 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm">
                 <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><Calendar size={18} /></div>
                 <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Data</p>
                    <p className="text-xs font-bold text-dark dark:text-slate-200">{dateStr}</p>
                 </div>
              </div>
              <div className="flex items-center space-x-4 bg-white dark:bg-white/5 p-4 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm">
                 <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><Clock size={18} /></div>
                 <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Início</p>
                    <p className="text-xs font-bold text-dark dark:text-slate-200">{timeStr}</p>
                 </div>
              </div>
              <div className="flex items-center space-x-4 bg-white dark:bg-white/5 p-4 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm">
                 <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><MapPin size={18} /></div>
                 <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Local</p>
                    <p className="text-xs font-bold text-dark dark:text-slate-200 truncate max-w-[120px]">{match.location}</p>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-3 text-dark dark:text-white">
                  <Users size={18} className="text-primary" />
                  <h4 className="text-xs font-black uppercase tracking-[0.2em]">Atletas Presentes ({attendingPlayers.length})</h4>
                </div>
                
                <div className="space-y-6">
                  {attendingPlayers.length === 0 ? (
                    <div className="p-10 text-center bg-slate-100 dark:bg-white/5 rounded-3xl border border-dashed border-slate-300 dark:border-white/10">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nenhum atleta relacionado</p>
                    </div>
                  ) : (
                    POSITIONS_ORDER.map(pos => {
                      const playersInPos = groupedAttendance[pos];
                      if (!playersInPos) return null;
                      return (
                        <div key={pos} className="space-y-2">
                           <p className="text-[9px] font-black text-primary uppercase tracking-widest pl-2 border-l-2 border-primary/30">{pos}</p>
                           <div className="grid grid-cols-1 gap-2">
                              {playersInPos.map(p => (
                                <div key={p.id} className="bg-white dark:bg-white/5 p-3 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-white/5 shadow-sm">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-dark text-white rounded-lg flex items-center justify-center font-black text-[10px]">{p.shirtNumber || p.name.charAt(0)}</div>
                                    <p className="text-xs font-bold text-dark dark:text-slate-200">{p.name}</p>
                                  </div>
                                  {p.isGuest && <span className="text-[8px] font-black text-accent bg-accent/10 px-2 py-0.5 rounded uppercase">Convidado</span>}
                                </div>
                              ))}
                           </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-3 text-dark dark:text-white">
                  <Trophy size={18} className="text-accent" />
                  <h4 className="text-xs font-black uppercase tracking-[0.2em]">Scout de Gols</h4>
                </div>

                <div className="grid grid-cols-1 gap-2">
                   {!match.scorers || Object.keys(match.scorers).length === 0 ? (
                     <div className="py-10 text-center bg-slate-100 dark:bg-white/5 rounded-3xl border border-dashed border-slate-300 dark:border-white/10">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sem gols registrados</p>
                     </div>
                   ) : (
                     Object.entries(match.scorers).map(([playerId, goals]) => {
                       const player = players.find(p => p.id === playerId);
                       return (
                         <div key={playerId} className="flex items-center justify-between bg-white dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm">
                            <div className="flex items-center space-x-4">
                               <div className="w-10 h-10 rounded-xl bg-dark text-white flex items-center justify-center font-black text-xs border-b-2 border-primary/30">
                                  {player?.shirtNumber || player?.name.charAt(0)}
                               </div>
                               <div>
                                  <p className="text-sm font-bold text-dark dark:text-slate-200">{player?.name}</p>
                                  <p className="text-[10px] text-primary font-black uppercase tracking-widest">{player?.position}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 bg-primary/10 text-primary px-3 py-1.5 rounded-xl">
                               <span className="text-sm font-black">{goals}</span>
                               <span className="text-sm">⚽</span>
                            </div>
                         </div>
                       )
                     })
                   )}
                </div>
              </div>
           </div>

           <div className="pt-4 pb-8 sm:pb-0 space-y-4">
             {match.updatedBy && (
                <div className="flex items-center justify-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-100 dark:bg-white/5 p-3 rounded-2xl border border-dashed border-slate-300 dark:border-white/10">
                  <ShieldCheck size={12} className="text-primary" />
                  <span>Assinado por: {match.updatedBy}</span>
                </div>
             )}

             <div className="flex gap-3">
               <button 
                 onClick={handleWhatsAppShare}
                 className="flex-1 py-5 bg-[#25D366] text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#128C7E] transition-all active:scale-95 shadow-xl shadow-[#25D366]/20 flex items-center justify-center gap-2"
               >
                 <Share2 size={16} />
                 Enviar p/ WhatsApp
               </button>
               <button 
                 onClick={onClose}
                 className="flex-1 py-5 bg-dark text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-900 transition-all active:scale-95 shadow-2xl shadow-dark/20 border border-white/5"
               >
                 Fechar Detalhes
               </button>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MatchDetailsModal;
