import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-6 mt-12 text-slate-500 text-xs text-center">
      <div className="max-w-7xl mx-auto px-4">
        <p className="font-medium text-slate-400">
          CareerNexus — AI-Powered College Placement Intelligence & Career Readiness Platform
        </p>
        <p className="mt-1 text-[11px]">
          ML models provide estimated placement likelihood based on historical training data. Not a guaranteed placement outcome.
        </p>
        <p className="mt-2 text-[10px] text-slate-600">
          Synthetic Educational Dataset &bull; Configurable Scoring &bull; SHAP Explainable AI Pipeline
        </p>
      </div>
    </footer>
  );
};
