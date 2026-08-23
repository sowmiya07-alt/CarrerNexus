import React, { useState } from 'react';
import { Sparkles, Shield, User, ArrowRight, Lock, Mail, CheckCircle2 } from 'lucide-react';
import { api, setAuthToken } from '../services/api';
import { User as UserType } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: UserType) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await api.login(email, password);
      setAuthToken(data.token);
      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate. Please try demo credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (role: 'Admin' | 'Student') => {
    if (role === 'Admin') {
      setEmail('admin@careernexus.demo');
      setPassword('demo1234');
    } else {
      setEmail('student@careernexus.demo');
      setPassword('demo1234');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-slate-900/90 border border-slate-800 p-8 rounded-2xl shadow-2xl backdrop-blur-xl">
        
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex p-3 bg-gradient-to-tr from-brand-600 to-brand-400 rounded-2xl shadow-lg text-white mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">CareerNexus</h2>
          <p className="mt-1 text-xs text-brand-400 font-semibold tracking-wide uppercase">
            AI-Powered Placement Intelligence & Readiness Platform
          </p>
        </div>

        {/* Demo Quick Fill Selector */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Quick Demo Login</span>
            <span className="text-[10px] text-slate-500 font-normal">Click to auto-fill</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('Student')}
              className="flex items-center justify-center p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-xs font-semibold text-slate-200 transition-colors"
            >
              <User className="w-4 h-4 mr-1.5 text-brand-400" />
              Student Portal
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('Admin')}
              className="flex items-center justify-center p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-xs font-semibold text-slate-200 transition-colors"
            >
              <Shield className="w-4 h-4 mr-1.5 text-emerald-400" />
              Placement Admin
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-400 font-medium">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. admin@careernexus.demo"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-2.5 px-4 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-lg transition-colors shadow-lg disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : (
              <>
                Sign In to Platform
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </form>

        <div className="border-t border-slate-800 pt-4 text-center">
          <p className="text-[11px] text-slate-500 flex items-center justify-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
            Pre-seeded with 520 synthetic student records & ML pipeline
          </p>
        </div>

      </div>
    </div>
  );
};
