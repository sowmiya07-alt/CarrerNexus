import React from 'react';

interface GaugeChartProps {
  score: number; // 0 to 100
  size?: number;
  label?: string;
  sublabel?: string;
}

export const GaugeChart: React.FC<GaugeChartProps> = ({
  score,
  size = 190,
  label = 'Readiness Score',
  sublabel = 'out of 100'
}) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(Math.max(score, 0), 100);
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let gradientId = 'gaugeGradientBlue';
  let statusText = 'Optimal';
  let statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

  if (clampedScore >= 78) {
    gradientId = 'gaugeGradientGreen';
    statusText = 'Placement Ready';
    statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  } else if (clampedScore >= 64) {
    gradientId = 'gaugeGradientAmber';
    statusText = 'Nearly Ready';
    statusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  } else {
    gradientId = 'gaugeGradientRose';
    statusText = 'Needs Focus';
    statusColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  }

  return (
    <div className="flex flex-col items-center justify-center p-3">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        
        {/* Ambient Glow */}
        <div 
          className="absolute inset-2 rounded-full opacity-30 blur-xl transition-all duration-700"
          style={{
            background: clampedScore >= 78 ? '#10b981' : clampedScore >= 64 ? '#f59e0b' : '#ef4444'
          }}
        />

        <svg width={size} height={size} className="transform -rotate-90 relative z-10">
          <defs>
            <linearGradient id="gaugeGradientGreen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="gaugeGradientAmber" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="gaugeGradientRose" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
            <linearGradient id="gaugeGradientBlue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>

          {/* Outer Track Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(30, 41, 59, 0.7)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Indicator Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Typography */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20">
          <span className="text-4xl font-extrabold text-white tracking-tighter drop-shadow-md">
            {clampedScore}
          </span>
          <span className="text-[11px] text-slate-400 font-medium tracking-wide uppercase mt-0.5">{sublabel}</span>
        </div>
      </div>

      <div className="mt-3 flex flex-col items-center">
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColor}`}>
          {statusText}
        </span>
        <p className="mt-1.5 text-xs font-semibold text-slate-300 uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
};
