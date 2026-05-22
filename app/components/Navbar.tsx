"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles } from "lucide-react";

const navLinks = [
  { label: "Funkcje", href: "#funkcje" },
  { label: "Jak to działa", href: "#jak-to-dziala" },
  { label: "Dla kogo", href: "#dla-kogo" },
  { label: "Cennik", href: "#cennik" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-[70px] backdrop-blur-xl border-b transition-colors duration-300 ${
          scrolled
            ? "bg-white/95 border-black/5 shadow-lg shadow-black/5"
            : "bg-white/10 border-white/20"
        }`}
      >
        <div className="relative z-10 mx-auto max-w-7xl h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <motion.a
            href="#"
            className="flex items-center gap-1.5"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span
              className={`text-[20px] font-bold transition-colors duration-300 ${
                scrolled ? "text-[#1a1a1a]" : "text-white"
              }`}
            >
              TutorAI
            </span>
            <Sparkles className="w-4 h-4 text-[#2ba599]" />
          </motion.a>

          {/* Desktop Links */}
          <motion.div
            className="hidden md:flex items-center gap-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`relative text-[14px] font-semibold transition-colors group ${
                  scrolled
                    ? "text-[#1a1a1a] hover:text-[#2ba599]"
                    : "text-white hover:text-[#2ba599]"
                }`}
              >
                {link.label}
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-[#2ba599] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </motion.div>

          {/* Desktop Right */}
          <motion.div
            className="hidden md:flex items-center gap-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <a
              href="/auth/login"
              className={`text-[14px] font-semibold transition-colors ${
                scrolled
                  ? "text-[#1a1a1a] hover:text-[#2ba599]"
                  : "text-white hover:text-[#2ba599]"
              }`}
            >
              Zaloguj się
            </a>
            <a
              href="/auth/register"
              className="inline-flex items-center justify-center bg-[#1d7874] text-white text-[14px] font-semibold px-6 py-2.5 rounded-lg hover:scale-105 transition-transform shadow-[0_0_15px_rgba(29,120,116,0.4)]"
            >
              Zacznij naukę
            </a>
          </motion.div>

          {/* Mobile Hamburger */}
          <button
            className={`md:hidden p-2 transition-colors duration-300 ${
              scrolled ? "text-[#1a1a1a]" : "text-white"
            }`}
            onClick={() => setMobileOpen(true)}
            aria-label="Otwórz menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col bg-white/98 backdrop-blur-xl"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative z-10 flex items-center justify-between h-[70px] px-4 sm:px-6">
              <a href="#" className="flex items-center gap-1.5">
                <span className="text-[20px] font-bold text-[#1a1a1a]">
                  TutorAI
                </span>
                <Sparkles className="w-4 h-4 text-[#2ba599]" />
              </a>
              <button
                className="p-2 text-[#1a1a1a]"
                onClick={() => setMobileOpen(false)}
                aria-label="Zamknij menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center flex-1 gap-8 px-6">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-xl font-semibold text-[#1a1a1a] hover:text-[#2ba599] transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  {link.label}
                </motion.a>
              ))}

              <motion.div
                className="flex flex-col items-center gap-4 mt-4 w-full max-w-xs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <a
                  href="/auth/login"
                  className="text-base font-semibold text-[#1a1a1a] hover:text-[#2ba599] transition-colors"
                >
                  Zaloguj się
                </a>
                <a
                  href="/auth/register"
                  className="w-full inline-flex items-center justify-center bg-[#1d7874] text-white text-base font-semibold px-6 py-3 rounded-lg hover:scale-105 transition-transform shadow-[0_0_15px_rgba(29,120,116,0.4)]"
                >
                  Zacznij naukę
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
