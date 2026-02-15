import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBookings } from "../hooks/useBookings";
import Navbar from "../components/layout/Navbar";
import PageWrapper from "../components/layout/PageWrapper";
import Button from "../components/ui/Button";
import StatusBadge from "../components/ui/StatusBadge";

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
    <>
      <Navbar />
      <PageWrapper
        title="My Bookings"
        subtitle={`Bookings for user #${USER_ID}`}
        actions={
          <Button variant="secondary" size="sm" onClick={() => setRefreshKey((k) => k + 1)}>
            Refresh
          </Button>
        }
      >
        <div className="space-y-4">
          {loading && <p className="text-sm text-textSecondary">Loading bookings…</p>}

          {error && (
            <p className="text-sm text-danger">
              Failed to load bookings. Please try again.
            </p>
          )}

          {!loading && !error && normalized.length === 0 && (
            <p className="text-sm text-textSecondary">You have no bookings yet.</p>
          )}

          {!loading && !error && normalized.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-border bg-surface">
              <table className="w-full text-sm">
                <thead className="bg-background/70 text-left text-xs font-semibold uppercase tracking-wide text-textSecondary">
                  <tr>
                    <th className="px-4 py-3">Booking</th>
                    <th className="px-4 py-3">Movie</th>
                    <th className="px-4 py-3">Show Time</th>
                    <th className="px-4 py-3">Seats</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Lock</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {normalized.map((booking) => (
                    <BookingRow
                      key={booking.id}
                      booking={booking}
                      onExpired={() => setRefreshKey((k) => k + 1)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </PageWrapper>
    </>
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
    if (isLocked) return "LOCKED";
    return booking.status;
  })();

  return (
    <tr className="hover:bg-elevated">
      <td className="px-4 py-3 text-textPrimary">#{booking.id}</td>
      <td className="px-4 py-3 text-textSecondary">
        {booking.movie_title || "-"}
      </td>
      <td className="px-4 py-3 text-textSecondary">
        {formatDateTime(booking.show_time)}
      </td>
      <td className="px-4 py-3 text-textSecondary">
        {booking.seats.length ? booking.seats.join(", ") : "-"}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={statusLabel} />
      </td>
      <td className="px-4 py-3 text-textSecondary">
        {isLocked && !isExpired ? (
          secondsLeft > 0 ? `${secondsLeft}s left` : "Locking…"
        ) : (
          isExpired ? "Expired" : "—"
        )}
      </td>
      <td className="px-4 py-3">
        {isExpired && booking.show?.show_id ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/show/${booking.show.show_id}/seats`)}
          >
            Re-book
          </Button>
        ) : (
          <span className="text-textSecondary">—</span>
        )}
      </td>
    </tr>
  );
}
