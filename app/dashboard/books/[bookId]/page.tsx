'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  BookOpen,
  Brain,
  ChevronLeft,
  MessageCircle,
  PlayCircle,
  Share2,
  Sparkles,
} from 'lucide-react'
import DashboardLayout from '@/src/components/DashboardLayout'
import KnowledgeGraph from '@/src/components/KnowledgeGraph'
import ChatPanel from '@/src/components/ChatPanel'

type DetailTab = 'graph' | 'chat'

export default function BookDetailPage() {
  const params = useParams<{ bookId: string }>()
  const bookId = params.bookId
  const [activeTab, setActiveTab] = useState<DetailTab>('graph')
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

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
                Przeglądaj graf wiedzy, klikaj pojęcia i rozmawiaj z AI korepetytorem o
                konkretnych fragmentach materiału.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-3 rounded-2xl border border-[#dce7f5] bg-white px-5 py-4 font-extrabold text-[#06296b]"
          >
            <Share2 className="h-5 w-5" strokeWidth={2.7} />
            Udostępnij
          </button>
        </div>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-3">
        {[
          {
            title: 'Graf wiedzy',
            text: 'Mapa pojęć i zależności z pliku.',
            icon: Brain,
            color: 'bg-[#7057ff]',
          },
          {
            title: 'Czat kontekstowy',
            text: 'Pytaj o fragmenty i trudne tematy.',
            icon: MessageCircle,
            color: 'bg-[#20b981]',
          },
          {
            title: 'Nagrania AI',
            text: 'Tu pojawią się wyjaśnienia korepetytorów.',
            icon: PlayCircle,
            color: 'bg-[#ff5144]',
          },
        ].map((item) => {
          const Icon = item.icon
          return (
            <article key={item.title} className="cartoon-panel rounded-[28px] p-5">
              <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-white ${item.color}`}>
                <Icon className="h-6 w-6" strokeWidth={2.7} />
              </div>
              <h2 className="text-lg font-extrabold text-[#06296b]">{item.title}</h2>
              <p className="mt-2 text-sm font-bold leading-6 text-[#6e7fa6]">{item.text}</p>
            </article>
          )
        })}
      </section>

      <section className="mt-7">
        <div className="cartoon-panel mb-5 flex w-fit gap-1 rounded-2xl p-1">
          <button
            type="button"
            onClick={() => setActiveTab('graph')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold transition-colors ${
              activeTab === 'graph' ? 'bg-[#7057ff] text-white' : 'text-[#6e7fa6] hover:text-[#06296b]'
            }`}
          >
            <Brain className="h-4 w-4" strokeWidth={2.7} />
            Graf wiedzy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold transition-colors ${
              activeTab === 'chat' ? 'bg-[#7057ff] text-white' : 'text-[#6e7fa6] hover:text-[#06296b]'
            }`}
          >
            <MessageCircle className="h-4 w-4" strokeWidth={2.7} />
            Czat z AI
          </button>
        </div>

        {activeTab === 'graph' ? (
          <div className="cartoon-panel rounded-[32px] p-3 md:p-5">
            <div className="h-[520px] overflow-hidden rounded-[26px] bg-white md:h-[640px]">
              <KnowledgeGraph bookId={bookId} onSelectNode={setSelectedNodeId} />
            </div>
          </div>
        ) : (
          <div className="cartoon-panel rounded-[32px] p-3 md:p-5">
            <ChatPanel bookId={bookId} selectedNodeId={selectedNodeId} />
          </div>
        )}
      </section>
    </DashboardLayout>
  )
}
