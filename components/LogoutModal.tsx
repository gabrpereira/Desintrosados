import React, { useState } from 'react';
import { LogOut, AlertCircle, Loader2 } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [isExiting, setIsExiting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsExiting(true);
    await onConfirm();
    // O fechamento do modal é controlado pelo componente pai após o logout
  };

  return (
    <div 
      className="fixed inset-0 bg-dark/95 backdrop-blur-md flex items-center justify-center z-[300] p-4 animate-in fade-in duration-500"
      onClick={(e) => !isExiting && e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#020d0c] rounded-[40px] w-full max-w-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden border border-white/5 animate-in zoom-in duration-300">
        <div className="p-10 text-center">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-[24px] flex items-center justify-center mx-auto mb-8 shadow-[inset_0_0_20px_rgba(0,184,169,0.2)] border border-primary/20">
            {isExiting ? <Loader2 size={32} className="animate-spin" /> : <LogOut size={32} />}
          </div>
          
          <h3 className="text-2xl font-black text-white font-heading uppercase tracking-tight">Encerrar Sessão?</h3>
          
          <p className="text-slate-400 mt-4 text-xs font-medium leading-relaxed px-4">
            Presidente, tem certeza que deseja sair do sistema de gestão do <span className="text-primary font-bold">Desintrosados FC</span>?
          </p>

          <div className="mt-8 flex items-center justify-center space-x-2">
            <AlertCircle size={14} className="text-slate-600" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
              Seus dados salvos não serão perdidos.
            </span>
          </div>
        </div>
        
        <div className="flex h-20 border-t border-white/5">
          <button
            disabled={isExiting}
            onClick={onClose}
            className="flex-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white hover:bg-white/5 transition-all outline-none disabled:opacity-20"
          >
            Cancelar
          </button>
          <button
            disabled={isExiting}
            onClick={handleConfirm}
            className="flex-1 bg-primary text-dark text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white transition-all active:scale-95 flex items-center justify-center space-x-2 shadow-[0_0_30px_rgba(0,184,169,0.3)] outline-none disabled:opacity-50"
          >
            {isExiting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <LogOut size={16} />
                <span>Confirmar Saída</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;