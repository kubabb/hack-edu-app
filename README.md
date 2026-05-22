# AI Tutor / Korepetytor AI

Full-stackowa aplikacja Next.js do nauki z AI, grafem wiedzy i avatarem.

## Stack
- Next.js 16 + React 19 + TypeScript
- Tailwind CSS
- Prisma 6 + PostgreSQL (+ pgvector)
- NextAuth (credentials)
- OpenAI (embeddings + LLM)
- HeyGen (avatar video clips)
- react-force-graph-2d (wizualizacja grafu)

## Wymagania
- Node.js 18+
- PostgreSQL 14+ z rozszerzeniem `pgvector`

## Konfiguracja

1. Skopiuj `.env.example` do `.env` i uzupełnij wartości:
   ```bash
   cp .env.example .env
   ```

2. Zainstaluj zależności:
   ```bash
   npm install
   ```

3. Wygeneruj Prisma Client:
   ```bash
   npx prisma generate
   ```

4. Uruchom migracje bazy danych:
   ```bash
   npx prisma migrate dev --name init
   ```

5. Uruchom serwer deweloperski:
   ```bash
   npm run dev
   ```

## Struktura
- `app/` - Next.js App Router (strony, API routes)
- `src/server/services/` - logika domenowa
- `src/server/adapters/` - integracje zewnętrzne (OpenAI, HeyGen, OCR)
- `src/server/repositories/` - warstwa dostępu do danych (Prisma)
- `src/components/` - komponenty React

## TODO / Iteracje
- [ ] Przenieść OCR i generowanie grafu do kolejki w tle (np. BullMQ)
- [ ] Podłączyć prawdziwe pgvector cosine similarity (raw query)
- [ ] Streaming Avatar API (WebSocket) zamiast asynchronicznych klipów
- [ ] Dopracować heurystykę chunkowania (np. via LLM)
- [ ] Dodanie testów jednostkowych serwisów
