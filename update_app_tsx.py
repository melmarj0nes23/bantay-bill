import os

def main():
    app_path = "src/App.tsx"
    with open(app_path, "r") as f:
        content = f.read()

    # 1. Ensure `getBillsForMonth` is imported if not already
    if "getBillsForMonth" not in content:
        content = content.replace(
            "import { isBillDueOnDate } from './utils/billCalculations';",
            "import { isBillDueOnDate, getBillsForMonth } from './utils/billCalculations';"
        )

    # 2. Update handleToggleState
    old_toggle = """  const handleToggleState = async (bill: Bill) => {
    const targetState: Bill['status'] = bill.status === 'Paid' ? 'Upcoming' : 'Paid';
    await updateBillInDb(bill.id, { status: targetState });
    setLogs(prev => [`Marked "${bill.name}" as ${targetState}.`, ...prev]);
  };"""
    
    new_toggle = """  const handleToggleState = async (bill: Bill) => {
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
  };"""

    content = content.replace(old_toggle, new_toggle)

    # 3. Update calendarCells
    old_calendar = """  // Calendar cells setup
  const calendarCells = useMemo(() => {
    const days = daysInMonth(calendarYear, calendarMonth);
    const firstDay = firstDayOfMonthIndex(calendarYear, calendarMonth);
    const cells: { day: number | null; dateString: string; billsOnThisDay: Bill[] }[] = [];

    // Empty buffers for calendar start spacing
    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: null, dateString: '', billsOnThisDay: [] });
    }

    for (let d = 1; d <= days; d++) {
      const monthPart = (calendarMonth + 1).toString().padStart(2, '0');
      const dayPart = d.toString().padStart(2, '0');
      const dateStringStr = `${calendarYear}-${monthPart}-${dayPart}`;
      
      const matchedBills = bills.filter(b => isBillDueOnDate(b, calendarYear, calendarMonth + 1, d, days));
      cells.push({
        day: d,
        dateString: dateStringStr,
        billsOnThisDay: matchedBills
      });
    }

    return cells;
  }, [calendarYear, calendarMonth, bills]);"""

    new_calendar = """  // Calendar cells setup
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
  }, [calendarYear, calendarMonth, bills]);"""

    content = content.replace(old_calendar, new_calendar)

    with open(app_path, "w") as f:
        f.write(content)

if __name__ == "__main__":
    main()
