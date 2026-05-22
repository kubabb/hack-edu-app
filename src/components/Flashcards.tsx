'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Loader2, Sparkles, AlertCircle } from 'lucide-react'

export interface Flashcard {
  question: string
  answer: string
}

export default function Flashcards({ sessionId }: { sessionId: string }) {
  const [cards, setCards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function fetchCards() {
      try {
        const res = await fetch(`/api/sessions/${sessionId}/flashcards`)
        if (!res.ok) throw new Error('Błąd ładowania fiszek')
        const data = await res.json()
        if (cancelled) return
        if (data.flashcards && data.flashcards.length > 0) {
          setCards(data.flashcards)
        } else {
          setError('Nie udało się wygenerować fiszek. Spróbuj ponownie później.')
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchCards()
    return () => {
      cancelled = true
    }
  }, [sessionId])

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[32px] bg-[#fffefb] p-8 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#7057ff]" />
        <p className="mt-4 font-bold text-[#6e7fa6]">Analizuję notatki i generuję fiszki...</p>
      </div>
    )
  }

  if (error || cards.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[32px] bg-[#fff0ef] p-8 text-center">
        <AlertCircle className="h-10 w-10 text-[#d8342b]" />
        <p className="mt-4 font-bold text-[#d8342b]">{error || 'Brak fiszek do wyświetlenia.'}</p>
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
    <div className="flex min-h-[500px] flex-col items-center justify-center rounded-[32px] bg-[#f6f4ef] p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between w-full max-w-2xl px-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#f6dec0] bg-[#fff4cf] px-4 py-2 text-sm font-extrabold text-[#06296b]">
          <Sparkles className="h-4 w-4 text-[#ff5144]" fill="#ff5144" />
          Fiszka {currentIndex + 1} z {cards.length}
        </div>
        <p className="text-sm font-bold text-[#6e7fa6]">Kliknij kartę, aby odwrócić</p>
      </div>

      <div className="group relative h-[300px] w-full max-w-2xl perspective-1000">
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className={`absolute h-full w-full cursor-pointer rounded-[32px] border border-[#dce7f5] bg-white p-8 shadow-sm transition-all duration-500 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front (Pytanie) */}
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center p-8 text-center backface-hidden ${
              isFlipped ? 'hidden' : ''
            }`}
          >
            <p className="text-sm font-extrabold uppercase tracking-wider text-[#7057ff] mb-4">Pytanie</p>
            <h3 className="font-display text-2xl text-[#06296b] md:text-3xl">{currentCard.question}</h3>
          </div>

          {/* Back (Odpowiedź) */}
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center p-8 text-center backface-hidden ${
              !isFlipped ? 'hidden' : ''
            }`}
            style={{ transform: 'rotateY(180deg)' }}
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
