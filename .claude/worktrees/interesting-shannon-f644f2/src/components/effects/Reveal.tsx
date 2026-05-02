import type { ReactNode, CSSProperties } from "react";
import { useReveal } from "@/hooks/use-reveal";

type Direction = "up" | "down" | "left" | "right" | "zoom" | "tilt";

interface RevealProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "article" | "li";
}

const transforms: Record<Direction, string> = {
  up: "translate3d(0, 40px, 0)",
  down: "translate3d(0, -40px, 0)",
  left: "translate3d(-40px, 0, 0)",
  right: "translate3d(40px, 0, 0)",
  zoom: "scale(0.92)",
  tilt: "perspective(1000px) rotateX(18deg) translate3d(0, 30px, 0)",
};

export function Reveal({
  children,
  direction = "up",
  delay = 0,
  className = "",
  as: Tag = "div",
}: RevealProps) {
  const { ref, visible } = useReveal<HTMLDivElement>();

  const style: CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible
      ? "perspective(1000px) translate3d(0,0,0) scale(1) rotateX(0)"
      : transforms[direction],
    transition: `opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 1.1s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
    willChange: "opacity, transform",
    transformStyle: "preserve-3d",
  };

  return (
    <Tag ref={ref as never} style={style} className={className}>
      {children}
    </Tag>
  );
}
