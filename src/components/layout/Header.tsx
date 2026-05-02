import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, ChevronDown, MessageCircle, Send } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/layout/AuthContext";
import { AuthModal } from "@/components/layout/AuthModal";
import { User, LogOut, LayoutDashboard } from "lucide-react";

const services = [
  { slug: "crypto-recovery", name: "Cryptocurrency Recovery" },
  { slug: "forex-scam-recovery", name: "Forex Scam Recovery" },
  { slug: "romance-scam-recovery", name: "Romance Fraud Remediation" },
  { slug: "asset-tracing", name: "Global Asset Tracing" },
  { slug: "binary-options-recovery", name: "Binary Options Recovery" },
  { slug: "corporate-fraud-investigation", name: "Corporate Fraud Investigation" }
];

export function Header() {
  const { user, signOut, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleAction = (to: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    window.location.href = to;
  };

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
          <Link to="/blog" className="hover:text-primary transition" activeProps={{ className: "text-primary" }}>Blog</Link>
          <Link to="/about" className="hover:text-primary transition" activeProps={{ className: "text-primary" }}>About</Link>
          <Link to="/success-calculator" className="hover:text-primary transition" activeProps={{ className: "text-primary" }}>Calculator</Link>
          
          <button 
            onClick={() => handleAction("/loans")}
            className="bg-primary/10 text-primary px-5 py-1.5 rounded-full hover:bg-primary hover:text-white transition-all font-bold tracking-tight"
          >
            Get Loan
          </button>

          {user && (
            <Link to="/dashboard" className="flex items-center gap-2 hover:text-primary transition" activeProps={{ className: "text-primary" }}>
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
          )}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              {isAdmin && (
                <Link to="/admin" className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 hover:text-primary transition-all">Dashboard ADMIN</Link>
              )}
              <div className="h-6 w-px bg-slate-200"></div>
              <button 
                onClick={() => signOut()}
                className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-all font-bold text-xs uppercase tracking-widest"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="inline-flex items-center justify-center bg-slate-900 text-white font-black px-8 py-2.5 rounded-full hover:bg-slate-800 transition-all gap-2 shadow-lg shadow-slate-900/10"
            >
              <User className="w-4 h-4" /> Sign In
            </button>
          )}
        </div>

        <button
          aria-label="Toggle menu"
          className="lg:hidden p-2 rounded-md hover:bg-accent"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

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
            <Link to="/blog" onClick={() => setOpen(false)} className="block py-2">Blog</Link>
            <Link to="/about" onClick={() => setOpen(false)} className="block py-2">About</Link>
            <Link to="/success-calculator" onClick={() => setOpen(false)} className="block py-2">Calculator</Link>
            <button onClick={() => { setOpen(false); handleAction("/loans"); }} className="block w-full text-left py-2 font-bold text-primary">Get Loan</button>
          </div>
        </div>
      )}
    </header>
  );
}
