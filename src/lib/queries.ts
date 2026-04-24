import { supabase } from "@/integrations/supabase/client";

export async function fetchPage(slug: string) {
  const { data } = await supabase.from("pages").select("*").eq("slug", slug).maybeSingle();
  return data;
}

export async function fetchServices() {
  const { data } = await supabase.from("services").select("*").eq("is_published", true).order("sort_order");
  return data ?? [];
}

export async function fetchService(slug: string) {
  const { data } = await supabase.from("services").select("*").eq("slug", slug).maybeSingle();
  return data;
}

export async function fetchTestimonials(opts?: { featuredOnly?: boolean; limit?: number }) {
  let q = supabase.from("testimonials").select("*").eq("is_published", true).order("sort_order");
  if (opts?.featuredOnly) q = q.eq("is_featured", true);
  if (opts?.limit) q = q.limit(opts.limit);
  const { data } = await q;
  return data ?? [];
}

export async function fetchFaqs(limit?: number) {
  let q = supabase.from("faqs").select("*").eq("is_published", true).order("sort_order");
  if (limit) q = q.limit(limit);
  const { data } = await q;
  return data ?? [];
}

export async function fetchAsSeenIn() {
  const { data } = await supabase.from("as_seen_in").select("*").eq("is_published", true).order("sort_order");
  return data ?? [];
}