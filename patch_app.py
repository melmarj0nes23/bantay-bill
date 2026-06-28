import re
import os

def main():
    file_path = "src/App.tsx"
    with open(file_path, "r") as f:
        content = f.read()

    # 1. Imports
    if "import { Expense }" not in content:
        content = content.replace("import { Bill, UserProfile } from './types';", "import { Bill, Expense, UserProfile } from './types';")
    if "subscribeToExpenses" not in content:
        content = content.replace("subscribeToBills,", "subscribeToBills,\n  subscribeToExpenses,")
    if "import Expenses from" not in content:
        content = content.replace("import Privacy from './pages/Privacy';", "import Privacy from './pages/Privacy';\nimport Expenses from './pages/Expenses';")
    if "import { \n  ArrowLeft" not in content:
        # Check if Wallet is imported
        if "Wallet" not in content:
            content = content.replace("  CreditCard,", "  CreditCard,\n  Wallet,")
            
    # 2. State
    if "const [expenses, setExpenses]" not in content:
        content = content.replace("const [bills, setBills] = useState<Bill[]>([]);", "const [bills, setBills] = useState<Bill[]>([]);\n  const [expenses, setExpenses] = useState<Expense[]>([]);")
        
    # 3. Sidebar Tab Type
    content = content.replace("const [currentTab, setCurrentTab] = useState<'dashboard' | 'bills' | 'calendar' | 'insights' | 'settings'>", "const [currentTab, setCurrentTab] = useState<'dashboard' | 'bills' | 'expenses' | 'calendar' | 'insights' | 'settings'>")

    # 4. Auth useEffect (Finding the block)
    # The block looks like:
    #         const unsubBills = subscribeToBills(user.uid, (data) => {
    #           setBills(data);
    #         });
    auth_sub = """        const unsubBills = subscribeToBills(user.uid, (data) => {
          setBills(data);
        });"""
    auth_sub_new = """        const unsubBills = subscribeToBills(user.uid, (data) => {
          setBills(data);
        });
        const unsubExpenses = subscribeToExpenses(user.uid, (data) => {
          setExpenses(data);
        });"""
    content = content.replace(auth_sub, auth_sub_new)

    auth_unsub = "return () => {\n          unsubProfile();\n          unsubBills();\n        };"
    auth_unsub_new = "return () => {\n          unsubProfile();\n          unsubBills();\n          unsubExpenses();\n        };"
    content = content.replace(auth_unsub, auth_unsub_new)

    # 5. Context Provider Value
    context_val = "      bills,"
    context_val_new = "      bills,\n      expenses,"
    # Only replace first occurrence in context block
    parts = content.split("const contextValue: AppContextType = {")
    if len(parts) == 2:
        parts[1] = parts[1].replace(context_val, context_val_new, 1)
        content = parts[0] + "const contextValue: AppContextType = {" + parts[1]

    # 6. Routes
    route_tag = """<Route path="/bills" element={<Bills />} />"""
    route_tag_new = """<Route path="/bills" element={<Bills />} />\n                    <Route path="/expenses" element={<Expenses />} />"""
    content = content.replace(route_tag, route_tag_new)

    # 7. Sidebar Navigation
    nav_bills = """              <button 
                onClick={() => { navigate('/bills'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/bills' ? 'text-[#005d42] bg-[#f0f5f0] font-bold border-r-4 border-[#005d42]' : 'text-[#3e4943] hover:bg-slate-50'}`}
              >
                <Receipt className="w-5 h-5 text-current" />
                Bills Management
              </button>"""
    
    nav_expenses = """
              <button 
                onClick={() => { navigate('/expenses'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/expenses' ? 'text-[#005d42] bg-[#f0f5f0] font-bold border-r-4 border-[#005d42]' : 'text-[#3e4943] hover:bg-slate-50'}`}
              >
                <Wallet className="w-5 h-5 text-current" />
                Personal Expenses
              </button>"""
    
    content = content.replace(nav_bills, nav_bills + nav_expenses)

    with open(file_path, "w") as f:
        f.write(content)
        
    print("App.tsx patched.")

if __name__ == "__main__":
    main()
