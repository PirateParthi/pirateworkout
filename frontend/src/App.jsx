import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserDashboard } from './pages/UserDashboard';
import { HistoryPage } from './pages/HistoryPage';
import { Navbar } from './components/Navbar';
import { ChangePasswordModal } from './components/ChangePasswordModal';

const MainApp = () => {
  const { user, isAdmin, loading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'
  const [currentTab, setCurrentTab] = useState('home'); // 'home', 'create-plan', 'history'
  const [showChangePassword, setShowChangePassword] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return authView === 'login' ? (
      <LoginPage onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <RegisterPage onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenChangePassword={() => setShowChangePassword(true)}
      />

      <main className="flex-1 pb-16">
        {isAdmin ? (
          <AdminDashboard initialView={currentTab} />
        ) : currentTab === 'history' ? (
          <HistoryPage />
        ) : (
          <UserDashboard />
        )}
      </main>

      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
      )}

      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600">
        <p>🏴‍☠️ PirateWorkout • Personalized Coach-to-Client Tracking App</p>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
