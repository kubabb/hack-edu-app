'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Save,
  User as UserIcon,
  KeyRound,
  Activity,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Mail,
  ShieldCheck,
  CalendarDays,
  LayoutDashboard,
  Home
} from 'lucide-react'
import DashboardLayout from '@/src/components/DashboardLayout'

interface UserProfile {
  name: string | null
  email: string
  role: string
  createdAt: string
}

interface UserStats {
  sessions: number
  quizzes: number
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingName, setSavingName] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const [nameInput, setNameInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [nameSuccess, setNameSuccess] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/user/profile')
        if (res.ok) {
          const data = await res.json()
          setProfile(data.user)
          setStats(data.stats)
          setNameInput(data.user?.name || '')
        }
      } catch (e) {
        console.error('Failed to load profile', e)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  async function handleUpdateName(e: React.FormEvent) {
    e.preventDefault()
    setSavingName(true)
    setNameSuccess(false)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameInput })
      })
      if (res.ok) {
        setProfile(prev => prev ? { ...prev, name: nameInput } : null)
        setNameSuccess(true)
        setTimeout(() => setNameSuccess(false), 3000)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSavingName(false)
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!passwordInput || passwordInput.length < 6) return
    setSavingPassword(true)
    setPasswordSuccess(false)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput })
      })
      if (res.ok) {
        setPasswordInput('')
        setPasswordSuccess(true)
        setTimeout(() => setPasswordSuccess(false), 3000)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSavingPassword(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#dce7f5] border-b-[#7057ff]" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 pb-10">
        {/* Top Banner */}
        <section className="cartoon-panel relative overflow-hidden rounded-[32px] p-8 md:p-12">
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none text-[#7057ff]">
            <Sparkles className="w-72 h-72 -mt-16 -mr-16 rotate-12" strokeWidth={1} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl bg-[#f0edff] text-[#7057ff] shadow-sm">
              <UserIcon className="h-14 w-14" strokeWidth={2.5} />
            </div>
            <div className="text-center md:text-left flex-1">
              <span className="mb-3 inline-block rounded-xl bg-[#7057ff] px-4 py-2 text-sm font-extrabold text-white">
                Konto Użytkownika
              </span>
              <h1 className="font-display text-4xl md:text-5xl text-[#06296b] leading-none mt-2">
                {profile?.name || 'Witaj, uczniu!'}
              </h1>
              <div className="mt-5 flex flex-wrap items-center justify-center md:justify-start gap-3">
                <span className="flex items-center gap-2 rounded-xl bg-[#f0f4f8] px-4 py-2 text-sm font-bold text-[#6e7fa6] border border-[#dce7f5]">
                  <Mail className="h-4 w-4 text-[#7057ff] opacity-80" />
                  {profile?.email}
                </span>
                <span className="flex items-center gap-2 rounded-xl bg-[#f0f4f8] px-4 py-2 text-sm font-bold text-[#6e7fa6] border border-[#dce7f5]">
                  <ShieldCheck className="h-4 w-4 text-[#20b981] opacity-80" />
                  {profile?.role === 'ADMIN' ? 'Administrator' : 'Uczeń'}
                </span>
                <span className="flex items-center gap-2 rounded-xl bg-[#f0f4f8] px-4 py-2 text-sm font-bold text-[#6e7fa6] border border-[#dce7f5]">
                  <CalendarDays className="h-4 w-4 text-[#ff5144] opacity-80" />
                  Dołączono: {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('pl-PL') : 'Brak'}
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px] items-start">
          <div className="flex flex-col gap-8">
            
            {/* Edycja Danych */}
            <section className="cartoon-panel rounded-[32px] p-6 md:p-10 transition-shadow hover:shadow-[0_20px_60px_rgba(6,41,107,0.08)]">
              <div className="flex items-center gap-4 mb-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0edff] text-[#7057ff]">
                  <UserIcon className="h-6 w-6" strokeWidth={2.5} />
                </div>
                <h2 className="font-display text-3xl text-[#06296b]">Dane publiczne</h2>
              </div>

              <form onSubmit={handleUpdateName} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-sm font-extrabold text-[#06296b] uppercase tracking-wide ml-1">
                    Wyświetlane Imię
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#9aa8c1] transition-colors group-focus-within:text-[#7057ff]">
                      <UserIcon className="h-5 w-5" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full rounded-2xl border-2 border-[#dce7f5] bg-white pl-12 pr-5 py-4 font-bold text-[#06296b] transition-all hover:border-[#b4c4df] focus:border-[#7057ff] focus:outline-none focus:ring-4 focus:ring-[#7057ff]/10"
                      placeholder="Podaj swoje imię..."
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={savingName || nameInput === profile?.name}
                  className="cartoon-button group mt-2 inline-flex w-fit items-center justify-center gap-3 rounded-xl bg-[#ff5144] px-8 py-4 font-extrabold text-white transition-all hover:-translate-y-1 hover:bg-[#e43f33] disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
                >
                  {savingName ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-b-white" />
                  ) : nameSuccess ? (
                    <>
                      Zapisano pomyślnie!
                      <CheckCircle2 className="h-5 w-5" />
                    </>
                  ) : (
                    <>
                      Zapisz imię
                      <Save className="h-5 w-5 transition-transform group-hover:scale-110" />
                    </>
                  )}
                </button>
              </form>
            </section>

            {/* Zmiana hasła */}
            <section className="cartoon-panel rounded-[32px] p-6 md:p-10 transition-shadow hover:shadow-[0_20px_60px_rgba(6,41,107,0.08)]">
              <div className="flex items-center gap-4 mb-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0edff] text-[#7057ff]">
                  <KeyRound className="h-6 w-6" strokeWidth={2.5} />
                </div>
                <h2 className="font-display text-3xl text-[#06296b]">Bezpieczeństwo</h2>
              </div>

              <form onSubmit={handleUpdatePassword} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="password" className="text-sm font-extrabold text-[#06296b] uppercase tracking-wide ml-1">
                    Nowe hasło
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#9aa8c1] transition-colors group-focus-within:text-[#7057ff]">
                      <KeyRound className="h-5 w-5" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full rounded-2xl border-2 border-[#dce7f5] bg-white pl-12 pr-5 py-4 font-bold text-[#06296b] transition-all hover:border-[#b4c4df] focus:border-[#7057ff] focus:outline-none focus:ring-4 focus:ring-[#7057ff]/10"
                      placeholder="Minimum 6 znaków"
                      minLength={6}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingPassword || passwordInput.length < 6}
                  className="cartoon-button group mt-2 inline-flex w-fit items-center justify-center gap-3 rounded-xl bg-white border border-[#dce7f5] px-8 py-4 font-extrabold text-[#06296b] transition-all hover:-translate-y-1 hover:border-[#7057ff] disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
                >
                  {savingPassword ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#06296b]/20 border-b-[#06296b]" />
                  ) : passwordSuccess ? (
                    <>
                      Zaktualizowano
                      <CheckCircle2 className="h-5 w-5 text-[#20b981]" />
                    </>
                  ) : (
                    <>
                      Aktualizuj hasło
                      <KeyRound className="h-5 w-5 text-[#7057ff] transition-transform group-hover:scale-110" />
                    </>
                  )}
                </button>
              </form>
            </section>
          </div>

          {/* Prawa kolumna - Statystyki */}
          <div className="flex flex-col gap-6">
            <div className="cartoon-panel rounded-[32px] p-6 sticky top-28">
              <h2 className="flex items-center gap-3 text-2xl font-display text-[#06296b] mb-6">
                <Activity className="h-6 w-6 text-[#7057ff]" />
                Twoje Osiągnięcia
              </h2>
              
              <div className="flex flex-col gap-4">
                <div className="group relative overflow-hidden rounded-[24px] border border-[#dce7f5] bg-white p-5 transition-all hover:-translate-y-1 hover:border-[#7057ff] hover:shadow-sm">
                  <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-[#f0edff] transition-transform duration-500 group-hover:scale-150" />
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="text-xs font-extrabold text-[#6e7fa6] uppercase tracking-wider">Sesje nauki</p>
                      <span className="font-display text-4xl text-[#06296b] leading-none mt-1">{stats?.sessions || 0}</span>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7057ff] text-white shadow-md transition-transform group-hover:rotate-6">
                      <BookOpen className="h-7 w-7" />
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-[24px] border border-[#dce7f5] bg-white p-5 transition-all hover:-translate-y-1 hover:border-[#ff5144] hover:shadow-sm">
                  <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-[#fff0ef] transition-transform duration-500 group-hover:scale-150" />
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="text-xs font-extrabold text-[#6e7fa6] uppercase tracking-wider">Rozwiązane quizy</p>
                      <span className="font-display text-4xl text-[#06296b] leading-none mt-1">{stats?.quizzes || 0}</span>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ff5144] text-white shadow-md transition-transform group-hover:-rotate-6">
                      <Sparkles className="h-7 w-7" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 rounded-2xl bg-[#f8fbff] p-5 text-center border border-[#dce7f5]">
                <p className="text-sm font-bold text-[#6e7fa6] leading-relaxed">
                  Uczysz się z nami i robisz świetne postępy! Oby tak dalej! 🚀
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
