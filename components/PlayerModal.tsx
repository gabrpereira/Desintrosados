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
    name: '', goals: 0, games: 0, monthlyFeePaid: false, position: 'Meio-Campo',
    shirtNumber: 1, uniformSize: 'M', isGuest: false
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) setFormData({ ...initialData, shirtNumber: initialData.shirtNumber || 1 });
      else setFormData({ name: '', goals: 0, games: 0, monthlyFeePaid: false, position: 'Meio-Campo', shirtNumber: 1, uniformSize: 'M', isGuest: false });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-dark/80 backdrop-blur-sm flex items-center justify-center z-[130] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-modal-title"
    >
      <div className="bg-white dark:bg-dark rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden border dark:border-white/10 flex flex-col">
        <div className="p-8 bg-primary text-dark relative">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-dark/5 hover:bg-dark/10 rounded-full"><X size={20} /></button>
          <div className="flex items-center space-x-3">
            <User size={20} className="opacity-60" />
            <h2 id="player-modal-title" className="text-xl font-black uppercase tracking-tight">
              {initialData ? 'Editar Atleta' : 'Novo Atleta'}
            </h2>
          </div>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-8 space-y-6">
          <input 
            required 
            type="text" 
            placeholder="Nome do Atleta"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-4 bg-slate-50 dark:bg-dark/50 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-primary dark:text-white font-bold"
          />
          {/* Outros campos simplificados para este exemplo */}
          <div className="flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 font-black uppercase text-xs text-slate-400">Cancelar</button>
            <button type="submit" className="flex-1 py-4 bg-primary text-dark font-black uppercase text-xs rounded-2xl">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlayerModal;