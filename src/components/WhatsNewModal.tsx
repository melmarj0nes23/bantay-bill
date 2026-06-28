import React, { useState, useEffect } from 'react';
import { Sparkles, Wallet, Info, Camera, X, Check } from 'lucide-react';

export default function WhatsNewModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const hideModal = localStorage.getItem('bantaybills_hide_whats_new');
    if (hideModal !== 'true') {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('bantaybills_hide_whats_new', 'true');
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#005d42] p-6 text-white relative shrink-0">
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-xl">
              <Sparkles className="w-6 h-6 text-emerald-200" />
            </div>
            <h2 className="text-2xl font-bold font-dashboard-title tracking-tight">What's New!</h2>
          </div>
          <p className="text-emerald-50 text-sm font-medium">Check out the latest features we just shipped for you.</p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* New Features */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Just Added</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                    <Wallet className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Personal Expenses Tracking</h4>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">You can now track your daily personal expenses separately from your scheduled bills. We've also unified them in your yearly overview!</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <Info className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">About & Support</h4>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">We added a brand new About tab where you can learn more about the project, report bugs directly, and even support the developer.</p>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Upcoming Features */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Coming Soon</h3>
              <div className="flex gap-4 bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-100/50 shadow-inner">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <Camera className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-900">Smart Image Scanner</h4>
                  <p className="text-sm text-amber-800 mt-1 leading-relaxed">Adding bills and expenses will soon be as easy as taking a picture! Our smart AI scanner will extract the details straight from your camera.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors border ${dontShowAgain ? 'bg-[#005d42] border-[#005d42]' : 'bg-white border-slate-300 group-hover:border-[#005d42]'}`}>
              {dontShowAgain && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
            </div>
            <input 
              type="checkbox" 
              className="hidden"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
            />
            <span className="text-sm font-medium text-slate-600 select-none">Do not show this again</span>
          </label>
          <button 
            onClick={handleClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#005d42] hover:bg-[#065F46] text-white font-bold rounded-xl transition-colors shadow-sm"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}
