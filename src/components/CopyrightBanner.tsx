'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Check } from 'lucide-react';

export default function CopyrightBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('copyright-accepted');
    if (!accepted) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('copyright-accepted', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 pointer-events-none flex justify-end">
      <div className="pointer-events-auto w-[320px] sm:w-[380px] rounded-2xl bg-white shadow-xl border border-[#dce7f5] p-5 flex flex-col gap-4 animate-in slide-in-from-bottom-5 fade-in duration-300">
        <div className="text-xs font-bold text-[#6e7fa6] leading-relaxed">
          <strong className="text-[#06296b] text-sm flex items-center gap-1.5 mb-2">
            <span className="text-base">⚠️</span> UWAGA
          </strong>
          Wgrywając plik oświadczasz, że posiadasz do niego prawa lub korzystasz z dozwolonego użytku edukacyjnego. 
          <div className="my-2 h-px bg-[#f6f4ef] w-full" />
          NIE wgrywaj pełnych e-booków, podręczników ani materiałów chronionych bez zgody autora. 
          Ponosisz pełną odpowiedzialność za naruszenie praw autorskich.
        </div>
        
        <button
          onClick={handleAccept}
          className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#f6f4ef] hover:bg-[#eafff4] hover:text-[#11805e] hover:border-[#20b981] border border-[#dce7f5] px-4 py-2.5 text-xs font-extrabold text-[#06296b] transition-all"
        >
          <Check className="h-3.5 w-3.5" />
          Rozumiem i akceptuję
        </button>
      </div>
    </div>
  );
}
