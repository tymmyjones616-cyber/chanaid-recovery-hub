/** Fix: Build failure resolved by correcting imports and removing dead code **/
import { createServerFn } from "@tanstack/react-start";
import { createDb } from "@/db";
import {
  pages,
  services,
  testimonials,
  faqs,
  asSeenIn,
  blogPosts,
  testimonialSubmissions,
  leads,
  loanApplications
} from "@/db/schema";
import { eq, and, asc, desc } from "drizzle-orm";
import { loanSubmissionSchema } from "@/lib/validation/loan";

let localDb: any = null;

/**
 * Utility to get D1 database instance in server functions.
 * Falls back to better-sqlite3 + local.db in development when no D1 binding is present.
 */
function getDb() {
  // 1. Try to get D1 from globalThis (set by Cloudflare/Nitro)
  const d1 = (globalThis as any).DB;
  if (d1) return createDb(d1);

  // 2. Development Fallback
  if (process.env.NODE_ENV === "development") {
    if (!localDb) {
      console.log("getDb: D1 not found, falling back to local SQLite (local.db)");
      try {
        // Use eval('require') to keep better-sqlite3 out of the client bundle
        // and to avoid issues with the Cloudflare/edge runtime during build
        const Database = (0, eval)('require')("better-sqlite3");
        const sqlite = new Database("local.db");
        localDb = createDb(undefined, sqlite);
      } catch (err) {
        console.error("getDb: Failed to initialize local SQLite:", err);
      }
    }
    if (localDb) return localDb;
  }

  console.error("getDb: D1 Database binding 'DB' not found in globalThis.");
  throw new Error("D1 Database binding 'DB' not found. Please ensure your D1 binding is named 'DB'.");
}

/** Returns the Cloudflare R2 bucket binding, or null in dev (graceful fallback to base64). */
function getR2(): R2Bucket | null {
  return (globalThis as any).LOAN_UPLOADS ?? null;
}

function nowIso(): string {
  return new Date().toISOString();
}

// ─── Public Queries ───────────────────────────────────────────────────────────

export const fetchPage = createServerFn()
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const db = getDb();
    return await db.select().from(pages).where(eq(pages.slug, slug)).get();
  });

export const fetchServices = createServerFn()
  .handler(async () => {
    const db = getDb();
    return await db.select().from(services).where(eq(services.isPublished, true)).orderBy(asc(services.sortOrder)).all();
  });

export const fetchService = createServerFn()
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const db = getDb();
    return await db.select().from(services).where(eq(services.slug, slug)).get();
  });

export const fetchTestimonials = createServerFn()
  .inputValidator((opts?: { featuredOnly?: boolean; limit?: number }) => opts)
  .handler(async ({ data: opts }) => {
    const db = getDb();
    let q = db.select().from(testimonials).where(eq(testimonials.isPublished, true)).orderBy(asc(testimonials.sortOrder));

    if (opts?.featuredOnly) {
      q = db.select().from(testimonials).where(and(eq(testimonials.isPublished, true), eq(testimonials.isFeatured, true))).orderBy(asc(testimonials.sortOrder));
    }

    if (opts?.limit) {
      return await q.limit(opts.limit).all();
    }

    return await q.all();
  });

export const fetchFaqs = createServerFn()
  .inputValidator((limit?: number) => limit)
  .handler(async ({ data: limit }) => {
    const db = getDb();
    let q = db.select().from(faqs).where(eq(faqs.isPublished, true)).orderBy(asc(faqs.sortOrder));
    if (limit) return await q.limit(limit).all();
    return await q.all();
  });

export const fetchAsSeenIn = createServerFn()
  .handler(async () => {
    const db = getDb();
    return await db.select().from(asSeenIn).where(eq(asSeenIn.isPublished, true)).orderBy(asc(asSeenIn.sortOrder)).all();
  });

export const fetchBlogPosts = createServerFn()
  .handler(async () => {
    const db = getDb();
    return await db.select().from(blogPosts).where(eq(blogPosts.isPublished, true)).orderBy(desc(blogPosts.createdAt)).all();
  });

export const fetchBlogPost = createServerFn()
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const db = getDb();
    return await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).get();
  });

// ─── Admin / Private Queries ──────────────────────────────────────────────────

export const fetchLeads = createServerFn()
  .handler(async () => {
    const db = getDb();
    return await db.select().from(leads).orderBy(desc(leads.createdAt)).all();
  });

export const fetchLoanApplications = createServerFn()
  .handler(async () => {
    const db = getDb();
    return await db.select().from(loanApplications).orderBy(desc(loanApplications.createdAt)).all();
  });

export const checkLoanStatus = createServerFn()
  .inputValidator((id: string) => id)
  .handler(async ({ data: id }) => {
    const db = getDb();
    const result = await db.select().from(loanApplications).where(eq(loanApplications.id, id)).get();
    if (!result) return null;
    return {
      status: result.status,
      identityVerified: result.identityVerified,
      rejectionReason: result.rejectionReason,
      amountRequested: result.amountRequested,
      currency: result.currency,
      createdAt: result.createdAt,
      submittedAt: result.submittedAt,
      updatedAt: result.updatedAt,
      reviewedAt: result.reviewedAt,
      verifiedAt: result.verifiedAt,
      statusHistory: result.statusHistory ?? "[]",
    };
  });

export const fetchTestimonialSubmissions = createServerFn()
  .handler(async () => {
    const db = getDb();
    return await db.select().from(testimonialSubmissions).orderBy(desc(testimonialSubmissions.createdAt)).all();
  });

// ─── R2 Asset Upload ──────────────────────────────────────────────────────────

export const uploadLoanAsset = createServerFn()
  .inputValidator((payload: { tempId: string; kind: string; dataUrl: string; contentType: string }) => payload)
  .handler(async ({ data: { tempId, kind, dataUrl, contentType } }) => {
    const r2 = getR2();
    if (!r2) {
      // Dev fallback: just return null — caller keeps the base64 data URI
      return { key: null, url: null };
    }

    // Convert base64 data URL to ArrayBuffer
    if (!dataUrl || !dataUrl.includes(",")) {
      throw new Error("Invalid data URL");
    }
    const base64 = dataUrl.split(",")[1];
    if (!base64) return { key: null, url: null };
    const binaryStr = atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);

    const ext = contentType.includes("video") ? "webm" : contentType.includes("pdf") ? "pdf" : "jpg";
    const key = `loan-applications/${tempId}/${kind}.${ext}`;

    await r2.put(key, bytes.buffer, { httpMetadata: { contentType } });
    return { key, url: null }; // URL resolved at render time via getLoanAssetUrl
  });

export const getLoanAssetUrl = createServerFn()
  .inputValidator((key: string) => key)
  .handler(async ({ data: key }) => {
    const r2 = getR2();
    if (!r2) return null;
    // Generate a signed URL valid for 1 hour
    const obj = await (r2 as any).createSignedUrl?.(key, { expiresIn: 3600 });
    return obj ?? null;
  });

// ─── Actions ──────────────────────────────────────────────────────────────────

export const submitTestimonial = createServerFn()
  .inputValidator((payload: any) => payload)
  .handler(async ({ data: payload }) => {
    const db = getDb();
    const result = await db.insert(testimonialSubmissions).values(payload).returning().get();
    return { data: result, error: null };
  });

export const submitLead = createServerFn()
  .inputValidator((payload: any) => payload)
  .handler(async ({ data: payload }) => {
    const db = getDb();
    const result = await db.insert(leads).values(payload).returning().get();
    return { data: result, error: null };
  });

export const submitLoanApplication = createServerFn()
  .inputValidator((payload: any) => payload)
  .handler(async ({ data: payload, request }) => {
    // Zod validation — returns structured field errors on failure
    const parsed = loanSubmissionSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return { data: null, error: { message: "Validation failed", fields: fieldErrors } };
    }

    const now = nowIso();

    // Capture audit metadata from request headers (available in Cloudflare Workers)
    let ipAddress: string | null = null;
    let userAgent: string | null = null;
    try {
      const req = request as Request | undefined;
      if (req) {
        ipAddress = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for") ?? null;
        userAgent = req.headers.get("user-agent") ?? null;
      }
    } catch { /* headers not available in dev */ }

    const db = getDb();
    const result = await db.insert(loanApplications).values({
      ...parsed.data,
      status: "pending",
      submittedAt: now,
      ipAddress,
      userAgent,
      statusHistory: JSON.stringify([{ status: "pending", at: now, by: "system" }]),
      submissionComplete: true,
    }).returning().get();

    return { data: result, error: null };
  });

export const likeBlogPost = createServerFn()
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const db = getDb();
    const current = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).get();
    if (!current) throw new Error("Post not found");

    const result = await db.update(blogPosts)
      .set({ likes: (current.likes || 0) + 1 })
      .where(eq(blogPosts.slug, slug))
      .returning()
      .get();

    return { likes: result.likes };
  });

export const updateLeadStatus = createServerFn()
  .inputValidator((payload: { id: string; status: string }) => payload)
  .handler(async ({ data: { id, status } }) => {
    const db = getDb();
    await db.update(leads).set({ status }).where(eq(leads.id, id)).run();
    return { success: true };
  });

export const updateLoanStatus = createServerFn()
  .inputValidator((payload: { id: string; status: string; reason?: string; adminId?: string }) => payload)
  .handler(async ({ data: { id, status, reason, adminId } }) => {
    const db = getDb();
    const now = nowIso();

    // Fetch current row to append history
    const current = await db.select().from(loanApplications).where(eq(loanApplications.id, id)).get();
    if (!current) return { success: false, error: "Not found" };

    let history: any[] = [];
    try { history = JSON.parse(current.statusHistory ?? "[]"); } catch { history = []; }
    history.push({ status, at: now, by: adminId ?? "admin", ...(reason ? { reason } : {}) });

    const updates: Record<string, any> = {
      status,
      updatedAt: now,
      reviewedAt: now,
      statusHistory: JSON.stringify(history),
    };

    if (status === "verified") {
      updates.verifiedAt = now;
      updates.verifiedBy = adminId ?? "admin";
    }
    if (reason) {
      updates.rejectionReason = reason;
    }

    await db.update(loanApplications).set(updates).where(eq(loanApplications.id, id)).run();
    return { success: true };
  });

export const verifyLoanIdentity = createServerFn()
  .inputValidator((payload: { id: string; verified: boolean; adminId?: string }) => payload)
  .handler(async ({ data: { id, verified, adminId } }) => {
    const db = getDb();
    const now = nowIso();

    const current = await db.select().from(loanApplications).where(eq(loanApplications.id, id)).get();
    if (!current) return { success: false, error: "Not found" };

    let history: any[] = [];
    try { history = JSON.parse(current.statusHistory ?? "[]"); } catch { history = []; }
    history.push({ event: "identity_verified", verified, at: now, by: adminId ?? "admin" });

    await db.update(loanApplications).set({
      identityVerified: verified,
      updatedAt: now,
      statusHistory: JSON.stringify(history),
    }).where(eq(loanApplications.id, id)).run();

    return { success: true };
  });

export const updateTestimonialStatus = createServerFn()
  .inputValidator((payload: { id: string; status: string }) => payload)
  .handler(async ({ data: { id, status } }) => {
    const db = getDb();
    await db.update(testimonialSubmissions).set({ status }).where(eq(testimonialSubmissions.id, id)).run();
    return { success: true };
  });
