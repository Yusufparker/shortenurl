"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Link2, Tag, MousePointerClick, Globe } from "lucide-react";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Stats {
  urls: number;
  tags: number;
  domains: number;
  visits: number;
  chartData?: { date: string, visits: number }[];
}

interface Url {
  id: string;
  originalUrl: string;
  shortCode: string;
  title: string | null;
  clicks: number;
  createdAt: string;
  tags: { id: string; name: string }[];
}

export default function OverviewPage() {
  const [stats, setStats] = useState<Stats>({ urls: 0, tags: 0, domains: 0, visits: 0 });
  const [recentUrls, setRecentUrls] = useState<Url[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, urlsRes] = await Promise.all([
          fetch("/api/stats"),
          fetch("/api/urls")
        ]);

        if (statsRes.ok) {
          setStats(await statsRes.json());
        }
        if (urlsRes.ok) {
          const allUrls = await urlsRes.json();
          // Take top 5 for recent URLs
          setRecentUrls(allUrls.slice(0, 5));
        }
      } catch (error) {
        console.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total URLs */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">TOTAL URLS</p>
            <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{stats.urls.toLocaleString()}</h3>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-full text-blue-600 dark:text-blue-400">
            <Link2 size={28} />
          </div>
        </div>

        {/* Total Visits */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">TOTAL VISITS</p>
            <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{stats.visits.toLocaleString()}</h3>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-full text-emerald-600 dark:text-emerald-400">
            <MousePointerClick size={28} />
          </div>
        </div>

        {/* Total Tags */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">TAGS</p>
            <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{stats.tags.toLocaleString()}</h3>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-full text-purple-600 dark:text-purple-400">
            <Tag size={28} />
          </div>
        </div>

        {/* Domains */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">DOMAINS</p>
            <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{stats.domains?.toLocaleString() || 0}</h3>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-full text-indigo-600 dark:text-indigo-400">
            <Globe size={28} />
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Visits Overview</h2>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full">Last 7 Days</span>
        </div>
        
        <div className="h-72 w-full">
          {stats?.chartData && stats.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#525252" opacity={0.2} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#71717a' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#71717a' }}
                  dx={-10}
                  allowDecimals={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="visits" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#3b82f6' }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
              <MousePointerClick className="text-zinc-300 dark:text-zinc-700 mb-2" size={32} />
              <p className="text-zinc-500 dark:text-zinc-400 font-medium">No visit data available</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Recently created URLs</h2>
          <Link href="/urls" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center">
            See all <ArrowRight size={14} className="ml-1" />
          </Link>
        </div>
        
        {recentUrls.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 dark:text-zinc-400">
            No URLs created yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 uppercase">
                <tr>
                  <th className="px-6 py-3 font-medium">Created at</th>
                  <th className="px-6 py-3 font-medium">Short URL</th>
                  <th className="px-6 py-3 font-medium">Title / Long URL</th>
                  <th className="px-6 py-3 font-medium">Tags</th>
                  <th className="px-6 py-3 font-medium text-right">Visits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {recentUrls.map((url) => (
                  <tr key={url.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                      {new Date(url.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600 dark:text-blue-400">
                      <a href={`/${url.shortCode}`} target="_blank" rel="noopener noreferrer">
                        {typeof window !== 'undefined' ? window.location.origin : ''}/{url.shortCode}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-zinc-900 dark:text-zinc-100 font-medium truncate max-w-xs" title={url.title || ''}>
                        {url.title || 'No title'}
                      </div>
                      <div className="text-zinc-500 dark:text-zinc-400 text-xs truncate max-w-xs mt-1" title={url.originalUrl}>
                        {url.originalUrl}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {url.tags.length > 0 ? url.tags.map(tag => (
                          <span key={tag.id} className="px-2 py-1 text-[10px] font-medium bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded">
                            {tag.name}
                          </span>
                        )) : <span className="text-zinc-400 italic">None</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-zinc-900 dark:text-zinc-100">
                      {url.clicks.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
