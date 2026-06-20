import os

def main():
    app_file = "src/App.tsx"
    with open(app_file, "r") as f:
        content = f.read()
        
    # Import loadDemoData and firestore tools if needed
    if "import { loadDemoData }" not in content:
        content = content.replace(
            "import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';",
            "import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';\nimport { loadDemoData } from './utils/demoData';"
        )
        
    old_guest = """  const handleBypassGuestAccess = async () => {
    setErrorMsg('');
    try {
      await signInAnonymously(auth);
    } catch (err: any) {
      setErrorMsg(err.message || 'Guest access currently limited');
    }
  };"""
  
    new_guest = """  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleBypassGuestAccess = async () => {
    setErrorMsg('');
    setIsDemoLoading(true);
    try {
      const cred = await signInAnonymously(auth);
      const user = cred.user;
      
      // Check if this anonymous user already has bills
      const billsRef = collection(db, 'bills');
      const q = query(billsRef, where('userId', '==', user.uid), limit(1));
      const querySnapshot = await getDocs(q);
      
      // If no bills exist, inject demo data immediately
      if (querySnapshot.empty) {
        await loadDemoData(user.uid);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Guest access currently limited');
    } finally {
      setIsDemoLoading(false);
    }
  };"""
  
    content = content.replace(old_guest, new_guest)
    
    # Update the button text to show loading state
    old_btn = """                  <button 
                    onClick={handleBypassGuestAccess}
                    className="w-full sm:w-auto bg-[#047857] text-white hover:bg-[#065F46] shadow-md transition-all duration-150 px-8 py-4 rounded-xl font-medium text-base flex items-center justify-center gap-2 animate-bounce-subtle"
                  >
                    Try Demo Now
                    <ArrowRight className="w-5 h-5" />
                  </button>"""
                  
    new_btn = """                  <button 
                    onClick={handleBypassGuestAccess}
                    disabled={isDemoLoading}
                    className="w-full sm:w-auto bg-[#047857] text-white hover:bg-[#065F46] shadow-md transition-all duration-150 px-8 py-4 rounded-xl font-medium text-base flex items-center justify-center gap-2 disabled:opacity-70 disabled:animate-pulse"
                  >
                    {isDemoLoading ? "Loading Workspace..." : "Try Demo Now"}
                    {!isDemoLoading && <ArrowRight className="w-5 h-5" />}
                  </button>"""
                  
    content = content.replace(old_btn, new_btn)

    with open(app_file, "w") as f:
        f.write(content)

if __name__ == "__main__":
    main()
