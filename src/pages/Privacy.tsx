import React from 'react';
import { Lock, ArrowLeft } from 'lucide-react';

export default function Privacy({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-[#F8F9FB] text-[#181d1a] py-12 px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
        
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-[#047857] transition-colors mb-8 font-semibold text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800">Privacy Policy</h1>
        </div>
        
        <p className="text-slate-500 mb-8 font-medium">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-slate-600 leading-relaxed">
          
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">1. Information We Collect</h2>
            <p className="mb-2">We believe in collecting only what is absolutely necessary to provide you with an excellent bill management experience. We collect:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Account Information:</strong> Your email address and basic profile information when you register via Firebase Authentication.</li>
              <li><strong>Financial Data:</strong> The names, categories, amounts, due dates, and statuses of the bills you manually enter into the platform.</li>
              <li><strong>App Preferences:</strong> Your selected currency, billing cycle preferences, and notification settings.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">2. How We Use Your Information</h2>
            <p>
              Your data is stored securely in Google Firebase Firestore. We use this data exclusively to provide the core functionality of BantayBills: 
              rendering your dashboard, calculating your monthly spending, sending due date alerts, and allowing you to track your payment history. 
              <strong> We will never sell your personal or financial data to third parties, marketers, or data brokers.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">3. Artificial Intelligence & Third Parties</h2>
            <p>
              If you opt-in to use the AI Advisor feature, a subset of your bill data (names, amounts, and dates) is sent securely to the Google Gemini API 
              to generate financial insights. <strong>BantayBills uses Enterprise API keys, which means Google does NOT use your personal data to train their public AI models.</strong> 
              The data is processed strictly for the purpose of returning your specific insight and is discarded immediately after.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">4. Data Deletion and Export</h2>
            <p>
              You own your data. You can export your entire database as a CSV file at any time from the Preferences menu. 
              If you wish to permanently delete your account and all associated financial records, you can contact us or use the account deletion tools 
              within the app. Once deleted, your data cannot be recovered.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">5. Security</h2>
            <p>
              All traffic between your device and our servers is encrypted using industry-standard TLS/SSL. Your authentication and database are handled 
              by Google Firebase, adhering to rigorous global security standards. However, no internet transmission is 100% secure, so we advise using a 
              strong password and securing the device you use to access BantayBills.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
