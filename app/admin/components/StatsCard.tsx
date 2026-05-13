import { type ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  trend?: string;
  color: "indigo" | "purple" | "emerald" | "amber";
  delay?: number;
}

const colorMap = {
  indigo: {
    icon: "from-indigo-500 to-indigo-600",
    shadow: "shadow-indigo-500/20",
    text: "text-indigo-400",
    border: "border-indigo-500/10",
  },
  purple: {
    icon: "from-purple-500 to-purple-600",
    shadow: "shadow-purple-500/20",
    text: "text-purple-400",
    border: "border-purple-500/10",
  },
  emerald: {
    icon: "from-emerald-500 to-emerald-600",
    shadow: "shadow-emerald-500/20",
    text: "text-emerald-400",
    border: "border-emerald-500/10",
  },
  amber: {
    icon: "from-amber-500 to-amber-600",
    shadow: "shadow-amber-500/20",
    text: "text-amber-400",
    border: "border-amber-500/10",
  },
};

export default function StatsCard({ title, value, icon, trend, color, delay = 0 }: StatsCardProps) {
  const c = colorMap[color];
  return (
    <div className={`glass-card p-6 hover:scale-[1.02] transition-all duration-300 animate-fade-in ${c.border}`} style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-white animate-count">{value}</p>
          {trend && <p className={`text-xs font-medium ${c.text}`}>{trend}</p>}
        </div>
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${c.icon} flex items-center justify-center shadow-lg ${c.shadow} animate-float`} style={{ animationDelay: `${delay * 0.5}ms` }}>
          {icon}
        </div>
      </div>
    </div>
  );
}
