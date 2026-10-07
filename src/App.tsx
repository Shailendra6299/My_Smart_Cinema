import { Navigate, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { AuthSession } from '@supabase/supabase-js';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import MoviePage from './pages/MoviePage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import BookingPage from './pages/BookingPage';
import TicketPage from './pages/TicketPage';
import ScanPage from './pages/ScanPage';
import AdminPage from './pages/AdminPage';
import AdminLoginPage from './pages/AdminLoginPage';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import { createBookingCode, getSeatStatus, verifyBooking } from './services/booking';
import type { ActivityEntry, Booking, SensorStatus } from './types';

const initialSensorState: Record<string, SensorStatus> = {
  R01: 'EMPTY',
  R02: 'EMPTY',
  R03: 'EMPTY',
  R04: 'EMPTY',
};

const seatIdMap: Record<string, number> = {
  R01: 1,
  R02: 2,
  R03: 3,
  R04: 4,
};

const formatClock = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

function ProtectedRoute({ children, session }: { children: React.ReactNode; session: AuthSession | null }) {
  if (!isSupabaseConfigured || !supabase) {
    return <Navigate to="/admin-login" replace />;
  }

  if (!session) {
    return <Navigate to="/admin-login" replace />;
  }

  return <>{children}</>;
}

function App() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [sensorState, setSensorState] = useState<Record<string, SensorStatus>>(initialSensorState);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([
    { id: Date.now(), time: formatClock(), message: 'Admin dashboard initialized in demo mode.' },
  ]);

  const appendActivity = (message: string) => {
    setActivityLog((current) => [
      { id: Date.now() + Math.random(), time: formatClock(), message },
      ...current,
    ].slice(0, 12));
  };

  const loadSupabaseData = async () => {
    if (!supabase || !isSupabaseConfigured) {
      return;
    }

    try {
      const [{ data: bookingData, error: bookingError }, { data: sensorData, error: sensorError }] = await Promise.all([
        supabase.from('bookings').select('*, seats:seat_id(seat_number)').order('created_at', { ascending: true }),
        supabase.from('sensor_logs').select('*').order('created_at', { ascending: false }),
      ]);

      if (!bookingError && bookingData) {
        const mappedBookings: Booking[] = bookingData.map((row: any) => ({
          id: row.booking_code ?? `BK${String(row.id).padStart(3, '0')}`,
          customerName: row.customer_name ?? 'Guest',
          customerEmail: row.customer_email ?? 'guest@example.com',
          customerPhone: row.phone ?? '',
          seat: row.seats?.seat_number ?? row.seat ?? 'R01',
          movieTitle: 'The Midnight Circuit',
          showDate: '2026-10-07',
          showTime: '19:30',
          theatreName: 'Smart Cinema Hall',
          screenName: 'Screen 01',
          qrScanned: Boolean(row.qr_scanned),
          qrScannedAt: row.qr_scanned_at ?? null,
        }));

        setBookings(mappedBookings);
      }

      if (!sensorError && sensorData) {
        const latestBySeat = new Map<string, SensorStatus>();

        sensorData.forEach((row: any) => {
          const seatNumber = Object.keys(seatIdMap).find((key) => seatIdMap[key] === Number(row.seat_id));
          if (!seatNumber) {
            return;
          }

          latestBySeat.set(seatNumber, row.occupied ? 'OCCUPIED' : 'EMPTY');
        });

        setSensorState({
          R01: latestBySeat.get('R01') ?? initialSensorState.R01,
          R02: latestBySeat.get('R02') ?? initialSensorState.R02,
          R03: latestBySeat.get('R03') ?? initialSensorState.R03,
          R04: latestBySeat.get('R04') ?? initialSensorState.R04,
        });
      }
    } catch {
      // Keep the existing local demo state if the database is unavailable.
    }
  };

  useEffect(() => {
    const client = supabase;

    if (!client || !isSupabaseConfigured) {
      setAuthReady(true);
      return;
    }

    let isMounted = true;

    const initializeSession = async () => {
      const { data } = await client.auth.getSession();
      if (isMounted) {
        setSession(data.session);
        setAuthReady(true);
      }
    };

    void initializeSession();

    const { data: authListener } = client.auth.onAuthStateChange((_event, currentSession) => {
      if (isMounted) {
        setSession(currentSession);
      }
    });

    void loadSupabaseData();

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleCreateBooking = ({
    customerName,
    customerEmail,
    customerPhone,
    seat,
  }: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    seat: string;
  }) => {
    const isSeatTaken = bookings.some((booking) => booking.seat === seat);

    if (isSeatTaken) {
      throw new Error('This seat has already been booked. Please choose another seat.');
    }

    const booking: Booking = {
      id: createBookingCode(bookings.length),
      customerName,
      customerEmail,
      customerPhone,
      seat,
      movieTitle: 'The Midnight Circuit',
      showDate: '2026-10-07',
      showTime: '19:30',
      theatreName: 'Smart Cinema Hall',
      screenName: 'Screen 01',
      qrScanned: false,
      qrScannedAt: null,
    };

    setBookings((current) => [...current, booking]);
    appendActivity(`${booking.customerName} booked seat ${booking.seat}`);

    if (isSupabaseConfigured && supabase) {
      void supabase.from('bookings').insert({
        booking_code: booking.id,
        customer_name: booking.customerName,
        customer_email: booking.customerEmail,
        phone: booking.customerPhone,
        movie_id: 1,
        show_id: 1,
        seat_id: seatIdMap[booking.seat] ?? 1,
        qr_scanned: false,
        booking_status: 'BOOKED',
      });
    }

    return booking;
  };

  const handleVerifyBooking = (bookingId: string) => {
    const result = verifyBooking(bookings, bookingId);

    if (!result.booking) {
      return null;
    }

    setBookings(result.updatedBookings);
    appendActivity(`${result.booking.customerName} QR verified for seat ${result.booking.seat}`);

    if (isSupabaseConfigured && supabase) {
      void (async () => {
        try {
          await supabase
            .from('bookings')
            .update({ qr_scanned: true, qr_scanned_at: new Date().toISOString() })
            .eq('booking_code', bookingId);
        } catch {
          // Keep the demo UI working even if the database temporarily fails.
        }
      })();
    }

    return result.booking;
  };

  const handleResetDemo = () => {
    setBookings([]);
    setSensorState(initialSensorState);
    setActivityLog([
      { id: Date.now(), time: formatClock(), message: 'Demo reset complete. All seats returned to green available state.' },
    ]);

    if (isSupabaseConfigured && supabase) {
      void (async () => {
        try {
          await supabase.from('bookings').delete().neq('id', 0);
          await supabase.from('sensor_logs').delete().neq('id', 0);
        } catch {
          // Keep the local demo state working even if Supabase reset fails.
        }
      })();
    }
  };

  const handleLogin = async ({ email, password }: { email: string; password: string }) => {
    if (!supabase || !isSupabaseConfigured) {
      throw new Error('Supabase authentication is not configured.');
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      throw new Error(error.message);
    }
  };

  const handleLogout = async () => {
    if (!supabase || !isSupabaseConfigured) {
      return;
    }

    await supabase.auth.signOut();
    setSession(null);
  };

  const handleSensorChange = (seat: string, status: SensorStatus) => {
    const previousStatus = sensorState[seat] ?? 'EMPTY';

    if (previousStatus === status) {
      return;
    }

    setSensorState((current) => ({
      ...current,
      [seat]: status,
    }));

    const seatBooking = bookings.find((booking) => booking.seat === seat);
    const finalState = getSeatStatus(seatBooking, status === 'OCCUPIED');
    const activityMessage = `${seat} sensor changed to ${status}.`;
    appendActivity(activityMessage);

    if (finalState.status === 'SEATED') {
      appendActivity(`${seat} status changed to SEATED`);
    }

    if (finalState.status === 'UNAUTHORIZED') {
      appendActivity(`${seat} unauthorized occupancy detected`);
    }

    if (isSupabaseConfigured && supabase) {
      void supabase.from('sensor_logs').insert({
        seat_id: seatIdMap[seat] ?? 1,
        sensor_name: 'demo_sensor',
        occupied: status === 'OCCUPIED',
        status: status === 'OCCUPIED' ? 'OCCUPIED' : 'CLEAR',
      });
    }
  };

  if (!authReady && isSupabaseConfigured) {
    return (
      <Layout>
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-10 text-center text-slate-200">
          Loading session...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage bookings={bookings} />} />
        <Route path="/movie" element={<MoviePage />} />
        <Route path="/seats" element={<SeatSelectionPage bookings={bookings} />} />
        <Route path="/admin-login" element={session ? <Navigate to="/admin" replace /> : <AdminLoginPage onLogin={handleLogin} />} />
        <Route
          path="/booking"
          element={<BookingPage onCreateBooking={handleCreateBooking} />}
        />
        <Route path="/ticket/:bookingId" element={<TicketPage bookings={bookings} />} />
        <Route
          path="/scan"
          element={
            <ProtectedRoute session={session}>
              <ScanPage bookings={bookings} onVerifyBooking={handleVerifyBooking} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute session={session}>
              <AdminPage
                bookings={bookings}
                sensorState={sensorState}
                activityLog={activityLog}
                userEmail={session?.user?.email ?? 'Authenticated user'}
                onSensorChange={handleSensorChange}
                onResetDemo={handleResetDemo}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  );
}

export default App;