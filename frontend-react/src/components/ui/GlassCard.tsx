import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
}

export default function GlassCard({ children }: GlassCardProps) {
  return (
    <div className="glass rounded-2xl p-6 shadow-xl backdrop-blur-lg bg-white/10 border border-white/20">
      {children}
    </div>
  );
}
