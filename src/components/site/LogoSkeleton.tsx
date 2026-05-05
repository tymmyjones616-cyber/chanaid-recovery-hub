interface LogoSkeletonProps {
  className?: string;
}

export function LogoSkeleton({ className = "h-20 w-auto" }: LogoSkeletonProps) {
  return (
    <div
      className={`${className} flex items-center justify-center rounded-lg transition-all duration-500 bg-white/30 backdrop-blur-md border border-white/40 shadow-lg`}
      role="status"
      aria-label="Loading"
    >
      <img
        src="/favicon.png"
        alt=""
        className="h-1/2 w-1/2 object-contain opacity-60 animate-pulse"
      />
    </div>
  );
}
