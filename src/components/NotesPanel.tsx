'use client'

import { useState, useEffect } from 'react'
import { Loader2, FileText, RefreshCw, AlertCircle } from 'lucide-react'

interface NotesData {
  id: string
  topic: string
  notes: string | null
  status: string
  chunkCount: number
  fragmentCount?: number
  totalChunks?: number
}

function renderMarkdown(text: string): React.ReactNode {
  if (!text) return null
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []

  let inCodeBlock = false
  let codeContent = ''
  let codeLanguage = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Code block
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${i}`} className="my-4 overflow-x-auto rounded-2xl bg-[#06296b] p-4">
            <code className="text-sm text-[#6ff0ae]">{codeContent}</code>
          </pre>
        )
        codeContent = ''
        inCodeBlock = false
      } else {
        inCodeBlock = true
        codeLanguage = line.slice(3).trim()
      }
      continue
    }
    if (inCodeBlock) {
      codeContent += (codeContent ? '\n' : '') + line
      continue
    }

    // Headers
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={i} className="mt-8 mb-4 font-display text-3xl leading-none text-[#06296b]">
          {line.slice(2)}
        </h1>
      )
      continue
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="mt-6 mb-3 font-display text-2xl leading-tight text-[#7057ff]">
          {line.slice(3)}
        </h2>
      )
      continue
    }
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="mt-4 mb-2 font-extrabold text-lg text-[#06296b]">
          {line.slice(4)}
        </h3>
      )
      continue
    }

    // Bold / italic inline
    let processed = line
    // Bold
    processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong class="font-extrabold">$1</strong>')
    // Italic
    processed = processed.replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    processed = processed.replace(/`([^`]+)`/g, '<code class="rounded-lg bg-[#f3f6ff] px-1.5 py-0.5 text-sm text-[#ff5144] font-bold">$1</code>')

    // List items
    const isListItem = /^[\s]*[-*+]\s/.test(line) || /^\d+\.\s/.test(line)

    if (line.trim() === '') {
      elements.push(<div key={i} className="h-3" />)
    } else if (isListItem) {
      elements.push(
        <div key={i} className="ml-4 mb-1 flex gap-2 leading-relaxed">
          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#7057ff]" />
          <span
            className="text-sm font-bold text-[#06296b]"
            dangerouslySetInnerHTML={{ __html: processed.replace(/^[\s]*[-*+]\s*|^\d+\.\s*/, '') }}
          />
        </div>
      )
    } else {
      elements.push(
        <p key={i} className="mb-1 leading-relaxed text-sm font-bold text-[#06296b]">
          <span dangerouslySetInnerHTML={{ __html: processed }} />
        </p>
      )
    }
  }

  return <>{elements}</>
}

export default function NotesPanel({ sessionId }: { sessionId: string }) {
  const [notes, setNotes] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [stats, setStats] = useState<{ fragmentCount?: number; totalChunks?: number }>({})

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`/api/sessions/${sessionId}/notes`)
        if (!res.ok) {
          const err = await res.json()
          if (!cancelled) setError(err.error || 'Błąd ładowania')
          return
        }
        const data: NotesData = await res.json()
        if (cancelled) return
        if (data.notes) {
          setNotes(data.notes)
        } else {
          setError('Brak notatek. Kliknij "Generuj notatki" aby stworzyć.')
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [sessionId])

  const handleGenerate = async () => {
    setGenerating(true)
    setError('')
    try {
      const res = await fetch(`/api/sessions/${sessionId}/notes`, { method: 'POST' })
      if (!res.ok) {
        const err = await res.json()
        setError(err.error || 'Błąd generowania')
        return
      }
      const data = await res.json()
      setNotes(data.notes)
      setStats({ fragmentCount: data.fragmentCount, totalChunks: data.totalChunks })
    } catch (e: any) {
      setError(e.message)
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[32px] bg-[#fffefb] p-8 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#7057ff]" />
        <p className="mt-4 font-bold text-[#6e7fa6]">Ładuję notatki...</p>
      </div>
    )
  }

  if (generating) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[32px] bg-[#fffefb] p-8 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#20b981]" />
        <p className="mt-4 font-bold text-[#6e7fa6]">AI analizuje materiał i tworzy notatki...</p>
        <p className="mt-2 text-sm text-[#a5b1ca]">To może potrwać do 30 sekund</p>
      </div>
    )
  }

  return (
    <div className="rounded-[32px] bg-[#fffefb] p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#dce7f5] bg-[#f0edff] px-4 py-2 text-sm font-extrabold text-[#7057ff]">
          <FileText className="h-4 w-4" />
          Notatki AI
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#20b981] px-5 py-3 text-sm font-extrabold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
          {notes ? 'Regeneruj notatki' : 'Generuj notatki'}
        </button>
      </div>

      {stats.fragmentCount && (
        <div className="mb-4 rounded-2xl bg-[#eafff4] px-4 py-2 text-xs font-bold text-[#11805e]">
          Wygenerowano z {stats.fragmentCount} fragmentów (z {stats.totalChunks} dostępnych)
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 flex flex-col items-center justify-center rounded-[24px] bg-[#fff0ef] p-8 text-center">
          <AlertCircle className="h-10 w-10 text-[#d8342b]" />
          <p className="mt-4 font-bold text-[#d8342b]">{error}</p>
          {!notes && (
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[#ff5144] px-5 py-3 text-sm font-extrabold text-white transition-transform hover:-translate-y-0.5"
            >
              <RefreshCw className="h-4 w-4" />
              Spróbuj ponownie
            </button>
          )}
        </div>
      )}

      {/* Notes content */}
      {notes ? (
        <div className="prose prose-lg max-w-none">
          {renderMarkdown(notes)}
        </div>
      ) : !error ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-[26px] bg-[#f0edff] text-[#7057ff]">
            <FileText className="h-10 w-10" strokeWidth={2.7} />
          </div>
          <p className="font-display text-2xl leading-none text-[#06296b]">Brak notatek</p>
          <p className="mt-2 max-w-sm text-sm font-bold text-[#6e7fa6]">
            Kliknij "Generuj notatki" aby AI przeanalizowało materiał i stworzyło uporządkowane notatki.
          </p>
        </div>
      ) : null}
    </div>
  )
}
