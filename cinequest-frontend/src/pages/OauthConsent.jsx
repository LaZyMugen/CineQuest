import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function OauthConsent() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function completeAuth() {
      const { error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        if (isMounted) setError(sessionError.message || "Authentication failed.");
        return;
      }

      navigate("/movies", { replace: true });
    }

    completeAuth();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return (
    <main className="min-h-screen bg-bg text-gray-200">
      <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-6 py-12 text-center">
        <h1 className="text-2xl font-semibold tracking-wide">Authorizing...</h1>
        <p className="mt-3 text-sm text-muted">Completing Google sign-in and redirecting you.</p>
        {error && <p className="mt-4 text-xs text-danger">{error}</p>}
      </div>
    </main>
  );
}
