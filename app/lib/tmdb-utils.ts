const IMAGE_BASE = "https://image.tmdb.org/t/p";

export function posterUrl(path: string | null, size = "w500"): string {
  if (!path) return "https://placehold.co/500x750/18181b/a1a1aa?text=No+Image";
  return `${IMAGE_BASE}/${size}${path}`;
}

export function backdropUrl(path: string | null): string {
  if (!path) return "https://placehold.co/1280x720/18181b/a1a1aa?text=No+Image";
  return `${IMAGE_BASE}/w1280${path}`;
}

export function stillUrl(path: string | null): string {
  if (!path) return "https://placehold.co/300x169/18181b/a1a1aa?text=No+Image";
  return `${IMAGE_BASE}/w300${path}`;
}

export function logoUrl(path: string | null): string {
  if (!path) return "";
  return path;
}
