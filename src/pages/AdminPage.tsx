import { Link } from 'react-router-dom';
import { movie } from '../data/movie';
import { seatNumbers } from '../data/seats';
import { getAvailableSeats, getBookedSeats, getSeatFinalStatus, getSeatStatus } from '../services/booking';
import type { ActivityEntry, Booking, SensorStatus } from '../types';

type AdminPageProps = {
  bookings: Booking[];
  sensorState: Record<string, SensorStatus>;
  activityLog: ActivityEntry[];
  userEmail?: string;
  onSensorChange: (seat: string, status: SensorStatus) => void;
  onResetDemo: () => void;
  onLogout: () => void | Promise<void>;
};

const statusLegend = [
  { key: 'AVAILABLE', label: 'AVAILABLE', color: 'bg-emerald-500' },
  { key: 'WAITING', label: 'WAITING', color: 'bg-red-500' },
  { key: 'ARRIVED', label: 'ARRIVED', color: 'bg-yellow-500' },
  { key: 'SEATED', label: 'SEATED', color: 'bg-violet-500' },
  { key: 'UNAUTHORIZED', label: 'UNAUTHORIZED', color: 'bg-blue-500' },
] as const;

export default function AdminPage({
  bookings,
  sensorState,
  activityLog,
  userEmail,
  onSensorChange,
  onResetDemo,
  onLogout,
}: AdminPageProps) {
  const availableSeats = getAvailableSeats(bookings);
  const bookedSeats = getBookedSeats(bookings);
  const qrScannedSeats = bookings.filter((booking) => booking.qrScanned).length;
  const seatedSeats = seatNumbers.filter((seat) => {
    const booking = bookings.find((item) => item.seat === seat);
    return getSeatFinalStatus(booking, sensorState[seat] ?? 'EMPTY') === 'SEATED';
  }).length;
  const unauthorizedSeats = seatNumbers.filter((seat) => {
    const booking = bookings.find((item) => item.seat === seat);
    return getSeatFinalStatus(booking, sensorState[seat] ?? 'EMPTY') === 'UNAUTHORIZED';
  }).length;

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/30">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-amber-300">SMART CINEMA</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Seat Booking & Monitoring System</h1>
            <p className="mt-2 text-sm text-slate-300">Screen 01</p>
          </div>

          <div className="flex flex-col items-start gap-3 md:items-end">
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-slate-200">
              <span className="font-semibold text-white">Staff/Admin</span>
              <span className="text-slate-400">{userEmail ?? 'Authenticated user'}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/admin"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
              >
                Dashboard
              </Link>
              <Link
                to="/scan"
                className="rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-sm font-medium text-amber-200 transition hover:bg-amber-400/15"
              >
                📷 Scan Ticket
              </Link>
              <button
                type="button"
                onClick={() => void onLogout()}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
              >
                Logout
              </button>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reset the demo to all seats available and empty sensors?')) {
                    onResetDemo();
                  }
                }}
                className="rounded-full border border-red-400/30 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-200 transition hover:bg-red-500/20"
              >
                RESET DEMO
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-amber-400/20 bg-amber-500/5 p-6 shadow-xl shadow-slate-950/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-amber-300">📷 QR TICKET VERIFICATION</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Scan a customer's ticket QR code</h2>
            <p className="mt-2 text-sm text-slate-300">to verify entry.</p>
          </div>

          <Link
            to="/scan"
            className="rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
          >
            SCAN TICKET
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">TOTAL SEATS</p>
          <p className="mt-3 text-3xl font-bold text-white">{seatNumbers.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">BOOKED</p>
          <p className="mt-3 text-3xl font-bold text-amber-300">{bookedSeats.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">AVAILABLE</p>
          <p className="mt-3 text-3xl font-bold text-emerald-400">{availableSeats.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">QR VERIFIED</p>
          <p className="mt-3 text-3xl font-bold text-cyan-400">{qrScannedSeats}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">SEATED</p>
          <p className="mt-3 text-3xl font-bold text-violet-400">{seatedSeats}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">UNAUTHORIZED</p>
          <p className="mt-3 text-3xl font-bold text-blue-400">{unauthorizedSeats}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/30">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-amber-300">SCREEN</p>
              <h2 className="mt-2 text-2xl font-bold text-white">{movie.title}</h2>
            </div>
            <span className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-xs uppercase tracking-[0.15em] text-slate-200">
              Demo Sensor Mode
            </span>
          </div>

          <div className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-center">
            <div className="mb-3 text-sm uppercase tracking-[0.35em] text-slate-300">SCREEN</div>
            <div className="h-2 w-full rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {seatNumbers.map((seat) => {
              const booking = bookings.find((item) => item.seat === seat);
              const sensorStatus = sensorState[seat] ?? 'EMPTY';
              const statusInfo = getSeatStatus(booking, sensorStatus === 'OCCUPIED');

              return (
                <button
                  key={seat}
                  type="button"
                  className={`rounded-2xl border p-4 text-left transition hover:scale-[1.01] ${statusInfo.colorClass}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-300">Seat</div>
                      <div className="mt-2 text-2xl font-bold">{seat}</div>
                    </div>
                    <span className="rounded-full border border-white/20 bg-slate-950/30 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]">
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <p><span className="text-slate-300">Booking:</span> {booking ? 'Booked' : 'Available'}</p>
                    <p><span className="text-slate-300">Customer:</span> {booking ? booking.customerName : '—'}</p>
                    <p><span className="text-slate-300">QR:</span> {booking ? (booking.qrScanned ? 'Verified' : 'Pending') : '—'}</p>
                    <p className="pt-1 text-xs uppercase tracking-[0.14em] text-slate-200">{statusInfo.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-200">
            {statusLegend.map((item) => (
              <span key={item.key} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/50 px-3 py-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                {item.label}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/30">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-300">DEMO SENSOR CONTROLS</p>
            <h2 className="mt-2 text-xl font-bold text-white">Simulation — Raspberry Pi hardware not connected</h2>
          </div>

          <div className="space-y-3">
            {seatNumbers.map((seat) => {
              const sensorStatus = sensorState[seat] ?? 'EMPTY';

              return (
                <div key={seat} className="rounded-2xl border border-white/10 bg-slate-950/50 p-3">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-white">{seat}</span>
                    <span className="text-slate-300">{sensorStatus}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onSensorChange(seat, 'EMPTY')}
                      className={`rounded-xl border px-3 py-2 text-sm font-medium ${
                        sensorStatus === 'EMPTY'
                          ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-200'
                          : 'border-white/10 bg-slate-900 text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      EMPTY
                    </button>
                    <button
                      type="button"
                      onClick={() => onSensorChange(seat, 'OCCUPIED')}
                      className={`rounded-xl border px-3 py-2 text-sm font-medium ${
                        sensorStatus === 'OCCUPIED'
                          ? 'border-violet-400/60 bg-violet-500/10 text-violet-200'
                          : 'border-white/10 bg-slate-900 text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      OCCUPIED
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/30">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-300">ADMIN BOOKING TABLE</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Live Booking Monitor</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-200">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                <th className="py-3 pr-4">Seat</th>
                <th className="py-3 pr-4">Booking ID</th>
                <th className="py-3 pr-4">Customer</th>
                <th className="py-3 pr-4">QR Status</th>
                <th className="py-3 pr-4">Sensor Status</th>
                <th className="py-3 pr-4">Final Status</th>
              </tr>
            </thead>
            <tbody>
              {seatNumbers.map((seat) => {
                const booking = bookings.find((item) => item.seat === seat);
                const sensorStatus = sensorState[seat] ?? 'EMPTY';
                const statusInfo = getSeatStatus(booking, sensorStatus === 'OCCUPIED');

                return (
                  <tr key={seat} className="border-b border-white/5 align-top">
                    <td className="py-3 pr-4 font-semibold text-white">{seat}</td>
                    <td className="py-3 pr-4">{booking ? booking.id : '—'}</td>
                    <td className="py-3 pr-4">{booking ? booking.customerName : '—'}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                        booking && booking.qrScanned
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                          : booking
                            ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-200'
                            : 'border-slate-500/40 bg-slate-500/10 text-slate-300'
                      }`}>
                        {booking ? (booking.qrScanned ? 'Verified' : 'Pending') : '—'}
                      </span>
                    </td>
                    <td className="py-3 pr-4">{sensorStatus}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusInfo.colorClass}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/30">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-300">LIVE ACTIVITY LOG</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Recent Events</h2>
        </div>

        <div className="space-y-3">
          {activityLog.length === 0 ? (
            <p className="text-slate-300">No recent activity.</p>
          ) : (
            activityLog.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-950/50 p-3">
                <span className="mt-0.5 inline-flex h-2.5 w-2.5 rounded-full bg-amber-400" />
                <div>
                  <p className="text-sm text-slate-300">{entry.time}</p>
                  <p className="text-white">{entry.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
