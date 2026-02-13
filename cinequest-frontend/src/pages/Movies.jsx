import MovieCard from "../components/movie/MovieCard";
import { useMovies } from "../hooks/useMovies";

export default function Movies() {
  const { movies, loading, error } = useMovies();

  return (
    <div className="p-6 space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Now Showing</h1>
        <p className="text-sm text-gray-600">
          Browse movies and pick a show to continue.
        </p>
      </header>

      {loading && <p className="text-sm text-gray-600">Loading movies…</p>}

      {error && (
        <p className="text-sm text-red-600">Failed to load movies. Please try again.</p>
      )}

      {!loading && !error && movies.length === 0 && (
        <p className="text-sm text-gray-600">No movies available.</p>
      )}

      {!loading && !error && movies.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {movies.map((movie) => (
            <MovieCard key={movie.id ?? movie.title} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}
