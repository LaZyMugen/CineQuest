import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import SeatGrid from "../components/seat/SeatGrid";
import { useSeats } from "../hooks/useSeats";
import { bookSeats, confirmBooking } from "../lib/api";
import Navbar from "../components/layout/Navbar";
import PageWrapper from "../components/layout/PageWrapper";
import Button from "../components/ui/Button";
import StatusBadge from "../components/ui/StatusBadge";

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

  const groupedSeats = useMemo(() => {
    return seats.reduce((acc, seat) => {
      const row = seat.seat_row ?? "";
      if (!acc[row]) acc[row] = [];
      acc[row].push(seat);
      return acc;
    }, {});
  }, [seats]);

  const handleToggleSeat = (seatId) => {
    if (!seatId) return;

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
          <section className="rounded-lg border border-border bg-surface p-6 space-y-6">
            {loading && <p className="text-sm text-textSecondary">Loading seats…</p>}

            {error && (
              <p className="text-sm text-danger">
                Failed to load seats. Please try again.
              </p>
            )}

            {!loading && !error && seats.length === 0 && (
              <p className="text-sm text-textSecondary">
                No seats available for this show.
              </p>
            )}

            {!loading && !error && seats.length > 0 && (
              <>
                <SeatGrid
                  groupedSeats={groupedSeats}
                  selectedSeats={selectedSeats}
                  onToggle={handleToggleSeat}
                />
                <SeatLegend />
              </>
            )}
          </section>

          <aside className="space-y-4">
            <section className="rounded-lg border border-border bg-surface p-5 space-y-4">
              <div>
                <h2 className="text-base font-semibold">Selection</h2>
                <p className="text-sm text-textSecondary">
                  Pick available seats to lock them for confirmation.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                {selectedSeats.length > 0 ? (
                  selectedSeats.map((seatId) => (
                    <span
                      key={seatId}
                      className="rounded-sm border border-border bg-elevated px-2 py-0.5 text-textPrimary"
                    >
                      {seatId}
                    </span>
                  ))
                ) : (
                  <span className="text-textSecondary">No seats selected yet.</span>
                )}
              </div>
              <Button
                onClick={handleBookSeats}
                disabled={bookingLoading || selectedSeats.length === 0 || loading}
              >
                {bookingLoading ? "Booking…" : "Book Seats"}
              </Button>
              {bookingError && <p className="text-sm text-danger">{bookingError}</p>}
            </section>

            {booking && (
              <section className="rounded-lg border border-border bg-surface p-5 space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-semibold text-textPrimary">Booking</h2>
                  <StatusBadge status={isConfirmed ? "CONFIRMED" : booking.status} />
                </div>
                <p className="text-textSecondary">
                  Booking ID: <span className="text-textPrimary">{booking.booking_id}</span>
                </p>
                <p className="text-textSecondary">
                  Total cost: <span className="text-textPrimary">{booking.total_cost ?? "-"}</span>
                </p>
                {booking.expires_at && (
                  <p className="text-textSecondary">
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
    <div className="text-xs text-textSecondary">
      <div className="flex flex-wrap gap-3">
        <LegendItem colorClass="bg-elevated border-border" label="Available" />
        <LegendItem colorClass="bg-accent border-accent" label="Selected" />
        <LegendItem colorClass="bg-[#5A1E1E] border-[#7F2D2D]" label="Locked" />
        <LegendItem colorClass="bg-[#14532D] border-[#1E8E46]" label="Confirmed" />
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
