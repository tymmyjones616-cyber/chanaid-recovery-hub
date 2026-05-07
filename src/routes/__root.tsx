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
        src: "https://cdn.cookiehub.eu/c2/9b756d6e.js"
      },
      {
        children: `
          document.addEventListener("DOMContentLoaded", function(event) {
            var cpm = {};
            window.cookiehub.load(cpm);
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
