import MovieCard from "../components/movie/MovieCard";
import { useMovies } from "../hooks/useMovies";
import Navbar from "../components/layout/Navbar";
import PageWrapper from "../components/layout/PageWrapper";

export default function Movies() {
  const { movies, loading, error } = useMovies();

  return (
    <>
      <Navbar />
      <PageWrapper
        title="Now Showing"
        subtitle="Browse the catalog and jump into a show."
      >
        <div className="space-y-4">
          {loading && <p className="text-sm text-muted">Loading movies…</p>}

          {error && (
            <p className="text-sm text-danger">Failed to load movies. Please try again.</p>
          )}


         
          {!loading && !error && movies.length === 0 && (
            <p className="text-sm text-muted">No movies available.</p>
          )}

          {!loading && !error && movies.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {movies.map((movie) => (
                <MovieCard key={movie.id ?? movie.title} movie={movie} />
              ))}
            </div>
          )}
        </div>
      </PageWrapper>
    </>
  );
}
