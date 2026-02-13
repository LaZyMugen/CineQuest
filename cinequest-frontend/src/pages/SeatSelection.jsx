import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import SeatGrid from "../components/seat/SeatGrid";
import { useSeats } from "../hooks/useSeats";
import { bookSeats } from "../lib/api";

export default function SeatSelection() {
	const { id: showId } = useParams();
	const { seats, loading, error } = useSeats(showId);
	const [selectedSeats, setSelectedSeats] = useState([]);
	const [refreshKey, setRefreshKey] = useState(0);
	const { seats, loading, error } = useSeats(showId, refreshKey);
	const [bookingError, setBookingError] = useState(null);
	const [bookingLoading, setBookingLoading] = useState(false);

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
				userId: 1, // TODO: replace with real user
				showId,
				seatIds: selectedSeats,
			});
			setBooking(result);
			setSelectedSeats([]);
		} catch (err) {
			console.error("Book seats failed", err);
			setRefreshKey((k) => k + 1);
		} catch (err) {
		} finally {
			// refresh seats after booking attempt
			// naive approach: rely on hook re-run by changing key via showId noop toggle
			// but simpler: trigger reload by resetting seats through hook reactivity
			// we can re-run useSeats by changing showId dependency indirectly; instead we'll refresh by forcing state change
			// easiest: call window.location.reload(false); but we shouldn't reload page. Instead, re-fetch by toggling a param.
			// Adjust: extend useSeats to accept a refresh token; here we will do a manual pattern: set a local flag and pass to hook via key
			setBookingLoading(false);
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
				<p className="text-sm text-red-600">Failed to load seats. Please try again.</p>
			)}

			{!loading && !error && seats.length === 0 && (
				<p className="text-sm text-gray-600">No seats available for this show.</p>
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
					disabled={bookingLoading || selectedSeats.length === 0 || loading}
					className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold disabled:bg-gray-300 disabled:text-gray-600"
				>
					{bookingLoading ? "Booking…" : "Book Seats"}
				</button>
				{bookingError && (
					<span className="text-sm text-red-600">Booking failed. Please retry.</span>
				)}
			</div>

			{booking && (
				<div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
					<div className="font-semibold">Booking confirmed</div>
					<div>Booking ID: {booking.booking_id ?? booking.id ?? "N/A"}</div>
					<div>Total cost: {booking.total_cost ?? booking.total ?? "N/A"}</div>
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
