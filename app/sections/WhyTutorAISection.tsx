import Image from "next/image";
import { ArrowLeft, ArrowRight, Play, Star } from "lucide-react";

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
];

const playlist = [
  "Wzór ogólny i delta",
  "Przykłady krok po kroku",
  "Postać iloczynowa",
  "Zadania maturalne",
];

export default function WhyTutorAISection() {
  return (
    <section id="funkcje" className="px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="cartoon-panel rounded-[32px] px-5 py-9 md:px-10">
          <h2 className="text-center font-display text-4xl leading-none text-[#06296b] md:text-6xl">
            Ufa nam nowe pokolenie uczniów
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {studentCards.map((card) => (
              <article
                key={card.name}
                className="rounded-[24px] border border-[#e4eaf4] p-5"
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
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#a493ef] text-white"
              aria-label="Poprzednia opinia"
            >
              <ArrowLeft className="h-5 w-5" strokeWidth={3} />
            </button>
            <div className="flex gap-2">
              <span className="h-3 w-3 rounded-full bg-[#7057ff]" />
              <span className="h-3 w-3 rounded-full bg-[#d6d5e8]" />
              <span className="h-3 w-3 rounded-full bg-[#d6d5e8]" />
            </div>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#7057ff] text-white"
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
            <a
              href="/auth/register"
              className="cartoon-button mt-8 inline-flex w-fit items-center gap-3 rounded-xl bg-[#ff5144] px-6 py-4 font-extrabold text-white"
            >
              Zobacz nagrania
              <Play className="h-4 w-4 fill-white" />
            </a>
          </div>

          <div className="grid gap-5 bg-[#fff1ed] p-5 lg:grid-cols-[1fr_0.36fr]">
            <div className="relative overflow-hidden rounded-[24px] bg-[#13213e] shadow-[0_20px_50px_rgba(6,41,107,0.2)]">
              <Image
                src="/assets/tutorai-video-lesson.png"
                alt="Miniatura nagrania AI korepetytora wyjaśniającego równania kwadratowe"
                width={680}
                height={476}
                loading="eager"
                className="h-full min-h-[290px] w-full object-cover"
              />
              <button
                type="button"
                className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[#ff5144] shadow-xl"
                aria-label="Odtwórz nagranie"
              >
                <Play className="ml-1 h-9 w-9 fill-current" />
              </button>
            </div>

            <aside className="rounded-[24px] bg-white p-5">
              <h3 className="text-lg font-extrabold text-[#06296b]">Równania kwadratowe</h3>
              <p className="mt-1 text-sm font-bold text-[#8a9abb]">4 krótkie filmy</p>
              <div className="mt-5 grid gap-3">
                {playlist.map((item, index) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl bg-[#fff4f1] p-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ff5144] text-sm font-extrabold text-white">
                      {index + 1}
                    </span>
                    <span className="text-sm font-extrabold text-[#06296b]">{item}</span>
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
