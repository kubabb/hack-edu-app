"use client";

import Image from "next/image";
import { ArrowRight, Check, Play, Sparkles } from "lucide-react";
import { useUser } from "@/src/hooks/useUser";

const benefits = ["Za darmo na start", "Bez karty kredytowej", "AI tłumaczy jak człowiek"];

export default function HeroSection() {
  const { user, loading } = useUser();

  return (
    <section className="px-4 pb-10 pt-28 md:pt-32">
      <div className="cartoon-panel relative mx-auto grid min-h-[690px] max-w-7xl overflow-hidden rounded-[32px] px-6 py-10 md:grid-cols-[1fr_0.82fr] md:px-14 md:py-16">
        <div className="relative z-10 flex max-w-2xl flex-col justify-center">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-[#f6dec0] bg-[#fff4cf] px-4 py-2 text-sm font-extrabold text-[#06296b]">
            <Sparkles className="h-4 w-4 text-[#ff5144]" fill="#ff5144" />
            Twój osobisty korepetytor 24/7
          </div>

          <h1 className="font-display text-[3.1rem] leading-[0.92] text-[#06296b] md:text-[5.4rem]">
            Korepetytor AI, który tłumaczy jak człowiek
          </h1>

          <p className="mt-7 max-w-xl text-lg font-bold leading-8 text-[#315083] md:text-xl">
            Wrzuć podręcznik, notatki albo zadanie. TutorAI przygotuje plan nauki,
            quizy, nagrania i proste wyjaśnienia dopasowane do Ciebie.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            {loading ? (
              <div className="h-16 w-52 animate-pulse rounded-xl bg-[#f0f4f8]"></div>
            ) : user ? (
              <a
                href="/dashboard"
                className="cartoon-button inline-flex items-center justify-center gap-4 rounded-xl border border-[#df322a] bg-[#ff5144] px-6 py-4 text-base font-extrabold text-white transition-transform hover:-translate-y-0.5"
              >
                Przejdź do panelu
                <span className="rounded-lg bg-[#e73d34] p-2">
                  <ArrowRight className="h-4 w-4" strokeWidth={3} />
                </span>
              </a>
            ) : (
              <a
                href="/auth/register"
                className="cartoon-button inline-flex items-center justify-center gap-4 rounded-xl border border-[#df322a] bg-[#ff5144] px-6 py-4 text-base font-extrabold text-white transition-transform hover:-translate-y-0.5"
              >
                Zacznij za darmo
                <span className="rounded-lg bg-[#e73d34] p-2">
                  <ArrowRight className="h-4 w-4" strokeWidth={3} />
                </span>
              </a>
            )}
            <a
              href="#jak-to-dziala"
              className="inline-flex items-center justify-center gap-4 rounded-xl border border-[#59dda0] bg-white px-6 py-4 text-base font-extrabold text-[#11805e] transition-transform hover:-translate-y-0.5"
            >
              Zobacz jak to działa
              <span className="rounded-full border border-[#59dda0] p-2">
                <Play className="h-4 w-4 fill-[#11805e]" strokeWidth={2.5} />
              </span>
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-sm font-extrabold text-[#7a8bad]">
            {benefits.map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <Check className="h-5 w-5 text-[#06296b]" strokeWidth={3} />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mt-10 min-h-[420px] md:mt-0">
          <Image
            src="/assets/tutorai-hero-tutor-collage.png"
            alt="Karty wideo z AI korepetytorami TutorAI"
            fill
            priority
            sizes="(min-width: 768px) 40vw, 92vw"
            className="object-contain object-center"
          />
        </div>
      </div>
    </section>
  );
}
