"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Zap, TrendingUp, Globe } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  {
    icon: Zap,
    label: "szybciej",
    prefix: "",
    suffix: "x ",
    target: 3,
    description:
      "Uczniowie korzystający z TutorAI osiągają wyniki trzy razy szybciej dzięki personalizacji.",
  },
  {
    icon: TrendingUp,
    label: "%",
    prefix: "+",
    suffix: "",
    target: 45,
    description:
      "Średni wzrost efektywności nauki w ciągu pierwszego miesiąca korzystania z platformy.",
  },
  {
    icon: Globe,
    label: "/7",
    prefix: "",
    suffix: "",
    target: 24,
    description:
      "Dostępność całodobowa — ucz się wtedy, kiedy chcesz, bez ograniczeń czasowych.",
  },
];

const avatarColors = ["#1d7874", "#2ba599", "#f5a623", "#e74c3c", "#8e44ad"];

export default function WhyTutorAISection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const socialRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          end: "top 25%",
          scrub: false,
          toggleActions: "play none none none",
        },
      });

      tl.fromTo(
        headingRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      )
        .fromTo(
          subRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
          "-=0.4"
        )
        .fromTo(
          cardsRef.current.filter(Boolean),
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.15,
            ease: "power2.out",
          },
          "-=0.3"
        )
        .fromTo(
          socialRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
          "-=0.3"
        );

      // Count-up numbers
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        const stat = stats[i];
        const numEl = card.querySelector(".count-num") as HTMLElement | null;
        if (!numEl) return;

        const obj = { val: 0 };
        gsap.to(obj, {
          val: stat.target,
          duration: 1.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 80%",
            toggleActions: "play none none none",
          },
          onUpdate: () => {
            numEl.textContent =
              stat.prefix + Math.round(obj.val) + stat.suffix;
          },
        });
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="dlaczego-tutorai"
      className="bg-[#f5f5f5] py-20 px-4 md:px-16"
    >
      <div className="max-w-6xl mx-auto">
        <h2
          ref={headingRef}
          className="text-center text-3xl md:text-4xl font-bold text-[#1a1a1a]"
        >
          Dlaczego TutorAI?
        </h2>
        <p
          ref={subRef}
          className="text-center text-[#666] mt-4 max-w-2xl mx-auto"
        >
          Dołącz do tysięcy uczniów, którzy uczą się mądrzej z TutorAI
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                ref={(el) => { cardsRef.current[i] = el; }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-[#e5e5e5] text-center transition-transform hover:scale-[1.03]"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#1d7874]/10">
                  <Icon size={24} className="text-[#1d7874]" />
                </div>
                <div className="text-4xl font-bold text-[#1d7874]">
                  <span className="count-num">
                    {stat.prefix}0{stat.suffix}
                  </span>
                  {stat.label}
                </div>
                <p className="mt-3 text-sm text-[#666] leading-relaxed">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Social Proof */}
        <div
          ref={socialRef}
          className="mt-12 flex flex-col items-center text-center"
        >
          <div className="flex -space-x-3">
            {avatarColors.map((color, idx) => (
              <div
                key={idx}
                className="h-10 w-10 rounded-full border-2 border-white"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2 text-[#1a1a1a] font-semibold">
            <span>⭐ 4.9/5</span>
            <span className="text-[#666] font-normal">
              na podstawie 2300+ opinii
            </span>
          </div>

          <blockquote className="mt-5 max-w-xl italic text-[#555]">
            &ldquo;TutorAI całkowicie zmienił moje podejście do nauki. Zamiast
            wkuwania na pamięć, wreszcie rozumiem zagadnienia i potrafię
            je zastosować na egzaminach.&rdquo;
          </blockquote>
        </div>
      </div>
    </section>
  );
}
