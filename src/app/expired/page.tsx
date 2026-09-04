"use client";

import Link from "next/link";
import { AlertTriangle, Clock } from "lucide-react";

export default function ExpiredPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-red-100 dark:bg-red-900/30 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 p-4 rounded-full border border-red-100 dark:border-red-900/30">
              <Clock size={40} strokeWidth={1.5} />
            </div>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 tracking-tight">
          Link Expired
        </h1>
        
        <p className="text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
          Oops! The short link you are trying to access has reached its expiration date and is no longer active.
        </p>
        
        <div className="flex flex-col gap-3">
          <Link 
            href="/"
            className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-colors shadow-sm"
          >
            Go to Homepage
          </Link>
          
          <div className="text-sm text-zinc-400 dark:text-zinc-500 flex items-center justify-center gap-1.5 mt-2">
            <AlertTriangle size={14} />
            <span>Please contact the link owner if you think this is a mistake.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
