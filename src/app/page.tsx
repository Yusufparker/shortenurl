'use client';

import { useState, useEffect } from 'react';

type Url = {
  id: string;
  originalUrl: string;
  shortCode: string;
  clicks: number;
  createdAt: string;
};

export default function Home() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [urls, setUrls] = useState<Url[]>([]);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const fetchUrls = async () => {
    try {
      const res = await fetch('/api/urls');
      if (res.ok) {
        const data = await res.json();
        setUrls(data);
      }
    } catch (err) {
      console.error('Failed to fetch URLs');
    }
  };

  // Check auth on load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/check');
        if (res.ok) {
          setIsLoggedIn(true);
          await fetchUrls();
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
        await fetchUrls();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to shorten URL');
        if (res.status === 401) {
          setIsLoggedIn(false); // Session expired or invalid
        }
      } else {
        setUrls((prev) => [data, ...prev]);
        setOriginalUrl('');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (checkingAuth) {
    return <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white text-black dark:bg-[#0a0a0a] dark:text-white font-sans selection:bg-gray-200 dark:selection:bg-gray-800 transition-colors">
      
      {/* Top Nav (Logout button) */}
      {isLoggedIn && (
        <div className="absolute top-0 right-0 p-6">
          <button onClick={handleLogout} className="text-sm font-medium text-gray-500 hover:text-black dark:hover:text-white transition-colors">
            Sign out
          </button>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-6 py-24 flex flex-col items-center">
        
        {/* Header section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Link Shortener
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Create fast, reliable, and trackable links.
          </p>
        </div>

        {/* Main Content Area */}
        <div className="w-full">
          {!isLoggedIn ? (
            <div className="max-w-md mx-auto">
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <input
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border border-gray-300 dark:border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-black dark:focus:border-white transition-colors text-center"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white dark:bg-white dark:text-black font-medium rounded-lg px-6 py-3 transition-colors hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
              </form>
              {error && <p className="text-red-500 mt-4 text-sm text-center">{error}</p>}
            </div>
          ) : (
            <div className="flex flex-col items-center w-full">
              <form onSubmit={handleSubmit} className="w-full flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="https://example.com/very/long/url"
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  className="flex-1 bg-transparent border border-gray-300 dark:border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-black text-white dark:bg-white dark:text-black font-medium rounded-lg px-6 py-3 transition-colors hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
                >
                  {loading ? 'Processing...' : 'Shorten'}
                </button>
              </form>
              {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}

              {/* Results list */}
              {urls.length > 0 && (
                <div className="w-full mt-12 flex flex-col gap-3">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">Recent Links</h2>
                  {urls.map((url) => {
                    const shortLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/${url.shortCode}`;
                    return (
                      <div key={url.id} className="group border border-gray-200 dark:border-gray-800 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors bg-gray-50/50 dark:bg-[#111]">
                        <div className="overflow-hidden w-full sm:w-auto">
                          <p className="text-gray-500 dark:text-gray-400 text-xs truncate mb-1" title={url.originalUrl}>
                            {url.originalUrl}
                          </p>
                          <a href={shortLink} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">
                            {shortLink}
                          </a>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <span className="text-xs font-mono text-gray-500 bg-white dark:bg-black px-2 py-1 rounded border border-gray-200 dark:border-gray-800">
                            {url.clicks} clicks
                          </span>
                          <button
                            onClick={() => copyToClipboard(shortLink)}
                            className="text-gray-400 hover:text-black dark:hover:text-white p-2 rounded transition-colors"
                            title="Copy to clipboard"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
