import React from 'react';
import { Github, Facebook, Mail, Coffee, Heart, Code2, ShieldCheck, Zap, Sparkles } from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Hero Section */}
      <div className="bg-[#005d42] rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 opacity-10 pointer-events-none">
          <Heart className="w-96 h-96" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 font-dashboard-title tracking-tight">About BantayBills</h1>
          <p className="text-emerald-50 text-lg md:text-xl leading-relaxed">
            A comprehensive, completely free financial dashboard designed to help you track bills, manage expenses, and keep your household finances organized with zero friction.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Features Section */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" /> Core Features
          </h2>
          <ul className="space-y-4 text-slate-600 text-sm">
            <li className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <Code2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <strong className="block text-slate-800 font-semibold mb-0.5">Bills & Expense Tracking</strong>
                Manage recurring household bills and one-off personal expenses in a unified, calendar-driven interface.
              </div>
            </li>
            <li className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <strong className="block text-slate-800 font-semibold mb-0.5">Secure Cloud Sync</strong>
                Your data is securely backed up and synced in real-time across all your devices via Firebase.
              </div>
            </li>
            <li className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <strong className="block text-slate-800 font-semibold mb-0.5">Financial Insights</strong>
                Visual dashboards and yearly overviews instantly reveal your spending habits and upcoming financial commitments.
              </div>
            </li>
          </ul>
        </div>

        {/* Contact & Support Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Mail className="w-5 h-5 text-emerald-600" /> Connect & Report Bugs
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Encountered an issue or have a feature request? Feel free to reach out to the developer directly.
            </p>
            <div className="space-y-3">
              <a href="https://facebook.com/melmarj0nes23" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-slate-700">
                <Facebook className="w-5 h-5 text-[#1877F2]" />
                <span className="font-medium text-sm">melmarj0nes23</span>
              </a>
              <a href="https://github.com/melmarj0nes23" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-slate-700">
                <Github className="w-5 h-5" />
                <span className="font-medium text-sm">melmarj0nes23</span>
              </a>
              <a href="mailto:melmarjvelasco@gmail.com" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-slate-700">
                <Mail className="w-5 h-5 text-red-500" />
                <span className="font-medium text-sm">melmarjvelasco@gmail.com</span>
              </a>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border border-amber-100 p-8 shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-br from-amber-200/40 to-orange-200/40 blur-3xl rounded-full"></div>
            <h2 className="text-xl font-bold text-amber-900 mb-3 flex items-center gap-2 relative z-10">
              <Coffee className="w-5 h-5" /> Support the Project
            </h2>
            <p className="text-sm text-amber-700 mb-6 relative z-10">
              BantayBills is a passion project and will be <strong>forever free</strong> without annoying ads. If this tool helped you, consider buying me a coffee to keep the servers running!
            </p>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-amber-200/50 flex items-center justify-between relative z-10 group-hover:bg-white transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#005CE6] flex items-center justify-center text-white font-bold text-xs tracking-wider shadow-sm">
                  GCash
                </div>
                <div>
                  <div className="text-[10px] font-bold text-amber-900/60 uppercase tracking-wider mb-0.5">GCash Number</div>
                  <div className="font-bold text-slate-800 tracking-wide">09562786351</div>
                </div>
              </div>
              <Heart className="w-5 h-5 text-rose-500 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
