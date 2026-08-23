import React from 'react';

interface RiskBadgeProps {
  level: 'Low' | 'Medium' | 'High' | 'Critical' | string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level }) => {
  let badgeStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  if (level === 'Medium') badgeStyle = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  else if (level === 'High') badgeStyle = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  else if (level === 'Critical') badgeStyle = 'bg-rose-500/10 text-rose-400 border-rose-500/20';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStyle}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        level === 'Critical' ? 'bg-rose-400 animate-pulse' :
        level === 'High' ? 'bg-amber-400' :
        level === 'Medium' ? 'bg-blue-400' : 'bg-emerald-400'
      }`}></span>
      {level}
    </span>
  );
};
