
import { Trip } from '../types';

const API_URL = '/api/trips';

export const storageService = {
  getTrips: async (): Promise<Trip[]> => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error (${response.status}):`, errorText);
        throw new Error(`Fehler beim Laden der Reisen: Status ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Storage Service Error:", error);
      return [];
    }
  },

  saveTrips: async (trips: Trip[]): Promise<void> => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trips),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Save Error (${response.status}):`, errorText);
        throw new Error(`Fehler beim Speichern: Status ${response.status}`);
      }
    } catch (error) {
      console.error("Storage Service Save Error:", error);
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
