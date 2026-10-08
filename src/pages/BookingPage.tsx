import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { movie } from '../data/movie';
import type { Booking, Show } from '../types';

type BookingPageProps = {
  onCreateBooking: (input: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    seat: string;
    show: Show;
  }) => Booking;
  show: Show | null;
  showLoading: boolean;
};

type LocationState = {
  selectedSeat?: string;
};

export default function BookingPage({ onCreateBooking, show, showLoading }: BookingPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedSeat = (location.state as LocationState | null)?.selectedSeat;

  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });
  const [error, setError] = useState('');

  if (!show) {
    return (
      <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-center">
        <h1 className="text-3xl font-bold text-white">{showLoading ? 'Loading show schedule' : 'No upcoming show'}</h1>
        <p className="mt-3 text-slate-300">{showLoading ? 'Please wait while we load the show details.' : 'Please check back when another show is scheduled.'}</p>
        <button
          type="button"
          onClick={() => navigate('/movie')}
          className="mt-6 rounded-full bg-amber-400 px-6 py-3 font-semibold text-slate-950"
        >
          Back to movie
        </button>
      </section>
    );
  }

  if (!selectedSeat) {
    return (
      <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-center">
        <h1 className="text-3xl font-bold text-white">No seat selected</h1>
        <p className="mt-3 text-slate-300">Please choose a seat before continuing.</p>
        <button
          type="button"
          onClick={() => navigate('/seats')}
          className="mt-6 rounded-full bg-amber-400 px-6 py-3 font-semibold text-slate-950"
        >
          Go to seats
        </button>
      </section>
    );
  }

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError('');
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.customerName.trim() || !form.customerEmail.trim() || !form.customerPhone.trim()) {
      setError('Please fill in all customer details.');
      return;
    }

    try {
      const booking = onCreateBooking({
        customerName: form.customerName.trim(),
        customerEmail: form.customerEmail.trim(),
        customerPhone: form.customerPhone.trim(),
        seat: selectedSeat,
        show,
      });

      navigate(`/ticket/${booking.id}`);
    } catch (bookingError) {
      setError(
        bookingError instanceof Error
          ? bookingError.message
          : 'This seat is already booked. Please choose another one.'
      );
    }
  };

  return (
    <section className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30 md:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-300">Customer Details</p>
        <h1 className="mt-3 text-3xl font-bold text-white">Complete Your Booking</h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Full Name</label>
            <input
              value={form.customerName}
              onChange={(event) => handleChange('customerName', event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-500 focus:border-amber-400"
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Email</label>
            <input
              type="email"
              value={form.customerEmail}
              onChange={(event) => handleChange('customerEmail', event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-amber-400"
              placeholder="Enter email"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Phone Number</label>
            <input
              value={form.customerPhone}
              onChange={(event) => handleChange('customerPhone', event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-amber-400"
              placeholder="Enter phone number"
            />
          </div>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}

          <button
            type="submit"
            className="w-full rounded-full bg-amber-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-amber-300"
          >
            Confirm Booking
          </button>
        </form>
      </div>

      <aside className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30 md:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-300">Booking Summary</p>
        <div className="mt-5 space-y-4 text-sm text-slate-200">
          <div>
            <p className="text-slate-400">Movie</p>
            <p className="mt-1 text-lg font-semibold text-white">{movie.title}</p>
          </div>
          <div>
            <p className="text-slate-400">Seat</p>
            <p className="mt-1 text-lg font-semibold text-white">{selectedSeat}</p>
          </div>
          <div>
            <p className="text-slate-400">Date</p>
            <p className="mt-1 text-white">{show.showDate}</p>
          </div>
          <div>
            <p className="text-slate-400">Time</p>
            <p className="mt-1 text-white">{show.showTime}</p>
          </div>
          <div>
            <p className="text-slate-400">Theatre</p>
            <p className="mt-1 text-white">{show.theatreName}</p>
          </div>
          <div>
            <p className="text-slate-400">Screen</p>
            <p className="mt-1 text-white">{show.screenName}</p>
          </div>
        </div>
      </aside>
    </section>
  );
}
