'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  Sparkles,
} from 'lucide-react'
import { useUser } from '@/src/hooks/useUser'
import { createClient } from '@/src/lib/supabase/client'

const navItems = [
  { href: '/dashboard', label: 'Pulpit', icon: LayoutDashboard },
  { href: '/dashboard/books', label: 'Materiały', icon: BookOpen },
]

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useUser()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isAdmin = user?.role === 'ADMIN'

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-[#f6f4ef] text-[#06296b]">
      <aside className="fixed inset-y-4 left-4 z-30 hidden w-72 flex-col overflow-hidden rounded-[28px] border border-[#dfe8f4] bg-[#fffefb] shadow-[0_18px_50px_rgba(6,41,107,0.1)] lg:flex">
        <div className="border-b border-[#e6edf7] px-6 py-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/icon_mascot.svg" alt="nastoprocent Logo" className="h-14 w-auto" />
            <span className="font-display text-3xl text-[#06296b] -mt-2">nastoprocent</span>
          </Link>
          <div className="mt-5 rounded-2xl bg-[#fff4cf] p-4">
            <p className="text-xs font-extrabold uppercase text-[#ff5144]">Aktywna sesja</p>
            <p className="mt-1 truncate text-sm font-extrabold text-[#06296b]">
              {user?.name || user?.email || 'Uczeń TutorAI'}
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-5">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold transition-transform hover:-translate-y-0.5 ${
                  active
                    ? 'bg-[#7057ff] text-white shadow-[inset_0_-3px_rgba(6,41,107,0.16)]'
                    : 'bg-white text-[#6e7fa6] hover:text-[#06296b]'
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={2.7} />
                {item.label}
              </Link>
            )
          })}

          {isAdmin && (
            <Link
              href="/admin"
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold transition-transform hover:-translate-y-0.5 ${
                isActive(pathname, '/admin')
                  ? 'bg-[#7057ff] text-white'
                  : 'bg-white text-[#6e7fa6] hover:text-[#06296b]'
              }`}
            >
              <Shield className="h-5 w-5" strokeWidth={2.7} />
              Panel admina
            </Link>
          )}
        </nav>

        <div className="border-t border-[#e6edf7] p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl bg-[#fff0ef] px-4 py-3 text-sm font-extrabold text-[#d8342b] transition-transform hover:-translate-y-0.5"
          >
            <LogOut className="h-5 w-5" strokeWidth={2.7} />
            Wyloguj się
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-[#dfe8f4] bg-[#f6f4ef]/85 px-4 py-3 backdrop-blur lg:hidden">
        <div className="cartoon-panel flex items-center justify-between rounded-2xl px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/icon_mascot.svg" alt="nastoprocent Logo" className="h-12 w-auto" />
            <span className="font-display text-2xl text-[#06296b] -mt-1.5">nastoprocent</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl bg-[#fff0ef] px-3 py-2 text-xs font-extrabold text-[#d8342b]"
            >
              Wyloguj
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-expanded={mobileOpen}
              aria-label="Otwórz menu"
              className="rounded-xl border border-[#dce7f5] bg-white p-2 text-[#06296b]"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
        {mobileOpen && (
          <nav className="cartoon-panel mt-3 grid gap-2 rounded-2xl p-3">
            {[...navItems, ...(isAdmin ? [{ href: '/admin', label: 'Panel admina', icon: Shield }] : [])].map(
              (item) => {
                const Icon = item.icon
                const active = isActive(pathname, item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-extrabold ${
                      active ? 'bg-[#7057ff] text-white' : 'bg-white text-[#6e7fa6]'
                    }`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2.7} />
                    {item.label}
                  </Link>
                )
              },
            )}
          </nav>
        )}
      </header>

      <main className="px-4 py-6 lg:ml-80 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#f6dec0] bg-[#fff4cf] px-4 py-2 text-sm font-extrabold text-[#06296b]">
              <Sparkles className="h-4 w-4 text-[#ff5144]" fill="#ff5144" />
              Panel nauki TutorAI
            </div>
            <Link
              href="/"
              className="rounded-xl border border-[#dce7f5] bg-white px-4 py-2 text-sm font-extrabold text-[#06296b]"
            >
            </Link>
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
