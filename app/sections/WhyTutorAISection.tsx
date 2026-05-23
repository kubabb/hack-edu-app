'use client';

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Play, Star } from "lucide-react";
import { useUser } from "@/src/hooks/useUser";

const studentCards = [
  {
    name: "Kasia, 2 kl. LO",
    quote: "W końcu rozumiem matematykę. Wyjaśnienia AI są proste i trafiają w punkt.",
    color: "#fff6db",
  },
  {
    name: "Bartek, 3 kl. LO",
    quote: "Nagrania korepetytorów są mega pomocne przed sprawdzianami.",
    color: "#eafff4",
  },
  {
    name: "Zosia, technikum",
    quote: "Plan nauki naprawdę działa. Widzę postępy każdego tygodnia.",
    color: "#fff0ef",
  },
  {
    name: "Marek, 8 kl. SP",
    quote: "Graf wiedzy pomaga połączyć tematy i mniej wkuwać na pamięć.",
    color: "#f1efff",
  },
  {
    name: "Ania, 1 kl. LO",
    quote: "Fajne jest to, że mogę pytać o wszystko bota AI bez cienia wstydu.",
    color: "#e8f4ff",
  },
  {
    name: "Piotrek, 4 kl. technikum",
    quote: "Przygotowania do matury idą super szybko dzięki świetnym animacjom.",
    color: "#fff4fa",
  },
  {
    name: "Julia, 7 kl. SP",
    quote: "Super platforma, odrabianie lekcji zajmuje mi teraz o połowę mniej czasu!",
    color: "#f4ffeb",
  },
];

const playlist = [
  "Wzór ogólny i delta",
  "Przykłady krok po kroku",
  "Postać iloczynowa",
  "Zadania maturalne",
];

export default function WhyTutorAISection() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { user, loading } = useUser();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const scrollTo = (index: number) => {
    if (sliderRef.current) {
      const { scrollWidth, clientWidth } = sliderRef.current;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 0) {
        const targetScroll = maxScroll * (index / (studentCards.length - 1));
        sliderRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
      }
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? activeIndex - 1 : activeIndex + 1;
    if (newIndex >= 0 && newIndex < studentCards.length) {
      scrollTo(newIndex);
    }
  };

  const handleScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 0) {
        const index = Math.round((scrollLeft / maxScroll) * (studentCards.length - 1));
        setActiveIndex(index);
      } else {
        setActiveIndex(0);
      }
    }
  };

  return (
    <section id="funkcje" className="px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="cartoon-panel rounded-[32px] px-5 py-9 md:px-10">
          <h2 className="text-center font-display text-4xl leading-none text-[#06296b] md:text-6xl">
            Ufa nam nowe pokolenie uczniów
          </h2>

          <div 
            ref={sliderRef}
            onScroll={handleScroll}
            className="mt-8 flex gap-4 overflow-x-auto snap-x snap-mandatory md:snap-none scroll-smooth pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {studentCards.map((card) => (
              <article
                key={card.name}
                className="shrink-0 snap-center md:snap-none rounded-[24px] border border-[#e4eaf4] p-5 w-[280px] md:w-[320px]"
                style={{ backgroundColor: card.color }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                    🎓
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[#06296b]">{card.name}</h3>
                    <div className="mt-1 flex text-[#ffb300]">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm font-bold leading-6 text-[#536994]">“{card.quote}”</p>
              </article>
            ))}
          </div>

          <div className="mt-7 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#7057ff] text-white hover:scale-105 transition-transform"
              aria-label="Poprzednia opinia"
            >
              <ArrowLeft className="h-5 w-5" strokeWidth={3} />
            </button>
            <div className="flex gap-2">
              {studentCards.map((_, idx) => (
                <button 
                  key={idx}
                  type="button"
                  onClick={() => scrollTo(idx)}
                  aria-label={`Przejdź do opinii ${idx + 1}`}
                  className={`h-3 w-3 rounded-full transition-all duration-300 ${
                    idx === activeIndex ? "bg-[#7057ff] scale-125" : "bg-[#d6d5e8] hover:bg-[#a493ef]"
                  }`} 
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#7057ff] text-white hover:scale-105 transition-transform"
              aria-label="Następna opinia"
            >
              <ArrowRight className="h-5 w-5" strokeWidth={3} />
            </button>
          </div>
        </div>

        <div
          id="nagrania"
          className="cartoon-panel mt-10 grid overflow-hidden rounded-[32px] md:grid-cols-[0.72fr_1.28fr]"
        >
          <div className="flex flex-col justify-center px-7 py-10 md:px-12">
            <p className="mb-4 w-fit rounded-xl bg-[#ff5144] px-4 py-2 text-sm font-extrabold text-white">
              Nagrania i animacje
            </p>
            <h2 className="font-display text-4xl leading-[0.98] text-[#06296b] md:text-6xl">
              Ucz się z najlepszymi AI korepetytorami
            </h2>
            <p className="mt-5 text-lg font-bold leading-8 text-[#6e7fa6]">
              Zamiast suchego tekstu dostajesz krótkie nagrania, animacje i
              przykłady krok po kroku. W każdej chwili możesz dopytać czat.
            </p>
            {loading ? (
              <div className="mt-8 h-14 w-44 animate-pulse rounded-xl bg-[#f0f4f8]"></div>
            ) : user ? (
              <a
                href="/dashboard"
                className="cartoon-button mt-8 inline-flex w-fit items-center gap-3 rounded-xl bg-[#ff5144] px-6 py-4 font-extrabold text-white"
              >
                Przejdź do panelu
                <Play className="h-4 w-4 fill-white" />
              </a>
            ) : (
              <a
                href="/auth/register"
                className="cartoon-button mt-8 inline-flex w-fit items-center gap-3 rounded-xl bg-[#ff5144] px-6 py-4 font-extrabold text-white"
              >
                Zobacz nagrania
                <Play className="h-4 w-4 fill-white" />
              </a>
            )}
          </div>

          <div className="grid gap-5 bg-[#fff1ed] p-5 lg:grid-cols-[1fr_280px]">
            <div className="relative overflow-hidden rounded-[24px] bg-[#13213e] shadow-[0_20px_50px_rgba(6,41,107,0.2)] h-full min-h-[290px]">
              <video
                ref={videoRef}
                src="/assets/board.mp4"
                poster="/assets/tutorai-video-lesson.png"
                preload="metadata"
                playsInline
                controls
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="h-full w-full object-cover object-left"
              />
              {!isPlaying && (
                <button
                  type="button"
                  onClick={handlePlayVideo}
                  className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[#ff5144] shadow-xl hover:scale-105 transition-transform"
                  aria-label="Odtwórz nagranie"
                >
                  <Play className="ml-1 h-9 w-9 fill-current" />
                </button>
              )}
            </div>

            <aside className="flex flex-col rounded-[24px] bg-white p-5 h-full border border-[#fbdcd5]">
              <div>
                <h3 className="text-lg font-extrabold text-[#06296b]">Równania kwadratowe</h3>
                <p className="mt-1 text-sm font-bold text-[#8a9abb]">4 krótkie filmy</p>
              </div>
              <div className="mt-6 flex flex-col gap-2 flex-1 justify-center">
                {playlist.map((item, index) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl bg-[#fff4f1] p-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ff5144] text-xs font-extrabold text-white">
                      {index + 1}
                    </span>
                    <span className="text-sm font-extrabold text-[#06296b] leading-tight">{item}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
