import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { ExpenseHistory } from './components/ExpenseHistory';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { Profile } from './components/Profile';
import { Sidebar } from './components/Sidebar';

type Tab = 'dashboard' | 'history' | 'profile';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyber-cyan border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-cyber-cyan selection:text-cyber-dark flex">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto animate-slide-up">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'history' && <ExpenseHistory />}
          {activeTab === 'profile' && <Profile />}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
