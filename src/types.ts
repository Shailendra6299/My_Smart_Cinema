export type SensorStatus = 'EMPTY' | 'OCCUPIED';
export type SeatFinalStatus =
  | 'AVAILABLE'
  | 'WAITING'
  | 'ARRIVED'
  | 'SEATED'
  | 'UNAUTHORIZED';

export type SeatStatusInfo = {
  status: SeatFinalStatus;
  label: string;
  colorClass: string;
  description: string;
};

export type ActivityEntry = {
  id: number;
  time: string;
  message: string;
};

export type Booking = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  seat: string;
  movieTitle: string;
  showDate: string;
  showTime: string;
  theatreName: string;
  screenName: string;
  qrScanned: boolean;
  qrScannedAt: string | null;
};
