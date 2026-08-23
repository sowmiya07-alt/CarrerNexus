import React, { useEffect, useState } from 'react';
import { User } from './types';
import { api, getAuthToken, setAuthToken, removeAuthToken } from './services/api';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LoginPage } from './pages/LoginPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { MLWorkbenchPage } from './pages/MLWorkbenchPage';
import { WhatIfSimulatorPage } from './pages/WhatIfSimulatorPage';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('student');

  useEffect(() => {
    checkAuthSession();
  }, []);

  const checkAuthSession = async () => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await api.getCurrentUser();
      setUser(data.user);
      setActiveTab(data.user.role === 'Admin' ? 'admin' : 'student');
    } catch (err) {
      removeAuthToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setActiveTab(authenticatedUser.role === 'Admin' ? 'admin' : 'student');
  };

  const handleLogout = () => {
    removeAuthToken();
    setUser(null);
  };

  const handleSwitchAccount = async (targetRole: 'Admin' | 'Student') => {
    const email = targetRole === 'Admin' ? 'admin@careernexus.demo' : 'student@careernexus.demo';
    try {
      const data = await api.login(email, 'demo1234');
      setAuthToken(data.token);
      setUser(data.user);
      setActiveTab(targetRole === 'Admin' ? 'admin' : 'student');
    } catch (err) {
      console.error('Account switch failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-xs text-slate-400 font-medium">Initializing CareerNexus Platform...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100">
      <div>
        <Navbar
          user={user}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
          onSwitchAccount={handleSwitchAccount}
        />

        <main className="pb-12">
          {activeTab === 'student' && (
            <StudentDashboard
              studentDbId={user.studentDbId || 1}
              onOpenWhatIf={() => setActiveTab('what-if')}
            />
          )}

          {activeTab === 'admin' && <AdminDashboard />}

          {activeTab === 'ml-workbench' && <MLWorkbenchPage />}

          {activeTab === 'what-if' && <WhatIfSimulatorPage />}
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default App;
