'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { ChevronLeft, FileCheck, Share2, FileText, MessageCircle, Network, Layers } from 'lucide-react'
import DashboardLayout from '@/src/components/DashboardLayout'
import Flashcards from '@/src/components/Flashcards'
import ChatPanel from '@/src/components/ChatPanel'
import MindMap from '@/src/components/MindMap'
import { readJsonSafely } from '@/src/lib/http/json'

interface SummaryData {
  topic: string;
  summary: string;
  createdAt: string;
}

interface SessionListItem {
  id: string
  topic: string
  summary?: string | null
  createdAt: string
}

type TabType = 'note' | 'map' | 'flashcards' | 'chat'

export default function SessionSummaryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const sessionId = resolvedParams.id
  const [data, setData] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('note')

  useEffect(() => {
    async function loadSummary() {
      try {
        const res = await fetch(`/api/sessions`)
        if (!res.ok) throw new Error('Błąd pobierania sesji')
        const json = await readJsonSafely<{ sessions?: SessionListItem[] }>(res)
        const session = json?.sessions?.find((item) => item.id === sessionId)
        
        if (!session) throw new Error('Sesja nie znaleziona')
        
        setData({
          topic: session.topic,
          summary: session.summary || 'Trwa generowanie podsumowania...',
          createdAt: session.createdAt
        })
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Nie udało się pobrać podsumowania.')
      } finally {
        setLoading(false)
      }
    }
    loadSummary()
  }, [sessionId])

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Link href="/dashboard/books" className="mb-6 inline-flex items-center gap-2 text-sm font-extrabold text-[#7057ff] hover:underline">
          <ChevronLeft className="h-4 w-4" /> Wróć do materiałów
        </Link>
        
        <div className="cartoon-panel overflow-hidden rounded-[32px]">
          {loading ? (
             <div className="flex justify-center py-20">
               <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#dce7f5] border-b-[#7057ff]" />
             </div>
          ) : error ? (
            <div className="p-12 text-center text-red-500 font-bold">{error}</div>
          ) : data ? (
            <>
              {/* Header */}
              <div className="border-b border-[#f0edff] bg-white p-8 md:p-10">
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="mb-4 inline-flex items-center justify-center rounded-2xl bg-[#eafff4] p-4 text-[#11805e]">
                      <FileCheck className="h-8 w-8" strokeWidth={2.7} />
                    </div>
                    <h1 className="font-display text-4xl text-[#06296b] md:text-5xl">{data.topic}</h1>
                    <p className="mt-2 text-sm font-bold text-[#6e7fa6]">
                      Zakończono {new Date(data.createdAt).toLocaleDateString('pl-PL')}
                    </p>
                  </div>
                  <button className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f3f6ff] text-[#7057ff] transition-transform hover:-translate-y-1">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveTab('note')}
                    className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold transition-all ${
                      activeTab === 'note'
                        ? 'bg-[#7057ff] text-white shadow-[0_4px_0_0_#5a46cc] active:translate-y-1 active:shadow-none'
                        : 'bg-[#f3f6ff] text-[#6e7fa6] hover:bg-[#e6eaff] hover:text-[#06296b]'
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                    Notatka
                  </button>
                  <button
                    onClick={() => setActiveTab('map')}
                    className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold transition-all ${
                      activeTab === 'map'
                        ? 'bg-[#20b981] text-white shadow-[0_4px_0_0_#189a69] active:translate-y-1 active:shadow-none'
                        : 'bg-[#f3f6ff] text-[#6e7fa6] hover:bg-[#eafff4] hover:text-[#11805e]'
                    }`}
                  >
                    <Network className="h-4 w-4" />
                    Mapa Myśli
                  </button>
                  <button
                    onClick={() => setActiveTab('flashcards')}
                    className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold transition-all ${
                      activeTab === 'flashcards'
                        ? 'bg-[#ff5144] text-white shadow-[0_4px_0_0_#d8342b] active:translate-y-1 active:shadow-none'
                        : 'bg-[#f3f6ff] text-[#6e7fa6] hover:bg-[#fff0ef] hover:text-[#d8342b]'
                    }`}
                  >
                    <Layers className="h-4 w-4" />
                    Fiszki
                  </button>
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold transition-all ${
                      activeTab === 'chat'
                        ? 'bg-[#ffb84d] text-[#06296b] shadow-[0_4px_0_0_#e39a31] active:translate-y-1 active:shadow-none'
                        : 'bg-[#f3f6ff] text-[#6e7fa6] hover:bg-[#fff4cf] hover:text-[#06296b]'
                    }`}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Czat z AI
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="bg-[#fffefb] p-8 md:p-10">
                {activeTab === 'note' && (
                  <div className="prose prose-lg prose-[#06296b] max-w-none prose-headings:font-display prose-headings:text-[#7057ff] prose-a:text-[#ff5144]">
                    <div dangerouslySetInnerHTML={{ 
                      __html: data.summary.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                    }} />
                  </div>
                )}
                {activeTab === 'map' && (
                  <div className="h-[600px] w-full overflow-hidden rounded-[26px] border border-[#dce7f5]">
                    <MindMap sessionId={sessionId} />
                  </div>
                )}
                {activeTab === 'flashcards' && (
                  <Flashcards sessionId={sessionId} />
                )}
                {activeTab === 'chat' && (
                  <ChatPanel bookId={sessionId} />
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  )
}

