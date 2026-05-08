import server from './dist/server/server.js';

export default {
  async fetch(request, env, ctx) {
    console.log('Worker fetch: env keys:', Object.keys(env || {}));
    
    // ─── Supabase credentials ───────────────────────────────────────────
    if (env.SUPABASE_URL) {
      globalThis.SUPABASE_URL = env.SUPABASE_URL;
    }
    if (env.SUPABASE_ANON_KEY) {
      globalThis.SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY;
    }
    if (env.SUPABASE_SERVICE_ROLE_KEY) {
      globalThis.SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
    }


    if (env.LOAN_UPLOADS) {
      globalThis.LOAN_UPLOADS = env.LOAN_UPLOADS;
    }

    // ─── App config ──────────────────────────────────────────────────────
    if (env.ADMIN_PASSWORD) {
      globalThis.ADMIN_PASSWORD = env.ADMIN_PASSWORD;
    }
    if (env.VITE_LOAN_REDIRECT_URL) {
      globalThis.VITE_LOAN_REDIRECT_URL = env.VITE_LOAN_REDIRECT_URL;
    }
    if (env.RESEND_API_KEY) {
      globalThis.RESEND_API_KEY = env.RESEND_API_KEY;
    }

    try {
      // ─── Connectivity Check ───────────────────────────────────────────
      if (new URL(request.url).pathname === '/__worker_test') {
        console.log('Worker: Performing Supabase connectivity check...');
        const check = await fetch(`${env.SUPABASE_URL}/rest/v1/services?select=count`, {
           headers: { 'apikey': env.SUPABASE_ANON_KEY }
        });
        const status = check.status;
        const text = await check.text();
        return new Response(`Supabase Check: Status=${status}, Body=${text}`, { status: 200 });
      }

      // Attach cloudflare env to the request so vinxi/getEvent() can access it
      request.cloudflare = { env, context: ctx };
      
      console.log('Worker V4: Calling server.fetch for path:', new URL(request.url).pathname);
      const resp = await server.fetch(request, env, ctx);
      
      if (resp.status === 500) {
        console.warn('Worker: server.fetch returned 500. Attempting to inspect response...');
        try {
          const clone = resp.clone();
          const text = await clone.text();
          console.log('Worker: 500 Response Body:', text);
        } catch (e) {
          console.error('Worker: Failed to read 500 response body:', e);
        }
      }
      
      return resp;
    } catch (err) {
      console.error('CRITICAL_WORKER_ERROR:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
      return new Response("CATCH_BLOCK_TRIGGERED: " + err.message + "\nStack: " + err.stack, { 
        status: 500
      });
    }
  }
};
