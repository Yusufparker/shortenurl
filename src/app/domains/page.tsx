"use client";

import { useEffect, useState } from "react";
import { Trash2, Globe, AlertCircle, X, Plus } from "lucide-react";

interface Domain {
  id: string;
  host: string;
  createdAt: string;
  _count: {
    urls: number;
  };
}

export default function ManageDomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add Domain State
  const [newHost, setNewHost] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState("");

  // Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [domainToDelete, setDomainToDelete] = useState<Domain | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  
  // Toast State
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchDomains = async () => {
    try {
      const res = await fetch("/api/domains");
      if (res.ok) {
        setDomains(await res.json());
      }
    } catch (error) {
      console.error("Failed to load domains");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHost.trim()) return;

    setIsAdding(true);
    setAddError("");

    try {
      const res = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host: newHost.trim() })
      });

      if (res.ok) {
        const addedDomain = await res.json();
        setDomains([{...addedDomain, _count: { urls: 0 }}, ...domains]);
        setNewHost("");
        showToast("Domain successfully added!");
      } else {
        const data = await res.json();
        setAddError(data.error || "Failed to add domain");
      }
    } catch (e) {
      setAddError("An error occurred");
    } finally {
      setIsAdding(false);
    }
  };

  const openDeleteModal = (domain: Domain) => {
    setDomainToDelete(domain);
    setDeleteError("");
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDomainToDelete(null);
    setDeleteError("");
  };

  const confirmDelete = async () => {
    if (!domainToDelete) return;
    
    setIsDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/domains/${domainToDelete.id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setDomains(domains.filter(d => d.id !== domainToDelete.id));
        closeDeleteModal();
        showToast("Domain successfully deleted!");
      } else {
        setDeleteError("Failed to delete domain. Make sure no URLs are using it.");
      }
    } catch (e) {
      setDeleteError("An error occurred while deleting the domain.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
          <Globe size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Manage Domains</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Add custom domains to use for your short links.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">Add a new domain</h2>
        
        <form onSubmit={handleAddDomain} className="flex flex-col sm:flex-row gap-3 items-start">
          <div className="flex-1 w-full">
            <input
              type="text"
              placeholder="e.g. s.id or link.mycompany.com"
              value={newHost}
              onChange={(e) => setNewHost(e.target.value)}
              className="w-full py-2.5 px-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-colors text-zinc-900 dark:text-zinc-100"
            />
            {addError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{addError}</p>}
          </div>
          <button
            type="submit"
            disabled={isAdding || !newHost.trim()}
            className="px-6 py-2.5 h-[46px] bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium rounded-lg hover:bg-zinc-800 dark:hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px] shrink-0"
          >
            {isAdding ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
            ) : (
              <>
                <Plus size={18} className="mr-2" />
                Add Domain
              </>
            )}
          </button>
        </form>
        
        <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" size={18} />
          <p className="text-sm text-amber-800 dark:text-amber-400 leading-relaxed">
            <strong>Important:</strong> After adding a domain here, you must configure its DNS records (A Record or CNAME) in your domain registrar to point to this server's IP address.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Domain Name</th>
                <th className="px-6 py-4 font-medium">Added on</th>
                <th className="px-6 py-4 font-medium text-center">URLs</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {domains.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                    No custom domains added yet. The default domain is currently active.
                  </td>
                </tr>
              ) : (
                domains.map((domain) => (
                  <tr key={domain.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 font-medium text-zinc-900 dark:text-zinc-100">
                        <Globe size={16} className="text-zinc-400" />
                        {domain.host}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                      {new Date(domain.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center font-medium text-zinc-900 dark:text-zinc-100">
                      <div className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-full font-bold text-xs border border-indigo-100 dark:border-indigo-800">
                        {domain._count.urls}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button 
                        onClick={() => openDeleteModal(domain)}
                        className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete Domain"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Delete Modal */}
      {deleteModalOpen && domainToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg w-full max-w-md overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center text-red-600 dark:text-red-500 font-semibold text-lg">
                  <AlertCircle className="mr-2" size={24} />
                  Confirm Domain Deletion
                </div>
                <button onClick={closeDeleteModal} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                  <X size={20} />
                </button>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
                Are you absolutely sure you want to delete the domain <strong className="text-zinc-900 dark:text-zinc-100 font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">{domainToDelete.host}</strong>? 
                {domainToDelete._count.urls > 0 && <span className="block mt-2 text-red-600 dark:text-red-400">Warning: The {domainToDelete._count.urls} URL(s) associated with this domain will stop working properly.</span>}
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
                    "Delete Domain"
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
