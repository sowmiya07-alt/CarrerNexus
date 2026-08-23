import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendUp
}) => {
  return (
    <div className="glass-card p-5 flex flex-col justify-between relative overflow-hidden group">
      {/* Background Micro Glow */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-all duration-500" />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">{title}</p>
          <h3 className="text-2xl font-bold text-slate-50 mt-1.5 tracking-tight font-mono">{value}</h3>
        </div>
        {icon && (
          <div className="p-2.5 bg-slate-900/90 rounded-xl text-sky-400 border border-slate-800 shadow-sm">
            {icon}
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 flex items-center text-xs space-x-2 border-t border-slate-800/60 pt-2.5 relative z-10">
          {trend && (
            <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
              trendUp ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {trend}
            </span>
          )}
          {subtitle && <span className="text-slate-400 font-medium">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
