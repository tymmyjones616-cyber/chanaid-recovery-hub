// seo_audit.mjs — Audit SEO tags across all route files
import fs from "fs";
import path from "path";

const dir = "src/routes";
const files = fs.readdirSync(dir).filter(f => f.endsWith(".tsx"));

console.log("=== SEO AUDIT: All Pages ===\n");

let issues = [];

for (const f of files) {
  const c = fs.readFileSync(path.join(dir, f), "utf8");
  const hasHead = c.includes("head:");
  const titleMatch = c.match(/title['"]\s*,\s*content:\s*['"]([^'"]+)['"]/);
  const titleSimple = c.match(/{\s*title:\s*['"]([^'"]+)['"]/);
  const descMatch = c.match(/name:\s*['"]description['"].*?content:\s*['"]([^'"]+)['"]/s);
  const ogTitle = c.match(/property:\s*['"]og:title['"].*?content:\s*['"]([^'"]+)['"]/s);
  const ogDesc = c.match(/property:\s*['"]og:description['"].*?content:\s*['"]([^'"]+)['"]/s);
  const hasH1 = c.includes("<h1") || c.includes("h1 ");
  const hasSemanticHTML = c.includes("<section") || c.includes("<article") || c.includes("<main") || c.includes("<nav");
  const title = titleMatch?.[1] || titleSimple?.[1] || null;

  console.log(`--- ${f} ---`);
  console.log(`  head():      ${hasHead ? "✓" : "✗ MISSING"}`);
  console.log(`  <title>:     ${title || "✗ MISSING"}`);
  console.log(`  meta desc:   ${descMatch ? descMatch[1].substring(0, 80) + "..." : "✗ MISSING"}`);
  console.log(`  og:title:    ${ogTitle ? "✓" : "✗ MISSING"}`);
  console.log(`  og:desc:     ${ogDesc ? "✓" : "✗ MISSING"}`);
  console.log(`  <h1>:        ${hasH1 ? "✓" : "✗ MISSING"}`);
  console.log(`  semantic:    ${hasSemanticHTML ? "✓" : "—"}`);
  console.log();

  if (!hasHead) issues.push(`${f}: Missing head() with meta tags`);
  if (!title) issues.push(`${f}: Missing <title> tag`);
  if (!descMatch) issues.push(`${f}: Missing meta description`);
  if (!ogTitle) issues.push(`${f}: Missing og:title`);
  if (!ogDesc) issues.push(`${f}: Missing og:description`);
}

console.log("=== ISSUES SUMMARY ===");
if (issues.length === 0) {
  console.log("  ✓ No SEO issues found!");
} else {
  issues.forEach(i => console.log(`  ✗ ${i}`));
}
console.log(`\nTotal pages: ${files.length}, Issues: ${issues.length}`);
