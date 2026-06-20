import os
import re

def main():
    app_path = "src/App.tsx.orig"
    with open(app_path, "r") as f:
        content = f.read()

    # Apply date fixes
    content = content.replace("const today = new Date('2023-10-14');", "const today = new Date();")
    content = content.replace("const [formDueDate, setFormDueDate] = useState('2023-10-15');", "const [formDueDate, setFormDueDate] = useState(new Date().toISOString().split('T')[0]);")
    content = content.replace("setFormDueDate(presetDate || '2023-10-15');", "setFormDueDate(presetDate || new Date().toISOString().split('T')[0]);")
    content = content.replace("const [calendarYear, setCalendarYear] = useState(2023);", "const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());")
    content = content.replace("const [calendarMonth, setCalendarMonth] = useState(9); // Oct is index 9 (0-indexed)", "const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth()); // 0-indexed month")
    
    # Calendar recurring fix
    calendar_old = "      const matchedBills = bills.filter(b => b.dueDate === dateStringStr);"
    calendar_new = """      const matchedBills = bills.filter(b => {
        if (b.dueDate === dateStringStr) return true;
        if (b.recurring) {
          const [bYear, bMonth, bDay] = b.dueDate.split('-').map(Number);
          const cYear = calendarYear;
          const cMonth = calendarMonth + 1;
          const cDay = d;
          
          let targetDay = bDay;
          if (bDay > days) targetDay = days;

          if (cYear > bYear || (cYear === bYear && cMonth > bMonth) || (cYear === bYear && cMonth === bMonth && cDay >= bDay)) {
             if (cDay === targetDay) {
                const monthDiff = (cYear - bYear) * 12 + (cMonth - bMonth);
                if (b.frequency === 'monthly') return monthDiff > 0;
                if (b.frequency === 'quarterly') return monthDiff > 0 && monthDiff % 3 === 0;
                if (b.frequency === 'yearly') return monthDiff > 0 && monthDiff % 12 === 0;
             }
          }
        }
        return false;
      });"""
    content = content.replace(calendar_old, calendar_new)

    tabs = {
        'dashboard': ("{/* TAB 1: DASHBOARD OVERVIEW */}", "{/* TAB 2: BILLS MANAGEMENT TABLE VIEW */}"),
        'bills': ("{/* TAB 2: BILLS MANAGEMENT TABLE VIEW */}", "{/* TAB 3: CALENDAR VIEW */}"),
        'calendar': ("{/* TAB 3: CALENDAR VIEW */}", "{/* TAB 4: FINANCIAL INSIGHTS SECTION */}"),
        'insights': ("{/* TAB 4: FINANCIAL INSIGHTS SECTION */}", "{/* TAB 5: ACCOUNT & SYSTEM CONFIG SETTINGS */}"),
        'settings': ("{/* TAB 5: ACCOUNT & SYSTEM CONFIG SETTINGS */}", "{/* ---------------- 5. ADD / EDIT BILL DIALOG MODALS ---------------- */}")
    }

    new_content = content

    for tab, (start_marker, end_marker) in tabs.items():
        start_idx = new_content.find(start_marker)
        if tab == 'settings':
            # For settings, find the start of the next div that closes the tab content
            # Wait, end_marker is MODALS, but before that there are closing tags.
            # Let's find the closing tag of the tab: `)}`
            inner_end = new_content.rfind(")}", start_idx, new_content.find(end_marker))
            end_idx = inner_end + 2
        else:
            end_idx = new_content.find(end_marker)
            
        block = new_content[start_idx:end_idx]
        
        prefix = f"{{currentTab === '{tab}' && ("
        prefix_idx = block.find(prefix)
        if prefix_idx != -1:
            inner_start = prefix_idx + len(prefix)
            inner_end = block.rfind(")}")
            inner_jsx = block[inner_start:inner_end].strip()
            
            inner_jsx = inner_jsx.replace("setCurrentTab('dashboard')", "navigate('/dashboard')")
            inner_jsx = inner_jsx.replace("setCurrentTab('bills')", "navigate('/bills')")
            inner_jsx = inner_jsx.replace("setCurrentTab('calendar')", "navigate('/calendar')")
            inner_jsx = inner_jsx.replace("setCurrentTab('insights')", "navigate('/insights')")
            inner_jsx = inner_jsx.replace("setCurrentTab('settings')", "navigate('/settings')")

            comp_name = tab.capitalize()
                
            route_jsx = f"{start_marker}\n                <Route path=\"/{tab}\" element={{<{comp_name} />}} />\n"
            new_content = new_content.replace(block, route_jsx)
        else:
            print(f"Error parsing {tab}")

    imports = """import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AppContext } from './context/AppContext';
import Dashboard from './pages/Dashboard';
import Bills from './pages/Bills';
import Calendar from './pages/Calendar';
import Insights from './pages/Insights';
import Settings from './pages/Settings';
"""
    new_content = new_content.replace("import React, { useState, useEffect, useMemo } from 'react';", "import React, { useState, useEffect, useMemo } from 'react';\n" + imports)
    
    new_content = new_content.replace("setCurrentTab('dashboard')", "navigate('/dashboard')")
    new_content = new_content.replace("setCurrentTab('bills')", "navigate('/bills')")
    new_content = new_content.replace("setCurrentTab('calendar')", "navigate('/calendar')")
    new_content = new_content.replace("setCurrentTab('insights')", "navigate('/insights')")
    new_content = new_content.replace("setCurrentTab('settings')", "navigate('/settings')")

    new_content = new_content.replace("currentTab === 'dashboard'", "location.pathname === '/dashboard'")
    new_content = new_content.replace("currentTab === 'bills'", "location.pathname === '/bills'")
    new_content = new_content.replace("currentTab === 'calendar'", "location.pathname === '/calendar'")
    new_content = new_content.replace("currentTab === 'insights'", "location.pathname === '/insights'")
    new_content = new_content.replace("currentTab === 'settings'", "location.pathname === '/settings'")

    app_hook_code = """
  const navigate = useNavigate();
  const location = useLocation();

  const contextValue = {
    bills, userProfile, stats, currencySymbol, categoryChartStats,
    triggerAddFlow, triggerEditFlow, handleToggleState, handleDeleteTrigger, triggerCallAI,
    searchQuery, setSearchQuery, categoryFilter, setCategoryFilter, statusFilter, setStatusFilter,
    aiTip, isGeneratingTip, calendarYear, calendarMonth, handlePrevMonth, handleNextMonth,
    calendarCells, monthNames, getCategoryLabel, getStatusColor,
    setCurrentTab: () => {}, userEmail: firebaseUser?.email || '', handleUpdatePreference, setUserProfile
  };
"""
    new_content = new_content.replace("export default function App() {\n", "export default function App() {\n" + app_hook_code)

    routes_wrapper_start = """{/* ---------------- TABS MATRIX ---------------- */}
                <AppContext.Provider value={contextValue}>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />"""
    new_content = new_content.replace("{/* ---------------- TABS MATRIX ---------------- */}", routes_wrapper_start)
    
    routes_wrapper_end = """<Route path="/settings" element={<Settings />} />
                  </Routes>
                </AppContext.Provider>"""
    new_content = new_content.replace("""<Route path="/settings" element={<Settings />} />""", routes_wrapper_end)

    with open("src/App.tsx", "w") as f:
        f.write(new_content)
        
    print("Smart refactoring complete.")

if __name__ == "__main__":
    main()
