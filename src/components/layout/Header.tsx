import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Logo } from "@/components/site/Logo";

const services = [
  { slug: "binary-options", name: "Binary Options" },
  { slug: "cryptocurrency", name: "Cryptocurrency" },
  { slug: "forex", name: "Forex" },
  { slug: "stock-trading", name: "Stock Trading" },
  { slug: "credit-card-phishing", name: "Credit Card Phishing" },
  { slug: "property-scams", name: "Property Scams" },
  { slug: "romance-scams", name: "Romance Scams" },
  { slug: "other-scams", name: "Other Scams" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all ${
        scrolled ? "bg-white/85 backdrop-blur-md border-b border-border shadow-soft" : "bg-white/40 backdrop-blur"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between">
        <Logo className={scrolled ? "h-20 w-auto" : "h-24 w-auto"} />

        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
          <Link to="/" className="hover:text-primary transition" activeProps={{ className: "text-primary" }} activeOptions={{ exact: true }}>Home</Link>
          <div className="relative group">
            <button className="flex items-center gap-1 hover:text-primary transition">
              Recovery Services <ChevronDown className="w-4 h-4" />
            </button>
            <div className="absolute left-0 top-full pt-2 hidden group-hover:block">
              <div className="bg-white shadow-elegant rounded-xl p-2 min-w-[230px] border border-border">
                {services.map((s) => (
                  <Link
                    key={s.slug}
                    to="/services/$slug"
                    params={{ slug: s.slug }}
                    className="block px-4 py-2 rounded-lg text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    {s.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <Link to="/testimonials" className="hover:text-primary transition" activeProps={{ className: "text-primary" }}>Testimonials</Link>
          <Link to="/about" className="hover:text-primary transition" activeProps={{ className: "text-primary" }}>About</Link>
          <Link to="/success-calculator" className="hover:text-primary transition" activeProps={{ className: "text-primary" }}>Calculator</Link>
          <Link to="/loans" className="hover:text-primary transition" activeProps={{ className: "text-primary" }}>Loans</Link>
          <Link to="/contact" className="hover:text-primary transition" activeProps={{ className: "text-primary" }}>Contact</Link>
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link
            to="/loans"
            className="inline-flex items-center justify-center bg-white border border-primary text-primary font-semibold px-4 py-2.5 rounded-full hover:bg-primary hover:text-white transition-all"
          >
            Get a Loan
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center bg-cta-gradient text-white font-semibold px-5 py-2.5 rounded-full shadow-soft hover:shadow-elegant transition-all"
          >
            Free Consultation
          </Link>
        </div>

        <button
          aria-label="Toggle menu"
          className="lg:hidden p-2 rounded-md hover:bg-accent"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-white">
          <div className="px-4 py-4 space-y-1 text-sm">
            <Link to="/" onClick={() => setOpen(false)} className="block py-2">Home</Link>
            <details className="py-1">
              <summary className="cursor-pointer py-2">Recovery Services</summary>
              <div className="pl-4 space-y-1">
                {services.map((s) => (
                  <Link key={s.slug} to="/services/$slug" params={{ slug: s.slug }} onClick={() => setOpen(false)} className="block py-1.5 text-muted-foreground hover:text-primary">
                    {s.name}
                  </Link>
                ))}
              </div>
            </details>
            <Link to="/testimonials" onClick={() => setOpen(false)} className="block py-2">Testimonials</Link>
            <Link to="/about" onClick={() => setOpen(false)} className="block py-2">About</Link>
            <Link to="/success-calculator" onClick={() => setOpen(false)} className="block py-2">Calculator</Link>
            <Link to="/loans" onClick={() => setOpen(false)} className="block py-2">Loans</Link>
            <Link to="/contact" onClick={() => setOpen(false)} className="block py-2">Contact</Link>
            <Link to="/loans" onClick={() => setOpen(false)} className="block mt-3 text-center border border-primary text-primary font-semibold px-5 py-2.5 rounded-full">
              Get a Loan
            </Link>
            <Link to="/contact" onClick={() => setOpen(false)} className="block mt-2 text-center bg-cta-gradient text-white font-semibold px-5 py-2.5 rounded-full">
              Free Consultation
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}