'use client'

import { useEffect, useState } from 'react'
import { BookOpen, MessageCircle, Shield, Sparkles, Users } from 'lucide-react'
import DashboardLayout from '@/src/components/DashboardLayout'
import { readJsonSafely } from '@/src/lib/http/json'

interface AdminUser {
  id: string
  email: string
  role: string
  createdAt: string
  _count: { books: number; chatSessions: number }
}

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadUsers() {
      try {
        const res = await fetch('/api/admin/users')
        const data = await readJsonSafely<{ users?: AdminUser[] }>(res)
        if (!cancelled) setUsers(data?.users || [])
      } catch {
        if (!cancelled) setUsers([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadUsers()

    return () => {
      cancelled = true
    }
  }, [])

  const stats = [
    { label: 'Użytkownicy', value: users.length, icon: Users, color: 'bg-[#7057ff]' },
    {
      label: 'Materiały',
      value: users.reduce((sum, user) => sum + (user._count?.books || 0), 0),
      icon: BookOpen,
      color: 'bg-[#ff5144]',
    },
    {
      label: 'Sesje czatu',
      value: users.reduce((sum, user) => sum + (user._count?.chatSessions || 0), 0),
      icon: MessageCircle,
      color: 'bg-[#20b981]',
    },
  ]

  return (
    <DashboardLayout>
      <section className="cartoon-panel overflow-hidden rounded-[32px]">
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f6dec0] bg-[#fff4cf] px-4 py-2 text-sm font-extrabold text-[#06296b]">
              <Sparkles className="h-4 w-4 text-[#ff5144]" fill="#ff5144" />
              Centrum kontroli
            </div>
            <h1 className="flex flex-wrap items-center gap-3 font-display text-5xl leading-none text-[#06296b] md:text-6xl">
              <Shield className="h-10 w-10 text-[#7057ff]" strokeWidth={2.7} />
              Panel admina
            </h1>
            <p className="mt-4 max-w-2xl text-base font-bold leading-7 text-[#6e7fa6]">
              Sprawdzaj użytkowników, aktywność materiałów i sesje czatu bez wychodzenia z
              kreskówkowego świata TutorAI.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <article key={stat.label} className="cartoon-panel rounded-[28px] p-5">
              <div className="flex items-center gap-4">
                <span className={`flex h-14 w-14 items-center justify-center rounded-2xl text-white ${stat.color}`}>
                  <Icon className="h-7 w-7" strokeWidth={2.7} />
                </span>
                <div>
                  <p className="font-display text-4xl leading-none text-[#06296b]">{stat.value}</p>
                  <p className="text-sm font-extrabold text-[#6e7fa6]">{stat.label}</p>
                </div>
              </div>
            </article>
          )
        })}
      </section>

      <section className="cartoon-panel mt-7 overflow-hidden rounded-[32px]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e6edf7] px-6 py-5">
          <div>
            <h2 className="font-display text-4xl leading-none text-[#06296b]">Użytkownicy</h2>
            <p className="mt-2 text-sm font-bold text-[#6e7fa6]">
              Role, liczba materiałów i sesje czatu w jednym widoku.
            </p>
          </div>
          <span className="rounded-full bg-[#f0edff] px-4 py-2 text-sm font-extrabold text-[#7057ff]">
            {users.length} kont
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#dce7f5] border-b-[#7057ff]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-[#fff4cf]">
                <tr>
                  <th className="px-6 py-4 font-extrabold text-[#06296b]">Email</th>
                  <th className="px-6 py-4 font-extrabold text-[#06296b]">Rola</th>
                  <th className="px-6 py-4 font-extrabold text-[#06296b]">Materiały</th>
                  <th className="px-6 py-4 font-extrabold text-[#06296b]">Sesje</th>
                  <th className="px-6 py-4 font-extrabold text-[#06296b]">Utworzony</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6edf7] bg-[#fffefb]">
                {users.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-[#f9fbff]">
                    <td className="px-6 py-4 font-bold text-[#06296b]">{user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1.5 text-xs font-extrabold ${
                          user.role === 'ADMIN'
                            ? 'bg-[#f0edff] text-[#7057ff]'
                            : 'bg-[#eafff4] text-[#11805e]'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#6e7fa6]">{user._count.books}</td>
                    <td className="px-6 py-4 font-bold text-[#6e7fa6]">{user._count.chatSessions}</td>
                    <td className="px-6 py-4 font-bold text-[#9aa8c1]">
                      {new Date(user.createdAt).toLocaleDateString('pl-PL')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </DashboardLayout>
  )
}
