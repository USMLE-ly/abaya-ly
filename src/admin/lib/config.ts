// Admin dashboard path configuration.
// IMPORTANT: Set VITE_ADMIN_PATH in Vercel env vars to just the path segment.
// Example: VITE_ADMIN_PATH=dashboard-nadine-admin
// Do NOT include the full URL (https://...)
export const ADMIN_PATH = (import.meta.env.VITE_ADMIN_PATH || "dashboard-nadine-admin")
  // Extract just the path segment in case someone mistakenly set the full URL
  .replace(/^https?:\/\/[^\/]+\//, '')
  .replace(/^\//, '')
  .split('?')[0]
  .split('#')[0];
