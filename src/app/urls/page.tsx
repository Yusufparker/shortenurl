"use client";

import { useEffect, useState } from "react";
import { Trash2, Copy, ExternalLink, Search, AlertCircle, X } from "lucide-react";

interface Url {
  id: string;
  originalUrl: string;
  shortCode: string;
  title: string | null;
  clicks: number;
  createdAt: string;
  tags: { id: string; name: string }[];
}

export default function UrlsListPage() {
  const [urls, setUrls] = useState<Url[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [urlToDelete, setUrlToDelete] = useState<Url | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  
  // Toast State
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUrls = async () => {
    try {
      const res = await fetch("/api/urls");
      if (res.ok) {
        setUrls(await res.json());
      }
    } catch (error) {
      console.error("Failed to load URLs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const openDeleteModal = (url: Url) => {
    setUrlToDelete(url);
    setDeleteError("");
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setUrlToDelete(null);
    setDeleteError("");
  };

  const confirmDelete = async () => {
    if (!urlToDelete) return;
    
    setIsDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/urls/${urlToDelete.id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setUrls(urls.filter(u => u.id !== urlToDelete.id));
        closeDeleteModal();
        showToast("URL successfully deleted!");
      } else {
        setDeleteError("Failed to delete URL. It might have already been deleted.");
      }
    } catch (e) {
      setDeleteError("An error occurred while deleting the URL.");
    } finally {
      setIsDeleting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("URL copied to clipboard!");
  };

  const filteredUrls = urls.filter(url => 
    url.originalUrl.toLowerCase().includes(search.toLowerCase()) ||
    url.shortCode.toLowerCase().includes(search.toLowerCase()) ||
    (url.title && url.title.toLowerCase().includes(search.toLowerCase())) ||
    url.tags.some(t => t.name.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">List short URLs</h1>
        
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-zinc-400" />
          </div>
          <input
            type="text"
            placeholder="Search URLs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-full py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-colors text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Created at</th>
                <th className="px-6 py-4 font-medium">Short URL</th>
                <th className="px-6 py-4 font-medium">Title / Long URL</th>
                <th className="px-6 py-4 font-medium">Tags</th>
                <th className="px-6 py-4 font-medium text-right">Visits</th>
                <th className="px-6 py-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredUrls.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    No URLs found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUrls.map((url) => {
                  const shortLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/${url.shortCode}`;
                  return (
                    <tr key={url.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                        {new Date(url.createdAt).toLocaleDateString()} {new Date(url.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600 dark:text-blue-400 flex items-center gap-2">
                        <a href={shortLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {shortLink}
                        </a>
                        <button 
                          onClick={() => copyToClipboard(shortLink)}
                          className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Copy"
                        >
                          <Copy size={14} />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-zinc-900 dark:text-zinc-100 font-medium truncate max-w-xs" title={url.title || ''}>
                          {url.title || 'No title'}
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-zinc-500 dark:text-zinc-400">
                          <a href={url.originalUrl} target="_blank" rel="noopener noreferrer" className="text-xs truncate max-w-xs hover:underline hover:text-blue-500">
                            {url.originalUrl}
                          </a>
                          <ExternalLink size={10} />
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
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button 
                          onClick={() => openDeleteModal(url)}
                          className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Delete Modal */}
      {deleteModalOpen && urlToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg w-full max-w-md overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center text-red-600 dark:text-red-500 font-semibold text-lg">
                  <AlertCircle className="mr-2" size={24} />
                  Confirm Deletion
                </div>
                <button onClick={closeDeleteModal} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                  <X size={20} />
                </button>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
                Are you absolutely sure you want to delete the short URL <strong className="text-zinc-900 dark:text-zinc-100 font-mono bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">/{urlToDelete.shortCode}</strong>? This action cannot be undone and the link will immediately stop working.
              </p>
              
              {deleteError && (
                <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-800/30">
                  {deleteError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  onClick={closeDeleteModal}
                  disabled={isDeleting}
                  className="px-5 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 disabled:opacity-50 flex items-center justify-center min-w-[100px]"
                >
                  {isDeleting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    "Delete URL"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 font-medium text-sm border ${
            toast.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/30'
          }`}>
            {toast.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            ) : (
              <AlertCircle size={20} />
            )}
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
