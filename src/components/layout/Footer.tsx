import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchSiteSettings, type SiteSettings } from "@/lib/site";
import { Facebook, Twitter, Linkedin, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { Logo } from "@/components/site/Logo";

export function Footer() {
  const [s, setS] = useState<SiteSettings | null>(null);
  useEffect(() => { fetchSiteSettings().then(setS); }, []);
  return (
    <footer className="bg-soft-gradient border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-1">
          <Logo className="h-14 w-auto mb-4" />
          <p className="text-sm text-muted-foreground mt-3">
            {s?.tagline ?? "Helping victims of online financial scams reclaim their funds worldwide."}
          </p>
          <div className="flex gap-3 mt-4">
            {s?.facebook_url && <a href={s.facebook_url} aria-label="Facebook" className="text-muted-foreground hover:text-primary"><Facebook className="w-5 h-5" /></a>}
            {s?.twitter_url && <a href={s.twitter_url} aria-label="Twitter" className="text-muted-foreground hover:text-primary"><Twitter className="w-5 h-5" /></a>}
            {s?.linkedin_url && <a href={s.linkedin_url} aria-label="LinkedIn" className="text-muted-foreground hover:text-primary"><Linkedin className="w-5 h-5" /></a>}
            {s?.instagram_url && <a href={s.instagram_url} aria-label="Instagram" className="text-muted-foreground hover:text-primary"><Instagram className="w-5 h-5" /></a>}
            {s?.youtube_url && <a href={s.youtube_url} aria-label="YouTube" className="text-muted-foreground hover:text-primary"><Youtube className="w-5 h-5" /></a>}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Recovery Services</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/services/$slug" params={{ slug: "cryptocurrency" }} className="hover:text-primary">Cryptocurrency</Link></li>
            <li><Link to="/services/$slug" params={{ slug: "pig-butchering" }} className="hover:text-primary">Pig Butchering</Link></li>
            <li><Link to="/services/$slug" params={{ slug: "romance-scams" }} className="hover:text-primary">Romance Scams</Link></li>
            <li><Link to="/services/$slug" params={{ slug: "forex" }} className="hover:text-primary">Forex & Trading</Link></li>
            <li><Link to="/services/$slug" params={{ slug: "binary-options" }} className="hover:text-primary">Binary Options</Link></li>
            <li><Link to="/services/$slug" params={{ slug: "investment-fraud" }} className="hover:text-primary">Investment Fraud</Link></li>
            <li><Link to="/services/$slug" params={{ slug: "phishing" }} className="hover:text-primary">Phishing & ID Theft</Link></li>
            <li><Link to="/services/$slug" params={{ slug: "tax-fraud" }} className="hover:text-primary">Tax Fraud Recovery</Link></li>
            <li><Link to="/services/$slug" params={{ slug: "credit-card-fraud" }} className="hover:text-primary">Credit Card Fraud</Link></li>
            <li><Link to="/services/$slug" params={{ slug: "tech-support" }} className="hover:text-primary">Tech Support Scams</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-primary">About Us</Link></li>
            <li><Link to="/testimonials" className="hover:text-primary">Testimonials</Link></li>
            <li><Link to="/success-calculator" className="hover:text-primary">Success Calculator</Link></li>
            <li><Link to="/loans" className="hover:text-primary">Apply for a Loan</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-primary">Privacy Policy</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Get in touch</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {s?.contact_email && <li className="flex gap-2"><Mail className="w-4 h-4 mt-0.5" /> <a href={`mailto:${s.contact_email}`} className="hover:text-primary">{s.contact_email}</a></li>}
            {s?.contact_phone && <li className="flex gap-2"><Phone className="w-4 h-4 mt-0.5" /> <a href={`tel:${s.contact_phone}`} className="hover:text-primary">{s.contact_phone}</a></li>}
            {s?.contact_address && <li className="flex gap-2"><MapPin className="w-4 h-4 mt-0.5" /> {s.contact_address}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        {s?.footer_text ?? `© ${new Date().getFullYear()} ChanAidRecovery Hub. All rights reserved.`}
      </div>
    </footer>
  );
}
