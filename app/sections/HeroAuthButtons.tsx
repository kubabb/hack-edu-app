"use client";

import { ArrowRight, Play } from "lucide-react";
import { useUser } from "@/src/hooks/useUser";

export default function HeroAuthButtons() {
  const { user, loading } = useUser();

  return (
    <>
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
    </>
  );
}
