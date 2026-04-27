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
import { createRequire } from "module";

const require = createRequire(import.meta.url);

let localDb: any = null;

/**
 * Utility to get D1 database instance in server functions.
 * Falls back to better-sqlite3 + local.db in development when no D1 binding is present.
 */
function getDb() {
  const d1 = (globalThis as any).DB;

  if (d1) {
    return createDb(d1);
  }

  if (process.env.NODE_ENV === "development") {
    if (!localDb) {
      console.log("getDb: D1 not found, falling back to local SQLite (local.db)");
      try {
        const Database = require("better-sqlite3");
        const sqlite = new Database("local.db");
        localDb = createDb(undefined, sqlite);
      } catch (err) {
        console.error("getDb: Failed to initialize local SQLite:", err);
        throw new Error("D1 Database binding 'DB' not found and local fallback failed.");
      }
    }
    return localDb;
  }

  console.error("getDb: D1 Database binding 'DB' not found.");
  throw new Error("D1 Database binding 'DB' not found.");
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
    
    // Note: Drizzle's 'where' and 'limit' return the query object which can be chained
    // but in SQLite/D1 we often just execute the full query.
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

export const fetchTestimonialSubmissions = createServerFn()
  .handler(async () => {
    const db = getDb();
    return await db.select().from(testimonialSubmissions).orderBy(desc(testimonialSubmissions.createdAt)).all();
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
  .handler(async ({ data: payload }) => {
    const db = getDb();
    const result = await db.insert(loanApplications).values(payload).returning().get();
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
  .inputValidator((payload: { id: string; status: string }) => payload)
  .handler(async ({ data: { id, status } }) => {
    const db = getDb();
    await db.update(loanApplications).set({ status }).where(eq(loanApplications.id, id)).run();
    return { success: true };
  });

export const updateTestimonialStatus = createServerFn()
  .inputValidator((payload: { id: string; status: string }) => payload)
  .handler(async ({ data: { id, status } }) => {
    const db = getDb();
    await db.update(testimonialSubmissions).set({ status }).where(eq(testimonialSubmissions.id, id)).run();
    return { success: true };
  });
