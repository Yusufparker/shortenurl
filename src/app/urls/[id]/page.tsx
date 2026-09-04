"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Globe, Smartphone, Monitor, Globe2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface AnalyticsData {
  name: string;
  value: number;
}

interface UrlDetails {
  id: string;
  originalUrl: string;
  shortCode: string;
  title: string | null;
  clicks: number;
  createdAt: string;
  domainId: string | null;
  domain: { host: string } | null;
  analytics: {
    countries: AnalyticsData[];
    browsers: AnalyticsData[];
    oses: AnalyticsData[];
    devices: AnalyticsData[];
    timeline: AnalyticsData[];
  };
}

export default function UrlDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [url, setUrl] = useState<UrlDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/urls/${params.id}`);
        if (res.ok) {
          setUrl(await res.json());
        } else {
          router.push("/urls");
        }
      } catch (error) {
        console.error("Failed to load URL details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-white"></div>
      </div>
    );
  }

  if (!url) return null;

  const host = url.domain?.host || (typeof window !== 'undefined' ? window.location.host : '');
  const shortLink = `http://${host}/${url.shortCode}`;

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return percent > 0.05 ? (
      <text x={x} y={y} fill="currentColor" className="text-[10px] font-medium text-white dark:text-black" textAnchor="middle" dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  return (
    <div className="space-y-6">
      <button 
        onClick={() => router.push('/urls')}
        className="flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft size={16} className="mr-1" />
        Back to URLs
      </button>

      <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">{url.title || 'Untitled Link'}</h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm">
          <a href={shortLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center">
            {shortLink}
            <ExternalLink size={14} className="ml-1" />
          </a>
          <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">•</span>
          <span className="text-zinc-500 dark:text-zinc-400 truncate max-w-md" title={url.originalUrl}>
            {url.originalUrl}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Clicks Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm col-span-1 md:col-span-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Clicks</h2>
            <p className="text-4xl font-bold text-zinc-900 dark:text-white mt-2">{url.clicks.toLocaleString()}</p>
          </div>
          <div className="h-16 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-900 dark:text-white">
            <Globe2 size={32} />
          </div>
        </div>

        {/* Devices Pie Chart */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-zinc-900 dark:text-white font-medium">
            <Smartphone size={18} />
            <h2>Devices</h2>
          </div>
          <div className="h-64">
            {url.analytics.devices.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={url.analytics.devices}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {url.analytics.devices.map((entry, index) => (
                      <Cell key={`cell-${index}`} className="fill-zinc-900 dark:fill-white" opacity={1 - (index * 0.15)} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-zinc-500">No data available</div>
            )}
          </div>
        </div>

        {/* Browsers Pie Chart */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-zinc-900 dark:text-white font-medium">
            <Monitor size={18} />
            <h2>Browsers</h2>
          </div>
          <div className="h-64">
            {url.analytics.browsers.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={url.analytics.browsers}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {url.analytics.browsers.map((entry, index) => (
                      <Cell key={`cell-${index}`} className="fill-zinc-900 dark:fill-white" opacity={1 - (index * 0.15)} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-zinc-500">No data available</div>
            )}
          </div>
        </div>

        {/* Countries Pie Chart */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-zinc-900 dark:text-white font-medium">
            <Globe size={18} />
            <h2>Top Countries</h2>
          </div>
          <div className="h-64">
            {url.analytics.countries.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={url.analytics.countries.slice(0, 5)} // Show top 5
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {url.analytics.countries.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} className="fill-zinc-900 dark:fill-white" opacity={1 - (index * 0.15)} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-zinc-500">No data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
