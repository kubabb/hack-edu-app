'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useUser } from '@/src/hooks/useUser'
import { BookOpen, Brain, Upload, FileText, ChevronRight } from 'lucide-react'
import DashboardLayout from '@/src/components/DashboardLayout'
import UploadBookForm from '@/src/components/UploadBookForm'

interface Book {
  id: string
  title: string
  status: string
  createdAt: string
  _count?: { pages: number; chunks: number }
}

export default function DashboardPage() {
  const { user } = useUser()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)

  async function fetchBooks() {
    const res = await fetch('/api/books')
    const data = await res.json()
    setBooks(data.books || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchBooks()
  }, [])

  const stats = [
    { label: 'Książki', value: books.length, icon: BookOpen, color: 'bg-[#1d7874]' },
    { label: 'Strony', value: books.reduce((a, b) => a + (b._count?.pages || 0), 0), icon: FileText, color: 'bg-[#2ba599]' },
    { label: 'Chunki', value: books.reduce((a, b) => a + (b._count?.chunks || 0), 0), icon: Brain, color: 'bg-[#1d7874]/80' },
  ]

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a1a]">
          Witaj, {user?.name || 'Użytkowniku'}!
        </h1>
        <p className="text-[#666] mt-1">Oto Twój osobisty panel nauki z TutorAI.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white rounded-xl border border-[#e5f0ee] p-5 flex items-center gap-4 shadow-sm">
              <div className={`${s.color} text-white p-3 rounded-lg`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1a1a1a]">{s.value}</p>
                <p className="text-sm text-[#666]">{s.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-xl border border-[#e5f0ee] p-6 mb-8 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#1a1a1a]">Dodaj nową książkę</h2>
            <p className="text-sm text-[#666]">Prześlij PDF lub zdjęcia, aby stworzyć graf wiedzy.</p>
          </div>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="inline-flex items-center gap-2 bg-[#1d7874] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#166a66] transition-colors"
          >
            <Upload className="w-4 h-4" />
            {showUpload ? 'Anuluj' : 'Prześlij'}
          </button>
        </div>
        {showUpload && <UploadBookForm onUpload={() => { setShowUpload(false); fetchBooks(); }} />}
      </div>

      <div>
        <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">Twoje książki</h2>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1d7874]" />
          </div>
        ) : books.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#e5f0ee] p-12 text-center">
            <BookOpen className="w-12 h-12 text-[#c8ddd9] mx-auto mb-3" />
            <p className="text-[#666] font-medium">Brak książek</p>
            <p className="text-sm text-[#999] mt-1">Dodaj pierwszą książkę, aby rozpocząć naukę.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {books.map((book) => (
              <Link
                key={book.id}
                href={`/dashboard/books/${book.id}`}
                className="group bg-white rounded-xl border border-[#e5f0ee] p-5 hover:border-[#1d7874]/30 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#f0f7f6] p-2.5 rounded-lg">
                      <BookOpen className="w-5 h-5 text-[#1d7874]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1a1a1a] group-hover:text-[#1d7874] transition-colors">{book.title}</h3>
                      <p className="text-xs text-[#999] mt-0.5">
                        {new Date(book.createdAt).toLocaleDateString('pl-PL')} · {book.status === 'READY' ? 'Gotowa' : 'Przetwarzanie...'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#c8ddd9] group-hover:text-[#1d7874] transition-colors" />
                </div>
                <div className="mt-4 flex items-center gap-4 text-xs text-[#666]">
                  <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {book._count?.pages || 0} stron</span>
                  <span className="flex items-center gap-1"><Brain className="w-3.5 h-3.5" /> {book._count?.chunks || 0} chunków</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
