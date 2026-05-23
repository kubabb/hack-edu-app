'use client'

import { useState } from 'react'
import { Loader2, PlaySquare, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/src/components/DashboardLayout'
import { readJsonSafely } from '@/src/lib/http/json'

export default function YouTubeTranscriptPage() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) {
      setError('Wklej link do filmu z YouTube.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/youtube/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })

      const data = await readJsonSafely<{
        error?: string
        title?: string
        videoId?: string
      }>(res)

      if (!res.ok) {
        throw new Error(data?.error || 'Nie udało się sprawdzić filmu.')
      }

      const params = new URLSearchParams({
        youtubeUrl: url.trim(),
      })

      if (data?.title) {
        params.set('title', data.title)
      }

      if (data?.videoId) {
        params.set('videoId', data.videoId)
      }

      router.push(`/dashboard/youtube/create?${params.toString()}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Nie udało się sprawdzić filmu.')
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <section className="cartoon-panel overflow-hidden rounded-[32px]">
        <div className="grid gap-8 p-6 md:p-10">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#ffd9b5] bg-[#fff4cf] px-4 py-2 text-sm font-extrabold text-[#06296b]">
              <Sparkles className="h-4 w-4 text-[#ff5144]" fill="#ff5144" />
              Nowe źródło nauki
            </div>
            <h1 className="font-display text-5xl leading-none text-[#06296b] md:text-6xl">
              Dodaj transkrypcję z YouTube
            </h1>
            <p className="mt-4 max-w-3xl text-base font-bold leading-7 text-[#6e7fa6]">
              Wklej link do filmu, a przygotuję dla Ciebie ekran startu rozmowy z tutorem lub tworzenia notatek. Na następnym kroku będziesz mógł też dołączyć własne pliki jako dodatkowy kontekst.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-5 rounded-[28px] border border-[#dce7f5] bg-[#fffefb] p-6 md:p-8">
            <div className="grid gap-2">
              <label htmlFor="youtube-url" className="text-sm font-extrabold text-[#06296b]">
                Link do filmu YouTube
              </label>
              <input
                id="youtube-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full rounded-3xl border border-[#dce7f5] bg-white px-5 py-5 text-base font-bold text-[#06296b] outline-none placeholder:text-[#a5b1ca] focus:border-[#7057ff] focus:ring-4 focus:ring-[#f0edff]"
                required
              />
            </div>

            {error && (
              <p className="rounded-2xl border border-[#ffd3cf] bg-[#fff0ef] px-4 py-3 text-sm font-bold text-[#d8342b]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="cartoon-button inline-flex items-center justify-center gap-3 rounded-[24px] bg-[#ff5144] px-6 py-5 font-display text-2xl text-white transition-transform hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <PlaySquare className="h-6 w-6" />}
              {loading ? 'Sprawdzanie filmu...' : 'Przejdź dalej'}
            </button>
          </form>
        </div>
      </section>
    </DashboardLayout>
  )
}
