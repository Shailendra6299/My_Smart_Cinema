import { seatNumbers, type SeatNumber } from '../data/seats';
import type { Booking, SeatFinalStatus, SeatStatusInfo, SensorStatus } from '../types';

export function getAvailableSeats(bookings: Booking[]): SeatNumber[] {
  return seatNumbers.filter(
    (seat) => !bookings.some((booking) => booking.seat === seat),
  );
}

export function getBookedSeats(bookings: Booking[]): SeatNumber[] {
  return seatNumbers.filter((seat) => bookings.some((booking) => booking.seat === seat));
}

export function createBookingCode(bookingsCount: number) {
  return `BK${String(bookingsCount + 1).padStart(3, '0')}`;
}

export function getSeatStatus(
  booking: Booking | undefined,
  sensorOccupied: boolean,
): SeatStatusInfo {
  const hasBooking = Boolean(booking);
  const hasQrScan = Boolean(booking?.qrScanned);

  if (!hasBooking && !sensorOccupied) {
    return {
      status: 'AVAILABLE',
      label: 'AVAILABLE',
      colorClass: 'border-emerald-500/60 bg-emerald-500/10 text-emerald-200',
      description: 'No booking and sensor is clear.',
    };
  }

  if (hasBooking && !hasQrScan && !sensorOccupied) {
    return {
      status: 'WAITING',
      label: 'WAITING',
      colorClass: 'border-red-500/60 bg-red-500/10 text-red-200',
      description: 'Booking exists but QR verification has not happened yet.',
    };
  }

  if (hasBooking && hasQrScan && !sensorOccupied) {
    return {
      status: 'ARRIVED',
      label: 'ARRIVED',
      colorClass: 'border-yellow-500/60 bg-yellow-500/10 text-yellow-200',
      description: 'Verified guest is present but not yet seated.',
    };
  }

  if (hasBooking && hasQrScan && sensorOccupied) {
    return {
      status: 'SEATED',
      label: 'SEATED',
      colorClass: 'border-violet-500/60 bg-violet-500/10 text-violet-200',
      description: 'Verified guest detected in the seat.',
    };
  }

  return {
    status: 'UNAUTHORIZED',
    label: 'UNAUTHORIZED',
    colorClass: 'border-blue-500/60 bg-blue-500/10 text-blue-200',
    description: 'Sensor detected occupancy without a valid booking.',
  };
}

export function verifyBooking(
  bookings: Booking[],
  bookingId: string,
): { booking: Booking | null; updatedBookings: Booking[] } {
  const existingBooking = bookings.find((booking) => booking.id.toLowerCase() === bookingId.toLowerCase());

  if (!existingBooking) {
    return { booking: null, updatedBookings: bookings };
  }

  if (existingBooking.qrScanned) {
    return { booking: existingBooking, updatedBookings: bookings };
  }

  const now = new Date().toISOString();
  const verifiedBooking: Booking = {
    ...existingBooking,
    qrScanned: true,
    qrScannedAt: now,
  };

  return {
    booking: verifiedBooking,
    updatedBookings: bookings.map((booking) =>
      booking.id === existingBooking.id ? verifiedBooking : booking,
    ),
  };
}

export function verifyBookingTicket(
  bookings: Booking[],
  bookingId: string,
): { booking: Booking | null; updatedBookings: Booking[] } {
  return verifyBooking(bookings, bookingId);
}

export function getSeatFinalStatus(
  booking: Booking | undefined,
  sensorStatus: SensorStatus,
): SeatFinalStatus {
  return getSeatStatus(booking, sensorStatus === 'OCCUPIED').status;
}
