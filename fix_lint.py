import re

def main():
    # Fix App.tsx Wallet import
    with open("src/App.tsx", "r") as f:
        app_content = f.read()
    
    if "Wallet," not in app_content and "Wallet }" not in app_content:
        # Just inject it into the lucide-react import
        import_match = re.search(r'import\s+\{([^}]+)\}\s+from\s+[\'"]lucide-react[\'"]', app_content)
        if import_match:
            old_import = import_match.group(0)
            new_import = old_import.replace("CreditCard,", "CreditCard, Wallet,")
            if new_import == old_import: # fallback
                 new_import = old_import.replace("Receipt,", "Receipt, Wallet,")
            app_content = app_content.replace(old_import, new_import)
            with open("src/App.tsx", "w") as f:
                f.write(app_content)

    # Fix Dashboard.tsx variable ordering
    with open("src/pages/Dashboard.tsx", "r") as f:
        dash_content = f.read()
    
    # We need to move totalOutflow to below dashboardStats
    if "const totalOutflow = dashboardStats.totalAmount + expensesTotalAmount;" in dash_content:
        dash_content = dash_content.replace("  const totalOutflow = dashboardStats.totalAmount + expensesTotalAmount;\n", "")
        # Insert it after dashboardStats
        old_stats = """  const dashboardStats = useMemo(() => {
    return computeStats(dashboardBills);
  }, [dashboardBills]);"""
        
        new_stats = """  const dashboardStats = useMemo(() => {
    return computeStats(dashboardBills);
  }, [dashboardBills]);

  const totalOutflow = dashboardStats.totalAmount + expensesTotalAmount;"""
        
        dash_content = dash_content.replace(old_stats, new_stats)
        with open("src/pages/Dashboard.tsx", "w") as f:
            f.write(dash_content)
            
    print("Lint fixes applied.")

if __name__ == "__main__":
    main()
