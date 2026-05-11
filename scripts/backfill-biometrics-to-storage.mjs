#!/usr/bin/env node
/**
 * Backfill biometric base64 data URIs from public.loan_applications
 * into the `loan-uploads` Supabase Storage bucket, replacing each column
 * with a short storage key.
 *
 * Why: rows currently hold 1-8 MB of base64 each, TOAST'd. Every admin/dashboard
 * `select *` drags megabytes per row through the buffer pool, which is what's
 * burning the Disk IO budget. Moving to Storage shrinks the column to a ~50-byte
 * key and lets clients fetch the binary directly from object storage.
 *
 * Usage:
 *   # dry run (no writes, just reports what would change):
 *   node scripts/backfill-biometrics-to-storage.mjs
 *
 *   # actually do it:
 *   node scripts/backfill-biometrics-to-storage.mjs --apply
 *
 * Requires env vars (loaded from .env or shell):
 *   SUPABASE_URL                 - https://taprwweemxfbrrkwajnc.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY    - sb_secret_... (NOT the anon/publishable key)
 *
 * Safe to re-run: rows already converted (column value not starting with
 * "data:") are skipped. Storage uploads use upsert:true.
 *
 * After it finishes successfully, reclaim TOAST space:
 *   VACUUM FULL public.loan_applications;
 *   -- or, with less locking: pg_repack -t public.loan_applications
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://taprwweemxfbrrkwajnc.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "loan-uploads";
const APPLY = process.argv.includes("--apply");

if (!SERVICE_ROLE_KEY) {
  console.error(
    "FATAL: SUPABASE_SERVICE_ROLE_KEY env var is required (sb_secret_... or legacy service-role JWT)."
  );
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Map biometric DB column -> storage filename "kind"
const COLUMNS = {
  selfie_image: "selfie",
  id_front_image: "idFront",
  id_back_image: "idBack",
  passport_front_image: "passportFront",
  passport_back_image: "passportBack",
  video_selfie_url: "videoSelfie",
};

/**
 * Parse a `data:<mime>;base64,<payload>` URI into bytes + content type.
 * Returns null if the value isn't a data URI we recognize.
 */
function parseDataUri(value) {
  if (typeof value !== "string" || !value.startsWith("data:")) return null;
  const m = /^data:([^;,]+)(;base64)?,(.+)$/s.exec(value);
  if (!m) return null;
  const contentType = m[1] || "application/octet-stream";
  const isBase64 = !!m[2];
  const payload = m[3];
  const buf = isBase64
    ? Buffer.from(payload, "base64")
    : Buffer.from(decodeURIComponent(payload), "utf8");
  return { contentType, buffer: buf };
}

function extFor(contentType) {
  if (!contentType) return "bin";
  if (contentType.includes("png")) return "png";
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("pdf")) return "pdf";
  if (contentType.includes("webm")) return "webm";
  if (contentType.includes("mp4")) return "mp4";
  if (contentType.includes("quicktime") || contentType.includes("mov"))
    return "mov";
  return "bin";
}

function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

async function main() {
  console.log(
    `\n=== biometrics backfill ===\nmode: ${APPLY ? "APPLY (writes!)" : "DRY RUN"}\n`
  );

  // Step 1: fetch every loan id with NO biometric filter.
  // Filtering on `column like 'data:%'` forces Postgres to detoast every
  // row's biometric columns just to evaluate the predicate, which trips
  // the statement_timeout. The total table is tiny (≤12 rows), so listing
  // all ids unconditionally is the cheap path.
  const { data: idRows, error: idErr } = await sb
    .from("loan_applications")
    .select("id")
    .limit(10000);

  if (idErr) {
    console.error("Failed to list rows:", idErr);
    process.exit(1);
  }

  console.log(`Total loan rows: ${idRows.length}`);

  // Step 2: fetch ONE COLUMN at a time per row. Each response is bounded
  // to a single biometric payload (~5 MB max), well under any gateway timeout.
  async function fetchCell(id, col) {
    const { data, error } = await sb
      .from("loan_applications")
      .select(`id, ${col}`)
      .eq("id", id)
      .single();
    if (error) {
      console.error(`  fetch ${col} for ${id} failed:`, error.message);
      return undefined;
    }
    return data?.[col];
  }

  const rows = [];
  for (const { id } of idRows) {
    const r = { id };
    for (const col of Object.keys(COLUMNS)) {
      r[col] = await fetchCell(id, col);
    }
    rows.push(r);
  }
  console.log(`Fetched all biometric columns for ${rows.length} rows\n`);

  let totalUploads = 0;
  let totalBytes = 0;
  let totalRowsTouched = 0;
  let failures = 0;

  for (const row of rows) {
    const updates = {};
    const perRowLog = [];

    for (const [col, kind] of Object.entries(COLUMNS)) {
      const val = row[col];
      const parsed = parseDataUri(val);
      if (!parsed) continue;

      const ext = extFor(parsed.contentType);
      const key = `loan-applications/${row.id}/${kind}.${ext}`;
      perRowLog.push(
        `  ${col.padEnd(22)} -> ${key}  (${parsed.contentType}, ${fmtBytes(parsed.buffer.length)})`
      );

      totalUploads++;
      totalBytes += parsed.buffer.length;

      if (APPLY) {
        const { error: upErr } = await sb.storage
          .from(BUCKET)
          .upload(key, parsed.buffer, {
            contentType: parsed.contentType,
            upsert: true,
          });
        if (upErr) {
          console.error(`  upload failed for ${key}:`, upErr.message);
          failures++;
          continue;
        }
        updates[col] = key;
      }
    }

    if (perRowLog.length) {
      console.log(`loan ${row.id}:`);
      perRowLog.forEach((l) => console.log(l));
      totalRowsTouched++;
    }

    if (APPLY && Object.keys(updates).length) {
      const { error: dbErr } = await sb
        .from("loan_applications")
        .update(updates)
        .eq("id", row.id);
      if (dbErr) {
        console.error(`  DB update failed for ${row.id}:`, dbErr.message);
        failures++;
      }
    }
  }

  console.log(`\n=== summary ===`);
  console.log(`rows touched:      ${totalRowsTouched}`);
  console.log(`columns to upload: ${totalUploads}`);
  console.log(`total bytes:       ${fmtBytes(totalBytes)}`);
  if (APPLY) {
    console.log(`failures:          ${failures}`);
    console.log(
      `\nDone. Reclaim TOAST when ready:\n  VACUUM FULL public.loan_applications;\n`
    );
  } else {
    console.log(
      `\n(dry run — nothing written. Re-run with --apply to perform the backfill.)`
    );
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
