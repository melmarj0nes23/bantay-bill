export interface Bill {
  id: string;
  name: string;
  category: 'electricity' | 'water' | 'internet' | 'rent' | 'insurance' | 'other';
  amount: number;
  dueDate: string; // YYYY-MM-DD
  status: 'Paid' | 'Upcoming' | 'Due Soon' | 'Overdue';
  recurring: boolean;
  frequency: 'monthly' | 'quarterly' | 'yearly';
  paidMonths?: string[]; // Array of YYYY-MM
  reminder: boolean;
  reminderDays: number;
  notes: string;
}

export interface UserProfile {
  fullName: string;
  email: string;
  currency: 'PHP' | 'USD' | 'EUR' | 'GBP';
  billingCycleStart: string;
  twoFactorAuth: boolean;
  notifyDue: boolean;
  notifyWeekly: boolean;
  notifyAI: boolean;
  role?: 'admin' | 'user';
  pushSubscriptions?: any[];
}
