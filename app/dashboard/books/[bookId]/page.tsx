'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { BookOpen, MessageCircle, Share2, Brain, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/src/components/DashboardLayout';
import KnowledgeGraph from '@/src/components/KnowledgeGraph';
import ChatPanel from '@/src/components/ChatPanel';

export default function BookDetailPage() {
  const params = useParams();
  const bookId = params.bookId as string;
  const [activeTab, setActiveTab] = useState<'graph' | 'chat'>('graph');

  return (
    <DashboardLayout>
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-sm text-[#666] hover:text-[#1d7874] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Dashboard
        </Link>
      </div>

      {/* Book header */}
      <div className="bg-white rounded-xl border border-[#e5f0ee] p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-[#f0f7f6] p-3 rounded-xl">
            <BookOpen className="w-8 h-8 text-[#1d7874]" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#1a1a1a]">Książka</h1>
            <p className="text-sm text-[#666]">ID: {bookId.slice(0, 8)}... · Graf wiedzy i czat AI</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#d0e5e1] text-sm font-medium text-[#666] hover:bg-[#f0f7f6] transition-colors">
              <Share2 className="w-4 h-4" />
              Udostępnij
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white rounded-xl border border-[#e5f0ee] p-1 mb-6 w-fit shadow-sm">
        <button
          onClick={() => setActiveTab('graph')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'graph'
              ? 'bg-[#1d7874] text-white'
              : 'text-[#666] hover:text-[#1a1a1a]'
          }`}
        >
          <Brain className="w-4 h-4" />
          Graf wiedzy
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'chat'
              ? 'bg-[#1d7874] text-white'
              : 'text-[#666] hover:text-[#1a1a1a]'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          Czat z AI
        </button>
      </div>

      {/* Content */}
      {activeTab === 'graph' ? (
        <div className="bg-white rounded-xl border border-[#e5f0ee] p-4 shadow-sm">
          <div className="h-[600px]">
            <KnowledgeGraph bookId={bookId} />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#e5f0ee] p-4 shadow-sm">
          <ChatPanel bookId={bookId} />
        </div>
      )}
    </DashboardLayout>
  );
}
