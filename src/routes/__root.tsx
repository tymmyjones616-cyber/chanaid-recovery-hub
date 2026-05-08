import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";


import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import { ScrollToTop } from "@/components/layout/ScrollToTop";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ChanAidRecovery Hub | Professional Blockchain Forensics & Asset Recovery" },
      {
        name: "description",
        content: "Legitimate funds recovery through advanced blockchain forensics and legal asset tracing. Specialized in crypto theft, investment fraud, and pig butchering scams. Professional investigation for serious victims."
      },
      {
        name: "keywords",
        content: "blockchain forensics, professional crypto recovery, asset tracing services, legal crypto recovery, recover stolen USDT, crypto fraud investigation, ChanAidRecovery Hub, legitimate crypto recovery services, IC3 reporting support"
      },
      { name: "author", content: "ChanAidRecovery Hub" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "ChanAidRecovery Hub" },
      { property: "og:url", content: "https://chanaidrecovery.com" },
      { property: "og:title", content: "ChanAidRecovery | Professional Funds Recovery Experts" },
      { property: "og:description", content: "Reclaim your lost assets with the world's leading recovery experts. Specialized in crypto, forex, and investment fraud recovery." },
      { property: "og:image", content: "https://chanaidrecovery.com/og-image.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "ChanAidRecovery | Professional Funds Recovery Experts" },
      { name: "twitter:description", content: "Reclaim your lost assets with the world's leading recovery experts." },
      { name: "twitter:image", content: "https://chanaidrecovery.com/og-image.png" },
    ],
    links: [
      { rel: "canonical", href: "https://chanaidrecovery.com" },
      {
        rel: "icon",
        href: "/favicon.png",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      { rel: "preload", as: "style", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "ChanAidRecovery Hub",
          "url": "https://chanaidrecovery.com",
          "logo": "https://chanaidrecovery.com/favicon.png",
          "description": "Professional funds recovery for victims of crypto scams, forex fraud, and binary options.",
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer support",
            "email": "contact@chanaidrecovery.com"
          },
          "sameAs": [
            "https://twitter.com/chanaidrecovery",
            "https://www.linkedin.com/company/chanaidrecovery"
          ]
        })
      },
      {
        // ─── Layer 1: Early CSS ────────────────────────────────────────────────
        // Injected synchronously before CookieHub's JS downloads.
        // Kills the blocking overlay, repositions the widget as a bottom-right
        // compact card, and styles it to match the site's branding.
        // The preferences/settings drawer retains its own richer layout.
        children: `
          (function(){
            var css = [

              /* ── Kill the full-screen backdrop ── */
              '.ch2-dialog:not(.ch2-dialog--settings)::before,',
              '.ch2-dialog:not(.ch2-dialog--settings) .ch2-dialog__overlay,',
              '[class*="ch2-"][class*="overlay"]:not(.ch2-dialog--settings *){',
              '  display:none!important;background:none!important;',
              '  opacity:0!important;pointer-events:none!important;}',

              /* ── Remove centering from the dialog host ── */
              '.ch2-dialog:not(.ch2-dialog--settings){',
              '  position:fixed!important;inset:auto!important;',
              '  bottom:24px!important;right:24px!important;left:auto!important;',
              '  top:auto!important;transform:none!important;',
              '  display:flex!important;align-items:flex-end!important;',
              '  justify-content:flex-end!important;',
              '  width:auto!important;max-width:420px!important;',
              '  background:none!important;z-index:9999!important;',
              '  padding:0!important;margin:0!important;}',

              /* ── The content card ── */
              '.ch2-dialog:not(.ch2-dialog--settings) .ch2-dialog__body,',
              '.ch2-dialog:not(.ch2-dialog--settings) .ch2-container{',
              '  position:static!important;inset:auto!important;',
              '  transform:none!important;max-width:420px!important;width:100%!important;',
              '  background:#ffffff!important;',
              '  border-radius:16px!important;',
              '  box-shadow:0 8px 32px rgba(0,0,0,0.14),0 2px 8px rgba(0,0,0,0.08)!important;',
              '  border:1px solid rgba(0,0,0,0.07)!important;',
              '  padding:20px 22px 18px!important;',
              '  margin:0!important;font-family:Inter,system-ui,sans-serif!important;}',

              /* ── Compact heading ── */
              '.ch2-dialog:not(.ch2-dialog--settings) .ch2-title,',
              '.ch2-dialog:not(.ch2-dialog--settings) h1,',
              '.ch2-dialog:not(.ch2-dialog--settings) h2{',
              '  font-size:14px!important;font-weight:700!important;',
              '  color:#0f172a!important;margin:0 0 6px!important;',
              '  letter-spacing:-0.01em!important;line-height:1.3!important;}',

              /* ── Compact body copy ── */
              '.ch2-dialog:not(.ch2-dialog--settings) .ch2-description,',
              '.ch2-dialog:not(.ch2-dialog--settings) p{',
              '  font-size:12.5px!important;color:#475569!important;',
              '  line-height:1.55!important;margin:0 0 4px!important;}',

              /* ── Shrink learn-more link ── */
              '.ch2-dialog:not(.ch2-dialog--settings) a{',
              '  font-size:12px!important;color:#c0392b!important;}',

              /* ── Button row ── */
              '.ch2-dialog:not(.ch2-dialog--settings) .ch2-buttons,',
              '.ch2-dialog:not(.ch2-dialog--settings) .ch2-btn-group{',
              '  display:flex!important;gap:8px!important;',
              '  margin-top:14px!important;flex-wrap:wrap!important;}',

              /* ── All buttons base ── */
              '.ch2-dialog:not(.ch2-dialog--settings) .ch2-btn{',
              '  flex:1 1 auto!important;min-width:0!important;',
              '  padding:9px 14px!important;font-size:12.5px!important;',
              '  font-weight:600!important;border-radius:10px!important;',
              '  border:none!important;cursor:pointer!important;',
              '  transition:all .18s ease!important;white-space:nowrap!important;',
              '  font-family:Inter,system-ui,sans-serif!important;}',

              /* ── Accept / allow button ── */
              '.ch2-dialog:not(.ch2-dialog--settings) .ch2-btn--accept,',
              '.ch2-dialog:not(.ch2-dialog--settings) [class*="allow"],',
              '.ch2-dialog:not(.ch2-dialog--settings) [class*="accept"]{',
              '  background:#c0392b!important;color:#fff!important;',
              '  box-shadow:0 2px 8px rgba(192,57,43,0.35)!important;}',
              '.ch2-dialog:not(.ch2-dialog--settings) .ch2-btn--accept:hover{',
              '  background:#a93226!important;transform:translateY(-1px)!important;}',

              /* ── Reject / deny button ── */
              '.ch2-dialog:not(.ch2-dialog--settings) .ch2-btn--reject,',
              '.ch2-dialog:not(.ch2-dialog--settings) [class*="deny"],',
              '.ch2-dialog:not(.ch2-dialog--settings) [class*="reject"]{',
              '  background:#f1f5f9!important;color:#334155!important;',
              '  border:1px solid #e2e8f0!important;}',
              '.ch2-dialog:not(.ch2-dialog--settings) .ch2-btn--reject:hover{',
              '  background:#e2e8f0!important;}',

              /* ── Settings / preferences button ── */
              '.ch2-dialog:not(.ch2-dialog--settings) .ch2-btn--settings{',
              '  background:transparent!important;color:#94a3b8!important;',
              '  font-size:11.5px!important;font-weight:500!important;',
              '  padding:6px 8px!important;flex:0 0 auto!important;',
              '  text-decoration:underline!important;}',

              /* ── Powered-by footer ── */
              '.ch2-dialog:not(.ch2-dialog--settings) .ch2-powered-by{',
              '  display:none!important;}',

              /* ── Floating icon — always hidden ── */
              '.ch2-icon,.ch2-open-settings-btn{',
              '  display:none!important;visibility:hidden!important;',
              '  pointer-events:none!important;width:0!important;',
              '  height:0!important;position:absolute!important;',
              '  clip:rect(0,0,0,0)!important;}',

              /* ── Mobile: stretch to bottom edge ── */
              '@media(max-width:480px){',
              '  .ch2-dialog:not(.ch2-dialog--settings){',
              '    right:0!important;left:0!important;bottom:0!important;',
              '    max-width:100%!important;}',
              '  .ch2-dialog:not(.ch2-dialog--settings) .ch2-dialog__body,',
              '  .ch2-dialog:not(.ch2-dialog--settings) .ch2-container{',
              '    border-radius:16px 16px 0 0!important;',
              '    max-width:100%!important;}',
              '  .ch2-dialog:not(.ch2-dialog--settings) .ch2-buttons,',
              '  .ch2-dialog:not(.ch2-dialog--settings) .ch2-btn-group{',
              '    flex-direction:column!important;}',
              '  .ch2-dialog:not(.ch2-dialog--settings) .ch2-btn{',
              '    width:100%!important;}}'

            ].join('');
            var s = document.createElement('style');
            s.id = 'ch2-banner-override';
            s.textContent = css;
            document.head.appendChild(s);
          })();
        `
      },
      {
        src: "https://cdn.cookiehub.eu/c2/9b756d6e.js"
      },
      {
        children: `
          document.addEventListener("DOMContentLoaded", function() {

            // ─── Layer 2: Native CookieHub config ─────────────────────────────
            var cpm = {
              settings: {
                enable: false          // hide floating launcher icon
              },
              // Request compact/notification layout — CookieHub uses this when available.
              // If the current SDK version ignores these, Layer 1 CSS and Layer 3
              // MutationObserver take over transparently.
              notification: {
                position: "bottom-right"
              }
            };
            window.cookiehub.load(cpm);

            // ─── Layer 3: MutationObserver safety-net ──────────────────────────
            // After the SDK injects its DOM, enforce banner styling and remove
            // the overlay/backdrop element if the SDK added one to <body>.
            function enforcebannerLayout() {
              // Strip any overlay sibling the SDK may have added
              document.querySelectorAll(
                'body > .ch2-overlay, body > .ch2-backdrop, body > [class*="ch2-"][class*="overlay"]'
              ).forEach(function(el) {
                el.style.cssText = 'display:none!important;background:none!important;opacity:0!important;pointer-events:none!important;';
              });

              // Remove body scroll-lock class CookieHub sometimes adds for modals
              document.body.classList.remove('ch2-open');

              // Hide floating icon elements
              document.querySelectorAll('.ch2-icon, .ch2-open-settings-btn').forEach(function(el) {
                el.setAttribute('tabindex', '-1');
                el.setAttribute('aria-hidden', 'true');
                el.style.cssText += 'display:none!important;';
              });
            }

            // Run immediately, then watch for SDK DOM mutations
            enforcebannerLayout();

            var observer = new MutationObserver(function() {
              enforcebannerLayout();
            });
            observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });

            // Disconnect observer once user has interacted with the banner
            ['ch2:consent', 'ch2:dismiss', 'ch2:complete'].forEach(function(evt) {
              document.addEventListener(evt, function() {
                observer.disconnect();
              });
            });
          });
        `
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/components/layout/AuthContext";

const queryClient = new QueryClient();

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster />
        <ScrollToTop />
      </AuthProvider>
    </QueryClientProvider>
  );
}
