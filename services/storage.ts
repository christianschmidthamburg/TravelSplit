
import { Trip } from '../types';

const STORAGE_KEY = 'tripsplit_trips';

export const storageService = {
  getTrips: (): Trip[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveTrips: (trips: Trip[]): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  },

  getTrip: (id: string): Trip | undefined => {
    const trips = storageService.getTrips();
    return trips.find(t => t.id === id);
  },

  addTrip: (trip: Trip): void => {
    const trips = storageService.getTrips();
    storageService.saveTrips([...trips, trip]);
  },

  updateTrip: (updatedTrip: Trip): void => {
    const trips = storageService.getTrips();
    storageService.saveTrips(trips.map(t => t.id === updatedTrip.id ? updatedTrip : t));
  },

  deleteTrip: (id: string): void => {
    const trips = storageService.getTrips();
    storageService.saveTrips(trips.filter(t => t.id !== id));
  }
};
