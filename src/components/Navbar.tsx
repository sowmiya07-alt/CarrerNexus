import React from 'react';
import { User } from '../types';
import { Sparkles, Shield, User as UserIcon, LogOut, BarChart3, Sliders, Cpu, UserCheck } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onSwitchAccount: (role: 'Admin' | 'Student') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  onSwitchAccount
}) => {
  return (
    <header className="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab(user?.role === 'Admin' ? 'admin' : 'student')}>
            <div className="p-2 bg-gradient-to-tr from-brand-600 to-brand-400 rounded-xl shadow-md text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-white tracking-tight">Career<span className="text-brand-400">Nexus</span></span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 font-semibold border border-brand-500/20">v1.0 AI</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">College Placement Intelligence Platform</p>
            </div>
          </div>

          {/* Navigation Links */}
          {user && (
            <nav className="flex items-center space-x-1 sm:space-x-2">
              {user.role === 'Student' && (
                <button
                  onClick={() => setActiveTab('student')}
                  className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'student'
                      ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <UserCheck className="w-4 h-4 mr-1.5" />
                  My Readiness
                </button>
              )}

              {user.role === 'Admin' && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'admin'
                      ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 mr-1.5" />
                  Placement Overview
                </button>
              )}

              <button
                onClick={() => setActiveTab('ml-workbench')}
                className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'ml-workbench'
                    ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Cpu className="w-4 h-4 mr-1.5" />
                ML Workbench
              </button>

              <button
                onClick={() => setActiveTab('what-if')}
                className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'what-if'
                    ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Sliders className="w-4 h-4 mr-1.5" />
                What-If Lab
              </button>
            </nav>
          )}

          {/* User & Demo Switcher */}
          {user && (
            <div className="flex items-center space-x-3">
              {/* Demo Account Quick Switcher */}
              <div className="hidden lg:flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
                <span className="px-2 text-slate-500 font-medium">Demo:</span>
                <button
                  onClick={() => onSwitchAccount('Student')}
                  className={`px-2 py-0.5 rounded font-medium ${
                    user.role === 'Student' ? 'bg-slate-800 text-brand-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Student
                </button>
                <button
                  onClick={() => onSwitchAccount('Admin')}
                  className={`px-2 py-0.5 rounded font-medium ${
                    user.role === 'Admin' ? 'bg-slate-800 text-brand-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Admin
                </button>
              </div>

              {/* Profile Badge */}
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                  {user.role === 'Admin' ? <Shield className="w-4 h-4 text-emerald-400" /> : <UserIcon className="w-4 h-4 text-brand-400" />}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-slate-200 leading-tight">{user.email.split('@')[0]}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{user.role}</p>
                </div>
                <button
                  onClick={onLogout}
                  title="Logout"
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
