"use client";

import { ArrowRight } from "lucide-react";
import { useUser } from "@/src/hooks/useUser";

export default function BrainAuthButtons() {
  const { user, loading } = useUser();

  if (loading) {
    return <div className="mt-8 h-14 w-44 animate-pulse rounded-xl bg-[#f0f4f8]"></div>;
  }

  if (user) {
    return (
      <a
        href="/dashboard"
        className="cartoon-button mt-8 inline-flex w-fit items-center gap-3 rounded-xl bg-[#ff5144] px-6 py-4 font-extrabold text-white"
      >
        Przejdź do panelu
        <ArrowRight className="h-4 w-4" strokeWidth={3} />
      </a>
    );
  }

  return (
    <a
      href="/auth/register"
      className="cartoon-button mt-8 inline-flex w-fit items-center gap-3 rounded-xl bg-[#ff5144] px-6 py-4 font-extrabold text-white"
    >
      Wypróbuj teraz
      <ArrowRight className="h-4 w-4" strokeWidth={3} />
    </a>
  );
}
