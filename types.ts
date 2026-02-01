
export interface Player {
  id: string;
  name: string;
  goals: number;
  games: number;
  monthlyFeePaid: boolean;
  position: 'Goleiro' | 'Zagueiro' | 'Meio-Campo' | 'Atacante';
  shirtNumber: number;
  uniformSize: 'PP' | 'P' | 'M' | 'G' | 'GG';
  isGuest: boolean;
  addedAt: number;
  paymentHistory?: string[]; // Formato: ['2025-01', '2025-02']
  updatedBy?: string; // Nome do presidente que alterou
}

export interface Match {
  id: string;
  opponent: string;
  date: string;
  location: string;
  ourScore: number;
  opponentScore: number;
  status: 'agendado' | 'concluido' | 'cancelado';
  scorers?: Record<string, number>;
  attendance?: string[]; // IDs dos jogadores presentes
  updatedBy?: string; // Nome do presidente que alterou
}

export type ViewType = 'dashboard' | 'players' | 'finances' | 'stats' | 'matches' | 'profile';

export interface TeamStats {
  totalGoals: number;
  totalGames: number;
  activePlayers: number;
  guestCount: number;
  paymentRate: number;
  totalRevenue: number;
  expectedRevenue: number;
  paidCount: number;
}
