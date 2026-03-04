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

const descriptions = [
  {
    key: "interstellar",
    description:
      "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.",
  },
  {
    key: "inception",
    description:
      "Cobb steals information from his targets by entering their dreams. He is wanted for his alleged role in his wife's murder and his only chance at redemption is to perform a nearly impossible task.",
  },
  {
    key: "fukrey",
    description:
      "Hunny, Choocha, Lali and Zafar want to make easy money and approach the notorious Bholi to invest in their plan. But when they lose her money, they must come up with a plan or face the consequences.",
  },
  {
    key: "godfather",
    description:
      "Don Vito Corleone, head of a mafia family, decides to hand over his empire to his youngest son, Michael. However, his decision unintentionally puts the lives of his loved ones in grave danger.",
  },
  {
    key: "lawrence of arabia",
    description:
      "Lawrence, a lieutenant in the British Army, is asked by Colonel Brighton to moderately assess Faisal, their ally. Lawrence is impressed with Faisal and seeks his help to plan an attack on the enemy.",
  },
  {
    key: "ben hur",
    description:
      "Judah Ben-Hur, a nobleman, is sentenced to years of slavery after being accused of treason by his adopted brother, Messala. However, he returns to seek revenge by competing with him in a race.",
  },
  {
    key: "lagaan",
    description:
      "During the British Raj, a farmer named Rohit accepts the challenge of Captain Pat Cummins to beat his team in a game of cricket and enable his village to not pay taxes for the next three years.",
  },
  {
    key: "irishman",
    description:
      "In the 1950s, truck driver Frank Sheeran gets involved with Russell Bufalino and his Pennsylvania crime family. As Sheeran climbs the ranks to become a top hit man, he also goes to work for Jimmy Hoffa -- a powerful Teamster tied to organized crime.",
  },
  {
    key: "seven samurai",
    description:
      "A veteran samurai gathers six of his men to protect a village from the cruel bandits. As the samurais teach the natives how to defend themselves, the village is attacked by a group of 40 bandits.",
  },
  {
    key: "rrr",
    description:
      "A fearless revolutionary and an officer in the British force, who once shared a deep bond, decide to join forces and chart out an inspirational path of freedom against the despotic rulers.",
  },
  {
    key: "way of water",
    description:
      "Jake Sully and Neytiri have formed a family and are doing everything to stay together. However, they must leave their home and explore the regions of Pandora. When an ancient threat resurfaces, Jake must fight a difficult war against the humans.",
  },
  {
    key: "das boot",
    description:
      "As a Nazi German submarine patrols the Atlantic Ocean during WWII, the crew experiences long periods of inactivity and intense bouts of warfare against the foe, as they try to maintain their morale.",
  },
  {
    key: "jodhaa akbar",
    description:
      "Jodha Bai is a fiery Rajput princess who is obliged to marry a Mughal emperor, Akbar, for political reasons. Eventually, mutual respect and admiration lead to true love between the two.",
  },
  {
    key: "once upon a time in america",
    description:
      "Noodles, who was a gangster during the Prohibition Era, returns to New York after a self-imposed exile to confront his past and make amends for his mistakes.",
  },
  {
    key: "schindler",
    description:
      "Oscar Schindler, a successful and narcissistic German businessman, slowly starts worrying about the safety of his Jewish workforce after witnessing their persecution in Poland during World War II.",
  },
];

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const sampleRes = await supabase.from("movie").select("*").limit(1);
if (sampleRes.error) {
  console.error("Unable to inspect movie schema:", sampleRes.error.message);
  process.exit(1);
}

const sampleRow = Array.isArray(sampleRes.data) && sampleRes.data.length > 0 ? sampleRes.data[0] : null;
const hasDescriptionColumn = sampleRow ? Object.prototype.hasOwnProperty.call(sampleRow, "description") : false;

if (!hasDescriptionColumn) {
  console.error("Column 'description' was not found on table 'movie'.");
  console.error("Run this SQL in Supabase and re-run the script:");
  console.error("ALTER TABLE public.movie ADD COLUMN IF NOT EXISTS description text;");
  process.exit(1);
}

const moviesRes = await supabase.from("movie").select("movie_id,title");
if (moviesRes.error) {
  console.error("Failed to fetch movies:", moviesRes.error.message);
  process.exit(1);
}

const movies = Array.isArray(moviesRes.data) ? moviesRes.data : [];

let updatedCount = 0;
for (const movie of movies) {
  const normalizedTitle = normalize(movie.title);
  const matched = descriptions.find((entry) => normalizedTitle.includes(normalize(entry.key)));
  if (!matched) continue;

  const updateRes = await supabase
    .from("movie")
    .update({ description: matched.description })
    .eq("movie_id", movie.movie_id)
    .select("movie_id,title");

  if (updateRes.error) {
    console.error(`Failed updating ${movie.title}:`, updateRes.error.message);
    continue;
  }

  updatedCount += 1;
  console.log(`Updated description for: ${movie.title}`);
}

console.log(`Done. Updated descriptions for ${updatedCount} movie(s).`);
