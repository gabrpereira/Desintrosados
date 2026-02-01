
import React, { useState, useMemo, useEffect } from 'react';
import { Player } from '../types';
import { ICONS, POSITIONS } from '../constants';
import { 
  Filter, 
  Users, 
  UserPlus,
  Eye,
  RotateCcw,
  ArrowUpAz,
  ArrowDownAz,
  ChevronLeft,
  ChevronRight,
  Search,
  ShieldCheck
} from 'lucide-react';

interface PlayerListProps {
  players: Player[];
  onEdit: (player: Player) => void;
  onView: (player: Player) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

type SortKey = 'position' | 'name' | 'goals' | 'games' | 'shirtNumber';
type SortDir = 'asc' | 'desc';
type PayFilter = 'all' | 'paid' | 'unpaid';
type TabType = 'fixos' | 'convidados';

const ITEMS_PER_PAGE = 10;

const POSITION_WEIGHT: Record<string, number> = {
  'Goleiro': 1,
  'Zagueiro': 2,
  'Meio-Campo': 3,
  'Atacante': 4
};

const PlayerList: React.FC<PlayerListProps> = ({ players, onEdit, onView, onDelete, onAdd }) => {
  const [activeTab, setActiveTab] = useState<TabType>('fixos');
  const [search, setSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [primarySort, setPrimarySort] = useState<SortKey>('position');
  const [primaryDir, setPrimaryDir] = useState<SortDir>('asc');
  const [filterPos, setFilterPos] = useState<string>('Todas');
  const [filterPay, setFilterPay] = useState<PayFilter>('all');

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterPos, filterPay, activeTab, primarySort, primaryDir]);

  const comparePlayers = (p1: Player, p2: Player, key: SortKey, dir: SortDir) => {
    let val = 0;
    switch (key) {
      case 'position':
        val = (POSITION_WEIGHT[p1.position] || 99) - (POSITION_WEIGHT[p2.position] || 99);
        break;
      case 'name':
        val = p1.name.localeCompare(p2.name);
        break;
      case 'goals':
        val = p1.goals - p2.goals;
        break;
      case 'games':
        val = p1.games - p2.games;
        break;
      case 'shirtNumber':
        val = (p1.shirtNumber || 0) - (p2.shirtNumber || 0);
        break;
    }
    return dir === 'asc' ? val : -val;
  };

  const filteredPlayers = useMemo(() => {
    let result = players.filter(p => {
      const matchesTab = activeTab === 'fixos' ? !p.isGuest : p.isGuest;
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesPos = filterPos === 'Todas' || p.position === filterPos;
      const matchesPay = filterPay === 'all' || 
                        (filterPay === 'paid' && p.monthlyFeePaid) || 
                        (filterPay === 'unpaid' && !p.monthlyFeePaid);
      return matchesTab && matchesSearch && matchesPos && (activeTab === 'convidados' || matchesPay);
    });

    result.sort((a, b) => comparePlayers(a, b, primarySort, primaryDir));
    return result;
  }, [players, search, primarySort, primaryDir, filterPos, filterPay, activeTab]);

  const totalPages = Math.ceil(filteredPlayers.length / ITEMS_PER_PAGE);

  const paginatedPlayers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPlayers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPlayers, currentPage]);

  const handleClearFilters = () => {
    setSearch('');
    setFilterPos('Todas');
    setFilterPay('all');
    setPrimarySort('position');
    setPrimaryDir('asc');
    setCurrentPage(1);
  };

  const toggleSortDir = () => {
    setPrimaryDir(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const showingStart = filteredPlayers.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const showingEnd = Math.min(currentPage * ITEMS_PER_PAGE, filteredPlayers.length);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-dark dark:text-white uppercase tracking-tight">Elenco</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Gestão de atletas e convocação.</p>
        </div>
        <button 
          onClick={onAdd}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-primary text-dark px-6 py-4 sm:py-3 rounded-xl font-black uppercase tracking-widest hover:bg-secondary hover:text-white shadow-lg shadow-primary/20 active:scale-95 transition-all text-xs"
        >
          <UserPlus size={18} />
          <span>Novo Atleta</span>
        </button>
      </div>

      <div className="flex bg-white dark:bg-dark/40 p-1 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 w-full sm:max-w-md">
         <button 
           onClick={() => setActiveTab('fixos')}
           className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl transition-all ${activeTab === 'fixos' ? 'bg-primary text-dark font-black' : 'text-slate-400 font-bold'}`}
         >
           <Users size={16} />
           <span className="text-[10px] uppercase tracking-widest">Fixos</span>
         </button>
         <button 
           onClick={() => setActiveTab('convidados')}
           className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl transition-all ${activeTab === 'convidados' ? 'bg-primary text-dark font-black' : 'text-slate-400 font-bold'}`}
         >
           <UserPlus size={16} />
           <span className="text-[10px] uppercase tracking-widest">Convidados</span>
         </button>
      </div>

      <div className="bg-white dark:bg-dark/40 p-2 sm:p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 flex flex-col md:flex-row gap-2">
        <div className="flex-1 relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder={`Buscar por nome...`} 
            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-dark/50 border border-slate-100 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm font-bold text-dark dark:text-slate-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <button 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl font-black uppercase tracking-widest border transition-all text-xs ${
            isFilterOpen 
              ? 'bg-primary/10 border-primary/20 text-primary shadow-sm' 
              : 'bg-white dark:bg-dark/40 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400'
          }`}
        >
          <Filter size={18} />
          <span>Filtros</span>
        </button>
      </div>

      {isFilterOpen && (
        <div className="bg-white dark:bg-dark/60 p-4 sm:p-6 rounded-2xl border border-slate-100 dark:border-white/10 shadow-xl space-y-6 animate-in slide-in-from-top-2 duration-300">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
             <div>
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Posição</label>
               <select 
                 value={filterPos} 
                 onChange={e => setFilterPos(e.target.value)} 
                 className="w-full p-3 bg-slate-50 dark:bg-dark/40 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-dark dark:text-slate-200 outline-none focus:border-primary transition-all"
               >
                  <option value="Todas">Todas</option>
                  {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
               </select>
             </div>
             {activeTab === 'fixos' && (
               <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Financeiro</label>
                 <select 
                   value={filterPay} 
                   onChange={e => setFilterPay(e.target.value as PayFilter)} 
                   className="w-full p-3 bg-slate-50 dark:bg-dark/40 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-dark dark:text-slate-200 outline-none focus:border-primary transition-all"
                 >
                    <option value="all">Todos</option>
                    <option value="paid">Pagos</option>
                    <option value="unpaid">Pendentes</option>
                 </select>
               </div>
             )}
             <div>
               <label className="text-[10px] font-black text-primary uppercase tracking-widest block mb-2">Ordenar por</label>
               <div className="flex space-x-2">
                 <select 
                   value={primarySort} 
                   onChange={e => setPrimarySort(e.target.value as SortKey)} 
                   className="flex-1 p-3 bg-slate-50 dark:bg-dark/40 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-dark dark:text-slate-200 outline-none focus:border-primary transition-all"
                 >
                    <option value="position">Posição</option>
                    <option value="name">Nome</option>
                    <option value="goals">Gols</option>
                    <option value="games">Jogos</option>
                    <option value="shirtNumber">Nº Camisa</option>
                 </select>
                 <button
                   onClick={toggleSortDir}
                   className="px-3 bg-slate-50 dark:bg-dark/40 border border-slate-200 dark:border-white/10 rounded-xl text-primary hover:bg-primary/10 transition-all group/sort"
                 >
                   {primaryDir === 'asc' ? <ArrowUpAz size={20} /> : <ArrowDownAz size={20} />}
                 </button>
               </div>
             </div>
             <div className="flex items-end">
                <button 
                  onClick={handleClearFilters}
                  className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-xl text-xs font-black uppercase text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  <RotateCcw size={14} />
                  <span>Limpar Filtros</span>
                </button>
             </div>
           </div>
        </div>
      )}

      {/* Visualização de Tabela Desktop */}
      <div className="hidden lg:block bg-white dark:bg-dark/40 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-dark/60 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              {activeTab === 'fixos' && <th className="px-6 py-5">Nº</th>}
              <th className="px-6 py-5">Atleta</th>
              <th className="px-6 py-5 text-center">Gols</th>
              <th className="px-6 py-5 text-center">Jogos</th>
              {activeTab === 'fixos' && <th className="px-6 py-5 text-center">Financeiro</th>}
              <th className="px-6 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {paginatedPlayers.map(player => (
              <tr key={player.id} className="hover:bg-primary/[0.02] dark:hover:bg-primary/[0.05] transition-colors group">
                {activeTab === 'fixos' && (
                  <td className="px-6 py-4 font-black text-slate-300 dark:text-slate-600 font-mono">#{player.shirtNumber || '--'}</td>
                )}
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-dark dark:bg-slate-800 text-white flex items-center justify-center font-black text-sm border-b-2 border-primary/30 shrink-0">
                      {player.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-bold text-dark dark:text-slate-200">{player.name}</p>
                        {player.updatedBy && (
                          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter text-slate-400">
                             <ShieldCheck size={8} />
                             <span className="truncate max-w-[80px]">{player.updatedBy}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-[9px] text-primary font-black uppercase tracking-widest">{player.position}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center font-mono font-black text-primary">{player.goals}</td>
                <td className="px-6 py-4 text-center font-mono font-bold text-dark dark:text-slate-400 opacity-60 dark:opacity-80">{player.games}</td>
                {activeTab === 'fixos' && (
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center">{player.monthlyFeePaid ? ICONS.Paid : ICONS.Unpaid}</div>
                  </td>
                )}
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onView(player)} className="p-2 text-slate-300 hover:text-dark dark:hover:text-white transition-colors"><Eye size={18} /></button>
                    <button onClick={() => onEdit(player)} className="p-2 text-slate-300 hover:text-primary transition-colors">{ICONS.Edit}</button>
                    <button onClick={() => onDelete(player.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">{ICONS.Trash}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards Mobile/Tablet */}
      <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
        {paginatedPlayers.map(player => (
          <div key={player.id} className="bg-white dark:bg-dark/40 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 flex flex-col gap-4">
            <div className="flex justify-between items-start">
               <div className="flex items-center space-x-4">
                 <div className="w-12 h-12 rounded-2xl bg-dark dark:bg-slate-800 text-white flex items-center justify-center font-black text-lg border-b-2 border-primary/30 shrink-0">
                   {player.name.charAt(0)}
                 </div>
                 <div>
                   <div className="flex items-center space-x-2">
                     <p className="font-black text-dark dark:text-slate-200">{player.name}</p>
                     {player.updatedBy && (
                        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter text-slate-400">
                           <ShieldCheck size={8} />
                           <span className="truncate max-w-[60px]">{player.updatedBy}</span>
                        </div>
                      )}
                   </div>
                   <div className="flex items-center space-x-2">
                     <p className="text-[9px] text-primary font-black uppercase tracking-widest">{player.position}</p>
                     {!player.isGuest && (
                       <span className="text-[9px] font-bold text-slate-400">#{player.shirtNumber}</span>
                     )}
                   </div>
                 </div>
               </div>
               <div className="flex items-center space-x-1">
                 <button onClick={() => onView(player)} className="p-2.5 bg-slate-50 dark:bg-white/5 text-slate-400 rounded-xl" title="Ver Detalhes"><Eye size={18} /></button>
                 <button onClick={() => onEdit(player)} className="p-2.5 bg-primary/10 text-primary rounded-xl" title="Editar">{ICONS.Edit}</button>
                 <button onClick={() => onDelete(player.id)} className="p-2.5 bg-red-500/10 text-red-500 rounded-xl" title="Apagar">{ICONS.Trash}</button>
               </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-dark/60 p-3 rounded-2xl text-center">
               <div>
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-1">Gols</p>
                 <p className="text-sm font-black text-primary">{player.goals}</p>
               </div>
               <div className="border-x border-slate-200 dark:border-white/5">
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-1">Jogos</p>
                 <p className="text-sm font-black text-dark dark:text-slate-200">{player.games}</p>
               </div>
               <div>
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-1">Financeiro</p>
                 <div className="flex justify-center mt-0.5">
                   {activeTab === 'convidados' ? (
                     <span className="text-[8px] font-black text-slate-300">ISENTO</span>
                   ) : (
                     player.monthlyFeePaid ? ICONS.Paid : ICONS.Unpaid
                   )}
                 </div>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paginação Otimizada */}
      {filteredPlayers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 bg-white dark:bg-dark/20 p-4 rounded-3xl border border-slate-100 dark:border-white/5">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Mostrando {showingStart}-{showingEnd} de {filteredPlayers.length}
          </div>
          
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`p-3 rounded-xl transition-all ${currentPage === 1 ? 'text-slate-300 cursor-not-allowed opacity-50' : 'text-primary hover:bg-primary/10'}`}
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1)).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                    currentPage === page 
                      ? 'bg-primary text-dark shadow-lg shadow-primary/20' 
                      : 'text-slate-400 hover:bg-white dark:hover:bg-white/5'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`p-3 rounded-xl transition-all ${currentPage === totalPages ? 'text-slate-300 cursor-not-allowed opacity-50' : 'text-primary hover:bg-primary/10'}`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerList;
