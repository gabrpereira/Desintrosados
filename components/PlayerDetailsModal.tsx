
import React from 'react';
import { Player } from '../types';
import { ICONS } from '../constants';
import { Trophy, Calendar, Ruler, CreditCard, X, ShieldCheck } from 'lucide-react';

interface PlayerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  player?: Player;
  logo: string;
}

const PlayerDetailsModal: React.FC<PlayerDetailsModalProps> = ({ isOpen, onClose, player, logo }) => {
  if (!isOpen || !player) return null;

  const goalAverage = player.games > 0 ? (player.goals / player.games).toFixed(2) : '0.00';

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[120] p-4">
      <div className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20">
        <div className={`p-8 text-white relative overflow-hidden ${player.isGuest ? 'bg-amber-500' : 'bg-emerald-600'}`}>
          <div className="absolute top-0 right-0 -translate-y-4 translate-x-8 w-40 h-40 opacity-10">
            <img src={logo} alt="" className="w-full h-full object-contain grayscale brightness-200" />
          </div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors z-10"
          >
            <X size={20} />
          </button>

          <div className="relative flex flex-col items-center">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center text-4xl font-black mb-4 border border-white/30 shadow-xl overflow-hidden">
               <div className="absolute inset-0 bg-slate-800 flex items-center justify-center text-white">
                 {player.name.charAt(0)}
               </div>
            </div>
            <div className="text-center">
              <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/20 inline-block mb-2">
                {player.position}
              </div>
              <h2 className="text-2xl font-black font-heading leading-tight mb-1">{player.name}</h2>
              {!player.isGuest && (
                <p className="text-white/70 font-bold text-xs">Camisa #{player.shirtNumber} • DESINTROSADOS FC</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group hover:border-emerald-200 transition-colors">
            <div className="flex items-center space-x-2 text-emerald-600 mb-1">
              <Trophy size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Gols</span>
            </div>
            <p className="text-2xl font-black text-slate-800 font-mono">{player.goals}</p>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group hover:border-emerald-200 transition-colors">
            <div className="flex items-center space-x-2 text-blue-600 mb-1">
              <Calendar size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Jogos</span>
            </div>
            <p className="text-2xl font-black text-slate-800 font-mono">{player.games}</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group hover:border-emerald-200 transition-colors">
            <div className="flex items-center space-x-2 text-amber-600 mb-1">
              <Trophy size={16} className="opacity-50" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Média</span>
            </div>
            <p className="text-lg font-black text-slate-700 font-mono">{goalAverage} <span className="text-[10px] text-slate-400">G/J</span></p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group hover:border-emerald-200 transition-colors">
            <div className="flex items-center space-x-2 text-purple-600 mb-1">
              <Ruler size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Uniforme</span>
            </div>
            <p className="text-lg font-black text-slate-700">{player.uniformSize || 'N/A'}</p>
          </div>
        </div>

        <div className="px-6 pb-8 space-y-4">
          <div className={`p-4 rounded-2xl flex items-center justify-between ${player.isGuest ? 'bg-amber-50 border border-amber-100' : (player.monthlyFeePaid ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100')}`}>
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-xl ${player.isGuest ? 'bg-amber-100 text-amber-600' : (player.monthlyFeePaid ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600')}`}>
                <CreditCard size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Financeiro</p>
                <p className={`text-sm font-bold ${player.isGuest ? 'text-amber-700' : (player.monthlyFeePaid ? 'text-emerald-700' : 'text-red-700')}`}>
                  {player.isGuest ? 'Convidado (Isento)' : (player.monthlyFeePaid ? 'Mensalidade Paga' : 'Mensalidade Pendente')}
                </p>
              </div>
            </div>
            {!player.isGuest && (
              <div className="scale-125">
                {player.monthlyFeePaid ? ICONS.Paid : ICONS.Unpaid}
              </div>
            )}
          </div>

          {player.updatedBy && (
            <div className="flex items-center justify-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 p-2 rounded-xl border border-dashed border-slate-200">
               <ShieldCheck size={12} className="text-emerald-500" />
               <span className="truncate">Responsável: {player.updatedBy}</span>
            </div>
          )}

          <button 
            onClick={onClose}
            className="w-full mt-2 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-900/10"
          >
            Fechar Perfil
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerDetailsModal;
