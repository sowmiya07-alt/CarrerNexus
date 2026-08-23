import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendUp,
  color = 'brand'
}) => {
  return (
    <div className="card-saas flex flex-col justify-between relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-100 mt-1 tracking-tight">{value}</h3>
        </div>
        {icon && (
          <div className="p-2.5 bg-slate-800/90 rounded-lg text-brand-400 border border-slate-700/50">
            {icon}
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center text-xs space-x-2 border-t border-slate-800/60 pt-2.5">
          {trend && (
            <span className={`font-semibold ${trendUp ? 'text-emerald-400' : 'text-amber-400'}`}>
              {trend}
            </span>
          )}
          {subtitle && <span className="text-slate-400">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
