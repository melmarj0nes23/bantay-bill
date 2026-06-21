import os

def main():
    content = """import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Receipt, ChevronDown, CheckCircle, Clock, 
  Sparkles, RefreshCw, ChevronLeft, ChevronRight,
  Zap, Droplet, Wifi, Home, ShieldAlert, FileText, ArrowRight
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getBillsForMonth, computeStats } from '../utils/billCalculations';

export default function Dashboard() {
  const navigate = useNavigate();
  const { 
    bills, userProfile, currencySymbol,
    triggerAddFlow, triggerEditFlow, handleToggleState, triggerCallAI,
    aiTip, isGeneratingTip, calendarCells, getCategoryLabel
  } = useAppContext();

  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const dashboardBills = useMemo(() => {
    return getBillsForMonth(bills, selectedDate.getFullYear(), selectedDate.getMonth() + 1).sort((a, b) => {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
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

  // Mini Chart Calculations
  const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
  const dailySpend = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const amount = dashboardBills.reduce((sum, b) => {
        const bDay = parseInt(b.dueDate.split('-')[2], 10);
        return bDay === day ? sum + b.amount : sum;
      }, 0);
      return amount;
    });
  }, [dashboardBills, daysInMonth]);
  const maxSpend = Math.max(...dailySpend, 1);

  // Helper for Category Icons
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'electricity': return <Zap className="w-4 h-4 text-orange-600" />;
      case 'water': return <Droplet className="w-4 h-4 text-blue-600" />;
      case 'internet': return <Wifi className="w-4 h-4 text-emerald-600" />;
      case 'rent': return <Home className="w-4 h-4 text-indigo-600" />;
      case 'insurance': return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      default: return <FileText className="w-4 h-4 text-slate-600" />;
    }
  };

  const getCategoryBg = (category: string) => {
    switch (category) {
      case 'electricity': return 'bg-orange-100';
      case 'water': return 'bg-blue-100';
      case 'internet': return 'bg-emerald-100';
      case 'rent': return 'bg-indigo-100';
      case 'insurance': return 'bg-rose-100';
      default: return 'bg-slate-100';
    }
  };

  const currentMonthName = selectedDate.toLocaleString('default', { month: 'short' });
  const userName = userProfile?.email?.split('@')[0] || 'User';
  const displayName = userName.charAt(0).toUpperCase() + userName.slice(1);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 backdrop-blur-md p-6 rounded-[2rem] border border-white shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-white shadow-md overflow-hidden bg-slate-200">
             <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight text-[#181d1a]">Dashboard</h2>
            <p className="text-sm font-semibold text-slate-500">Overview - Welcome Back, {displayName}!</p>
          </div>
        </div>
        
        <div className="relative inline-flex bg-white rounded-xl shadow-sm border border-slate-200 hover:border-slate-300 transition-colors">
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
          <div className="text-[#181d1a] text-sm font-bold px-4 py-2.5 flex items-center gap-2 pointer-events-none">
            {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* AI BANNER */}
      <div className="bg-gradient-to-r from-[#005d42] to-[#047857] rounded-2xl p-4 shadow-lg text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm"><Sparkles className="w-5 h-5 text-yellow-300" /></div>
          <div>
             <h4 className="text-xs font-black uppercase tracking-widest text-emerald-100 mb-0.5">AI Insights</h4>
             <p className="text-sm font-medium text-emerald-50 leading-tight max-w-2xl">{aiTip}</p>
          </div>
        </div>
        <button 
          onClick={triggerCallAI}
          disabled={isGeneratingTip}
          className="shrink-0 px-4 py-2 bg-white text-[#005d42] rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors shadow-sm disabled:opacity-70 disabled:animate-pulse flex items-center gap-2"
        >
          {isGeneratingTip ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          Refresh Tip
        </button>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Spent */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-bold text-slate-500">Total Spent</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">+5%</span>
          </div>
          <div className="text-4xl font-black text-slate-800 tracking-tight">
            {currencySymbol}{dashboardStats.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Pending Bills */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-bold text-slate-500">Pending Bills</span>
            <span className="p-1.5 bg-orange-50 text-orange-500 rounded-lg"><Clock className="w-4 h-4" /></span>
          </div>
          <div className="flex items-end justify-between">
            <div className="text-4xl font-black text-slate-800 tracking-tight">
              {dashboardBills.filter(b => b.status !== 'Paid').length}
            </div>
            <div className="text-sm font-bold text-slate-500 pb-1">
              {currencySymbol}{dashboardStats.pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Progress / Savings Goal */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all relative overflow-hidden">
          <div className="absolute right-[-20px] bottom-[-20px] opacity-5 pointer-events-none">
            <CheckCircle className="w-32 h-32 text-emerald-500" />
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-sm font-bold text-slate-500">Cycle Completion</span>
            <span className="text-sm font-bold text-slate-400">{dashboardStats.percent}%</span>
          </div>
          <div className="relative z-10">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-[#005d42]">{currencySymbol}{dashboardStats.paidAmount.toLocaleString()}</span>
              <span className="text-sm font-bold text-slate-400">/{currencySymbol}{dashboardStats.totalAmount.toLocaleString()}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-4 overflow-hidden">
              <div 
                className="bg-[#005d42] h-2 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${dashboardStats.percent}%` }}
              ></div>
            </div>
          </div>
        </div>

      </div>

      {/* MIDDLE ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Spending Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-lg text-slate-800">Monthly Spending</h3>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <span className="w-2 h-2 rounded-full bg-[#005d42]"></span> Current Spend
              <span className="ml-2 text-slate-800">{currencySymbol}{dashboardStats.totalAmount.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="h-48 flex items-end gap-1 sm:gap-2 mt-4 relative">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] font-bold text-slate-400">
              <span>{currencySymbol}{maxSpend.toLocaleString()}</span>
              <span>{currencySymbol}{(maxSpend/2).toLocaleString()}</span>
              <span>$0</span>
            </div>
            
            <div className="flex-1 flex items-end justify-between ml-12 h-[120px] border-b border-slate-100 pb-1">
              {dailySpend.map((amount, idx) => (
                <div key={idx} className="relative w-full flex justify-center group">
                  {amount > 0 && (
                    <div 
                      className="w-[80%] max-w-[12px] bg-[#005d42] rounded-t-sm hover:bg-[#065F46] transition-colors cursor-pointer"
                      style={{ height: `${(amount / maxSpend) * 100}%`, minHeight: '4px' }}
                    >
                       <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow pointer-events-none z-10 whitespace-nowrap">
                         {currencySymbol}{amount}
                       </div>
                    </div>
                  )}
                  {amount === 0 && (
                     <div className="w-[80%] max-w-[12px] bg-slate-100 rounded-t-sm" style={{ height: '4px' }}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* X-axis labels */}
          <div className="flex justify-between ml-12 mt-2 text-[10px] font-bold text-slate-400">
            {dailySpend.map((_, idx) => {
              if (idx === 0 || idx === 4 || idx === 9 || idx === 14 || idx === 19 || idx === 24 || idx === 29 || idx === daysInMonth - 1) {
                return <span key={idx}>{idx + 1}</span>;
              }
              return <span key={idx} className="hidden sm:inline opacity-0">.</span>; // Spacers
            })}
          </div>
        </div>

        {/* Due Dates Mini Calendar */}
        <div className="bg-[#f6fbf5] rounded-3xl p-6 border border-[#bdc9c1]/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-800">Due Dates</h3>
            <div className="flex gap-1 text-slate-400">
              <ChevronLeft className="w-4 h-4 cursor-pointer hover:text-slate-800" />
              <ChevronRight className="w-4 h-4 cursor-pointer hover:text-slate-800" />
            </div>
          </div>
          
          <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-500 mb-2">
            <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
          </div>
          
          <div className="grid grid-cols-7 gap-y-2 text-center text-sm font-bold text-slate-700">
            {calendarCells.map((cell, idx) => {
              const hasBills = cell.billsOnThisDay.length > 0;
              const isToday = cell.day === new Date().getDate() && selectedDate.getMonth() === new Date().getMonth();
              return (
                <div key={idx} className="relative py-1 flex flex-col items-center justify-center cursor-pointer group">
                   <span className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${isToday ? 'bg-[#005d42] text-white' : 'hover:bg-slate-200'} ${!cell.day ? 'opacity-0' : ''}`}>
                     {cell.day}
                   </span>
                   {hasBills && (
                     <span className="w-1.5 h-1.5 rounded-full bg-orange-500 absolute bottom-[-2px]"></span>
                   )}
                   {hasBills && (
                     <div className="opacity-0 group-hover:opacity-100 absolute bottom-6 w-[120px] bg-white border border-slate-200 shadow-lg rounded-xl p-2 z-20 text-left pointer-events-none transition-opacity">
                       {cell.billsOnThisDay.map(b => (
                         <div key={b.id} className="text-[10px] truncate"><span className="w-1.5 h-1.5 inline-block rounded-full bg-orange-500 mr-1"></span>{b.name}</div>
                       ))}
                     </div>
                   )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* RECENT & UPCOMING BILLS */}
      <div>
        <h3 className="font-bold text-lg text-slate-800 mb-4 px-2">Recent & Upcoming Bills</h3>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          
          {dashboardBills.length === 0 ? (
             <div className="p-12 text-center text-slate-400 font-bold flex flex-col items-center">
               <Receipt className="w-12 h-12 mb-4 text-slate-200" />
               No bills for this month.
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <tbody>
                  {dashboardBills.slice(0, 10).map((bill) => (
                    <tr key={bill.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
                      
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="text-slate-300 opacity-50 cursor-grab hidden sm:block">
                            <Menu className="w-4 h-4" />
                          </div>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getCategoryBg(bill.category)}`}>
                            {getCategoryIcon(bill.category)}
                          </div>
                          <span className="font-bold text-slate-800">{bill.name}</span>
                        </div>
                      </td>
                      
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                           <CalendarIcon className="w-4 h-4" />
                           {currentMonthName} {bill.dueDate.split('-')[2]}
                        </div>
                      </td>
                      
                      <td className="py-4 px-6 text-sm font-black text-slate-800">
                        {currencySymbol}{bill.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                           <span className={`w-2 h-2 rounded-full ${bill.status === 'Paid' ? 'bg-emerald-500' : bill.status === 'Overdue' ? 'bg-rose-500' : 'bg-orange-500'}`}></span>
                           <span className="text-xs font-bold text-slate-600">
                             {bill.status === 'Paid' ? 'Paid' : bill.status === 'Overdue' ? 'Overdue' : 'Pending'}
                           </span>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => handleToggleState(bill)}
                          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${
                            bill.status === 'Paid' 
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                            : 'bg-[#005d42] text-white hover:bg-[#065F46] hover:shadow-md'
                          }`}
                        >
                          {bill.status === 'Paid' ? 'Mark Pending' : 'Pay Now'}
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
"""
    with open("src/pages/Dashboard.tsx", "w") as f:
        f.write(content)

if __name__ == "__main__":
    main()
