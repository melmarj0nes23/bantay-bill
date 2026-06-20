import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, LayoutDashboard, Receipt, Calendar as CalendarIcon, 
  BarChart3, Lightbulb, Settings as SettingsIcon, Plus, Search, 
  Bell, HelpCircle, TrendingUp, CheckCircle, AlertTriangle, Clock, 
  ChevronLeft, ChevronRight, X, Edit, Trash2, Menu, LogOut, 
  ArrowRight, Sparkles, Check, Lock, Download, Eye, Zap, Droplet, 
  Wifi, Home, Tv, UserPlus, LogIn, ShieldAlert, RefreshCw, TrendingDown, User 
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { requestPushSubscription } from '../utils/pushNotifications';

export default function Bills() {
  const navigate = useNavigate();
  const { 
    bills, userProfile, stats, currencySymbol, categoryChartStats,
    triggerAddFlow, triggerEditFlow, handleToggleState, handleDeleteTrigger, triggerCallAI, filteredBills,
    searchQuery, setSearchQuery, categoryFilter, setCategoryFilter, statusFilter, setStatusFilter,
    aiTip, isGeneratingTip, calendarYear, calendarMonth, handlePrevMonth, handleNextMonth,
    calendarCells, monthNames, getCategoryLabel, getStatusColor, userEmail, handleUpdatePreference, setUserProfile, handleExportCSV, handleLoadDemoData, isGeneratingDemo
  } = useAppContext();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3">
                      <div>
                        <h2 className="text-2xl font-semibold tracking-tight text-[#181d1a]">Bills Management</h2>
                        <p className="text-sm text-[#3e4943] mt-0.5">Filter, search, edit, and audit details synchronized directly with Firestore.</p>
                      </div>
                      <div className="flex gap-2">
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
                      </div>
                    </div>

                    {/* Filter and Search Bar */}
                    <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-xs flex flex-col md:flex-row gap-3">
                      <div className="flex-1 relative flex items-center border border-slate-200 rounded-lg px-3 py-1 bg-slate-50">
                        <Search className="w-4 h-4 text-slate-400 mr-2" />
                        <input 
                          type="text" 
                          placeholder="Search outstanding utilities by name..."
                          className="bg-transparent border-none outline-none text-xs w-full py-1 text-slate-700 focus:ring-0 p-0"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-3">
                        <select 
                          className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 focus:outline-[#047857]"
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                          <option value="all">All Categories</option>
                          <option value="electricity">Electricity</option>
                          <option value="water">Water</option>
                          <option value="internet">Internet</option>
                          <option value="rent">Rent / Mortgage</option>
                          <option value="insurance">Insurance</option>
                          <option value="other">Other</option>
                        </select>

                        <select 
                          className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 focus:outline-[#047857]"
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                        >
                          <option value="all">All Statuses</option>
                          <option value="Paid">Paid Only</option>
                          <option value="Upcoming">Upcoming</option>
                          <option value="Due Soon">Due Soon</option>
                          <option value="Overdue">Overdue</option>
                        </select>
                      </div>
                    </div>

                    {/* Main Bills Table Card */}
                    <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-xs overflow-hidden">
                      {filteredBills.length === 0 ? (
                        <div className="text-center py-16 text-slate-400 text-xs flex flex-col items-center justify-center">
                          <Receipt className="w-12 h-12 mb-3 text-slate-200" />
                          <p className="mb-4">No bills match the selected parameters.</p>
                          {bills.length === 0 && (
                            <button 
                              onClick={handleLoadDemoData}
                              disabled={isGeneratingDemo}
                              className="bg-emerald-50 text-[#005d42] border border-[#005d42]/20 hover:bg-emerald-100 font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
                            >
                              <Sparkles className="w-4 h-4" />
                              {isGeneratingDemo ? "Generating..." : "Load Demo Data"}
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs whitespace-nowrap">
                            <thead>
                              <tr className="bg-slate-50 border-b border-[#ebefea] text-slate-400 font-semibold uppercase tracking-wider">
                                <th className="py-3 px-4">Bill Name</th>
                                <th className="py-3 px-4">Category</th>
                                <th className="py-3 px-4 text-right">Amount</th>
                                <th className="py-3 px-4">Due Date</th>
                                <th className="py-3 px-4 text-center">Status</th>
                                <th className="py-3 px-4">Notes</th>
                                <th className="py-3 px-4 text-center">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {filteredBills.map((bill) => (
                                <tr key={bill.id} className="hover:bg-slate-50/50 transition-all">
                                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                                    {bill.name}
                                  </td>
                                  <td className="py-3.5 px-4 text-slate-500 font-medium capitalize">
                                    {getCategoryLabel(bill.category)}
                                  </td>
                                  <td className="py-3.5 px-4 text-right font-bold text-slate-800">
                                    {currencySymbol}{bill.amount.toLocaleString()}
                                  </td>
                                  <td className="py-3.5 px-4 text-slate-600 font-mono">
                                    {bill.dueDate}
                                  </td>
                                  <td className="py-3.5 px-4 text-center">
                                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${getStatusColor(bill.status)}`}>
                                      {bill.status}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 text-slate-500 font-medium max-w-[200px] truncate">
                                    {bill.notes || '—'}
                                  </td>
                                  <td className="py-3.5 px-4 text-center">
                                    <div className="flex items-center justify-center gap-3">
                                      <button 
                                        onClick={() => handleToggleState(bill)}
                                        className="text-xs font-bold text-primary hover:underline"
                                      >
                                        Toggle state
                                      </button>
                                      <button 
                                        onClick={() => triggerEditFlow(bill)}
                                        className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteTrigger(bill.id)}
                                        className="p-1 hover:bg-rose-50 rounded text-rose-400 hover:text-rose-600"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
              
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
                    onChange={async (e) => {
                      const checked = e.target.checked;
                      let pushSub = null;
                      if (checked) {
                        pushSub = await requestPushSubscription();
                      }
                      
                      const updated = { ...userProfile, notifyDue: checked };
                      if (pushSub) {
                        // Store it (in a real app, you would append it to the DB directly)
                        // Here we just add it to userProfile which gets saved when "Save Preferences" is clicked
                        updated.pushSubscriptions = [pushSub];
                      }
                      setUserProfile(updated);
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
}
