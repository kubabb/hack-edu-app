'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ChevronRight, FileText, Brain, Plus } from 'lucide-react';
import DashboardLayout from '@/src/components/DashboardLayout';

interface Book {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  _count?: { pages: number; chunks: number };
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/books')
      .then((r) => r.json())
      .then((data) => {
        setBooks(data.books || []);
        setLoading(false);
      });
  }, []);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Moje książki</h1>
          <p className="text-sm text-[#666] mt-1">Zarządzaj swoimi materiałami do nauki.</p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-[#1d7874] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#166a66] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Dodaj książkę
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1d7874]" />
        </div>
      ) : books.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#e5f0ee] p-12 text-center">
          <BookOpen className="w-12 h-12 text-[#c8ddd9] mx-auto mb-3" />
          <p className="text-[#666] font-medium">Brak książek</p>
          <p className="text-sm text-[#999] mt-1">Przejdź do dashboardu, aby dodać pierwszą książkę.</p>
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
    </DashboardLayout>
  );
}
