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

    try {
      // Attach cloudflare env to the request so vinxi/getEvent() can access it
      request.cloudflare = { env, context: ctx };
      
      return await server.fetch(request, env, ctx);
    } catch (err) {
      console.error('Worker Error:', err);
      return new Response(JSON.stringify({ 
        status: 500,
        unhandled: true,
        message: 'HTTPError',
        debug: err.message,
        stack: err.stack 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};
