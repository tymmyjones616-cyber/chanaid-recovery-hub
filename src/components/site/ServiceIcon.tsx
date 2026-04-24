import {
  Bitcoin,
  TrendingUp,
  LineChart,
  BarChart3,
  CreditCard,
  Home,
  Heart,
  ShieldAlert,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  Bitcoin,
  TrendingUp,
  LineChart,
  BarChart3,
  CreditCard,
  Home,
  Heart,
  ShieldAlert,
  Sparkles,
};

/**
 * Renders a premium 3D-style icon tile. The icon is resolved from a string
 * name (matches lucide-react export), with a sensible fallback.
 */
export function ServiceIcon({ name, className = "" }: { name?: string | null; className?: string }) {
  const Icon = (name && map[name]) || Sparkles;
  return (
    <div
      className={`relative h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-elegant ${className}`}
      style={{
        background: "var(--gradient-cta)",
        transform: "translateZ(0)",
      }}
    >
      <span
        aria-hidden
        className="absolute inset-0 rounded-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.45), rgba(255,255,255,0) 55%)",
          mixBlendMode: "overlay",
        }}
      />
      <Icon className="w-7 h-7 relative drop-shadow" strokeWidth={2.2} />
    </div>
  );
}