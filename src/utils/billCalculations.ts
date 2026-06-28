import { Bill, Expense } from '../types';

/**
 * Helper to compute the dynamic status of a bill for a specific occurrence date.
 */
export function getComputedBillStatus(bill: Bill, occurrenceDateStr: string): Bill['status'] {
  if (bill.recurring) {
    const yyyyMm = occurrenceDateStr.substring(0, 7); // e.g., "2026-06"
    if (bill.paidMonths && bill.paidMonths.includes(yyyyMm)) {
      return 'Paid';
    }
  }
  
  // If not paid, or not recurring but base status is not Paid, calculate Overdue/Upcoming
  // For non-recurring, if the base status is Paid, it stays Paid.
  if (!bill.recurring && bill.status === 'Paid') {
    return 'Paid';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(occurrenceDateStr);
  targetDate.setHours(0, 0, 0, 0);
  
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Overdue';
  if (diffDays <= 3) return 'Due Soon';
  return 'Upcoming';
}

/**
 * Helper to check if a bill falls on a given exact day.
 * Includes recurring bills logic mapping from original dates to target months.
 */
export function isBillDueOnDate(bill: Bill, cYear: number, cMonth: number, cDay: number, daysInTargetMonth: number): boolean {
  const monthPart = cMonth.toString().padStart(2, '0');
  const dayPart = cDay.toString().padStart(2, '0');
  const dateStringStr = `${cYear}-${monthPart}-${dayPart}`;

  if (bill.dueDate === dateStringStr) return true;

  if (bill.recurring) {
    const [bYear, bMonth, bDay] = bill.dueDate.split('-').map(Number);
    
    let targetDay = bDay;
    if (bDay > daysInTargetMonth) targetDay = daysInTargetMonth;

    if (cYear > bYear || (cYear === bYear && cMonth > bMonth) || (cYear === bYear && cMonth === bMonth && cDay >= bDay)) {
       if (cDay === targetDay) {
          const monthDiff = (cYear - bYear) * 12 + (cMonth - bMonth);
          if (bill.frequency === 'monthly') return monthDiff > 0;
          if (bill.frequency === 'quarterly') return monthDiff > 0 && monthDiff % 3 === 0;
          if (bill.frequency === 'yearly') return monthDiff > 0 && monthDiff % 12 === 0;
       }
    }
  }
  return false;
}

/**
 * Returns all bills that fall anywhere within the given target month/year.
 * Handles recurring bills by iterating over the days of the month.
 * Returns CLONED bill objects with overridden dueDate and status for that specific occurrence.
 */
export function getBillsForMonth(bills: Bill[], cYear: number, cMonth: number): Bill[] {
  const daysInMonth = new Date(cYear, cMonth, 0).getDate();
  const matched: Bill[] = [];
  
  for (const b of bills) {
    if (!b.recurring) {
       const [bYear, bMonth] = b.dueDate.split('-').map(Number);
       if (bYear === cYear && bMonth === cMonth) {
          matched.push({ ...b }); // Clone to prevent mutation
       }
       continue;
    }
    
    // For recurring bills, check if it lands on any day in this month
    for (let d = 1; d <= daysInMonth; d++) {
       if (isBillDueOnDate(b, cYear, cMonth, d, daysInMonth)) {
         const monthPart = cMonth.toString().padStart(2, '0');
         const dayPart = d.toString().padStart(2, '0');
         const occurrenceDateStr = `${cYear}-${monthPart}-${dayPart}`;
         
         const computedStatus = getComputedBillStatus(b, occurrenceDateStr);
         
         matched.push({
           ...b,
           dueDate: occurrenceDateStr,
           status: computedStatus
         });
         break;
       }
    }
  }
  return matched;
}

export function computeStats(bills: Bill[], expenses: Expense[] = []) {
  let total = 0, paid = 0, pending = 0, overdue = 0;
  let billsTotalAmount = 0;
  let expensesTotalAmount = 0;

  bills.forEach(b => {
    total += b.amount;
    billsTotalAmount += b.amount;
    if (b.status === 'Paid') paid += b.amount;
    if (b.status === 'Upcoming' || b.status === 'Due Soon') pending += b.amount;
    if (b.status === 'Overdue') overdue += b.amount;
  });
  expenses.forEach(e => {
    total += e.amount;
    expensesTotalAmount += e.amount;
    paid += e.amount;
  });
  return {
    totalAmount: total, paidAmount: paid, pendingAmount: pending, overdueAmount: overdue,
    billsTotalAmount, expensesTotalAmount,
    percent: total > 0 ? Math.round((paid / total) * 100) : 0,
    completedCount: bills.filter(b => b.status === 'Paid').length + expenses.length,
    count: bills.length + expenses.length
  };
}
