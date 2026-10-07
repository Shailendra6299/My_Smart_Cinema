import { Link } from 'react-router-dom';
import { movie } from '../data/movie';
import { getAvailableSeats } from '../services/booking';
import type { Booking } from '../types';

type HomePageProps = {
  bookings: Booking[];
};

export default function HomePage({ bookings }: HomePageProps) {
  const availableSeats = getAvailableSeats(bookings);

  return (
    <section className="mx-auto max-w-5xl">
      <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-8 shadow-2xl shadow-slate-950/30 md:p-12">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-300">SMART CINEMA</p>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-white md:text-6xl">Seat Booking & Monitoring System</h1>
          <p className="mt-4 text-lg text-slate-300">Book. Verify. Monitor.</p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <Link
            to="/movie"
            className="rounded-3xl border border-amber-400/30 bg-amber-400/10 p-6 text-left transition hover:border-amber-300 hover:bg-amber-400/15"
          >
            <div className="mb-4 inline-flex rounded-full bg-amber-400/15 p-3 text-2xl">🎬</div>
            <h2 className="text-2xl font-bold text-white">CUSTOMER</h2>
            <p className="mt-3 text-slate-200">Book your movie ticket</p>
          </Link>

          <Link
            to="/admin-login"
            className="rounded-3xl border border-white/10 bg-white/5 p-6 text-left transition hover:border-white/20 hover:bg-white/10"
          >
            <div className="mb-4 inline-flex rounded-full bg-white/10 p-3 text-2xl">🔐</div>
            <h2 className="text-2xl font-bold text-white">STAFF / ADMIN</h2>
            <p className="mt-3 text-slate-200">Manage bookings & verify tickets</p>
          </Link>
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-slate-950/50 p-5 text-center">
          <p className="text-sm text-slate-300">Now showing: {movie.title}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-amber-300">Available seats: {availableSeats.length}</p>
        </div>
      </div>
    </section>
  );
}
