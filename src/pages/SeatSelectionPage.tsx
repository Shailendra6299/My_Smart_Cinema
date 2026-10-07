import { useNavigate } from 'react-router-dom';
import { seatNumbers } from '../data/seats';
import { getAvailableSeats } from '../services/booking';
import type { Booking } from '../types';

type SeatSelectionPageProps = {
  bookings: Booking[];
};

export default function SeatSelectionPage({ bookings }: SeatSelectionPageProps) {
  const navigate = useNavigate();
  const availableSeats = getAvailableSeats(bookings);

  const handleSeatSelection = (seat: (typeof seatNumbers)[number]) => {
    if (!availableSeats.includes(seat)) {
      return;
    }

    navigate('/booking', { state: { selectedSeat: seat } });
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30 md:p-8">
      <div className="mb-8 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-amber-300">Seat Selection</p>
        <h1 className="mt-3 text-3xl font-bold text-white">Choose Your Seat</h1>
      </div>

      <div className="mx-auto mb-8 w-full max-w-xl rounded-2xl border border-white/10 bg-slate-950/60 p-4">
        <div className="mb-4 text-center text-sm uppercase tracking-[0.35em] text-slate-300">Screen</div>
        <div className="mx-auto h-2 w-full rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500" />
      </div>

      <div className="grid max-w-2xl grid-cols-2 gap-5 mx-auto">
        {seatNumbers.map((seat) => {
          const isAvailable = availableSeats.includes(seat);

          return (
            <button
              key={seat}
              type="button"
              disabled={!isAvailable}
              onClick={() => handleSeatSelection(seat)}
              className={`rounded-2xl border p-5 text-left transition ${
                isAvailable
                  ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-100 hover:border-emerald-300 hover:bg-emerald-500/20'
                  : 'cursor-not-allowed border-red-400/40 bg-red-500/10 text-red-300'
              }`}
            >
              <div className="text-xs uppercase tracking-[0.18em] text-slate-300">Seat</div>
              <div className="mt-3 text-2xl font-bold">{seat}</div>
              <div className="mt-2 text-sm">{isAvailable ? 'Available' : 'Booked'}</div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-300">
        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-emerald-400" /> Available</span>
        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-red-400" /> Booked</span>
      </div>
    </section>
  );
}
