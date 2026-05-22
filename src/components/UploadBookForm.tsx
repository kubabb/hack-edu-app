'use client'

import { useCallback, useState } from 'react'
import { File, Loader2, Upload, X } from 'lucide-react'
import { readJsonSafely } from '@/src/lib/http/json'

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return 'Nie udało się przesłać pliku'
}

export default function UploadBookForm({ onUpload }: { onUpload: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const pickFile = useCallback(
    (nextFile: File) => {
      setFile(nextFile)
      if (!title) setTitle(nextFile.name.replace(/\.[^/.]+$/, ''))
    },
    [title],
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
    if (!file || !title.trim()) return
    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', title.trim())

    try {
      const res = await fetch('/api/books', { method: 'POST', body: formData })
      const data = await readJsonSafely<{ error?: string }>(res)
      if (!res.ok) throw new Error(data?.error || 'Błąd przesyłania')
      setFile(null)
      setTitle('')
      onUpload()
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`rounded-[28px] border-2 border-dashed p-8 text-center transition-colors ${
          dragOver ? 'border-[#7057ff] bg-[#f0edff]' : 'border-[#dce7f5] bg-[#fffefb]'
        }`}
      >
        {file ? (
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:text-left">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff4cf] text-[#ff5144]">
              <File className="h-8 w-8" strokeWidth={2.7} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-extrabold text-[#06296b]">{file.name}</p>
              <p className="mt-1 text-sm font-bold text-[#6e7fa6]">
                {(file.size / 1024 / 1024).toFixed(2)} MB, gotowe do przesłania
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
            <span className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[26px] bg-[#eafff4] text-[#11805e]">
              <Upload className="h-10 w-10" strokeWidth={2.7} />
            </span>
            <span className="block text-lg font-extrabold text-[#06296b]">
              Przeciągnij plik albo kliknij
            </span>
            <span className="mt-2 block text-sm font-bold text-[#6e7fa6]">
              PDF, JPG lub PNG do 50 MB
            </span>
            <input type="file" accept=".pdf,image/*" onChange={handleFileChange} className="hidden" />
          </label>
        )}
      </div>

      <label className="grid gap-2 text-sm font-extrabold text-[#06296b]">
        Tytuł materiału
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="np. Biologia - układ nerwowy"
          className="w-full rounded-2xl border border-[#dce7f5] bg-white px-4 py-4 text-sm font-bold text-[#06296b] outline-none placeholder:text-[#a5b1ca] focus:border-[#7057ff]"
          required
        />
      </label>

      {error && (
        <p className="rounded-2xl border border-[#ffd3cf] bg-[#fff0ef] px-4 py-3 text-sm font-bold text-[#d8342b]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!file || uploading}
        className="cartoon-button inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-[#ff5144] px-5 py-4 font-extrabold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
        {uploading ? 'Przetwarzanie...' : 'Prześlij i przetwórz'}
      </button>
    </form>
  )
}
