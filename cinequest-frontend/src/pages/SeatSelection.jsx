import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import SeatGrid from "../components/seat/SeatGrid";
import { useSeats } from "../hooks/useSeats";
import { bookSeats, confirmBooking } from "../lib/api";
import Navbar from "../components/layout/Navbar";
import PageWrapper from "../components/layout/PageWrapper";
import Button from "../components/ui/Button";
import StatusBadge from "../components/ui/StatusBadge";
import { supabase } from "../lib/supabase";

export default function SeatSelection() {
  const { id: showId } = useParams();

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [bookingError, setBookingError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // ✅ Use hook only once
  const { seats, loading, error } = useSeats(showId, refreshKey);

  useEffect(() => {
    if (!showId) return;

    const channel = supabase
      .channel("seat-updates")
      .on(
        "postgres_changes",
        {
           event: "*",
           schema: "public",
           table: "seats",
           filter: `show_id=eq.${showId}`,
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

      const number = seat?.seat_id ?? seat?.seat_label ?? seat?.seat_number;

      acc[row].push({ number, status });
      return acc;
    }, {});
  }, [seats]);

  const handleToggleSeat = (seatNumber) => {
    if (!seatNumber) return;

    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((id) => id !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const handleBookSeats = async () => {
    if (!showId || selectedSeats.length === 0) return;

    setBookingLoading(true);
    setBookingError(null);

    try {
      const result = await bookSeats({
        userId: 1, // temporary hardcoded
        showId: Number(showId),
        seatIds: selectedSeats,
      });

      // Supabase RPC often returns an array; pick first row
      setBooking(result?.[0] ?? result ?? null);
      setIsConfirmed(false);
      setSelectedSeats([]);
      setRefreshKey((k) => k + 1); // refresh seat list
    } catch (err) {
      console.error("Book seats failed", err);
      setBookingError("Booking failed. Please retry.");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    const isExpired =
      booking?.status === "LOCKED" &&
      booking?.expires_at &&
      new Date(booking.expires_at) < new Date();

    if (!booking?.booking_id || isConfirmed || isExpired) return;

    setConfirmLoading(true);
    setConfirmError(null);

    try {
      const result = await confirmBooking(booking.booking_id);
      console.log("Confirm booking result", result);

      setIsConfirmed(true);
      setBooking((prev) =>
        prev ? { ...prev, status: "CONFIRMED" } : prev
      );
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error("Confirm booking failed", err);
      setConfirmError("Confirmation failed. Please retry.");
    } finally {
      setConfirmLoading(false);
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
            <p className="mt-1 text-xs text-muted">
              Pick available seats.
            </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
            {selectedSeats.length > 0 ? (
              selectedSeats.map((seatId) => (
              <span
                key={seatId}
                className="rounded border border-border px-2 py-1 text-xs text-gray-200"
              >
                {seatId}
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
                  <StatusBadge status={isConfirmed ? "CONFIRMED" : booking.status} />
                </div>
                <p className="text-muted">
                  Booking ID: <span className="text-gray-200">{booking.booking_id}</span>
                </p>
                <p className="text-muted">
                  Total cost: <span className="text-gray-200">{booking.total_cost ?? "-"}</span>
                </p>
                {booking.expires_at && (
                  <p className="text-muted">
                    Lock expires at {new Date(booking.expires_at).toLocaleTimeString()}
                  </p>
                )}

                {(!booking.expires_at ||
                  (booking.status === "LOCKED" &&
                    new Date(booking.expires_at) >= new Date())) && (
                  <div className="space-y-2">
                    <Button
                      variant="secondary"
                      onClick={handleConfirmBooking}
                      disabled={
                        confirmLoading || isConfirmed || !booking.booking_id
                      }
                    >
                      {isConfirmed
                        ? "Booking Confirmed"
                        : confirmLoading
                        ? "Confirming…"
                        : "Confirm Booking"}
                    </Button>
                    {confirmError && (
                      <p className="text-xs text-danger">{confirmError}</p>
                    )}
                  </div>
                )}
              </section>
            )}
          </aside>
        </div>
      </PageWrapper>
    </>
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
