import React from 'react';
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

export default function Calendar() {
  const navigate = useNavigate();
  const { 
    bills, userProfile, stats, currencySymbol, categoryChartStats,
    triggerAddFlow, triggerEditFlow, handleToggleState, handleDeleteTrigger, triggerCallAI,
    searchQuery, setSearchQuery, categoryFilter, setCategoryFilter, statusFilter, setStatusFilter,
    aiTip, isGeneratingTip, calendarYear, calendarMonth, handlePrevMonth, handleNextMonth,
    calendarCells, monthNames, getCategoryLabel, getStatusColor, userEmail, handleUpdatePreference, setUserProfile
  } = useAppContext();

  return (
    <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <div>
                        <h2 className="text-2xl font-semibold tracking-tight text-[#181d1a]">Calendar Planner</h2>
                        <p className="text-sm text-[#3e4943] mt-0.5">Click cells directly to plan cycles or review historical dues.</p>
                      </div>
                      
                      <div className="flex items-center gap-2 bg-white border border-[#bdc9c1] rounded-lg p-1.5 shadow-xs">
                        <button 
                          onClick={handlePrevMonth}
                          className="p-1 hover:bg-slate-100 rounded text-slate-600"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-semibold px-2 text-slate-700 font-mono">
                          {monthNames[calendarMonth]} {calendarYear}
                        </span>
                        <button 
                          onClick={handleNextMonth}
                          className="p-1 hover:bg-slate-100 rounded text-slate-600"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-[#bdc9c1] overflow-hidden shadow-xs">
                      <div className="p-4">
                        
                        <div className="overflow-x-auto">
                          <div className="min-w-[700px]">
                            {/* Weekly headers */}
                            <div className="grid grid-cols-7 text-center font-bold text-xs text-slate-500 uppercase tracking-widest pb-3 border-b border-slate-100">
                              <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                            </div>

                            {/* Cells Grid */}
                        <div className="grid grid-cols-7 gap-px bg-slate-200 mt-2">
                          {calendarCells.map((cell, idx) => (
                            <div 
                              key={idx}
                              className={`bg-white min-h-[110px] p-2 flex flex-col justify-between hover:bg-slate-50/50 transition-colors cursor-pointer group ${!cell.day ? 'bg-slate-50' : ''}`}
                              onClick={() => cell.day && triggerAddFlow(cell.dateString)}
                            >
                              <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                                <span className={cell.day && cell.billsOnThisDay.length > 0 ? 'text-[#005d42] font-black' : ''}>
                                  {cell.day || ''}
                                </span>
                                {cell.day && (
                                  <span className="opacity-0 group-hover:opacity-100 text-[10px] text-primary-container font-black">
                                    + Add
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex-1 mt-1 space-y-1 overflow-auto max-h-[70px]">
                                {cell.billsOnThisDay.map(b => (
                                  <div 
                                    key={b.id} 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      triggerEditFlow(b);
                                    }}
                                    className={`bill-indicator hover:scale-95 transition-all truncate font-medium flex items-center justify-between text-[11px] ${
                                      b.status === 'Paid' ? 'bill-paid' :
                                      b.status === 'Overdue' ? 'bill-overdue' : 'bill-due-soon'
                                    }`}
                                  >
                                    <span>{b.name}</span>
                                    <span className="font-bold opacity-85">{currencySymbol}{b.amount}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
  );
}
