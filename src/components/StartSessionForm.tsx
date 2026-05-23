'use client'

import { useCallback, useState } from 'react'
import { File, FolderOpen, Loader2, MessageCircle, FileText, Play, Upload, X } from 'lucide-react'
import { readJsonSafely } from '@/src/lib/http/json'
import { useRouter } from 'next/navigation'

type SessionMode = 'chat' | 'notes'

interface StartSessionFormProps {
  initialTopic?: string
  initialMode?: SessionMode
  youtubeUrl?: string
  youtubeTitle?: string
}

type UploadedFile = File & {
  webkitRelativePath?: string
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return 'Nie udało się wystartować sesji'
}

export default function StartSessionForm({
  initialTopic = '',
  initialMode = 'chat',
  youtubeUrl,
  youtubeTitle,
}: StartSessionFormProps) {
  const router = useRouter()
  const [topic, setTopic] = useState(initialTopic)
  const [files, setFiles] = useState<File[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<SessionMode>(initialMode)

  const pickFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const arr = Array.from(newFiles) as UploadedFile[]
      setFiles(arr)
      if (!topic && arr.length > 0) {
        // Use first file name or folder name as topic
        const firstName = arr[0].name.replace(/\.[^/.]+$/, '')
        // If it's a folder upload, use directory name
        const relativePath = arr[0].webkitRelativePath
        if (relativePath) {
          const dirName = relativePath.split('/')[0]
          setTopic(dirName)
        } else {
          setTopic(firstName)
        }
      }
    },
    [topic],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      if (e.dataTransfer.files.length > 0) {
        pickFiles(e.dataTransfer.files)
      }
    },
    [pickFiles],
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      pickFiles(e.target.files)
    }
  }

  const totalSize = files.reduce((sum, f) => sum + f.size, 0)
  const firstFile = files[0] as UploadedFile | undefined
  const isFolder = files.length > 1 || !!firstFile?.webkitRelativePath
  const directoryPickerAttributes = {
    webkitdirectory: '',
    directory: '',
  } as React.InputHTMLAttributes<HTMLInputElement> & {
    webkitdirectory: string
    directory: string
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
    if (youtubeUrl) {
      formData.append('youtubeUrl', youtubeUrl)
    }
    for (const f of files) {
      formData.append('file', f)
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
          router.push(`/dashboard/books/${data.sessionId}?tab=notes`)
        } else {
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

      {youtubeUrl && (
        <div className="rounded-[28px] border border-[#ffd9b5] bg-[#fff8eb] p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#ff5144] text-white">
              <Play className="h-5 w-5 fill-current" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-[#b85a00]">Transkrypcja z YouTube zostanie dołączona do sesji</p>
              <p className="mt-1 text-base font-extrabold text-[#06296b]">
                {youtubeTitle || 'Film z YouTube'}
              </p>
              <p className="mt-1 break-all text-xs font-bold text-[#8d6d3e]">{youtubeUrl}</p>
              <p className="mt-3 text-sm font-bold leading-6 text-[#6e7fa6]">
                Możesz teraz dodać własne pliki jako dodatkowy kontekst. Podczas startu sesji pobierzemy transkrypcję filmu i połączymy ją z tymi materiałami.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-2">
        <span className="text-sm font-extrabold text-[#6e7fa6]">
          {youtubeUrl
            ? mode === 'chat'
              ? 'Opcjonalnie dodaj PDF, Markdown, TXT lub folder jako dodatkowy kontekst:'
              : 'Opcjonalnie dodaj kolejne pliki (PDF, MD, TXT) lub cały folder:'
            : mode === 'chat'
              ? 'Masz notatki? Opcjonalnie wgraj PDF, Markdown, TXT lub folder:'
              : 'Wgraj pliki (PDF, MD, TXT) lub cały folder:'}
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
          {files.length > 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:text-left">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff4cf] text-[#ff5144]">
                {isFolder ? (
                  <FolderOpen className="h-7 w-7" strokeWidth={2.7} />
                ) : (
                  <File className="h-7 w-7" strokeWidth={2.7} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-extrabold text-[#06296b]">
                  {isFolder
                    ? `Folder: ${firstFile?.webkitRelativePath?.split('/')[0] || 'wybrany'}`
                    : files[0].name}
                </p>
                <p className="mt-1 text-sm font-bold text-[#6e7fa6]">
                  {files.length > 1
                    ? `${files.length} plików, ${(totalSize / 1024 / 1024).toFixed(2)} MB`
                    : `${(totalSize / 1024 / 1024).toFixed(2)} MB, gotowe`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFiles([])}
                aria-label="Usuń pliki"
                className="rounded-2xl bg-[#fff0ef] p-3 text-[#d8342b]"
              >
                <X className="h-5 w-5" strokeWidth={2.7} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <label className="block cursor-pointer">
                <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#eafff4] text-[#11805e]">
                  <Upload className="h-6 w-6" strokeWidth={2.7} />
                </span>
                <span className="block text-base font-extrabold text-[#06296b]">
                  Przeciągnij pliki albo kliknij
                </span>
                <input
                  type="file"
                  accept=".pdf,.md,.txt,image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <label className="block cursor-pointer">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#fff4cf] text-[#ff5144]">
                  <FolderOpen className="h-5 w-5" strokeWidth={2.7} />
                </span>
                <span className="block text-sm font-bold text-[#6e7fa6]">
                  lub wybierz folder
                </span>
                <input
                  {...directoryPickerAttributes}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
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
        {starting ? 'Przygotowywanie...' : mode === 'notes' ? 'Analizuj materiały' : youtubeUrl ? 'Przygotuj rozmowę' : 'Zaczynamy!'}
      </button>
    </form>
  )
}
