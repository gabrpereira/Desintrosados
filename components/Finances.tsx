
import React, { useState, useMemo } from 'react';
import { Player } from '../types';
import { MONTHLY_FEE, ICONS } from '../constants';
import { History, X, CheckCircle, Clock, Calendar, Filter, Target, Wallet, CheckCircle2, Eye, EyeOff } from 'lucide-react';

interface FinancesProps {
  players: Player[];
  onTogglePayment: (id: string, month?: string) => void;
}

const Finances: React.FC<FinancesProps> = ({ players, onTogglePayment }) => {
  const [selectedPlayerForHistory, setSelectedPlayerForHistory] = useState<Player | null>(null);
  const [viewingMonthIdx, setViewingMonthIdx] = useState(new Date().getMonth());
  const [isMetaVisible, setIsMetaVisible] = useState(true);
  const currentYear = new Date().getFullYear();

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const selectedMonthName = months[viewingMonthIdx];
  const selectedMonthKey = `${currentYear}-${String(viewingMonthIdx + 1).padStart(2, '0')}`;

  const fixos = players.filter(p => !p.isGuest);

  const stats = useMemo(() => {
    const paidInMonthCount = fixos.filter(p => p.paymentHistory?.includes(selectedMonthKey)).length;
    const totalExpected = fixos.length * MONTHLY_FEE;
    const totalCollected = paidInMonthCount * MONTHLY_FEE;
    const progress = fixos.length > 0 ? (paidInMonthCount / fixos.length) * 100 : 0;
    
    return { 
      paidCount: paidInMonthCount, 
      unpaidCount: fixos.length - paidInMonthCount, 
      totalExpected, 
      totalCollected, 
      progress,
      activePlayers: fixos.length
    };
  }, [fixos, selectedMonthKey]);

  const PaymentHistoryModal = () => {
    if (!selectedPlayerForHistory) return null;

    return (
      <div 
        className="fixed inset-0 bg-dark/95 backdrop-blur-xl flex items-center justify-center z-[250] p-4 sm:p-6 animate-in fade-in duration-300"
        onClick={(e) => e.target === e.currentTarget && setSelectedPlayerForHistory(null)}
      >
        <div className="bg-white dark:bg-dark w-full max-w-xl max-h-[90vh] sm:max-h-[85vh] h-full sm:h-auto rounded-[32px] sm:rounded-[48px] shadow-2xl overflow-hidden border dark:border-white/10 flex flex-col">
          <div className="p-6 sm:p-10 bg-primary text-dark relative shrink-0">
            <button 
              onClick={() => setSelectedPlayerForHistory(null)}
              className="absolute top-6 right-6 sm:top-10 sm:right-10 p-2 bg-dark/10 hover:bg-dark/20 rounded-full transition-colors z-10"
            >
              <X size={20} />
            </button>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-dark text-white rounded-2xl flex items-center justify-center font-black text-xl sm:text-2xl shadow-lg border-2 border-white/10">
                {selectedPlayerForHistory.name.charAt(0)}
              </div>
              <div className="min-w-0 pr-8">
                <h3 className="text-lg sm:text-2xl font-black font-heading uppercase tracking-tight truncate">{selectedPlayerForHistory.name}</h3>
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest opacity-60">Cartão de Quitação • {currentYear}</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10 overflow-y-auto no-scrollbar space-y-8 flex-1 bg-slate-50 dark:bg-dark">
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4">
              {months.map((month, idx) => {
                const monthKey = `${currentYear}-${String(idx + 1).padStart(2, '0')}`;
                const isPaid = selectedPlayerForHistory.paymentHistory?.includes(monthKey);
                
                return (
                  <div 
                    key={month}
                    className={`p-3 sm:p-5 rounded-2xl sm:rounded-3xl border-2 transition-all flex flex-col items-center justify-center space-y-2 sm:space-y-3 ${
                      isPaid 
                        ? 'bg-primary/10 border-primary/30 text-primary shadow-sm' 
                        : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-400'
                    }`}
                  >
                    <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-center">{month}</p>
                    <div className="relative">
                      {isPaid ? <CheckCircle size={22} className="sm:w-6 sm:h-6" /> : <Clock size={22} className="sm:w-6 sm:h-6 opacity-30" />}
                    </div>
                    <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-tighter">
                      {isPaid ? 'Pago' : 'Pendente'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="p-6 sm:p-8 bg-white dark:bg-white/5 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                      <History size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-dark dark:text-slate-300">Total Anual</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase">Frequência Financeira</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl sm:text-2xl font-black text-primary font-heading leading-none">
                      {selectedPlayerForHistory.paymentHistory?.length || 0}/12
                    </p>
                  </div>
               </div>
               <div className="w-full h-3 bg-slate-100 dark:bg-dark rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(0,184,169,0.3)]"
                    style={{ width: `${((selectedPlayerForHistory.paymentHistory?.length || 0) / 12) * 100}%` }}
                  ></div>
               </div>
            </div>

            <button 
              onClick={() => setSelectedPlayerForHistory(null)}
              className="w-full py-5 bg-dark text-white dark:bg-white/10 dark:hover:bg-white/20 rounded-[24px] sm:rounded-[32px] font-black text-[10px] sm:text-xs uppercase tracking-[0.4em] hover:bg-slate-900 transition-all active:scale-95 shadow-2xl shadow-dark/20 border border-white/5"
            >
              Fechar Detalhes
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-4xl font-bold font-heading text-dark dark:text-white uppercase tracking-tight">Finanças</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Controle de Mensalidades • {selectedMonthName} {currentYear}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none group-hover:scale-110 transition-transform">
              <Calendar size={18} />
            </div>
            <select 
              value={viewingMonthIdx}
              onChange={(e) => setViewingMonthIdx(parseInt(e.target.value))}
              className="pl-12 pr-10 py-3.5 bg-white dark:bg-dark/60 border border-slate-100 dark:border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-dark dark:text-white outline-none focus:ring-2 focus:ring-primary appearance-none shadow-sm cursor-pointer min-w-[180px]"
            >
              {months.map((m, idx) => (
                <option key={m} value={idx}>{m} {currentYear}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
               <Filter size={14} />
            </div>
          </div>
        </div>
      </header>

      {/* PAINEL DE ARRECADAÇÃO */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 px-1">
          <Wallet className="text-primary" size={20} />
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-dark dark:text-slate-300">Status Financeiro - {selectedMonthName}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Meta */}
          <div className="bg-white dark:bg-dark/40 p-6 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Target size={80} />
            </div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-500">
                <Target size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Meta do Mês</span>
            </div>
            <p className="text-3xl font-black text-dark dark:text-white font-heading tabular-nums">
              {isMetaVisible ? `R$ ${stats.totalExpected.toFixed(2)}` : 'R$ ••••••'}
            </p>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Para {stats.activePlayers} atletas fixos</p>
            
            <button 
              onClick={() => setIsMetaVisible(!isMetaVisible)}
              className={`absolute bottom-6 right-6 p-3 rounded-2xl transition-all shadow-sm group/view ${
                isMetaVisible 
                  ? 'bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-primary hover:bg-primary/10' 
                  : 'bg-primary/20 text-primary'
              }`}
              title={isMetaVisible ? "Ocultar Meta" : "Mostrar Meta"}
            >
              {isMetaVisible ? (
                <Eye size={18} className="group-hover/view:scale-110 transition-transform" />
              ) : (
                <EyeOff size={18} className="group-hover/view:scale-110 transition-transform" />
              )}
            </button>
          </div>

          {/* Card Confirmados */}
          <div className="bg-white dark:bg-dark/40 p-6 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 text-primary">
              <CheckCircle2 size={80} />
            </div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <CheckCircle2 size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pagamentos OK</span>
            </div>
            <p className="text-3xl font-black text-dark dark:text-white font-heading tabular-nums">
              {stats.paidCount} <span className="text-sm text-slate-400 font-medium">de {stats.activePlayers}</span>
            </p>
            <div className="w-full bg-slate-100 dark:bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
               <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${stats.progress}%` }}></div>
            </div>
          </div>

          {/* Card Valor Final */}
          <div className="bg-primary text-dark p-6 rounded-[32px] shadow-xl shadow-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Wallet size={80} />
            </div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-dark/10 rounded-2xl flex items-center justify-center text-dark/60">
                <Wallet size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-dark/60">Total em Caixa</span>
            </div>
            <p className="text-3xl font-black font-heading tabular-nums">
              R$ {stats.totalCollected.toFixed(2)}
            </p>
            <p className="text-[9px] font-bold text-dark/40 mt-1 uppercase">{stats.progress.toFixed(0)}% da meta atingida</p>
          </div>
        </div>
      </section>

      {/* Checklist */}
      <div className="bg-white dark:bg-dark/40 rounded-[40px] shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
          <div className="p-6 sm:p-10 border-b border-slate-100 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-black text-dark dark:text-slate-200 text-sm sm:text-base uppercase tracking-[0.3em]">Auditoria Individual</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Referência: {selectedMonthName}</p>
            </div>
            <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/5 px-4 py-2 rounded-full border border-primary/10">Controle por Histórico Ativo</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 p-6 sm:p-10">
          {fixos.map(player => {
              const isPaidInMonth = player.paymentHistory?.includes(selectedMonthKey);
              
              return (
              <div 
                  key={player.id}
                  className={`p-6 sm:p-8 rounded-[32px] border-2 transition-all group flex flex-col space-y-6 ${
                  isPaidInMonth 
                      ? 'bg-primary/[0.02] dark:bg-primary/[0.04] border-primary/20' 
                      : 'bg-red-50/30 dark:bg-red-500/[0.02] border-red-100 dark:border-red-500/20 shadow-sm'
                  }`}
              >
                  <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 min-w-0">
                      <button 
                      type="button"
                      onClick={() => onTogglePayment(player.id, selectedMonthKey)}
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg transition-all active:scale-90 hover:scale-110 shrink-0 border-b-4 outline-none focus:ring-2 focus:ring-primary/50 ${
                          isPaidInMonth 
                          ? 'bg-primary text-dark border-secondary/30' 
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-900'
                      }`}
                      >
                      {player.name.charAt(0)}
                      </button>
                      <div className="min-w-0">
                      <p className="font-black text-dark dark:text-slate-100 text-base truncate">{player.name}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">#{player.shirtNumber} • {player.position}</p>
                      </div>
                  </div>
                  
                  <button 
                      type="button"
                      onClick={() => onTogglePayment(player.id, selectedMonthKey)}
                      className={`flex flex-col items-center group/status transition-all active:scale-95 outline-none ${isPaidInMonth ? 'text-primary' : 'text-slate-300'}`}
                  >
                      <span className={`text-[9px] font-black mb-1 uppercase tracking-tighter transition-colors group-hover/status:text-primary`}>
                      {isPaidInMonth ? 'Pago' : 'Pendente'}
                      </span>
                      <div className="transition-transform group-hover/status:scale-110">
                      {isPaidInMonth ? <CheckCircle size={28} /> : <X size={28} />}
                      </div>
                  </button>
                  </div>

                  <div className="h-px bg-slate-100 dark:bg-white/5 w-full"></div>

                  <div className="flex items-center justify-between gap-4">
                  <button 
                      type="button"
                      onClick={() => setSelectedPlayerForHistory(player)}
                      className="flex items-center justify-center space-x-2 py-3 px-6 bg-slate-100 dark:bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-primary hover:bg-primary/10 transition-all shrink-0 w-full outline-none"
                  >
                      <History size={14} className="shrink-0" />
                      <span>Ver Ficha Financeira</span>
                  </button>
                  </div>
              </div>
              );
          })}
          </div>
      </div>

      {selectedPlayerForHistory && <PaymentHistoryModal />}
    </div>
  );
};

export default Finances;
