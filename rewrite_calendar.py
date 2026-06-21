import os

def main():
    app_file = "src/pages/Calendar.tsx"
    with open(app_file, "r") as f:
        content = f.read()

    # Add useState and selectedMobileDate
    if "import React, { useState }" not in content:
        content = content.replace("import React from 'react';", "import React, { useState } from 'react';")
        
    state_str = "export default function Calendar() {\n  const navigate = useNavigate();"
    new_state_str = """export default function Calendar() {
  const navigate = useNavigate();
  const [selectedMobileDate, setSelectedMobileDate] = useState<string | null>(null);"""
    if "selectedMobileDate" not in content:
        content = content.replace(state_str, new_state_str)

    # We need to find the bills for the selectedMobileDate
    # We can compute it inline: const selectedMobileBills = selectedMobileDate ? calendarCells.find(c => c.dateString === selectedMobileDate)?.billsOnThisDay || [] : [];
    
    # Hide the desktop calendar on mobile
    content = content.replace(
        '<div className="bg-white rounded-xl border border-[#bdc9c1] overflow-hidden shadow-xs">',
        '{/* Desktop Full Grid */}\n                    <div className="hidden md:block bg-white rounded-xl border border-[#bdc9c1] overflow-hidden shadow-xs">'
    )

    # Insert the mobile view below the desktop view
    desktop_end = "                    </div>\n                  </div>\n  );\n}"
    mobile_ui = """                    </div>

                    {/* Mobile Agenda View */}
                    <div className="md:hidden space-y-4">
                      {/* Mobile Mini Calendar */}
                      <div className="bg-[#f6fbf5] rounded-3xl p-6 border border-[#bdc9c1]/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-500 mb-2">
                          <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                        </div>
                        <div className="grid grid-cols-7 gap-y-2 text-center text-sm font-bold text-slate-700">
                          {calendarCells.map((cell, idx) => {
                            const hasBills = cell.billsOnThisDay.length > 0;
                            const isToday = cell.day === new Date().getDate() && calendarMonth === new Date().getMonth();
                            const isSelected = selectedMobileDate === cell.dateString;
                            return (
                              <div 
                                key={idx} 
                                onClick={() => cell.day && setSelectedMobileDate(cell.dateString)}
                                className="relative py-1 flex flex-col items-center justify-center cursor-pointer"
                              >
                                 <span className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                                   isSelected ? 'bg-[#005d42] text-white shadow-md' :
                                   isToday ? 'bg-[#005d42]/10 text-[#005d42]' : 
                                   cell.day ? 'hover:bg-slate-200' : 'opacity-0'
                                 }`}>
                                   {cell.day}
                                 </span>
                                 {hasBills && (
                                   <span className={`w-1.5 h-1.5 rounded-full absolute bottom-0 ${isSelected ? 'bg-white' : 'bg-orange-500'}`}></span>
                                 )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Agenda Feed */}
                      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-h-[300px]">
                        <h3 className="font-bold text-lg text-slate-800 mb-4">
                          {selectedMobileDate ? `Agenda for ${selectedMobileDate}` : "Select a date"}
                        </h3>
                        
                        {!selectedMobileDate ? (
                          <div className="text-center py-10 text-slate-400 text-sm font-medium">
                            <CalendarIcon className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                            Tap any date above to see scheduled bills.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {(() => {
                              const selectedCell = calendarCells.find(c => c.dateString === selectedMobileDate);
                              const billsForDay = selectedCell?.billsOnThisDay || [];
                              
                              if (billsForDay.length === 0) {
                                return (
                                  <div className="text-center py-10 text-slate-400 text-sm font-medium">
                                    <CheckCircle className="w-10 h-10 mx-auto mb-3 text-emerald-200" />
                                    No bills due on this date!
                                  </div>
                                );
                              }
                              
                              return billsForDay.map(b => (
                                <div key={b.id} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                  <div>
                                    <p className="font-bold text-slate-800 text-sm">{b.name}</p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                      <span className={`w-2 h-2 rounded-full ${
                                        b.status === 'Paid' ? 'bg-emerald-500' : 
                                        b.status === 'Overdue' ? 'bg-rose-500' : 'bg-orange-500'
                                      }`}></span>
                                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{b.status}</span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-black text-slate-800">{currencySymbol}{b.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                    <button 
                                      onClick={() => handleToggleState(b)}
                                      className="mt-2 text-xs font-bold text-[#005d42] hover:underline"
                                    >
                                      {b.status === 'Paid' ? 'Mark Pending' : 'Pay Now'}
                                    </button>
                                  </div>
                                </div>
                              ));
                            })()}
                            
                            <button 
                              onClick={() => triggerAddFlow(selectedMobileDate)}
                              className="w-full mt-4 py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 font-bold text-xs hover:border-[#005d42] hover:text-[#005d42] transition-colors flex items-center justify-center gap-2"
                            >
                              <Plus className="w-4 h-4" /> Add Bill for {selectedMobileDate.split('-')[2]}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
  );
}"""

    content = content.replace(desktop_end, mobile_ui)

    with open(app_file, "w") as f:
        f.write(content)

if __name__ == "__main__":
    main()
