import React from "react";

const LOGOS = {
  forbes: "/forbes-logo.svg",
  bloomberg: "/bloomberg-logo.svg",
  reuters: "/reuters-logo.svg",
  cnbc: "https://upload.wikimedia.org/wikipedia/commons/e/e3/CNBC_logo.svg",
  ft: "/ft-logo.svg",
  bbc: "https://upload.wikimedia.org/wikipedia/commons/4/41/BBC_Logo_2021.svg"
};

export function ForbesLogo({ className }: { className?: string }) {
  return <img src={LOGOS.forbes} alt="Forbes" className={className} />;
}

export function BloombergLogo({ className }: { className?: string }) {
  return <img src={LOGOS.bloomberg} alt="Bloomberg" className={className} />;
}

export function ReutersLogo({ className }: { className?: string }) {
  return <img src={LOGOS.reuters} alt="Reuters" className={className} />;
}

export function CnbcLogo({ className }: { className?: string }) {
  return <img src={LOGOS.cnbc} alt="CNBC" className={className} />;
}

export function FtLogo({ className }: { className?: string }) {
  return <img src={LOGOS.ft} alt="Financial Times" className={className} />;
}

export function BbcLogo({ className }: { className?: string }) {
  return <img src={LOGOS.bbc} alt="BBC" className={className} />;
}
