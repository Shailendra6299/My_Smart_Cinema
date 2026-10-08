import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import QRCode from 'qrcode';
import { movie } from '../data/movie';
import type { Booking } from '../types';

type TicketPageProps = {
  bookings: Booking[];
};

export default function TicketPage({ bookings }: TicketPageProps) {
  const { bookingId } = useParams();
  const [qrCode, setQrCode] = useState('');

  const booking = bookings.find((item) => item.id === bookingId);

  useEffect(() => {
    if (!booking) {
      return;
    }

    const payload = JSON.stringify({ bookingId: booking.id, seat: booking.seat });

    QRCode.toDataURL(payload)
      .then((result) => setQrCode(result))
      .catch(() => setQrCode(''));
  }, [booking]);

  if (!booking) {
    return (
      <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-center">
        <h1 className="text-3xl font-bold text-white">Ticket not found</h1>
        <p className="mt-3 text-slate-300">This booking could not be found.</p>
        <Link to="/seats" className="mt-6 inline-block rounded-full bg-amber-400 px-6 py-3 font-semibold text-slate-950">
          Book another seat
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30 md:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-amber-300">Digital Ticket</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Booking Confirmed</h1>
        </div>
        <Link to="/seats" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/5">
          Book Another Seat
        </Link>
      </div>

      <div className="grid gap-6 rounded-3xl border border-amber-400/20 bg-slate-950/80 p-6 md:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4 text-sm text-slate-200">
          <div>
            <p className="text-slate-400">Cinema</p>
            <p className="text-lg font-semibold text-white">{movie.theatreName}</p>
          </div>

          <div>
            <p className="text-slate-400">Movie</p>
            <p className="text-lg font-semibold text-white">{movie.title}</p>
          </div>

          <div>
            <p className="text-slate-400">Customer</p>
            <p className="text-white">{booking.customerName}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-slate-400">Seat</p>
              <p className="text-white">{booking.seat}</p>
            </div>
            <div>
              <p className="text-slate-400">Booking ID</p>
              <p className="text-white">{booking.id}</p>
            </div>
            <div>
              <p className="text-slate-400">Date</p>
              <p className="text-white">{booking.showDate}</p>
            </div>
            <div>
              <p className="text-slate-400">Time</p>
              <p className="text-white">{booking.showTime}</p>
            </div>
          </div>

          <div>
            <p className="text-slate-400">Theatre</p>
            <p className="text-white">{booking.theatreName}</p>
          </div>

          <div>
            <p className="text-slate-400">Screen</p>
            <p className="text-white">{booking.screenName}</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-slate-900 p-4">
          {qrCode ? <img src={qrCode} alt="Booking QR code" className="h-48 w-48 rounded-xl bg-white p-3" /> : <div className="h-48 w-48 rounded-xl bg-slate-800" />}
          <p className="mt-3 text-center text-xs uppercase tracking-[0.2em] text-slate-400">Scan at entry</p>
        </div>
      </div>
    </section>
  );
}
