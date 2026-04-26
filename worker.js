import server from './dist/server/server.js';

export default {
  async fetch(request, env, ctx) {
    console.log('Worker fetch: env keys:', Object.keys(env || {}));
    
    // Attach DB to globalThis so getDb() can find it
    if (env.DB) {
      console.log('Worker fetch: Attaching DB to globalThis');
      globalThis.DB = env.DB;
    }

    try {
      // Some versions of TanStack Start look for cloudflare on the request
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
