'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Brain, ChevronRight, MessageSquare, Play } from 'lucide-react'
import DashboardLayout from '@/src/components/DashboardLayout'
import StartSessionForm from '@/src/components/StartSessionForm'
import { useUser } from '@/src/hooks/useUser'
import { readJsonSafely } from '@/src/lib/http/json'

interface Session {
  id: string
  topic: string
  status: string
  summary?: string | null
  createdAt: string
}

async function readSessions() {
  const res = await fetch('/api/sessions')
  const data = await readJsonSafely<{ sessions?: Session[] }>(res)
  return data?.sessions || []
}

export default function DashboardPage() {
  const { user } = useUser()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function loadSessions() {
      try {
        const nextSessions = await readSessions()
        if (!cancelled) setSessions(nextSessions)
      } catch {
        if (!cancelled) setSessions([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void loadSessions()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <DashboardLayout>
      <section className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-start">
        <div className="cartoon-panel rounded-[32px] p-6 md:p-10">
          <p className="mb-4 w-fit rounded-xl bg-[#7057ff] px-4 py-2 text-sm font-extrabold text-white">
            Witaj ponownie, {user?.name || 'Uczeń'}
          </p>
          <h1 className="font-display text-5xl leading-none text-[#06296b] md:text-6xl">
            Zacznijmy naukę!
          </h1>
          <p className="mt-4 mb-8 max-w-2xl text-base font-bold leading-7 text-[#6e7fa6]">
            Wpisz poniżej temat, którego chcesz się nauczyć, albo wgraj swoje notatki w PDF, a Twój osobisty Avatar AI przeprowadzi z Tobą interaktywną lekcję.
          </p>

          <StartSessionForm />
        </div>

        <div className="flex flex-col gap-6">
          <div className="cartoon-panel rounded-[28px] p-6">
            <h2 className="flex items-center gap-3 text-2xl font-display text-[#06296b]">
              <MessageSquare className="h-6 w-6 text-[#7057ff]" />
              Ostatnie sesje nauki
            </h2>
            
            <div className="mt-6 flex flex-col gap-3">
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#dce7f5] border-b-[#7057ff]" />
                </div>
              ) : sessions.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-[#dce7f5] p-8 text-center">
                  <p className="text-sm font-bold text-[#6e7fa6]">Jeszcze z nami nie rozmawiałeś. Zacznij swoją pierwszą sesję obok!</p>
                </div>
              ) : (
                sessions.slice(0, 5).map((session) => (
                  <Link
                    key={session.id}
                    href={`/dashboard/books/${session.id}${session.summary ? '?tab=notes' : ''}`}
                    className="group flex items-center justify-between rounded-2xl border border-[#dce7f5] bg-white p-4 transition-transform hover:-translate-y-1 hover:border-[#7057ff] hover:shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0edff] text-[#7057ff]">
                        <Brain className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-extrabold text-[#06296b] line-clamp-1">{session.topic}</p>
                        <p className="text-xs font-bold text-[#9aa8c1]">
                          {new Date(session.createdAt).toLocaleDateString('pl-PL')} {session.summary ? '· Zakończona (Podsumowanie)' : '· W trakcie'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-[#a5b1ca] group-hover:text-[#7057ff]" />
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </DashboardLayout>
  )
}
