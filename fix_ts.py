import os

def main():
    # 1. Update AppContext to include filteredBills and handleExportCSV
    with open("src/context/AppContext.tsx", "r") as f:
        ctx_content = f.read()
    
    if "filteredBills: Bill[];" not in ctx_content:
        ctx_content = ctx_content.replace("export interface AppContextType {", "export interface AppContextType {\n  filteredBills: Bill[];\n  handleExportCSV: () => void;")
    
    with open("src/context/AppContext.tsx", "w") as f:
        f.write(ctx_content)

    # 2. Update Bills.tsx to import filteredBills
    with open("src/pages/Bills.tsx", "r") as f:
        bills_content = f.read()
    if "filteredBills" not in bills_content.split("} = useAppContext();")[0]:
        bills_content = bills_content.replace("handleDeleteTrigger, triggerCallAI,", "handleDeleteTrigger, triggerCallAI, filteredBills,")
    with open("src/pages/Bills.tsx", "w") as f:
        f.write(bills_content)

    # 3. Update Settings.tsx to import handleExportCSV
    with open("src/pages/Settings.tsx", "r") as f:
        settings_content = f.read()
    if "handleExportCSV" not in settings_content.split("} = useAppContext();")[0]:
        settings_content = settings_content.replace("setUserProfile", "setUserProfile, handleExportCSV")
    with open("src/pages/Settings.tsx", "w") as f:
        f.write(settings_content)

    # 4. Move contextValue in App.tsx down before `return (`
    with open("src/App.tsx", "r") as f:
        app_content = f.read()

    # Find the contextValue declaration at the top
    start_ctx = app_content.find("const contextValue = {")
    end_ctx = app_content.find("};", start_ctx) + 2
    
    ctx_block = app_content[start_ctx:end_ctx]
    
    # Remove it from the top
    app_content = app_content[:start_ctx] + app_content[end_ctx:]
    
    # We also need to remove navigate and location if they are at the top,
    # but actually navigate and location are fine at the top since they are hooks.
    
    # Find `return (` for the main App render
    # There are multiple returns (like `if (currentPage === 'login') return ...`)
    # The final return is right before `{/* ---------------- MAIN APP WRAPPER ---------------- */}` or `return (` at the end
    final_return_idx = app_content.rfind("return (")
    
    # We must add filteredBills and handleExportCSV to the contextValue block
    ctx_block = ctx_block.replace("  };", "    filteredBills,\n    handleExportCSV\n  };")
    
    app_content = app_content[:final_return_idx] + ctx_block + "\n  " + app_content[final_return_idx:]

    with open("src/App.tsx", "w") as f:
        f.write(app_content)

if __name__ == "__main__":
    main()
