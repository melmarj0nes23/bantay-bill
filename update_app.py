import os

def main():
    app_file = "src/App.tsx"
    with open(app_file, "r") as f:
        content = f.read()

    # 1. Add imports
    if "import Disclaimer" not in content:
        import_str = "import Calendar from './pages/Calendar';\nimport Disclaimer from './pages/Disclaimer';\nimport Privacy from './pages/Privacy';"
        content = content.replace("import Calendar from './pages/Calendar';", import_str)

    # 2. Update currentPage type
    old_state = "const [currentPage, setCurrentPage] = useState<'landing' | 'login' | 'register' | 'app'>('landing');"
    new_state = "const [currentPage, setCurrentPage] = useState<'landing' | 'login' | 'register' | 'app' | 'privacy' | 'disclaimer'>('landing');"
    content = content.replace(old_state, new_state)

    # 3. Render the components
    # We will insert them right before the /* ---------------- 2. SIGN IN PAGE ---------------- */ section
    render_target = "{/* ---------------- 2. SIGN IN PAGE ---------------- */}"
    render_content = """{/* ---------------- LEGAL PAGES ---------------- */}
      {currentPage === 'disclaimer' && <Disclaimer onBack={() => setCurrentPage('landing')} />}
      {currentPage === 'privacy' && <Privacy onBack={() => setCurrentPage('landing')} />}

      {/* ---------------- 2. SIGN IN PAGE ---------------- */}"""
    content = content.replace(render_target, render_content)

    # 4. Update the Footer
    old_footer = """          <footer className="bg-[#181d1a] text-[#dfe4df]/60 py-12 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-emerald-400" />
                <span className="font-bold text-xl text-white">BantayBills</span>
              </div>
              <p className="text-xs">&copy; 2026 BantayBills. Premium Bill Management.</p>
            </div>
          </footer>"""

    new_footer = """          <footer className="bg-[#181d1a] text-[#dfe4df]/60 py-12 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-emerald-400" />
                <span className="font-bold text-xl text-white">BantayBills</span>
              </div>
              
              <div className="flex gap-6 text-xs font-medium">
                <button onClick={() => setCurrentPage('privacy')} className="hover:text-emerald-400 transition-colors">Privacy Policy</button>
                <button onClick={() => setCurrentPage('disclaimer')} className="hover:text-emerald-400 transition-colors">Legal Disclaimer</button>
              </div>

              <p className="text-xs">&copy; 2026 BantayBills. Premium Bill Management.</p>
            </div>
          </footer>"""
    
    content = content.replace(old_footer, new_footer)

    with open(app_file, "w") as f:
        f.write(content)

if __name__ == "__main__":
    main()
