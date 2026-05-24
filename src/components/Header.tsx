import React from 'react';
import { useAuth } from '../lib/AuthContext';
import { LogOut, Wallet } from 'lucide-react';

export default function Header({ title }: { title: string }) {
  const { userData, logout, isDemoMode, isLocalMode } = useAuth();

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-4 md:px-8 z-40 relative">
      <div className="flex items-center space-x-2 md:space-x-4">
        <h2 className="font-bold text-base md:text-lg text-slate-800 truncate">{title}</h2>
        <span className="hidden sm:inline-flex text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
          {isDemoMode ? 'Demo Account' : isLocalMode ? 'Local Account' : 'Virtual Account'}
        </span>
      </div>
      <div className="flex items-center space-x-3 md:space-x-6">
        <div className="hidden md:block text-right">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest leading-tight">Available Capital</p>
          <p className="font-black text-slate-900">₹{userData?.balance?.toLocaleString() || '0'}</p>
        </div>
        <div className="flex items-center gap-2 md:gap-3 md:pl-4 md:border-l border-gray-100">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200 text-sm">
            {userData?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-slate-700 leading-tight">{userData?.name || 'User'}</p>
            <p className="text-[10px] text-slate-400 font-medium">{isDemoMode ? 'Demo' : isLocalMode ? 'Local' : 'Verified'}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-red-600 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
