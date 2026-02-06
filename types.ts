
export interface Participant {
  id: string;
  name: string;
  email: string;
  personCount: number;
  inviteToken: string;
}

export interface Expense {
  id: string;
  payerId: string;
  amount: number;
  reason: string;
  date: string;
}

export interface Trip {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  participants: Participant[];
  expenses: Expense[];
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export interface ParticipantBalance {
  participantId: string;
  name: string;
  paid: number;
  targetShare: number;
  balance: number;
}

export type UserRole = 
  | { type: 'admin' }
  | { type: 'guest'; participantId: string; tripId: string }
  | { type: 'none' };
