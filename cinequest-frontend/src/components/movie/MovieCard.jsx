import { Link } from "react-router-dom";
import Button from "../ui/Button";

export default function MovieCard({ movie }) {
	const title = movie?.title || "Untitled";
	const description = movie?.description || "No description available.";
	const movieId = movie?.id ?? movie?.movie_id ?? movie?.movieId;
	const duration = movie?.duration ? `${movie.duration} min` : null;
	const language = movie?.language || null;

	return (
		<section className="flex h-full flex-col gap-4 rounded-lg border border-border bg-surface p-5">
			<div className="space-y-2">
				<div className="flex items-start justify-between gap-2">
					<h3 className="text-base font-semibold text-textPrimary">{title}</h3>
					{duration && <span className="text-xs text-textSecondary">{duration}</span>}
				</div>
				<p className="text-sm text-textSecondary line-clamp-3">{description}</p>
			</div>
			<div className="flex items-center justify-between text-xs text-textSecondary">
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
