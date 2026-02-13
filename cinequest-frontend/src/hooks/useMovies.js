import { useEffect, useState } from "react";
import { fetchMovies } from "../lib/api";

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
					setMovies(data);
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
