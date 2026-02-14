import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchShowsForMovie } from "../lib/api";

export default function Shows() {
	const { id: movieId } = useParams();
	const [shows, setShows] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!movieId) return;

		let isMounted = true;

		async function load() {
			setLoading(true);
			setError(null);
			try {
				const data = await fetchShowsForMovie(Number(movieId));
				if (isMounted) {
					setShows(data);
				}
			} catch (err) {
				console.error("Shows load error", err);
				if (isMounted) {
					setError(err);
				}
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		}

		load();

		return () => {
			isMounted = false;
		};
	}, [movieId]);

	return (
		<div className="p-6 space-y-4">
			<header className="space-y-1">
				<h1 className="text-xl font-semibold">Shows</h1>
				<p className="text-sm text-gray-600">Movie ID: {movieId}</p>
			</header>

			{loading && (
				<p className="text-sm text-gray-600">Loading shows…</p>
			)}

			{error && (
				<p className="text-sm text-red-600">
					Failed to load shows. Please try again.
				</p>
			)}

			{!loading && !error && shows.length === 0 && (
				<p className="text-sm text-gray-600">No shows available.</p>
			)}

			{!loading && !error && shows.length > 0 && (
				<div className="space-y-3">
					{shows.map((show) => {
						const showId = show.show_id ?? show.id;
						const timeLabel = show.show_time
							? new Date(show.show_time).toLocaleString()
							: "-";
						const priceLabel =
							show.price !== undefined && show.price !== null
								? `₹${show.price}`
								: "-";

						return (
							<div
								key={showId}
								className="border rounded-md p-3 bg-white flex items-center justify-between text-sm"
							>
								<div>
									<div>
										<span className="font-medium">Time:</span> {timeLabel}
									</div>
									<div>
										<span className="font-medium">Price:</span> {priceLabel}
									</div>
								</div>
								{showId && (
									<Link
										to={`/show/${showId}/seats`}
										className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-semibold"
									>
										Select Seats
									</Link>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
