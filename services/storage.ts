
import { Trip } from '../types';

const API_URL = '/api/trips';
const FALLBACK_KEY = 'tripsplit_local_db';

export const storageService = {
  getTrips: async (): Promise<Trip[]> => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('API Error');
      
      const data = await response.json();
      const trips = Array.isArray(data) ? data : [];
      
      // Lokal spiegeln für Offline/Fallback
      localStorage.setItem(FALLBACK_KEY, JSON.stringify(trips));
      return trips;
    } catch (error) {
      console.warn("Nutze LocalStorage Fallback:", error);
      const local = localStorage.getItem(FALLBACK_KEY);
      return local ? JSON.parse(local) : [];
    }
  },

  saveTrips: async (trips: Trip[]): Promise<void> => {
    // Immer zuerst lokal sichern
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(trips));
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trips),
      });
      if (!response.ok) throw new Error('Cloud Save Failed');
    } catch (error) {
      console.error("Daten konnten nicht in der Cloud gespeichert werden (nur lokal):", error);
    }
  },

  addTrip: async (trip: Trip): Promise<void> => {
    const trips = await storageService.getTrips();
    await storageService.saveTrips([...trips, trip]);
  },

  updateTrip: async (updatedTrip: Trip): Promise<void> => {
    const trips = await storageService.getTrips();
    await storageService.saveTrips(trips.map(t => t.id === updatedTrip.id ? updatedTrip : t));
  },

  deleteTrip: async (id: string): Promise<void> => {
    const trips = await storageService.getTrips();
    await storageService.saveTrips(trips.filter(t => t.id !== id));
  }
};
