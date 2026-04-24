
# ChanAidRecovery — Asset Recovery Site + Full CMS

## Brand & Theme
- Rebrand all copy from "Bold Asset Recovery" / "Payback" → **ChanAidRecovery**
- Visual style: white background with a soft pastel **blue → pink → magenta vertical gradient** (matching the uploaded image) used on hero panels, section accents, and CTA buttons
- Clean, modern, trustworthy layout — rounded cards, soft shadows, generous white space
- Custom logo wordmark "ChanAidRecovery"

## Pages (all cloned & rebranded)
**Public site:**
1. **Home** — hero + lead form, "as seen in" strip, scams we recover from, How it works (4 steps), Why work with us, testimonials snippet, FAQ snippet, CTA footer
2. **Testimonials** — full client stories grid
3. **About / Why work with us**
4. **Contact**
5. **Success Calculator** — interactive recovery estimator
6. **Privacy Policy**
7. **Service pages (8):** Binary Options, Cryptocurrency, Forex, Stock Trading, Credit Card Phishing, Property Scams, Romance Scams, Other Financial Scams — each with hero, problem description, recovery process, success stats, lead form

Every page gets its own route file, unique SEO meta (title, description, og:title, og:description, og:image), and JSON-LD structured data (Organization, Service, FAQPage where relevant) for strong SEO + AI/LLM crawlability.

## Tech for SEO + AI crawlability
- **TanStack Start with full SSR** — every page is server-rendered HTML (Google, Bing, ChatGPT, Perplexity, Claude all see complete content immediately)
- Semantic HTML5 (`<article>`, `<section>`, `<nav>`), proper heading hierarchy
- Auto-generated `sitemap.xml` and `robots.txt`
- Per-page Open Graph + Twitter Card meta
- Schema.org JSON-LD on every page
- Geo-targeting meta (configurable country/region in admin)

## Lead form
- Saves every submission to database (visible in admin)
- Sends you an email notification (via Lovable Emails)
- Fields: name, last name, phone, email, amount lost, case description
- Client + server-side Zod validation, anti-spam honeypot

## Floating contact buttons
- **WhatsApp** floating button (bottom-right) — opens chat with pre-filled message
- **Telegram** floating button (stacked above WhatsApp)
- Numbers/usernames editable from admin

## Admin Dashboard (full CMS)
**Auth:** Lovable Cloud auth (email + password) with role-based access. Roles stored in separate `user_roles` table (`admin`, `editor`). First signup auto-promotes to admin; admins invite/manage other admins/editors.

**Dashboard sections:**
- **Pages** — list every page; for each: edit SEO meta, hero image/headline/subhead, and a flexible **section editor** (add / remove / reorder / duplicate sections like Hero, Stats, Steps, Testimonials, FAQ, CTA, Rich Text, Image+Text)
- **Global content** — site name, logo, footer, "as seen in" logos
- **Services** — manage the 8 service pages and add new ones
- **Testimonials** — CRUD with photo, name, location, quote, rating
- **FAQ** — CRUD with categories
- **Media library** — upload/replace images (Lovable Cloud storage); used everywhere
- **Socials & contact** — WhatsApp number, Telegram, email, phone, address, social links (you'll send these later)
- **Leads inbox** — view/search/export form submissions, mark as contacted
- **Users & roles** — invite admins/editors
- **SEO settings** — global meta defaults, geo (country/region), Google Analytics ID

All editable content lives in the database and is fetched server-side, so edits go live instantly without redeploys.

## Deliverables in this build
- Full public site (15 pages) rebranded with the white-gradient theme
- Database schema + RLS for content, services, testimonials, FAQ, leads, media, users, roles
- Admin dashboard with everything above
- Email notifications for new leads
- Floating WhatsApp + Telegram buttons (placeholder numbers — you'll provide real ones)
- Sitemap, robots.txt, JSON-LD, Open Graph

After approval I'll set up Lovable Cloud + email infrastructure as the first step, then build everything out.
