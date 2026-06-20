import os

def main():
    app_path = "src/App.tsx"
    with open(app_path, "r") as f:
        lines = f.readlines()

    tabs = {
        'Dashboard': (1092, 1319), # 1093 to 1319 is the inner JSX (1-indexed)
        'Bills': (1324, 1453),
        'Calendar': (1458, 1534),
        'Insights': (1539, 1627),
        'Settings': (1632, 1761)
    }

    # Generate pages
    for comp_name, (start, end) in tabs.items():
        inner_jsx = "".join(lines[start:end])
        
        # Replace navigation links
        inner_jsx = inner_jsx.replace("setCurrentTab('dashboard')", "navigate('/dashboard')")
        inner_jsx = inner_jsx.replace("setCurrentTab('bills')", "navigate('/bills')")
        inner_jsx = inner_jsx.replace("setCurrentTab('calendar')", "navigate('/calendar')")
        inner_jsx = inner_jsx.replace("setCurrentTab('insights')", "navigate('/insights')")
        inner_jsx = inner_jsx.replace("setCurrentTab('settings')", "navigate('/settings')")

        component_code = f"""import React from 'react';
import {{ useNavigate }} from 'react-router-dom';
import {{ 
  CreditCard, LayoutDashboard, Receipt, Calendar as CalendarIcon, 
  BarChart3, Lightbulb, Settings as SettingsIcon, Plus, Search, 
  Bell, HelpCircle, TrendingUp, CheckCircle, AlertTriangle, Clock, 
  ChevronLeft, ChevronRight, X, Edit, Trash2, Menu, LogOut, 
  ArrowRight, Sparkles, Check, Lock, Download, Eye, Zap, Droplet, 
  Wifi, Home, Tv, UserPlus, LogIn, ShieldAlert, RefreshCw, TrendingDown, User 
}} from 'lucide-react';
import {{ useAppContext }} from '../context/AppContext';

export default function {comp_name}() {{
  const navigate = useNavigate();
  const {{ 
    bills, userProfile, stats, currencySymbol, categoryChartStats,
    triggerAddFlow, triggerEditFlow, handleToggleState, handleDeleteTrigger, triggerCallAI,
    searchQuery, setSearchQuery, categoryFilter, setCategoryFilter, statusFilter, setStatusFilter,
    aiTip, isGeneratingTip, calendarYear, calendarMonth, handlePrevMonth, handleNextMonth,
    calendarCells, monthNames, getCategoryLabel, getStatusColor, userEmail, handleUpdatePreference, setUserProfile,
    handleExportCSV, logs, setLogs
  }} = useAppContext();

  return (
{inner_jsx}
  );
}}
"""
        with open(f"src/pages/{comp_name}.tsx", "w") as f:
            f.write(component_code)

    # Now we slice App.tsx
    # We replace lines 1091 to 1762 (1-indexed) with the Routes block
    
    routes_block = """                {/* ---------------- TABS MATRIX ---------------- */}
                <AppContext.Provider value={contextValue}>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/bills" element={<Bills />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/insights" element={<Insights />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </AppContext.Provider>
"""
    new_lines = lines[:1090] + [routes_block] + lines[1763:]
    
    new_content = "".join(new_lines)
    
    # Prepend imports
    imports = """import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AppContext } from './context/AppContext';
import Dashboard from './pages/Dashboard';
import Bills from './pages/Bills';
import Calendar from './pages/Calendar';
import Insights from './pages/Insights';
import Settings from './pages/Settings';
"""
    new_content = new_content.replace("import React, { useState, useEffect, useMemo } from 'react';", "import React, { useState, useEffect, useMemo } from 'react';\n" + imports)

    # Replace setCurrentTab in Sidebar
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

    # In App(), add navigate, location and contextValue
    app_hook_code = """
  const navigate = useNavigate();
  const location = useLocation();

  const contextValue = {
    bills, userProfile, stats, currencySymbol, categoryChartStats,
    triggerAddFlow, triggerEditFlow, handleToggleState, handleDeleteTrigger, triggerCallAI,
    searchQuery, setSearchQuery, categoryFilter, setCategoryFilter, statusFilter, setStatusFilter,
    aiTip, isGeneratingTip, calendarYear, calendarMonth, handlePrevMonth, handleNextMonth,
    calendarCells, monthNames, getCategoryLabel, getStatusColor,
    setCurrentTab: () => {}, userEmail: firebaseUser?.email || '', handleUpdatePreference, setUserProfile,
    handleExportCSV, logs, setLogs
  };
"""
    new_content = new_content.replace("export default function App() {\n", "export default function App() {\n" + app_hook_code)

    with open("src/App.tsx", "w") as f:
        f.write(new_content)

if __name__ == "__main__":
    main()
