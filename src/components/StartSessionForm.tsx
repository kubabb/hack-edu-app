'use client'

import { useCallback, useState } from 'react'
import { File, Loader2, MessageCircle, FileText, Play, Upload, X } from 'lucide-react'
import { readJsonSafely } from '@/src/lib/http/json'
import { useRouter } from 'next/navigation'

type SessionMode = 'chat' | 'notes'

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return 'Nie udało się wystartować sesji'
}

export default function StartSessionForm() {
  const router = useRouter()
  const [topic, setTopic] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<SessionMode>('chat')

  const pickFile = useCallback(
    (nextFile: File) => {
      setFile(nextFile)
      if (!topic) setTopic(nextFile.name.replace(/\.[^/.]+$/, ''))
    },
    [topic],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const nextFile = e.dataTransfer.files[0]
      if (nextFile) pickFile(nextFile)
    },
    [pickFile],
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = e.target.files?.[0]
    if (nextFile) pickFile(nextFile)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!topic.trim()) {
      setError('Podaj temat lub wgraj plik')
      return
    }

    setStarting(true)
    setError('')

    const formData = new FormData()
    formData.append('title', topic.trim())
    formData.append('mode', mode)
    if (file) {
      formData.append('file', file)
    }

    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        body: formData,
      })

      const data = await readJsonSafely<{ error?: string; sessionId?: string }>(res)
      if (!res.ok) throw new Error(data?.error || `Błąd serwera: ${res.status}`)

      if (data?.sessionId) {
        if (mode === 'notes') {
          // Tryb notatek: przekieruj do widoku materiału z zakładką notatek
          router.push(`/dashboard/books/${data.sessionId}?tab=notes`)
        } else {
          // Tryb rozmowy: LiveAvatar
          router.push(`/dashboard/session/${data.sessionId}`)
        }
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err))
      setStarting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      {/* Mode toggle */}
      <div className="grid gap-2">
        <span className="text-sm font-extrabold text-[#06296b]">Tryb sesji:</span>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setMode('chat')}
            className={`flex flex-1 items-center justify-center gap-3 rounded-2xl border-2 px-5 py-4 text-sm font-extrabold transition-all ${
              mode === 'chat'
                ? 'border-[#7057ff] bg-[#f0edff] text-[#7057ff] shadow-md'
                : 'border-[#dce7f5] bg-white text-[#6e7fa6] hover:border-[#7057ff]'
            }`}
          >
            <MessageCircle className="h-5 w-5" strokeWidth={2.7} />
            <div className="text-left">
              <p className="text-base">Rozmowa z tutorem</p>
              <p className="text-xs font-bold opacity-70">LiveAvatar AI</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMode('notes')}
            className={`flex flex-1 items-center justify-center gap-3 rounded-2xl border-2 px-5 py-4 text-sm font-extrabold transition-all ${
              mode === 'notes'
                ? 'border-[#20b981] bg-[#eafff4] text-[#11805e] shadow-md'
                : 'border-[#dce7f5] bg-white text-[#6e7fa6] hover:border-[#20b981]'
            }`}
          >
            <FileText className="h-5 w-5" strokeWidth={2.7} />
            <div className="text-left">
              <p className="text-base">Generuj notatki</p>
              <p className="text-xs font-bold opacity-70">Fiszki, graf, mapa myśli</p>
            </div>
          </button>
        </div>
      </div>

      <div className="grid gap-2 text-sm font-extrabold text-[#06296b]">
        {mode === 'chat' ? 'Czego chcesz się dzisiaj uczyć?' : 'Czego dotyczą materiały?'}
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={mode === 'chat' ? 'np. Czas Present Simple...' : 'np. Biologia - układ nerwowy'}
          className="w-full rounded-3xl border border-[#dce7f5] bg-white px-5 py-5 text-lg font-bold text-[#06296b] outline-none placeholder:text-[#a5b1ca] focus:border-[#7057ff] focus:ring-4 focus:ring-[#f0edff]"
          required
        />
      </div>

      <div className="grid gap-2">
        <span className="text-sm font-extrabold text-[#6e7fa6]">
          {mode === 'chat' ? 'Masz notatki? Opcjonalnie wgraj plik PDF:' : 'Wgraj plik PDF do analizy:'}
        </span>
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`rounded-[28px] border-2 border-dashed p-6 text-center transition-colors ${
            dragOver ? 'border-[#7057ff] bg-[#f0edff]' : 'border-[#dce7f5] bg-[#fffefb]'
          }`}
        >
          {file ? (
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:text-left">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff4cf] text-[#ff5144]">
                <File className="h-7 w-7" strokeWidth={2.7} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-extrabold text-[#06296b]">{file.name}</p>
                <p className="mt-1 text-sm font-bold text-[#6e7fa6]">
                  {(file.size / 1024 / 1024).toFixed(2)} MB, gotowe
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                aria-label="Usuń plik"
                className="rounded-2xl bg-[#fff0ef] p-3 text-[#d8342b]"
              >
                <X className="h-5 w-5" strokeWidth={2.7} />
              </button>
            </div>
          ) : (
            <label className="block cursor-pointer">
              <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#eafff4] text-[#11805e]">
                <Upload className="h-6 w-6" strokeWidth={2.7} />
              </span>
              <span className="block text-base font-extrabold text-[#06296b]">
                Przeciągnij plik albo kliknij
              </span>
              <input type="file" accept=".pdf,image/*" onChange={handleFileChange} className="hidden" />
            </label>
          )}
        </div>
      </div>

      {error && (
        <p className="rounded-2xl border border-[#ffd3cf] bg-[#fff0ef] px-4 py-3 text-sm font-bold text-[#d8342b]">
          {error}
        </p>
      )}

      <button
        type="submit"
        suppressHydrationWarning
        disabled={!topic.trim() || starting}
        className={`cartoon-button mt-4 inline-flex w-full items-center justify-center gap-3 rounded-[24px] px-6 py-5 font-display text-2xl text-white transition-transform hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-60 ${
          mode === 'notes' ? 'bg-[#20b981]' : 'bg-[#7057ff]'
        }`}
      >
        {starting ? <Loader2 className="h-6 w-6 animate-spin" /> : mode === 'notes' ? <FileText className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current" />}
        {starting ? 'Przygotowywanie...' : mode === 'notes' ? 'Analizuj materiał' : 'Zaczynamy!'}
      </button>
    </form>
  )
}
