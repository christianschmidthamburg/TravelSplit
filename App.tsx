
import React, { useState, useEffect } from 'react';
import { Trip, UserRole } from './types';
import { storageService } from './services/storage';
import TripList from './components/TripList';
import TripDetail from './components/TripDetail';
import Login from './components/Login';

// Import icons correctly from lucide-react
import { 
  Plus as PlusIcon, 
  Plane as PlaneIcon, 
  ChevronLeft as BackIcon, 
  LogOut as LogOutIcon, 
  User as UserAvatar,
  Loader2 as LoadingIcon 
} from 'lucide-react';

const App: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [isAddingTrip, setIsAddingTrip] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<UserRole>({ type: 'none' });

  useEffect(() => {
    const initApp = async () => {
      setIsLoading(true);
      try {
        const loadedTrips = await storageService.getTrips();
        setTrips(loadedTrips);

        const params = new URLSearchParams(window.location.search);
        const tripId = params.get('tripId');
        const token = params.get('token');

        if (tripId && token) {
          const trip = loadedTrips.find(t => t.id === tripId);
          const participant = trip?.participants.find(p => p.inviteToken === token);
          if (participant) {
            setRole({ type: 'guest', participantId: participant.id, tripId });
            setSelectedTripId(tripId);
          }
        } else {
          const isAdmin = localStorage.getItem('tripsplit_admin') === 'true';
          if (isAdmin) {
            setRole({ type: 'admin' });
          }
        }
      } catch (err) {
        console.error("Initialization failed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  const handleLogin = (password: string) => {
    if (password === 'admin123') {
      setRole({ type: 'admin' });
      localStorage.setItem('tripsplit_admin', 'true');
    } else {
      alert('Falsches Passwort');
    }
  };

  const handleLogout = () => {
    setRole({ type: 'none' });
    setSelectedTripId(null);
    localStorage.removeItem('tripsplit_admin');
    window.history.replaceState({}, '', window.location.pathname);
  };

  const handleAddTrip = async (newTrip: Trip) => {
    setIsLoading(true);
    await storageService.addTrip(newTrip);
    const updated = await storageService.getTrips();
    setTrips(updated);
    setIsAddingTrip(false);
    setIsLoading(false);
  };

  const handleUpdateTrip = async (updatedTrip: Trip) => {
    await storageService.updateTrip(updatedTrip);
    const updated = await storageService.getTrips();
    setTrips(updated);
  };

  const handleDeleteTrip = async (id: string) => {
    if (window.confirm('Möchten Sie diese Reise wirklich löschen?')) {
      setIsLoading(true);
      await storageService.deleteTrip(id);
      const updated = await storageService.getTrips();
      setTrips(updated);
      if (selectedTripId === id) setSelectedTripId(null);
      setIsLoading(false);
    }
  };

  const selectedTrip = trips.find(t => t.id === (role.type === 'guest' ? role.tripId : selectedTripId));

  if (role.type === 'none') {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => role.type === 'admin' && setSelectedTripId(null)}>
            <div className="bg-indigo-600 p-2 rounded-lg"><PlaneIcon className="w-5 h-5 text-white" /></div>
            <h1 className="text-xl font-bold tracking-tight">TripSplit</h1>
          </div>
          <div className="flex items-center gap-4">
            {role.type === 'admin' && !selectedTripId && (
              <button onClick={() => setIsAddingTrip(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                <PlusIcon className="w-4 h-4" /> <span className="hidden sm:inline">Neue Reise</span>
              </button>
            )}
            {role.type === 'admin' && selectedTripId && (
              <button onClick={() => setSelectedTripId(null)} className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm font-medium transition-colors">
                <BackIcon className="w-4 h-4" /> <span>Übersicht</span>
              </button>
            )}
            <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
              <div className="flex items-center gap-2 text-slate-600 text-sm font-medium"><UserAvatar className="w-4 h-4" /> <span>{role.type === 'admin' ? 'Admin' : 'Gast'}</span></div>
              <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Abmelden"><LogOutIcon className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-sm z-20 flex items-center justify-center">
            <LoadingIcon className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        )}
        
        {role.type === 'admin' && !selectedTripId ? (
          <TripList trips={trips} onSelectTrip={setSelectedTripId} isAdding={isAddingTrip} onCancelAdd={() => setIsAddingTrip(false)} onAddTrip={handleAddTrip} onDeleteTrip={handleDeleteTrip} />
        ) : (
          selectedTrip && <TripDetail trip={selectedTrip} onUpdateTrip={handleUpdateTrip} role={role} />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} TripSplit - Reiseausgaben einfach teilen
        </div>
      </footer>
    </div>
  );
};

export default App;
