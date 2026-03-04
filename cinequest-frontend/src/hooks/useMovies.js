import { useEffect, useState } from "react";
import { fetchMovies } from "../lib/api";
import { getDefaultMovieImageByTitle, getMovieImage } from "../lib/movieImages";

export function useMovies() {
	const [movies, setMovies] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		let isMounted = true;

		async function load() {
			setLoading(true);
			setError(null);

			try {
				const data = await fetchMovies();
				if (isMounted) {
					const withLocalImages = data.map((movie) => {
						const movieId = movie?.id ?? movie?.movie_id ?? movie?.movieId;
						const savedPoster = getMovieImage(movieId);
						return {
							...movie,
							local_poster: savedPoster || getDefaultMovieImageByTitle(movie?.title),
						};
					});
					setMovies(withLocalImages);
				}
			} catch (err) {
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
	}, []);

	return { movies, loading, error };
}
