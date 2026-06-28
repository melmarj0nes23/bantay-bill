import { addBillInDb, addExpenseInDb } from '../firebaseService';
import { Bill, Expense } from '../types';

export const loadDemoData = async (userId: string) => {
  const now = new Date();
  
  // Helper to format dates YYYY-MM-DD
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getRelativeDate = (daysOffset: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + daysOffset);
    return formatDate(d);
  };

  const getPreviousMonthDate = (daysOffset: number) => {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 1);
    d.setDate(d.getDate() + daysOffset);
    return formatDate(d);
  };

  // Generate realistic Philippine Peso data
  const demoBills: Omit<Bill, 'id'>[] = [
    {
      name: 'Meralco',
      amount: 4500,
      dueDate: getRelativeDate(3), // Due in 3 days
      category: 'electricity',
      status: 'Upcoming',
      recurring: true,
      frequency: 'monthly',
      reminder: true, reminderDays: 3, notes: 'Demo Data: Electricity bill usually peaks in summer.',
      paidMonths: []
    },
    {
      name: 'Manila Water',
      amount: 850,
      dueDate: getRelativeDate(12), // Due in 12 days
      category: 'water',
      status: 'Upcoming',
      recurring: true,
      frequency: 'monthly',
      reminder: true, reminderDays: 3, notes: 'Demo Data: Water utility.',
      paidMonths: []
    },
    {
      name: 'Converge ICT',
      amount: 1500,
      dueDate: getPreviousMonthDate(0), // Due today but last month
      category: 'internet',
      status: 'Paid',
      recurring: true,
      frequency: 'monthly',
      reminder: true, reminderDays: 3, notes: 'Demo Data: Fiber internet.',
      // Mark as paid for the previous month
      paidMonths: [getPreviousMonthDate(0).substring(0, 7)] 
    },
    {
      name: 'Apartment Rent',
      amount: 15000,
      dueDate: getRelativeDate(5),
      category: 'rent',
      status: 'Paid',
      recurring: true,
      frequency: 'monthly',
      reminder: true, reminderDays: 3, notes: 'Demo Data: Monthly lease.',
      paidMonths: [now.toISOString().substring(0, 7)] // Paid for current month
    },
    {
      name: 'Netflix Premium',
      amount: 549,
      dueDate: getRelativeDate(-2), // Overdue by 2 days
      category: 'other',
      status: 'Overdue',
      recurring: true,
      frequency: 'monthly',
      reminder: true, reminderDays: 3, notes: 'Demo Data: Family plan subscription.',
      paidMonths: []
    },
    {
      name: 'Car Insurance',
      amount: 3200,
      dueDate: getRelativeDate(25),
      category: 'insurance',
      status: 'Upcoming',
      recurring: false, frequency: "monthly",
      reminder: true, reminderDays: 3, notes: 'Demo Data: Annual comprehensive insurance.',
      paidMonths: []
    },
    {
      name: 'Globe Mobile',
      amount: 1299,
      dueDate: getRelativeDate(8),
      category: 'internet',
      status: 'Paid',
      recurring: true,
      frequency: 'monthly',
      reminder: true, reminderDays: 3, notes: 'Demo Data: Postpaid plan.',
      paidMonths: [now.toISOString().substring(0, 7)]
    },
    {
      name: 'Spotify Family',
      amount: 214,
      dueDate: getRelativeDate(15),
      category: 'other',
      status: 'Upcoming',
      recurring: true,
      frequency: 'monthly',
      reminder: false, reminderDays: 3, notes: 'Demo Data: Music streaming.',
      paidMonths: []
    },
    {
      name: 'Credit Card (BPI)',
      amount: 5500,
      dueDate: getRelativeDate(-5),
      category: 'other',
      status: 'Overdue',
      recurring: true,
      frequency: 'monthly',
      reminder: true, reminderDays: 5, notes: 'Demo Data: Monthly statement balance.',
      paidMonths: []
    }
  ];

  const demoExpenses: Omit<Expense, 'id'>[] = [
    {
      name: 'Jollibee Delivery',
      amount: 450,
      date: getRelativeDate(-1),
      category: 'food',
      notes: 'Demo Data: Late night snack.'
    },
    {
      name: 'Grab Ride to Office',
      amount: 320,
      date: getRelativeDate(0),
      category: 'transport',
      notes: 'Demo Data: Morning commute rush.'
    },
    {
      name: 'Uniqlo Shirts',
      amount: 1980,
      date: getRelativeDate(-3),
      category: 'shopping',
      notes: 'Demo Data: Office wear update.'
    },
    {
      name: 'SM Cinema Tickets',
      amount: 700,
      date: getRelativeDate(-5),
      category: 'entertainment',
      notes: 'Demo Data: Weekend movie.'
    },
    {
      name: 'Mercury Drug',
      amount: 550,
      date: getRelativeDate(-2),
      category: 'health',
      notes: 'Demo Data: Vitamins and supplements.'
    },
    {
      name: 'Coursera Subscription',
      amount: 2500,
      date: getRelativeDate(-10),
      category: 'education',
      notes: 'Demo Data: Monthly learning.'
    },
    {
      name: 'Coffee Shop Meeting',
      amount: 350,
      date: getRelativeDate(-4),
      category: 'food',
      notes: 'Demo Data: Client sync.'
    }
  ];

  const billPromises = demoBills.map(bill => addBillInDb(userId, bill));
  const expensePromises = demoExpenses.map(exp => addExpenseInDb(userId, exp));
  
  await Promise.all([...billPromises, ...expensePromises]);
};
