import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchSiteSettings, type SiteSettings } from "@/lib/site";
import { Facebook, Twitter, Linkedin, Instagram, Youtube, Mail, Phone, MapPin, Send } from "lucide-react";
import { Logo } from "@/components/site/Logo";

export function Footer() {
  const [s, setS] = useState<SiteSettings | null>(null);
  useEffect(() => { fetchSiteSettings().then(setS); }, []);
  
  const contactEmail = s?.contact_email ?? "support@chanaidrecovery.com";

  return (
    <footer className="bg-soft-gradient border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid md:grid-cols-12 gap-12">
        <div className="md:col-span-4">
          <div className="mb-6 inline-block">
            <Logo className="h-12 w-auto" />
          </div>
          <p className="text-base text-muted-foreground mt-4 leading-relaxed max-w-sm">
            {s?.tagline ?? "Leading the way in global financial asset recovery. We leverage advanced forensics to reclaim what is rightfully yours."}
          </p>
          <div className="flex gap-4 mt-8">
            {[
              { icon: Facebook, href: s?.facebook_url, label: "Facebook" },
              { icon: Twitter, href: s?.twitter_url, label: "Twitter" },
              { icon: Send, href: s?.telegram_username ? (s.telegram_username.startsWith("+") ? `https://t.me/${s.telegram_username}` : `https://t.me/${s.telegram_username}`) : "https://t.me/+M5J9C5mngShjODcx", label: "Telegram" },
              { icon: Linkedin, href: s?.linkedin_url, label: "LinkedIn" },
              { icon: Instagram, href: s?.instagram_url, label: "Instagram" },
              { icon: Youtube, href: s?.youtube_url, label: "YouTube" }
            ].map((social) => social.href && (
              <a 
                key={social.label}
                href={social.href} 
                aria-label={social.label} 
                className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all shadow-sm"
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <h4 className="font-bold text-slate-900 mb-6 text-sm uppercase tracking-wider">Expertise</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li><Link to="/services/$slug" params={{ slug: "cryptocurrency" }} className="hover:text-primary transition-colors">Crypto Recovery</Link></li>
            <li><Link to="/services/$slug" params={{ slug: "pig-butchering" }} className="hover:text-primary transition-colors">Pig Butchering</Link></li>
            <li><Link to="/services/$slug" params={{ slug: "romance-scams" }} className="hover:text-primary transition-colors">Romance Scams</Link></li>
            <li><Link to="/services/$slug" params={{ slug: "forex" }} className="hover:text-primary transition-colors">Forex & Trading</Link></li>
            <li><Link to="/services/$slug" params={{ slug: "investment-fraud" }} className="hover:text-primary transition-colors">Investment Fraud</Link></li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <h4 className="font-bold text-slate-900 mb-6 text-sm uppercase tracking-wider">Company</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-primary transition-colors">About Our Firm</Link></li>
            <li><Link to="/testimonials" className="hover:text-primary transition-colors">Success Stories</Link></li>
            <li><Link to="/blog" className="hover:text-primary transition-colors">Recovery Blog</Link></li>
            <li><Link to="/loans" className="hover:text-primary transition-colors">Recovery Loans</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><a href={`mailto:${contactEmail}`} className="hover:text-primary transition-colors">Email Us</a></li>
          </ul>
        </div>

        <div className="md:col-span-4">
          <h4 className="font-bold text-slate-900 mb-6 text-sm uppercase tracking-wider">Direct Support</h4>
          <div className="bg-white/40 backdrop-blur-sm border border-white/60 rounded-2xl p-6 shadow-sm">
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Direct Support Email</div>
                  <a href={`mailto:${contactEmail}`} className="font-bold text-lg text-slate-900 hover:text-primary transition-colors block leading-tight">{contactEmail}</a>
                  <p className="text-[10px] text-muted-foreground mt-1 font-medium">Available 24/7 for forensic triage</p>
                </div>
              </li>
              {s?.contact_phone && (
                <li className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Call Now</div>
                    <a href={`tel:${s.contact_phone}`} className="font-semibold text-slate-900 hover:text-primary transition-colors">{s.contact_phone}</a>
                  </div>
                </li>
              )}
              {s?.contact_address && (
                <li className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Global HQ</div>
                    <span className="font-medium text-slate-600 leading-tight block">{s.contact_address}</span>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
      
      <div className="border-t border-slate-200 py-8 text-center">
        <p className="text-xs text-muted-foreground font-medium">
          {s?.footer_text ?? `© ${new Date().getFullYear()} ChanAidRecovery Hub. Registered Financial Asset Recovery Firm.`}
        </p>
      </div>
    </footer>
  );
}
