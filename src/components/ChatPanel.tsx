'use client'

import { useEffect, useRef, useState } from 'react'
import { Bot, Loader2, Send, Sparkles, User } from 'lucide-react'
import { readJsonSafely } from '@/src/lib/http/json'
import AvatarPlayer from './AvatarPlayer'

interface Message {
  id: string
  role: 'USER' | 'ASSISTANT'
  content: string
  avatarVideoUrl?: string | null
}

function isMessage(value: unknown): value is Message {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'role' in value &&
    'content' in value
  )
}

export default function ChatPanel({
  bookId,
  selectedNodeId,
}: {
  bookId: string
  selectedNodeId?: string | null
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  async function sendMessage() {
    if (!input.trim() || loading) return
    setLoading(true)
    setError('')

    const userMsg = input.trim()
    setInput('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, bookId, message: userMsg, selectedNodeId }),
      })

      const data = await readJsonSafely<{
        sessionId?: string
        assistantMessage?: unknown
        error?: string
      }>(res)

      if (!res.ok) throw new Error(data?.error || 'Nie udało się wysłać wiadomości')
      if (data?.sessionId) setSessionId(data.sessionId)

      const assistantMessage = isMessage(data?.assistantMessage)
        ? data.assistantMessage
        : {
            id: `a-${Date.now()}`,
            role: 'ASSISTANT' as const,
            content: 'Przeanalizowałem materiał. Zadaj kolejne pytanie, a doprecyzuję odpowiedź.',
          }

      setMessages((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, role: 'USER', content: userMsg },
        assistantMessage,
      ])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Nie udało się wysłać wiadomości')
      setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'USER', content: userMsg }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-[620px] flex-col rounded-[26px] bg-[#fffefb]">
      <div className="border-b border-[#e6edf7] px-4 py-4 md:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl leading-none text-[#06296b]">Czat z AI</h2>
            <p className="mt-1 text-sm font-bold text-[#6e7fa6]">
              {selectedNodeId ? 'Pytasz o wybrane pojęcie z grafu.' : 'Pytaj o cały materiał.'}
            </p>
          </div>
          <span className="rounded-full bg-[#f0edff] px-4 py-2 text-xs font-extrabold text-[#7057ff]">
            AI korepetytor
          </span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-5 md:px-5">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-[26px] bg-[#eafff4] text-[#11805e]">
              <Sparkles className="h-10 w-10" fill="#11805e" />
            </div>
            <p className="font-display text-3xl leading-none text-[#06296b]">O co dziś pytamy?</p>
            <p className="mt-3 max-w-md text-sm font-bold leading-6 text-[#6e7fa6]">
              Poproś o wyjaśnienie pojęcia, streszczenie rozdziału albo quiz z materiału.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'USER' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                message.role === 'USER' ? 'bg-[#f0edff] text-[#7057ff]' : 'bg-[#eafff4] text-[#11805e]'
              }`}
            >
              {message.role === 'USER' ? (
                <User className="h-5 w-5" strokeWidth={2.7} />
              ) : (
                <Bot className="h-5 w-5" strokeWidth={2.7} />
              )}
            </div>
            <div className={`max-w-[82%] ${message.role === 'USER' ? 'items-end' : 'items-start'}`}>
              <div
                className={`inline-block rounded-[22px] px-4 py-3 text-sm font-bold leading-6 ${
                  message.role === 'USER'
                    ? 'rounded-br-md bg-[#7057ff] text-white'
                    : 'rounded-bl-md bg-[#f3f6ff] text-[#06296b]'
                }`}
              >
                {message.content}
              </div>
              {message.avatarVideoUrl && <AvatarPlayer videoUrl={message.avatarVideoUrl} />}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#eafff4] text-[#11805e]">
              <Bot className="h-5 w-5" strokeWidth={2.7} />
            </div>
            <div className="rounded-[22px] rounded-bl-md bg-[#f3f6ff] px-4 py-3">
              <Loader2 className="h-5 w-5 animate-spin text-[#7057ff]" />
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-[#e6edf7] px-4 py-4 md:px-5">
        {error && (
          <p className="mb-3 rounded-2xl border border-[#ffd3cf] bg-[#fff0ef] px-4 py-3 text-sm font-bold text-[#d8342b]">
            {error}
          </p>
        )}
        <div className="flex items-center gap-2 rounded-2xl border border-[#dce7f5] bg-white px-4 py-2 transition-all focus-within:border-[#7057ff]">
          <input
            type="text"
            className="min-w-0 flex-1 bg-transparent py-2 text-sm font-bold text-[#06296b] outline-none placeholder:text-[#a5b1ca]"
            placeholder="Napisz wiadomość..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void sendMessage()
            }}
          />
          <button
            type="button"
            onClick={() => void sendMessage()}
            disabled={loading || !input.trim()}
            aria-label="Wyślij wiadomość"
            className="cartoon-button rounded-xl bg-[#ff5144] p-3 text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" strokeWidth={2.7} />
          </button>
        </div>
      </div>
    </div>
  )
}
