import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import SeatGrid from "../components/seat/SeatGrid";
import { useSeats } from "../hooks/useSeats";
import { bookSeats, confirmBooking } from "../lib/api";

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
    <div className="p-6 space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Select Seats</h1>
        <p className="text-sm text-gray-600">Show ID: {showId}</p>
      </header>

      {loading && <p className="text-sm text-gray-600">Loading seats…</p>}

      {error && (
        <p className="text-sm text-red-600">
          Failed to load seats. Please try again.
        </p>
      )}

      {!loading && !error && seats.length === 0 && (
        <p className="text-sm text-gray-600">
          No seats available for this show.
        </p>
      )}

      {!loading && !error && seats.length > 0 && (
        <SeatGrid
          groupedSeats={groupedSeats}
          selectedSeats={selectedSeats}
          onToggle={handleToggleSeat}
        />
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleBookSeats}
          disabled={
            bookingLoading || selectedSeats.length === 0 || loading
          }
          className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold disabled:bg-gray-300 disabled:text-gray-600"
        >
          {bookingLoading ? "Booking…" : "Book Seats"}
        </button>

        {bookingError && (
          <span className="text-sm text-red-600">{bookingError}</span>
        )}
      </div>

      {booking && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          <div className="font-semibold">
            Booking {isConfirmed ? "Confirmed" : "Successful"}
          </div>
          <div>Booking ID: {booking.booking_id}</div>
          <div>Total cost: {booking.total_cost}</div>

          {/* Confirm button is only relevant while lock is active */}
          {(!booking.expires_at ||
            (booking.status === "LOCKED" &&
              new Date(booking.expires_at) >= new Date())) && (
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={
                  confirmLoading || isConfirmed || !booking.booking_id
                }
                className="px-3 py-1.5 rounded-md bg-emerald-600 text-white text-sm font-semibold disabled:bg-gray-300 disabled:text-gray-600"
              >
                {isConfirmed
                  ? "Booking Confirmed"
                  : confirmLoading
                  ? "Confirming…"
                  : "Confirm Booking"}
              </button>

              {confirmError && (
                <span className="text-xs text-red-600">{confirmError}</span>
              )}
            </div>
          )}
        </div>
      )}

      {selectedSeats.length > 0 && (
        <div className="text-sm text-gray-800">
          Selected seats: {selectedSeats.join(", ")}
        </div>
      )}
    </div>
  );
}
