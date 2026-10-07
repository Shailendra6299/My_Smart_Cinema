import { Link } from 'react-router-dom';
import { movie } from '../data/movie';

export default function MoviePage() {
  return (
    <section className="grid gap-8 rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30 md:grid-cols-[1fr_1.2fr] md:p-8">
      <img src={movie.posterUrl} alt={movie.title} className="h-full min-h-[420px] w-full rounded-2xl object-cover" />

      <div className="flex flex-col justify-center">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-amber-300">Movie Details</p>
        <h1 className="text-3xl font-black text-white md:text-5xl">{movie.title}</h1>

        <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-200">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{movie.genre}</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{movie.durationMinutes} min</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">⭐ {movie.rating}</span>
        </div>

        <p className="mt-6 text-base leading-7 text-slate-300">{movie.description}</p>

        <div className="mt-6 space-y-2 text-sm text-slate-200">
          <p><span className="text-slate-400">Theatre:</span> {movie.theatreName}</p>
          <p><span className="text-slate-400">Screen:</span> {movie.screenName}</p>
          <p><span className="text-slate-400">Date:</span> {movie.showDate}</p>
          <p><span className="text-slate-400">Time:</span> {movie.showTime}</p>
        </div>

        <div className="mt-8">
          <Link
            to="/seats"
            className="inline-flex rounded-full bg-amber-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-amber-300"
          >
            Book Now
          </Link>
        </div>
      </div>
    </section>
  );
}
