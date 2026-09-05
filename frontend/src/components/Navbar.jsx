import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, LogOut, User, ShieldCheck, History, Calendar, PlusCircle, Flame, KeyRound } from 'lucide-react';

export const Navbar = ({ currentTab, setCurrentTab, onOpenChangePassword }) => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="text-xl">🏴‍☠️</span>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
                PirateWorkout
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-slate-800 text-slate-400 border border-slate-700">
                {isAdmin ? 'Coach Portal' : 'Client Mode'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            {isAdmin ? (
              <>
                <button
                  onClick={() => setCurrentTab('home')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                    currentTab === 'home'
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline">Clients & Activity</span>
                </button>
                <button
                  onClick={() => setCurrentTab('create-plan')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                    currentTab === 'create-plan'
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden md:inline">Assign Plan</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setCurrentTab('home')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                    currentTab === 'home'
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Today's Workout</span>
                </button>
                <button
                  onClick={() => setCurrentTab('history')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                    currentTab === 'history'
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>History</span>
                </button>
              </>
            )}

            {/* User Profile & Actions */}
            <div className="flex items-center pl-2 sm:pl-4 border-l border-slate-800 space-x-1 sm:space-x-2">
              <div className="hidden sm:flex flex-col text-right pr-1">
                <span className="text-xs font-semibold text-slate-200">{user?.name}</span>
                <span className="text-[10px] text-slate-400">{isAdmin ? 'Admin / Coach' : user?.email}</span>
              </div>
              <button
                onClick={onOpenChangePassword}
                title="Change Password"
                className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
              >
                <KeyRound className="w-4 h-4" />
              </button>
              <button
                onClick={logout}
                title="Logout"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};
