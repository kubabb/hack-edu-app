'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { ChevronLeft, FileCheck, Share2 } from 'lucide-react'
import DashboardLayout from '@/src/components/DashboardLayout'

interface SummaryData {
  topic: string;
  summary: string;
  createdAt: string;
}

export default function SessionSummaryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const sessionId = resolvedParams.id
  const [data, setData] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadSummary() {
      try {
        const res = await fetch(`/api/sessions`)
        if (!res.ok) throw new Error('Błąd pobierania sesji')
        const json = await res.json()
        const session = json.sessions?.find((b: any) => b.id === sessionId)
        
        if (!session) throw new Error('Sesja nie znaleziona')
        
        setData({
          topic: session.topic,
          summary: session.summary || 'Trwa generowanie podsumowania...',
          createdAt: session.createdAt
        })
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadSummary()
  }, [sessionId])

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm font-extrabold text-[#7057ff] hover:underline">
          <ChevronLeft className="h-4 w-4" /> Wróć do panelu
        </Link>
        
        <div className="cartoon-panel rounded-[32px] p-8 md:p-12">
          {loading ? (
             <div className="flex justify-center py-20">
               <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#dce7f5] border-b-[#7057ff]" />
             </div>
          ) : error ? (
            <div className="text-center text-red-500 font-bold">{error}</div>
          ) : data ? (
            <>
              <div className="mb-8 flex items-start justify-between gap-4 border-b border-[#f0edff] pb-8">
                <div>
                  <div className="mb-4 inline-flex items-center justify-center rounded-2xl bg-[#eafff4] p-4 text-[#11805e]">
                    <FileCheck className="h-8 w-8" strokeWidth={2.7} />
                  </div>
                  <h1 className="font-display text-4xl text-[#06296b]">{data.topic}</h1>
                  <p className="mt-2 text-sm font-bold text-[#6e7fa6]">
                    Podsumowanie lekcji z {new Date(data.createdAt).toLocaleDateString('pl-PL')}
                  </p>
                </div>
                <button className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3f6ff] text-[#7057ff] transition-transform hover:-translate-y-1">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>

              <div className="prose prose-lg prose-[#06296b] max-w-none prose-headings:font-display prose-headings:text-[#7057ff] prose-a:text-[#ff5144]">
                {/* Renderujemy Markdown. Tu dla uproszczenia wyświetlamy jako tekst lub podstawowe formatowanie */}
                <div dangerouslySetInnerHTML={{ 
                  __html: data.summary.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                }} />
              </div>
            </>
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  )
}
