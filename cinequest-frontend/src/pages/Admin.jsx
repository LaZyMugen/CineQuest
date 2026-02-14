import { useEffect, useState } from "react";
import {
	fetchMovies,
	fetchScreens,
	fetchAllBookings,
	insertMovie,
	insertShow,
	cancelBooking,
} from "../lib/api";

export default function Admin() {
	const [movies, setMovies] = useState([]);
	const [screens, setScreens] = useState([]);
	const [bookings, setBookings] = useState([]);

	const [moviesLoading, setMoviesLoading] = useState(false);
	const [screensLoading, setScreensLoading] = useState(false);
	const [bookingsLoading, setBookingsLoading] = useState(false);
	const [moviesError, setMoviesError] = useState(null);
	const [screensError, setScreensError] = useState(null);
	const [bookingsError, setBookingsError] = useState(null);

	// Add Movie form state
	const [movieTitle, setMovieTitle] = useState("");
	const [movieDuration, setMovieDuration] = useState("");
	const [movieLanguage, setMovieLanguage] = useState("");
	const [movieSubmitting, setMovieSubmitting] = useState(false);
	const [movieMessage, setMovieMessage] = useState("");
	const [movieFormError, setMovieFormError] = useState("");

	// Add Show form state
	const [showMovieId, setShowMovieId] = useState("");
	const [showScreenId, setShowScreenId] = useState("");
	const [showTime, setShowTime] = useState("");
	const [showPrice, setShowPrice] = useState("");
	const [showSubmitting, setShowSubmitting] = useState(false);
	const [showMessage, setShowMessage] = useState("");
	const [showFormError, setShowFormError] = useState("");

	// Bookings table state
	const [cancelLoadingId, setCancelLoadingId] = useState(null);
	const [cancelError, setCancelError] = useState("");

	useEffect(() => {
		loadMovies();
		loadScreens();
		loadBookings();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	async function loadMovies() {
		setMoviesLoading(true);
		setMoviesError(null);
		try {
			const data = await fetchMovies();
			setMovies(data);
		} catch (err) {
			console.error("Admin loadMovies error", err);
			setMoviesError("Failed to load movies.");
		} finally {
			setMoviesLoading(false);
		}
	}

	async function loadScreens() {
		setScreensLoading(true);
		setScreensError(null);
		try {
			const data = await fetchScreens();
			setScreens(data);
		} catch (err) {
			console.error("Admin loadScreens error", err);
			setScreensError("Failed to load screens.");
		} finally {
			setScreensLoading(false);
		}
	}

	async function loadBookings() {
		setBookingsLoading(true);
		setBookingsError(null);
		try {
			const data = await fetchAllBookings();
			const normalized = data.map((b) => {
				const seats = Array.isArray(b.booked_seat)
					? b.booked_seat.map((s) => s.seat_id ?? s.seat_label ?? s.id)
					: [];
				return {
					booking_id: b.booking_id,
					status: b.status,
					movie_title: b.show?.movie?.title ?? "",
					show_time: b.show?.show_time ?? null,
					seat_ids: seats,
				};
			});
			setBookings(normalized);
		} catch (err) {
			console.error("Admin loadBookings error", err);
			setBookingsError("Failed to load bookings.");
		} finally {
			setBookingsLoading(false);
		}
	}

	async function handleAddMovie(e) {
		e.preventDefault();
		setMovieFormError("");
		setMovieMessage("");

		if (!movieTitle.trim()) {
			setMovieFormError("Title is required.");
			return;
		}

		setMovieSubmitting(true);
		try {
			await insertMovie({
				title: movieTitle.trim(),
				duration: movieDuration ? Number(movieDuration) : null,
				language: movieLanguage.trim() || null,
			});
			setMovieTitle("");
			setMovieDuration("");
			setMovieLanguage("");
			setMovieMessage("Movie added successfully.");
			loadMovies();
		} catch (err) {
			console.error("Admin handleAddMovie error", err);
			setMovieFormError("Failed to add movie.");
		} finally {
			setMovieSubmitting(false);
		}
	}

	async function handleAddShow(e) {
		e.preventDefault();
		setShowFormError("");
		setShowMessage("");

		if (!showMovieId || !showScreenId || !showTime || !showPrice) {
			setShowFormError("All fields are required.");
			return;
		}

		setShowSubmitting(true);
		try {
			await insertShow({
				movieId: Number(showMovieId),
				screenId: Number(showScreenId),
				showTime,
				price: Number(showPrice),
			});
			setShowMovieId("");
			setShowScreenId("");
			setShowTime("");
			setShowPrice("");
			setShowMessage("Show added successfully.");
			loadBookings();
		} catch (err) {
			console.error("Admin handleAddShow error", err);
			setShowFormError("Failed to add show.");
		} finally {
			setShowSubmitting(false);
		}
	}

	async function handleCancelBooking(bookingId) {
		setCancelError("");
		setCancelLoadingId(bookingId);
		try {
			await cancelBooking(bookingId);
			await loadBookings();
		} catch (err) {
			console.error("Admin handleCancelBooking error", err);
			setCancelError("Failed to cancel booking.");
		} finally {
			setCancelLoadingId(null);
		}
	}

	return (
		<div className="p-6 space-y-8">
			<header className="space-y-1">
				<h1 className="text-2xl font-semibold">Admin Dashboard</h1>
				<p className="text-sm text-gray-600">
					Manage movies, shows, and view all bookings.
				</p>
			</header>

			{/* Section 1: Add Movie */}
			<section className="space-y-3 border rounded-md p-4 bg-white">
				<h2 className="text-lg font-semibold">Add Movie</h2>
				<form onSubmit={handleAddMovie} className="space-y-3 text-sm">
					<div className="flex flex-col gap-1">
						<label className="font-medium">Title</label>
						<input
							type="text"
							value={movieTitle}
							onChange={(e) => setMovieTitle(e.target.value)}
							className="border rounded-md px-2 py-1"
						/>
					</div>
					<div className="flex flex-col gap-1">
						<label className="font-medium">Duration (minutes)</label>
						<input
							type="number"
							min="0"
							value={movieDuration}
							onChange={(e) => setMovieDuration(e.target.value)}
							className="border rounded-md px-2 py-1"
						/>
					</div>
					<div className="flex flex-col gap-1">
						<label className="font-medium">Language</label>
						<input
							type="text"
							value={movieLanguage}
							onChange={(e) => setMovieLanguage(e.target.value)}
							className="border rounded-md px-2 py-1"
						/>
					</div>
					<div className="flex items-center gap-3">
						<button
							type="submit"
							disabled={movieSubmitting}
							className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm font-semibold disabled:bg-gray-300 disabled:text-gray-600"
						>
							{movieSubmitting ? "Saving…" : "Add Movie"}
						</button>
						{movieFormError && (
							<span className="text-xs text-red-600">{movieFormError}</span>
						)}
						{movieMessage && (
							<span className="text-xs text-green-700">{movieMessage}</span>
						)}
					</div>
				</form>
				{moviesLoading && (
					<p className="text-xs text-gray-500">Loading movies…</p>
				)}
				{moviesError && (
					<p className="text-xs text-red-600">{moviesError}</p>
				)}
			</section>

			{/* Section 2: Add Show */}
			<section className="space-y-3 border rounded-md p-4 bg-white">
				<h2 className="text-lg font-semibold">Add Show</h2>
				<form onSubmit={handleAddShow} className="space-y-3 text-sm">
					<div className="flex flex-col gap-1">
						<label className="font-medium">Movie</label>
						<select
							value={showMovieId}
							onChange={(e) => setShowMovieId(e.target.value)}
							className="border rounded-md px-2 py-1"
						>
							<option value="">Select movie</option>
							{movies.map((m) => {
								const id = m.id ?? m.movie_id;
								return (
									<option key={id} value={id}>
										{m.title}
									</option>
								);
							})}
						</select>
					</div>
					<div className="flex flex-col gap-1">
						<label className="font-medium">Screen</label>
						<select
							value={showScreenId}
							onChange={(e) => setShowScreenId(e.target.value)}
							className="border rounded-md px-2 py-1"
						>
							<option value="">Select screen</option>
							{screens.map((s) => {
								const id = s.id ?? s.screen_id;
								const label =
									s.name || s.label || `Screen ${id}`;
								return (
									<option key={id} value={id}>
										{label}
									</option>
								);
							})}
						</select>
					</div>
					<div className="flex flex-col gap-1">
						<label className="font-medium">Show time</label>
						<input
							type="datetime-local"
							value={showTime}
							onChange={(e) => setShowTime(e.target.value)}
							className="border rounded-md px-2 py-1"
						/>
					</div>
					<div className="flex flex-col gap-1">
						<label className="font-medium">Price</label>
						<input
							type="number"
							min="0"
							step="0.01"
							value={showPrice}
							onChange={(e) => setShowPrice(e.target.value)}
							className="border rounded-md px-2 py-1"
						/>
					</div>
					<div className="flex items-center gap-3">
						<button
							type="submit"
							disabled={showSubmitting}
							className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm font-semibold disabled:bg-gray-300 disabled:text-gray-600"
						>
							{showSubmitting ? "Saving…" : "Add Show"}
						</button>
						{showFormError && (
							<span className="text-xs text-red-600">{showFormError}</span>
						)}
						{showMessage && (
							<span className="text-xs text-green-700">{showMessage}</span>
						)}
					</div>
				</form>
				{screensLoading && (
					<p className="text-xs text-gray-500">Loading screens…</p>
				)}
				{screensError && (
					<p className="text-xs text-red-600">{screensError}</p>
				)}
			</section>

			{/* Section 3: All Bookings */}
			<section className="space-y-3 border rounded-md p-4 bg-white">
				<h2 className="text-lg font-semibold">All Bookings</h2>
				{bookingsLoading && (
					<p className="text-sm text-gray-600">Loading bookings…</p>
				)}
				{bookingsError && (
					<p className="text-sm text-red-600">{bookingsError}</p>
				)}
				{cancelError && !bookingsError && (
					<p className="text-xs text-red-600">{cancelError}</p>
				)}
				{!bookingsLoading && !bookingsError && bookings.length === 0 && (
					<p className="text-sm text-gray-600">No bookings yet.</p>
				)}
				{!bookingsLoading && !bookingsError && bookings.length > 0 && (
					<div className="overflow-x-auto text-sm">
						<table className="min-w-full border text-left text-xs">
							<thead className="bg-gray-50">
								<tr>
									<th className="border-b px-2 py-1">Booking ID</th>
									<th className="border-b px-2 py-1">Movie</th>
									<th className="border-b px-2 py-1">Show time</th>
									<th className="border-b px-2 py-1">Seats</th>
									<th className="border-b px-2 py-1">Status</th>
									<th className="border-b px-2 py-1">Actions</th>
								</tr>
							</thead>
							<tbody>
								{bookings.map((b) => (
									<tr key={b.booking_id} className="odd:bg-white even:bg-gray-50">
										<td className="border-b px-2 py-1">{b.booking_id}</td>
										<td className="border-b px-2 py-1">{b.movie_title || "-"}</td>
										<td className="border-b px-2 py-1">
											{b.show_time ? new Date(b.show_time).toLocaleString() : "-"}
										</td>
										<td className="border-b px-2 py-1">
											{b.seat_ids.length ? b.seat_ids.join(", ") : "-"}
										</td>
										<td className="border-b px-2 py-1">{b.status}</td>
										<td className="border-b px-2 py-1">
											<button
												type="button"
												onClick={() => handleCancelBooking(b.booking_id)}
												disabled={cancelLoadingId === b.booking_id}
												className="px-2 py-0.5 rounded-md border border-red-300 text-red-700 disabled:text-gray-500 disabled:border-gray-300"
											>
												{cancelLoadingId === b.booking_id ? "Cancelling…" : "Cancel"}
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</section>
		</div>
	);
}
