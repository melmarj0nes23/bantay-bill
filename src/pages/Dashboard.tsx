import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, LayoutDashboard, Receipt, Calendar as CalendarIcon, 
  BarChart3, Lightbulb, Settings as SettingsIcon, Plus, Search, 
  Bell, HelpCircle, TrendingUp, CheckCircle, AlertTriangle, Clock, 
  ChevronLeft, ChevronRight, ChevronDown, X, Edit, Trash2, Menu, LogOut, 
  ArrowRight, Sparkles, Check, Lock, Download, Eye, Zap, Droplet, 
  Wifi, Home, Tv, UserPlus, LogIn, ShieldAlert, RefreshCw, TrendingDown, User 
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getBillsForMonth, computeStats } from '../utils/billCalculations';
import { useState, useMemo } from 'react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { 
    bills, userProfile, stats, currencySymbol, categoryChartStats,
    triggerAddFlow, triggerEditFlow, handleToggleState, handleDeleteTrigger, triggerCallAI,
    searchQuery, setSearchQuery, categoryFilter, setCategoryFilter, statusFilter, setStatusFilter,
    aiTip, isGeneratingTip, calendarYear, calendarMonth, handlePrevMonth, handleNextMonth,
    calendarCells, monthNames, getCategoryLabel, getStatusColor, userEmail, handleUpdatePreference, setUserProfile
  , handleLoadDemoData, isGeneratingDemo } = useAppContext();

  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const dashboardBills = useMemo(() => {
    return getBillsForMonth(bills, selectedDate.getFullYear(), selectedDate.getMonth() + 1);
  }, [bills, selectedDate]);

  const dashboardStats = useMemo(() => {
    return computeStats(dashboardBills);
  }, [dashboardBills]);

  // Generate options for the next 12 months, and past 6 months
  const monthOptions = useMemo(() => {
    const opts = [];
    const now = new Date();
    for (let i = -6; i <= 12; i++) {
       const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
       opts.push(d);
    }
    return opts;
  }, []);


  return (
    <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <div>
                        <h2 className="text-2xl font-semibold tracking-tight text-[#181d1a]">Dashboard Overview</h2>
                        <p className="text-sm text-[#3e4943] mt-0.5">Real-time stats for the household bills calendar cycle.</p>
                      </div>
                      
                      <div className="relative inline-flex">
                        <select 
                          value={selectedDate.toISOString()}
                          onChange={(e) => setSelectedDate(new Date(e.target.value))}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        >
                          {monthOptions.map(d => (
                            <option key={d.toISOString()} value={d.toISOString()}>
                              {d.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </option>
                          ))}
                        </select>
                        <div className="bg-white border border-[#bdc9c1] text-[#181d1a] text-sm font-semibold px-4 py-2 rounded-xl shadow-sm group-hover:border-[#047857] flex items-center gap-2 pointer-events-none transition-all">
                          {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        </div>
                      </div>
                    </div>

                    {/* Metrics Bento Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      
                      {/* Total Monthly Bills */}
                      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-[#bdc9c1] transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Monthly total</span>
                          <span className="p-1.5 bg-slate-50 rounded"><Receipt className="w-4 h-4 text-slate-400" /></span>
                        </div>
                        <div>
                          <div className="text-2xl font-bold font-dashboard-title text-[#181d1a]">{currencySymbol}{dashboardStats.totalAmount.toLocaleString()}</div>
                          <span className="text-xs text-[#3e4943] flex items-center gap-1 mt-2">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> 
                            <span className="text-emerald-600 font-bold">2.4%</span> vs last month
                          </span>
                        </div>
                      </div>

                      {/* Total Paid */}
                      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs flex flex-col justify-between relative overflow-hidden hover:border-[#bdc9c1] transition-all">
                        <div className="absolute right-[-10px] bottom-[-10px] opacity-5 pointer-events-none">
                          <CheckCircle className="w-24 h-24 text-emerald-500" />
                        </div>
                        <div className="flex justify-between items-start mb-2 relative z-10">
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Bills Paid</span>
                          <span className="p-1.5 bg-emerald-50 rounded"><CheckCircle className="w-4 h-4 text-emerald-500" /></span>
                        </div>
                        <div className="relative z-10">
                          <div className="text-2xl font-bold font-dashboard-title text-emerald-700">{currencySymbol}{dashboardStats.paidAmount.toLocaleString()}</div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                            <div className="bg-[#005d42] h-1.5 rounded-full" style={{ width: `${dashboardStats.percent}%` }}></div>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1">{dashboardStats.percent}% of total paid</div>
                        </div>
                      </div>

                      {/* Remaining Outflow */}
                      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-[#bdc9c1] transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Outstanding</span>
                          <span className="p-1.5 bg-amber-50 rounded"><Clock className="w-4 h-4 text-amber-500" /></span>
                        </div>
                        <div>
                          <div className="text-2xl font-bold font-dashboard-title text-amber-900">{currencySymbol}{dashboardStats.pendingAmount.toLocaleString()}</div>
                          <span className="text-xs text-[#3e4943] mt-2 block font-medium">
                            {dashboardBills.filter(b => b.status !== 'Paid').length} pending payments
                          </span>
                        </div>
                      </div>

                      {/* Overdue risk limit */}
                      <div className="bg-rose-50 border border-rose-100 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-rose-200 transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-rose-500">Immediate Overdue</span>
                          <span className="p-1.5 bg-rose-100/50 rounded"><AlertTriangle className="w-4 h-4 text-rose-600" /></span>
                        </div>
                        <div>
                          <div className="text-2xl font-bold font-dashboard-title text-rose-700">{currencySymbol}{dashboardStats.overdueAmount.toLocaleString()}</div>
                          <span className="text-[10px] text-rose-600 font-bold uppercase tracking-wider block mt-2">
                            Settled inside due thresholds
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bento Content Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Left Side: Circular completion Chart & AI Insight prompt */}
                      <div className="lg:col-span-1 space-y-6">
                        
                        {/* Circular Progress widget */}
                        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs flex flex-col items-center justify-center">
                          <div className="w-full flex justify-between items-center mb-4 border-b border-[#E5E7EB] pb-2">
                            <h3 className="font-semibold text-sm text-[#181d1a]">Cycle Completion</h3>
                            <button className="text-slate-400 hover:text-[#005d42]"><Eye className="w-4 h-4" /></button>
                          </div>
                          <div className="relative w-40 h-40 flex items-center justify-center my-4">
                            {/* SVG Ring */}
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ebefea" strokeWidth="3" />
                              <circle 
                                cx="18" 
                                cy="18" 
                                r="15.915" 
                                fill="none" 
                                stroke="#005d42" 
                                strokeWidth="3.2" 
                                strokeDasharray={`${dashboardStats.percent}, 100`} 
                                className="transition-all duration-700 ease-out"
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="font-bold text-3xl text-zinc-800 leading-none">{dashboardStats.percent}%</span>
                              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-1">Paid</span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 text-center font-medium mt-2">
                            {dashboardStats.completedCount} of {dashboardStats.count} bills managed
                          </p>
                        </div>

                        {/* AI Gemini Smart Advisor Card */}
                        <div className="bg-[#f6fbf5] border border-[#bdc9c1]/50 rounded-xl p-5 relative overflow-hidden shadow-xs">
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#005d42] to-[#a6f2d1]"></div>
                          <div className="flex gap-3">
                            <div className="p-2 bg-white rounded-full border border-[#7bd8b1]/40 flex-shrink-0 self-start">
                              <Sparkles className="w-5 h-5 text-[#047857]" />
                            </div>
                            <div className="space-y-2">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-[#047857]">AI Advisor Evaluation</h4>
                              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                                {aiTip}
                              </p>
                              <button 
                                onClick={triggerCallAI}
                                disabled={isGeneratingTip}
                                className="text-xs font-bold text-[#005d42] hover:underline flex items-center gap-1.5 hover:opacity-80 pt-1"
                              >
                                {isGeneratingTip ? (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    Auditing Firestore...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Generate Custom Tip
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Upcoming Bills checklist */}
                      <div className="lg:col-span-2 bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs flex flex-col">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                          <h3 className="font-semibold text-sm text-[#181d1a]">Upcoming Bills Log</h3>
                          <button 
                            onClick={() => navigate('/bills')}
                            className="text-xs font-semibold text-[#005d42] hover:underline"
                          >
                            View Table
                          </button>
                        </div>

                        {dashboardBills.length === 0 ? (
                          <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400 text-xs">
                            <Receipt className="w-12 h-12 mb-2 text-slate-200" />
                            No bills stored in Firestore yet.
                            <button 
                              onClick={() => triggerAddFlow()}
                              className="text-[#005d42] hover:underline font-bold mt-2"
                            >
                              Add your first bill
                            </button>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="border-b border-[#ebefea] text-slate-400 font-semibold uppercase tracking-wider">
                                  <th className="py-2.5 px-2">Details</th>
                                  <th className="py-2.5 px-2">Category</th>
                                  <th className="py-2.5 px-2">Due Date</th>
                                  <th className="py-2.5 px-2 text-right">Amount</th>
                                  <th className="py-2.5 px-2 text-center">Status</th>
                                  <th className="py-2.5 px-2 text-center">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {dashboardBills.slice(0, 10).map((bill) => (
                                  <tr 
                                    key={bill.id} 
                                    className="hover:bg-slate-50/50 transition-colors group"
                                  >
                                    <td className="py-3 px-2 font-medium text-slate-800">
                                      {bill.name}
                                    </td>
                                    <td className="py-3 px-2 text-slate-500 capitalize">
                                      {getCategoryLabel(bill.category)}
                                    </td>
                                    <td className="py-3 px-2 text-slate-600 font-mono">
                                      {bill.dueDate}
                                    </td>
                                    <td className="py-3 px-2 text-right font-semibold text-slate-800">
                                      {currencySymbol}{bill.amount.toLocaleString()}
                                    </td>
                                    <td className="py-3 px-2 text-center">
                                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${getStatusColor(bill.status)}`}>
                                        {bill.status}
                                      </span>
                                    </td>
                                    <td className="py-3 px-2 text-center">
                                      <button 
                                        onClick={() => handleToggleState(bill)}
                                        className="text-[#005d42] hover:underline hover:opacity-80 font-bold"
                                      >
                                        {bill.status === 'Paid' ? 'Mark Pending' : 'Mark Paid'}
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
  );
}
