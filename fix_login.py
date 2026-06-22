import os

def main():
    app_file = "src/App.tsx"
    with open(app_file, "r") as f:
        content = f.read()

    # 1. Add ArrowLeft to lucide-react imports if not there
    if "ArrowLeft" not in content:
        content = content.replace("import { \n  CreditCard,", "import { \n  ArrowLeft,\n  CreditCard,")

    # 2. Fix the error message mapping for handleSignIn
    old_signin_catch = """    } catch (err: any) {
      setErrorMsg(err.message || 'Login credentials incorrect');
    }"""
    
    new_signin_catch = """    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setErrorMsg('Incorrect Email or Password.');
      } else {
        setErrorMsg(err.message || 'Login credentials incorrect');
      }
    }"""
    
    content = content.replace(old_signin_catch, new_signin_catch)

    # 3. Add Back to Home button to Login Page
    old_login_header = """          <div className="w-full max-w-md bg-white border border-[#bdc9c1] rounded-xl p-8 shadow-sm">
            <header className="flex flex-col items-center mb-6 text-center">"""
            
    new_login_header = """          <div className="w-full max-w-md bg-white border border-[#bdc9c1] rounded-xl p-8 shadow-sm relative">
            <button 
              onClick={() => setCurrentPage('landing')}
              className="absolute top-6 left-6 text-slate-400 hover:text-[#047857] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <header className="flex flex-col items-center mb-6 text-center">"""

    content = content.replace(old_login_header, new_login_header)

    # 4. Add Back to Home button to Register Page just in case
    old_register_header = """          <div className="w-full max-w-md bg-white border border-[#bdc9c1] rounded-xl p-8 shadow-sm">
            <header className="flex flex-col items-center mb-6 text-center">"""
            
    # We only want to replace the first occurrence (since we already replaced the login one if they are exactly the same). Wait, the replacement strings are identical.
    # Let's check how many times the old string exists.
    # Actually, we can just replace all occurrences of old_register_header with new_login_header.
    content = content.replace(old_register_header, new_login_header)

    with open(app_file, "w") as f:
        f.write(content)

if __name__ == "__main__":
    main()
