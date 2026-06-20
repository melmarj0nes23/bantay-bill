import os

def main():
    app_path = "src/pages/Dashboard.tsx"
    with open(app_path, "r") as f:
        content = f.read()

    # 1. Imports
    if "getBillsForMonth" not in content:
        content = content.replace("import { useAppContext } from '../context/AppContext';", 
                                  "import { useAppContext } from '../context/AppContext';\nimport { getBillsForMonth, computeStats } from '../utils/billCalculations';\nimport { useState, useMemo } from 'react';")

    # 2. Add local state and memos
    start_hook = content.find("const navigate = useNavigate();")
    
    hook_code = """
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
"""
    # Insert right before returning JSX, or right after `useAppContext()` extraction.
    app_context_idx = content.find("} = useAppContext();") + 20
    content = content[:app_context_idx] + "\n" + hook_code + content[app_context_idx:]

    # 3. Replace Button with Dropdown
    button_start = content.find("<button \n                        onClick={() => triggerAddFlow()}")
    button_end = content.find("</button>", button_start) + 9
    
    dropdown_html = """
                      <select 
                        value={selectedDate.toISOString()}
                        onChange={(e) => setSelectedDate(new Date(e.target.value))}
                        className="bg-white border border-[#bdc9c1] text-[#181d1a] text-sm font-semibold px-4 py-2 rounded-xl shadow-sm hover:border-[#047857] focus:outline-none focus:ring-2 focus:ring-[#047857]/20 transition-all cursor-pointer appearance-none"
                      >
                        {monthOptions.map(d => (
                          <option key={d.toISOString()} value={d.toISOString()}>
                            {d.toLocaleString('default', { month: 'long', year: 'numeric' })}
                          </option>
                        ))}
                      </select>"""
    
    content = content[:button_start] + dropdown_html + content[button_end:]

    # 4. Replace stats with dashboardStats
    content = content.replace("stats.totalAmount", "dashboardStats.totalAmount")
    content = content.replace("stats.paidAmount", "dashboardStats.paidAmount")
    content = content.replace("stats.percent", "dashboardStats.percent")
    content = content.replace("stats.pendingAmount", "dashboardStats.pendingAmount")
    content = content.replace("stats.overdueAmount", "dashboardStats.overdueAmount")
    content = content.replace("stats.completedCount", "dashboardStats.completedCount")
    content = content.replace("stats.count", "dashboardStats.count")

    # 5. Replace bills with dashboardBills where applicable
    content = content.replace("bills.filter(b => b.status !== 'Paid').length", "dashboardBills.filter(b => b.status !== 'Paid').length")
    content = content.replace("bills.length === 0", "dashboardBills.length === 0")
    content = content.replace("bills.slice", "dashboardBills.slice")

    with open("src/pages/Dashboard.tsx", "w") as f:
        f.write(content)
        
if __name__ == "__main__":
    main()
