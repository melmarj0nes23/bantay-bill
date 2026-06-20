import os

def main():
    app_file = "src/App.tsx"
    with open(app_file, "r") as f:
        content = f.read()

    # 1. Update handleSingoutTrigger
    old_signout = """  const handleSingoutTrigger = async () => {
    await signOut(auth);
    setCurrentPage('landing');
  };"""
    new_signout = """  const handleSingoutTrigger = async () => {
    await signOut(auth);
    setCurrentPage('landing');
    navigate('/');
  };"""
    content = content.replace(old_signout, new_signout)
    
    # 2. Make Sidebar Header Clickable
    old_sidebar_header = """              <div>
                <h1 className="font-semibold text-xl text-[#005d42] font-dashboard-title leading-none">BantayBills</h1>
                <p className="text-[10px] text-[#3e4943] font-mono tracking-wider uppercase mt-1">Premium Bill Manager</p>
              </div>"""
    new_sidebar_header = """              <div 
                className="cursor-pointer hover:opacity-80 transition-opacity" 
                onClick={() => { setCurrentPage('landing'); navigate('/'); }}
              >
                <h1 className="font-semibold text-xl text-[#005d42] font-dashboard-title leading-none">BantayBills</h1>
                <p className="text-[10px] text-[#3e4943] font-mono tracking-wider uppercase mt-1">Premium Bill Manager</p>
              </div>"""
    content = content.replace(old_sidebar_header, new_sidebar_header)
    
    # 3. Make Mobile Header Clickable
    old_mobile_header = """              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#047857] flex items-center justify-center text-white">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h1 className="text-lg font-bold font-dashboard-title text-primary block md:hidden">BantayBills</h1>
              </div>"""
    new_mobile_header = """              <div 
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => { setCurrentPage('landing'); navigate('/'); }}
              >
                <div className="w-8 h-8 rounded-full bg-[#047857] flex items-center justify-center text-white">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h1 className="text-lg font-bold font-dashboard-title text-primary block md:hidden">BantayBills</h1>
              </div>"""
    content = content.replace(old_mobile_header, new_mobile_header)
    
    with open(app_file, "w") as f:
        f.write(content)

if __name__ == "__main__":
    main()
