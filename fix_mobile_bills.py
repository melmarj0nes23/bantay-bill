import os

def main():
    app_file = "src/pages/Bills.tsx"
    with open(app_file, "r") as f:
        content = f.read()

    # Add the expandedBillId state
    state_str = "  const [isSettingsOpen, setIsSettingsOpen] = useState(false);"
    new_state_str = "  const [isSettingsOpen, setIsSettingsOpen] = useState(false);\n  const [expandedBillId, setExpandedBillId] = useState<string | null>(null);"
    content = content.replace(state_str, new_state_str)

    # I also need the ChevronDown icon, so I'll ensure it is imported
    if "ChevronDown" not in content:
        content = content.replace("ChevronRight,", "ChevronRight, ChevronDown,")

    # Replace the table rendering
    table_start_str = """                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs whitespace-nowrap">"""
              
    table_end_str = """                          </table>
                        </div>"""
            
    start_idx = content.find(table_start_str)
    end_idx = content.find(table_end_str) + len(table_end_str)
    
    if start_idx == -1 or end_idx == -1:
        print("Could not find table boundaries")
        return
        
    old_table = content[start_idx:end_idx]
    
    new_table = """                        <>
                          {/* Desktop Table View */}
                          <div className="overflow-x-auto hidden md:block">
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

                          {/* Mobile Collapsible View */}
                          <div className="md:hidden divide-y divide-slate-100">
                            {filteredBills.map((bill) => (
                              <div key={bill.id} className="flex flex-col">
                                {/* Compact Header */}
                                <div 
                                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                                  onClick={() => setExpandedBillId(expandedBillId === bill.id ? null : bill.id)}
                                >
                                  <div className="flex items-center gap-3">
                                    <div>
                                      <p className="font-bold text-slate-800 text-sm">{bill.name}</p>
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                         <span className={`w-1.5 h-1.5 rounded-full ${bill.status === 'Paid' ? 'bg-emerald-500' : bill.status === 'Overdue' ? 'bg-rose-500' : 'bg-orange-500'}`}></span>
                                         <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                           {bill.status}
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
                                    <div className="flex flex-wrap justify-between items-center text-xs font-bold text-slate-500 gap-y-2">
                                       <div className="flex items-center gap-2">
                                         <CalendarIcon className="w-4 h-4" />
                                         Due: {bill.dueDate}
                                       </div>
                                       <div className="flex items-center gap-1 uppercase tracking-wider bg-slate-200/50 px-2 py-1 rounded-md">
                                         {getCategoryLabel(bill.category)}
                                       </div>
                                    </div>
                                    {bill.notes && (
                                       <p className="text-xs text-slate-500 italic bg-white p-2 rounded border border-slate-100">"{bill.notes}"</p>
                                    )}
                                    
                                    <div className="flex gap-2 mt-2">
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleToggleState(bill); }}
                                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                                          bill.status === 'Paid' 
                                          ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' 
                                          : 'bg-[#005d42] text-white hover:bg-[#065F46] hover:shadow-md'
                                        }`}
                                      >
                                        {bill.status === 'Paid' ? 'Mark Pending' : 'Pay Now'}
                                      </button>
                                      
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); triggerEditFlow(bill); }}
                                        className="px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleDeleteTrigger(bill.id); }}
                                        className="px-3 py-2.5 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 border border-rose-100 shadow-sm"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
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
