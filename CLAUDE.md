# CLAUDE.md — TutorAI Project Guide

@AGENTS.md

## Opis projektu

**TutorAI** (Korepetytor AI) — platforma edukacyjna z AI tutorem i grafem wiedzy. Uczeń wgrywa książki/PDF-y, system przetwarza je na graf wiedzy (pojęcia, zadania, relacje), a AI tutor prowadzi spersonalizowany tutoring oparty o RAG i kontekst z grafu.

**Język UI**: polski. Tutor odpowiada po polsku, metodą sokratyczną (zadaje pytania naprowadzające zamiast dawać gotowe odpowiedzi).

Projekt hackathonowy, aktywnie rozwijany.

---

## Tech Stack

| Warstwa        | Technologia                                                  |
| -------------- | ------------------------------------------------------------ |
| Framework      | **Next.js 16.2.6** (App Router) + **React 19.2.4** + **TypeScript 5** |
| Styling        | **Tailwind CSS v4** (via `@tailwindcss/postcss`)             |
| Baza danych    | **PostgreSQL** (Supabase, pgvector) via **Prisma 6.19.3**    |
| Autentykacja   | **Supabase Auth** (`@supabase/ssr`). NextAuth usunięty (410) |
| AI / LLM       | **OpenAI SDK v6** — model `gpt-4o-mini` (chat), `text-embedding` (embeddings) |
| OCR            | Mathpix API (adapter)                                        |
| Avatar         | HeyGen API (adapter) — generowanie wideo klipów              |
| Graf wiedzy    | `react-force-graph-2d` (frontend, dynamic import ssr:false), Prisma GraphNode/GraphEdge (backend) |
| Animacje       | **Framer Motion 12**, **GSAP 3.15** + `@gsap/react`         |
| Ikony          | Lucide React                                                 |
| Walidacja      | Zod                                                          |
| Hasła          | bcryptjs                                                     |
| Testy          | Node.js built-in test runner (`--experimental-strip-types`)  |

---

## Komendy

```bash
npm run dev          # Uruchom dev server (Next.js)
npm run build        # Build produkcyjny
npm run start        # Serwer produkcyjny
npm run lint         # ESLint
npm run test         # Testy (node --experimental-strip-types --test)
npx prisma generate  # Generuj Prisma Client
npx prisma db push   # Wypchnij schemat do bazy
npx prisma studio    # Przeglądarka bazy danych
npx prisma migrate dev # Migracja dev (istniejąca: 20260522140015_init)
```

---

## Zmienne środowiskowe (.env.local)

```
DATABASE_URL="postgresql://..."           # Supabase PostgreSQL connection string
OPENAI_API_KEY="sk-..."                   # OpenAI API key (LLM + embeddings)
HEYGEN_API_KEY="..."                      # HeyGen avatar video API
MATHPIX_API_KEY="..."                     # Mathpix OCR API
NEXT_PUBLIC_SUPABASE_URL="https://..."    # Supabase project URL (public)
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."       # Supabase anon key (public)
SUPABASE_SERVICE_ROLE_KEY="..."           # Supabase service role key (server-only!)
```

---

## Architektura — struktura plików

```
hack-edu-app/
├── app/                          # Next.js App Router (strony + API)
│   ├── layout.tsx                # Root layout (font, metadata, providers)
│   ├── page.tsx                  # Landing page
│   ├── globals.css               # Tailwind + custom CSS
│   ├── providers.tsx             # Client-side providers wrapper
│   │
│   ├── auth/                     # Strony autentykacji
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   │
│   ├── dashboard/                # Panel ucznia
│   │   ├── page.tsx              # Główny dashboard
│   │   └── books/
│   │       ├── page.tsx          # Lista książek użytkownika
│   │       └── [bookId]/         # Widok pojedynczej książki + graf + chat
│   │
│   ├── admin/                    # Panel admina
│   │   └── page.tsx
│   │
│   ├── sections/                 # Sekcje landing page
│   │   ├── HeroSection.tsx
│   │   ├── BrainSynapsesSection.tsx
│   │   ├── WhyTutorAISection.tsx
│   │   └── CTASection.tsx
│   │
│   ├── components/               # Komponenty specyficzne dla app/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   │
│   └── api/                      # API Routes (params as Promise — Next.js 16 pattern)
│       ├── auth/
│       │   ├── [...nextauth]/route.ts  # Legacy (zwraca 410)
│       │   └── register/route.ts       # POST: tworzy Prisma user z Supabase UUID
│       ├── books/
│       │   ├── route.ts                # GET lista książek, POST upload & process
│       │   └── [bookId]/
│       │       └── graph/route.ts      # GET graf (nodes + edges) dla książki
│       ├── chat/
│       │   └── route.ts                # POST wiadomość → RAG → AI odpowiedź
│       ├── avatar/
│       │   └── clip/route.ts           # POST: generuj HeyGen wideo klip
│       └── admin/
│           └── users/route.ts          # GET: lista userów (ADMIN only)
│
├── src/                          # Współdzielony kod źródłowy
│   ├── components/               # Reusable UI components
│   │   ├── DashboardLayout.tsx   # Layout dashboardu z sidebar
│   │   ├── KnowledgeGraph.tsx    # Wizualizacja grafu (react-force-graph-2d)
│   │   ├── ChatPanel.tsx         # Panel czatu z AI tutorem
│   │   ├── UploadBookForm.tsx    # Formularz uploadu książki
│   │   └── AvatarPlayer.tsx     # Odtwarzacz wideo avatara
│   │
│   ├── hooks/
│   │   └── useUser.ts            # Hook do pobierania sesji użytkownika (Supabase)
│   │
│   ├── lib/                      # Biblioteki i konfiguracje klienckie
│   │   ├── auth.ts               # Helper auth() — pobiera usera z Supabase
│   │   ├── auth/
│   │   │   └── registration.ts   # Logika rejestracji (bcrypt, Prisma, Supabase)
│   │   ├── http/
│   │   │   └── json.ts           # Helper do typowanych JSON responses
│   │   └── supabase/
│   │       ├── client.ts         # Supabase client (browser)
│   │       └── server.ts         # Supabase client (server, cookies)
│   │
│   └── server/                   # Warstwa serwerowa (Clean Architecture)
│       ├── prisma.ts             # Prisma Client singleton
│       ├── repositories/         # Warstwa dostępu do danych
│       │   ├── BookRepository.ts
│       │   ├── BookPageRepository.ts
│       │   ├── BookChunkRepository.ts
│       │   ├── ChatSessionRepository.ts
│       │   ├── ChatMessageRepository.ts
│       │   ├── EmbeddingRepository.ts
│       │   ├── GraphNodeRepository.ts
│       │   └── GraphEdgeRepository.ts
│       ├── services/             # Logika biznesowa
│       │   ├── BookIngestionService.ts    # Orkiestrator przetwarzania książki
│       │   ├── BookChunkingService.ts     # Dzielenie tekstu na chunki
│       │   ├── EmbeddingService.ts        # Generowanie embeddingów
│       │   ├── GraphBuilderService.ts     # Budowanie grafu wiedzy z LLM
│       │   ├── KnowledgeQueryService.ts   # RAG query (vector search + graf)
│       │   ├── TutoringService.ts         # Orkiestrator czatu z tutorem
│       │   └── AvatarService.ts           # Generowanie wideo avatara
│       └── adapters/             # Adaptery do zewnętrznych API (porty)
│           ├── OcrAdapter.ts              # Interface OCR
│           ├── MathpixOcrAdapter.ts        # Implementacja Mathpix
│           ├── EmbeddingAdapter.ts         # Interface embeddings
│           ├── OpenAIEmbeddingAdapter.ts   # Implementacja OpenAI
│           ├── LlmAdapter.ts              # Interface LLM
│           ├── OpenAILlmAdapter.ts         # Implementacja OpenAI
│           ├── AvatarAdapter.ts            # Interface avatar
│           └── HeyGenAvatarAdapter.ts      # Implementacja HeyGen
│
├── prisma/
│   └── schema.prisma             # Schemat bazy danych
│
├── auth.ts                       # Root auth helper (Supabase compat layer)
├── next.config.ts                # Konfiguracja Next.js
├── tsconfig.json                 # TypeScript config
├── eslint.config.mjs             # ESLint config
├── postcss.config.mjs            # PostCSS (Tailwind)
├── package.json
└── plan.md                       # Plan architektury (szczegółowy)
```

---

## Model danych (Prisma)

### Enumy
- `UserRole`: STUDENT, ADMIN
- `BookStatus`: UPLOADED, PROCESSING, PROCESSED, FAILED
- `ChunkType`: TASK, THEORY, EXAMPLE, OTHER
- `NodeType`: CONCEPT, TASK, SECTION
- `EdgeType`: SIMILAR, DEPENDS_ON, NEXT, PART_OF
- `MessageRole`: USER, ASSISTANT

### Modele (relacje)
```
User 1──* Book 1──* BookPage 1──* BookChunk 1──1 Embedding
                  └──* GraphNode *──* GraphEdge
                  └──* ChatSession 1──* ChatMessage
```

- **User** — id (cuid), email (unique), name, role, password (hashed), books, chatSessions
- **Book** — id, userId, title, status, pages, chunks, nodes, edges, chatSessions
- **BookPage** — id, bookId, pageNumber, rawText, ocrMeta (Json)
- **BookChunk** — id, bookId, pageId, type, content, position, embedding, graphNodes
- **Embedding** — id, chunkId (unique), vector (Bytes), provider
- **GraphNode** — id, bookId, chunkId?, type, label, outgoing edges, incoming edges
- **GraphEdge** — id, bookId, sourceId, targetId, type, weight (Float, default 1.0)
- **ChatSession** — id, userId, bookId, messages, endedAt?
- **ChatMessage** — id, sessionId, role, content, avatarVideoUrl?

---

## Architektura backendowa (Clean Architecture)

Projekt stosuje wzorzec **Ports & Adapters** (Hexagonal Architecture):

```
API Route → Service → Repository → Prisma/DB
                   → Adapter → External API (OpenAI, Mathpix, HeyGen)
```

### Adaptery (interfejsy + implementacje)
| Port (Interface)      | Implementacja           | Cel                           |
| --------------------- | ----------------------- | ----------------------------- |
| `OcrAdapter`          | `MathpixOcrAdapter`     | Ekstrakcja tekstu z PDF/image |
| `EmbeddingAdapter`    | `OpenAIEmbeddingAdapter`| Generowanie wektorów          |
| `LlmAdapter`          | `OpenAILlmAdapter`      | Zapytania do LLM              |
| `AvatarAdapter`       | `HeyGenAvatarAdapter`   | Generowanie wideo avatara     |

### Pipeline przetwarzania książki
```
Upload PDF → BookIngestionService
  → OCR (MathpixOcrAdapter) → BookPage
  → Chunking (BookChunkingService) → BookChunk
  → Embeddings (EmbeddingService) → Embedding
  → Graph Building (GraphBuilderService) → GraphNode + GraphEdge
  → Book.status = PROCESSED
```

### Pipeline czatu z tutorem
```
User message → TutoringService
  → KnowledgeQueryService (RAG: vector search + graph context)
  → LLM (OpenAILlmAdapter) + kontekst z chunków + graf
  → Odpowiedź + sugerowane węzły
  → (opcjonalnie) AvatarService → HeyGen video
```

---

## Autentykacja

Projekt korzysta z **Supabase Auth**. NextAuth został usunięty (route zwraca 410).

- **Logowanie**: Supabase `signInWithPassword()` (email + hasło)
- **Rejestracja**: `src/lib/auth/registration.ts` — tworzy usera w Supabase Auth + rekord w Prisma
- **Sesja**: Cookie-based (Supabase SSR), odczyt przez `auth()` helper
- **Autoryzacja**: `auth()` zwraca `{ user: { id, email, name, role } }` lub `null`
- **Klient przeglądarkowy**: `src/lib/supabase/client.ts`
- **Klient serwerowy**: `src/lib/supabase/server.ts` (z cookies)

### Wzorzec użycia w API Route:
```ts
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session) return new Response('Unauthorized', { status: 401 })
  // session.user.id, session.user.role
}
```

---

## Konwencje kodu

### Ogólne
- **Język**: TypeScript strict, ESM
- **Import aliasy**: `@/` → root projektu (np. `@/src/components/...`, `@/auth`)
- **Nazewnictwo plików**: PascalCase dla komponentów, camelCase dla helperów/hooks
- **API responses**: Użyj helperów z `src/lib/http/json.ts`
- **Walidacja**: Zod do walidacji danych wejściowych API

### Next.js 16 — UWAGA!
- **App Router** — nie Pages Router
- **Server Components** domyślnie, `'use client'` tylko gdy potrzebne
- **Route Handlers** w `app/api/` — eksportują named functions (GET, POST, PATCH, DELETE)
- **params jest Promise** w dynamic routes: `const { bookId } = await params` (Next.js 16 breaking change!)
- **ForceGraph2D** ładowany przez `next/dynamic` z `ssr: false`
- Przed pisaniem kodu Next.js **ZAWSZE** sprawdź dokumentację w `node_modules/next/dist/docs/`
- Brak pliku `middleware.ts` — `proxy.ts` ma logikę middleware (Supabase session refresh) ale nie jest podpięty

### Prisma
- Singleton klienta w `src/server/prisma.ts`
- Schemat w `prisma/schema.prisma`
- Po zmianach schematu: `npx prisma db push` + `npx prisma generate`
- `binaryTargets = ["native", "windows"]` w generatorze

### Design System (styl "Cartoon")
- Tailwind CSS v4 (konfiguracja przez CSS, nie tailwind.config.js)
- Globalne style w `app/globals.css`
- **Fonty**: `Nunito` (body), `Bree Serif` (display headings, klasa `.font-display`)
- **Paleta kolorów**:
  - Background: `#f6f4ef`
  - Primary text: `#06296b`
  - Primary accent (red): `#ff5144`
  - Green accent: `#6ff0ae`
  - Purple: `#7057ff`
  - Secondary text: `#6e7fa6`
- **Custom CSS classes**: `.cartoon-panel`, `.cartoon-button`, `.font-display`
- Zaokrąglone panele, bold fonty, playful kolory

---

## Landing Page

Wielosekcyjny landing page z animacjami (Framer Motion + GSAP):
- **Navbar** — sticky, cartoon design, responsywny hamburger
- **Hero** — CTA, benefits, tutor collage image
- **Brain Synapses** — "Jak TutorAI wspiera Twoją naukę" — cartoon mózg z animowanymi synapsami
- **Why TutorAI** — social proof cards + stats counter animation
- **CTA** — call-to-action z gradient tłem
- **Footer** — 4-kolumnowy, dark theme

Assety landing page w `public/assets/`: hero.png, mockup, cartoon, CTA, video_lesson, hero_collage

---

## Dashboard

- `DashboardLayout.tsx` — sidebar z nawigacją, info o użytkowniku
- **Strony**: lista książek, widok książki (graf + chat), panel admina
- **Komponenty**: KnowledgeGraph, ChatPanel, UploadBookForm, AvatarPlayer

---

## Testy

Pliki testów w `tests/` (Node.js built-in test runner):
- `http-json.test.mts` — testy helperów HTTP/JSON
- `next-proxy.test.mjs` — testy proxy/middleware
- `prisma-package.test.mjs` — testy konfiguracji Prisma
- `prisma-schema.test.mjs` — testy schematu Prisma
- `registration.test.mts` — testy rejestracji

---

## Ważne pliki do przeczytania

- `plan.md` — pełny plan architektury systemu z grafem wiedzy i RAG
- `LANDING_PAGE_PROMPT.md` — szczegółowa specyfikacja designu landing page
- `docs/PLAN-prisma-supabase.md` — plan migracji na Prisma + Supabase
- `design-skills/` — design system reference (INDEX.md, typeui/, ui-skills/)

---

## Znane ograniczenia / TODO

- Embeddings przechowywane jako `Bytes` w Prisma (brak natywnego pgvector — TODO: raw SQL z pgvector)
- Graph builder robi cosine similarity in-memory (O(n²) brute force) — TODO: pgvector
- Pipeline przetwarzania książek — adaptery zaimplementowane, wymaga integracji end-to-end
- Brak systemu kolejek dla długich jobów (rozważany BullMQ)
- `next-auth` nadal w dependencies package.json (do usunięcia)
- Brak `middleware.ts` — `proxy.ts` nie podpięty do Next.js middleware
- Avatar API działa async (clip) — TODO: streaming WebSocket
- Chunking heuristics do ulepszenia (np. via LLM)
- Duplikat `auth.ts` w root i `src/lib/auth.ts`
