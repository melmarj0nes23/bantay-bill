import os
import re

def main():
    app_file = "src/App.tsx"
    with open(app_file, "r") as f:
        app_content = f.read()

    # 1. Remove import
    app_content = re.sub(r"import Settings from '\./pages/Settings';\n", "", app_content)
    
    # 2. Remove route
    app_content = re.sub(r"\{/\* TAB 5: ACCOUNT & SYSTEM CONFIG SETTINGS \*/\}\n\s*<Route path=\"/settings\" element=\{<Settings />\} />\n", "", app_content)
    # Just in case it's formatted differently
    app_content = re.sub(r"<Route path=\"/settings\" element=\{<Settings />\} />\n", "", app_content)

    # 3. Remove nav link
    nav_pattern = r"\s*<button[^>]+onClick=\{[^}]+\bnavigate\('/settings'\)[^}]+\}[^>]*>\s*<SettingsIcon[^>]+>\s*Account Settings\s*</button>"
    app_content = re.sub(nav_pattern, "", app_content, flags=re.MULTILINE)

    with open(app_file, "w") as f:
        f.write(app_content)

    # 4. Modify Bills.tsx
    bills_file = "src/pages/Bills.tsx"
    with open(bills_file, "r") as f:
        bills_content = f.read()

    # Add useState
    bills_content = bills_content.replace("import React from 'react';", "import React, { useState } from 'react';")

    # Add handleExportCSV
    bills_content = bills_content.replace(
        "calendarCells, monthNames, getCategoryLabel, getStatusColor, userEmail, handleUpdatePreference, setUserProfile",
        "calendarCells, monthNames, getCategoryLabel, getStatusColor, userEmail, handleUpdatePreference, setUserProfile, handleExportCSV"
    )

    # Inject state into Bills component
    state_injection = """  const [isSettingsOpen, setIsSettingsOpen] = useState(false);"""
    bills_content = bills_content.replace(
        "} = useAppContext();",
        "} = useAppContext();\n\n" + state_injection
    )

    # Add Settings button next to Add New Bill
    button_injection = """                      <div className="flex gap-2">
                        <button 
                          onClick={() => setIsSettingsOpen(true)}
                          className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors self-start"
                        >
                          <SettingsIcon className="w-4 h-4 text-slate-500" />
                          Preferences
                        </button>
                        <button 
                          onClick={() => triggerAddFlow()}
                          className="bg-[#005d42] hover:bg-[#005d42]/90 text-white text-sm font-medium px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors self-start"
                        >
                          <Plus className="w-4 h-4" />
                          Add New Bill
                        </button>
                      </div>"""
    
    # Replace the old Add New Bill button
    old_button = """                      <button 
                        onClick={() => triggerAddFlow()}
                        className="bg-[#005d42] hover:bg-[#005d42]/90 text-white text-sm font-medium px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors self-start"
                      >
                        <Plus className="w-4 h-4" />
                        Add New Bill
                      </button>"""
    
    bills_content = bills_content.replace(old_button, button_injection)

    # Inject Modal at the bottom
    modal_ui = """
      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                  <SettingsIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-[#181d1a]">Global Preferences</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Configure cycle dates and exports</p>
                </div>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <form onSubmit={handleUpdatePreference} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#3e4943] block">Preferred Currency</label>
                  <select 
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 w-full focus:outline-[#047857]"
                    value={userProfile.currency}
                    onChange={(e) => setUserProfile({ ...userProfile, currency: e.target.value as any })}
                  >
                    <option value="PHP">Philippine Peso (₱)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="GBP">British Pound (£)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#3e4943] block">Billing Cycle Start Date</label>
                  <select 
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600 w-full focus:outline-[#047857]"
                    value={userProfile.billingCycleStart}
                    onChange={(e) => setUserProfile({ ...userProfile, billingCycleStart: e.target.value })}
                  >
                    <option value="1">1st of the month</option>
                    <option value="15">15th of the month</option>
                    <option value="28">28th of the month</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    className="bg-[#047857] hover:bg-[#065F46] text-white w-full py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" /> Save Preferences
                  </button>
                </div>
              </form>

              <div className="border-t border-slate-100 pt-5 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-700 block mb-0.5">Due Date Reminders</span>
                    <span className="text-slate-400">Receive proactive alert warnings</span>
                  </div>
                  <input 
                    type="checkbox"
                    className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                    checked={userProfile.notifyDue}
                    onChange={(e) => {
                      const updated = { ...userProfile, notifyDue: e.target.checked };
                      setUserProfile(updated);
                      // In a real scenario, this would trigger an immediate DB update 
                      // or wait for the "Save Preferences" button. We bind it to state.
                    }}
                  />
                </div>

                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-700 block mb-0.5">Gemini AI Audit Tool</span>
                    <span className="text-slate-400">Allow background pattern warnings</span>
                  </div>
                  <input 
                    type="checkbox"
                    className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                    checked={userProfile.notifyAI}
                    onChange={(e) => {
                      setUserProfile({ ...userProfile, notifyAI: e.target.checked });
                    }}
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5">
                <button 
                  onClick={handleExportCSV}
                  className="bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors w-full py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4 text-slate-400" />
                  Backup Database to CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}"""

    # Replace the final closing tags with the modal
    bills_content = bills_content.replace("    </div>\n  );\n}", modal_ui)

    with open(bills_file, "w") as f:
        f.write(bills_content)

    # Delete Settings.tsx
    if os.path.exists("src/pages/Settings.tsx"):
        os.remove("src/pages/Settings.tsx")

if __name__ == "__main__":
    main()
