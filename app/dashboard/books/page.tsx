'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  Brain,
  ChevronRight,
  FileText,
  GraduationCap,
  Plus,
  Sparkles,
} from 'lucide-react'
import DashboardLayout from '@/src/components/DashboardLayout'
import { readJsonSafely } from '@/src/lib/http/json'

interface Session {
  id: string
  topic: string
  status: string
  summary?: string | null
  createdAt: string
}

export default function MaterialsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [usage, setUsage] = useState({ used: 0, limit: 10, plan: 'Uczeń', percent: 0, flashcardsCount: 0 })

  useEffect(() => {
    let cancelled = false

    async function loadSessions() {
      try {
        const res = await fetch('/api/sessions')
        const data = await readJsonSafely<{ sessions?: Session[] }>(res)
        if (!cancelled) {
          const allSessions = data?.sessions || []
          // Filtrujemy tylko te sesje, które mają już podsumowanie
          const finishedSessions = allSessions.filter(s => !!s.summary)
          setSessions(finishedSessions)
        }
      } catch {
        if (!cancelled) setSessions([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadSessions()

    async function loadUsage() {
      try {
        const res = await fetch('/api/user/usage')
        const data = await readJsonSafely<{ aiMinutesUsed?: number, aiMinutesLimit?: number, subscriptionPlan?: string, flashcardsCount?: number }>(res)
        if (!cancelled && data && typeof data.aiMinutesUsed === 'number') {
          const used = data.aiMinutesUsed
          const limit = data.aiMinutesLimit || 10
          const percent = Math.min(Math.round((used / limit) * 100), 100)
          setUsage({ used, limit, plan: data.subscriptionPlan || 'Uczeń', percent, flashcardsCount: data.flashcardsCount || 0 })
        }
      } catch (err) {
        // ignore
      }
    }
    void loadUsage()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <DashboardLayout>
      <section className="cartoon-panel overflow-hidden rounded-[32px]">
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f6dec0] bg-[#fff4cf] px-4 py-2 text-sm font-extrabold text-[#06296b]">
              <Sparkles className="h-4 w-4 text-[#ff5144]" fill="#ff5144" />
              Biblioteka nauki
            </div>
            <h1 className="font-display text-5xl leading-none text-[#06296b] md:text-6xl">
              Twoje materiały
            </h1>
            <p className="mt-4 max-w-2xl text-base font-bold leading-7 text-[#6e7fa6]">
              Tutaj znajdują się notatki i podsumowania z Twoich wcześniejszych lekcji. Możesz do nich wracać, by utrwalić wiedzę!
            </p>
          </div>

          <Link
            href="/dashboard"
            className="cartoon-button inline-flex items-center justify-center gap-3 rounded-2xl bg-[#6ff0ae] px-5 py-4 font-extrabold text-[#063f40]"
          >
            <Plus className="h-5 w-5" />
            Rozpocznij nową lekcję
          </Link>
        </div>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-3">
        <article className="cartoon-panel rounded-[28px] p-5">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7057ff] text-white">
              <BookOpen className="h-6 w-6" strokeWidth={2.7} />
            </span>
            <div>
              <p className="font-display text-4xl leading-none text-[#06296b]">{sessions.length}</p>
              <p className="text-sm font-extrabold text-[#6e7fa6]">Zakończone lekcje</p>
            </div>
          </div>
        </article>

        <article className="cartoon-panel rounded-[28px] p-5">
          <div className="flex items-center gap-4">
            <div className="relative flex h-14 w-14 items-center justify-center">
              <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#e6edf7]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                />
                <path
                  className="text-[#ff5144]"
                  strokeDasharray={`${usage.percent}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Brain className="h-5 w-5 text-[#ff5144]" strokeWidth={2.7} />
              </div>
            </div>
            <div>
              <p className="font-display text-2xl leading-none text-[#06296b]">{usage.used} / {usage.limit} min</p>
              <p className="text-sm font-extrabold text-[#6e7fa6]">Zużycie AI ({usage.percent}%)</p>
            </div>
          </div>
        </article>

        <article className="cartoon-panel rounded-[28px] p-5">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ffb84d] text-white">
              <Sparkles className="h-6 w-6" strokeWidth={2.7} />
            </span>
            <div>
              <p className="font-display text-4xl leading-none text-[#06296b]">{usage.flashcardsCount}</p>
              <p className="text-sm font-extrabold text-[#6e7fa6]">Wygenerowane fiszki</p>
            </div>
          </div>
        </article>
      </section>

      <section className="mt-7">
        {loading ? (
          <div className="cartoon-panel flex items-center justify-center rounded-[32px] py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#dce7f5] border-b-[#7057ff]" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="cartoon-panel rounded-[32px] p-10 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-[#f0edff] text-[#7057ff]">
              <GraduationCap className="h-10 w-10" strokeWidth={2.7} />
            </div>
            <h2 className="mt-5 font-display text-4xl leading-none text-[#06296b]">
              Biblioteka jest jeszcze pusta
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm font-bold leading-6 text-[#6e7fa6]">
              Aby pojawiły się tutaj materiały, musisz najpierw zakończyć swoją pierwszą interaktywną lekcję z AI korepetytorem. Notatka wygeneruje się automatycznie.
            </p>
            <Link
              href="/dashboard"
              className="cartoon-button mt-7 inline-flex items-center gap-3 rounded-2xl bg-[#ff5144] px-5 py-4 font-extrabold text-white"
            >
              <Plus className="h-5 w-5" />
              Rozpocznij naukę
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sessions.map((session) => (
              <Link
                key={session.id}
                href={`/dashboard/books/${session.id}?tab=notes`}
                className="cartoon-panel group flex min-h-64 flex-col justify-between rounded-[28px] p-5 transition-transform hover:-translate-y-1"
              >
                <div>
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff4cf] text-[#ff5144]">
                      <FileText className="h-7 w-7" strokeWidth={2.7} />
                    </span>
                    <span className="rounded-full bg-[#eafff4] px-3 py-2 text-xs font-extrabold text-[#11805e]">
                      Wygenerowano notatkę
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold leading-snug text-[#06296b] group-hover:text-[#7057ff]">
                    {session.topic}
                  </h2>
                  <p className="mt-2 text-xs font-bold text-[#9aa8c1]">
                    Zakończono {new Date(session.createdAt).toLocaleDateString('pl-PL')}
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-end gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#7057ff] text-white">
                    <ChevronRight className="h-5 w-5" strokeWidth={2.7} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  )
}
