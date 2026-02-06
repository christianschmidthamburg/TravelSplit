
import React, { useState } from 'react';
import { Trip } from '../types';
import { Calendar, Users, Wallet, Trash2, Plane } from 'lucide-react';

interface TripListProps {
  trips: Trip[];
  onSelectTrip: (id: string) => void;
  isAdding: boolean;
  onCancelAdd: () => void;
  onAddTrip: (trip: Trip) => void;
  onDeleteTrip: (id: string) => void;
}

const TripList: React.FC<TripListProps> = ({ trips, onSelectTrip, isAdding, onCancelAdd, onAddTrip, onDeleteTrip }) => {
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !start || !end) return;
    const newTrip: Trip = {
      id: crypto.randomUUID(),
      title,
      startDate: start,
      endDate: end,
      participants: [],
      expenses: []
    };
    onAddTrip(newTrip);
    setTitle(''); setStart(''); setEnd('');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Meine Reisen</h2>
      {isAdding && (
        <div className="bg-white p-6 rounded-xl border border-indigo-100 shadow-sm mb-8 animate-in duration-300">
          <h3 className="text-lg font-semibold mb-4 text-indigo-900">Neue Reise planen</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reisetitel</label>
              <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sommerurlaub 2024" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Beginn</label>
                <input required type="date" value={start} onChange={(e) => setStart(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ende</label>
                <input required type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">Erstellen</button>
              <button type="button" onClick={onCancelAdd} className="text-slate-500 px-6 py-2 hover:bg-slate-100 rounded-lg transition-colors">Abbrechen</button>
            </div>
          </form>
        </div>
      )}
      {trips.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <Plane className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600">Noch keine Reisen erfasst</h3>
          <p className="text-slate-400">Klicken Sie auf "Neue Reise", um zu starten.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map(trip => (
            <div key={trip.id} className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer" onClick={() => onSelectTrip(trip.id)}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold group-hover:text-indigo-600 transition-colors">{trip.title}</h3>
                  <button onClick={(e) => { e.stopPropagation(); onDeleteTrip(trip.id); }} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-500 text-sm"><Calendar className="w-4 h-4" /> <span>{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</span></div>
                  <div className="flex items-center gap-2 text-slate-500 text-sm"><Users className="w-4 h-4" /> <span>{trip.participants.length} Teilnehmer</span></div>
                  <div className="flex items-center gap-2 text-indigo-600 text-sm font-semibold"><Wallet className="w-4 h-4" /> <span>Summe: {trip.expenses.reduce((s, e) => s + e.amount, 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span></div>
                </div>
              </div>
              <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-indigo-600 font-medium text-sm text-right">Details ansehen →</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TripList;
