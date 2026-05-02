import {
  Bitcoin,
  TrendingUp,
  TrendingDown,
  LineChart,
  BarChart3,
  CreditCard,
  Home,
  Heart,
  HeartCrack,
  ShieldAlert,
  ShieldOff,
  Sparkles,
  Landmark,
  MonitorX,
  Wallet,
  Coins,
  ShieldCheck,
  Activity,
  Search,
  Stethoscope,
  Briefcase,
  Scale,
  Lock,
  Unlock,
  UserX,
  Smartphone,
  Laptop,
  CloudOff,
  GanttChart,
  Hammer,
  Gavel,
  History,
  FileSearch,
  MailQuestion,
  Fingerprint,
  Users2,
  HardDriveDownload,
  AlertTriangle,
  Zap,
  CheckCircle2,
  ShieldQuestion,
  SearchCode,
  ShieldBan,
  DatabaseZap,
  Globe2,
  Network,
  Cpu,
  Trophy,
  Award,
  BadgeCheck,
  ShieldEllipsis,
  MessageCircleOff,
  SmartphoneNfc,
  Ghost,
  EyeOff,
  Crosshair,
  TimerReset,
  Microscope,
  Binary,
  Bot,
  Boxes,
  Code2,
  Fingerprint as FingerprintIcon,
  ShieldCheck as ShieldCheckIcon,
  Unlock as UnlockIcon,
  UserMinus,
  Construction,
  ShieldAlert as ShieldAlertIcon,
  Skull,
  Siren,
  Terminal,
  Activity as ActivityIcon,
  BarChart3 as BarChartIcon,
  Briefcase as BriefcaseIcon,
  Calendar as CalendarIcon,
  CheckCircle2 as CheckCircleIcon,
  ClipboardList as ClipboardIcon,
  Clock as ClockIcon,
  CreditCard as CreditCardIcon,
  Database as DatabaseIcon,
  Eye as EyeIcon,
  FileText as FileIcon,
  Globe as GlobeIcon,
  Heart as HeartIcon,
  Home as HomeIcon,
  Image as ImageIcon,
  LayoutDashboard as LayoutIcon,
  Link2 as LinkIcon,
  Lock as LockIcon,
  Mail as MailIcon,
  MessageSquare as MessageSquareIcon,
  Moon as MoonIcon,
  Phone as PhoneIcon,
  Play as PlayIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  Share2 as ShareIcon,
  Shield as ShieldIcon,
  Star as StarIcon,
  Sun as SunIcon,
  Trash2 as TrashIcon,
  User as UserIcon,
  Video as VideoIcon,
  XCircle as XCircleIcon,
  Zap as ZapIcon,
  DollarSign,
  type LucideIcon,
  ClipboardList,
  Trash2,
} from "lucide-react";

// ─── Premium hand-crafted SVG icons for the 4 hero service tiles ────────────
// Each returns a 32×32 SVG optimised for the CTA-gradient tile background.
// Resolution order: PREMIUM_ICONS → lucide map → Sparkles fallback.

const PREMIUM_ICONS: Record<string, () => React.ReactElement> = {
  /** Blockchain Forensics — three nodes in triangle + scan bracket */
  BlockchainForensics: () => (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 relative drop-shadow-lg">
      {/* Triangle of network nodes */}
      <circle cx="16" cy="6"  r="3" />
      <circle cx="6"  cy="24" r="3" />
      <circle cx="26" cy="24" r="3" />
      {/* Connecting edges */}
      <line x1="13.5" y1="8.6"  x2="8.5"  y2="21.4" />
      <line x1="18.5" y1="8.6"  x2="23.5" y2="21.4" />
      <line x1="9"    y1="24"   x2="23"   y2="24"   />
      {/* Scan/target bracket around top node */}
      <path d="M11 2 L9 2 L9 4" />
      <path d="M21 2 L23 2 L23 4" />
      <path d="M11 10 L9 10 L9 8" />
      <path d="M21 10 L23 10 L23 8" />
    </svg>
  ),

  /** Legal Scale — classic balance of justice for forex / legal enforcement */
  LegalScale: () => (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 relative drop-shadow-lg">
      {/* Central pole */}
      <line x1="16" y1="4"  x2="16" y2="28" />
      {/* Horizontal beam */}
      <line x1="5"  y1="9"  x2="27" y2="9"  />
      {/* Left pan chain */}
      <line x1="8"  y1="9"  x2="6"  y2="18" />
      <line x1="8"  y1="9"  x2="10" y2="18" />
      <path d="M6 18 Q8 21 10 18" />
      {/* Right pan chain */}
      <line x1="24" y1="9"  x2="22" y2="18" />
      <line x1="24" y1="9"  x2="26" y2="18" />
      <path d="M22 18 Q24 21 26 18" />
      {/* Base */}
      <line x1="11" y1="28" x2="21" y2="28" />
      {/* Fulcrum diamond */}
      <path d="M16 6 L18 9 L16 12 L14 9 Z" />
    </svg>
  ),

  /** Digital Fingerprint — spiral arcs representing identity forensics */
  DigitalFingerprint: () => (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 relative drop-shadow-lg">
      {/* Centre dot */}
      <circle cx="16" cy="16" r="1.5" fill="currentColor" stroke="none" />
      {/* Ridge 1 */}
      <path d="M16 11 C19.3 11 22 13.7 22 17 C22 18.6 21.3 20.1 20.2 21.1" />
      {/* Ridge 2 */}
      <path d="M16 8 C21 8 25 12 25 17 C25 20.3 23.3 23.2 20.8 25" />
      {/* Ridge 3 */}
      <path d="M16 5 C22.6 5 28 10.4 28 17 C28 22.5 24.4 27.1 19.4 28.6" />
      {/* Left side arcs mirrored */}
      <path d="M16 11 C12.7 11 10 13.7 10 17 C10 18.6 10.7 20.1 11.8 21.1" />
      <path d="M16 8 C11 8 7 12 7 17 C7 20.3 8.7 23.2 11.2 25" />
      <path d="M16 5 C9.4 5 4 10.4 4 17 C4 22.5 7.6 27.1 12.6 28.6" />
    </svg>
  ),

  /** Asset Trace — globe with horizontal bands + crosshair target overlay */
  AssetTrace: () => (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 relative drop-shadow-lg">
      {/* Globe circle */}
      <circle cx="16" cy="16" r="11" />
      {/* Latitude bands */}
      <path d="M5 16 Q10 13 16 16 Q22 19 27 16" />
      <path d="M7 10.5 Q11.5 8 16 10.5 Q20.5 13 25 10.5" />
      <path d="M7 21.5 Q11.5 19 16 21.5 Q20.5 24 25 21.5" />
      {/* Meridian */}
      <path d="M16 5 Q19 10.5 19 16 Q19 21.5 16 27" />
      {/* Crosshair target (top-right, partially overlapping globe edge) */}
      <circle cx="24" cy="8" r="4" strokeDasharray="2 2" />
      <line x1="24" y1="2" x2="24" y2="5" />
      <line x1="24" y1="11" x2="24" y2="14" />
      <line x1="18" y1="8" x2="21" y2="8" />
      <line x1="27" y1="8" x2="30" y2="8" />
    </svg>
  ),
};

// ─── Lucide icon map (existing, preserved for DB-sourced icon names) ─────────
const map: Record<string, LucideIcon> = {
  Bitcoin,
  TrendingUp,
  TrendingDown,
  LineChart,
  BarChart3,
  CreditCard,
  Home,
  Heart,
  HeartCrack,
  ShieldAlert,
  ShieldOff,
  Sparkles,
  Landmark,
  MonitorX,
  Wallet,
  Coins,
  ShieldCheck,
  Activity,
  Search,
  Stethoscope,
  Briefcase,
  Scale,
  Lock,
  Unlock,
  UserX,
  Smartphone,
  Laptop,
  CloudOff,
  GanttChart,
  Hammer,
  Gavel,
  History,
  FileSearch,
  MailQuestion,
  Fingerprint,
  Users2,
  HardDriveDownload,
  AlertTriangle,
  Zap,
  CheckCircle2,
  ShieldQuestion,
  SearchCode,
  ShieldBan,
  DatabaseZap,
  Globe2,
  Network,
  Cpu,
  Trophy,
  Award,
  BadgeCheck,
  ShieldEllipsis,
  MessageCircleOff,
  SmartphoneNfc,
  Ghost,
  EyeOff,
  Crosshair,
  TimerReset,
  Microscope,
  Binary,
  Bot,
  Boxes,
  Code2,
  FingerprintIcon,
  ShieldCheckIcon,
  UnlockIcon,
  UserMinus,
  Construction,
  ShieldAlertIcon,
  Skull,
  Siren,
  Terminal,
  ActivityIcon,
  BarChartIcon,
  BriefcaseIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClipboardIcon,
  ClockIcon,
  CreditCardIcon,
  DatabaseIcon,
  EyeIcon,
  FileIcon,
  GlobeIcon,
  HeartIcon,
  HomeIcon,
  ImageIcon,
  LayoutIcon,
  LinkIcon,
  LockIcon,
  MailIcon,
  MessageSquareIcon,
  MoonIcon,
  PhoneIcon,
  PlayIcon,
  SearchIcon,
  SettingsIcon,
  ShareIcon,
  ShieldIcon,
  StarIcon,
  SunIcon,
  TrashIcon,
  UserIcon,
  VideoIcon,
  XCircleIcon,
  ZapIcon,
  FileText: FileIcon,
  DollarSign,
};

/**
 * Renders a premium 3D-style icon tile.
 *
 * Resolution order:
 *   1. PREMIUM_ICONS[name]  — hand-crafted SVGs for hero service tiles
 *   2. map[name]            — full Lucide icon library (DB-sourced names)
 *   3. Sparkles             — fallback
 */
export function ServiceIcon({ name, className = "" }: { name?: string | null; className?: string }) {
  const premiumSvg = name ? PREMIUM_ICONS[name] : undefined;
  const LucideIcon = (!premiumSvg && name) ? map[name] : undefined;

  return (
    <div
      className={`relative h-16 w-16 rounded-[1.25rem] flex items-center justify-center text-white shadow-elegant overflow-hidden ${className}`}
      style={{
        background: "var(--gradient-cta)",
        transform: "translateZ(0)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.18), var(--shadow-elegant)",
      }}
    >
      {/* Outer Glow */}
      <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Glass Layer */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-[1.25rem] border border-white/30"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 60%)",
          mixBlendMode: "overlay",
        }}
      />

      {/* Shimmer Effect */}
      <div className="absolute inset-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />

      {/* Icon — premium SVG or Lucide fallback */}
      {premiumSvg ? (
        <div className="relative group-hover:scale-110 transition-transform duration-300">
          {premiumSvg()}
        </div>
      ) : LucideIcon ? (
        <LucideIcon className="w-8 h-8 relative drop-shadow-lg filter group-hover:scale-110 transition-transform duration-300" strokeWidth={2.5} />
      ) : (
        <Sparkles className="w-8 h-8 relative drop-shadow-lg filter group-hover:scale-110 transition-transform duration-300" strokeWidth={2.5} />
      )}
    </div>
  );
}
