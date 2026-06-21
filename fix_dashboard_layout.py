import os

def main():
    app_file = "src/pages/Dashboard.tsx"
    with open(app_file, "r") as f:
        content = f.read()

    # 1. Change wrapper to flex flex-col gap-6
    content = content.replace(
        '<div className="space-y-6 max-w-7xl mx-auto pb-12">',
        '<div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">'
    )

    # 2. Remove avatar
    avatar_html = """          <div className="w-12 h-12 rounded-full border-2 border-white shadow-md overflow-hidden bg-slate-200">
             <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" className="w-full h-full object-cover" />
          </div>"""
    content = content.replace(avatar_html, "")

    # 3. Add order classes to top-level sections
    # Header
    content = content.replace(
        '{/* HEADER */}\n      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 backdrop-blur-md p-6 rounded-[2rem] border border-white shadow-sm">',
        '{/* HEADER */}\n      <div className="order-1 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 backdrop-blur-md p-6 rounded-[2rem] border border-white shadow-sm">'
    )

    # AI Banner
    content = content.replace(
        '{/* AI BANNER */}\n      <div className="bg-gradient-to-r from-[#005d42] to-[#047857] rounded-2xl p-4 shadow-lg text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">',
        '{/* AI BANNER */}\n      <div className="order-last md:order-2 bg-gradient-to-r from-[#005d42] to-[#047857] rounded-2xl p-4 shadow-lg text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">'
    )

    # STATS ROW
    content = content.replace(
        '{/* STATS ROW */}\n      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">',
        '{/* STATS ROW */}\n      <div className="order-3 grid grid-cols-1 md:grid-cols-3 gap-6">'
    )

    # MIDDLE ROW
    content = content.replace(
        '{/* MIDDLE ROW */}\n      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">',
        '{/* MIDDLE ROW */}\n      <div className="order-4 grid grid-cols-1 lg:grid-cols-3 gap-6">'
    )

    # RECENT & UPCOMING BILLS
    content = content.replace(
        '{/* RECENT & UPCOMING BILLS */}\n      <div>',
        '{/* RECENT & UPCOMING BILLS */}\n      <div className="order-5">'
    )

    with open(app_file, "w") as f:
        f.write(content)

if __name__ == "__main__":
    main()
