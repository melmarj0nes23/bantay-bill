import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronDown, 
  ChevronUp, 
  Receipt,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getBillsForMonth, computeStats } from '../utils/billCalculations';

export default function Insights() {
  const { bills, expenses, currencySymbol, monthNames, getCategoryLabel, getStatusColor } = useAppContext();
  
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);

  // Generate an array of years for the dropdown (e.g. current year +/- 3 years)
  const availableYears = useMemo(() => {
    const years = [];
    for (let i = currentYear - 3; i <= currentYear + 3; i++) {
      years.push(i);
    }
    return years;
  }, [currentYear]);

  // Pre-calculate data for all 12 months of the selected year
  const monthsData = useMemo(() => {
    return monthNames.map((monthName, index) => {
      const monthNumber = index + 1; // 1-indexed
      const monthBills = getBillsForMonth(bills, selectedYear, monthNumber);
      
      const monthExpenses = expenses.filter(e => {
        const [eYear, eMonth] = e.date.split('-').map(Number);
        return eYear === selectedYear && eMonth === monthNumber;
      });

      const stats = computeStats(monthBills, monthExpenses);
      
      return {
        index,
        monthNumber,
        monthName,
        bills: monthBills,
        expenses: monthExpenses,
        stats
      };
    });
  }, [bills, selectedYear, monthNames]);

  // Aggregate yearly totals
  const yearlyStats = useMemo(() => {
    let total = 0, paid = 0, pending = 0;
    let billsTotal = 0, billsPaid = 0, billsPending = 0;
    let expensesTotal = 0;

    monthsData.forEach(m => {
      total += m.stats.totalAmount;
      paid += m.stats.paidAmount;
      pending += (m.stats.pendingAmount + m.stats.overdueAmount);
      
      billsTotal += m.stats.billsTotalAmount;
      billsPaid += (m.stats.paidAmount - m.stats.expensesTotalAmount);
      billsPending += (m.stats.pendingAmount + m.stats.overdueAmount);

      expensesTotal += m.stats.expensesTotalAmount;
    });
    return {
      total,
      paid,
      pending,
      billsTotal,
      billsPaid,
      billsPending,
      expensesTotal,
      percent: total > 0 ? Math.round((paid / total) * 100) : 0
    };
  }, [monthsData]);

  const toggleMonth = (index: number) => {
    setExpandedMonth(prev => prev === index ? null : index);
  };

  return (
    <div className="space-y-6">
      {/* Header & Year Selector */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#181d1a]">Yearly Overview</h2>
          <p className="text-sm text-[#3e4943] mt-0.5">Historical breakdown of your financial commitments by month.</p>
        </div>
        
        <div className="relative inline-flex self-start">
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <div className="bg-white border border-[#bdc9c1] text-[#181d1a] text-sm font-semibold px-4 py-2 rounded-xl shadow-sm group-hover:border-[#047857] flex items-center gap-2 pointer-events-none transition-all">
            <CalendarIcon className="w-4 h-4 text-[#005d42]" />
            {selectedYear}
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </div>
        </div>
      </div>

      {/* Yearly Aggregation Card */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-1 w-full flex flex-col sm:flex-row gap-6">
          <div className="flex-1 border-b sm:border-b-0 sm:border-r border-slate-200 pb-4 sm:pb-0 sm:pr-6">
            <h3 className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">Total Bills Spend</h3>
            <div className="text-3xl font-bold text-[#181d1a]">{currencySymbol}{yearlyStats.billsTotal.toLocaleString()}</div>
            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#005d42]">
                <CheckCircle className="w-4 h-4" /> Paid: {currencySymbol}{yearlyStats.billsPaid.toLocaleString()}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                <Clock className="w-4 h-4" /> Pending: {currencySymbol}{yearlyStats.billsPending.toLocaleString()}
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">Total Expenses Spend</h3>
            <div className="text-3xl font-bold text-[#181d1a]">{currencySymbol}{yearlyStats.expensesTotal.toLocaleString()}</div>
            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#005d42]">
                <CheckCircle className="w-4 h-4" /> Paid: {currencySymbol}{yearlyStats.expensesTotal.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
        

      </div>

      {/* Monthly Cards List */}
      <div className="space-y-4">
        {monthsData.map((data) => (
          <div key={data.monthName} className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Card Header (Clickable) */}
            <div 
              onClick={() => toggleMonth(data.index)}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between cursor-pointer gap-4 group"
            >
              <div className="flex items-center gap-4 w-full md:w-1/3 shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold ${data.stats.totalAmount > 0 ? 'bg-emerald-50 text-[#005d42]' : 'bg-slate-50 text-slate-400'}`}>
                  {data.monthNumber}
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#181d1a] group-hover:text-[#005d42] transition-colors">{data.monthName} {selectedYear}</h3>
                  <p className="text-xs text-slate-500 font-medium">{data.bills.length + data.expenses.length} records ({data.bills.length} bills, {data.expenses.length} expenses)</p>
                </div>
              </div>
              
              <div className="flex-1 w-full flex flex-col justify-center">
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-600">Progress</span>
                  <span className="text-[#005d42]">{data.stats.percent}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className="bg-[#005d42] h-2 rounded-full transition-all duration-700" 
                    style={{ width: `${data.stats.percent}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto shrink-0 mt-2 md:mt-0">
                <div className="text-right">
                  <div className="text-sm font-bold text-[#181d1a]">{currencySymbol}{data.stats.totalAmount.toLocaleString()}</div>
                  <div className="text-xs text-slate-500 font-medium">Total Volume</div>
                </div>
                <div className="p-1.5 rounded-full bg-slate-50 text-slate-400 group-hover:bg-slate-100 transition-colors">
                  {expandedMonth === data.index ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>
            </div>

            {/* Expandable Bill List */}
            {expandedMonth === data.index && (
              <div className="border-t border-slate-100 bg-slate-50/50 p-5">
                {data.bills.length === 0 && data.expenses.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No bills or expenses recorded for this month.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.bills.map((bill) => (
                      <div key={`bill-${bill.id}-${bill.dueDate}`} className="bg-white border border-slate-200 rounded-xl p-3 flex justify-between items-center shadow-xs">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-sm text-slate-800">{bill.name}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusColor(bill.status)}`}>
                              {bill.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                            <span className="capitalize">{getCategoryLabel(bill.category)}</span>
                            <span>•</span>
                            <span>Due: {bill.dueDate}</span>
                          </div>
                        </div>
                        <div className="font-extrabold text-slate-800 text-sm">
                          {currencySymbol}{bill.amount.toLocaleString()}
                        </div>
                      </div>
                    ))}
                    {data.expenses.map((expense) => (
                      <div key={`exp-${expense.id}-${expense.date}`} className="bg-white border border-slate-200 rounded-xl p-3 flex justify-between items-center shadow-xs">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-sm text-slate-800">{expense.name}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700">
                              Paid (Expense)
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                            <span className="capitalize">{expense.category}</span>
                            <span>•</span>
                            <span>Date: {expense.date}</span>
                          </div>
                        </div>
                        <div className="font-extrabold text-slate-800 text-sm">
                          {currencySymbol}{expense.amount.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
