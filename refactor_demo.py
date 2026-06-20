import os

def main():
    # 1. Create src/utils/demoData.ts
    demo_data_content = """import { addBillInDb } from '../firebaseService';
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
      isRecurring: true,
      recurringFrequency: 'monthly',
      notes: 'Demo Data: Electricity bill usually peaks in summer.',
      paidMonths: []
    },
    {
      name: 'Manila Water',
      amount: 850,
      dueDate: getRelativeDate(12), // Due in 12 days
      category: 'water',
      status: 'Upcoming',
      isRecurring: true,
      recurringFrequency: 'monthly',
      notes: 'Demo Data: Water utility.',
      paidMonths: []
    },
    {
      name: 'Converge ICT',
      amount: 1500,
      dueDate: getPreviousMonthDate(0), // Due today but last month
      category: 'internet',
      status: 'Paid',
      isRecurring: true,
      recurringFrequency: 'monthly',
      notes: 'Demo Data: Fiber internet.',
      // Mark as paid for the previous month
      paidMonths: [getPreviousMonthDate(0).substring(0, 7)] 
    },
    {
      name: 'Apartment Rent',
      amount: 15000,
      dueDate: getRelativeDate(5),
      category: 'rent',
      status: 'Paid',
      isRecurring: true,
      recurringFrequency: 'monthly',
      notes: 'Demo Data: Monthly lease.',
      paidMonths: [now.toISOString().substring(0, 7)] // Paid for current month
    },
    {
      name: 'Netflix Premium',
      amount: 549,
      dueDate: getRelativeDate(-2), // Overdue by 2 days
      category: 'other',
      status: 'Overdue',
      isRecurring: true,
      recurringFrequency: 'monthly',
      notes: 'Demo Data: Family plan subscription.',
      paidMonths: []
    },
    {
      name: 'Car Insurance',
      amount: 3200,
      dueDate: getRelativeDate(25),
      category: 'insurance',
      status: 'Upcoming',
      isRecurring: false,
      notes: 'Demo Data: Annual comprehensive insurance.',
      paidMonths: []
    }
  ];

  const promises = demoBills.map(bill => addBillInDb(userId, bill));
  await Promise.all(promises);
};
"""
    with open("src/utils/demoData.ts", "w") as f:
        f.write(demo_data_content)

    # 2. Update AppContext.tsx
    app_context_file = "src/context/AppContext.tsx"
    with open(app_context_file, "r") as f:
        content = f.read()
    
    # Import
    if "import { loadDemoData }" not in content:
        content = content.replace(
            "import { getBillsForMonth, computeStats } from '../utils/billCalculations';",
            "import { getBillsForMonth, computeStats } from '../utils/billCalculations';\nimport { loadDemoData } from '../utils/demoData';"
        )

    # State
    if "isGeneratingDemo" not in content:
        content = content.replace(
            "const [isGeneratingTip, setIsGeneratingTip] = useState(false);",
            "const [isGeneratingTip, setIsGeneratingTip] = useState(false);\n  const [isGeneratingDemo, setIsGeneratingDemo] = useState(false);"
        )

    # Function
    demo_func = """
  const handleLoadDemoData = async () => {
    if (!currentUser) return;
    setIsGeneratingDemo(true);
    try {
      await loadDemoData(currentUser.uid);
    } catch (error) {
      console.error("Error loading demo data:", error);
    } finally {
      setIsGeneratingDemo(false);
    }
  };
"""
    if "handleLoadDemoData" not in content:
        content = content.replace(
            "const handleExportCSV = () => {",
            demo_func + "\n  const handleExportCSV = () => {"
        )

    # Expose in context
    if "handleLoadDemoData: () => Promise<void>;" not in content:
        content = content.replace(
            "handleExportCSV: () => void;",
            "handleExportCSV: () => void;\n  handleLoadDemoData: () => Promise<void>;\n  isGeneratingDemo: boolean;"
        )
        content = content.replace(
            "handleExportCSV,\n",
            "handleExportCSV,\n    handleLoadDemoData,\n    isGeneratingDemo,\n"
        )
    
    with open(app_context_file, "w") as f:
        f.write(content)

    # 3. Update Dashboard.tsx Empty State
    dash_file = "src/pages/Dashboard.tsx"
    with open(dash_file, "r") as f:
        dash_content = f.read()
        
    dash_empty_state = """                      {bills.length === 0 ? (
                        <div className="py-20 text-center text-slate-400 text-xs">
                          <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          No active subscriptions or bills tracked for this cycle.
                        </div>
                      ) : ("""
                      
    new_dash_empty_state = """                      {bills.length === 0 ? (
                        <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center">
                          <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p className="mb-4">No active subscriptions or bills tracked for this cycle.</p>
                          <button 
                            onClick={handleLoadDemoData}
                            disabled={isGeneratingDemo}
                            className="bg-emerald-50 text-[#005d42] border border-[#005d42]/20 hover:bg-emerald-100 font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
                          >
                            <Sparkles className="w-4 h-4" />
                            {isGeneratingDemo ? "Generating..." : "Load Demo Data"}
                          </button>
                        </div>
                      ) : ("""
    
    dash_content = dash_content.replace(dash_empty_state, new_dash_empty_state)
    dash_content = dash_content.replace(
        "} = useAppContext();",
        ", handleLoadDemoData, isGeneratingDemo } = useAppContext();"
    )
    
    with open(dash_file, "w") as f:
        f.write(dash_content)
        
    # 4. Update Bills.tsx Empty State
    bills_file = "src/pages/Bills.tsx"
    with open(bills_file, "r") as f:
        bills_content = f.read()
        
    bills_empty_state = """                      {filteredBills.length === 0 ? (
                        <div className="text-center py-16 text-slate-400 text-xs flex flex-col items-center justify-center">
                          <Receipt className="w-12 h-12 mb-3 text-slate-200" />
                          No bills match the selected parameters.
                        </div>
                      ) : ("""
                      
    new_bills_empty_state = """                      {filteredBills.length === 0 ? (
                        <div className="text-center py-16 text-slate-400 text-xs flex flex-col items-center justify-center">
                          <Receipt className="w-12 h-12 mb-3 text-slate-200" />
                          <p className="mb-4">No bills match the selected parameters.</p>
                          {bills.length === 0 && (
                            <button 
                              onClick={handleLoadDemoData}
                              disabled={isGeneratingDemo}
                              className="bg-emerald-50 text-[#005d42] border border-[#005d42]/20 hover:bg-emerald-100 font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
                            >
                              <Sparkles className="w-4 h-4" />
                              {isGeneratingDemo ? "Generating..." : "Load Demo Data"}
                            </button>
                          )}
                        </div>
                      ) : ("""
                      
    bills_content = bills_content.replace(bills_empty_state, new_bills_empty_state)
    if "handleLoadDemoData" not in bills_content:
        bills_content = bills_content.replace(
            "handleExportCSV } = useAppContext();",
            "handleExportCSV, handleLoadDemoData, isGeneratingDemo } = useAppContext();"
        )
    
    with open(bills_file, "w") as f:
        f.write(bills_content)

if __name__ == "__main__":
    main()
