import { addBillInDb } from '../firebaseService';
import { Bill } from '../types';

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

  const promises = demoBills.map(bill => addBillInDb(userId, bill));
  await Promise.all(promises);
};
