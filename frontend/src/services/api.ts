import axios from 'axios';
import type { Vehicle, ParkingSlot, ParkingSession } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// --- Vehicles ---
export const vehicleApi = {
  getAll: () => api.get<Vehicle[]>('/vehicles').then(r => r.data),
  getById: (id: string) => api.get<Vehicle>(`/vehicles/${id}`).then(r => r.data),
  register: (data: {
    registrationNo: string;
    type: string;
    ownerName?: string;
    phoneNumber?: string;
  }) => api.post<Vehicle>('/vehicles', data).then(r => r.data),
};

// --- Parking Slots ---
export const slotApi = {
  getAll: () => api.get<ParkingSlot[]>('/slots').then(r => r.data),
  create: (data: { slotNumber: string; type: string; parkingLotId: string }) =>
    api.post<ParkingSlot>('/slots', data).then(r => r.data),
  updateStatus: (id: string, status: string) =>
    api.patch<ParkingSlot>(`/slots/${id}/status`, { status }).then(r => r.data),
};

// --- Parking Sessions ---
export const sessionApi = {
  getActive: () => api.get<ParkingSession[]>('/sessions/active').then(r => r.data),
  create: (data: { vehicleId: string; slotId: string }) =>
    api.post<ParkingSession>('/sessions', data).then(r => r.data),
  complete: (id: string, paymentMethod: string) =>
    api.post<{ session: ParkingSession; payment: { amount: number } }>(
      `/sessions/${id}/complete`,
      { paymentMethod }
    ).then(r => r.data),
};

export default api;
