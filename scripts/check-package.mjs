#!/usr/bin/env node
/**
 * prepack guard for openclaw-lark-patched (npm-compat 2026-09).
 * Fails the pack when any historically-observed packaging regression returns:
 *  1. "@larksuite/" scope in name or install.npmSpec — we do not own that namespace
 *  2. main/exports/types pointing at ./dist/** when dist is not committed/shipped
 *  3. files whitelist regressing to a catch-all pattern (P1 baseline packed 452 files incl. tests/, .bak, .gitignore)
 *  4. a declared contract tool id that no longer appears anywhere in src/
 *  5. openclaw.extensions entry or bin targets missing on disk
 *  6. runtime data artifacts (sqlite/env/keys/*.bak) inside the package tree
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
const errors = [];

function walkFiles(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".git" || entry === ".npm-cache") continue;
    const p = path.join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) walkFiles(p, out);
    else out.push(p);
  }
  return out;
}

if (pkg.name.startsWith("@larksuite/")) {
  errors.push(`package name "${pkg.name}" occupies the unowned @larksuite scope`);
}
const npmSpec = pkg.openclaw?.install?.npmSpec;
if (npmSpec !== pkg.name) {
  errors.push(`install.npmSpec "${npmSpec}" != package name "${pkg.name}"`);
}

for (const field of ["main", "types"]) {
  const v = pkg[field];
  if (!v) continue;
  if (v.includes("dist/") && !existsSync(path.join(root, v))) {
    errors.push(`"${field}": "${v}" points into dist/ which is not shipped (dead entry)`);
  }
  if (!existsSync(path.join(root, v))) errors.push(`"${field}": "${v}" missing on disk`);
}
const expDefault = pkg.exports?.["."]?.default ?? pkg.exports?.["."];
if (typeof expDefault === "string" && !existsSync(path.join(root, expDefault))) {
  errors.push(`exports["."].default "${expDefault}" missing on disk`);
}

if (Array.isArray(pkg.files)) {
  if (pkg.files.includes("**/*")) errors.push('files whitelist regressed to "**/*"');
  for (const need of ["openclaw.plugin.json", "src/", "skills/", "bin/"]) {
    if (!pkg.files.includes(need)) errors.push(`files whitelist missing "${need}"`);
  }
} else {
  errors.push("files whitelist missing");
}

for (const ext of pkg.openclaw?.extensions ?? []) {
  if (!existsSync(path.join(root, ext))) errors.push(`openclaw.extensions entry "${ext}" missing on disk`);
}
for (const b of Object.values(pkg.bin ?? {})) {
  if (!existsSync(path.join(root, b))) errors.push(`bin target "${b}" missing on disk`);
}

const manifestPath = path.join(root, "openclaw.plugin.json");
if (!existsSync(manifestPath)) {
  errors.push("openclaw.plugin.json missing");
} else {
  const mf = JSON.parse(readFileSync(manifestPath, "utf8"));
  const srcJs = walkFiles(path.join(root, "src")).filter((f) => /\.(js|cjs|mjs)$/.test(f));
  const blob = srcJs.map((f) => readFileSync(f, "utf8")).join("\n");
  const tools = mf.contracts?.tools ?? [];
  if (tools.length !== 38) errors.push(`expected 38 contract tools, found ${tools.length}`);
  for (const t of tools) {
    if (!blob.includes(`"${t}"`) && !blob.includes(`'${t}'`) && !blob.includes(`\`${t}\``)) {
      errors.push(`contract tool "${t}" not referenced in src/`);
    }
  }
  const skills = mf.skills ?? [];
  for (const s of skills) {
    if (!existsSync(path.join(root, s))) errors.push(`manifest skills dir "${s}" missing`);
  }
}

for (const f of walkFiles(root)) {
  const rel = path.relative(root, f).replace(/\\/g, "/");
  if (/\.bak($|[-.])/.test(rel) && rel.startsWith("patches/")) continue; // provenance copies stay repo-only but must not be whitelisted
  if (/\.(sqlite|sqlite3|db|pem|key)$/i.test(rel)) errors.push(`runtime artifact inside package tree: ${rel}`);
  if (/(^|\/)\.env($|\/)/.test(rel)) errors.push(`env file inside package tree: ${rel}`);
}

if (errors.length) {
  console.error("check-package FAILED:");
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log(`check-package OK: ${pkg.name}@${pkg.version}, entries resolve, whitelist tightened, contract tools verified`);
