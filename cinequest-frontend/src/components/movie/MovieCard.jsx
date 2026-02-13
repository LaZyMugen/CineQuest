import { Link } from "react-router-dom";

export default function MovieCard({ movie }) {
	const title = movie?.title || "Untitled";
	const description = movie?.description || "No description available.";
	const movieId = movie?.id ?? movie?.movie_id ?? movie?.movieId;

	return (
		<div className="border rounded-lg p-4 shadow-sm bg-white">
			<h3 className="text-lg font-semibold mb-2">{title}</h3>
			<p className="text-sm text-gray-600 mb-4 line-clamp-3">{description}</p>
			{movieId ? (
				<Link
					to={`/movie/${movieId}`}
					className="text-blue-600 font-medium underline"
				>
					View shows
				</Link>
			) : (
				<span className="text-gray-500 text-sm">Missing movie id</span>
			)}
		</div>
	);
}
