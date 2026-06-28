import re

def main():
    file_path = "src/pages/Dashboard.tsx"
    with open(file_path, "r") as f:
        content = f.read()

    # 1. Import expenses
    if "expenses" not in content:
        content = content.replace("    bills, userProfile, currencySymbol,", "    bills, expenses, userProfile, currencySymbol,")

    # 2. Add dashboardExpenses and calculations
    expenses_calc = """  const dashboardExpenses = useMemo(() => {
    return expenses.filter(e => {
      const eDate = new Date(e.date);
      return eDate.getFullYear() === selectedDate.getFullYear() && eDate.getMonth() === selectedDate.getMonth();
    });
  }, [expenses, selectedDate]);

  const expensesTotalAmount = useMemo(() => {
    return dashboardExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [dashboardExpenses]);

  const totalOutflow = dashboardStats.totalAmount + expensesTotalAmount;
"""
    if "dashboardExpenses = useMemo" not in content:
        content = content.replace("  const dashboardCalendarCells = useMemo(() => {", expenses_calc + "\n  const dashboardCalendarCells = useMemo(() => {")

    # 3. Update Mini Chart Calculations (dailySpend)
    old_daily_spend = """  const dailySpend = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const amount = dashboardBills.reduce((sum, b) => {
        const bDay = parseInt(b.dueDate.split('-')[2], 10);
        return bDay === day ? sum + b.amount : sum;
      }, 0);
      return amount;
    });
  }, [dashboardBills, daysInMonth]);
  const maxSpend = Math.max(...dailySpend, 1);"""

    new_daily_spend = """  const dailySpend = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const billAmount = dashboardBills.reduce((sum, b) => {
        const bDay = parseInt(b.dueDate.split('-')[2], 10);
        return bDay === day ? sum + b.amount : sum;
      }, 0);
      const expenseAmount = dashboardExpenses.reduce((sum, e) => {
        const eDay = parseInt(e.date.split('-')[2], 10);
        return eDay === day ? sum + e.amount : sum;
      }, 0);
      return { billAmount, expenseAmount, total: billAmount + expenseAmount };
    });
  }, [dashboardBills, dashboardExpenses, daysInMonth]);
  const maxSpend = Math.max(...dailySpend.map(d => d.total), 1);"""
    
    content = content.replace(old_daily_spend, new_daily_spend)

    # 4. Replace Stats Row Cards
    # Using regex to replace the entire STATS ROW block
    # Start: {/* STATS ROW */}
    # End:       {/* MIDDLE ROW */}
    import re
    stats_row_pattern = re.compile(r'\{\/\* STATS ROW \*\/\}.*?(?=\{\/\* MIDDLE ROW \*\/\})', re.DOTALL)
    
    new_stats_row = """{/* STATS ROW */}
      <div className="order-3 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Bills */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-bold text-slate-500">Total Bills</span>
            <span className="p-1.5 bg-blue-50 text-blue-500 rounded-lg"><Receipt className="w-4 h-4" /></span>
          </div>
          <div className="text-4xl font-black text-slate-800 tracking-tight">
            {currencySymbol}{dashboardStats.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-bold text-slate-500">Personal Expenses</span>
            <span className="p-1.5 bg-orange-50 text-orange-500 rounded-lg"><Clock className="w-4 h-4" /></span>
          </div>
          <div className="text-4xl font-black text-slate-800 tracking-tight">
            {currencySymbol}{expensesTotalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Total Outflow */}
        <div className="bg-gradient-to-br from-[#005d42] to-[#047857] rounded-3xl p-6 border border-[#005d42] shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col justify-between transition-all relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-sm font-bold text-emerald-100">Total Outflow</span>
          </div>
          <div className="relative z-10">
            <div className="text-4xl font-black text-white tracking-tight">
              {currencySymbol}{totalOutflow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

      </div>

      """
    
    content = stats_row_pattern.sub(new_stats_row, content)

    # 5. Update Monthly Spending Bar Chart Header
    content = content.replace(
        '<span className="w-2 h-2 rounded-full bg-[#005d42]"></span> Current Spend',
        '<span className="w-2 h-2 rounded-full bg-[#005d42]"></span> Bills <span className="w-2 h-2 rounded-full bg-orange-400 ml-2"></span> Expenses'
    )
    content = content.replace(
        '<span className="ml-2 text-slate-800">{currencySymbol}{dashboardStats.totalAmount.toLocaleString()}</span>',
        '<span className="ml-2 text-slate-800">{currencySymbol}{totalOutflow.toLocaleString()}</span>'
    )

    # 6. Update Bar Chart Rendering
    old_bars = """              {dailySpend.map((amount, idx) => (
                <div key={idx} className="relative w-full h-full flex items-end justify-center group">
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
              ))}"""

    new_bars = """              {dailySpend.map((dayData, idx) => (
                <div key={idx} className="relative w-full h-full flex items-end justify-center group">
                  {dayData.total > 0 && (
                    <div className="w-[80%] max-w-[12px] flex flex-col justify-end cursor-pointer" style={{ height: `${(dayData.total / maxSpend) * 100}%`, minHeight: '4px' }}>
                      {dayData.expenseAmount > 0 && (
                         <div className="w-full bg-orange-400 rounded-t-sm hover:bg-orange-500 transition-colors" style={{ height: `${(dayData.expenseAmount / dayData.total) * 100}%` }}></div>
                      )}
                      {dayData.billAmount > 0 && (
                         <div className={`w-full bg-[#005d42] hover:bg-[#065F46] transition-colors ${dayData.expenseAmount === 0 ? 'rounded-t-sm' : ''}`} style={{ height: `${(dayData.billAmount / dayData.total) * 100}%` }}></div>
                      )}
                       <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow pointer-events-none z-20 whitespace-nowrap flex flex-col items-center">
                         <span>{currencySymbol}{dayData.total}</span>
                       </div>
                    </div>
                  )}
                  {dayData.total === 0 && (
                     <div className="w-[80%] max-w-[12px] bg-slate-100 rounded-t-sm" style={{ height: '4px' }}></div>
                  )}
                </div>
              ))}"""
    
    content = content.replace(old_bars, new_bars)

    with open(file_path, "w") as f:
        f.write(content)

    print("Dashboard.tsx patched successfully.")

if __name__ == "__main__":
    main()
