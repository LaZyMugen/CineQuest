import fs from "fs";
import { createClient } from "@supabase/supabase-js";

const env = fs.readFileSync(".env", "utf8");
const urlMatch = env.match(/^VITE_SUPABASE_URL=(.*)$/m);
const keyMatch = env.match(/^VITE_SUPABASE_ANON_KEY=(.*)$/m);
const url = urlMatch ? urlMatch[1].trim() : "";
const key = keyMatch ? keyMatch[1].trim() : "";

if (!url || !key) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(url, key);

const seed = [
  { title: "The Godfather", duration: 205, language: "English" },
  { title: "Lawrence of Arabia", duration: 216, language: "English" },
  { title: "Ben-Hur", duration: 212, language: "English" },
  { title: "Lagaan", duration: 224, language: "Hindi" },
  { title: "The Irishman", duration: 209, language: "English" },
  { title: "Seven Samurai", duration: 207, language: "Japanese" },
  { title: "RRR", duration: 207, language: "Telugu" },
  { title: "Avatar: The Way of Water", duration: 205, language: "English" },
  { title: "Das Boot", duration: 209, language: "German" },
  { title: "Jodhaa Akbar", duration: 213, language: "Hindi" },
  { title: "Schindler's List", duration: 210, language: "English" },
  { title: "Once Upon a Time in America", duration: 229, language: "English" },
];

const existingRes = await supabase.from("movie").select("title");
if (existingRes.error) {
  console.error("Failed to fetch existing titles:", existingRes.error);
  process.exit(1);
}

const existingData = Array.isArray(existingRes.data) ? existingRes.data : [];
const existingTitles = new Set(
  existingData.map((m) => String(m.title || "").trim().toLowerCase())
);

const toInsert = seed.filter(
  (m) => !existingTitles.has(String(m.title).trim().toLowerCase())
);

if (!toInsert.length) {
  console.log("No new movies inserted; all already exist.");
  process.exit(0);
}

const insertRes = await supabase
  .from("movie")
  .insert(toInsert)
  .select("movie_id,title,duration");

if (insertRes.error) {
  console.error("Insert failed:", insertRes.error);
  process.exit(1);
}

const inserted = Array.isArray(insertRes.data) ? insertRes.data : [];
console.log("Inserted movies:", inserted.length);
console.log(inserted);
