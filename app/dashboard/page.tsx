'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Brain, ChevronRight, FileText, Plus, Upload } from 'lucide-react'
import DashboardLayout from '@/src/components/DashboardLayout'
import UploadBookForm from '@/src/components/UploadBookForm'
import { useUser } from '@/src/hooks/useUser'
import { readJsonSafely } from '@/src/lib/http/json'

interface Book {
  id: string
  title: string
  status: string
  createdAt: string
  _count?: { pages: number; chunks: number }
}

function statusLabel(status: string) {
  return status === 'READY' ? 'Gotowa' : 'Przetwarzanie...'
}

async function readBooks() {
  const res = await fetch('/api/books')
  const data = await readJsonSafely<{ books?: Book[] }>(res)
  return data?.books || []
}

export default function DashboardPage() {
  const { user } = useUser()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)

  const refreshBooks = useCallback(async () => {
    setLoading(true)
    try {
      setBooks(await readBooks())
    } catch {
      setBooks([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadBooks() {
      try {
        const nextBooks = await readBooks()
        if (!cancelled) setBooks(nextBooks)
      } catch {
        if (!cancelled) setBooks([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadBooks()

    return () => {
      cancelled = true
    }
  }, [])

  const stats = [
    {
      label: 'Materiały',
      value: books.length,
      icon: BookOpen,
      color: 'bg-[#7057ff]',
      caption: 'książki i notatki',
    },
    {
      label: 'Strony',
      value: books.reduce((a, b) => a + (b._count?.pages || 0), 0),
      icon: FileText,
      color: 'bg-[#ff5144]',
      caption: 'do nauki',
    },
    {
      label: 'Chunki',
      value: books.reduce((a, b) => a + (b._count?.chunks || 0), 0),
      icon: Brain,
      color: 'bg-[#20b981]',
      caption: 'fragmenty wiedzy',
    },
  ]

  return (
    <DashboardLayout>
      <section className="cartoon-panel overflow-hidden rounded-[32px]">
        <div className="grid gap-8 p-6 md:grid-cols-[1.05fr_0.95fr] md:p-9">
          <div>
            <p className="mb-4 w-fit rounded-xl bg-[#7057ff] px-4 py-2 text-sm font-extrabold text-white">
              Dzień dobry, {user?.name || 'Uczeń'}
            </p>
            <h1 className="font-display text-5xl leading-none text-[#06296b] md:text-6xl">
              Twój plan nauki czeka
            </h1>
            <p className="mt-4 max-w-2xl text-base font-bold leading-7 text-[#6e7fa6]">
              Dodaj materiały, a TutorAI zamieni je w quizy, graf wiedzy i krótkie
              lekcje z AI korepetytorem.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowUpload((value) => !value)}
                className="cartoon-button inline-flex items-center justify-center gap-3 rounded-2xl bg-[#ff5144] px-5 py-4 font-extrabold text-white"
              >
                {showUpload ? 'Zamknij upload' : 'Dodaj materiał'}
                <Upload className="h-5 w-5" />
              </button>
              <Link
                href="/dashboard/books"
                className="inline-flex items-center justify-center gap-3 rounded-2xl border border-[#dce7f5] bg-white px-5 py-4 font-extrabold text-[#06296b]"
              >
                Moje materiały
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] bg-[#fff4cf] p-5">
            <h2 className="text-lg font-extrabold text-[#06296b]">Najbliższy quiz</h2>
            <div className="mt-4 rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-sm font-extrabold text-[#7057ff]">Powtórka dnia</p>
              <p className="mt-2 text-2xl font-extrabold text-[#06296b]">
                Funkcje, pojęcia i zadania
              </p>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#eef2ff]">
                <div className="h-full w-[68%] rounded-full bg-[#6ff0ae]" />
              </div>
              <p className="mt-3 text-sm font-bold text-[#6e7fa6]">68% gotowe do opanowania</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <article key={stat.label} className="cartoon-panel rounded-[28px] p-5">
              <div className="flex items-center gap-4">
                <span className={`flex h-14 w-14 items-center justify-center rounded-2xl text-white ${stat.color}`}>
                  <Icon className="h-7 w-7" strokeWidth={2.7} />
                </span>
                <div>
                  <p className="font-display text-4xl leading-none text-[#06296b]">{stat.value}</p>
                  <p className="text-sm font-extrabold text-[#6e7fa6]">{stat.label}</p>
                </div>
              </div>
              <p className="mt-4 text-sm font-bold text-[#9aa8c1]">{stat.caption}</p>
            </article>
          )
        })}
      </section>

      {showUpload && (
        <section className="cartoon-panel mt-6 rounded-[32px] p-6 md:p-8">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-4xl leading-none text-[#06296b]">Dodaj nowy materiał</h2>
              <p className="mt-2 text-sm font-bold text-[#6e7fa6]">
                PDF lub obraz trafi do analizy, a potem do grafu wiedzy.
              </p>
            </div>
          </div>
          <UploadBookForm onUpload={() => { setShowUpload(false); void refreshBooks(); }} />
        </section>
      )}

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-4xl text-[#06296b]">Ostatnie materiały</h2>
          <Link
            href="/dashboard/books"
            className="hidden rounded-xl bg-white px-4 py-2 text-sm font-extrabold text-[#06296b] md:inline-flex"
          >
            Zobacz wszystkie
          </Link>
        </div>

        {loading ? (
          <div className="cartoon-panel flex items-center justify-center rounded-[28px] py-16">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#dce7f5] border-b-[#7057ff]" />
          </div>
        ) : books.length === 0 ? (
          <div className="cartoon-panel rounded-[32px] p-10 text-center">
            <BookOpen className="mx-auto h-14 w-14 text-[#7057ff]" />
            <p className="mt-4 text-lg font-extrabold text-[#06296b]">Brak materiałów</p>
            <p className="mt-1 text-sm font-bold text-[#6e7fa6]">
              Dodaj pierwszy plik i pozwól TutorAI zbudować plan nauki.
            </p>
            <button
              type="button"
              onClick={() => setShowUpload(true)}
              className="cartoon-button mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#6ff0ae] px-5 py-4 font-extrabold text-[#063f40]"
            >
              <Plus className="h-5 w-5" />
              Dodaj materiał
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {books.map((book) => (
              <Link
                key={book.id}
                href={`/dashboard/books/${book.id}`}
                className="cartoon-panel group rounded-[28px] p-5 transition-transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff4cf] text-[#ff5144]">
                      <BookOpen className="h-6 w-6" strokeWidth={2.7} />
                    </span>
                    <div>
                      <h3 className="text-lg font-extrabold text-[#06296b] group-hover:text-[#7057ff]">
                        {book.title}
                      </h3>
                      <p className="mt-1 text-xs font-bold text-[#9aa8c1]">
                        {new Date(book.createdAt).toLocaleDateString('pl-PL')} · {statusLabel(book.status)}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-[#7057ff]" />
                </div>
                <div className="mt-5 flex flex-wrap gap-3 text-xs font-extrabold text-[#6e7fa6]">
                  <span className="rounded-full bg-[#f3f6ff] px-3 py-2">
                    {book._count?.pages || 0} stron
                  </span>
                  <span className="rounded-full bg-[#eafff4] px-3 py-2">
                    {book._count?.chunks || 0} chunków
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  )
}
