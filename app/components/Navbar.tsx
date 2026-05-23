"use client";

import { useEffect, useState } from "react";
import { ArrowRight, GraduationCap, Menu, X } from "lucide-react";
import { useUser } from "@/src/hooks/useUser";

const navLinks = [
  { label: "Funkcje", href: "#funkcje" },
  { label: "Jak to działa", href: "#jak-to-dziala" },
  { label: "Nagrania", href: "#nagrania" },
  { label: "Cennik", href: "#cennik" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, loading } = useUser();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50 px-4 py-4">
        <div
          className={`cartoon-panel mx-auto flex h-16 max-w-7xl items-center justify-between rounded-[24px] px-4 transition-all duration-300 md:px-7 ${
            scrolled ? "shadow-[0_18px_45px_rgba(6,41,107,0.12)]" : ""
          }`}
        >
          <a href="#" className="flex items-center gap-2 text-[#06296b]">
            <img src="/icon_mascot.svg" alt="nastoprocent Logo" className="h-14 w-auto" />
            <span className="font-display text-3xl leading-none -mt-2">nastoprocent</span>
          </a>

          <div className="hidden items-center rounded-[20px] border border-[#dce7f5] bg-white px-2 py-1.5 shadow-[inset_0_-2px_rgba(6,41,107,0.04)] md:flex">
            {navLinks.map((link, index) => (
              <a
                key={link.href}
                href={link.href}
                className={`rounded-2xl px-4 py-2 text-sm font-extrabold transition-colors ${
                  index === 0
                    ? "bg-[#7057ff] text-white shadow-[inset_0_-3px_rgba(6,41,107,0.16)]"
                    : "text-[#06296b] hover:bg-[#f3f6ff]"
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {loading ? (
              <div className="h-10 w-24 animate-pulse rounded-xl bg-[#f0f4f8]"></div>
            ) : user ? (
              <a
                href="/dashboard"
                className="cartoon-button inline-flex items-center gap-2 rounded-xl border border-[#42d996] bg-[#6ff0ae] px-5 py-3 text-sm font-extrabold text-[#063f40] transition-transform hover:-translate-y-0.5"
              >
                Przejdź do panelu
                <ArrowRight className="h-4 w-4" strokeWidth={3} />
              </a>
            ) : (
              <>
                <a
                  href="/auth/login"
                  className="rounded-xl border border-[#dce7f5] bg-white px-5 py-3 text-sm font-extrabold text-[#06296b] shadow-[inset_0_-3px_rgba(6,41,107,0.07)] transition-transform hover:-translate-y-0.5"
                >
                  Login
                </a>
                <a
                  href="/auth/register"
                  className="cartoon-button inline-flex items-center gap-2 rounded-xl border border-[#42d996] bg-[#6ff0ae] px-5 py-3 text-sm font-extrabold text-[#063f40] transition-transform hover:-translate-y-0.5"
                >
                  Zacznij naukę
                  <ArrowRight className="h-4 w-4" strokeWidth={3} />
                </a>
              </>
            )}
          </div>

          <button
            type="button"
            className="rounded-xl border border-[#dce7f5] bg-white p-3 text-[#06296b] md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Otwórz menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-[#f6f4ef] p-4 md:hidden">
          <div className="cartoon-panel flex min-h-full flex-col rounded-[28px] p-5">
            <div className="flex items-center justify-between">
              <a href="#" className="flex items-center gap-2 text-[#06296b]">
                <img src="/icon_mascot.svg" alt="nastoprocent Logo" className="h-14 w-auto" />
                <span className="font-display text-3xl leading-none -mt-2">nastoprocent</span>
              </a>
              <button
                type="button"
                className="rounded-xl border border-[#dce7f5] bg-white p-3 text-[#06296b]"
                onClick={() => setMobileOpen(false)}
                aria-label="Zamknij menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-12 flex flex-1 flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-2xl bg-white px-5 py-4 text-xl font-extrabold text-[#06296b]"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-auto grid gap-3">
                {loading ? (
                  <div className="h-14 animate-pulse rounded-2xl bg-[#f0f4f8]"></div>
                ) : user ? (
                  <a
                    href="/dashboard"
                    className="cartoon-button rounded-2xl bg-[#6ff0ae] px-5 py-4 text-center font-extrabold text-[#063f40]"
                  >
                    Przejdź do panelu
                  </a>
                ) : (
                  <>
                    <a
                      href="/auth/login"
                      className="rounded-2xl border border-[#dce7f5] bg-white px-5 py-4 text-center font-extrabold text-[#06296b]"
                    >
                      Login
                    </a>
                    <a
                      href="/auth/register"
                      className="cartoon-button rounded-2xl bg-[#6ff0ae] px-5 py-4 text-center font-extrabold text-[#063f40]"
                    >
                      Zacznij naukę
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
