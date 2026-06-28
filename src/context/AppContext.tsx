import { createContext, useContext } from 'react';
import { Bill, Expense, UserProfile } from '../types';

export interface AppContextType {
  filteredBills: Bill[];
  handleExportCSV: () => void;
  handleLoadDemoData: () => Promise<void>;
  isGeneratingDemo: boolean;
  bills: Bill[];
  expenses: Expense[];
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
