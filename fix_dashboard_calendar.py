import os

def main():
    app_file = "src/pages/Dashboard.tsx"
    with open(app_file, "r") as f:
        content = f.read()

    # 1. Remove calendarCells from useAppContext since we will compute it locally
    content = content.replace("calendarCells, getCategoryLabel", "getCategoryLabel")

    # 2. Add dashboardCalendarCells useMemo right after dashboardBills
    new_memo = """
  const dashboardCalendarCells = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const cells: { day: number | null; dateString: string; billsOnThisDay: any[] }[] = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: null, dateString: '', billsOnThisDay: [] });
    }

    for (let d = 1; d <= days; d++) {
      const monthPart = (month + 1).toString().padStart(2, '0');
      const dayPart = d.toString().padStart(2, '0');
      const dateStringStr = `${year}-${monthPart}-${dayPart}`;
      
      const matchedBills = dashboardBills.filter(b => b.dueDate === dateStringStr);
      cells.push({
        day: d,
        dateString: dateStringStr,
        billsOnThisDay: matchedBills
      });
    }

    return cells;
  }, [selectedDate, dashboardBills]);
"""
    
    # insert it before `const dashboardStats`
    content = content.replace("  const dashboardStats =", new_memo + "\n  const dashboardStats =")

    # 3. Fix the chevron arrows
    old_left = '<ChevronLeft className="w-4 h-4 cursor-pointer hover:text-slate-800" />'
    new_left = '<ChevronLeft className="w-4 h-4 cursor-pointer hover:text-slate-800" onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))} />'
    
    old_right = '<ChevronRight className="w-4 h-4 cursor-pointer hover:text-slate-800" />'
    new_right = '<ChevronRight className="w-4 h-4 cursor-pointer hover:text-slate-800" onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))} />'
    
    content = content.replace(old_left, new_left)
    content = content.replace(old_right, new_right)

    # 4. Map over dashboardCalendarCells instead of calendarCells
    content = content.replace("{calendarCells.map((cell, idx) => {", "{dashboardCalendarCells.map((cell, idx) => {")

    with open(app_file, "w") as f:
        f.write(content)

if __name__ == "__main__":
    main()
