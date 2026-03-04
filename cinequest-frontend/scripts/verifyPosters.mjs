import fs from "fs";
import { createClient } from "@supabase/supabase-js";

const env = fs.readFileSync(".env", "utf8");
const urlMatch = env.match(/^VITE_SUPABASE_URL=(.*)$/m);
const keyMatch = env.match(/^VITE_SUPABASE_ANON_KEY=(.*)$/m);
const url = urlMatch ? urlMatch[1].trim() : "";
const key = keyMatch ? keyMatch[1].trim() : "";

const supabase = createClient(url, key);

const res = await supabase
  .from("movie")
  .select("movie_id,title,poster_url")
  .order("movie_id", { ascending: true });

if (res.error) {
  console.error(res.error);
  process.exit(1);
}

const rows = Array.isArray(res.data) ? res.data : [];
for (const row of rows) {
  console.log(`${row.movie_id} | ${row.title} | ${row.poster_url ? "HAS_POSTER" : "NO_POSTER"}`);
}
