export interface DonghuaItem {
  title: string;
  poster: string;
  episodes: string; // e.g., "12" or "END"
  releasedOn: string; // e.g., "Baru" or "Tamat"
  href: string; // URL path within the app
}

export interface DonghuaHomeResponse {
  recent: DonghuaItem[];
  completed: DonghuaItem[];
}
