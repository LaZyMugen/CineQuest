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

const posterMap = {
  // Add your own URLs here (must be direct image links)
  // "Interstellar": "https://.../interstellar.jpg",
  // "Inception": "https://.../inception.jpg",
  // "Fukrey": "https://.../fukrey.jpg",
  "Godfather": "https://m.media-amazon.com/images/S/pv-target-images/5bc7a0cbcc18491a4465ea2c90591d1435a20bbc62ac115dad9aa2e2252eaea6.jpg",
  "Lawrence of Arabia": "https://images.moviesanywhere.com/2190dcff0b8b23217c40f245b589e890/3d85ad24-052d-41a3-abcf-e03eb538902b.webp?h=375&resize=fit&w=250",
  "Ben-hur": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwuY-Of6MjdN-NXggwTZdwfFoFcILNjlSJ4w&s",
  "Lagaan": "https://c.ndtvimg.com/2023-10/53tnudco_rohit-lagaan_625x300_29_October_23.jpg?im=FaceCrop,algorithm=dnn,width=773,height=435",
  "Irishman": "https://m.media-amazon.com/images/I/7187ew7hfUL._AC_UF1000,1000_QL80_.jpg",
  "Seven Samurai": "https://m.media-amazon.com/images/M/MV5BZjliMWExOTMtZDQ3ZS00NWU3LWIyN2EtMjllNzk3ZTNlYzg4XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
  "RRR": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTplrAKvflV8xZkwwVLHviytHtgjpNGCqvfmw&s",
  "Way of water": "https://akm-img-a-in.tosshub.com/indiatoday/images/story/202509/avatar-the-way-of-water-041316745-16x9_0.jpg?VersionId=LMS._igb7Wio8GMyuK5J4.rXJyVgA06R&size=690:388",
  "Das boot": "https://images.plex.tv/photo?size=medium-360&scale=1&url=https%3A%2F%2Fmetadata-static.plex.tv%2Fb%2Fgracenote%2Fbf67d1b50b4ccfa138de50baad1108a4.jpg",
  "Schindlers List": "https://static.timesofisrael.com/jewishstanddev/uploads/2024/03/16-1-Schindlers-List-Silverscreen-Tours.jpg",
  "Jodhaa akbar": "https://upload.wikimedia.org/wikipedia/en/0/0e/Jodhaa_akbar.jpg",
  "Once upon a time in America": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT21xsAQ2RB2BsqWUF-KISob_OjkSq6cxAEXQ&s"
};

const entries = Object.entries(posterMap);
if (!entries.length) {
  console.log("No posters configured. Edit scripts/setMoviePosters.mjs and fill posterMap.");
  process.exit(0);
}

for (const [title, posterUrl] of entries) {
  if (!posterUrl) continue;
  const res = await supabase
    .from("movie")
    .update({ poster_url: posterUrl })
    .ilike("title", `%${title}%`)
    .select("movie_id,title,poster_url");

  if (res.error) {
    console.error(`Failed updating ${title}:`, res.error.message);
    continue;
  }

  const rows = Array.isArray(res.data) ? res.data : [];
  if (!rows.length) {
    console.log(`No rows updated for title: ${title}`);
  } else {
    console.log(`Updated ${rows.length} row(s) for ${title}`);
  }
}
