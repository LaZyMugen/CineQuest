import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBookings } from "../hooks/useBookings";

const USER_ID = 1; // temporary hardcoded

function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

function useCountdown(expiresAt) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!expiresAt) return;
    const id = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (!expiresAt) return { secondsLeft: null };

  const diffMs = new Date(expiresAt).getTime() - now;
  const secondsLeft = Math.max(0, Math.floor(diffMs / 1000));
  return { secondsLeft };
}

export default function MyBookings() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { bookings, loading, error } = useBookings(USER_ID, refreshKey);

  const normalized = useMemo(
    () =>
      bookings.map((b) => {
        const seats = Array.isArray(b.booked_seat)
          ? b.booked_seat.map((s) => s.seat_id ?? s.seat_label ?? s.id)
          : [];
        return {
          id: b.booking_id,
          status: b.status,
          expires_at: b.expires_at,
          show_time: b.show?.show_time,
          movie_title: b.show?.movie?.title,
          seats,
          show: b.show ?? null,
        };
      }),
    [bookings]
  );

  return (
    <div className="p-6 space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">My Bookings</h1>
        <p className="text-sm text-gray-600">
          Bookings for user #{USER_ID}
        </p>
      </header>

      <div className="flex items-center gap-3 text-sm">
        <button
          type="button"
          onClick={() => setRefreshKey((k) => k + 1)}
          className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-800 hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {loading && <p className="text-sm text-gray-600">Loading bookings…</p>}

      {error && (
        <p className="text-sm text-red-600">
          Failed to load bookings. Please try again.
        </p>
      )}

      {!loading && !error && normalized.length === 0 && (
        <p className="text-sm text-gray-600">You have no bookings yet.</p>
      )}

      {!loading && !error && normalized.length > 0 && (
        <div className="space-y-3">
          {normalized.map((b) => (
            <BookingRow
              key={b.id}
              booking={b}
              onExpired={() => setRefreshKey((k) => k + 1)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BookingRow({ booking, onExpired }) {
  const navigate = useNavigate();
  const { secondsLeft } = useCountdown(booking.expires_at);
  const isLocked = booking.status === "LOCKED";
  const isExpired =
    booking.status === "LOCKED" &&
    booking.expires_at &&
    new Date(booking.expires_at) < new Date();

  useEffect(() => {
    if (!isLocked || isExpired) return;
    if (typeof secondsLeft === "number" && secondsLeft === 0) {
      onExpired?.();
    }
  }, [isLocked, isExpired, secondsLeft, onExpired]);

  const statusLabel = (() => {
    if (booking.status === "CONFIRMED") return "CONFIRMED";
    if (isExpired) return "EXPIRED";
    if (isLocked) return "LOCKED (active)";
    return booking.status;
  })();

  return (
    <div className="border rounded-md p-3 text-sm bg-white flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <span className="font-semibold">Booking #{booking.id}</span>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            booking.status === "CONFIRMED"
              ? "bg-emerald-100 text-emerald-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {statusLabel}
        </span>
      </div>

      <div>
        <span className="font-medium">Movie:</span> {booking.movie_title || "-"}
      </div>
      <div>
        <span className="font-medium">Show time:</span> {formatDateTime(booking.show_time)}
      </div>
      <div>
        <span className="font-medium">Seats:</span>{" "}
        {booking.seats.length ? booking.seats.join(", ") : "-"}
      </div>
      <div>
        <span className="font-medium">Expiry:</span>{" "}
        {booking.expires_at ? formatDateTime(booking.expires_at) : "-"}
      </div>

      {isLocked && !isExpired && (
        <div className="mt-1 text-xs text-gray-700">
          {typeof secondsLeft === "number" && secondsLeft > 0 ? (
            <span>Expires in {secondsLeft}s</span>
          ) : (
            <span>Lock expiring…</span>
          )}
        </div>
      )}

      {isExpired && booking.show?.show_id && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => navigate(`/show/${booking.show.show_id}/seats`)}
            className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-semibold"
          >
            Re-book
          </button>
        </div>
      )}
    </div>
  );
}
