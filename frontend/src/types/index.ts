export type VehicleType = 'CAR' | 'MOTORCYCLE' | 'TRUCK';
export type SlotStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
export type SessionStatus = 'ACTIVE' | 'COMPLETED';
export type PaymentMethod = 'CASH' | 'CARD' | 'ONLINE';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface Vehicle {
  id: string;
  registrationNo: string;
  type: VehicleType;
  ownerName?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParkingLot {
  id: string;
  name: string;
  location: string;
}

export interface ParkingSlot {
  id: string;
  slotNumber: string;
  type: VehicleType;
  status: SlotStatus;
  parkingLotId: string;
  parkingLot?: ParkingLot;
  createdAt: string;
  updatedAt: string;
}

export interface ParkingSession {
  id: string;
  vehicleId: string;
  vehicle: Vehicle;
  slotId: string;
  slot: ParkingSlot;
  entryTime: string;
  exitTime?: string;
  status: SessionStatus;
  fee?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  sessionId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  paymentTime: string;
}
