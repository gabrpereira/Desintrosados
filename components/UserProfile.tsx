
import React, { useState, useRef } from 'react';
import { Mail, Shield, Calendar, UserCheck, LogOut, Trash2, AlertCircle, Camera, Loader2, Globe } from 'lucide-react';
import { supabase } from '../services/supabase';
import DeleteAccountModal from './DeleteAccountModal';

interface UserProfileProps {
  user?: any;
  userName?: string;
  userAvatar?: string;
  logo: string;
  onUpdateLogo: (newLogo: string) => Promise<void>;
  onUpdateAvatar: (newAvatar: string) => Promise<void>;
  onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, userName, userAvatar, logo, onUpdateLogo, onUpdateAvatar, onLogout }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const displayName = userName || "Presidente";
  const email = user?.email || "N/A";
  const createdAt = user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : "N/A";

  const handleDeleteAccount = async () => {
    try {
      if (user?.id) {
        await supabase.from('presidents').delete().eq('id', user.id);
      }
      await supabase.auth.signOut();
      window.location.reload();
    } catch (error) {
      console.error("Erro ao apagar conta:", error);
      alert("Houve um erro ao processar sua solicitação.");
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("O arquivo deve ter no máximo 2MB."); return; }

    setIsUploadingLogo(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      await onUpdateLogo(base64String);
      setIsUploadingLogo(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("O arquivo deve ter no máximo 2MB."); return; }

    setIsUploadingAvatar(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      await onUpdateAvatar(base64String);
      setIsUploadingAvatar(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto pb-12">
      {/* Cabeçalho de Perfil (Presidente) */}
      <header className="relative bg-dark rounded-[48px] p-8 sm:p-12 text-white overflow-hidden border border-white/5 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-10">
          <div 
            className="w-32 h-32 sm:w-40 sm:h-40 bg-white/5 backdrop-blur-md rounded-[40px] border border-white/10 p-2 shadow-2xl group cursor-pointer relative overflow-hidden" 
            onClick={() => avatarInputRef.current?.click()}
          >
             <div className="w-full h-full bg-slate-800 rounded-[32px] flex items-center justify-center text-5xl font-black text-primary border-b-4 border-primary/20 overflow-hidden relative">
               {userAvatar ? (
                 <img src={userAvatar} alt="Perfil" className="w-full h-full object-cover" />
               ) : (
                 <span>{displayName.charAt(0)}</span>
               )}
               <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 {isUploadingAvatar ? <Loader2 className="animate-spin" /> : <Camera size={32} />}
               </div>
             </div>
             <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
          </div>
          
          <div className="text-center sm:text-left space-y-2 mb-2">
            <div className="inline-flex items-center space-x-2 bg-primary text-dark px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              <Shield size={12} />
              <span>Acesso Presidência</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black font-heading tracking-tight">{displayName}</h1>
            <p className="text-slate-400 font-medium">{email}</p>
          </div>
        </div>
      </header>

      {/* Card Identidade Visual (Clube) */}
      <div className="bg-white dark:bg-dark/40 rounded-[48px] p-8 sm:p-12 border border-slate-100 dark:border-white/5 shadow-sm flex flex-col md:flex-row items-center gap-10">
         <div className="w-40 h-40 shrink-0 relative group bg-slate-50 dark:bg-dark/20 rounded-[32px] p-4 border border-dashed border-slate-200 dark:border-white/10">
           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[32px] flex items-center justify-center z-10 cursor-pointer" onClick={() => logoInputRef.current?.click()}>
              {isUploadingLogo ? <Loader2 className="text-white animate-spin" /> : <Camera className="text-white" />}
           </div>
           <img src={logo} alt="Logo" className="w-full h-full object-contain filter drop-shadow-xl" />
           <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
         </div>
         <div className="space-y-6 flex-1 text-center md:text-left">
            <div>
              <h3 className="text-2xl font-black font-heading uppercase tracking-tight text-dark dark:text-white">Escudo Oficial do Time</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Presidente, este é o escudo que aparece em todos os relatórios, súmulas e na área pública do clube. Clique na imagem ao lado para alterar o brasão oficial.</p>
            </div>
            
            <button 
              onClick={() => logoInputRef.current?.click()}
              disabled={isUploadingLogo}
              className="px-6 py-3 bg-primary/10 text-primary border border-primary/20 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-primary hover:text-dark transition-all shadow-lg shadow-primary/5 flex items-center space-x-2 mx-auto md:mx-0"
            >
              {isUploadingLogo ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
              <span>Atualizar Brasão do Time</span>
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-dark/40 p-6 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
            <Mail size={22} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">E-mail de Contato</p>
          <p className="text-sm font-bold text-dark dark:text-slate-200 truncate">{email}</p>
        </div>

        <div className="bg-white dark:bg-dark/40 p-6 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm">
          <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mb-6">
            <Calendar size={22} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Membro desde</p>
          <p className="text-sm font-bold text-dark dark:text-slate-200">{createdAt}</p>
        </div>

        <div className="bg-white dark:bg-dark/40 p-6 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-6">
            <UserCheck size={22} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status da Conta</p>
          <p className="text-sm font-bold text-emerald-500">Ativa e Verificada</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2 px-2">
          <AlertCircle size={14} className="text-red-500" />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-red-500">Zona de Perigo</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-red-500/5 rounded-[32px] p-8 border border-red-500/10 flex flex-col justify-between gap-6 transition-all hover:bg-red-500/10">
            <div>
              <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 mb-4">
                <Globe size={20} />
              </div>
              <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-tight">Encerrar Sessão</p>
              <p className="text-[10px] font-medium text-slate-400 mt-1">Desconectar seu usuário de todos os dispositivos ativos.</p>
            </div>
            <button 
              onClick={onLogout}
              className="w-full px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-xl flex items-center justify-center space-x-2"
            >
              <LogOut size={16} />
              <span>Sair do Sistema</span>
            </button>
          </div>

          <div className="bg-red-600/5 rounded-[32px] p-8 border border-red-600/10 flex flex-col justify-between gap-6 transition-all hover:bg-red-600/10">
            <div>
              <div className="w-10 h-10 bg-red-600/10 rounded-xl flex items-center justify-center text-red-600 mb-4">
                <Trash2 size={20} />
              </div>
              <p className="text-xs font-bold text-red-600 dark:text-red-500 uppercase tracking-tight">Apagar Minha Conta</p>
              <p className="text-[10px] font-medium text-slate-400 mt-1">Excluir permanentemente seus dados de acesso e perfil.</p>
            </div>
            <button 
              onClick={() => setIsDeleteModalOpen(true)}
              className="w-full px-8 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all active:scale-95 shadow-xl shadow-red-600/20 flex items-center justify-center space-x-2"
            >
              <Trash2 size={16} />
              <span>Apagar Conta</span>
            </button>
          </div>
        </div>
      </div>

      <DeleteAccountModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={handleDeleteAccount} 
      />
    </div>
  );
};

export default UserProfile;
