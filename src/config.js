// API base URL — switches automatically between dev and production builds.
//   Dev   (npm run dev):    "" → URLs stay relative, Vite proxy forwards to :5000
//   Built (tauri build):    absolute → talks straight to the Flask sidecar (CORS allows it)
export const API_BASE = import.meta.env.PROD ? "http://localhost:5000" : "";