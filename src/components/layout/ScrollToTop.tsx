import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Reveal } from "@/components/effects/Reveal";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <Reveal direction="up" delay={100}>
        <button
          onClick={scrollToTop}
          className="group relative flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl transition-all hover:scale-110 active:scale-95 hover:bg-white/20"
          aria-label="Scroll to top"
        >
          {/* Pulsing background effect */}
          <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-pulse group-hover:bg-primary/30 transition-colors" />
          
          <ArrowUp className="w-5 h-5 text-slate-800 relative z-10 transition-transform group-hover:-translate-y-1" />
        </button>
      </Reveal>
    </div>
  );
}
