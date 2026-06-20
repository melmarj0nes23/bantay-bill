import os

def main():
    # 1. Update App.tsx Header padding & button
    app_file = "src/App.tsx"
    with open(app_file, "r") as f:
        content = f.read()

    # Header container
    old_nav = """<nav className="sticky top-0 z-50 w-full bg-[#f6fbf5]/80 backdrop-blur-md border-b border-[#bdc9c1] h-16 flex items-center">
            <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">"""
    new_nav = """<nav className="sticky top-0 z-50 w-full bg-[#f6fbf5]/80 backdrop-blur-md border-b border-[#bdc9c1] h-16 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full flex justify-between items-center">"""
    content = content.replace(old_nav, new_nav)

    # Demo Button (reduce padding and hide icon on mobile)
    old_btn = """<button 
                    onClick={handleBypassGuestAccess}
                    disabled={isDemoLoading}
                    className="w-full sm:w-auto bg-[#047857] text-white hover:bg-[#065F46] shadow-md transition-all duration-150 px-8 py-4 rounded-xl font-medium text-base flex items-center justify-center gap-2 disabled:opacity-70 disabled:animate-pulse"
                  >
                    {isDemoLoading ? "Loading Workspace..." : "Try Demo Now"}
                    {!isDemoLoading && <ArrowRight className="w-5 h-5" />}
                  </button>"""
    new_btn = """<button 
                    onClick={handleBypassGuestAccess}
                    disabled={isDemoLoading}
                    className="w-full sm:w-auto bg-[#047857] text-white hover:bg-[#065F46] shadow-md transition-all duration-150 px-4 sm:px-8 py-3 sm:py-4 rounded-xl font-medium text-sm sm:text-base flex items-center justify-center gap-2 disabled:opacity-70 disabled:animate-pulse whitespace-nowrap"
                  >
                    {isDemoLoading ? "Loading Workspace..." : "Try Demo Now"}
                    {!isDemoLoading && <ArrowRight className="hidden sm:block w-5 h-5" />}
                  </button>"""
    content = content.replace(old_btn, new_btn)

    with open(app_file, "w") as f:
        f.write(content)


    # 2. Update Calendar.tsx with horizontal wrapper
    cal_file = "src/pages/Calendar.tsx"
    with open(cal_file, "r") as f:
        content = f.read()

    # Wrap the weekly headers and cells grid
    old_cal = """                        {/* Weekly headers */}
                        <div className="grid grid-cols-7 text-center font-bold text-xs text-slate-500 uppercase tracking-widest pb-3 border-b border-slate-100">
                          <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                        </div>

                        {/* Cells Grid */}
                        <div className="grid grid-cols-7 gap-px bg-slate-200 mt-2">"""
    
    new_cal = """                        {/* Weekly headers */}
                        <div className="overflow-x-auto">
                          <div className="min-w-[700px]">
                            <div className="grid grid-cols-7 text-center font-bold text-xs text-slate-500 uppercase tracking-widest pb-3 border-b border-slate-100">
                              <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                            </div>

                            {/* Cells Grid */}
                            <div className="grid grid-cols-7 gap-px bg-slate-200 mt-2">"""
                            
    content = content.replace(old_cal, new_cal)
    
    # Close the wrappers
    old_end = """                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}"""
    new_end = """                        </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}"""
    content = content.replace(old_end, new_end)
    
    with open(cal_file, "w") as f:
        f.write(content)


    # 3. Update Bills.tsx table with whitespace-nowrap
    bills_file = "src/pages/Bills.tsx"
    with open(bills_file, "r") as f:
        content = f.read()

    old_table = """<table className="w-full text-left text-xs">"""
    new_table = """<table className="w-full text-left text-xs whitespace-nowrap">"""
    content = content.replace(old_table, new_table)
    
    with open(bills_file, "w") as f:
        f.write(content)


    # 4. Update Dashboard.tsx headers with flex-wrap
    dash_file = "src/pages/Dashboard.tsx"
    with open(dash_file, "r") as f:
        content = f.read()

    old_header1 = """<div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-[#181d1a]">Current Cycle Overview</h2>"""
    new_header1 = """<div className="flex flex-wrap gap-4 justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-[#181d1a]">Current Cycle Overview</h2>"""
    content = content.replace(old_header1, new_header1)

    old_header2 = """<div className="flex justify-between items-center mb-4">
                        <h2 className="text-sm font-bold text-[#181d1a] uppercase tracking-wider">Top Subscriptions</h2>"""
    new_header2 = """<div className="flex flex-wrap gap-2 justify-between items-center mb-4">
                        <h2 className="text-sm font-bold text-[#181d1a] uppercase tracking-wider">Top Subscriptions</h2>"""
    content = content.replace(old_header2, new_header2)

    old_header3 = """<div className="flex justify-between items-center mb-4">
                        <h2 className="text-sm font-bold text-[#181d1a] uppercase tracking-wider">Needs Attention</h2>"""
    new_header3 = """<div className="flex flex-wrap gap-2 justify-between items-center mb-4">
                        <h2 className="text-sm font-bold text-[#181d1a] uppercase tracking-wider">Needs Attention</h2>"""
    content = content.replace(old_header3, new_header3)

    with open(dash_file, "w") as f:
        f.write(content)

if __name__ == "__main__":
    main()
