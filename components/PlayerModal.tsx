
import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { POSITIONS, UNIFORM_SIZES } from '../constants';
import { X, User, Shirt, Hash, Trophy } from 'lucide-react';

interface PlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (player: Omit<Player, 'id' | 'addedAt'>) => void;
  initialData?: Player;
}

const PlayerModal: React.FC<PlayerModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Omit<Player, 'id' | 'addedAt'>>({
    name: '',
    goals: 0,
    games: 0,
    monthlyFeePaid: false,
    position: 'Meio-Campo',
    shirtNumber: 1,
    uniformSize: 'M',
    isGuest: false
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name,
          goals: initialData.goals,
          games: initialData.games,
          monthlyFeePaid: initialData.monthlyFeePaid,
          position: initialData.position,
          shirtNumber: initialData.shirtNumber || 1,
          uniformSize: initialData.uniformSize || 'M',
          isGuest: initialData.isGuest || false
        });
      } else {
        setFormData({
          name: '',
          goals: 0,
          games: 0,
          monthlyFeePaid: false,
          position: 'Meio-Campo',
          shirtNumber: 1,
          uniformSize: 'M',
          isGuest: false
        });
      }
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      shirtNumber: formData.isGuest ? 0 : formData.shirtNumber,
      uniformSize: formData.isGuest ? 'M' : formData.uniformSize,
      monthlyFeePaid: formData.isGuest ? false : formData.monthlyFeePaid
    };
    onSave(dataToSave);
  };

  return (
    <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm flex items-center justify-center z-[130] p-0 sm:p-4">
      <div className="bg-white dark:bg-dark sm:rounded-[32px] w-full max-w-md h-full sm:h-auto shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border dark:border-white/10 flex flex-col sm:max-h-[90vh]">
        <div className="p-6 sm:p-8 bg-primary text-dark relative shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-dark/5 hover:bg-dark/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center space-x-3 mb-1">
            <User size={20} className="opacity-60" />
            <h2 className="text-xl font-black font-heading uppercase tracking-tight">
              {initialData ? 'Editar Atleta' : 'Novo Atleta'}
            </h2>
          </div>
          <p className="text-dark/60 text-xs font-bold uppercase tracking-widest">
            {formData.isGuest ? 'Convidado Externo' : 'Mensalista Fixo'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar p-6 sm:p-8 space-y-6">
          <div className="flex bg-slate-100 dark:bg-dark/80 p-1 rounded-2xl">
             <button 
               type="button"
               onClick={() => setFormData({...formData, isGuest: false})}
               className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${!formData.isGuest ? 'bg-white dark:bg-primary text-primary dark:text-dark shadow-sm' : 'text-slate-500'}`}
             >
               Mensalista
             </button>
             <button 
               type="button"
               onClick={() => setFormData({...formData, isGuest: true})}
               className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${formData.isGuest ? 'bg-white dark:bg-primary text-primary dark:text-dark shadow-sm' : 'text-slate-500'}`}
             >
               Convidado
             </button>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nome do Jogador</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-dark/50 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white font-bold"
              placeholder="Ex: Neymar Jr"
            />
          </div>

          {!formData.isGuest && (
            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-1">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Camisa</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    required={!formData.isGuest}
                    type="number"
                    min="1"
                    max="99"
                    value={formData.shirtNumber}
                    onChange={(e) => setFormData({ ...formData, shirtNumber: parseInt(e.target.value) || 1 })}
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-dark/50 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all font-black dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Uniforme</label>
                <div className="relative">
                  <Shirt className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <select
                    value={formData.uniformSize}
                    onChange={(e) => setFormData({ ...formData, uniformSize: e.target.value as Player['uniformSize'] })}
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-dark/50 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white font-bold appearance-none"
                  >
                    {UNIFORM_SIZES.map(size => <option key={size} value={size}>{size}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Posição</label>
              <select
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value as Player['position'] })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-dark/50 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white font-bold"
              >
                {POSITIONS.map(pos => <option key={pos} value={pos}>{pos}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Gols / Jogos</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="0"
                  placeholder="Gols"
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-dark/50 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white font-bold"
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Jogos"
                  value={formData.games}
                  onChange={(e) => setFormData({ ...formData, games: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-dark/50 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white font-bold"
                />
              </div>
            </div>
          </div>

          {!formData.isGuest && (
            <div 
              onClick={() => setFormData({...formData, monthlyFeePaid: !formData.monthlyFeePaid})}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                formData.monthlyFeePaid ? 'bg-primary/5 border-primary/20' : 'bg-slate-50 dark:bg-dark/50 border-slate-100 dark:border-white/5'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${formData.monthlyFeePaid ? 'bg-primary text-dark' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                   <Trophy size={16} />
                </div>
                <div>
                   <p className="text-xs font-bold text-dark dark:text-slate-200">Mensalidade Paga</p>
                   <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Status Financeiro</p>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                formData.monthlyFeePaid ? 'bg-primary border-primary text-dark' : 'border-slate-300'
              }`}>
                {formData.monthlyFeePaid && <span className="text-[10px] font-black">✓</span>}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="order-2 sm:order-1 flex-1 py-4 text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-xs hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="order-1 sm:order-2 flex-1 py-4 bg-primary text-dark font-black uppercase tracking-widest text-xs hover:bg-secondary hover:text-white rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95"
            >
              {initialData ? 'Atualizar Atleta' : 'Salvar Atleta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlayerModal;
