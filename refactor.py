import os
import re

def main():
    app_path = "src/App.tsx"
    with open(app_path, "r") as f:
        content = f.read()

    # Create directories
    os.makedirs("src/pages", exist_ok=True)
    os.makedirs("src/context", exist_ok=True)

    # Context file
    context_code = """import { createContext, useContext } from 'react';
import { Bill, UserProfile } from '../types';

export interface AppContextType {
  bills: Bill[];
  userProfile: UserProfile;
  stats: any;
  currencySymbol: string;
  categoryChartStats: any;
  triggerAddFlow: (presetDate?: string) => void;
  triggerEditFlow: (bill: Bill) => void;
  handleToggleState: (bill: Bill) => void;
  handleDeleteTrigger: (id: string) => void;
  triggerCallAI: () => void;
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  categoryFilter: string;
  setCategoryFilter: (s: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  aiTip: string;
  isGeneratingTip: boolean;
  calendarYear: number;
  calendarMonth: number;
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  calendarCells: any[];
  monthNames: string[];
  getCategoryLabel: (cat: string) => string;
  getStatusColor: (status: string) => string;
  setCurrentTab: (tab: string) => void;
  userEmail: string;
  handleUpdatePreference: (e: any) => void;
  setUserProfile: (p: any) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
"""
    with open("src/context/AppContext.tsx", "w") as f:
        f.write(context_code)

    # Extract tabs
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
        end_idx = new_content.find(end_marker)
        
        if start_idx == -1 or end_idx == -1:
            print(f"Could not find {tab}")
            continue
            
        block = new_content[start_idx:end_idx]
        
        # The block starts with something like:
        # {/* TAB 1: DASHBOARD OVERVIEW */}
        # {currentTab === 'dashboard' && (
        #   <div className="space-y-6">
        # ...
        #   </div>
        # )}
        
        # We want to extract the inner JSX
        inner_jsx_match = re.search(r"\{currentTab === '[^']+' && \(\s*(<div.*?</div>)\s*\)\}", block, re.DOTALL)
        if not inner_jsx_match:
            # Fallback regex if it spans differently
            inner_jsx_match = re.search(r"\{currentTab === '[^']+' && \(\s*(<div.*)\)\}", block, re.DOTALL)
            
        if inner_jsx_match:
            inner_jsx = inner_jsx_match.group(1)
        else:
            print(f"Could not extract inner JSX for {tab}")
            continue

        # Replace links in inner_jsx
        inner_jsx = inner_jsx.replace("setCurrentTab('dashboard')", "navigate('/dashboard')")
        inner_jsx = inner_jsx.replace("setCurrentTab('bills')", "navigate('/bills')")
        inner_jsx = inner_jsx.replace("setCurrentTab('calendar')", "navigate('/calendar')")
        inner_jsx = inner_jsx.replace("setCurrentTab('insights')", "navigate('/insights')")
        inner_jsx = inner_jsx.replace("setCurrentTab('settings')", "navigate('/settings')")

        # Create component file
        component_name = tab.capitalize()
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

export default function {component_name}() {{
  const navigate = useNavigate();
  const {{ 
    bills, userProfile, stats, currencySymbol, categoryChartStats,
    triggerAddFlow, triggerEditFlow, handleToggleState, handleDeleteTrigger, triggerCallAI,
    searchQuery, setSearchQuery, categoryFilter, setCategoryFilter, statusFilter, setStatusFilter,
    aiTip, isGeneratingTip, calendarYear, calendarMonth, handlePrevMonth, handleNextMonth,
    calendarCells, monthNames, getCategoryLabel, getStatusColor, userEmail, handleUpdatePreference, setUserProfile
  }} = useAppContext();

  return (
    {inner_jsx}
  );
}}
"""
        with open(f"src/pages/{component_name}.tsx", "w") as f:
            f.write(component_code)
            
        # Replace block in App.tsx with <Route ... />
        route_jsx = f"{start_marker}\n                <Route path=\"/{tab}\" element={{<{component_name} />}} />\n"
        new_content = new_content.replace(block, route_jsx)

    # Now we need to update imports and routing in App.tsx
    imports = """import { Routes, Route, useNavigate, useLocation, Navigate, BrowserRouter } from 'react-router-dom';
import { AppContext } from './context/AppContext';
import Dashboard from './pages/Dashboard';
import Bills from './pages/Bills';
import Calendar from './pages/Calendar';
import Insights from './pages/Insights';
import Settings from './pages/Settings';
"""
    new_content = new_content.replace("import React, { useState, useEffect, useMemo } from 'react';", "import React, { useState, useEffect, useMemo } from 'react';\n" + imports)

    # Replace setCurrentTab calls in Sidebar
    new_content = new_content.replace("setCurrentTab('dashboard')", "navigate('/dashboard')")
    new_content = new_content.replace("setCurrentTab('bills')", "navigate('/bills')")
    new_content = new_content.replace("setCurrentTab('calendar')", "navigate('/calendar')")
    new_content = new_content.replace("setCurrentTab('insights')", "navigate('/insights')")
    new_content = new_content.replace("setCurrentTab('settings')", "navigate('/settings')")

    # Replace currentTab active states
    new_content = new_content.replace("currentTab === 'dashboard'", "location.pathname === '/dashboard'")
    new_content = new_content.replace("currentTab === 'bills'", "location.pathname === '/bills'")
    new_content = new_content.replace("currentTab === 'calendar'", "location.pathname === '/calendar'")
    new_content = new_content.replace("currentTab === 'insights'", "location.pathname === '/insights'")
    new_content = new_content.replace("currentTab === 'settings'", "location.pathname === '/settings'")

    # In App(), add useNavigate and useLocation
    # Find `export default function App() {`
    app_start = new_content.find("export default function App() {")
    app_start_end = new_content.find("{", app_start) + 1
    
    app_hook_code = """
  const navigate = useNavigate();
  const location = useLocation();
"""
    new_content = new_content[:app_start_end] + app_hook_code + new_content[app_start_end:]

    # Wrap the workspace content with <Routes> and context provider
    # The workspace content starts at `{/* ---------------- TABS MATRIX ---------------- */}`
    tabs_matrix = "{/* ---------------- TABS MATRIX ---------------- */}"
    tabs_matrix_idx = new_content.find(tabs_matrix)
    
    # End of tabs matrix is just before the Modals
    modals_start = "{/* ---------------- 5. ADD / EDIT BILL DIALOG MODALS ---------------- */}"
    modals_idx = new_content.find(modals_start)

    context_val = """
  const contextValue = {
    bills, userProfile, stats, currencySymbol, categoryChartStats,
    triggerAddFlow, triggerEditFlow, handleToggleState, handleDeleteTrigger, triggerCallAI,
    searchQuery, setSearchQuery, categoryFilter, setCategoryFilter, statusFilter, setStatusFilter,
    aiTip, isGeneratingTip, calendarYear, calendarMonth, handlePrevMonth, handleNextMonth,
    calendarCells, monthNames, getCategoryLabel, getStatusColor,
    setCurrentTab: () => {}, userEmail: firebaseUser?.email || '', handleUpdatePreference, setUserProfile
  };
"""
    
    # insert context_val before return (
    return_idx = new_content.rfind("return (", 0, tabs_matrix_idx)
    new_content = new_content[:return_idx] + context_val + new_content[return_idx:]

    # Recalculate indexes after insertion
    tabs_matrix_idx = new_content.find(tabs_matrix)
    modals_idx = new_content.find(modals_start)

    routes_wrapper_start = """{/* ---------------- TABS MATRIX ---------------- */}
                <AppContext.Provider value={contextValue}>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
"""
    routes_wrapper_end = """                  </Routes>
                </AppContext.Provider>
"""
    
    # Replace the tabs matrix block with wrapped block
    block_inner = new_content[tabs_matrix_idx:modals_idx]
    block_inner = block_inner.replace(tabs_matrix, routes_wrapper_start)
    block_inner = block_inner + routes_wrapper_end
    
    new_content = new_content[:tabs_matrix_idx] + block_inner + new_content[modals_idx:]

    # Save App.tsx
    with open("src/App.tsx", "w") as f:
        f.write(new_content)

    print("Refactoring complete.")

if __name__ == "__main__":
    main()
