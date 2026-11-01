// The always-on pages, with the date their content last really changed (for the sitemap).
// Free of imports so the edge code (functions/_middleware.js) can load it.

export const staticPages: { path: string; updated: string; priority: number }[] = [
  { path: "/about", updated: "2026-11-01", priority: 0.3 },
  { path: "/privacy", updated: "2026-11-01", priority: 0.2 },
  { path: "/terms", updated: "2026-11-01", priority: 0.2 },
  { path: "/contact", updated: "2026-11-01", priority: 0.2 },
];
