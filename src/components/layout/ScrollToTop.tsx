import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const routerState = useRouterState();

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [routerState.location.pathname]);

  useEffect(() => {
    const toggle = () => setIsVisible(window.scrollY > 300);
    window.addEventListener("scroll", toggle, { passive: true });
    return () => window.removeEventListener("scroll", toggle);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 left-8 z-[100] h-14 w-14 rounded-full bg-slate-900/90 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:bg-primary transition-all duration-500 group"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-7 h-7 group-hover:-translate-y-1.5 transition-transform duration-500 ease-out" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
