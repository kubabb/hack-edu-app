import { Camera, GraduationCap, Mail, MessageCircle, Video } from "lucide-react";

const columns = [
  {
    title: "Produkt",
    links: ["Funkcje", "Nagrania", "Graf wiedzy", "Cennik"],
  },
  {
    title: "Nauka",
    links: ["Blog", "Poradniki", "FAQ", "Dla szkół"],
  },
  {
    title: "Firma",
    links: ["O nas", "Kontakt", "Regulamin", "Prywatność"],
  },
];

export default function Footer() {
  return (
    <footer className="px-4 pb-6 pt-10">
      <div className="cartoon-panel mx-auto max-w-7xl rounded-[32px] px-7 py-10 md:px-12">
        <div className="grid gap-10 md:grid-cols-[1.15fr_1fr_1fr_1fr_1.15fr]">
          <div>
            <a href="#" className="flex items-center gap-2 text-[#06296b]">
              <span className="font-display text-3xl">TutorAI</span>
              <GraduationCap className="h-6 w-6 text-[#20b981]" />
            </a>
            <p className="mt-4 max-w-xs text-sm font-bold leading-6 text-[#6e7fa6]">
              AI korepetytor, który tłumaczy jak człowiek. Nagrania, quizy i
              plany nauki w jednym miejscu.
            </p>
            <div className="mt-6 flex gap-3">
              {[MessageCircle, Video, Camera].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f2f5ff] text-[#7057ff]"
                  aria-label="Kanał społecznościowy TutorAI"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="font-extrabold text-[#06296b]">{column.title}</h3>
              <ul className="mt-4 grid gap-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm font-bold text-[#6e7fa6] hover:text-[#06296b]">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="font-extrabold text-[#06296b]">Bądź na bieżąco</h3>
            <p className="mt-4 text-sm font-bold leading-6 text-[#6e7fa6]">
              Dostawaj nowe przykłady lekcji, quizów i animacji.
            </p>
            <div className="mt-5 grid gap-3">
              <label className="sr-only" htmlFor="footer-email">
                Email
              </label>
              <input
                id="footer-email"
                type="email"
                placeholder="Twój adres email"
                className="rounded-2xl border border-[#dce7f5] bg-white px-4 py-4 text-sm font-bold text-[#06296b] outline-none placeholder:text-[#a5b1ca] focus:border-[#7057ff]"
              />
              <button
                type="button"
                className="cartoon-button inline-flex items-center justify-center gap-2 rounded-2xl bg-[#6ff0ae] px-5 py-4 font-extrabold text-[#063f40]"
              >
                <Mail className="h-4 w-4" />
                Zapisz się
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-[#e6edf7] pt-6 text-center text-sm font-bold text-[#9aa8c1]">
          © 2026 TutorAI. Wszystkie prawa zastrzeżone.
        </div>
      </div>
    </footer>
  );
}
