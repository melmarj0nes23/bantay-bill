import os

def main():
    app_file = "src/App.tsx"
    with open(app_file, "r") as f:
        content = f.read()

    # 1. Make the header fixed so it's always persistent
    old_nav = """<nav className="sticky top-0 z-50 w-full bg-[#f6fbf5]/80 backdrop-blur-md border-b border-[#bdc9c1] h-16 flex items-center">"""
    new_nav = """<nav className="fixed top-0 z-50 w-full bg-[#f6fbf5]/90 backdrop-blur-md border-b border-[#bdc9c1] h-16 flex items-center shadow-sm">"""
    content = content.replace(old_nav, new_nav)

    # 2. Make the hero section take the full viewport height minus header, centering the content
    old_hero = """<section className="relative pt-20 pb-24 md:pt-28 md:pb-36 px-6 overflow-hidden">"""
    new_hero = """<section className="relative min-h-[100dvh] flex flex-col justify-center pt-24 pb-16 px-6 overflow-hidden">"""
    content = content.replace(old_hero, new_hero)

    with open(app_file, "w") as f:
        f.write(content)

if __name__ == "__main__":
    main()
