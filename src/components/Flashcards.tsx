'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Loader2, Sparkles, AlertCircle, RefreshCw } from 'lucide-react'

export interface Flashcard {
  question: string
  answer: string
}

export default function Flashcards({ sessionId }: { sessionId: string }) {
  const [cards, setCards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  // Load previously saved flashcards
  async function loadCards() {
    try {
      setLoading(true)
      const res = await fetch(`/api/sessions/${sessionId}/flashcards`)
      if (!res.ok) throw new Error('Błąd ładowania fiszek')
      const data = await res.json()
      if (data.flashcards && data.flashcards.length > 0) {
        setCards(data.flashcards)
        setError('')
      } else if (data.sets && data.sets.length > 0) {
        // Use first set's cards
        const firstSetCards = data.sets[0]?.cards || []
        if (firstSetCards.length > 0) {
          setCards(firstSetCards)
          setError('')
        }
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Generate new flashcards
  async function generateCards() {
    setGenerating(true)
    setError('')
    try {
      const res = await fetch(`/api/sessions/${sessionId}/flashcards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ save: true }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Błąd generowania fiszek')

      if (data.flashcards && data.flashcards.length > 0) {
        setCards(data.flashcards)
        setCurrentIndex(0)
        setIsFlipped(false)
      } else {
        throw new Error('Nie udało się wygenerować fiszek')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    async function init() {
      try {
        const res = await fetch(`/api/sessions/${sessionId}/flashcards`)
        if (!res.ok) throw new Error('Błąd')
        const data = await res.json()
        if (cancelled) return
        if (data.flashcards && data.flashcards.length > 0) {
          setCards(data.flashcards)
        } else if (data.sets && data.sets.length > 0) {
          const firstSetCards = data.sets[0]?.cards || []
          if (firstSetCards.length > 0) setCards(firstSetCards)
        }
      } catch {
        // Silently fail - user will see generate button
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    init()
    return () => { cancelled = true }
  }, [sessionId])

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[32px] bg-[#fffefb] p-8 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#7057ff]" />
        <p className="mt-4 font-bold text-[#6e7fa6]">Ładuję fiszki...</p>
      </div>
    )
  }

  if (generating) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[32px] bg-[#fffefb] p-8 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#20b981]" />
        <p className="mt-4 font-bold text-[#6e7fa6]">AI generuje fiszki...</p>
        <p className="mt-2 text-sm text-[#a5b1ca]">To może potrwać do 15 sekund</p>
      </div>
    )
  }

  // No cards and no generation in progress
  if (cards.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[32px] bg-[#fffefb] p-8 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-[26px] bg-[#f0edff] text-[#7057ff]">
          <Sparkles className="h-10 w-10" fill="#7057ff" />
        </div>
        <p className="font-display text-2xl leading-none text-[#06296b]">Brak fiszek</p>
        <p className="mt-2 max-w-sm text-sm font-bold text-[#6e7fa6]">
          {error ? error : 'Wygeneruj fiszki aby szybko utrwalić wiedzę.'}
        </p>
        <button
          onClick={generateCards}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#7057ff] px-5 py-3 text-sm font-extrabold text-white transition-transform hover:-translate-y-0.5"
        >
          <RefreshCw className="h-4 w-4" />
          Generuj fiszki
        </button>
      </div>
    )
  }

  const handleNext = () => {
    setIsFlipped(false)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length)
    }, 150)
  }

  const handlePrev = () => {
    setIsFlipped(false)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length)
    }, 150)
  }

  const currentCard = cards[currentIndex]

  return (
    <div className="flex min-h-[500px] flex-col items-center rounded-[32px] bg-[#f6f4ef] p-4 md:p-8">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between w-full max-w-2xl px-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#f6dec0] bg-[#fff4cf] px-4 py-2 text-sm font-extrabold text-[#06296b]">
          <Sparkles className="h-4 w-4 text-[#ff5144]" fill="#ff5144" />
          Fiszka {currentIndex + 1} z {cards.length}
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm font-bold text-[#6e7fa6]">Kliknij kartę</p>
          <button
            onClick={generateCards}
            disabled={generating}
            className="inline-flex items-center gap-1 rounded-xl bg-[#f0edff] px-3 py-2 text-xs font-bold text-[#7057ff] hover:bg-[#e6dfff] disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${generating ? 'animate-spin' : ''}`} />
            Regeneruj
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 max-w-2xl rounded-2xl bg-[#fff0ef] px-4 py-2 text-sm font-bold text-[#d8342b]">
          <AlertCircle className="mr-2 inline h-4 w-4" />
          {error}
        </div>
      )}

      <div className="group relative h-[300px] w-full max-w-2xl">
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className={`absolute h-full w-full cursor-pointer rounded-[32px] border border-[#dce7f5] bg-white p-8 shadow-sm transition-all duration-500 ${
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          }`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front (Pytanie) */}
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center p-8 text-center ${
              isFlipped ? 'hidden' : ''
            }`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p className="text-sm font-extrabold uppercase tracking-wider text-[#7057ff] mb-4">Pytanie</p>
            <h3 className="font-display text-2xl text-[#06296b] md:text-3xl">{currentCard.question}</h3>
          </div>

          {/* Back (Odpowiedź) */}
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center p-8 text-center ${
              !isFlipped ? 'hidden' : ''
            }`}
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <p className="text-sm font-extrabold uppercase tracking-wider text-[#20b981] mb-4">Odpowiedź</p>
            <p className="text-xl font-bold leading-relaxed text-[#06296b]">{currentCard.answer}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-6">
        <button
          onClick={handlePrev}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#7057ff] shadow-sm transition-transform hover:-translate-y-1 hover:bg-[#f0edff]"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={handleNext}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#7057ff] shadow-sm transition-transform hover:-translate-y-1 hover:bg-[#f0edff]"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}
