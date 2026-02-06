
import { Trip } from '../types';

const API_URL = '/api/trips';
const FALLBACK_KEY = 'tripsplit_local_db';

export const storageService = {
  getTrips: async (): Promise<Trip[]> => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      
      if (!response.ok) {
        console.warn("API ist noch nicht konfiguriert (Marketplace-Setup fehlt). Nutze lokalen Modus.");
        throw new Error(data.error || 'Server Error');
      }
      
      const trips = Array.isArray(data) ? data : [];
      localStorage.setItem(FALLBACK_KEY, JSON.stringify(trips));
      return trips;
    } catch (error) {
      const local = localStorage.getItem(FALLBACK_KEY);
      return local ? JSON.parse(local) : [];
    }
  },

  saveTrips: async (trips: Trip[]): Promise<void> => {
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(trips));
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trips),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Cloud Save Failed');
      }
    } catch (error) {
      console.info("Info: Cloud-Speicherung noch nicht aktiv (Upstash Setup fehlt). Daten sind nur in diesem Browser sicher.");
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
