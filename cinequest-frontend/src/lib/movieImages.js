const STORAGE_KEY = "cinequest_movie_images";

function readMap() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeMap(map) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore storage failures (quota/private mode)
  }
}

export function saveMovieImage(movieId, dataUrl) {
  if (!movieId || !dataUrl) return;
  const map = readMap();
  map[String(movieId)] = dataUrl;
  writeMap(map);
}

export function getMovieImage(movieId) {
  if (!movieId) return null;
  const map = readMap();
  return map[String(movieId)] ?? null;
}

export function getDefaultMovieImageByTitle(title) {
  const normalized = String(title || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ");

  if (normalized.includes("interstellar")) return "/intersteLLarPic.png";
  if (normalized.includes("inception")) return "/inceptionPic.png";
  if (normalized.includes("fukrey")) return "/fukreyPic.png";

  return null;
}
