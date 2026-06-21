import os

def main():
    app_file = "src/App.tsx"
    with open(app_file, "r") as f:
        content = f.read()

    # Find the start and end of the hero section
    start_str = "            {/* Elegant Hero Section */}"
    end_str = "            {/* How it Works Module info */}"
    
    start_idx = content.find(start_str)
    end_idx = content.find(end_str)
    
    if start_idx == -1 or end_idx == -1:
        print("Could not find hero section boundaries")
        return
        
    old_hero = content[start_idx:end_idx]
    
    new_hero = """            {/* Premium Mesh Hero Section */}
            <section className="relative min-h-[100dvh] flex flex-col items-center justify-center pt-28 pb-24 px-4 sm:px-6 overflow-hidden mesh-bg">
              {/* Dot Grid Overlay */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwgOTMsIDY2LCAwLjEpIi8+PC9zdmc+')] opacity-50"></div>

              <div className="max-w-6xl mx-auto w-full relative z-10 flex flex-col items-center">
                
                {/* Text Content */}
                <div className="text-center max-w-3xl mx-auto mb-12 mt-12 animate-fade-in-up">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white/40 shadow-sm mb-8">
                    <span className="flex h-2 w-2 rounded-full bg-[#047857] animate-pulse"></span>
                    <span className="text-xs font-bold text-[#005d42] uppercase tracking-widest">Premium Cloud-Synced Bill Organizer</span>
                  </div>
                  
                  <h1 className="text-5xl md:text-7xl lg:text-[5rem] font-black tracking-tight text-[#181d1a] leading-[1.1] mb-6 drop-shadow-sm">
                    Never Miss Another <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#005d42] via-[#047857] to-[#0d9488]">Bill Payment.</span>
                  </h1>
                  
                  <p className="text-lg md:text-xl text-[#3e4943] max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
                    Track recurring utilities, manage monthly obligations, schedule reminders, and audit your household spending using our beautiful calendar.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button 
                      onClick={handleBypassGuestAccess}
                      disabled={isDemoLoading}
                      className="w-full sm:w-auto bg-[#047857] text-white hover:bg-[#065F46] shadow-[0_8px_30px_rgb(4,120,87,0.3)] hover:shadow-[0_8px_30px_rgb(4,120,87,0.5)] hover:-translate-y-1 transition-all duration-300 px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-70 disabled:animate-pulse whitespace-nowrap"
                    >
                      {isDemoLoading ? "Loading Workspace..." : "Try Demo Now"}
                      {!isDemoLoading && <ArrowRight className="w-5 h-5" />}
                    </button>
                    
                    <button 
                      onClick={() => setCurrentPage('login')}
                      className="w-full sm:w-auto bg-white/80 backdrop-blur-sm text-[#005d42] border border-[#047857]/20 hover:bg-white shadow-sm hover:-translate-y-1 transition-all duration-300 px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      Log In / Register
                    </button>
                  </div>
                  
                  {/* Social Proof */}
                  <div className="mt-10 flex flex-col items-center gap-3 animate-fade-in-up animation-delay-200">
                    <div className="flex -space-x-3">
                      <div className="w-10 h-10 rounded-full border-2 border-[#f6fbf5] bg-slate-200 overflow-hidden"><img src="https://i.pravatar.cc/100?img=1" alt="user" /></div>
                      <div className="w-10 h-10 rounded-full border-2 border-[#f6fbf5] bg-slate-300 overflow-hidden"><img src="https://i.pravatar.cc/100?img=2" alt="user" /></div>
                      <div className="w-10 h-10 rounded-full border-2 border-[#f6fbf5] bg-slate-400 overflow-hidden"><img src="https://i.pravatar.cc/100?img=3" alt="user" /></div>
                      <div className="w-10 h-10 rounded-full border-2 border-[#f6fbf5] bg-slate-500 overflow-hidden"><img src="https://i.pravatar.cc/100?img=4" alt="user" /></div>
                      <div className="w-10 h-10 rounded-full border-2 border-[#f6fbf5] bg-[#005d42] flex items-center justify-center text-white text-xs font-bold">+10k</div>
                    </div>
                    <p className="text-sm font-medium text-[#3e4943]">Join 10,000+ users tracking <span className="font-bold text-[#005d42]">₱50M+</span> in bills</p>
                  </div>
                </div>

                {/* Dashboard Mockup Asset */}
                <div className="w-full max-w-5xl relative mt-8 animate-fade-in-up animation-delay-400 perspective-[2000px]">
                  <div className="relative rounded-2xl md:rounded-[2.5rem] p-2 md:p-4 bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_30px_60px_rgba(0,93,66,0.15)] transform md:[transform:rotateX(8deg)_translateY(-10px)] hover:md:[transform:rotateX(0deg)_translateY(0px)] transition-all duration-700 ease-out group">
                    <img 
                      src="/hero-mockup.png" 
                      alt="BantayBills Dashboard" 
                      className="w-full h-auto rounded-xl md:rounded-[2rem] shadow-2xl border border-slate-100 group-hover:shadow-[0_40px_80px_rgba(0,93,66,0.2)] transition-shadow duration-700"
                    />
                  </div>
                  
                  {/* Floating Glassmorphism Cards */}
                  <div className="hidden lg:flex absolute -left-12 top-24 bg-white/80 backdrop-blur-lg border border-white p-4 rounded-2xl shadow-xl items-center gap-4 animate-float z-20">
                    <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center"><Zap className="w-6 h-6" /></div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Electricity</p>
                      <p className="text-xs font-medium text-slate-500">Due in 2 days</p>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-sm font-black text-slate-800">₱4,500</p>
                      <div className="w-2 h-2 rounded-full bg-orange-500 ml-auto mt-1"></div>
                    </div>
                  </div>

                  <div className="hidden lg:flex absolute -right-8 bottom-32 bg-white/80 backdrop-blur-lg border border-white p-4 rounded-2xl shadow-xl items-center gap-4 animate-float-delayed z-20">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><CheckCircle className="w-6 h-6" /></div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Internet Plan</p>
                      <p className="text-xs font-medium text-emerald-600">Paid successfully</p>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-sm font-black text-slate-800">₱1,500</p>
                    </div>
                  </div>
                  
                  <div className="hidden md:flex lg:hidden absolute -right-4 top-1/2 bg-white/80 backdrop-blur-lg border border-white p-3 rounded-2xl shadow-xl items-center gap-3 animate-float-fast z-20">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><Target className="w-5 h-5" /></div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Water Bill</p>
                    </div>
                  </div>

                </div>
              </div>
            </section>

"""
    content = content.replace(old_hero, new_hero)

    # I should also remove the old Top header logic where "Log in" was, since I moved it into the main Hero CTA block as a secondary button.
    # We want a very clean header on the landing page, just Logo and Try Demo Now
    # Wait, the user still wants the header. The header currently has "Log In / Register".
    # I'll leave the header alone, it's fine. It's consistent.
    
    with open(app_file, "w") as f:
        f.write(content)

if __name__ == "__main__":
    main()
