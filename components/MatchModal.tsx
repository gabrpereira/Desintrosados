
import React, { useState, useEffect, useMemo } from 'react';
import { Match, Player } from '../types';
import { X, Plus, Minus, Trophy, Search, Users, CheckCircle2 } from 'lucide-react';

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (match: Omit<Match, 'id'>, goalsMap?: Record<string, number>) => void;
  initialData?: Match;
  players: Player[];
}

const MatchModal: React.FC<MatchModalProps> = ({ isOpen, onClose, onSave, initialData, players }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'convocados' | 'scout'>('info');
  const [formData, setFormData] = useState<Omit<Match, 'id'>>({
    opponent: '',
    date: new Date().toISOString().slice(0, 16),
    location: '',
    ourScore: 0,
    opponentScore: 0,
    status: 'agendado',
    attendance: []
  });

  const [playerSearch, setPlayerSearch] = useState('');
  const [matchGoals, setMatchGoals] = useState<Record<string, number>>({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          opponent: initialData.opponent,
          date: new Date(initialData.date).toISOString().slice(0, 16),
          location: initialData.location,
          ourScore: initialData.ourScore,
          opponentScore: initialData.opponentScore,
          status: initialData.status,
          attendance: initialData.attendance || []
        });
        setMatchGoals(initialData.scorers || {});
      } else {
        setFormData({
          opponent: '',
          date: new Date().toISOString().slice(0, 16),
          location: 'Arena Igapó',
          ourScore: 0,
          opponentScore: 0,
          status: 'agendado',
          attendance: []
        });
        setMatchGoals({});
      }
      setPlayerSearch('');
      setActiveTab('info');
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    if (formData.status === 'concluido') {
      const totalGoals = Object.values(matchGoals).reduce((acc: number, curr: number) => acc + curr, 0);
      setFormData(prev => ({ ...prev, ourScore: totalGoals }));
    }
  }, [matchGoals, formData.status]);

  const filteredPlayers = useMemo(() => {
    return players.filter(p => 
      p.name.toLowerCase().includes(playerSearch.toLowerCase()) ||
      (p.shirtNumber && p.shirtNumber.toString().includes(playerSearch))
    );
  }, [players, playerSearch]);

  const handleToggleAttendance = (playerId: string) => {
    setFormData(prev => {
      const currentAttendance = prev.attendance || [];
      if (currentAttendance.includes(playerId)) {
        // Se remover do attendance, também remove do scout se existir
        const { [playerId]: _, ...restScorers } = matchGoals;
        setMatchGoals(restScorers);
        return { ...prev, attendance: currentAttendance.filter(id => id !== playerId) };
      } else {
        return { ...prev, attendance: [...currentAttendance, playerId] };
      }
    });
  };

  const handleGoalChange = (playerId: string, delta: number) => {
    setMatchGoals(prev => {
      const current = prev[playerId] || 0;
      const newValue = Math.max(0, current + delta);
      if (newValue === 0) {
        const { [playerId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [playerId]: newValue };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, formData.status === 'concluido' ? matchGoals : undefined);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm flex items-center justify-center z-[130] p-0 sm:p-4">
      <div className="bg-white dark:bg-dark sm:rounded-[32px] w-full max-w-xl h-full sm:h-auto shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border dark:border-white/10 flex flex-col sm:max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 sm:p-8 bg-dark text-white relative shrink-0">
          <h2 className="text-xl sm:text-2xl font-black font-heading uppercase tracking-tight">
            {initialData ? 'Editar Partida' : 'Agendar Partida'}
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-medium">Gestão tática do DESINTROSADOS FC.</p>
          <button 
            onClick={onClose}
            className="absolute top-6 sm:top-8 right-6 sm:right-8 text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-100 dark:bg-dark/80 p-1 mx-6 sm:mx-8 mt-4 rounded-2xl shrink-0">
           <button 
             type="button"
             onClick={() => setActiveTab('info')}
             className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'info' ? 'bg-white dark:bg-primary text-primary dark:text-dark shadow-sm' : 'text-slate-500'}`}
           >
             Info
           </button>
           <button 
             type="button"
             onClick={() => setActiveTab('convocados')}
             className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all relative ${activeTab === 'convocados' ? 'bg-white dark:bg-primary text-primary dark:text-dark shadow-sm' : 'text-slate-500'}`}
           >
             Escalação
             {formData.attendance && formData.attendance.length > 0 && (
               <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-dark text-[8px] flex items-center justify-center rounded-full border border-white">
                 {formData.attendance.length}
               </span>
             )}
           </button>
           {formData.status === 'concluido' && (
             <button 
               type="button"
               onClick={() => setActiveTab('scout')}
               className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'scout' ? 'bg-white dark:bg-primary text-primary dark:text-dark shadow-sm' : 'text-slate-500'}`}
             >
               Scout
             </button>
           )}
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar p-6 sm:p-8">
          {activeTab === 'info' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Adversário</label>
                <input
                  required
                  type="text"
                  value={formData.opponent}
                  onChange={(e) => setFormData({ ...formData, opponent: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-dark/50 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white font-bold"
                  placeholder="Ex: Amigos do Bar"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Data e Hora</label>
                  <input
                    required
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-dark/50 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Local</label>
                  <input
                    required
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-dark/50 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white font-bold"
                    placeholder="Arena Gol"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status da Partida</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['agendado', 'concluido', 'cancelado'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData({...formData, status: s})}
                      className={`py-3 px-1 rounded-xl text-[10px] font-black uppercase tracking-tighter border transition-all ${
                        formData.status === s 
                          ? 'bg-primary border-primary text-dark shadow-lg shadow-primary/20' 
                          : 'bg-white dark:bg-dark/40 border-slate-100 dark:border-white/5 text-slate-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {formData.status === 'concluido' && (
                <div className="p-4 sm:p-6 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/10 text-center">
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">Placar Adversário</p>
                  <div className="flex items-center justify-center space-x-6">
                    <div className="text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-2">DFC</p>
                      <div className="w-16 h-14 bg-white dark:bg-dark rounded-xl flex items-center justify-center text-3xl font-black text-primary border-2 border-primary/20">
                        {formData.ourScore}
                      </div>
                    </div>
                    <span className="text-2xl font-black text-primary mt-6">X</span>
                    <div className="text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-2">ADV</p>
                      <input
                        type="number"
                        min="0"
                        value={formData.opponentScore}
                        onChange={(e) => setFormData({ ...formData, opponentScore: parseInt(e.target.value) || 0 })}
                        className="w-16 h-14 text-center text-3xl font-black bg-white dark:bg-dark border-2 border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none dark:text-white shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'convocados' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                  <Users size={12} className="mr-2 text-primary" />
                  Relacionar Jogadores
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input 
                    type="text"
                    placeholder="Buscar..."
                    value={playerSearch}
                    onChange={(e) => setPlayerSearch(e.target.value)}
                    className="pl-9 pr-3 py-2 bg-slate-100 dark:bg-dark/80 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold outline-none dark:text-white w-32 sm:w-48"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto no-scrollbar bg-slate-50 dark:bg-dark/50 p-3 rounded-2xl border border-slate-100 dark:border-white/5">
                {filteredPlayers.map(player => {
                  const isAttending = formData.attendance?.includes(player.id);
                  return (
                    <div 
                      key={player.id} 
                      onClick={() => handleToggleAttendance(player.id)}
                      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border-2 ${
                        isAttending 
                          ? 'bg-primary/10 border-primary/20 text-primary' 
                          : 'bg-white dark:bg-white/5 border-transparent hover:border-slate-100 dark:hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${
                          isAttending ? 'bg-primary text-dark' : 'bg-dark dark:bg-slate-800 text-white'
                        }`}>
                          {player.shirtNumber || player.name.charAt(0)}
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${isAttending ? 'text-primary' : 'text-dark dark:text-slate-200'}`}>{player.name}</p>
                          <p className="text-[8px] font-black uppercase tracking-tighter text-slate-400">{player.position} {player.isGuest ? '• Convidado' : ''}</p>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isAttending ? 'bg-primary border-primary text-dark' : 'border-slate-200 dark:border-white/10'
                      }`}>
                        {isAttending && <CheckCircle2 size={14} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'scout' && (
            <div className="space-y-4 animate-in fade-in duration-300">
               <div className="flex items-center space-x-2 text-primary">
                 <Trophy size={16} />
                 <h4 className="text-[10px] font-black uppercase tracking-widest">Artilharia da Partida</h4>
               </div>
               
               <div className="grid grid-cols-1 gap-2 bg-slate-50 dark:bg-dark/50 p-3 rounded-2xl border border-slate-100 dark:border-white/5">
                 {formData.attendance?.length === 0 ? (
                   <p className="py-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Selecione os convocados primeiro</p>
                 ) : (
                   formData.attendance?.map(playerId => {
                     const player = players.find(p => p.id === playerId);
                     if (!player) return null;
                     return (
                       <div key={playerId} className="flex items-center justify-between p-3 bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm">
                         <div className="flex items-center space-x-3">
                           <div className="w-8 h-8 bg-dark text-white rounded-lg flex items-center justify-center font-black text-[10px]">{player.shirtNumber || player.name.charAt(0)}</div>
                           <p className="text-xs font-bold text-dark dark:text-slate-200">{player.name}</p>
                         </div>
                         <div className="flex items-center space-x-3">
                           <button 
                             type="button" 
                             onClick={() => handleGoalChange(playerId, -1)}
                             className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-dark rounded-lg text-slate-500 hover:text-red-500 transition-colors"
                           >
                             <Minus size={14} />
                           </button>
                           <span className="text-sm font-black text-primary w-4 text-center">{matchGoals[playerId] || 0}</span>
                           <button 
                             type="button" 
                             onClick={() => handleGoalChange(playerId, 1)}
                             className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-dark rounded-lg text-slate-500 hover:text-primary transition-colors"
                           >
                             <Plus size={14} />
                           </button>
                         </div>
                       </div>
                     )
                   })
                 )}
               </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex space-x-3 pt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-xs hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-4 bg-primary text-dark font-black uppercase tracking-widest text-xs hover:bg-secondary hover:text-white rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95"
            >
              {initialData ? 'Atualizar' : 'Salvar Partida'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MatchModal;
