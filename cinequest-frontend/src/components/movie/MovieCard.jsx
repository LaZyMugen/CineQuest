import { Link } from "react-router-dom";
import { useState } from "react";
import Button from "../ui/Button";
import { getDefaultMovieImageByTitle } from "../../lib/movieImages";

export default function MovieCard({ movie }) {
	const title = movie?.title || "Untitled";
	const description = movie?.description || "No description available.";
	const movieId = movie?.id ?? movie?.movie_id ?? movie?.movieId;
	const duration = movie?.duration ? `${movie.duration} min` : null;
	const language = movie?.language || null;
	const fallbackPoster = getDefaultMovieImageByTitle(title);
	const initialPosterSrc =
		movie?.poster_url || movie?.poster || movie?.image_url || movie?.local_poster;
	const [posterSrc, setPosterSrc] = useState(initialPosterSrc || fallbackPoster);

	return (
		<section className="flex h-full flex-col gap-4 rounded-lg border border-border bg-card p-5">
			{posterSrc && (
				<img
					src={posterSrc}
					alt={`${title} poster`}
					className="h-48 w-full rounded-md border border-border object-cover"
					onError={() => {
						if (fallbackPoster && posterSrc !== fallbackPoster) {
							setPosterSrc(fallbackPoster);
						} else {
							setPosterSrc(null);
						}
					}}
				/>
			)}
			<div className="space-y-2">
				<div className="flex items-start justify-between gap-2">
					<h3 className="text-base font-semibold text-gray-200">{title}</h3>
					{duration && <span className="text-xs text-muted">{duration}</span>}
				</div>
				<p className="text-sm text-muted line-clamp-3">{description}</p>
			</div>
			<div className="flex items-center justify-between text-xs text-muted">
				{language && <span>Language: {language}</span>}
				{movie?.rating && <span>Rating: {movie.rating}</span>}
			</div>
			<div className="mt-auto">
				{movieId ? (
					<Button as={Link} to={`/movie/${movieId}`} className="w-full">
						View Shows
					</Button>
				) : (
					<span className="text-sm text-danger">Missing movie id</span>
				)}
			</div>
		</section>
	);
}
