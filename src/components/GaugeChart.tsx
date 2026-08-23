import React from 'react';

interface GaugeChartProps {
  score: number; // 0 to 100
  size?: number;
  label?: string;
  sublabel?: string;
}

export const GaugeChart: React.FC<GaugeChartProps> = ({
  score,
  size = 180,
  label = 'Readiness Score',
  sublabel = 'out of 100'
}) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(Math.max(score, 0), 100);
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let colorClass = '#3b82f6'; // Blue
  if (clampedScore >= 75) colorClass = '#10b981'; // Emerald
  else if (clampedScore >= 60) colorClass = '#f59e0b'; // Amber
  else colorClass = '#ef4444'; // Red

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Track Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Indicator Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colorClass}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold text-slate-50 tracking-tight">
            {clampedScore}
          </span>
          <span className="text-xs text-slate-400 font-medium">{sublabel}</span>
        </div>
      </div>
      <p className="mt-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">{label}</p>
    </div>
  );
};
