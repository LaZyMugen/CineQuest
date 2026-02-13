import { useEffect, useState } from "react";
import { fetchSeats } from "../lib/api";

export function useSeats(showId, refreshKey = 0) {
	const [seats, setSeats] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!showId) return;

		let isMounted = true;

		async function load() {
			setLoading(true);
			setError(null);

			try {
				const data = await fetchSeats(showId);
				if (isMounted) {
					setSeats(data);
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
	}, [showId, refreshKey]);

	return { seats, loading, error };
}
