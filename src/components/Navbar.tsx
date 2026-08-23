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
    <header className="sticky top-0 z-50 bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setActiveTab(user?.role === 'Admin' ? 'admin' : 'student')}
          >
            <div className="p-2.5 bg-gradient-to-tr from-sky-600 to-indigo-600 rounded-xl shadow-lg shadow-sky-500/20 text-white transition-transform group-hover:scale-105">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-extrabold text-white tracking-tight">Career<span className="text-sky-400">Nexus</span></span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 font-semibold border border-sky-500/20">PRO AI</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide hidden sm:block">College Placement Intelligence & Career Readiness</p>
            </div>
          </div>

          {/* Nav Tabs */}
          {user && (
            <nav className="flex items-center space-x-1 sm:space-x-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800/90">
              {user.role === 'Student' && (
                <button
                  onClick={() => setActiveTab('student')}
                  className={`flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'student'
                      ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 mr-1.5" />
                  My Readiness
                </button>
              )}

              {user.role === 'Admin' && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'admin'
                      ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
                  Placement Overview
                </button>
              )}

              <button
                onClick={() => setActiveTab('ml-workbench')}
                className={`flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'ml-workbench'
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 mr-1.5" />
                ML Workbench
              </button>

              <button
                onClick={() => setActiveTab('what-if')}
                className={`flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'what-if'
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 mr-1.5" />
                What-If Lab
              </button>
            </nav>
          )}

          {/* User Controls */}
          {user && (
            <div className="flex items-center space-x-3">
              {/* Account Quick Switcher */}
              <div className="hidden lg:flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px]">
                <span className="px-2 text-slate-500 font-medium">Role:</span>
                <button
                  onClick={() => onSwitchAccount('Student')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    user.role === 'Student' ? 'bg-slate-800 text-sky-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Student
                </button>
                <button
                  onClick={() => onSwitchAccount('Admin')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    user.role === 'Admin' ? 'bg-slate-800 text-sky-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Admin
                </button>
              </div>

              {/* Profile Badge */}
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700/80 flex items-center justify-center text-slate-300 shadow-inner">
                  {user.role === 'Admin' ? <Shield className="w-4 h-4 text-emerald-400" /> : <UserIcon className="w-4 h-4 text-sky-400" />}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-slate-200 leading-tight">{user.email.split('@')[0]}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{user.role}</p>
                </div>
                <button
                  onClick={onLogout}
                  title="Logout"
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors"
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
