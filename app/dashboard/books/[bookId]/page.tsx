'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  Brain,
  ChevronLeft,
  MessageCircle,
  Sparkles,
  Network,
  StickyNote,
  FileText,
} from 'lucide-react'
import DashboardLayout from '@/src/components/DashboardLayout'
import KnowledgeGraph from '@/src/components/KnowledgeGraph'
import ChatPanel from '@/src/components/ChatPanel'
import MindMap from '@/src/components/MindMap'
import Flashcards from '@/src/components/Flashcards'
import NotesPanel from '@/src/components/NotesPanel'
import { readJsonSafely } from '@/src/lib/http/json'

type DetailTab = 'graph' | 'chat' | 'mindmap' | 'flashcards' | 'notes'

const tabs: { id: DetailTab; label: string; icon: LucideIcon }[] = [
  { id: 'graph', label: 'Graf wiedzy', icon: Network },
  { id: 'mindmap', label: 'Mapa myśli', icon: Brain },
  { id: 'notes', label: 'Notatki AI', icon: FileText },
  { id: 'flashcards', label: 'Fiszki', icon: StickyNote },
  { id: 'chat', label: 'Czat z AI', icon: MessageCircle },
]

export default function BookDetailPage() {
  const params = useParams<{ bookId: string }>()
  const searchParams = useSearchParams()
  const bookId = params.bookId
  const tabParam = searchParams.get('tab') as DetailTab | null
  const [activeTab, setActiveTab] = useState<DetailTab>(
    tabParam && tabs.some(t => t.id === tabParam) ? tabParam : 'graph'
  )
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedNodeDetails, setSelectedNodeDetails] = useState<{
    id: string
    label: string
    type: string
    content: string
    related: Array<{ id: string; label: string; relation: string; direction: 'incoming' | 'outgoing' }>
  } | null>(null)
  const [selectedNodeLoading, setSelectedNodeLoading] = useState(false)
  const [selectedNodeError, setSelectedNodeError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadNodeDetails() {
      if (!selectedNodeId) {
        setSelectedNodeDetails(null)
        setSelectedNodeError('')
        return
      }

      try {
        setSelectedNodeLoading(true)
        setSelectedNodeError('')
        const res = await fetch(`/api/books/${bookId}/graph/node/${selectedNodeId}`)
        const data = await readJsonSafely<{
          error?: string
          node?: {
            id: string
            label: string
            type: string
            content: string
            related: Array<{ id: string; label: string; relation: string; direction: 'incoming' | 'outgoing' }>
          }
        }>(res)

        if (!res.ok) {
          throw new Error(data?.error || 'Nie udało się pobrać treści węzła.')
        }

        if (!cancelled) {
          setSelectedNodeDetails(data?.node || null)
        }
      } catch (error: unknown) {
        if (!cancelled) {
          setSelectedNodeDetails(null)
          setSelectedNodeError(error instanceof Error ? error.message : 'Nie udało się pobrać treści węzła.')
        }
      } finally {
        if (!cancelled) {
          setSelectedNodeLoading(false)
        }
      }
    }

    void loadNodeDetails()

    return () => {
      cancelled = true
    }
  }, [bookId, selectedNodeId])

  return (
    <DashboardLayout>
      <Link
        href="/dashboard/books"
        className="mb-5 inline-flex items-center gap-2 rounded-xl border border-[#dce7f5] bg-white px-4 py-2 text-sm font-extrabold text-[#06296b]"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={2.7} />
        Wróć do materiałów
      </Link>

      <section className="cartoon-panel overflow-hidden rounded-[32px]">
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
          <div className="flex gap-5">
            <div className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-[26px] bg-[#fff4cf] text-[#ff5144] sm:flex">
              <BookOpen className="h-10 w-10" strokeWidth={2.7} />
            </div>
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f6dec0] bg-[#fff4cf] px-4 py-2 text-sm font-extrabold text-[#06296b]">
                <Sparkles className="h-4 w-4 text-[#ff5144]" fill="#ff5144" />
                Materiał #{bookId.slice(0, 8)}
              </div>
              <h1 className="font-display text-5xl leading-none text-[#06296b] md:text-6xl">
                Studio nauki
              </h1>
              <p className="mt-4 max-w-2xl text-base font-bold leading-7 text-[#6e7fa6]">
                Przeglądaj graf wiedzy, mapę myśli, notatki AI, fiszki i rozmawiaj z korepetytorem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mt-5 grid gap-4 md:grid-cols-3">
        {[
          {
            title: 'Graf wiedzy',
            text: 'Mapa pojęć i zależności.',
            icon: Network,
            color: 'bg-[#7057ff]',
            tab: 'graph' as DetailTab,
          },
          {
            title: 'Notatki AI',
            text: 'Automatyczne notatki z materiału.',
            icon: FileText,
            color: 'bg-[#20b981]',
            tab: 'notes' as DetailTab,
          },
          {
            title: 'Mapa myśli',
            text: 'Hierarchiczna struktura dokumentu.',
            icon: Brain,
            color: 'bg-[#ffb84d]',
            tab: 'mindmap' as DetailTab,
          },
        ].map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.title}
              onClick={() => setActiveTab(item.tab)}
              className="cartoon-panel rounded-[28px] p-5 text-left transition-transform hover:-translate-y-1"
            >
              <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-white ${item.color}`}>
                <Icon className="h-6 w-6" strokeWidth={2.7} />
              </div>
              <h2 className="text-lg font-extrabold text-[#06296b]">{item.title}</h2>
              <p className="mt-2 text-sm font-bold leading-6 text-[#6e7fa6]">{item.text}</p>
            </button>
          )
        })}
      </section>

      {/* Tab bar */}
      <section className="mt-7">
        <div className="cartoon-panel mb-5 flex flex-wrap gap-1 rounded-2xl p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#7057ff] text-white'
                    : 'text-[#6e7fa6] hover:text-[#06296b]'
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={2.7} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <div className="cartoon-panel rounded-[32px] p-3 md:p-5">
          {activeTab === 'graph' && (
            <div className="grid gap-4">
              <div className="h-[520px] overflow-hidden rounded-[26px] bg-white md:h-[640px]">
                <KnowledgeGraph bookId={bookId} onSelectNode={setSelectedNodeId} />
              </div>

              <div className="rounded-[26px] border border-[#dce7f5] bg-white p-5 md:p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-display text-4xl leading-none text-[#06296b] md:text-5xl">Treść wybranego węzła</h3>
                  {selectedNodeDetails && (
                    <span className="rounded-full border border-[#f0edff] bg-[#f6f4ff] px-4 py-1.5 text-sm font-extrabold text-[#7057ff]">
                      {selectedNodeDetails.type}
                    </span>
                  )}
                </div>

                {!selectedNodeId && (
                  <p className="mt-4 text-base font-bold leading-7 text-[#6e7fa6] md:text-lg">
                    Kliknij pojęcie w grafie, a pod spodem pokażę fragment materiału powiązany z tym węzłem.
                  </p>
                )}

                {selectedNodeLoading && (
                  <p className="mt-4 text-base font-bold text-[#6e7fa6] md:text-lg">Ładuję treść wybranego węzła...</p>
                )}

                {selectedNodeError && (
                  <p className="mt-4 rounded-2xl border border-[#ffd3cf] bg-[#fff0ef] px-4 py-3 text-base font-bold text-[#d8342b] md:text-lg">
                    {selectedNodeError}
                  </p>
                )}

                {selectedNodeDetails && !selectedNodeLoading && (
                  <div className="mt-5 grid gap-5">
                    <div>
                      <p className="text-2xl font-extrabold text-[#06296b] md:text-3xl">{selectedNodeDetails.label}</p>
                      <div className="mt-3 rounded-[22px] bg-[#fffefb] p-4">
                        <p className="whitespace-pre-wrap text-base font-bold leading-8 text-[#33456b] md:text-lg md:leading-9">
                          {selectedNodeDetails.content || 'Ten węzeł nie ma jeszcze przypisanego fragmentu źródłowego.'}
                        </p>
                      </div>
                    </div>

                    {selectedNodeDetails.related.length > 0 && (
                      <div>
                        <p className="text-base font-extrabold uppercase tracking-[0.16em] text-[#6e7fa6]">
                          Powiązania
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {selectedNodeDetails.related.map((item) => (
                            <button
                              key={`${item.direction}-${item.id}-${item.relation}`}
                              type="button"
                              onClick={() => setSelectedNodeId(item.id)}
                              className="rounded-2xl border border-[#dce7f5] bg-[#fffefb] px-4 py-3 text-left text-sm font-bold text-[#06296b] transition-colors hover:border-[#7057ff] hover:bg-[#f6f4ff] md:text-base"
                            >
                              {item.label} • {item.relation}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <ChatPanel bookId={bookId} selectedNodeId={selectedNodeId} />
          )}

          {activeTab === 'mindmap' && (
            <MindMap sessionId={bookId} />
          )}

          {activeTab === 'flashcards' && (
            <Flashcards sessionId={bookId} />
          )}

          {activeTab === 'notes' && (
            <NotesPanel sessionId={bookId} onOpenChat={() => setActiveTab('chat')} />
          )}
        </div>
      </section>
    </DashboardLayout>
  )
}
