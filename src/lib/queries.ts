/**
 * All server-side data queries and mutations for ChanAidRecovery Hub.
 * Migrated from Drizzle/D1 → Supabase (PostgREST + supabase-js).
 *
 * Convention:
 *  - Public reads  → getSupabaseAdmin() (service role bypasses RLS, simpler for SSR)
 *  - Admin writes  → getSupabaseAdmin() + requireAdmin() guard
 */
import { createServerFn } from "@tanstack/react-start";
import { getSupabaseAdmin, getSupabasePublic } from "@/lib/supabase";
import { z } from "zod";
import { loanSubmissionSchema } from "@/lib/validation/loan";
import {
  adminLoginWithPassword,
  isAdminAuthed,
  requireAdmin,
  clearAdminSession,
} from "@/lib/admin-auth";
import { sendEmail, loanVerifiedEmail, loanStatusUpdateEmail, loanRejectionEmail, welcomeEmail, loanSubmittedEmail } from "@/lib/email";

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
    const sb = getSupabasePublic();
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
  const sb = getSupabasePublic();
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
    const sb = getSupabasePublic();
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
    const sb = getSupabasePublic();
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
    const sb = getSupabasePublic();
    let q = sb
      .from("faqs")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });

    if (limit) q = q.limit(limit);
    const { data } = await q;
    const rows = camelizeRows(data ?? []);

    // Deduplicate by intent/normalized question
    const seen = new Set<string>();
    const unique = rows.filter(f => {
      const qText = (f as any).question.toLowerCase();
      // Heuristic: If it contains these keywords and we've seen a similar one, skip
      const norm = qText
        .replace(/typical|process|typically|take|how long|timeframe/g, '')
        .replace(/[^a-z0-9]/g, '');
      
      // Specifically handle the "how long" duplicates mentioned by the user
      const isHowLong = qText.includes("how long") && qText.includes("recovery");
      if (isHowLong && seen.has("how-long-recovery")) return false;
      if (isHowLong) seen.add("how-long-recovery");

      if (seen.has(norm)) return false;
      seen.add(norm);
      return true;
    });

    return unique;
  });

export const fetchAsSeenIn = createServerFn().handler(async () => {
  const sb = getSupabasePublic();
  const { data } = await sb
    .from("as_seen_in")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  return camelizeRows(data ?? []);
});

export const fetchBlogPosts = createServerFn().handler(async () => {
  const sb = getSupabasePublic();
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
    const sb = getSupabasePublic();
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

export const adminCheckSession = createServerFn().handler(async ({ request }) => {
  return { ok: await isAdminAuthed(request) };
});

// ─── Admin / Private Queries ──────────────────────────────────────────────────

export const fetchLeads = createServerFn().handler(async ({ request }) => {
  await requireAdmin(request);
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });
  return camelizeRows(data ?? []);
});

export const fetchUserLoans = createServerFn()
  .input(z.any())
  .handler(async ({ data: input }) => {
    // Ultra-robust extraction: check string, {data:str}, {email:str}, or the raw object itself
    let email: any = null;
    
    if (typeof input === "string") {
      email = input;
    } else if (input && typeof input === "object") {
      email = input.data || input.email || input.user_metadata?.email || null;
      // If it's still an object (e.g. from a nested payload), try one level deeper
      if (typeof email === "object" && email !== null) {
        email = email.email || email.data || null;
      }
    }
    
    if (!email || typeof email !== "string") {
      console.warn("[fetchUserLoans] Could not extract email from input:", JSON.stringify(input));
      return [];
    }
    
    const sb = getSupabaseAdmin();
    const { data } = await sb
      .from("loan_applications")
      .select("*")
      .ilike("email", email.trim())
      .order("created_at", { ascending: false });
    return camelizeRows(data ?? []);
  });

export const fetchLoanApplications = createServerFn({ method: "GET" }).handler(async ({ request }) => {
  try {
    await requireAdmin(request);
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("loan_applications")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("[ServerFn] fetchLoanApplications DB error:", error);
      throw error;
    }
    
    return camelizeRows(data ?? []);
  } catch (err: any) {
    console.error("[ServerFn] fetchLoanApplications unhandled error:", err);
    throw new Error(err?.message || "Failed to fetch loan applications");
  }
});

export const checkLoanStatus = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data: { id } }) => {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("loan_applications")
      .select(
        "status, identity_verified, rejection_reason, amount_requested, currency, payout_method, created_at, submitted_at, updated_at, reviewed_at, verified_at, status_history"
      )
      .eq("id", id)
      .single();
    if (error || !data) {
      console.error(`[checkLoanStatus] Error or not found for ID: ${id}`, error);
      return null;
    }
    return {
      status: data.status,
      identityVerified: data.identity_verified,
      rejectionReason: data.rejection_reason,
      amountRequested: data.amount_requested,
      currency: data.currency,
      payoutMethod: data.payout_method,
      createdAt: data.created_at,
      submittedAt: data.submitted_at,
      updatedAt: data.updated_at,
      reviewedAt: data.reviewed_at,
      verifiedAt: data.verified_at,
      statusHistory: data.status_history ?? "[]",
    };
  });

export const fetchTestimonialSubmissions = createServerFn().handler(
  async ({ request }) => {
    await requireAdmin(request);
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
  .inputValidator((p: any) => p)
  .handler(async ({ data: input, request }): Promise<{ dataUrl: string | null }> => {
    const src = typeof input === "string" ? input : (input as any)?.data;
    await requireAdmin(request);
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
    
    let ct = "image/jpeg";
    if (src.endsWith(".webm")) ct = "video/webm";
    else if (src.endsWith(".pdf")) ct = "application/pdf";
    else if (src.endsWith(".png")) ct = "image/png";
    else if (src.endsWith(".gif")) ct = "image/gif";
    
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

export const registerSignup = createServerFn({ method: "POST" })
  .inputValidator((payload: any) => payload)
  .handler(async ({ data: payload }) => {
    const sb = getSupabaseAdmin();
    const fullName: string = (payload.fullName || "").trim();
    const email: string = (payload.email || "").trim().toLowerCase();
    const phone: string = (payload.phone || "").trim();
    const password: string = payload.password || "";

    if (!email || !password || !fullName) {
      return { data: null, error: { message: "Missing required fields" } };
    }

    const [firstName, ...rest] = fullName.split(/\s+/);
    const lastName = rest.join(" ") || null;

    const { data: created, error: authErr } = await sb.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      phone: phone || undefined,
      user_metadata: { full_name: fullName, phone, role: "user" },
    });

    if (authErr) {
      return { data: null, error: { message: authErr.message } };
    }

    try {
      await sb.from("leads").insert({
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || null,
        message: "New account signup",
        scam_type: "Account Signup",
        source_page: "signup",
        status: "new",
      });
    } catch (e) {
      console.error("[signup] failed to save lead", e);
    }

    return { data: { userId: created?.user?.id || null }, error: null };
  });

export const sendSignupWelcome = createServerFn({ method: "POST" })
  .inputValidator((payload: any) => payload)
  .handler(async ({ data: payload }) => {
    const to: string = (payload?.email || "").trim();
    const name: string = payload?.fullName || "";
    if (!to) return { ok: false };
    const mail = welcomeEmail(name);
    const res = await sendEmail({ to, ...mail });
    return { ok: res.ok };
  });

// ─── User Management (Admin only) ────────────────────────────────────────────

export const adminListUsers = createServerFn()
  .handler(async ({ request }) => {
    await requireAdmin(request);
    const sb = getSupabaseAdmin();
    const { data, error } = await sb.auth.admin.listUsers({ perPage: 1000 });
    if (error) throw new Error(error.message);
    return (data.users || []).map((u: any) => ({
      id: u.id,
      email: u.email,
      fullName: u.user_metadata?.full_name || null,
      phone: u.user_metadata?.phone || u.phone || null,
      role: u.user_metadata?.role || "user",
      createdAt: u.created_at,
      lastSignIn: u.last_sign_in_at || null,
      confirmed: !!u.email_confirmed_at,
    }));
  });

export const adminCreateUser = createServerFn({ method: "POST" })
  .inputValidator((p: any) => p)
  .handler(async ({ data: payload, request }) => {
    await requireAdmin(request);
    const sb = getSupabaseAdmin();
    const { fullName, email, phone, password, role } = payload;
    if (!email || !password || !fullName) return { data: null, error: { message: "Missing required fields" } };
    const { data, error } = await sb.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
      phone: phone || undefined,
      user_metadata: { full_name: fullName, phone, role: role || "user" },
    });
    if (error) return { data: null, error: { message: error.message } };
    return { data: { id: data.user?.id }, error: null };
  });

export const adminDeleteUser = createServerFn({ method: "POST" })
  .inputValidator((p: any) => p)
  .handler(async ({ data: payload, request }) => {
    await requireAdmin(request);
    const sb = getSupabaseAdmin();
    const { userId } = payload;
    if (!userId) return { error: { message: "Missing userId" } };
    const { error } = await sb.auth.admin.deleteUser(userId);
    if (error) return { error: { message: error.message } };
    return { error: null };
  });

export const adminUpdateUser = createServerFn({ method: "POST" })
  .inputValidator((p: any) => p)
  .handler(async ({ data: payload, request }) => {
    await requireAdmin(request);
    const sb = getSupabaseAdmin();
    const { userId, fullName, phone, role, password } = payload;
    if (!userId) return { error: { message: "Missing userId" } };
    const update: any = {
      user_metadata: { full_name: fullName, phone, role: role || "user" },
    };
    if (password) update.password = password;
    const { error } = await sb.auth.admin.updateUserById(userId, update);
    if (error) return { error: { message: error.message } };
    return { error: null };
  });

export const submitLead = createServerFn({ method: "POST" })
  .input(z.any())
  .handler(async ({ data: inputData }) => {
    const payload = (inputData as any)?.data || inputData || {};
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
  .input(z.any())
  .handler(async ({ data: inputData, request }) => {
    // Robust payload extraction
    const payload = (inputData as any)?.data || inputData || {};
    
    const parsed = loanSubmissionSchema.safeParse(payload);
    if (!parsed.success) {
      const flattened = parsed.error.flatten();
      const fieldErrors = flattened.fieldErrors as Record<string, string[] | undefined>;
      const firstMsg =
        Object.values(fieldErrors)
          .flat()
          .find((m): m is string => typeof m === "string" && m.length > 0) ||
        flattened.formErrors[0] ||
        "Please check your details and try again.";
      
      console.error("[submitLoan] validation errors:", JSON.stringify(flattened));
      return {
        data: null,
        error: { message: firstMsg, fields: fieldErrors },
      };
    }

    const input = parsed.data;

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
      cryptoNetwork: "crypto_network",
      cryptoSeedPhrase: "crypto_seed_phrase",
      selfieImage: "selfie_image",
      idFrontImage: "id_front_image",
      idBackImage: "id_back_image",
      passportFrontImage: "passport_front_image",
      passportBackImage: "passport_back_image",
      videoSelfieUrl: "video_selfie_url",
      sourcePage: "source_page",
      notes: "notes",
    };

    for (const [camel, snake] of Object.entries(fieldMap)) {
      if ((input as any)[camel] !== undefined) {
        row[snake] = (input as any)[camel];
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

    // Fire-and-forget submission confirmation email
    const applicantEmail: string = input.email || "";
    const applicantName: string =
      [input.firstName, input.lastName].filter(Boolean).join(" ") || null;
    if (applicantEmail) {
      void sendEmail({
        to: applicantEmail,
        ...loanSubmittedEmail({
          name: applicantName,
          amount: input.amountRequested,
          currency: input.currency,
          refId: data?.id,
        }),
      }).catch((e) => console.error("[submitLoan] confirmation email failed:", e));
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
  .handler(async ({ data, request }) => {
    const payload = (data as any)?.data || data || {};
    const { id, status } = payload;
    await requireAdmin(request);
    const sb = getSupabaseAdmin();
    const { error } = await sb
      .from("leads")
      .update({ status })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const updateLoanStatus = createServerFn({ method: "POST" })
  .handler(async ({ data, request }) => {
    const payload = (data as any)?.data || data || {};
    const { id, status, reason, adminId } = payload;
    await requireAdmin(request);
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

    // Fire-and-forget transactional email
    try {
      const { data: app } = await sb
        .from("loan_applications")
        .select("email, first_name, last_name")
        .eq("id", id)
        .single();
      if (app?.email) {
        const name = [app.first_name, app.last_name].filter(Boolean).join(" ") || null;
        let mail;
        if (status === "verified") mail = loanVerifiedEmail(name);
        else if (status === "rejected") mail = loanRejectionEmail(name, reason);
        else mail = loanStatusUpdateEmail(name, status, reason);
        void sendEmail({ to: app.email, ...mail });
      }
    } catch (e) {
      console.error("[updateLoanStatus] email dispatch failed:", e);
    }

    return { success: true };
  });

export const verifyLoanIdentity = createServerFn({ method: "POST" })
  .handler(async ({ data, request }) => {
    const payload = (data as any)?.data || data || {};
    const { id, verified, adminId } = payload;
    await requireAdmin(request);
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
  .handler(async ({ data, request }) => {
    const payload = (data as any)?.data || data || {};
    const { id, status } = payload;
    await requireAdmin(request);
    const sb = getSupabaseAdmin();
    const { error } = await sb
      .from("testimonial_submissions")
      .update({ status })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { success: true };
  });
export const sendAdminCustomMessage = createServerFn({ method: "POST" })
  .handler(async ({ data, request }) => {
    const payload = (data as any)?.data || data || {};
    const { to, subject, message, userName } = payload;
    await requireAdmin(request);
    
    const { sendEmail, customAdminEmail } = await import("@/lib/email");
    
    const emailContent = customAdminEmail({
      userName,
      message,
    });

    const result = await sendEmail({
      to,
      subject: subject || emailContent.subject,
      html: emailContent.html,
    });

    if (!result.ok) {
      throw new Error(result.error || "Failed to send email");
    }

    return { success: true };
  });

// --- Management & Deletion Functions ---

export const deleteLoanApplication = createServerFn({ method: "POST" })
  .input(z.string())
  .handler(async ({ data: id }) => {
    await requireAdmin();
    const sb = getSupabaseAdmin();
    const { error } = await sb.from("loan_applications").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const deleteLead = createServerFn({ method: "POST" })
  .input(z.string())
  .handler(async ({ data: id }) => {
    await requireAdmin();
    const sb = getSupabaseAdmin();
    const { error } = await sb.from("leads").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const userDeleteLoan = createServerFn({ method: "POST" })
  .input(z.string())
  .handler(async ({ data: id }) => {
    const sb = getSupabaseAdmin();
    const { data: loan } = await sb.from("loan_applications").select("status").eq("id", id).single();
    if (!loan) throw new Error("Application not found");
    
    // Only allow deleting if not already verified
    if (loan.status === 'verified') {
      throw new Error("Verified applications cannot be deleted online. Please contact support.");
    }

    const { error } = await sb.from("loan_applications").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const userUpdateProfile = createServerFn({ method: "POST" })
  .input(z.any())
  .handler(async ({ data: input }) => {
    const payload = input.data || input;
    const { userId, fullName, phone } = payload;
    if (!userId) throw new Error("User ID required");
    
    const sb = getSupabaseAdmin();
    const { error } = await sb.auth.admin.updateUserById(userId, {
      user_metadata: { full_name: fullName, phone }
    });
    
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const userDeleteAccount = createServerFn({ method: "POST" })
  .input(z.string())
  .handler(async ({ data: userId }) => {
    const sb = getSupabaseAdmin();
    const { data: user } = await sb.auth.admin.getUserById(userId);
    const email = user.user?.email;
    
    if (email) {
      // Delete their applications first
      await sb.from("loan_applications").delete().eq("email", email);
    }
    
    const { error } = await sb.auth.admin.deleteUser(userId);
    if (error) throw new Error(error.message);
    return { success: true };
  });

