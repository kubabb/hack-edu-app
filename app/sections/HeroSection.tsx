"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Lock,
  MessageSquare,
  Target,
  FileText,
  BarChart3,
} from "lucide-react";

const featureCards = [
  {
    icon: MessageSquare,
    title: "Wyjaśnienia AI",
  },
  {
    icon: Target,
    title: "Spersonalizowana nauka",
  },
  {
    icon: FileText,
    title: "Testy i powtórki",
  },
  {
    icon: BarChart3,
    title: "Postępy i cele",
  },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen md:min-h-screen min-h-auto flex items-center overflow-hidden">
      {/* Background image */}
      <img
        src="/assets/landingpage_hero.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 to-black/35" />

      <div className="relative z-10 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-24 md:py-0 mt-[70px] md:mt-[70px]">
        <div className="flex flex-col md:grid md:grid-cols-[25%_50%_25%] gap-8 md:gap-6 items-center">
          {/* LEFT - Glass card */}
          <motion.div
            className="order-3 md:order-1 w-full flex justify-center md:justify-start"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="bg-white/90 backdrop-blur rounded-xl p-6 shadow-lg max-w-[320px] w-full">
              <Brain className="w-12 h-12 text-[#2ba599] mb-4" />
              <h3 className="text-[20px] font-bold text-[#1a1a1a] mb-2">
                AI, które uczy
              </h3>
              <p className="text-sm text-[#666666] mb-5 leading-relaxed">
                Nasza sztuczna inteligencja dostosowuje się do Twojego tempa
                nauki i stylu uczenia się, dostarczając spersonalizowane
                wyjaśnienia oraz materiały.
              </p>
              <a
                href="#jak-to-dziala"
                className="inline-flex items-center justify-center w-full border border-[#1d7874] text-[#1d7874] text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#1d7874]/5 transition-colors"
              >
                Zobacz jak to działa
              </a>
            </div>
          </motion.div>

          {/* CENTER - Main content */}
          <div className="order-1 md:order-2 flex flex-col items-center text-center">
            <motion.h1
              className="text-[32px] md:text-5xl font-bold text-white max-w-[600px] leading-tight"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Wejdź do światu wiedzy z TutorAI
            </motion.h1>

            <motion.p
              className="mt-4 text-lg text-white/80 max-w-[500px]"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Twój osobisty przewodnik po nauce. Zrozum. Zapamiętaj.
              Zastosuj.
            </motion.p>

            <motion.a
              href="/auth/register"
              className="mt-8 inline-flex items-center justify-center bg-[#1d7874] text-white text-base font-semibold px-10 py-3.5 rounded-lg hover:scale-105 transition-transform shadow-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Rozpocznij naukę
            </motion.a>

            <motion.div
              className="mt-3 flex items-center gap-1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Lock className="w-3.5 h-3.5 text-white/60" />
              <span className="text-xs text-white/60">
                Za darmo. Bez karty kredytowej.
              </span>
            </motion.div>
          </div>

          {/* RIGHT - Feature cards grid */}
          <div className="order-4 md:order-3 w-full flex justify-center md:justify-end">
            <div className="grid grid-cols-2 gap-3">
              {featureCards.map((card, i) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={card.title}
                    className="bg-white/95 rounded-lg p-4 shadow w-[140px] flex flex-col items-center text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                  >
                    <Icon className="w-8 h-8 text-[#2ba599] mb-2" />
                    <span className="text-xs font-semibold text-[#1a1a1a] leading-tight">
                      {card.title}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
