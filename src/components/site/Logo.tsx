import logoUrl from "@/assets/logo.png";
import { Link } from "@tanstack/react-router";

interface LogoProps {
  className?: string;
  withWordmark?: boolean;
}

export function Logo({ className = "h-16 w-auto", withWordmark: _withWordmark = false }: LogoProps) {
  return (
    <Link to="/" className="flex items-center group" aria-label="ChanAidRecovery — Home">
      <img
        src={logoUrl}
        alt="ChanAidRecovery"
        className={`${className} transition-transform duration-500 group-hover:scale-105 mix-blend-multiply`}
      />
    </Link>
  );
}
