"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Link2, PlusCircle, LogOut, Tags, Globe, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/check');
        if (res.ok) {
          setIsLoggedIn(true);
        }
      } catch (err) {
        // Not logged in
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setIsLoggedIn(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsLoggedIn(false);
  };

  const { theme, setTheme } = useTheme();

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-zinc-100"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-8">
          <div className="flex justify-center mb-8">
            <div className="bg-black dark:bg-white text-white dark:text-black p-3 rounded-lg">
              <Link2 size={28} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-zinc-900 dark:text-zinc-100 mb-2">
            Welcome Back
          </h1>
          <p className="text-center text-zinc-500 dark:text-zinc-400 mb-8 text-sm">
            Please enter your admin password to continue
          </p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-black dark:bg-white text-white dark:text-black font-medium rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white disabled:opacity-50 transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const menuItems = [
    { name: 'Overview', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'List short URLs', path: '/urls', icon: <Link2 size={20} /> },
    { name: 'Create short URL', path: '/create', icon: <PlusCircle size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
          <Link2 size={24} className="text-black dark:text-white mr-3" />
          <span className="font-bold text-lg text-zinc-900 dark:text-zinc-100">ShortenURL</span>
        </div>
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                pathname === item.path
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          ))}
          
          <div className="pt-6 pb-2 px-4">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Settings</p>
          </div>
          <Link href="/tags" className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
            pathname === '/tags'
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
              : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50'
          }`}>
            <span className="mr-3"><Tags size={20} /></span>
            Manage tags
          </Link>
          <Link href="/domains" className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
            pathname === '/domains'
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
              : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50'
          }`}>
            <span className="mr-3"><Globe size={20} /></span>
            Manage domains
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6">
          <div className="font-medium text-zinc-800 dark:text-zinc-200">
            {menuItems.find((item) => item.path === pathname)?.name || 'Dashboard'}
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Toggle theme"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" style={{ marginTop: '-1.2rem' }} />
            </button>
            <div className="flex items-center text-sm font-medium text-zinc-600 dark:text-zinc-300">
              <span className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mr-2">
                A
              </span>
              <span className="hidden sm:inline">admin</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
