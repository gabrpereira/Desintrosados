
import React from 'react';
import { Player } from '../types';
import { AlertTriangle } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  playerName?: string;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, onConfirm, playerName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 font-heading">Excluir Jogador?</h3>
          <p className="text-slate-500 mt-2 text-sm">
            Tem certeza que deseja remover <span className="font-bold text-slate-700">{playerName}</span>? 
            Esta ação não pode ser desfeita e todas as estatísticas serão perdidas.
          </p>
        </div>
        
        <div className="flex border-t border-slate-100">
          <button
            onClick={onClose}
            className="flex-1 py-4 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors border-r border-slate-100"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-4 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
          >
            Confirmar Exclusão
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
