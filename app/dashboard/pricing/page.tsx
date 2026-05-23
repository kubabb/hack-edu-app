'use client'

import DashboardLayout from '@/src/components/DashboardLayout'
import { Check, Sparkles } from 'lucide-react'

export default function PricingPage() {
  const handleSelectPlan = (plan: string) => {
    alert(`Wybór planu: ${plan}. Integracja płatności zostanie dodana w kolejnym etapie!`);
  };

  return (
    <DashboardLayout>
      <section className="cartoon-panel mb-8 overflow-hidden rounded-[32px]">
        <div className="grid gap-6 p-6 md:p-10 text-center">
          <div className="mx-auto mb-2 inline-flex items-center gap-2 rounded-full border border-[#f6dec0] bg-[#fff4cf] px-4 py-2 text-sm font-extrabold text-[#06296b]">
            <Sparkles className="h-4 w-4 text-[#ff5144]" fill="#ff5144" />
            Cennik i Plany
          </div>
          <h1 className="font-display text-5xl leading-none text-[#06296b] md:text-6xl">
            Odblokuj pełen potencjał
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base font-bold leading-7 text-[#6e7fa6]">
            Wybierz plan dopasowany do Twoich potrzeb i korzystaj z interaktywnego awatara bez ograniczeń. Im więcej ćwiczysz, tym lepsze masz stopnie!
          </p>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {/* Uczeń */}
        <div className="cartoon-panel flex flex-col justify-between rounded-[32px] p-8 border-2 border-transparent hover:border-[#dfe8f4] transition-all">
          <div>
            <h2 className="font-display text-3xl text-[#06296b]">Uczeń</h2>
            <p className="mt-2 text-sm font-bold text-[#6e7fa6]">Dla początkujących</p>
            <div className="my-6">
              <span className="text-5xl font-display text-[#06296b]">$9</span>
              <span className="text-sm font-extrabold text-[#6e7fa6]"> / miesiąc</span>
            </div>
            <ul className="space-y-4 text-sm font-extrabold text-[#06296b]">
              <li className="flex items-center gap-3"><Check className="h-5 w-5 text-[#20b981]" /> 10 minut rozmowy LiveAvatar</li>
              <li className="flex items-center gap-3"><Check className="h-5 w-5 text-[#20b981]" /> Dostęp do wygenerowanych fiszek</li>
              <li className="flex items-center gap-3"><Check className="h-5 w-5 text-[#20b981]" /> Pytania testowe i quizy</li>
              <li className="flex items-center gap-3 opacity-40"><Check className="h-5 w-5 text-[#a5b1ca]" /> Brak priorytetowego wsparcia</li>
            </ul>
          </div>
          <button onClick={() => handleSelectPlan('Uczeń')} className="mt-8 cartoon-button w-full rounded-2xl bg-[#f0edff] py-4 text-center font-extrabold text-[#7057ff] hover:bg-[#7057ff] hover:text-white transition-all">
            Wybierz plan
          </button>
        </div>

        {/* Pilny uczeń */}
        <div className="cartoon-panel relative flex flex-col justify-between rounded-[32px] p-8 border-2 border-[#7057ff] shadow-xl scale-105 z-10 bg-white">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[#ff5144] px-4 py-1 text-xs font-extrabold text-white uppercase tracking-wider">
            Najpopularniejszy
          </div>
          <div>
            <h2 className="font-display text-3xl text-[#06296b]">Pilny Uczeń</h2>
            <p className="mt-2 text-sm font-bold text-[#6e7fa6]">Dla systematycznych</p>
            <div className="my-6">
              <span className="text-5xl font-display text-[#06296b]">$19</span>
              <span className="text-sm font-extrabold text-[#6e7fa6]"> / miesiąc</span>
            </div>
            <ul className="space-y-4 text-sm font-extrabold text-[#06296b]">
              <li className="flex items-center gap-3"><Check className="h-5 w-5 text-[#7057ff]" /> 25 minut rozmowy LiveAvatar</li>
              <li className="flex items-center gap-3"><Check className="h-5 w-5 text-[#7057ff]" /> Dostęp do wygenerowanych fiszek</li>
              <li className="flex items-center gap-3"><Check className="h-5 w-5 text-[#7057ff]" /> Pytania testowe i quizy</li>
              <li className="flex items-center gap-3"><Check className="h-5 w-5 text-[#7057ff]" /> Priorytetowe wsparcie 24/7</li>
            </ul>
          </div>
          <button onClick={() => handleSelectPlan('Pilny Uczeń')} className="mt-8 cartoon-button w-full rounded-2xl bg-[#7057ff] py-4 text-center font-extrabold text-white transition-all">
            Wybierz plan
          </button>
        </div>

        {/* Kujon */}
        <div className="cartoon-panel flex flex-col justify-between rounded-[32px] p-8 border-2 border-transparent hover:border-[#dfe8f4] transition-all">
          <div>
            <h2 className="font-display text-3xl text-[#06296b]">Kujon</h2>
            <p className="mt-2 text-sm font-bold text-[#6e7fa6]">Bez ograniczeń w nauce</p>
            <div className="my-6">
              <span className="text-5xl font-display text-[#06296b]">$29</span>
              <span className="text-sm font-extrabold text-[#6e7fa6]"> / miesiąc</span>
            </div>
            <ul className="space-y-4 text-sm font-extrabold text-[#06296b]">
              <li className="flex items-center gap-3"><Check className="h-5 w-5 text-[#ff5144]" /> 60 minut rozmowy LiveAvatar</li>
              <li className="flex items-center gap-3"><Check className="h-5 w-5 text-[#ff5144]" /> Dostęp do wygenerowanych fiszek</li>
              <li className="flex items-center gap-3"><Check className="h-5 w-5 text-[#ff5144]" /> Pytania testowe i quizy</li>
              <li className="flex items-center gap-3"><Check className="h-5 w-5 text-[#ff5144]" /> Indywidualne raporty z nauki</li>
            </ul>
          </div>
          <button onClick={() => handleSelectPlan('Kujon')} className="mt-8 cartoon-button w-full rounded-2xl bg-[#fff0ef] py-4 text-center font-extrabold text-[#d8342b] hover:bg-[#d8342b] hover:text-white transition-all">
            Wybierz plan
          </button>
        </div>
      </section>
    </DashboardLayout>
  )
}
