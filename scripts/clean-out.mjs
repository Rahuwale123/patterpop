// Runs after `next build` (npm "postbuild"). Turbopack compiles the pattern
// worker into JS chunks but also copies its TypeScript source into
// out/_next/static/media as an unused asset. Remove it so source files are
// never published, and make sure the compiled worker is really there.
import fs from "node:fs";
import path from "node:path";

const OUT = "out";
const removed = [];
for (const file of fs.readdirSync(OUT, { recursive: true })) {
  if (String(file).endsWith(".ts")) {
    fs.rmSync(path.join(OUT, file));
    removed.push(file);
  }
}
const chunks = fs.readdirSync(path.join(OUT, "_next/static/chunks"));
if (!chunks.some((f) => f.startsWith("turbopack-worker-"))) {
  console.error("clean-out: compiled worker chunk not found in out/_next/static/chunks");
  process.exit(1);
}
console.log(`clean-out: removed ${removed.length} TypeScript file(s): ${removed.join(", ") || "none"}`);
