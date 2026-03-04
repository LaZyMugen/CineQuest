import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function OauthConsent() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        navigate("/login", { replace: true });
        return;
      }
      navigate("/movies", { replace: true });
    })();
  }, [navigate]);

  return <div className="p-6 text-white">Signing you in...</div>;
}
