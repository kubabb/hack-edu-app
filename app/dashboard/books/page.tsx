'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  Brain,
  ChevronRight,
  FileText,
  GraduationCap,
  Plus,
  Sparkles,
} from 'lucide-react'
import DashboardLayout from '@/src/components/DashboardLayout'
import { readJsonSafely } from '@/src/lib/http/json'

interface Book {
  id: string
  title: string
  status: string
  createdAt: string
  _count?: { pages: number; chunks: number }
}

function statusLabel(status: string) {
  return status === 'READY' ? 'Gotowa do nauki' : 'AI jeszcze czyta'
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadBooks() {
      try {
        const res = await fetch('/api/books')
        const data = await readJsonSafely<{ books?: Book[] }>(res)
        if (!cancelled) setBooks(data?.books || [])
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

  const totalPages = books.reduce((sum, book) => sum + (book._count?.pages || 0), 0)
  const totalChunks = books.reduce((sum, book) => sum + (book._count?.chunks || 0), 0)

  return (
    <DashboardLayout>
      <section className="cartoon-panel overflow-hidden rounded-[32px]">
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f6dec0] bg-[#fff4cf] px-4 py-2 text-sm font-extrabold text-[#06296b]">
              <Sparkles className="h-4 w-4 text-[#ff5144]" fill="#ff5144" />
              Biblioteka nauki
            </div>
            <h1 className="font-display text-5xl leading-none text-[#06296b] md:text-6xl">
              Twoje materiały
            </h1>
            <p className="mt-4 max-w-2xl text-base font-bold leading-7 text-[#6e7fa6]">
              Tutaj lądują książki, notatki i skany, które TutorAI zamienia w graf wiedzy,
              quizy oraz krótkie wyjaśnienia.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="cartoon-button inline-flex items-center justify-center gap-3 rounded-2xl bg-[#6ff0ae] px-5 py-4 font-extrabold text-[#063f40]"
          >
            <Plus className="h-5 w-5" />
            Dodaj materiał
          </Link>
        </div>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-3">
        {[
          { label: 'Materiały', value: books.length, icon: BookOpen, color: 'bg-[#7057ff]' },
          { label: 'Strony', value: totalPages, icon: FileText, color: 'bg-[#ff5144]' },
          { label: 'Chunki wiedzy', value: totalChunks, icon: Brain, color: 'bg-[#20b981]' },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <article key={stat.label} className="cartoon-panel rounded-[28px] p-5">
              <div className="flex items-center gap-4">
                <span className={`flex h-14 w-14 items-center justify-center rounded-2xl text-white ${stat.color}`}>
                  <Icon className="h-6 w-6" strokeWidth={2.7} />
                </span>
                <div>
                  <p className="font-display text-4xl leading-none text-[#06296b]">{stat.value}</p>
                  <p className="text-sm font-extrabold text-[#6e7fa6]">{stat.label}</p>
                </div>
              </div>
            </article>
          )
        })}
      </section>

      <section className="mt-7">
        {loading ? (
          <div className="cartoon-panel flex items-center justify-center rounded-[32px] py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#dce7f5] border-b-[#7057ff]" />
          </div>
        ) : books.length === 0 ? (
          <div className="cartoon-panel rounded-[32px] p-10 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-[#f0edff] text-[#7057ff]">
              <GraduationCap className="h-10 w-10" strokeWidth={2.7} />
            </div>
            <h2 className="mt-5 font-display text-4xl leading-none text-[#06296b]">
              Biblioteka jest jeszcze pusta
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm font-bold leading-6 text-[#6e7fa6]">
              Dodaj pierwszy PDF albo zdjęcie notatek. TutorAI wyciągnie pojęcia, połączy je
              w graf i przygotuje rozmowę z AI korepetytorem.
            </p>
            <Link
              href="/dashboard"
              className="cartoon-button mt-7 inline-flex items-center gap-3 rounded-2xl bg-[#ff5144] px-5 py-4 font-extrabold text-white"
            >
              <Plus className="h-5 w-5" />
              Dodaj pierwszy materiał
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {books.map((book) => (
              <Link
                key={book.id}
                href={`/dashboard/books/${book.id}`}
                className="cartoon-panel group flex min-h-64 flex-col justify-between rounded-[28px] p-5 transition-transform hover:-translate-y-1"
              >
                <div>
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff4cf] text-[#ff5144]">
                      <BookOpen className="h-7 w-7" strokeWidth={2.7} />
                    </span>
                    <span className="rounded-full bg-[#eafff4] px-3 py-2 text-xs font-extrabold text-[#11805e]">
                      {statusLabel(book.status)}
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold leading-snug text-[#06296b] group-hover:text-[#7057ff]">
                    {book.title}
                  </h2>
                  <p className="mt-2 text-xs font-bold text-[#9aa8c1]">
                    Dodano {new Date(book.createdAt).toLocaleDateString('pl-PL')}
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2 text-xs font-extrabold text-[#6e7fa6]">
                    <span className="rounded-full bg-[#f3f6ff] px-3 py-2">
                      {book._count?.pages || 0} stron
                    </span>
                    <span className="rounded-full bg-[#fff4cf] px-3 py-2">
                      {book._count?.chunks || 0} chunków
                    </span>
                  </div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#7057ff] text-white">
                    <ChevronRight className="h-5 w-5" strokeWidth={2.7} />
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
