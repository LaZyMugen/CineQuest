import { supabase } from "./supabase";

export async function fetchMovies() {
	const { data, error } = await supabase.from("movie").select("*");

	if (error) {
		console.error("Supabase fetchMovies error", error);
		throw error;
	}

	return data ?? [];
}

export async function fetchSeats(showId) {
	const { data, error } = await supabase
		.from("available_seats")
		.select("*")
		.eq("show_id", showId);

	if (error) {
		console.error("Supabase fetchSeats error", error);
		throw error;
	}

	return data ?? [];
}

export async function bookSeats({ userId, showId, seatIds }) {
	const { data, error } = await supabase.rpc("book_seats", {
		p_user_id: userId,
		p_show_id: showId,
		p_seat_ids: seatIds,
	});

	if (error) {
		console.error("Supabase bookSeats error", error);
		throw error;
	}

	return data;
}
