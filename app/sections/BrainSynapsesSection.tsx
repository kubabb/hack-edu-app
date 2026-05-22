"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { BookOpen, Brain, Target, Lightbulb, Link } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: BookOpen,
    title: "Personalizowane ścieżki",
    description:
      "Dostosowane do Twojego tempa, stylu nauki i celów edukacyjnych.",
    position: "top-left" as const,
  },
  {
    icon: Brain,
    title: "Tłumaczenia i wyjaśnienia AI",
    description:
      "Złożone zagadnienia wyjaśnione prostym językiem w kilka sekund.",
    position: "top-right" as const,
  },
  {
    icon: Target,
    title: "Planowanie i cele",
    description:
      "Inteligentne harmonogramy, przypomnienia i śledzenie postępów.",
    position: "mid-left" as const,
  },
  {
    icon: Lightbulb,
    title: "Motywacja i wsparcie",
    description: "Cenne wskazówki, cele dzienne i nagrody za regularność.",
    position: "mid-right" as const,
  },
  {
    icon: Link,
    title: "Graf wiedzy",
    description:
      "Wizualne powiązania między tematami — zobacz, jak wszystko się łączy.",
    position: "bottom-center" as const,
  },
];

// Line coordinates in 1000x600 viewBox space
const lineCoords: Record<
  string,
  { start: { x: number; y: number }; end: { x: number; y: number } }
> = {
  "top-left": {
    start: { x: 420, y: 180 },
    end: { x: 220, y: 100 },
  },
  "top-right": {
    start: { x: 580, y: 180 },
    end: { x: 780, y: 100 },
  },
  "mid-left": {
    start: { x: 400, y: 250 },
    end: { x: 220, y: 300 },
  },
  "mid-right": {
    start: { x: 600, y: 250 },
    end: { x: 780, y: 300 },
  },
  "bottom-center": {
    start: { x: 500, y: 350 },
    end: { x: 500, y: 480 },
  },
};

export default function BrainSynapsesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const brainRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<SVGSVGElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const nodesRef = useRef<(SVGCircleElement | null)[]>([]);

  useGSAP(
    () => {
      if (!sectionRef.current || !containerRef.current) return;

      const isMobile = window.innerWidth < 768;

      // Ambient float on brain
      if (brainRef.current) {
        gsap.to(brainRef.current, {
          y: -10,
          duration: 2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      }

      // Pulsing nodes inside brain
      nodesRef.current.forEach((node) => {
        if (!node) return;
        gsap.to(node, {
          scale: 1.6,
          duration: 1.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          transformOrigin: "center center",
        });
      });

      if (isMobile) {
        // Mobile: simpler fade-in for cards
        gsap.fromTo(
          cardsRef.current.filter(Boolean),
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
              toggleActions: "play none none none",
            },
          }
        );
        return;
      }

      // Desktop: full timeline with brain, lines, cards
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          end: "center center",
          scrub: 1,
        },
      });

      // 1. Brain fades in + scales from 0.8
      if (brainRef.current) {
        tl.fromTo(
          brainRef.current,
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" },
          0
        );
      }

      // 2. Synapse lines draw out (stagger 0.1)
      const linePaths = linesRef.current?.querySelectorAll("path");
      if (linePaths && linePaths.length > 0) {
        linePaths.forEach((path, i) => {
          const length = (path as SVGPathElement).getTotalLength();
          gsap.set(path, {
            strokeDasharray: length,
            strokeDashoffset: length,
          });
          tl.to(
            path,
            {
              strokeDashoffset: 0,
              duration: 0.3,
              ease: "power2.out",
            },
            0.2 + i * 0.1
          );
        });
      }

      // 3. Feature cards slide in from their direction + fade (stagger 0.15)
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        const pos = features[i].position;
        let fromX = 0;
        let fromY = 0;
        if (pos === "top-left" || pos === "mid-left") fromX = -60;
        if (pos === "top-right" || pos === "mid-right") fromX = 60;
        if (pos === "bottom-center") fromY = 40;

        tl.fromTo(
          card,
          { opacity: 0, x: fromX, y: fromY },
          {
            opacity: 1,
            x: 0,
            y: 0,
            duration: 0.3,
            ease: "power2.out",
          },
          0.35 + i * 0.15
        );
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      id="jak-to-dziala"
      ref={sectionRef}
      className="relative bg-white py-24 px-4 md:px-16 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center text-4xl md:text-5xl font-bold text-[#1a1a1a]">
          Jak TutorAI wspiera Twoją naukę
        </h2>
        <p className="text-center max-w-2xl mx-auto mt-4 text-[#666]">
          Nasza sztuczna inteligencja działa jak osobisty mentor — analizuje,
          dopasowuje i motywuje na każdym etapie nauki.
        </p>

        <div
          ref={containerRef}
          className="relative mt-16 md:mt-24 flex flex-col items-center"
        >
          {/* Desktop: 3-column grid with synapse lines overlay */}
          <div className="hidden md:block relative w-full">
            {/* Synapse Lines — desktop only, absolute overlay */}
            <svg
              ref={linesRef}
              className="absolute inset-0 w-full h-full pointer-events-none z-0"
              viewBox="0 0 1000 600"
              preserveAspectRatio="xMidYMid meet"
            >
              {features.map((f, i) => {
                const coords = lineCoords[f.position];
                const pathD = `M${coords.start.x} ${coords.start.y} Q${
                  (coords.start.x + coords.end.x) / 2 +
                  (i % 2 === 0 ? -30 : 30)
                } ${(coords.start.y + coords.end.y) / 2} ${coords.end.x} ${
                  coords.end.y
                }`;
                return (
                  <path
                    key={f.position}
                    d={pathD}
                    stroke="#2ba599"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    opacity="0.6"
                  />
                );
              })}
            </svg>

            {/* Grid layout: left cards | brain | right cards */}
            <div className="relative z-10 grid grid-cols-3 gap-8 items-center">
              {/* Left column */}
              <div className="flex flex-col gap-8 justify-center">
                {features
                  .filter((f) => f.position === "top-left" || f.position === "mid-left")
                  .map((f, idx) => {
                    const globalIdx = features.findIndex((feat) => feat.position === f.position);
                    const Icon = f.icon;
                    return (
                      <div
                        key={f.position}
                        ref={(el) => { cardsRef.current[globalIdx] = el; }}
                        className="bg-white rounded-xl p-5 shadow-lg border border-[#f5f5f5] transition-transform hover:scale-105"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Icon size={28} className="text-[#2ba599] shrink-0" />
                          <h3 className="font-bold text-[#1a1a1a] text-base leading-tight">
                            {f.title}
                          </h3>
                        </div>
                        <p className="text-sm text-[#666]">{f.description}</p>
                      </div>
                    );
                  })}
              </div>

              {/* Center: Brain SVG */}
              <div ref={brainRef} className="relative z-10 w-[300px] mx-auto">
                <svg
                  viewBox="0 0 300 260"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-auto"
                >
                  {/* Stylized brain with curved lobes */}
                  <path
                    d="M150 20
                       C110 10, 60 30, 50 80
                       C45 110, 30 130, 40 160
                       C50 190, 80 220, 120 235
                       C135 242, 150 245, 150 245
                       C150 245, 165 242, 180 235
                       C220 220, 250 190, 260 160
                       C270 130, 255 110, 250 80
                       C240 30, 190 10, 150 20Z"
                    fill="#1d7874"
                    stroke="#2ba599"
                    strokeWidth="2"
                  />
                  {/* Left lobe detail */}
                  <path
                    d="M140 50 C110 45, 80 70, 75 110"
                    stroke="#2ba599"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path
                    d="M135 90 C115 85, 95 100, 90 130"
                    stroke="#2ba599"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path
                    d="M130 140 C110 135, 100 155, 105 180"
                    stroke="#2ba599"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* Right lobe detail */}
                  <path
                    d="M160 50 C190 45, 220 70, 225 110"
                    stroke="#2ba599"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path
                    d="M165 90 C185 85, 205 100, 210 130"
                    stroke="#2ba599"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path
                    d="M170 140 C190 135, 200 155, 195 180"
                    stroke="#2ba599"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* Center groove */}
                  <path
                    d="M150 25 C148 80, 148 180, 150 240"
                    stroke="#2ba599"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />

                  {/* Pulsing nodes */}
                  <circle
                    ref={(el) => { nodesRef.current[0] = el; }}
                    cx="80"
                    cy="60"
                    r="4"
                    fill="#2ba599"
                  />
                  <circle
                    ref={(el) => { nodesRef.current[1] = el; }}
                    cx="220"
                    cy="60"
                    r="4"
                    fill="#2ba599"
                  />
                  <circle
                    ref={(el) => { nodesRef.current[2] = el; }}
                    cx="55"
                    cy="130"
                    r="4"
                    fill="#2ba599"
                  />
                  <circle
                    ref={(el) => { nodesRef.current[3] = el; }}
                    cx="245"
                    cy="130"
                    r="4"
                    fill="#2ba599"
                  />
                  <circle
                    ref={(el) => { nodesRef.current[4] = el; }}
                    cx="150"
                    cy="245"
                    r="4"
                    fill="#2ba599"
                  />
                  <circle
                    ref={(el) => { nodesRef.current[5] = el; }}
                    cx="150"
                    cy="130"
                    r="3"
                    fill="#2ba599"
                  />
                </svg>
              </div>

              {/* Right column */}
              <div className="flex flex-col gap-8 justify-center">
                {features
                  .filter((f) => f.position === "top-right" || f.position === "mid-right")
                  .map((f) => {
                    const globalIdx = features.findIndex((feat) => feat.position === f.position);
                    const Icon = f.icon;
                    return (
                      <div
                        key={f.position}
                        ref={(el) => { cardsRef.current[globalIdx] = el; }}
                        className="bg-white rounded-xl p-5 shadow-lg border border-[#f5f5f5] transition-transform hover:scale-105"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Icon size={28} className="text-[#2ba599] shrink-0" />
                          <h3 className="font-bold text-[#1a1a1a] text-base leading-tight">
                            {f.title}
                          </h3>
                        </div>
                        <p className="text-sm text-[#666]">{f.description}</p>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Bottom row: bottom-center card */}
            <div className="relative z-10 flex justify-center mt-8">
              {(() => {
                const f = features.find((feat) => feat.position === "bottom-center")!;
                const globalIdx = features.findIndex((feat) => feat.position === "bottom-center");
                const Icon = f.icon;
                return (
                  <div
                    key={f.position}
                    ref={(el) => { cardsRef.current[globalIdx] = el; }}
                    className="bg-white rounded-xl p-5 shadow-lg border border-[#f5f5f5] transition-transform hover:scale-105 max-w-[320px] w-full"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Icon size={28} className="text-[#2ba599] shrink-0" />
                      <h3 className="font-bold text-[#1a1a1a] text-base leading-tight">
                        {f.title}
                      </h3>
                    </div>
                    <p className="text-sm text-[#666]">{f.description}</p>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Mobile: single column stack */}
          <div className="md:hidden flex flex-col items-center w-full">
            {/* Brain SVG */}
            <div ref={brainRef} className="relative z-10 w-[260px] mx-auto">
              <svg
                viewBox="0 0 300 260"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-auto"
              >
                {/* Stylized brain with curved lobes */}
                <path
                  d="M150 20
                     C110 10, 60 30, 50 80
                     C45 110, 30 130, 40 160
                     C50 190, 80 220, 120 235
                     C135 242, 150 245, 150 245
                     C150 245, 165 242, 180 235
                     C220 220, 250 190, 260 160
                     C270 130, 255 110, 250 80
                     C240 30, 190 10, 150 20Z"
                  fill="#1d7874"
                  stroke="#2ba599"
                  strokeWidth="2"
                />
                {/* Left lobe detail */}
                <path
                  d="M140 50 C110 45, 80 70, 75 110"
                  stroke="#2ba599"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M135 90 C115 85, 95 100, 90 130"
                  stroke="#2ba599"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M130 140 C110 135, 100 155, 105 180"
                  stroke="#2ba599"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Right lobe detail */}
                <path
                  d="M160 50 C190 45, 220 70, 225 110"
                  stroke="#2ba599"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M165 90 C185 85, 205 100, 210 130"
                  stroke="#2ba599"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M170 140 C190 135, 200 155, 195 180"
                  stroke="#2ba599"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Center groove */}
                <path
                  d="M150 25 C148 80, 148 180, 150 240"
                  stroke="#2ba599"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />

                {/* Pulsing nodes */}
                <circle
                  ref={(el) => { nodesRef.current[0] = el; }}
                  cx="80"
                  cy="60"
                  r="4"
                  fill="#2ba599"
                />
                <circle
                  ref={(el) => { nodesRef.current[1] = el; }}
                  cx="220"
                  cy="60"
                  r="4"
                  fill="#2ba599"
                />
                <circle
                  ref={(el) => { nodesRef.current[2] = el; }}
                  cx="55"
                  cy="130"
                  r="4"
                  fill="#2ba599"
                />
                <circle
                  ref={(el) => { nodesRef.current[3] = el; }}
                  cx="245"
                  cy="130"
                  r="4"
                  fill="#2ba599"
                />
                <circle
                  ref={(el) => { nodesRef.current[4] = el; }}
                  cx="150"
                  cy="245"
                  r="4"
                  fill="#2ba599"
                />
                <circle
                  ref={(el) => { nodesRef.current[5] = el; }}
                  cx="150"
                  cy="130"
                  r="3"
                  fill="#2ba599"
                />
              </svg>
            </div>

            {/* Mobile cards stack */}
            <div className="flex flex-col gap-4 mt-8 w-full max-w-sm">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.position}
                    ref={(el) => { cardsRef.current[i] = el; }}
                    className="bg-white rounded-xl p-5 shadow-lg border border-[#f5f5f5] transition-transform hover:scale-105"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Icon size={28} className="text-[#2ba599] shrink-0" />
                      <h3 className="font-bold text-[#1a1a1a] text-base leading-tight">
                        {f.title}
                      </h3>
                    </div>
                    <p className="text-sm text-[#666]">{f.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
