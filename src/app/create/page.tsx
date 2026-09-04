"use client";

import { useState, useEffect } from "react";
import { Copy, Plus, X, Download, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";

export default function CreateUrlPage() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [availableTags, setAvailableTags] = useState<{ id: string, name: string }[]>([]);

  const [useUTM, setUseUTM] = useState(false);
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");

  const [expiresAt, setExpiresAt] = useState("");
  const [fbPixelId, setFbPixelId] = useState("");
  const [googleTagId, setGoogleTagId] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Domains
  const [domains, setDomains] = useState<{id: string, host: string}[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ original: string, short: string } | null>(null);

  useEffect(() => {
    // Fetch existing tags for autocomplete suggestions
    const fetchTags = async () => {
      try {
        const res = await fetch("/api/tags");
        if (res.ok) {
          const data = await res.json();
          setAvailableTags(data);
        }
      } catch (err) {
        // ignore errors for autocomplete
      }
    };

    // Fetch existing domains
    const fetchDomains = async () => {
      try {
        const res = await fetch("/api/domains");
        if (res.ok) {
          const data = await res.json();
          setDomains(data);
        }
      } catch (err) {}
    };

    fetchTags();
    fetchDomains();
  }, []);

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') return;
    if (e.type === 'keydown') e.preventDefault();

    const newTag = tagInput.trim().toLowerCase();
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
    }
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(null);

    try {
      let finalUrl = originalUrl;
      
      // Append UTM parameters if enabled
      if (useUTM) {
        if (!utmSource || !utmMedium) {
          setError("UTM Source and UTM Medium are required when UTM Builder is enabled.");
          setLoading(false);
          return;
        }
        
        try {
          const urlObj = new URL(originalUrl);
          urlObj.searchParams.set("utm_source", utmSource);
          urlObj.searchParams.set("utm_medium", utmMedium);
          if (utmCampaign) urlObj.searchParams.set("utm_campaign", utmCampaign);
          finalUrl = urlObj.toString();
        } catch (err) {
          setError("Invalid original URL format.");
          setLoading(false);
          return;
        }
      }

      const payload: any = {
        originalUrl: finalUrl,
        customSlug: customSlug || undefined,
        title: title || undefined,
        tags,
        expiresAt: expiresAt || undefined,
        fbPixelId: fbPixelId || undefined,
        googleTagId: googleTagId || undefined
      };

      if (selectedDomain) {
        payload.domainId = selectedDomain;
      }

      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess({
          original: data.originalUrl,
          short: data.shortUrl || `${window.location.origin}/${data.shortCode}`
        });
        // Reset form except tags if they want to create more similar ones
        setOriginalUrl("");
        setCustomSlug("");
        setTitle("");
        setUseUTM(false);
        setUtmSource("");
        setUtmMedium("");
        setUtmCampaign("");
        setExpiresAt("");
        setFbPixelId("");
        setGoogleTagId("");
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (err) {
      setError("Failed to create short URL");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Create a short URL</h1>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              URL to be shortened *
            </label>
            <input
              type="url"
              placeholder="https://example.com/very-long-url"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              required
              className="w-full py-3 px-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-colors text-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Title (Optional)
              </label>
              <input
                type="text"
                placeholder="Leave empty to auto-fetch"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full py-3 px-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-colors text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Custom Short Code (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., promo-2024"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value.replace(/\s+/g, '-'))}
                className="w-full py-3 px-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-colors text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Add tags to the URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                list="available-tags"
                placeholder="marketing, social, promo (Press Enter)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="flex-1 py-3 px-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-colors text-zinc-900 dark:text-zinc-100"
              />
              <datalist id="available-tags">
                {availableTags.map(tag => (
                  <option key={tag.id} value={tag.name} />
                ))}
              </datalist>
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-3 bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                {tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-sm font-medium rounded-full shadow-sm">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="text-zinc-400 hover:text-red-500 rounded-full">
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full py-2 px-1 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
            >
              <span>Advanced Settings (Optional)</span>
              {showAdvanced ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>

          {showAdvanced && (
            <div className="space-y-6 animate-in slide-in-from-top-2 fade-in duration-300 pt-2 border-t border-zinc-100 dark:border-zinc-800/50">
              <div className="pt-2">
                <div className="flex items-center justify-between mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useUTM}
                      onChange={(e) => setUseUTM(e.target.checked)}
                      className="w-4 h-4 text-black border-zinc-300 rounded focus:ring-black dark:focus:ring-white dark:bg-zinc-800 dark:border-zinc-600"
                    />
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">UTM Builder</span>
                  </label>
                </div>
                
                {useUTM && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-lg mb-6 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">Source *</label>
                      <input
                        type="text"
                        placeholder="e.g. facebook"
                        value={utmSource}
                        onChange={(e) => setUtmSource(e.target.value)}
                        required={useUTM}
                        className="w-full py-2 px-3 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-colors text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">Medium *</label>
                      <input
                        type="text"
                        placeholder="e.g. cpc"
                        value={utmMedium}
                        onChange={(e) => setUtmMedium(e.target.value)}
                        required={useUTM}
                        className="w-full py-2 px-3 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-colors text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">Campaign</label>
                      <input
                        type="text"
                        placeholder="e.g. summer_sale"
                        value={utmCampaign}
                        onChange={(e) => setUtmCampaign(e.target.value)}
                        className="w-full py-2 px-3 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-colors text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Expiration Date
                  </label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full py-3 px-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-colors text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Retargeting Pixels
                  </label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Facebook Pixel ID (e.g. 123456789)"
                      value={fbPixelId}
                      onChange={(e) => setFbPixelId(e.target.value)}
                      className="w-full py-2 px-3 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-colors text-zinc-900 dark:text-zinc-100"
                    />
                    <input
                      type="text"
                      placeholder="Google Tag ID (e.g. G-XXXXXXX)"
                      value={googleTagId}
                      onChange={(e) => setGoogleTagId(e.target.value)}
                      className="w-full py-2 px-3 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-colors text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Domain
                </label>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full py-3 px-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-colors text-zinc-900 dark:text-zinc-100"
                >
                  <option value="">Default Domain</option>
                  {domains.map(d => (
                    <option key={d.id} value={d.id}>{d.host}</option>
                  ))}
                </select>
              </div>



            </div>
          )}

          {error && <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">{error}</div>}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-8 animate-in fade-in slide-in-from-top-4">
            <h3 className="text-green-800 dark:text-green-400 font-semibold mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              URL successfully shortened!
            </h3>
            
            <div className="flex flex-col md:flex-row gap-6 mt-4">
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-sm text-green-700 dark:text-green-500 mb-1">Short URL:</p>
                  <div className="flex items-center gap-2">
                    <a href={success.short} target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-blue-600 dark:text-blue-400 hover:underline break-all">
                      {success.short}
                    </a>
                    <button 
                      onClick={() => navigator.clipboard.writeText(success.short)}
                      className="p-2 text-green-700 hover:bg-green-200 dark:text-green-400 dark:hover:bg-green-800/50 rounded transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-green-700 dark:text-green-500 mb-1">Original URL:</p>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm truncate max-w-lg" title={success.original}>
                    {success.original}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-white rounded-lg shadow-sm border border-green-100 shrink-0">
                <QRCodeCanvas 
                  id="qr-code-canvas"
                  value={success.short} 
                  size={120} 
                  level="H"
                  includeMargin={true}
                />
                <button
                  onClick={() => {
                    const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement;
                    if (canvas) {
                      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
                      const downloadLink = document.createElement("a");
                      downloadLink.href = pngUrl;
                      downloadLink.download = "qrcode.png";
                      document.body.appendChild(downloadLink);
                      downloadLink.click();
                      document.body.removeChild(downloadLink);
                    }
                  }}
                  className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  <Download size={14} />
                  Download QR
                </button>
              </div>
            </div>
          </div>
          )}

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="py-3 px-8 bg-black dark:bg-white text-white dark:text-black font-medium rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white disabled:opacity-50 transition-colors shadow-sm"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
