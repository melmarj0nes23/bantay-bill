import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AppContext } from './context/AppContext';
import Dashboard from './pages/Dashboard';
import Bills from './pages/Bills';
import Calendar from './pages/Calendar';
import Insights from './pages/Insights';
import { isBillDueOnDate, getBillsForMonth } from './utils/billCalculations';

import { 
  CreditCard, 
  LayoutDashboard, 
  Receipt, 
  Calendar as CalendarIcon, 
  BarChart3, 
  Lightbulb, 
  Settings as SettingsIcon, 
  Plus, 
  Search, 
  Bell, 
  HelpCircle, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Edit, 
  Trash2, 
  Menu, 
  LogOut, 
  ArrowRight, 
  Sparkles, 
  Check, 
  Lock, 
  Download, 
  Eye, 
  Zap, 
  Droplet, 
  Wifi, 
  Home, 
  Tv, 
  UserPlus, 
  LogIn, 
  ShieldAlert, 
  RefreshCw,
  TrendingDown,
  User
} from 'lucide-react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInAnonymously,
  updateProfile
} from 'firebase/auth';
import { auth, db } from './firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { loadDemoData } from './utils/demoData';
import { Bill, UserProfile } from './types';
import { 
  subscribeToProfile, 
  updateProfileInDb, 
  subscribeToBills, 
  addBillInDb, 
  updateBillInDb, 
  deleteBillFromDb 
} from './firebaseService';

// Fallback Mock Bills default values for brand-new users
const DEFAULT_PRESET_BILLS: Omit<Bill, 'id'>[] = [
  {
    name: 'Meralco electricity',
    category: 'electricity',
    amount: 4500,
    dueDate: '2023-10-15',
    status: 'Upcoming',
    recurring: true,
    frequency: 'monthly',
    reminder: true,
    reminderDays: 3,
    notes: 'Primary household utility.'
  },
  {
    name: 'Water supply provider',
    category: 'water',
    amount: 850,
    dueDate: '2023-10-25',
    status: 'Due Soon',
    recurring: true,
    frequency: 'monthly',
    reminder: true,
    reminderDays: 3,
    notes: 'Maynilad water supply.'
  },
  {
    name: 'Globe Fiber Plan',
    category: 'internet',
    amount: 1699,
    dueDate: '2023-10-12',
    status: 'Overdue',
    recurring: true,
    frequency: 'monthly',
    reminder: true,
    reminderDays: 3,
    notes: 'Due on the 12th.'
  },
  {
    name: 'Apartment Rent',
    category: 'rent',
    amount: 12000,
    dueDate: '2023-10-05',
    status: 'Paid',
    recurring: true,
    frequency: 'monthly',
    reminder: true,
    reminderDays: 7,
    notes: 'Settled on 5th.'
  }
];

// Utility formatting helpers
const getCategoryLabel = (cat: string) => {
  const map: Record<string, string> = {
    electricity: 'Electricity',
    water: 'Water',
    internet: 'Internet',
    rent: 'Rent / Mortgage',
    insurance: 'Insurance',
    other: 'Other'
  };
  return map[cat] || cat;
};

const getStatusColor = (status: string) => {
  if (status === 'Paid') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'Overdue') return 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';
  if (status === 'Due Soon') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-blue-50 text-blue-700 border-blue-200';
};

export default function App() {

  const navigate = useNavigate();
  const location = useLocation();

  
  // Global Firebase Auth State
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Router views
  const [currentPage, setCurrentPage] = useState<'landing' | 'login' | 'register' | 'app'>('landing');
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'bills' | 'calendar' | 'insights' | 'settings'>('dashboard');

  // Database States
  const [bills, setBills] = useState<Bill[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    fullName: 'Jane Doe',
    email: '',
    currency: 'PHP',
    billingCycleStart: '1',
    twoFactorAuth: false,
    notifyDue: true,
    notifyWeekly: true,
    notifyAI: true,
    role: 'user'
  });

  // Modal controls
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<Bill['category']>('electricity');
  const [formAmount, setFormAmount] = useState('');
  const [formDueDate, setFormDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [formRecurring, setFormRecurring] = useState(true);
  const [formFrequency, setFormFrequency] = useState<Bill['frequency']>('monthly');
  const [formReminder, setFormReminder] = useState(true);
  const [formReminderDays, setFormReminderDays] = useState(3);
  const [formNotes, setFormNotes] = useState('');

  // Mobile drawer status
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // AI intelligence outcomes state
  const [aiTip, setAiTip] = useState<string>('Your electricity utility has increased. Review usage and set reminders correctly.');
  const [isGeneratingTip, setIsGeneratingTip] = useState(false);

  // Calendar states
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth()); // 0-indexed month

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(prev => prev - 1);
    } else {
      setCalendarMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(prev => prev + 1);
    } else {
      setCalendarMonth(prev => prev + 1);
    }
  };

  // Auth Inputs
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Notifications Log
  const [logs, setLogs] = useState<string[]>([
    "Welcome to BantayBills. Connected securely to Firestore.",
    "Click Generate Tips to audit utility patterns."
  ]);

  // Auth state listener
  useEffect(() => {
    let cancelProfileSub: (() => void) | null = null;
    let cancelBillsSub: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Clean up previous listeners if any exist
      if (cancelProfileSub) {
        cancelProfileSub();
        cancelProfileSub = null;
      }
      if (cancelBillsSub) {
        cancelBillsSub();
        cancelBillsSub = null;
      }

      setFirebaseUser(user);
      if (user) {
        setCurrentPage('app');
        
        // Listen to User Preference Profile
        cancelProfileSub = subscribeToProfile(user.uid, async (profile) => {
          if (profile) {
            // Check if the user's email is balutp6@gmail.com and elevate to admin
            const isBalutpAdmin = user.email && user.email.toLowerCase() === 'balutp6@gmail.com';
            if (isBalutpAdmin && profile.role !== 'admin') {
              const elevatedProfile = { ...profile, role: 'admin' as const };
              await updateProfileInDb(user.uid, elevatedProfile);
              setUserProfile(elevatedProfile);
            } else {
              setUserProfile(profile);
            }
          } else {
            // First-time setup default model values
            const isBalutpAdmin = user.email && user.email.toLowerCase() === 'balutp6@gmail.com';
            const initialProfile: UserProfile = {
              fullName: user.displayName || nameInput || (isBalutpAdmin ? 'Balut Admin' : 'Guest user'),
              email: user.email || 'guest@bantaybills.com',
              currency: 'PHP',
              billingCycleStart: '1',
              twoFactorAuth: false,
              notifyDue: true,
              notifyWeekly: true,
              notifyAI: true,
              role: isBalutpAdmin ? 'admin' : 'user'
            };
            await updateProfileInDb(user.uid, initialProfile);
            setUserProfile(initialProfile);

            // Populate some helpful default demo bills in Firestore for high friction onboarding prevention
            for (const preset of DEFAULT_PRESET_BILLS) {
              await addBillInDb(user.uid, preset);
            }
          }
        });

        // Listen to User's actual Bills
        cancelBillsSub = subscribeToBills(user.uid, (fetchedBills) => {
          setBills(fetchedBills);
        });
      } else {
        if (currentPage === 'app') {
          setCurrentPage('landing');
        }
      }
      setAuthLoading(false);
    });

    return () => {
      unsubscribe();
      if (cancelProfileSub) {
        cancelProfileSub();
      }
      if (cancelBillsSub) {
        cancelBillsSub();
      }
    };
  }, [nameInput]);

  // Active dates calculation 
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Global statistical metrics calculations
  const stats = useMemo(() => {
    let paidVal = 0;
    let pendingVal = 0;
    let overdueVal = 0;
    let totalCount = bills.length;
    let completedCount = 0;

    bills.forEach(bill => {
      if (bill.status === 'Paid') {
        paidVal += bill.amount;
        completedCount++;
      } else {
        pendingVal += bill.amount;
        if (bill.status === 'Overdue') {
          overdueVal += bill.amount;
        }
      }
    });

    const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      totalAmount: paidVal + pendingVal,
      paidAmount: paidVal,
      pendingAmount: pendingVal,
      overdueAmount: overdueVal,
      count: totalCount,
      completedCount: completedCount,
      percent: completionPercent
    };
  }, [bills]);

  // Filter bills list based on state search filters
  const filteredBills = useMemo(() => {
    return bills.filter(bill => {
      const matchSearch = bill.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          bill.notes.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = categoryFilter === 'all' || bill.category === categoryFilter;
      const matchStatus = statusFilter === 'all' || bill.status === statusFilter;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [bills, searchQuery, categoryFilter, statusFilter]);

  // Category chart distribution calculation
  const categoryChartStats = useMemo(() => {
    const map: Record<string, number> = {
      electricity: 0,
      water: 0,
      internet: 0,
      rent: 0,
      insurance: 0,
      other: 0
    };
    bills.forEach(b => {
      map[b.category] = (map[b.category] || 0) + b.amount;
    });
    const total = Object.values(map).reduce((sum, v) => sum + v, 0) || 1;
    return Object.keys(map).map(cat => ({
      name: cat,
      amount: map[cat],
      percent: Math.round((map[cat] / total) * 100)
    }));
  }, [bills]);

  // Currency utility helper
  const currencySymbol = useMemo(() => {
    switch (userProfile.currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'PHP': default: return '₱';
    }
  }, [userProfile.currency]);

  // Derived Alerts
  const alerts = useMemo(() => {
    return bills.filter(b => b.status === 'Overdue' || b.status === 'Due Soon');
  }, [bills]);

  // Authenticate triggers
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, emailInput, passwordInput);
      const user = userCredential.user;
      
      // Update display name in Firebase Auth
      await updateProfile(user, { displayName: nameInput });
      
      // Create user profile document in Firestore immediately
      const isBalutpAdmin = user.email && user.email.toLowerCase() === 'balutp6@gmail.com';
      const initialProfile: UserProfile = {
        fullName: nameInput || (isBalutpAdmin ? 'Balut Admin' : 'Guest user'),
        email: user.email || 'guest@bantaybills.com',
        currency: 'PHP',
        billingCycleStart: '1',
        twoFactorAuth: false,
        notifyDue: true,
        notifyWeekly: true,
        notifyAI: true,
        role: isBalutpAdmin ? 'admin' : 'user'
      };
      
      await updateProfileInDb(user.uid, initialProfile);
      setUserProfile(initialProfile);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await signInWithEmailAndPassword(auth, emailInput, passwordInput);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login credentials incorrect');
    }
  };

  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleBypassGuestAccess = async () => {
    setErrorMsg('');
    setIsDemoLoading(true);
    try {
      const cred = await signInAnonymously(auth);
      const user = cred.user;
      
      // Check if this anonymous user already has bills
      const billsRef = collection(db, 'bills');
      const q = query(billsRef, where('userId', '==', user.uid), limit(1));
      const querySnapshot = await getDocs(q);
      
      // If no bills exist, inject demo data immediately
      if (querySnapshot.empty) {
        await loadDemoData(user.uid);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Guest access currently limited');
    } finally {
      setIsDemoLoading(false);
    }
  };

  const handleSingoutTrigger = async () => {
    await signOut(auth);
    setCurrentPage('landing');
    navigate('/');
  };

  // Add & Edit actions
  const triggerAddFlow = (presetDate?: string) => {
    setFormName('');
    setFormCategory('electricity');
    setFormAmount('');
    setFormDueDate(presetDate || new Date().toISOString().split('T')[0]);
    setFormRecurring(true);
    setFormFrequency('monthly');
    setFormReminder(true);
    setFormReminderDays(3);
    setFormNotes('');
    setIsAddModalOpen(true);
  };

  const triggerEditFlow = (bill: Bill) => {
    setSelectedBill(bill);
    setFormName(bill.name);
    setFormCategory(bill.category);
    setFormAmount(bill.amount.toString());
    setFormDueDate(bill.dueDate);
    setFormRecurring(bill.recurring);
    setFormFrequency(bill.frequency);
    setFormReminder(bill.reminder);
    setFormReminderDays(bill.reminderDays);
    setFormNotes(bill.notes);
    setIsEditModalOpen(true);
  };

  const saveNewBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;
    const amountVal = parseFloat(formAmount);
    if (!formName || isNaN(amountVal)) {
      alert("Please provide proper bill details.");
      return;
    }

    // Determine status from due date compared to mock index
    let autoStatus: Bill['status'] = 'Upcoming';
    try {
      const today = new Date();
      const due = new Date(formDueDate);
      if (due < today) {
        autoStatus = 'Overdue';
      } else {
        const diffTime = Math.abs(due.getTime() - today.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 3) {
          autoStatus = 'Due Soon';
        }
      }
    } catch (e) {}

    await addBillInDb(firebaseUser.uid, {
      name: formName,
      category: formCategory,
      amount: amountVal,
      dueDate: formDueDate,
      status: autoStatus,
      recurring: formRecurring,
      frequency: formFrequency,
      reminder: formReminder,
      reminderDays: formReminderDays,
      notes: formNotes
    });

    setIsAddModalOpen(false);
    setLogs(prev => [`New bill "${formName}" created. Saved to Firestore.`, ...prev]);
  };

  const saveUpdatedBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill) return;
    const amountVal = parseFloat(formAmount);
    if (!formName || isNaN(amountVal)) return;

    await updateBillInDb(selectedBill.id, {
      name: formName,
      category: formCategory,
      amount: amountVal,
      dueDate: formDueDate,
      recurring: formRecurring,
      frequency: formFrequency,
      reminder: formReminder,
      reminderDays: formReminderDays,
      notes: formNotes
    });

    setIsEditModalOpen(false);
    setSelectedBill(null);
    setLogs(prev => [`Bill details saved back to Firestore collection.`, ...prev]);
  };

  const handleToggleState = async (bill: Bill) => {
    const realBill = bills.find(b => b.id === bill.id);
    if (!realBill) return;

    if (realBill.recurring) {
      const targetMonth = bill.dueDate.substring(0, 7); // YYYY-MM
      const currentPaidMonths = realBill.paidMonths || [];
      const isCurrentlyPaid = currentPaidMonths.includes(targetMonth);
      
      let newPaidMonths;
      if (isCurrentlyPaid) {
        newPaidMonths = currentPaidMonths.filter(m => m !== targetMonth);
      } else {
        newPaidMonths = [...currentPaidMonths, targetMonth];
      }
      
      await updateBillInDb(bill.id, { paidMonths: newPaidMonths });
      setLogs(prev => [`Toggled "${realBill.name}" for ${targetMonth}.`, ...prev]);
    } else {
      const targetState: Bill['status'] = realBill.status === 'Paid' ? 'Upcoming' : 'Paid';
      await updateBillInDb(bill.id, { status: targetState });
      setLogs(prev => [`Marked "${realBill.name}" as ${targetState}.`, ...prev]);
    }
  };

  const handleDeleteTrigger = async (id: string) => {
    const confirmation = window.confirm("Are you sure you want to delete this bill record from your Firestore database?");
    if (confirmation) {
      await deleteBillFromDb(id);
      setLogs(prev => ["Removed bill record securely.", ...prev]);
    }
  };

  const triggerCallAI = async () => {
    setIsGeneratingTip(true);
    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bills })
      });
      const data = await response.json();
      if (data.insight) {
        setAiTip(data.insight);
      } else {
        setAiTip(`Analyzed ${bills.length} bills. Review subscriptions like Spotify or Globe fiber to trim excess spend.`);
      }
    } catch (error) {
      setAiTip(`BantayBills Smart Suggestion: Your current water utilities tracking has settled nicely. By bundling internet plan with your dynamic rent cycle, you can save ₱350/mo. Avoid premium streaming redundancies.`);
    } finally {
      setIsGeneratingTip(false);
    }
  };

  // Profile preferences save
  const handleUpdatePreference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;
    await updateProfileInDb(firebaseUser.uid, userProfile);
    setLogs(prev => ["Account preferences updated successfully.", ...prev]);
    alert("Profile settings saved successfully.");
  };

  // Calendar cells setup
  const calendarCells = useMemo(() => {
    const days = daysInMonth(calendarYear, calendarMonth);
    const firstDay = firstDayOfMonthIndex(calendarYear, calendarMonth);
    const cells: { day: number | null; dateString: string; billsOnThisDay: Bill[] }[] = [];

    // Empty buffers for calendar start spacing
    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: null, dateString: '', billsOnThisDay: [] });
    }

    const monthBills = getBillsForMonth(bills, calendarYear, calendarMonth + 1);

    for (let d = 1; d <= days; d++) {
      const monthPart = (calendarMonth + 1).toString().padStart(2, '0');
      const dayPart = d.toString().padStart(2, '0');
      const dateStringStr = `${calendarYear}-${monthPart}-${dayPart}`;
      
      const matchedBills = monthBills.filter(b => b.dueDate === dateStringStr);
      cells.push({
        day: d,
        dateString: dateStringStr,
        billsOnThisDay: matchedBills
      });
    }

    return cells;
  }, [calendarYear, calendarMonth, bills]);

  function daysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
  }

  function firstDayOfMonthIndex(year: number, month: number) {
    return new Date(year, month, 1).getDay();
  }

  // Handle Export CSV
  const handleExportCSV = () => {
    const headers = ["Bill Name", "Category", "Amount", "Due Date", "Status", "Recurring", "Frequency", "Notes"];
    const rows = bills.map(b => [
      b.name,
      b.category,
      b.amount,
      b.dueDate,
      b.status,
      b.recurring ? "Yes" : "No",
      b.frequency,
      b.notes
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bantaybills_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const contextValue = {
    bills, userProfile, stats, currencySymbol, categoryChartStats,
    triggerAddFlow, triggerEditFlow, handleToggleState, handleDeleteTrigger, triggerCallAI,
    searchQuery, setSearchQuery, categoryFilter, setCategoryFilter, statusFilter, setStatusFilter,
    aiTip, isGeneratingTip, calendarYear, calendarMonth, handlePrevMonth, handleNextMonth,
    calendarCells, monthNames, getCategoryLabel, getStatusColor,
    setCurrentTab: () => {}, userEmail: firebaseUser?.email || '', handleUpdatePreference, setUserProfile,
    filteredBills,
    handleExportCSV
  };
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#047857]/20 border-t-[#047857] animate-spin"></div>
          <p className="text-sm text-slate-500 font-medium animate-pulse">Loading BantayBills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans antialiased text-[#181d1a] bg-[#F8F9FB] min-h-screen">
      
      {/* ---------------- 1. LANDING MAIN PROMO PAGE ---------------- */}
      {currentPage === 'landing' && (
        <div className="flex flex-col min-h-screen bg-[#f6fbf5]">
          <nav className="sticky top-0 z-50 w-full bg-[#f6fbf5]/80 backdrop-blur-md border-b border-[#bdc9c1] h-16 flex items-center">
            <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#047857] flex items-center justify-center text-white">
                  <CreditCard className="w-5 h-5" />
                </div>
                <span className="font-bold text-2xl text-[#005d42] tracking-tight font-dashboard-title">BantayBills</span>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setCurrentPage('login')}
                  className="bg-[#047857] hover:bg-[#065F46] text-white font-medium text-sm px-4 py-2 rounded-xl transition-all"
                >
                  Log In / Register
                </button>
              </div>
            </div>
          </nav>

          <main className="flex-1">
            {/* Elegant Hero Section */}
            <section className="relative pt-20 pb-24 md:pt-28 md:pb-36 px-6 overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#8bd6b6]/15 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
              <div className="max-w-4xl mx-auto text-center relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f0f5f0] border border-[#bdc9c1] mb-6">
                  <span className="flex h-2 w-2 rounded-full bg-[#047857] animate-pulse"></span>
                  <span className="text-xs font-semibold text-[#3e4943] uppercase tracking-wider">Premium Cloud-Synced Bill Organizer</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[#181d1a] leading-tight mb-6">
                  Never Miss Another <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#005d42] to-[#047857]">Bill Payment.</span>
                </h1>
                <p className="text-lg text-[#3e4943] max-w-2xl mx-auto mb-10">
                  Track recurring utilities, manage monthly obligations, schedule reminders, and audit your household spending using our beautiful calendar.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button 
                    onClick={handleBypassGuestAccess}
                    disabled={isDemoLoading}
                    className="w-full sm:w-auto bg-[#047857] text-white hover:bg-[#065F46] shadow-md transition-all duration-150 px-8 py-4 rounded-xl font-medium text-base flex items-center justify-center gap-2 disabled:opacity-70 disabled:animate-pulse"
                  >
                    {isDemoLoading ? "Loading Workspace..." : "Try Demo Now"}
                    {!isDemoLoading && <ArrowRight className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </section>

            {/* How it Works Module info */}
            <section className="py-20 bg-white border-t border-[#ebefea] px-6">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold text-[#181d1a]">Organized In Three Easy Steps</h2>
                  <p className="text-[#3e4943] mt-2 max-w-lg mx-auto">Get control over bills, subscriptions, and utilities instantly.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Step 1 */}
                  <div className="p-8 rounded-2xl bg-[#f6fbf5] border border-[#ebefea] shadow-sm hover:translate-y-[-4px] transition-transform">
                    <div className="w-12 h-12 bg-emerald-500/10 text-[#047857] rounded-xl flex items-center justify-center mb-6">
                      <Plus className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-[#181d1a]">1. Add Your Bills</h3>
                    <p className="text-[#3e4943] text-sm leading-relaxed">Input utilities like Meralco or subscriptions like Netflix. Specify pay cycle days, rates, and category details.</p>
                  </div>
                  {/* Step 2 */}
                  <div className="p-8 rounded-2xl bg-[#f6fbf5] border border-[#ebefea] shadow-sm hover:translate-y-[-4px] transition-transform">
                    <div className="w-12 h-12 bg-emerald-500/10 text-[#047857] rounded-xl flex items-center justify-center mb-6">
                      <Bell className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-[#181d1a]">2. Schedule Reminders</h3>
                    <p className="text-[#3e4943] text-sm leading-relaxed">Choose when you want to receive alerts before due dates so you never pay late fees again.</p>
                  </div>
                  {/* Step 3 */}
                  <div className="p-8 rounded-2xl bg-[#f6fbf5] border border-[#ebefea] shadow-sm hover:translate-y-[-4px] transition-transform">
                    <div className="w-12 h-12 bg-emerald-500/10 text-[#047857] rounded-xl flex items-center justify-center mb-6">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-[#181d1a]">3. Obtain AI Intelligence</h3>
                    <p className="text-[#3e4943] text-sm leading-relaxed">Audit subscriptions, discover utility leakages, and read custom visual financial insights from Gemini.</p>
                  </div>
                </div>
              </div>
            </section>
          </main>

          <footer className="bg-[#181d1a] text-[#dfe4df]/60 py-12 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-emerald-400" />
                <span className="font-bold text-xl text-white">BantayBills</span>
              </div>
              <p className="text-xs">&copy; 2026 BantayBills. Premium Bill Management.</p>
            </div>
          </footer>
        </div>
      )}

      {/* ---------------- 2. SIGN IN PAGE ---------------- */}
      {currentPage === 'login' && (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#f0f5f0]">
          <div className="w-full max-w-md bg-white border border-[#bdc9c1] rounded-xl p-8 shadow-sm">
            <header className="flex flex-col items-center mb-6 text-center">
              <div className="h-12 w-12 bg-[#047857] rounded-lg flex items-center justify-center text-white mb-3">
                <Receipt className="w-6 h-6" />
              </div>
              <h1 className="font-bold text-3xl font-dashboard-title text-[#005d42] tracking-tight">BantayBills</h1>
              <h2 className="text-[#181d1a] font-medium text-lg mt-2 font-semibold">Welcome back</h2>
            </header>

            {errorMsg && (
              <div className="p-3 mb-4 text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200 rounded-lg">
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
                <input 
                  type="email"
                  required
                  placeholder="jane.doe@example.com"
                  className="w-full px-4 py-2 border border-[#bdc9c1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#047857]/30 text-sm placeholder:text-slate-300"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Password</label>
                </div>
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-[#bdc9c1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#047857]/30 text-sm placeholder:text-slate-300"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                />
              </div>

              <button 
                type="submit"
                className="w-full mt-2 bg-[#047857] text-white py-3 px-4 rounded-xl font-medium text-sm hover:bg-[#065F46] transition-colors shadow-sm"
              >
                Log In
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-[#3e4943]">
                Don't have an account?{' '}
                <button 
                  onClick={() => setCurrentPage('register')}
                  className="text-[#047857] hover:underline font-semibold"
                >
                  Create an account
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- 3. SIGN UP REGISTER PAGE ---------------- */}
      {currentPage === 'register' && (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#f0f5f0]">
          <div className="w-full max-w-md bg-white border border-[#bdc9c1] rounded-xl p-8 shadow-sm">
            <header className="flex flex-col items-center mb-6 text-center">
              <div className="h-10 w-10 bg-primary-container rounded-full flex items-center justify-center text-white mb-3">
                <UserPlus className="w-5 h-5" />
              </div>
              <h1 className="font-bold text-3xl font-dashboard-title text-[#005d42] tracking-tight">BantayBills</h1>
              <h2 className="text-[#181d1a] font-medium text-lg mt-1 font-semibold">Create account</h2>
            </header>

            {errorMsg && (
              <div className="p-3 mb-4 text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200 rounded-lg">
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
                <input 
                  type="text"
                  required
                  placeholder="Jane Doe"
                  className="w-full px-4 py-2 border border-[#bdc9c1] rounded-lg text-sm"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Email address</label>
                <input 
                  type="email"
                  required
                  placeholder="jane@example.com"
                  className="w-full px-4 py-2 border border-[#bdc9c1] rounded-lg text-sm"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Password</label>
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-[#bdc9c1] rounded-lg text-sm"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-[#047857] text-white py-3 px-4 rounded-xl font-medium text-sm hover:bg-[#065F46] flex items-center justify-center gap-1 shadow-sm transition-colors"
              >
                Create Account
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-[#3e4943]">
                Already have an account?{' '}
                <button 
                  onClick={() => setCurrentPage('login')}
                  className="text-[#047857] hover:underline font-semibold"
                >
                  Log in
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- 4. MAIN CLOUD APPLICATION WORKSPACE ---------------- */}
      {currentPage === 'app' && (
        <div className="h-screen flex overflow-hidden">
          
          {/* Permanent Desktop + Collapsible Mobile Sidebar */}
          <nav className={`h-screen w-64 bg-white border-r border-[#bdc9c1] flex flex-col py-6 px-4 z-40 fixed left-0 top-0 transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:block'}`}>
            <div className="mb-8 px-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#047857] flex items-center justify-center text-white">
                <CreditCard className="w-5 h-5" />
              </div>
              <div 
                className="cursor-pointer hover:opacity-80 transition-opacity" 
                onClick={() => { setCurrentPage('landing'); navigate('/'); }}
              >
                <h1 className="font-semibold text-xl text-[#005d42] font-dashboard-title leading-none">BantayBills</h1>
                <p className="text-[10px] text-[#3e4943] font-mono tracking-wider uppercase mt-1">Premium Bill Manager</p>
              </div>
            </div>

            <div className="flex-1 space-y-1">
              <button 
                onClick={() => { navigate('/dashboard'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/dashboard' ? 'text-[#005d42] bg-[#f0f5f0] font-bold border-r-4 border-[#005d42]' : 'text-[#3e4943] hover:bg-slate-50'}`}
              >
                <LayoutDashboard className="w-5 h-5 text-current" />
                Dashboard
              </button>

              <button 
                onClick={() => { navigate('/bills'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/bills' ? 'text-[#005d42] bg-[#f0f5f0] font-bold border-r-4 border-[#005d42]' : 'text-[#3e4943] hover:bg-slate-50'}`}
              >
                <Receipt className="w-5 h-5 text-current" />
                Bills Management
              </button>

              <button 
                onClick={() => { navigate('/calendar'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/calendar' ? 'text-[#005d42] bg-[#f0f5f0] font-bold border-r-4 border-[#005d42]' : 'text-[#3e4943] hover:bg-slate-50'}`}
              >
                <CalendarIcon className="w-5 h-5 text-current" />
                Calendar
              </button>

              <button 
                onClick={() => { navigate('/insights'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/insights' ? 'text-[#005d42] bg-[#f0f5f0] font-bold border-r-4 border-[#005d42]' : 'text-[#3e4943] hover:bg-slate-50'}`}
              >
                <BarChart3 className="w-5 h-5 text-current" />
                Financial Insights
              </button>
            </div>

            <div className="mt-auto pt-6 border-t border-[#ebefea]">
              <button 
                onClick={() => triggerAddFlow()}
                className="w-full flex items-center justify-center gap-2 bg-[#047857] hover:bg-[#065F46] text-white py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm mb-4"
              >
                <Plus className="w-4 h-4" />
                Add New Bill
              </button>

              {firebaseUser?.isAnonymous && (
                <div className="p-3 bg-amber-50 rounded-xl relative overflow-hidden border border-amber-200 text-[11px] mb-3 leading-relaxed">
                  <span className="font-semibold text-amber-900 block mb-0.5">⚠️ Ghost Bypass Access</span>
                  Your changes are saved locally. Registrations will promote to a permanent profile.
                </div>
              )}

              <button 
                onClick={handleSingoutTrigger}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-rose-600 hover:bg-rose-50 transition-colors font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </nav>

          {/* Backdrop container for mobile sidebar */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-[#181d1a]/30 backdrop-blur-xs z-35 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            ></div>
          )}

          {/* Main workspace frame viewport */}
          <div className="flex-1 flex flex-col md:pl-64 w-full h-screen overflow-hidden">
            
            {/* Header section with real-time status */}
            <header className="h-16 w-full px-6 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-[#ebefea] shrink-0 sticky top-0 z-30">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-1 md:hidden hover:bg-slate-100 rounded"
                >
                  <Menu className="w-6 h-6 text-[#181d1a]" />
                </button>
                <h1 className="text-lg font-bold font-dashboard-title text-primary block md:hidden">BantayBills</h1>
                <div className="hidden lg:flex items-center w-64 bg-slate-50 border border-[#ebefea] rounded-full px-4 py-2 text-sm focus-within:border-[#047857] focus-within:ring-2 focus-within:ring-[#047857]/15 transition-all">
                  <Search className="w-4 h-4 text-slate-400 mr-2" />
                  <input 
                    type="text"
                    placeholder="Search bills, cycles..."
                    className="bg-transparent border-none outline-none text-xs w-full text-zinc-800 focus:ring-0 p-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Preferences profile widgets */}
              <div className="flex items-center gap-4">
                
                {/* Bell notification triggers */}
                <div className="relative">
                  <button 
                    onClick={() => setNotificationOpen(!notificationOpen)}
                    className="p-2 text-[#3e4943] hover:text-primary transition-colors relative hover:scale-95 duration-150"
                  >
                    <Bell className="w-5 h-5" />
                    {alerts.length > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white animate-pulse"></span>
                    )}
                  </button>

                  {notificationOpen && (
                    <div className="absolute right-0 mt-3 w-80 bg-white border border-[#bdc9c1] rounded-xl shadow-lg p-4 z-50 text-xs">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-2 font-bold">
                        <span>Action Required</span>
                        <span className="text-slate-400 text-[10px]">{alerts.length} alert(s)</span>
                      </div>
                      {alerts.length === 0 ? (
                        <div className="py-4 text-center space-y-1">
                          <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                          <p className="text-slate-600 font-medium">You're all caught up!</p>
                          <p className="text-slate-400 text-[10px]">No bills are currently overdue or due soon.</p>
                        </div>
                      ) : (
                        <ul className="space-y-2 max-h-64 overflow-auto scrollbar-thin">
                          {alerts.map((alert) => (
                            <li key={alert.id} className="flex gap-3 items-start text-slate-700 bg-slate-50 border border-slate-100 p-2.5 rounded-lg">
                              {alert.status === 'Overdue' ? (
                                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                              ) : (
                                <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1 space-y-0.5">
                                <div className="flex justify-between items-start">
                                  <p className="font-bold text-[#181d1a] leading-tight">{alert.name}</p>
                                  <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border ${getStatusColor(alert.status)}`}>
                                    {alert.status}
                                  </span>
                                </div>
                                <p className="text-slate-500 text-[10px] font-medium">
                                  {currencySymbol}{alert.amount.toLocaleString()} due on {alert.dueDate}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>

                {/* Account info trigger */}
                <div 
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => navigate('/settings')}
                >
                  <span className="text-xs font-semibold text-[#181d1a] hidden sm:flex items-center gap-1.5 group-hover:text-primary transition-colors">
                    {userProfile.fullName}
                    {userProfile.role === 'admin' && (
                      <span className="bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                        Admin
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </header>

            {/* Scrollable workspace viewport frame */}
            <main className="flex-1 overflow-y-auto p-6 bg-[#F8F9FB]">
              <div className="w-full mx-auto space-y-6">
                
                {/* ---------------- TABS MATRIX ---------------- */}
                <AppContext.Provider value={contextValue}>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* TAB 1: DASHBOARD OVERVIEW */}
                <Route path="/dashboard" element={<Dashboard />} />
{/* TAB 2: BILLS MANAGEMENT TABLE VIEW */}
                <Route path="/bills" element={<Bills />} />
{/* TAB 3: CALENDAR VIEW */}
                <Route path="/calendar" element={<Calendar />} />
{/* TAB 4: FINANCIAL INSIGHTS SECTION */}
                <Route path="/insights" element={<Insights />} />
                  </Routes>
                </AppContext.Provider>

              </div>
            </main>
          </div>

          {/* ---------------- 5. ADD / EDIT BILL DIALOG MODALS ---------------- */}
          
          {/* Add Bill Modal */}
          {isAddModalOpen && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-[#bdc9c1] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
                  <h3 className="font-bold text-base text-[#181d1a]">Add New Bill</h3>
                  <button 
                    onClick={() => setIsAddModalOpen(false)}
                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={saveNewBill} className="p-6 space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-600 block">Bill Name</label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g., Meralco Utilities"
                        className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-[#047857]"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-600 block">Category</label>
                      <select 
                        className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-[#047857] capitalize"
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value as any)}
                      >
                        <option value="electricity">Electricity</option>
                        <option value="water">Water</option>
                        <option value="internet">Internet</option>
                        <option value="rent">Rent / Mortgage</option>
                        <option value="insurance">Insurance</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-600 block">Amount ({currencySymbol})</label>
                      <input 
                        type="number"
                        required
                        placeholder="0.00"
                        min="0.1"
                        step="0.01"
                        className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-[#047857]"
                        value={formAmount}
                        onChange={(e) => setFormAmount(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-600 block">Due Date</label>
                      <input 
                        type="date"
                        required
                        className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-[#047857]"
                        value={formDueDate}
                        onChange={(e) => setFormDueDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-700 block mb-0.5">Recurring Bill</span>
                        <span className="text-[11px] text-slate-400">Automatically repeat this schedule</span>
                      </div>
                      <input 
                        type="checkbox"
                        className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                        checked={formRecurring}
                        onChange={(e) => setFormRecurring(e.target.checked)}
                      />
                    </div>
                    {formRecurring && (
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-center">
                        {['monthly', 'quarterly', 'yearly'].map(freq => (
                          <button 
                            key={freq}
                            type="button"
                            onClick={() => setFormFrequency(freq as any)}
                            className={`p-1.5 rounded-lg border text-[11px] font-bold capitalize transition-all ${formFrequency === freq ? 'bg-[#005d42] border-[#005d42] text-white' : 'border-slate-200 hover:bg-slate-100 text-slate-600'}`}
                          >
                            {freq}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-700 block mb-0.5">Set Reminder Alert</span>
                      <span className="text-[11px] text-slate-400">Notify user via dashboard notification banner</span>
                    </div>
                    <input 
                      type="checkbox"
                      className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                      checked={formReminder}
                      onChange={(e) => setFormReminder(e.target.checked)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-600 block">Notes (Optional)</label>
                    <textarea 
                      placeholder="Enter bank reference or settlement instructions..."
                      rows={2}
                      className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-[#047857]"
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                    <button 
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2 border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-6 py-2 bg-[#047857] hover:bg-[#065F46] text-white font-bold rounded-lg transition-colors shadow-sm"
                    >
                      Save Bill
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Bill Modal */}
          {isEditModalOpen && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-[#bdc9c1] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
                  <h3 className="font-bold text-base text-[#181d1a]">Edit Bill</h3>
                  <button 
                    onClick={() => setIsEditModalOpen(false)}
                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={saveUpdatedBill} className="p-6 space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-600 block">Bill Name</label>
                      <input 
                        type="text"
                        required
                        className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-[#047857]"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-600 block">Category</label>
                      <select 
                        className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-[#047857] capitalize"
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value as any)}
                      >
                        <option value="electricity">Electricity</option>
                        <option value="water">Water</option>
                        <option value="internet">Internet</option>
                        <option value="rent">Rent / Mortgage</option>
                        <option value="insurance">Insurance</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-600 block">Amount ({currencySymbol})</label>
                      <input 
                        type="number"
                        required
                        step="0.01"
                        className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-[#047857]"
                        value={formAmount}
                        onChange={(e) => setFormAmount(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-600 block">Due Date</label>
                      <input 
                        type="date"
                        required
                        className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-[#047857]"
                        value={formDueDate}
                        onChange={(e) => setFormDueDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-700 block mb-0.5">Recurring Bill</span>
                        <span className="text-[11px] text-slate-400">Automatically repeat this schedule</span>
                      </div>
                      <input 
                        type="checkbox"
                        className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                        checked={formRecurring}
                        onChange={(e) => setFormRecurring(e.target.checked)}
                      />
                    </div>
                    {formRecurring && (
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-center">
                        {['monthly', 'quarterly', 'yearly'].map(freq => (
                          <button 
                            key={freq}
                            type="button"
                            onClick={() => setFormFrequency(freq as any)}
                            className={`p-1.5 rounded-lg border text-[11px] font-bold capitalize transition-all ${formFrequency === freq ? 'bg-[#005d42] border-[#005d42] text-white' : 'border-slate-200 hover:bg-slate-100 text-slate-600'}`}
                          >
                            {freq}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-700 block mb-0.5">Set Reminder Alert</span>
                      <span className="text-[11px] text-slate-400">Notify user via dashboard notification banner</span>
                    </div>
                    <input 
                      type="checkbox"
                      className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                      checked={formReminder}
                      onChange={(e) => setFormReminder(e.target.checked)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-600 block">Notes (Optional)</label>
                    <textarea 
                      rows={2}
                      className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-[#047857]"
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                    <button 
                      type="button"
                      onClick={() => {
                        if (selectedBill) {
                          handleDeleteTrigger(selectedBill.id);
                          setIsEditModalOpen(false);
                        }
                      }}
                      className="px-4 py-2 bg-rose-50 border border-rose-200 rounded-lg font-bold text-rose-600 hover:bg-rose-100 transition-colors"
                    >
                      Delete Bill
                    </button>
                    <div className="flex gap-3">
                      <button 
                        type="button"
                        onClick={() => setIsEditModalOpen(false)}
                        className="px-4 py-2 border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="px-6 py-2 bg-[#047857] hover:bg-[#065F46] text-white font-bold rounded-lg transition-colors shadow-sm"
                      >
                        Save Improvements
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
