import React, { useState } from 'react';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Simulator from './components/Simulator';
import LearningCenter from './components/LearningCenter';
import AIGuidance from './components/AIGuidance';
import Plans from './components/Plans';
import Login from './components/Login';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-brand-primary border-t-brand-accent rounded-full animate-spin" />
          <p className="font-black text-slate-400 animate-pulse tracking-widest uppercase text-xs">Initializing Dhan Nivesh...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const activeTabLabel = {
    'dashboard': 'Portfolio Overview',
    'simulator': 'Virtual Trading Simulator',
    'learning': 'Educational Learning Path',
    'ai': 'AI Investment Guidance',
    'plans': 'Subscription Plans'
  }[activeTab] || 'Dhan Nivesh';

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      {/* Desktop layout with sidebar offset */}
      <div className="lg:ml-68 flex flex-col min-h-screen">
        <div className="pt-14 lg:pt-0">
          <Header title={activeTabLabel} />
        </div>
        <main className="p-4 md:p-6 lg:p-8 flex-1">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'simulator' && <Simulator />}
          {activeTab === 'learning' && <LearningCenter />}
          {activeTab === 'ai' && <AIGuidance />}
          {activeTab === 'plans' && <Plans />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
