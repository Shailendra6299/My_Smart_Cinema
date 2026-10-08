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
  showId: number;
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

export type Show = {
  id: number;
  movieId: number;
  showDate: string;
  showTime: string;
  theatreName: string;
  screenName: string;
};
