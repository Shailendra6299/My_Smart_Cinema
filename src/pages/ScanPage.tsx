import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import type { Booking } from '../types';

type ScanPageProps = {
  bookings: Booking[];
  onVerifyBooking: (bookingId: string) => Booking | null;
};

type SearchResult = {
  type: 'success' | 'already' | 'invalid';
  booking?: Booking;
};

const resolveBookingFromScanValue = (rawValue: string, bookings: Booking[]) => {
  const trimmedValue = rawValue.trim();

  let bookingId = trimmedValue;

  try {
    const parsedValue = JSON.parse(trimmedValue) as { bookingId?: string; seat?: string };
    if (parsedValue && typeof parsedValue.bookingId === 'string') {
      bookingId = parsedValue.bookingId;
    }
  } catch {
    // raw booking id or plain text is acceptable
  }

  return bookings.find((booking) => booking.id.toLowerCase() === bookingId.toLowerCase()) ?? null;
};

export default function ScanPage({ bookings, onVerifyBooking }: ScanPageProps) {
  const navigate = useNavigate();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameraDevices, setCameraDevices] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [manualBookingId, setManualBookingId] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const stopScanner = async () => {
    if (!scannerRef.current) return;

    try {
      await scannerRef.current.stop();
    } catch {
      // ignore stop errors while resetting the scan flow
    }

    setIsScanning(false);
  };

  const startScanner = async (cameraId: string) => {
    if (!cameraId) {
      setError('No camera is available for scanning.');
      return;
    }

    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {
        // ignore any stop errors before restarting the scanner
      }
    }

    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;
    setError('');
    setIsScanning(true);

    try {
      await scanner.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.3,
        },
        (decodedText) => {
          const foundBooking = resolveBookingFromScanValue(decodedText, bookings);

          if (!foundBooking) {
            setResult({ type: 'invalid' });
            return;
          }

          if (foundBooking.qrScanned) {
            setResult({ type: 'already', booking: foundBooking });
            return;
          }

          const verifiedBooking = onVerifyBooking(foundBooking.id);
          setResult({ type: verifiedBooking ? 'success' : 'invalid', booking: verifiedBooking ?? undefined });
        },
        () => {
          // Ignore non-critical scan errors; they keep the scanner running.
        },
      );
    } catch {
      setError('Camera permission was blocked or the selected camera is unavailable.');
      setIsScanning(false);
    }
  };

  const resetAndRestartScanner = async () => {
    setResult(null);
    setError('');
    await stopScanner();
    if (selectedCameraId) {
      await startScanner(selectedCameraId);
    }
  };

  useEffect(() => {
    let isActive = true;

    const initializeScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (!isActive) {
          return;
        }

        if (!devices.length) {
          setError('No camera was found. Please use the manual verification option below.');
          return;
        }

        const mappedDevices = devices.map((device, index) => ({
          id: device.id,
          label: device.label || `Camera ${index + 1}`,
        }));

        setCameraDevices(mappedDevices);
        setSelectedCameraId(mappedDevices[0].id);
        await startScanner(mappedDevices[0].id);
      } catch {
        if (isActive) {
          setError('Camera permission was denied or the webcam is not available. Use the manual verification option below.');
        }
      }
    };

    initializeScanner();

    return () => {
      isActive = false;
      stopScanner();
    };
  }, []);

  const verifyBookingManually = () => {
    const trimmedValue = manualBookingId.trim();

    if (!trimmedValue) {
      setResult({ type: 'invalid' });
      return;
    }

    const foundBooking = bookings.find((booking) => booking.id.toLowerCase() === trimmedValue.toLowerCase());

    if (!foundBooking) {
      setResult({ type: 'invalid' });
      return;
    }

    if (foundBooking.qrScanned) {
      setResult({ type: 'already', booking: foundBooking });
      return;
    }

    const verifiedBooking = onVerifyBooking(foundBooking.id);
    setResult({ type: verifiedBooking ? 'success' : 'invalid', booking: verifiedBooking ?? undefined });
  };

  const renderResultCard = () => {
    if (!result) {
      return null;
    }

    if (result.type === 'success' && result.booking) {
      return (
        <div className="mt-6 rounded-2xl border border-emerald-400/60 bg-emerald-500/10 p-6 text-left">
          <h2 className="text-2xl font-bold text-emerald-300">✓ Ticket Verified</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-200">
            <p><span className="text-slate-400">Booking ID:</span> {result.booking.id}</p>
            <p><span className="text-slate-400">Customer:</span> {result.booking.customerName}</p>
            <p><span className="text-slate-400">Seat:</span> {result.booking.seat}</p>
            <p><span className="text-slate-400">Movie:</span> {result.booking.movieTitle}</p>
            <p><span className="text-slate-400">QR Status:</span> SCANNED</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="mt-5 rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
          >
            Back to Dashboard
          </button>
        </div>
      );
    }

    if (result.type === 'already' && result.booking) {
      return (
        <div className="mt-6 rounded-2xl border border-amber-400/60 bg-amber-500/10 p-6 text-left">
          <h2 className="text-2xl font-bold text-amber-300">⚠ TICKET ALREADY USED</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-200">
            <p><span className="text-slate-400">Booking ID:</span> {result.booking.id}</p>
            <p><span className="text-slate-400">Seat:</span> {result.booking.seat}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-6 rounded-2xl border border-red-400/60 bg-red-500/10 p-6 text-left">
        <h2 className="text-2xl font-bold text-red-300">✕ INVALID TICKET</h2>
        <p className="mt-3 text-sm text-slate-200">No valid booking was found.</p>
      </div>
    );
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30 md:p-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-amber-300">QR Scanner</p>
          <h1 className="mt-3 text-3xl font-bold text-white">Cinema Entry Check</h1>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/60 p-4">
        <p className="mb-4 text-center text-sm text-slate-300">Point your camera at the customer's QR ticket</p>
        <p className="mb-4 text-center text-xs uppercase tracking-[0.2em] text-slate-400">
          {isScanning ? 'Scanning...' : 'Waiting for QR code'}
        </p>

        {cameraDevices.length > 0 ? (
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="text-sm text-slate-300">Camera</label>
            <select
              value={selectedCameraId}
              onChange={(event) => {
                setSelectedCameraId(event.target.value);
                if (event.target.value) {
                  startScanner(event.target.value);
                }
              }}
              className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
            >
              {cameraDevices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-amber-400/40 bg-slate-900">
          <div id="qr-reader" className="min-h-[300px] w-full" />
        </div>

        {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
        {renderResultCard()}
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-slate-950/60 p-5">
        <p className="text-sm font-medium text-slate-200">Camera not working?</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={manualBookingId}
            onChange={(event) => setManualBookingId(event.target.value)}
            placeholder="Booking ID"
            className="flex-1 rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-amber-400"
          />
          <button
            type="button"
            onClick={verifyBookingManually}
            className="rounded-xl bg-amber-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-300"
          >
            Verify Ticket
          </button>
        </div>
      </div>

      {result ? (
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={resetAndRestartScanner}
            className="rounded-full border border-white/10 bg-white/5 px-5 py-3 font-medium text-white transition hover:bg-white/10"
          >
            Scan Another Ticket
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="rounded-full border border-white/10 bg-white/5 px-5 py-3 font-medium text-white transition hover:bg-white/10"
          >
            Back to Dashboard
          </button>
        </div>
      ) : null}
    </section>
  );
}
