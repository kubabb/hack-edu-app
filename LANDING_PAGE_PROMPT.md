# Landing Page TutorAI - Prompt Techniczny

## Przegląd projektu
Utwórz responsywny landing page dla aplikacji **TutorAI** - AI tutora edukacyjnego z grafem wiedzy. Strona powinna być nowoczesna, angażująca i pokazywać wartość propozycji aplikacji w wizualnie atrakcyjny sposób.

**Stack techniczny:**
- Next.js  (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion (animacje na scroll)
- Biblioteki do animacji: react-scroll-to-element, react-intersection-observer

---

## 1. Navbar (Sticky Header)

### Layout:
- **Position**: Fixed na górze, sticky na scroll
- **Tło**: Semi-transparent white/blur effect (`backdrop-blur`, rgba(255,255,255,0.95))
- **Height**: 70px
- **Shadow**: Subtle shadow na dole (drop-shadow-md na scroll)

### Zawartość:

**Lewa strona:**
- Logo: "TutorAI *" (custom font, bold, 20px)
- Link do logowania w rogu (jeśli aplikacja już istnieje)

**Środek (Desktop only):**
- Menu linków (4 pozycje):
  - "Funkcje" (scroll to section)
  - "Jak to działa" (scroll to section)
  - "Dla logo" (link)
  - "Cennik" (link)
- Font: 14px, semi-bold, spacing 30px
- Hover effect: color zmienia na #2ba599 (accent green)

**Prawa strona:**
- "Zaloguj się" (text link, subtle)
- "Zacznij naukę" (CTA button - zielony #1d7874, 16px, px-6 py-2.5, border-radius 8px)
- Spacing między elementami: 20px

### Responsywność:
- Desktop: Pełny layout jak wyżej
- Tablet (768px): Menu collapse do hamburger menu
- Mobile: Hamburger menu po kliknięciu rozwijane na full screen overlay

### Animacje:
- Fade-in logo i elementów przy load
- Menu items: hover with underline animation (bottom border slide-in)
- CTA button: hover scale 1.05 + shadow increase

---

## 2. Sekcja Hero

### Ogólny Layout:
- **Full-height viewport** (min-height: 100vh)
- **3-column grid layout**:
  - Lewa strona (25%) - "AI, które uczy" section
  - Środek (50%) - Główny visual + CTA
  - Prawa strona (25%) - Feature highlight cards

### Tło:
- **Obraz**: `/assets/landingpage_hero.png` (cover, center)
- **Overlay**: Gradient overlay (rgba(0,0,0,0.35) - nie za ciemny, aby widzieć obraz)
- **Blend mode**: Multiply/Overlay dla bardziej naturalnego efektu

### Środkowa część - Main CTA Area

**Tekst Centred:**
- Nagłówek (h1): "Wejdź do świata wiedzy z TutorAI"
  - Font size: 56px na desktop, 36px na mobile
  - Color: Ciemna zieleń (#1a1a1a) lub biały jeśli obraz ciemny
  - Font weight: 700 (bold)
  - Line-height: 1.2
  - Max-width: 600px, centred

- Podtekst (h2):
  - Text: "Twój osobisty przewodnik po nauce. Zrozum. Zapamiętaj. Zastosuj."
  - Font size: 18px
  - Color: Gray (#666) lub light gray
  - Font weight: 400
  - Margin-top: 16px

- CTA Button:
  - Text: "Rozpocznij naukę"
  - Style: Solid #1d7874 (zielony), white text, 16px bold
  - Padding: 14px 40px
  - Border-radius: 8px
  - Hover: Scale 1.05, box-shadow 0 8px 24px rgba(29,120,116,0.4)
  - Transition: 0.3s ease
  - Margin-top: 24px

- Subtle Info (pod buttonem):
  - Ikona: 🔒 lub ✓
  - Text: "Za darmo. Bez karty kredytowej."
  - Font size: 12px
  - Color: Gray (#999)
  - Icon + text side-by-side

### Lewa strona - "AI, które uczy" Section

**Card / Panel:**
- Background: White/Light glass effect (rgba(255,255,255,0.9) + backdrop-blur)
- Border-radius: 12px
- Padding: 32px 24px
- Shadow: 0 8px 32px rgba(0,0,0,0.1)
- Width: ~320px (responsive)

**Zawartość:**
- Ikona na górze: 🧠 (rozmiar 48px, color #2ba599)
- Tytuł: "AI, które uczy" (font-size 20px, bold, #1a1a1a)
- Opis (3-4 linie):
  ```
  "TutorAI dopasowuje się do Ciebie, wyjaśnia, 
  motywuje i pomaga osiągać Twoje cele szybciej. 
  Zaawansowana technologia uczenia się, w zasięgu ręki."
  ```
  - Font size: 14px
  - Color: #666
  - Line-height: 1.6
  - Margin-top: 12px

- Przycisk poniżej:
  - Text: "Zobacz jak to działa"
  - Style: Secondary button (outline, border #1d7874, color #1d7874, bg transparent)
  - Padding: 10px 16px
  - Font size: 13px
  - Hover: bg #f0fffe (very light green tint)
  - Margin-top: 16px

**Animacje:**
- Fade-in + slide-right przy load (0.4s)
- Hover card: shadow increase, slight scale (1.02)

### Prawa strona - Feature Highlight Cards

**Grid: 2 columns, 2 rows** (na desktop)
- Gap: 12px
- Width: ~300px total
- Każdy card: ~140px width

**Card #1: Wyjaśnienia AI**
- Ikona: 💬 (lub custom AI icon)
- Tytuł: "Wyjaśnienia AI"
- Podtekst: "Trudne tematy prosto wyjaśnione"
- Style: White bg, rounded 8px, padding 16px, subtle shadow

**Card #2: Spersonalizowana nauka**
- Ikona: 🎯
- Tytuł: "Spersonalizowana nauka"
- Podtekst: "Plan dopasowany do Ciebie"

**Card #3: Testy i powtórki**
- Ikona: 📝
- Tytuł: "Testy i powtórki"
- Podtekst: "Utrwalaj wiedzę skutecznie"

**Card #4: Postępy i cele**
- Ikona: 📊
- Tytuł: "Postępy i cele"
- Podtekst: "Śledź rozwój na bieżąco"

**Styling każdego card'a:**
- Background: White (rgba(255,255,255,0.95))
- Border-radius: 8px
- Padding: 16px
- Icon: 32px, color #2ba599
- Tytuł: 13px, bold, #1a1a1a, margin-top 8px
- Podtekst: 11px, #999, margin-top 4px
- Shadow: 0 4px 12px rgba(0,0,0,0.08)
- Hover: shadow increase, bg color warmish tint

**Animacje:**
- Staggered fade-in + slide-up przy load (delay 0.1s, 0.2s, 0.3s, 0.4s)
- Hover: scale 1.03, shadow boost

### Responsywność:

**Desktop (1440px+):**
- Full 3-column layout jak opisany
- Navbar: pełny menu
- Hero: pełna wysokość, flex-row (left, center, right)

**Tablet (768px - 1024px):**
- 2-column layout (center + right features vertically aligned)
- Lewa strona (AI section) poniżej na scroll
- Feature cards: 2x2 grid
- Navbar: hamburger menu
- Hero title: 42px

**Mobile (< 768px):**
- Single column, stack vertically
- Order: Navbar → Title → CTA → AI section → Feature cards
- Hero title: 32px
- Subtitle: 16px
- Feature cards: 1 column, full width
- Lewa i prawa section fullwidth, padding 20px
- Min-height: auto (nie full viewport)

### Animacje (wszystkie sekcje Hero):

**OnLoad (Framer Motion):**
- Title: fade-in + y-slide-down (-20px) → 0, duration 0.8s, delay 0.2s
- Subtitle: fade-in + y-slide-down, duration 0.6s, delay 0.4s
- CTA Button: fade-in + scale (0.9 → 1), duration 0.6s, delay 0.6s
- Left panel: fade-in + x-slide-right (-40px), duration 0.8s, delay 0.3s
- Right cards: staggered fade-in + slide-up, duration 0.6s each, delays 0.1s, 0.2s, 0.3s, 0.4s

**OnScroll (Parallax + Intersection Observer):**
- Background image: slow parallax effect (translate-y по мере scroll, 30% скорости пользователя)
- Title: subtle parallax (slower movement)
- Feature cards на prawo: fade-in + scale-up when entering viewport (Intersection Observer)

**Hover Effects:**
- CTA button: scale 1.05, shadow glow
- Feature cards: scale 1.03, shadow increase, slight bg color shift
- Left panel: shadow boost, subtle bg lighten

### Performance Considerations:
- Images: lazy-load, WebP format, proper srcset
- CSS: GPU-accelerated transforms (transform, opacity only - nie animate width/height)
- Parallax: Use will-change property na background
- Cards: Virtualize na mobile jeśli mamy wiele (mało prawdopodobne tutaj)

---

## 3. Sekcja "Jak TutorAI wspiera Twoją naukę" - Synapsy Mózgu

### Koncept:
- **Cartoon-style mózg** w centrum sekcji (SVG lub PNG ilustracja w stylu flat design)
- Mózg ma stylizowane synapsy/neurony wyciągające się z głównego kształtu
- **Interaktywność na scroll**: Gdy użytkownik scrolluje przez sekcję, synapsy animacyjnie się "rozwijają" i pojawiają się feature-boxy

### Struktura:

**Część 1: Intro tekst**
- Nagłówek (h2): "Jak TutorAI wspiera Twoją naukę"
- Podtekst: "Zaawansowana technologia AI, która działa jak Twój mózg - łączy fakty, analizy, zapamiętuję i pomaga Ci osiągać więcej każdego dnia."

**Część 2: Cartoon mózg z synapsami (main visual)**
- Mózg umieszczony w center sekcji (width: ~300-400px na desktop, skaluje się na mobile)
- Z mózgu wyciągają się 5-6 stylizowanych synaps (animacja DrawSVG lub CSS stroke-dasharray)

### Feature-boxy (synapsy):
Każda synaptsa pokazuje jeden feature. Boxy pojawiają się na scroll (staggered animation):

1. **Synaptsa 1 - Lewo/góra**
   - Ikona: 📚
   - Tytuł: "Personalizowane ścieżki"
   - Opis: "Odkrywaj treści dopasowane do Ciebie. Twój plan nauki zmienia się i rozwija w tempie Ciebie."

2. **Synaptsa 2 - Prawo/góra**
   - Ikona: 🧠
   - Tytuł: "Tłumaczenia i wyjaśnienia AI"
   - Opis: "Trudne tematy wyjaśnione prosto i zrozumiale. Dobre wyjaśnienia to gwarancja nauki."

3. **Synaptsa 3 - Lewo/dół**
   - Ikona: 🎯
   - Tytuł: "Planowanie i cele"
   - Opis: "Ustaw cele, które postagny i osiągaj wyniki efektywnie wraz z TutorAI."

4. **Synaptsa 4 - Prawo/dół**
   - Ikona: 💡
   - Tytuł: "Motywacja i wsparcie"
   - Opis: "Codziennie otwieraj Twój ducha na naukę. Motywacja i wsparcie na Twojej drodze."

5. **Synaptsa 5 - Dół (center)**
   - Ikona: 🔗
   - Tytuł: "Graf wiedzy"
   - Opis: "Widzisz powiązania między pojęciami. Uczy się nie odizolowanych faktów, ale całych systemów."

### Animacje synaps:
- **On scroll**: Każda synaptsa animuje się w sekwencji (delay 0.2s między każdą)
- Animacja: Synaptsa "rośnie" z mózgu (stroke-dasharray animation od 0 do 100%)
- Box feature pojawia się fade-in + slide (0.6s)
- Na hover feature-boxa: scale up 1.05, shadow wzrasta

### Responsywność:
- Desktop: Grid layout, mózg w center, feature-boxy w okół
- Tablet: Mózg bardziej na górze, boxy poniżej
- Mobile: Mózg na górze, boxy w kolumnie poniżej (bez synaps, tylko ikonowe mini-sekcje)

---

## 3. Sekcja "Dlaczego TutorAI?" - Social Proof & Features

### Koncept:
Sekcja pokazująca korzyści i społeczny dowód. Unikalna propozycja handlowa.

### Layout:
- **Nagłówek**: "Dlaczego TutorAI?" (h2)
- **Subheader**: "Dołącz do tysięcy uczniów, którzy uczą się mądrzej z TutorAI" (tłumaczenie: "dzisiaj więcej niż 2300+ actywnych uczniów⭐ 4.9/5 na podstawie 2300+ opinii")

### Zawartość:

**Cards Grid (3 kolumny na desktop, 1 na mobile)**

1. **Card: Szybka nauka**
   - Ikona: ⚡
   - Liczba: "3x szybciej"
   - Opis: "Uczniowie uczą się średnio 3 razy szybciej z personalizowanym podejściem AI"

2. **Card: Lepsze wyniki**
   - Ikona: 📈
   - Liczba: "+45%"
   - Opis: "Średnia poprawa ocen wśród naszych aktywnych użytkowników w ciągu 2 miesięcy"

3. **Card: Dostępność**
   - Ikona: 🌍
   - Liczba: "24/7"
   - Opis: "Dostęp do nauki o każdej porze dnia i nocy, z dowolnego urządzenia"

### Social Proof:
- Avatary użytkowników (zbiór stylizowanych anonimowych avatarów)
- Rating: ⭐ 4.9/5 (liczba opinii: "2300+ opinii")
- Krótki testimonial: "Wreszcie mogę uczyć się w tempie, którym ja dysponuję!"

### Animacje:
- Cards fade-in + slide-up na scroll (Intersection Observer)
- Numbers count-up animation (0 → liczba) przy wejściu w viewport

---

## 4. Sekcja CTA - "Gotów na zmianę?"

### Layout:
- Prosty, czysty design
- Duży button: "Rozpocznij bezpłatnie" (pełna szerokość na mobile)
- Alternatywny link: "Obejrzyj demo" (secondary button)
- Tło: Subtle gradient (lewy → prawy, odcienie zieleni i białości)

### Tekst:
- Główny: "Gotów na zmianę w sposobie uczenia się?"
- Podtekst: "Zaraz Ci pokażemy, jak TutorAI zmienił naukę dla tysięcy uczniów. Bez zobowiązań, bez karty kredytowej."

### Responsywność:
- Desktop: Tekst i buttony w 2-kolumnę (tekst lewo, buttons prawo)
- Mobile: Stack vertical

---

## 5. Footer

### Segmenty:

**Górna część (linki)**
- Logo TutorAI (mini)
- 4 kolumny linków:
  1. **Produkt**: Features, Cennik, Roadmap
  2. **Nauka**: Blog, Poradniki, FAQ
  3. **Firma**: O nas, Praca, Kontakt
  4. **Społeczność**: Discord, Twitter, LinkedIn

**Dolna część (legal + social)**
- Copyright: "© 2026 TutorAI. Wszystkie prawa zastrzeżone."
- Legal linki: Polityka prywatności, Warunki użytkowania
- Social icons: LinkedIn, Twitter, GitHub (z hover effects)

### Design:
- Tło: Ciemne (dark gray / charcoal #1a1a1a)
- Tekst: Light gray / biały
- Divider line między górą i dołem
- Newsletter signup (opcjonalnie): "Bądź na bieżąco z TutorAI" + email input + button

### Responsywność:
- Desktop: 4-kolumn grid
- Mobile: Stack vertical, collapse do 2 kolumn na tablet

---

## Specyfikacja techniczna

### Kolory
- **Primary Green**: `#1d7874` (ciemna zieleń)
- **Accent Green**: `#2ba599` (jaśniejsza zieleń)
- **Tło**: `#ffffff` (biały)
- **Text Primary**: `#1a1a1a` (prawie czarny)
- **Text Secondary**: `#666666` (szary)
- **Neutral**: `#f5f5f5` (very light gray)

### Typografia
- **Headings**: Font sans-serif (np. Inter, Poppins) - bold/semi-bold
- **Body**: Font sans-serif, 16px, line-height 1.6
- **Accent**: Smaller caps dla niektórych sekcji

### Spacing & Layout
- Desktop padding: 80px top/bottom, 60px left/right
- Mobile padding: 40px top/bottom, 20px left/right
- Section gap: 100px (desktop), 60px (mobile)
- Breakpoints: 768px (mobile), 1024px (tablet), 1440px (desktop)

### Animacje & Performance
- Użyj Framer Motion do scroll-triggered animacji
- Intersection Observer do lazy loading sekcji
- Optimize images (WebP format, srcset)
- Lighthouse score target: 90+

### SEO & Meta
- Meta title: "TutorAI - Twój osobisty AI tutor edukacyjny | Naucz się mądrzej"
- Meta description: "Personalizowane ścieżki nauki, AI wsparcie i graf wiedzy. Zacznij bezpłatnie bez karty kredytowej."
- Structured data: Schema.org for Organization, AggregateRating

---

## Instrukcje implementacji

1. **Struktura komponentów**:
   ```
   app/
   ├── components/
   │   ├── HeroSection.tsx
   │   ├── BrainSynapsesSection.tsx (z animacjami scroll)
   │   ├── WhyTutorAISection.tsx (cards + social proof)
   │   ├── CTASection.tsx
   │   ├── Footer.tsx
   │   └── ui/ (reusable components)
   ├── page.tsx (main landing page)
   └── layout.tsx
   ```

2. **Assets do przygotowania**:
   - [ ] `/public/assets/landingpage_hero.png` - już podane
   - [ ] `/public/assets/brain_cartoon.svg` - cartoon mózg (lub PNG z transparencją)
   - [ ] `/public/assets/logo.svg` - logo TutorAI
   - [ ] Favicon

3. **Biblioteki do instalacji**:
   ```bash
   npm install framer-motion react-intersection-observer lucide-react
   ```

4. **Testing**:
   - Responsywność na urządzeniach: mobile (375px), tablet (768px), desktop (1440px)
   - Performance: Lighthouse audit
   - Scroll animacje: smooth, nie laggy

---

## Uwagi dodatkowe

- Strona powinna być **szybka** (optimize images, lazy load, code splitting)
- **Accessible**: WCAG 2.1 AA standard (contrast, keyboard navigation)
- **Mobile-first**: Projektuj najpierw na mobile, potem desktop
- **Dark mode**: Opcjonalnie - zastosuj system prefers-color-scheme
