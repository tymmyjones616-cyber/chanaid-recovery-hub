import { createServerFn } from "@tanstack/react-start";
import { getEvent } from "vinxi/http";
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

/**
 * Utility to get D1 database instance in server functions
 */
function getDb() {
  const event = getEvent();
  if (!event) throw new Error("No H3 event found");
  const context = event.context as any;
  
  console.log("getDb: globalThis keys:", Object.keys(globalThis).filter(k => !k.startsWith('__')));
  
  const d1 = context.cloudflare?.env?.DB || context.env?.DB || (globalThis as any).DB;
  
  if (!d1) {
    console.error("getDb: D1 Database binding 'DB' not found.");
    throw new Error("D1 Database binding 'DB' not found.");
  }
  
  return createDb(d1);
}

// ─── Public Queries ───────────────────────────────────────────────────────────

export const fetchPage = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const db = getDb();
    return await db.select().from(pages).where(eq(pages.slug, slug)).get();
  });

export const fetchServices = createServerFn({ method: "GET" })
  .handler(async () => {
    const db = getDb();
    return await db.select().from(services).where(eq(services.isPublished, true)).orderBy(asc(services.sortOrder)).all();
  });

export const fetchService = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const db = getDb();
    return await db.select().from(services).where(eq(services.slug, slug)).get();
  });

export const fetchTestimonials = createServerFn({ method: "GET" })
  .validator((opts?: { featuredOnly?: boolean; limit?: number }) => opts)
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

export const fetchFaqs = createServerFn({ method: "GET" })
  .validator((limit?: number) => limit)
  .handler(async ({ data: limit }) => {
    const db = getDb();
    let q = db.select().from(faqs).where(eq(faqs.isPublished, true)).orderBy(asc(faqs.sortOrder));
    if (limit) return await q.limit(limit).all();
    return await q.all();
  });

export const fetchAsSeenIn = createServerFn({ method: "GET" })
  .handler(async () => {
    const db = getDb();
    return await db.select().from(asSeenIn).where(eq(asSeenIn.isPublished, true)).orderBy(asc(asSeenIn.sortOrder)).all();
  });

export const fetchBlogPosts = createServerFn({ method: "GET" })
  .handler(async () => {
    const db = getDb();
    return await db.select().from(blogPosts).where(eq(blogPosts.isPublished, true)).orderBy(desc(blogPosts.createdAt)).all();
  });

export const fetchBlogPost = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const db = getDb();
    return await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).get();
  });

// ─── Admin / Private Queries ──────────────────────────────────────────────────

export const fetchLeads = createServerFn({ method: "GET" })
  .handler(async () => {
    const db = getDb();
    return await db.select().from(leads).orderBy(desc(leads.createdAt)).all();
  });

export const fetchLoanApplications = createServerFn({ method: "GET" })
  .handler(async () => {
    const db = getDb();
    return await db.select().from(loanApplications).orderBy(desc(loanApplications.createdAt)).all();
  });

export const fetchTestimonialSubmissions = createServerFn({ method: "GET" })
  .handler(async () => {
    const db = getDb();
    return await db.select().from(testimonialSubmissions).orderBy(desc(testimonialSubmissions.createdAt)).all();
  });

// ─── Actions ──────────────────────────────────────────────────────────────────

export const submitTestimonial = createServerFn({ method: "POST" })
  .validator((payload: any) => payload)
  .handler(async ({ data: payload }) => {
    const db = getDb();
    const result = await db.insert(testimonialSubmissions).values(payload).returning().get();
    return { data: result, error: null };
  });

export const submitLead = createServerFn({ method: "POST" })
  .validator((payload: any) => payload)
  .handler(async ({ data: payload }) => {
    const db = getDb();
    const result = await db.insert(leads).values(payload).returning().get();
    return { data: result, error: null };
  });

export const submitLoanApplication = createServerFn({ method: "POST" })
  .validator((payload: any) => payload)
  .handler(async ({ data: payload }) => {
    const db = getDb();
    const result = await db.insert(loanApplications).values(payload).returning().get();
    return { data: result, error: null };
  });
