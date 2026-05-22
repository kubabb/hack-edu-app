"use client";

function LinkedinIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function TwitterIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function GithubIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

const productLinks = [
  { label: "Features", href: "#" },
  { label: "Cennik", href: "#" },
  { label: "Roadmap", href: "#" },
];

const learningLinks = [
  { label: "Blog", href: "#" },
  { label: "Poradniki", href: "#" },
  { label: "FAQ", href: "#" },
];

const companyLinks = [
  { label: "O nas", href: "#" },
  { label: "Praca", href: "#" },
  { label: "Kontakt", href: "#" },
];

const communityLinks = [
  { label: "Discord", href: "#" },
  { label: "Twitter", href: "#" },
  { label: "LinkedIn", href: "#" },
];

function LinkColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80 mb-4">
        {title}
      </h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="text-white/60 hover:text-white transition-colors text-sm"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white py-16 px-4 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-1">
            <LinkColumn title="Produkt" links={productLinks} />
          </div>
          <div className="lg:col-span-1">
            <LinkColumn title="Nauka" links={learningLinks} />
          </div>
          <div className="lg:col-span-1">
            <LinkColumn title="Firma" links={companyLinks} />
          </div>
          <div className="lg:col-span-1">
            <LinkColumn title="Społeczność" links={communityLinks} />
          </div>
          <div className="lg:col-span-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80 mb-4">
              Bądź na bieżąco z TutorAI
            </h3>
            <form
              className="flex flex-col gap-3"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Twój adres email"
                className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#2ba599] text-sm"
              />
              <button
                type="submit"
                className="w-full px-4 py-2.5 rounded-lg bg-[#1d7874] text-white font-medium text-sm hover:bg-[#2ba599] transition-colors cursor-pointer"
              >
                Zapisz się
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-white/50">
            <span>© 2026 TutorAI. Wszystkie prawa zastrzeżone.</span>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-white transition-colors">
                Polityka prywatności
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Warunki użytkowania
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="#"
              aria-label="LinkedIn"
              className="text-white/50 hover:text-white transition-colors"
            >
              <LinkedinIcon size={20} />
            </a>
            <a
              href="#"
              aria-label="Twitter"
              className="text-white/50 hover:text-white transition-colors"
            >
              <TwitterIcon size={20} />
            </a>
            <a
              href="#"
              aria-label="GitHub"
              className="text-white/50 hover:text-white transition-colors"
            >
              <GithubIcon size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
