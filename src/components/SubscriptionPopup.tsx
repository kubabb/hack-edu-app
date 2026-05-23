'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Sparkles, X } from 'lucide-react'

export default function SubscriptionPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Sprawdzamy czy użytkownik widział już popup w tej sesji/przeglądarce
    const hasSeen = localStorage.getItem('hasSeenPricing')
    if (!hasSeen) {
      // Drobne opóźnienie dla lepszego efektu wejścia
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const closePopup = () => {
    setIsOpen(false)
    localStorage.setItem('hasSeenPricing', 'true')
  }

  const goToPricing = () => {
    closePopup()
    router.push('/dashboard/pricing')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Tło blur */}
      <div 
        className="absolute inset-0 bg-[#06296b]/60 backdrop-blur-md transition-opacity" 
        onClick={closePopup}
      />
      
      {/* Modal */}
      <div className="cartoon-panel relative z-10 w-full max-w-2xl overflow-hidden rounded-[32px] bg-white p-8 text-center shadow-2xl animate-in zoom-in-95 duration-300">
        <button 
          onClick={closePopup}
          className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-[#f3f6ff] text-[#a5b1ca] hover:bg-[#ffeaea] hover:text-[#ff5144] transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[24px] bg-[#fff4cf] text-[#ff5144]">
          <Sparkles className="h-8 w-8" fill="currentColor" />
        </div>
        
        <h2 className="font-display text-4xl text-[#06296b] md:text-5xl">
          Zwiększ swój potencjał!
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-base font-bold text-[#6e7fa6]">
          Twój podstawowy czas z asystentem LiveAvatar może się wkrótce skończyć. Rozszerz swój pakiet, aby cieszyć się rozmowami bez przeszkód i osiągać lepsze wyniki.
        </p>

        <div className="mt-8 mb-8 grid gap-4 md:grid-cols-2 text-left">
          <div className="rounded-2xl border-2 border-[#dfe8f4] p-5">
            <h3 className="font-display text-xl text-[#06296b]">Pilny Uczeń</h3>
            <p className="text-2xl font-display text-[#7057ff] mt-2">$19<span className="text-sm text-[#6e7fa6]">/msc</span></p>
            <ul className="mt-4 space-y-2 text-sm font-bold text-[#06296b]">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#20b981]" /> 25 minut rozmowy</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#20b981]" /> Wszystkie funkcje AI</li>
            </ul>
          </div>
          <div className="rounded-2xl border-2 border-[#7057ff] bg-[#f0edff] p-5 relative shadow-md">
            <span className="absolute -top-3 right-4 bg-[#ff5144] text-white text-xs font-extrabold px-3 py-1 rounded-full">Polecany</span>
            <h3 className="font-display text-xl text-[#06296b]">Kujon</h3>
            <p className="text-2xl font-display text-[#7057ff] mt-2">$29<span className="text-sm text-[#6e7fa6]">/msc</span></p>
            <ul className="mt-4 space-y-2 text-sm font-bold text-[#06296b]">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#7057ff]" /> 60 minut rozmowy</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#7057ff]" /> Indywidualne raporty</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={closePopup}
            className="rounded-2xl px-6 py-4 font-extrabold text-[#a5b1ca] hover:text-[#06296b] transition-colors"
          >
            Nie teraz, dziękuję
          </button>
          <button 
            onClick={goToPricing}
            className="cartoon-button flex items-center justify-center gap-2 rounded-[20px] bg-[#7057ff] px-8 py-4 font-display text-xl text-white transition-transform hover:-translate-y-1 hover:shadow-lg"
          >
            <Sparkles className="h-5 w-5" />
            Zobacz pełny cennik
          </button>
        </div>
      </div>
    </div>
  )
}
