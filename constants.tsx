
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  Trophy, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Settings,
  Swords,
  MapPin,
  Calendar
} from 'lucide-react';

export const POSITIONS = ['Goleiro', 'Zagueiro', 'Meio-Campo', 'Atacante'] as const;
export const UNIFORM_SIZES = ['PP', 'P', 'M', 'G', 'GG'] as const;
export const MONTHLY_FEE = 28.00;

// Logo Padrão (Fallback)
export const DEFAULT_LOGO = "desintro.png"; 

export const ICONS = {
  Dashboard: <LayoutDashboard size={20} />,
  Players: <Users size={20} />,
  Finances: <DollarSign size={20} />,
  Stats: <Trophy size={20} />,
  Matches: <Swords size={20} />,
  Plus: <Plus size={20} />,
  Trash: <Trash2 size={18} />,
  Edit: <Edit size={18} />,
  Paid: <CheckCircle size={18} className="text-primary" />,
  Unpaid: <XCircle size={18} className="text-red-500" />,
  Trending: <TrendingUp size={20} />,
  Settings: <Settings size={20} />,
  Location: <MapPin size={14} />,
  Calendar: <Calendar size={14} />
};
