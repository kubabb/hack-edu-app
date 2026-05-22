'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, LayoutDashboard as DashboardIcon, LogOut, Sparkles, Shield } from 'lucide-react'
import { useUser } from '@/src/hooks/useUser'
import { createClient } from '@/src/lib/supabase/client'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { href: '/dashboard/books', label: 'Moje książki', icon: BookOpen },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useUser()
  const isAdmin = user?.role === 'ADMIN'

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-[#f6faf9] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#e5f0ee] fixed h-full z-20 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-[#e5f0ee]">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold text-[#1a1a1a]">TutorAI</span>
            <Sparkles className="w-5 h-5 text-[#2ba599]" />
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#1d7874]/10 text-[#1d7874]'
                    : 'text-[#666] hover:bg-[#f0f7f6] hover:text-[#1a1a1a]'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}

          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#666] hover:bg-[#f0f7f6] hover:text-[#1a1a1a] transition-colors"
            >
              <Shield className="w-5 h-5" />
              Panel admina
            </Link>
          )}
        </nav>

        <div className="p-3 border-t border-[#e5f0ee]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#666] hover:bg-red-50 hover:text-red-600 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            Wyloguj się
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-[#e5f0ee] z-20 flex items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-lg font-bold text-[#1a1a1a]">TutorAI</span>
          <Sparkles className="w-4 h-4 text-[#2ba599]" />
        </Link>
        <button onClick={handleLogout} className="text-sm text-[#666]">
          Wyloguj
        </button>
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-64 pt-14 md:pt-0">
        <div className="max-w-6xl mx-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
