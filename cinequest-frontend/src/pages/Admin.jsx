import { useEffect, useState } from "react";
import {
	fetchMovies,
	fetchScreens,
	fetchAllBookings,
	insertMovie,
	insertShow,
	cancelBooking,
	fetchShowsForMovie,
	deleteMovie,
} from "../lib/api";
import Navbar from "../components/layout/Navbar";
import PageWrapper from "../components/layout/PageWrapper";
import Button from "../components/ui/Button";
import StatusBadge from "../components/ui/StatusBadge";

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
	const [movieDeleteLoadingId, setMovieDeleteLoadingId] = useState(null);
	const [movieDeleteError, setMovieDeleteError] = useState("");

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

	async function handleDeleteMovie(movieId) {
		setMovieDeleteError("");
		setMovieDeleteLoadingId(movieId);
		try {
			const shows = await fetchShowsForMovie(movieId);
			if (Array.isArray(shows) && shows.length > 0) {
				setMovieDeleteError("Cannot delete movie with existing shows");
				return;
			}
			await deleteMovie(movieId);
			await loadMovies();
		} catch (err) {
			console.error("Admin handleDeleteMovie error", err);
			setMovieDeleteError("Failed to delete movie.");
		} finally {
			setMovieDeleteLoadingId(null);
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
		<>
			<Navbar />
			<PageWrapper
				title="Admin Dashboard"
				subtitle="Manage movies, shows, and system-wide bookings."
			>
				<div className="space-y-8">
					<section className="rounded-lg border border-border bg-surface p-6 space-y-5">
						<header>
							<h2 className="text-lg font-semibold text-textPrimary">Add Movie</h2>
							<p className="text-sm text-textSecondary">Create a title that can be scheduled across screens.</p>
						</header>
						<form onSubmit={handleAddMovie} className="space-y-4 text-sm">
							<div className="space-y-2">
								<label htmlFor="movie-title">Title</label>
								<input
									id="movie-title"
									type="text"
									value={movieTitle}
									onChange={(e) => setMovieTitle(e.target.value)}
									className="w-full"
								/>
							</div>
							<div className="grid gap-4 sm:grid-cols-2">
								<div className="space-y-2">
									<label htmlFor="movie-duration">Duration (minutes)</label>
									<input
										id="movie-duration"
										type="number"
										min="0"
										value={movieDuration}
										onChange={(e) => setMovieDuration(e.target.value)}
										className="w-full"
									/>
								</div>
								<div className="space-y-2">
									<label htmlFor="movie-language">Language</label>
									<input
										id="movie-language"
										type="text"
										value={movieLanguage}
										onChange={(e) => setMovieLanguage(e.target.value)}
										className="w-full"
									/>
								</div>
							</div>
							<div className="flex flex-wrap items-center gap-3">
								<Button type="submit" disabled={movieSubmitting}>
									{movieSubmitting ? "Saving…" : "Add Movie"}
								</Button>
								{movieFormError && (
									<span className="text-xs text-danger">{movieFormError}</span>
								)}
								{movieMessage && (
									<span className="text-xs text-success">{movieMessage}</span>
								)}
							</div>
						</form>
						{moviesLoading && <p className="text-xs text-textSecondary">Loading movies…</p>}
						{moviesError && <p className="text-xs text-danger">{moviesError}</p>}
						{movieDeleteError && <p className="text-xs text-danger">{movieDeleteError}</p>}
						{!moviesLoading && !moviesError && movies.length > 0 && (
							<div className="border-t border-border pt-4 text-sm">
								<h3 className="text-xs font-semibold uppercase tracking-wide text-textSecondary">Existing Movies</h3>
								<ul className="mt-3 space-y-2">
									{movies.map((m) => {
										const id = m.id ?? m.movie_id;
										if (!id) return null;
										return (
											<li
												key={id}
												className="flex items-center justify-between rounded-md border border-border bg-elevated px-3 py-2"
											>
												<span className="text-textPrimary">{m.title || `Movie ${id}`}</span>
												<Button
													variant="danger"
													size="sm"
													onClick={() => handleDeleteMovie(id)}
													disabled={movieDeleteLoadingId === id}
												>
													{movieDeleteLoadingId === id ? "Deleting…" : "Delete"}
												</Button>
											</li>
										);
									})}
								</ul>
							</div>
						)}
					</section>

					<section className="rounded-lg border border-border bg-surface p-6 space-y-5">
						<header>
							<h2 className="text-lg font-semibold text-textPrimary">Add Show</h2>
							<p className="text-sm text-textSecondary">Schedule a show by pairing a movie, screen, and time.</p>
						</header>
						<form onSubmit={handleAddShow} className="space-y-4 text-sm">
							<div className="grid gap-4 sm:grid-cols-2">
								<div className="space-y-2">
									<label htmlFor="show-movie">Movie</label>
									<select
										id="show-movie"
										value={showMovieId}
										onChange={(e) => setShowMovieId(e.target.value)}
										className="w-full"
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
								<div className="space-y-2">
									<label htmlFor="show-screen">Screen</label>
									<select
										id="show-screen"
										value={showScreenId}
										onChange={(e) => setShowScreenId(e.target.value)}
										className="w-full"
									>
										<option value="">Select screen</option>
										{screens.map((s) => {
											const id = s.id ?? s.screen_id;
											const label = s.name || s.label || `Screen ${id}`;
											return (
												<option key={id} value={id}>
													{label}
												</option>
											);
										})}
									</select>
								</div>
							</div>
							<div className="grid gap-4 sm:grid-cols-2">
								<div className="space-y-2">
									<label htmlFor="show-time">Show time</label>
									<input
										id="show-time"
										type="datetime-local"
										value={showTime}
										onChange={(e) => setShowTime(e.target.value)}
										className="w-full"
									/>
								</div>
								<div className="space-y-2">
									<label htmlFor="show-price">Price</label>
									<input
										id="show-price"
										type="number"
										min="0"
										step="0.01"
										value={showPrice}
										onChange={(e) => setShowPrice(e.target.value)}
										className="w-full"
									/>
								</div>
							</div>
							<div className="flex flex-wrap items-center gap-3">
								<Button type="submit" disabled={showSubmitting}>
									{showSubmitting ? "Saving…" : "Add Show"}
								</Button>
								{showFormError && <span className="text-xs text-danger">{showFormError}</span>}
								{showMessage && <span className="text-xs text-success">{showMessage}</span>}
							</div>
						</form>
						{screensLoading && <p className="text-xs text-textSecondary">Loading screens…</p>}
						{screensError && <p className="text-xs text-danger">{screensError}</p>}
					</section>

					<section className="rounded-lg border border-border bg-surface p-6 space-y-5">
						<header>
							<h2 className="text-lg font-semibold text-textPrimary">All Bookings</h2>
							<p className="text-sm text-textSecondary">Monitor bookings across every show.</p>
						</header>
						{bookingsLoading && <p className="text-sm text-textSecondary">Loading bookings…</p>}
						{bookingsError && <p className="text-sm text-danger">{bookingsError}</p>}
						{cancelError && !bookingsError && <p className="text-xs text-danger">{cancelError}</p>}
						{!bookingsLoading && !bookingsError && bookings.length === 0 && (
							<p className="text-sm text-textSecondary">No bookings yet.</p>
						)}
						{!bookingsLoading && !bookingsError && bookings.length > 0 && (
							<div className="overflow-x-auto rounded-lg border border-border bg-surface">
								<table className="min-w-full text-sm">
									<thead className="bg-background/70 text-left text-xs font-semibold uppercase tracking-wide text-textSecondary">
										<tr>
											<th className="px-4 py-3">Booking</th>
											<th className="px-4 py-3">Movie</th>
											<th className="px-4 py-3">Show Time</th>
											<th className="px-4 py-3">Seats</th>
											<th className="px-4 py-3">Status</th>
											<th className="px-4 py-3">Actions</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-border">
										{bookings.map((b) => (
											<tr key={b.booking_id} className="hover:bg-elevated">
												<td className="px-4 py-3 text-textPrimary">#{b.booking_id}</td>
												<td className="px-4 py-3 text-textSecondary">{b.movie_title || "-"}</td>
												<td className="px-4 py-3 text-textSecondary">
													{b.show_time ? new Date(b.show_time).toLocaleString() : "-"}
												</td>
												<td className="px-4 py-3 text-textSecondary">
													{b.seat_ids.length ? b.seat_ids.join(", ") : "-"}
												</td>
												<td className="px-4 py-3">
													<StatusBadge status={b.status} />
												</td>
												<td className="px-4 py-3">
													<Button
														variant="danger"
														size="sm"
														onClick={() => handleCancelBooking(b.booking_id)}
														disabled={cancelLoadingId === b.booking_id}
													>
														{cancelLoadingId === b.booking_id ? "Cancelling…" : "Cancel"}
													</Button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</section>
				</div>
			</PageWrapper>
		</>
	);
}
