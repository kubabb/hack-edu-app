"use client";

import Image from "next/image";
import { ArrowRight, BookOpen, BrainCircuit, ClipboardCheck } from "lucide-react";
import { useUser } from "@/src/hooks/useUser";

const steps = [
  {
    icon: BookOpen,
    title: "Wrzuć materiał",
    text: "PDF, zdjęcie zadania, notatki albo cały rozdział z podręcznika.",
  },
  {
    icon: BrainCircuit,
    title: "AI robi mapę wiedzy",
    text: "TutorAI rozpoznaje tematy, braki i kolejność, w której warto się uczyć.",
  },
  {
    icon: ClipboardCheck,
    title: "Dostajesz plan",
    text: "Codzienne zadania, quizy, powtórki i nagrania tłumaczące trudne miejsca.",
  },
];

export default function BrainSynapsesSection() {
  const { user, loading } = useUser();

  return (
    <section id="jak-to-dziala" className="px-4 py-10">
      <div className="cartoon-panel mx-auto grid max-w-7xl overflow-hidden rounded-[32px] md:grid-cols-[0.78fr_1.22fr]">
        <div className="flex flex-col justify-center px-7 py-10 md:px-12">
          <p className="mb-4 w-fit rounded-xl bg-[#7b61ff] px-4 py-2 text-sm font-extrabold text-white">
            Jak to działa?
          </p>
          <h2 className="font-display text-4xl leading-[0.98] text-[#06296b] md:text-6xl">
            Wrzuć materiał, dostaniesz plan
          </h2>
          <p className="mt-5 text-lg font-bold leading-8 text-[#6e7fa6]">
            Zero chaosu przed sprawdzianem. Aplikacja zamienia Twoje materiały
            w konkretną ścieżkę nauki, powtórki i szybkie quizy.
          </p>

          <div className="mt-8 grid gap-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="flex gap-4 rounded-2xl border border-[#e3eaf5] bg-white px-4 py-4"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#6ff0ae] text-[#063f40]">
                    <Icon className="h-5 w-5" strokeWidth={2.7} />
                  </span>
                  <div>
                    <h3 className="text-lg font-extrabold text-[#06296b]">{step.title}</h3>
                    <p className="mt-1 text-sm font-bold leading-6 text-[#6e7fa6]">{step.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {loading ? (
            <div className="mt-8 h-14 w-44 animate-pulse rounded-xl bg-[#f0f4f8]"></div>
          ) : user ? (
            <a
              href="/dashboard"
              className="cartoon-button mt-8 inline-flex w-fit items-center gap-3 rounded-xl bg-[#ff5144] px-6 py-4 font-extrabold text-white"
            >
              Przejdź do panelu
              <ArrowRight className="h-4 w-4" strokeWidth={3} />
            </a>
          ) : (
            <a
              href="/auth/register"
              className="cartoon-button mt-8 inline-flex w-fit items-center gap-3 rounded-xl bg-[#ff5144] px-6 py-4 font-extrabold text-white"
            >
              Wypróbuj teraz
              <ArrowRight className="h-4 w-4" strokeWidth={3} />
            </a>
          )}
        </div>

        <div className="relative min-h-[420px] bg-[#f0edff] md:min-h-[600px]">
          <Image
            src="/assets/tutorai-app-mockup.png"
            alt="Mockup panelu TutorAI z planem nauki, quizami i postępami"
            fill
            className="object-cover object-left"
          />
        </div>
      </div>
    </section>
  );
}
