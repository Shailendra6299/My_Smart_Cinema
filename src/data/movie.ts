export type MovieData = {
  title: string;
  description: string;
  posterUrl: string;
  genre: string;
  durationMinutes: number;
  rating: number;
  showDate: string;
  showTime: string;
  theatreName: string;
  screenName: string;
};

export const movie: MovieData = {
  title: 'The Midnight Circuit',
  description:
    'A brilliant engineer races through a city of neon signals to stop a rogue AI before midnight. Fast, tense, and full of cinematic energy.',
  posterUrl:
    'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=900&q=80',
  genre: 'Sci‑Fi / Thriller',
  durationMinutes: 128,
  rating: 8.7,
  showDate: '2026-10-07',
  showTime: '19:30',
  theatreName: 'Smart Cinema Hall',
  screenName: 'Screen 01',
};
