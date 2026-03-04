import { Link } from "react-router-dom";
import { useState } from "react";
import Button from "../components/ui/Button";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleGoogleSignIn() {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/oauth/consent`,
      },
    });

    if (error) {
      console.error("Google sign-in error:", error.message);
      setError(error.message || "Google sign in failed.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-bg text-gray-200">
      <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-6 py-12 text-center">
        <h1 className="text-4xl font-semibold tracking-wide">Login</h1>
        <p className="mt-3 text-sm text-muted">
          Continue with Google to access CineQuest.
        </p>

        <div className="mt-8 w-full rounded-lg border border-border bg-card p-6">
          <Button className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
            {loading ? "Redirecting to Google..." : "Continue with Google"}
          </Button>
          {error && <p className="mt-3 text-xs text-danger">{error}</p>}
        </div>

        <Button as={Link} to="/movies" variant="secondary" className="mt-5">
          Continue to Movies
        </Button>
      </div>
    </main>
  );
}
