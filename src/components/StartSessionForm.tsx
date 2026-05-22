'use client'

import { useCallback, useState } from 'react'
import { File, Loader2, Play, Upload, X } from 'lucide-react'
import { readJsonSafely } from '@/src/lib/http/json'
import { useRouter } from 'next/navigation'

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
        // Przekierowanie do poczekalni (lub widoku Live), która zajmie się dalszym procesem
        router.push(`/dashboard/session/${data.sessionId}`)
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err))
      setStarting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className="grid gap-2 text-sm font-extrabold text-[#06296b]">
        Czego chcesz się dzisiaj uczyć?
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="np. Czas Present Simple..."
          className="w-full rounded-3xl border border-[#dce7f5] bg-white px-5 py-5 text-lg font-bold text-[#06296b] outline-none placeholder:text-[#a5b1ca] focus:border-[#7057ff] focus:ring-4 focus:ring-[#f0edff]"
          required
        />
      </div>

      <div className="grid gap-2">
        <span className="text-sm font-extrabold text-[#6e7fa6]">Masz notatki? Opcjonalnie wgraj plik PDF:</span>
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
        className="cartoon-button mt-4 inline-flex w-full items-center justify-center gap-3 rounded-[24px] bg-[#7057ff] px-6 py-5 font-display text-2xl text-white transition-transform hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {starting ? <Loader2 className="h-6 w-6 animate-spin" /> : <Play className="h-6 w-6 fill-current" />}
        {starting ? 'Przygotowywanie awatara...' : 'Zaczynamy!'}
      </button>
    </form>
  )
}
