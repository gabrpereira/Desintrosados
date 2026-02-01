
import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (confirmationText.toLowerCase() !== 'excluir') return;
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[300] p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-dark rounded-[40px] w-full max-w-md shadow-2xl overflow-hidden border border-red-500/20">
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={40} />
          </div>
          
          <h3 className="text-2xl font-black text-dark dark:text-white font-heading uppercase tracking-tight">Apagar sua Conta?</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-4 text-sm font-medium leading-relaxed">
            Esta ação é <span className="text-red-500 font-bold uppercase">irreversível</span>. Você perderá acesso à presidência do Desintrosados FC e todos os seus registros de auditoria serão desconectados.
          </p>

          <div className="mt-8 space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digite "EXCLUIR" para confirmar</p>
            <input 
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Digite aqui..."
              className="w-full bg-slate-50 dark:bg-dark/50 border border-slate-200 dark:border-white/10 rounded-2xl py-4 text-center text-sm font-black dark:text-white outline-none focus:ring-2 focus:ring-red-500 transition-all"
            />
          </div>
        </div>
        
        <div className="flex p-8 pt-0 space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || confirmationText.toLowerCase() !== 'excluir'}
            className="flex-1 py-4 text-xs font-black uppercase tracking-widest bg-red-600 text-white hover:bg-red-700 rounded-2xl shadow-xl shadow-red-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            <span>{loading ? 'Apagando...' : 'Confirmar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
