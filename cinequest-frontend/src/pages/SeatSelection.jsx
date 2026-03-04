import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import SeatGrid from "../components/seat/SeatGrid";
import { useSeats } from "../hooks/useSeats";
import { bookSeats } from "../lib/api";
import Navbar from "../components/layout/Navbar";
import PageWrapper from "../components/layout/PageWrapper";
import Button from "../components/ui/Button";
import StatusBadge from "../components/ui/StatusBadge";
import { supabase } from "../lib/supabase";

function formatSupabaseError(err) {
  if (!err) return "Unknown error";

  if (typeof err === "string") return err;

  const message = err?.message || err?.error_description || err?.hint;
  if (message) return message;

  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

export default function SeatSelection() {
  const { id: showId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [bookingError, setBookingError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Parse expires_at properly (Supabase returns UTC timestamps)
  // Append 'Z' if not present to ensure UTC parsing
  const getExpiryTime = (expiresAt) => {
    if (!expiresAt) return null;
    const str = String(expiresAt);
    // If no timezone indicator, assume UTC
    const normalized = str.includes('Z') || str.includes('+') ? str : str + 'Z';
    return new Date(normalized).getTime();
  };

  const expiryTime = booking?.expires_at ? getExpiryTime(booking.expires_at) : null;
  const now = Date.now();
  
  const bookingIsExpired =
    booking?.status === "LOCKED" &&
    expiryTime !== null &&
    expiryTime < now;

  const bookingStatusLabel = isConfirmed
    ? "CONFIRMED"
    : bookingIsExpired
    ? "EXPIRED"
    : booking?.status;

  // ✅ Use hook only once
  const { seats, loading, error } = useSeats(showId, refreshKey);

  useEffect(() => {
    const confirmedBooking = location.state?.confirmedBooking;
    if (!confirmedBooking?.booking_id) return;

    setBooking(confirmedBooking);
    setIsConfirmed(true);
    setSelectedSeats([]);
    setBookingError(null);
    setRefreshKey((k) => k + 1);

    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (!showId) return;

    // Listen to booked_seat table changes (not "seats" which doesn't exist)
    const channel = supabase
      .channel("seat-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "booked_seat",
        },
        () => {
          setRefreshKey((k) => k + 1);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "booking",
        },
        () => {
          setRefreshKey((k) => k + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showId]);

  // Map seat_id -> display label for the selection panel
  const seatIdToLabel = useMemo(() => {
    const map = new Map();
    for (const seat of seats) {
      const id = seat.seat_id;
      const label = `${seat.seat_row ?? ""}${seat.seat_number ?? ""}`;
      if (id != null) map.set(id, label);
    }
    return map;
  }, [seats]);

  const seatsByRow = useMemo(() => {
    return seats.reduce((acc, seat) => {
      const row = seat.seat_row ?? "";
      if (!acc[row]) acc[row] = [];

      const rawStatus =
        seat?.status || seat?.seat_status || seat?.booking_status || seat?.state;
      const upper = rawStatus ? rawStatus.toString().toUpperCase() : null;
      const availableFlag = seat?.is_available ?? seat?.available;

      let status = "available";
      if (upper === "CONFIRMED") status = "confirmed";
      else if (upper === "LOCKED" || availableFlag === false) status = "locked";

      // id = seat_id (for booking), label = row+number (for display)
      const id = seat.seat_id;
      const label = `${row}${seat.seat_number ?? ""}`;

      acc[row].push({ id, label, status });
      return acc;
    }, {});
  }, [seats]);

  const handleToggleSeat = (seatId) => {
    if (seatId == null) return;

    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  };

  const handleBookSeats = async () => {
    if (!showId || selectedSeats.length === 0) return;

    setBookingLoading(true);
    setBookingError(null);

    try {
      const result = await bookSeats({
        userId: 1, // temporary hardcoded
        showId,
        seatIds: selectedSeats,
      });

      console.log("Book seats result:", result);

      // Supabase RPC often returns an array; pick first row
      const bookingData = result?.[0] ?? result ?? null;

      if (bookingData) {
        const rawExpires = bookingData.expires_at;
        const normalized = rawExpires && !String(rawExpires).includes('Z') && !String(rawExpires).includes('+') 
          ? rawExpires + 'Z' 
          : rawExpires;
        const expiryMs = new Date(normalized).getTime();
        const nowMs = Date.now();
        
        console.log("=== BOOKING DEBUG ===");
        console.log("Raw expires_at:", rawExpires);
        console.log("Normalized:", normalized);
        console.log("Expiry (ms):", expiryMs);
        console.log("Now (ms):", nowMs);
        console.log("Diff (seconds):", (expiryMs - nowMs) / 1000);
        console.log("Is expired?:", expiryMs < nowMs);
        console.log("=====================");
      }

      setBooking(bookingData);
      setIsConfirmed(false);
      setSelectedSeats([]);
      setRefreshKey((k) => k + 1); // refresh seat list
    } catch (err) {
      console.error("Book seats failed", err);
      setBookingError(formatSupabaseError(err));
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <PageWrapper
        title="Select Seats"
        subtitle={`Show #${showId}`}
      >
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <section className="rounded-lg border border-border bg-card p-6 space-y-6">
            {loading && <p className="text-sm text-muted">Loading seats…</p>}

            {error && (
              <p className="text-sm text-danger">
                Failed to load seats. Please try again.
              </p>
            )}

            {!loading && !error && seats.length === 0 && (
              <p className="text-sm text-muted">
                No seats available for this show.
              </p>
            )}

            {!loading && !error && seats.length > 0 && (
              <>
                <TheaterScreen />
                <SeatGrid
                  seats={seatsByRow}
                  selectedSeats={selectedSeats}
                  toggleSeat={handleToggleSeat}
                />
                <SeatLegend />
              </>
            )}
          </section>

          <aside className="space-y-4">
            <section className="bg-card border border-border rounded-md p-5 w-72 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-200">Selection</h3>
                <p className="mt-1 text-xs text-muted">Pick available seats.</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedSeats.length > 0 ? (
                  selectedSeats.map((seatId) => (
                    <span
                      key={seatId}
                      className="rounded border border-border px-2 py-1 text-xs text-gray-200"
                    >
                      {seatIdToLabel.get(seatId) ?? seatId}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted">No seats selected yet.</span>
                )}
              </div>
              <button
                className="mt-5 w-full rounded-md bg-accent py-2 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleBookSeats}
                disabled={bookingLoading || selectedSeats.length === 0 || loading}
              >
                {bookingLoading ? "Booking…" : "Book Seats"}
              </button>
              {bookingError && <p className="text-xs text-danger">{bookingError}</p>}
            </section>

            {booking && (
              <section className="rounded-lg border border-border bg-card p-5 space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-semibold text-gray-200">Booking</h2>
                  <StatusBadge status={bookingStatusLabel} />
                </div>
                <p className="text-muted">
                  Booking ID: <span className="text-gray-200">{booking.booking_id}</span>
                </p>
                <p className="text-muted">
                  Total cost:{" "}
                  <span className="text-gray-200">
                    {booking.total_amount ?? booking.total_cost ?? "-"}
                  </span>
                </p>
                {booking.expires_at && (
                  <p className="text-muted">
                    Lock expires at {expiryTime ? new Date(expiryTime).toLocaleTimeString() : '-'}
                    {!bookingIsExpired && expiryTime && (
                      <span className="ml-2 text-xs">
                        ({Math.max(0, Math.round((expiryTime - now) / 1000))}s left)
                      </span>
                    )}
                  </p>
                )}

                {bookingIsExpired && (
                  <div className="space-y-2">
                    <p className="text-xs text-danger">
                      This lock has expired. Please select seats and book again.
                    </p>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setBooking(null);
                        setIsConfirmed(false);
                        setSelectedSeats([]);
                        setBookingError(null);
                        setRefreshKey((k) => k + 1);
                      }}
                    >
                      Book Again
                    </Button>
                  </div>
                )}

                {!bookingIsExpired && !isConfirmed && booking.status === "LOCKED" && (
                  <div className="space-y-2">
                    <Button
                      variant="secondary"
                      onClick={() =>
                        navigate(`/payment/${booking.booking_id}?showId=${showId}`, {
                          state: {
                            booking,
                            showId,
                          },
                        })
                      }
                      disabled={!booking.booking_id}
                    >
                      Proceed to Payment
                    </Button>
                  </div>
                )}

                {isConfirmed && (
                  <p className="text-xs text-success">✓ Booking confirmed successfully!</p>
                )}
              </section>
            )}
          </aside>
        </div>
      </PageWrapper>
    </>
  );
}

function TheaterScreen() {
  return (
    <div className="mx-auto w-full max-w-3xl pb-2">
      <p className="mb-2 text-center text-[10px] uppercase tracking-[0.35em] text-muted">
        Screen
      </p>
      <div
        className="mx-auto h-5 w-[88%] rounded-b-[999px] border border-white/60 bg-white/85 shadow-[0_0_18px_rgba(255,255,255,0.4)]"
        aria-hidden
      />
      <div
        className="mx-auto mt-1 h-2 w-[80%] rounded-b-[999px] bg-white/25 blur-[1px]"
        aria-hidden
      />
    </div>
  );
}

function SeatLegend() {
  return (
    <div className="text-xs text-muted">
      <div className="flex flex-wrap gap-3">
        <LegendItem colorClass="border-border" label="Available" />
        <LegendItem colorClass="bg-accent border-accent" label="Selected" />
        <LegendItem colorClass="bg-border border-border" label="Locked" />
        <LegendItem colorClass="border-success" label="Confirmed" />
      </div>
    </div>
  );
}

function LegendItem({ colorClass, label }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`inline-block h-4 w-4 rounded-sm border ${colorClass}`} aria-hidden />
      {label}
    </span>
  );
}
