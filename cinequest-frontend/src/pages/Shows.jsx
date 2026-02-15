import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchShowsForMovie } from "../lib/api";
import Navbar from "../components/layout/Navbar";
import PageWrapper from "../components/layout/PageWrapper";
import ShowCard from "../components/show/ShowCard";

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
		<>
			<Navbar />
			<PageWrapper
				title="Shows"
				subtitle={`Movie ID: ${movieId}`}
			>
				<div className="space-y-4">
					{loading && (
						<p className="text-sm text-textSecondary">Loading shows…</p>
					)}

					{error && (
						<p className="text-sm text-danger">
							Failed to load shows. Please try again.
						</p>
					)}

					{!loading && !error && shows.length === 0 && (
						<p className="text-sm text-textSecondary">No shows available.</p>
					)}

					{!loading && !error && shows.length > 0 && (
						<div className="grid gap-5">
							{shows.map((show) => (
								<ShowCard key={show.show_id ?? show.id} show={show} />
							))}
						</div>
					)}
				</div>
			</PageWrapper>
		</>
	);
}
