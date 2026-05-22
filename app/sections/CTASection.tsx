"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current || !contentRef.current) return;

      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 50, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none none",
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="cta"
      className="py-20 px-4 bg-gradient-to-r from-[#1d7874]/10 via-white to-[#2ba599]/10"
    >
      <div
        ref={contentRef}
        className="max-w-4xl mx-auto text-center"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a1a]">
          Gotów na zmianę w sposobie uczenia się?
        </h2>
        <p className="mt-4 text-lg text-[#666666] max-w-2xl mx-auto">
          Zaraz Ci pokażemy, jak TutorAI zmienił naukę dla tysięcy uczniów.
          Bez zobowiązań, bez karty kredytowej.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="/auth/register" className="bg-[#1d7874] text-white px-8 py-3 rounded-lg font-medium transition-transform hover:scale-105 cursor-pointer inline-flex items-center justify-center">
            Rozpocznij bezpłatnie
          </a>
          <a href="/dashboard" className="border border-[#1d7874] text-[#1d7874] px-8 py-3 rounded-lg font-medium transition-colors hover:bg-[#f0fffe] cursor-pointer inline-flex items-center justify-center">
            Przejdź do aplikacji
          </a>
        </div>
      </div>
    </section>
  );
}
