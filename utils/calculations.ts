
import { Trip, ParticipantBalance, Settlement } from '../types';

export const calculateBalances = (trip: Trip): ParticipantBalance[] => {
  const totalExpenses = trip.expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalPersons = trip.participants.reduce((sum, p) => sum + p.personCount, 0);

  if (totalPersons === 0) return [];

  const sharePerPerson = totalExpenses / totalPersons;

  return trip.participants.map(p => {
    const paid = trip.expenses
      .filter(e => e.payerId === p.id)
      .reduce((sum, e) => sum + e.amount, 0);
    
    const targetShare = sharePerPerson * p.personCount;
    const balance = paid - targetShare;

    return {
      participantId: p.id,
      name: p.name,
      paid,
      targetShare,
      balance
    };
  });
};

export const calculateSettlements = (balances: ParticipantBalance[]): Settlement[] => {
  const settlements: Settlement[] = [];
  
  let debtors = balances
    .filter(b => b.balance < -0.01)
    .map(b => ({ ...b, amount: Math.abs(b.balance) }))
    .sort((a, b) => b.amount - a.amount);
    
  let creditors = balances
    .filter(b => b.balance > 0.01)
    .map(b => ({ ...b, amount: b.balance }))
    .sort((a, b) => b.amount - a.amount);

  while (debtors.length > 0 && creditors.length > 0) {
    const debtor = debtors[0];
    const creditor = creditors[0];
    const amountToTransfer = Math.min(debtor.amount, creditor.amount);
    
    settlements.push({
      from: debtor.participantId,
      to: creditor.participantId,
      amount: amountToTransfer
    });
    
    debtor.amount -= amountToTransfer;
    creditor.amount -= amountToTransfer;
    
    if (debtor.amount <= 0.01) debtors.shift();
    if (creditor.amount <= 0.01) creditors.shift();
  }

  return settlements;
};
