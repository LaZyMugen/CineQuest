import { supabase } from "./supabase";

export async function fetchMovies() {
  const { data, error } = await supabase
    .from("movie")
    .select("*");

  if (error) {
    console.error("Supabase fetchMovies error", error);
    throw error;
  }

  return data ?? [];
}

export async function fetchSeats(showId) {
  // Prefer full seats table (shows confirmed/locked/available). Fallback to
  // legacy available_seats view if the table doesn't exist yet.
  let { data, error } = await supabase
    .from("seat")
    .select("*")
    .eq("show_id", showId);

  if (error) {
    console.error("Supabase fetchSeats from seat error", error);
    const fallback = await supabase
      .from("available_seats")
      .select("*")
      .eq("show_id", showId);

    if (fallback.error) {
      console.error(
        "Supabase fetchSeats from available_seats error",
        fallback.error,
      );
      throw fallback.error;
    }

    return fallback.data ?? [];
  }

  return data ?? [];
}

export async function fetchShowsForMovie(movieId) {
  const { data, error } = await supabase
    .from("show")
    .select("*")
    .eq("movie_id", movieId)
    .order("show_time", { ascending: true });

  if (error) {
    console.error("Supabase fetchShowsForMovie error", error);
    throw error;
  }

  return data ?? [];
}

export async function deleteMovie(movieId) {
  const { data, error } = await supabase
    .from("movie")
    .delete()
    .eq("movie_id", movieId)
    .select("*");

  if (error) {
    console.error("Supabase deleteMovie error", error);
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

export async function fetchBookingsForUser(userId) {
  const { data, error } = await supabase
    .from("booking")
    .select(`
      booking_id,
      status,
      expires_at,
      show:show_id (
        show_id,
        show_time,
        movie:movie_id (
          movie_id,
          title
        )
      ),
      booked_seat (
        seat_id
      )
    `)
    .eq("user_id", userId)
    .order("booking_id", { ascending: false });

  if (error) {
    console.error("Supabase fetchBookingsForUser error", error);
    throw error;
  }

  return data ?? [];
}

export async function confirmBooking(bookingId) {
  const { data, error } = await supabase.rpc("confirm_booking", {
    p_booking_id: bookingId,
  });

  if (error) {
    console.error("Supabase confirmBooking error", error);
    throw error;
  }

  return data;
}

export async function insertMovie({ title, duration, language }) {
  const { data, error } = await supabase
    .from("movie")
    .insert([
      {
        title,
        duration,
        language,
      },
    ])
    .select("*")
    .single();

  if (error) {
    console.error("Supabase insertMovie error", error);
    throw error;
  }

  return data;
}

export async function fetchScreens() {
  const { data, error } = await supabase.from("screen").select("*");

  if (error) {
    console.error("Supabase fetchScreens error", error);
    throw error;
  }

  return data ?? [];
}

export async function insertShow({ movieId, screenId, showTime, price }) {
  const { data, error } = await supabase
    .from("show")
    .insert([
      {
        movie_id: movieId,
        screen_id: screenId,
        show_time: showTime,
        price,
      },
    ])
    .select("*")
    .single();

  if (error) {
    console.error("Supabase insertShow error", error);
    throw error;
  }

  return data;
}

export async function fetchAllBookings() {
  const { data, error } = await supabase
    .from("booking")
    .select(`
      booking_id,
      status,
      show:show_id (
        show_id,
        show_time,
        movie:movie_id (
          movie_id,
          title
        )
      ),
      booked_seat (
        seat_id
      )
    `)
    .order("booking_id", { ascending: false });

  if (error) {
    console.error("Supabase fetchAllBookings error", error);
    throw error;
  }

  return data ?? [];
}

export async function cancelBooking(bookingId) {
  const { data, error } = await supabase.rpc("cancel_booking", {
    p_booking_id: bookingId,
  });

  if (error) {
    console.error("Supabase cancelBooking error", error);
    throw error;
  }

  return data;
}
