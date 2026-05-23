"use client";

import { ArrowRight, ClipboardList } from "lucide-react";
import { useUser } from "@/src/hooks/useUser";

export default function CTAAuthButtons() {
  const { user, loading } = useUser();

  return (
    <>
      {loading ? (
        <div className="h-14 w-44 animate-pulse rounded-xl bg-[#f0f4f8]"></div>
      ) : user ? (
        <a
          href="/dashboard"
          className="cartoon-button inline-flex items-center justify-center gap-3 rounded-xl bg-[#6ff0ae] px-6 py-4 font-extrabold text-[#063f40]"
        >
          Przejdź do panelu
          <ArrowRight className="h-4 w-4" strokeWidth={3} />
        </a>
      ) : (
        <a
          href="/auth/register"
          className="cartoon-button inline-flex items-center justify-center gap-3 rounded-xl bg-[#6ff0ae] px-6 py-4 font-extrabold text-[#063f40]"
        >
          Zacznij za darmo
          <ArrowRight className="h-4 w-4" strokeWidth={3} />
        </a>
      )}
      <a
        href="#jak-to-dziala"
        className="inline-flex items-center justify-center gap-3 rounded-xl border border-[#dce7f5] bg-white px-6 py-4 font-extrabold text-[#06296b]"
      >
        Zobacz plan
        <ClipboardList className="h-4 w-4" strokeWidth={2.7} />
      </a>
    </>
  );
}
