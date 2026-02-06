
import React, { useState } from 'react';
import { Trip, Participant, Expense, UserRole } from '../types';
import { Users, Euro, History, PieChart, Plus, Trash2, Calendar, Mail, Copy, Check, Send } from 'lucide-react';
import { calculateBalances, calculateSettlements } from '../utils/calculations';

interface TripDetailProps {
  trip: Trip;
  onUpdateTrip: (trip: Trip) => void;
  role: UserRole;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

const TripDetail: React.FC<TripDetailProps> = ({ trip, onUpdateTrip, role }) => {
  const isAdmin = role.type === 'admin';
  const isGuest = role.type === 'guest';
  const [activeTab, setActiveTab] = useState<'expenses' | 'participants' | 'settlement'>('expenses');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [pName, setPName] = useState('');
  const [pEmail, setPEmail] = useState('');
  const [pCount, setPCount] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [eAmount, setEAmount] = useState('');
  const [ePayer, setEPayer] = useState(isGuest ? role.participantId : '');
  const [eReason, setEReason] = useState('');
  const [eDate, setEDate] = useState(trip.startDate);

  const addToast = (message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type: 'success' }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const balances = calculateBalances(trip);
  const settlements = calculateSettlements(balances);
  const totalSpent = trip.expenses.reduce((s, e) => s + e.amount, 0);
  const displayExpenses = isGuest ? trip.expenses.filter(e => e.payerId === role.participantId) : trip.expenses;

  const addParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pEmail || pCount < 1) return;
    const newParticipant: Participant = { id: crypto.randomUUID(), name: pName, email: pEmail, personCount: pCount, inviteToken: Math.random().toString(36).substring(2, 15) };
    onUpdateTrip({ ...trip, participants: [...trip.participants, newParticipant] });
    addToast(`${pName} hinzugefügt.`); setPName(''); setPEmail(''); setPCount(1);
  };

  const openMailClient = (p: Participant) => {
    const link = `${window.location.origin}${window.location.pathname}?tripId=${trip.id}&token=${p.inviteToken}`;
    const subject = encodeURIComponent(`Einladung zur Reise: ${trip.title}`);
    const body = encodeURIComponent(`Hallo ${p.name},\n\ndu wurdest eingeladen. Hier dein Link:\n\n${link}`);
    window.location.href = `mailto:${p.email}?subject=${subject}&body=${body}`;
  };

  const addExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(eAmount);
    const payerId = isGuest ? role.participantId : ePayer;
    if (isNaN(amount) || amount <= 0 || !payerId || !eReason || !eDate) return;
    const newExpense: Expense = { id: crypto.randomUUID(), payerId, amount, reason: eReason, date: eDate };
    onUpdateTrip({ ...trip, expenses: [...trip.expenses, newExpense] });
    setEAmount(''); setEReason(''); setEDate(trip.startDate); addToast("Gespeichert!");
  };

  const removeExpense = (id: string) => onUpdateTrip({ ...trip, expenses: trip.expenses.filter(e => e.id !== id) });
  const copyInviteLink = (p: Participant) => {
    const link = `${window.location.origin}${window.location.pathname}?tripId=${trip.id}&token=${p.inviteToken}`;
    navigator.clipboard.writeText(link); setCopiedId(p.id); setTimeout(() => setCopiedId(null), 2000); addToast("Link kopiert!");
  };
  const getParticipantName = (id: string) => trip.participants.find(p => p.id === id)?.name || 'Unbekannt';

  return (
    <div className="space-y-8 relative">
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(t => <div key={t.id} className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in"><Check className="w-4 h-4 text-emerald-400" /> <span className="text-sm font-medium">{t.message}</span></div>)}
      </div>
      <div className="bg-indigo-900 rounded-2xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">{trip.title}</h2>
          <div className="flex items-center gap-4 text-indigo-200">
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</span>
            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {trip.participants.length} Teilnehmer</span>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-xl border border-white/20">
          <p className="text-indigo-200 text-sm font-medium uppercase tracking-wider mb-1">Budget</p>
          <p className="text-3xl font-bold">{totalSpent.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</p>
        </div>
      </div>
      <div className="flex border-b border-slate-200 overflow-x-auto">
        <button onClick={() => setActiveTab('expenses')} className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'expenses' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}><Euro className="w-4 h-4" /> Ausgaben</button>
        {isAdmin && <button onClick={() => setActiveTab('participants')} className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'participants' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}><Users className="w-4 h-4" /> Teilnehmer</button>}
        <button onClick={() => setActiveTab('settlement')} className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'settlement' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}><PieChart className="w-4 h-4" /> Abrechnung</button>
      </div>
      <div className="animate-in duration-300">
        {isAdmin && activeTab === 'participants' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-24">
                <h3 className="text-lg font-semibold mb-4">Neuer Teilnehmer</h3>
                <form onSubmit={addParticipant} className="space-y-4">
                  <input required type="text" value={pName} onChange={(e) => setPName(e.target.value)} placeholder="Name" className="w-full px-4 py-2 border border-slate-200 rounded-lg" />
                  <input required type="email" value={pEmail} onChange={(e) => setPEmail(e.target.value)} placeholder="E-Mail" className="w-full px-4 py-2 border border-slate-200 rounded-lg" />
                  <input required type="number" min="1" value={pCount} onChange={(e) => setPCount(parseInt(e.target.value))} className="w-full px-4 py-2 border border-slate-200 rounded-lg" />
                  <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Anlegen</button>
                </form>
              </div>
            </div>
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr><th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase">Teilnehmer</th><th className="px-6 py-4 text-right">Einladen</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {trip.participants.map(p => (
                    <tr key={p.id}>
                      <td className="px-6 py-4"><div className="font-bold text-slate-800">{p.name}</div><div className="text-xs text-slate-500">{p.email}</div></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openMailClient(p)} className="p-2 text-indigo-600 bg-indigo-50 rounded-lg"><Mail className="w-4 h-4" /></button>
                          <button onClick={() => copyInviteLink(p)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">{copiedId === p.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}</button>
                          <button onClick={() => onUpdateTrip({...trip, participants: trip.participants.filter(pt => pt.id !== p.id)})} className="p-2 text-slate-300 hover:text-red-500 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'expenses' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <form onSubmit={addExpense} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-24 space-y-4">
                <input required type="number" step="0.01" value={eAmount} onChange={(e) => setEAmount(e.target.value)} placeholder="0,00 €" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-lg font-bold" />
                {!isGuest && (
                  <select required value={ePayer} onChange={(e) => setEPayer(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg">
                    <option value="">Wer hat gezahlt?</option>
                    {trip.participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                )}
                <input required type="text" value={eReason} onChange={(e) => setEReason(e.target.value)} placeholder="Zweck" className="w-full px-4 py-2 border border-slate-200 rounded-lg" />
                <input required type="date" min={trip.startDate} max={trip.endDate} value={eDate} onChange={(e) => setEDate(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg" />
                <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold">Speichern</button>
              </form>
            </div>
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 border-b bg-slate-50/50 font-bold text-sm text-slate-600 flex items-center gap-2"><History className="w-4 h-4 text-indigo-500" /> Historie</div>
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 uppercase tracking-widest">
                  <tr><th className="px-6 py-4">Datum</th>{!isGuest && <th className="px-6 py-4">Zahler</th>}<th className="px-6 py-4">Zweck</th><th className="px-6 py-4 text-right">Summe</th><th className="px-6 py-4"></th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayExpenses.map(e => (
                    <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-xs text-slate-500">{new Date(e.date).toLocaleDateString()}</td>
                      {!isGuest && <td className="px-6 py-4 text-sm font-bold text-slate-700">{getParticipantName(e.payerId)}</td>}
                      <td className="px-6 py-4 text-sm">{e.reason}</td>
                      <td className="px-6 py-4 text-right font-black">{e.amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</td>
                      <td className="px-6 py-4 text-right"><button onClick={() => removeExpense(e.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'settlement' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {balances.map(b => (
                <div key={b.participantId} className={`p-6 rounded-2xl border shadow-sm transition-all ${b.participantId === (isGuest ? role.participantId : '') ? 'bg-indigo-50 border-indigo-200 ring-4 ring-indigo-500/10' : 'bg-white border-slate-200'}`}>
                  <h4 className="font-bold text-lg mb-4 text-slate-800 border-b pb-2 flex items-center justify-between">{b.name} {b.participantId === (isGuest ? role.participantId : '') && <span className="bg-indigo-600 text-white text-[8px] px-2 py-0.5 rounded-full">Du</span>}</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs"><span className="text-slate-400">Bezahlt:</span><span className="font-bold">{b.paid.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-slate-400">Soll:</span><span className="font-bold">{b.targetShare.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span></div>
                    <div className="pt-3 border-t flex justify-between items-center"><span className="text-[10px] font-bold uppercase text-slate-400">Saldo</span><span className={`text-xl font-black ${b.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{b.balance >= 0 ? '+' : ''}{b.balance.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl overflow-hidden relative">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3"><Send className="w-6 h-6 text-indigo-400" /> Zahlungsausgleich</h3>
              {settlements.length === 0 ? <p className="text-slate-400 italic">Keine Zahlungen nötig.</p> : (
                <div className="grid gap-4">
                  {settlements.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between p-5 rounded-2xl border border-white/10 bg-white/5">
                      <div className="text-sm"><span className="font-bold text-lg">{getParticipantName(s.from)}</span> <span className="text-white/40 uppercase text-[10px] mx-2">zahlt an</span> <span className="font-bold text-lg">{getParticipantName(s.to)}</span></div>
                      <div className="text-2xl font-black text-indigo-400">{s.amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripDetail;
