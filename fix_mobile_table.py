import os

def main():
    app_file = "src/pages/Dashboard.tsx"
    with open(app_file, "r") as f:
        content = f.read()

    # Add the expandedBillId state
    state_str = "  const [selectedDate, setSelectedDate] = useState(() => {"
    new_state_str = "  const [expandedBillId, setExpandedBillId] = useState<string | null>(null);\n  const [selectedDate, setSelectedDate] = useState(() => {"
    content = content.replace(state_str, new_state_str)

    # Replace the table rendering
    table_start_str = """            <div className="overflow-x-auto">
              <table className="w-full text-left">"""
              
    table_end_str = """              </table>
            </div>"""
            
    # We need to find the entire block to replace
    start_idx = content.find(table_start_str)
    end_idx = content.find(table_end_str) + len(table_end_str)
    
    if start_idx == -1 or end_idx == -1:
        print("Could not find table boundaries")
        return
        
    old_table = content[start_idx:end_idx]
    
    new_table = """            <>
              {/* Desktop Table View */}
              <div className="overflow-x-auto hidden md:block">
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

              {/* Mobile Collapsible View */}
              <div className="md:hidden divide-y divide-slate-100">
                {dashboardBills.slice(0, 10).map((bill) => (
                  <div key={bill.id} className="flex flex-col">
                    {/* Compact Header (Always visible) */}
                    <div 
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => setExpandedBillId(expandedBillId === bill.id ? null : bill.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getCategoryBg(bill.category)}`}>
                          {getCategoryIcon(bill.category)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{bill.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                             <span className={`w-1.5 h-1.5 rounded-full ${bill.status === 'Paid' ? 'bg-emerald-500' : bill.status === 'Overdue' ? 'bg-rose-500' : 'bg-orange-500'}`}></span>
                             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                               {bill.status === 'Paid' ? 'Paid' : bill.status === 'Overdue' ? 'Overdue' : 'Pending'}
                             </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <p className="font-black text-slate-800 text-sm">
                          {currencySymbol}{bill.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedBillId === bill.id ? 'rotate-180' : ''}`} />
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedBillId === bill.id && (
                      <div className="px-4 pb-4 pt-1 bg-slate-50/50 flex flex-col gap-3 animate-fade-in-up">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                           <div className="flex items-center gap-2">
                             <CalendarIcon className="w-4 h-4" />
                             Due: {currentMonthName} {bill.dueDate.split('-')[2]}
                           </div>
                           <div className="flex items-center gap-1 uppercase tracking-wider">
                             {getCategoryLabel(bill.category)}
                           </div>
                        </div>
                        
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleToggleState(bill); }}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                            bill.status === 'Paid' 
                            ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' 
                            : 'bg-[#005d42] text-white hover:bg-[#065F46] hover:shadow-md'
                          }`}
                        >
                          {bill.status === 'Paid' ? 'Mark as Pending' : 'Pay Now'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>"""
            
    content = content.replace(old_table, new_table)

    with open(app_file, "w") as f:
        f.write(content)

if __name__ == "__main__":
    main()
