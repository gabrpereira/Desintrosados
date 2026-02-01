
import React from 'react';
import { Match } from '../types';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  matchOpponent?: string;
}

const DeleteMatchModal: React.FC<DeleteMatchModalProps> = ({ isOpen, onClose, onConfirm, matchOpponent }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm flex items-center justify-center z-[250] p-4">
      <div className="bg-white dark:bg-dark rounded-[32px] w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border dark:border-white/10">
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-500/10 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <AlertTriangle size={40} />
          </div>
          <h3 className="text-2xl font-black text-dark dark:text-white font-heading uppercase tracking-tight">Apagar Partida?</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-4 text-sm font-medium leading-relaxed">
            Deseja mesmo excluir o confronto contra <span className="font-bold text-red-500">{matchOpponent}</span>? 
            <br /><br />
            <span className="text-[10px] font-black uppercase tracking-widest bg-red-50 dark:bg-red-500/5 px-3 py-1 rounded-full">Esta ação é irreversível</span>
          </p>
        </div>
        
        <div className="flex p-6 pt-0 space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all"
          >
            Voltar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-4 text-xs font-black uppercase tracking-widest bg-red-600 text-white hover:bg-red-700 rounded-2xl shadow-xl shadow-red-600/20 transition-all flex items-center justify-center space-x-2"
          >
            <Trash2 size={14} />
            <span>Excluir</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteMatchModal;
