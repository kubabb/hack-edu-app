# Plan: Prisma + Supabase (PostgreSQL) — Bezpieczne Połączenie

## 1. Wymagania wstępne
- Projekt Supabase utworzony (PostgreSQL 15+)
- Włączone rozszerzenie `pgvector` (wymagane dla embeddingów)
- Lokalnie: `npx prisma -v` działa (masz Prisma 6)

## 2. Zmienne środowiskowe (.env)

Supabase daje **dwa** connection stringi. Używaj obu — inaczej migracje i pooler się pokłócą.

```bash
# Connection Pooler (Supavisor) — dla aplikacji / serwera Next.js
# Port 6543, wymagane ?pgbouncer=true
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:6543/postgres?pgbouncer=true&connection_limit=10"

# Direct connection — TYLKO dla migracji Prisma (port 5432)
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"

# Reszta bez zmian
OPENAI_API_KEY="..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="..."
```

**Bezpieczeństwo:**
- `.env` w `.gitignore` (już powinien być).
- Nie commituj `.env.example` z realnymi danymi — zostaw placeholder `[PASSWORD]`.
- W Supabase: Settings > Database > Reset password regularnie.

## 3. Aktualizacja `prisma/schema.prisma`

Dodaj `directUrl` do bloku `datasource`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

**Uwaga o pgvector:**
Masz teraz `vector Bytes` w modelu `Embedding`. To przechowuje dane binarnie, ale **nie używa indeksów pgvector** i nie pozwala na `cosine similarity` w SQL.

Jeśli chcecie wektorowe wyszukiwanie w Supabase, po migracji zmień pole na:

```prisma
model Embedding {
  id        String    @id @default(cuid())
  chunkId   String    @unique
  chunk     BookChunk @relation(fields: [chunkId], references: [id])
  vector    Unsupported("vector")?
  provider  String    @default("openai")
  createdAt DateTime  @default(now())
}
```

i wykonaj raw query dla similarity search:

```ts
const similar = await prisma.$queryRaw`
  SELECT id, chunk_id, vector <=> ${queryVector}::vector as distance
  FROM "Embedding"
  ORDER BY vector <=> ${queryVector}::vector
  LIMIT 5
`;
```

Jeśli nie potrzebujesz teraz similarity search, zostaw `Bytes` — ale wtedy pgvector jest zbędne.

## 4. Włączenie pgvector w Supabase

W SQL Editor (Supabase dashboard) lub przez `psql`:

```sql
-- Włącz rozszerzenie (raz na projekt)
create extension if not exists vector;

-- Weryfikacja
select * from pg_extension where extname = 'vector';
```

## 5. Bezpieczeństwo po stronie Supabase

### 5.1 Row Level Security (RLS)
Włącz RLS na tabelach z danymi użytkowników (Supabase nie wymusza tego przez Prisma, ale dodaje warstwę jeśli ktoś dostanie się bezpośrednio do DB):

```sql
alter table "User" enable row level security;
alter table "Book" enable row level security;
```

### 5.2 Osobna rola dla aplikacji (opcjonalne, zaawansowane)
Zamiast używać `postgres` (superuser) w connection stringu, stwórz rolę `prisma_app`:

```sql
create role prisma_app with login password 'STRONG_PASSWORD';
grant connect on database postgres to prisma_app;
grant usage on schema public to prisma_app;
grant select, insert, update, delete on all tables in schema public to prisma_app;
alter default privileges in schema public grant select, insert, update, delete on tables to prisma_app;
```

Potem użyj `prisma_app` w `DATABASE_URL` zamiast `postgres`.

## 6. Migracje i deploy

### Lokalnie — pierwsza synchronizacja

```bash
# 1. Wygeneruj klienta
npx prisma generate

# 2. Sprawdź połączenie (bez migracji)
npx prisma db pull

# 3. Jeśli schema jest źródłem prawdy — wypchnij migrację
npx prisma migrate dev --name init_supabase
```

**Ważne:** `migrate dev` używa `directUrl` (port 5432). Nigdy nie uruchamiaj `migrate dev` przez pooler (port 6543) — Prisma tego nie obsłuży.

### Na produkcji / CI

```bash
npx prisma migrate deploy   # używa DIRECT_URL
npx prisma generate         # buduje klienta
```

## 7. Weryfikacja połączenia w aplikacji

```ts
// src/server/prisma.ts — bez zmian, singleton działa
import { prisma } from '@/server/prisma';

// Test w API route lub server component
const users = await prisma.user.count();
console.log('DB connected, users:', users);
```

Jeśli używasz `next-auth` v5 z `auth()`, upewnij się że zapytania Prisma wykonują się po stronie serwera (route handlers / server actions).

## 8. Troubleshooting

| Problem | Przyczyna | Rozwiązanie |
|---------|-----------|-------------|
| `P1001: Can't reach database` | Firewall / zły port | Sprawdź czy używasz portu 6543 (app) lub 5432 (migracje) |
| `P3014: Prisma Migrate cannot run...` | Migracja przez pooler | Upewnij się że `directUrl` jest ustawione i wskazuje port 5432 |
| `too many connections` | Brak limitu w pooler | Dodaj `connection_limit=10` do DATABASE_URL |
| `type "vector" does not exist` | Brak rozszerzenia pgvector | `create extension vector;` w Supabase SQL Editor |
| Błąd przy `db pull` | Różnica w schema | Użyj `prisma db pull` tylko jeśli schema w DB jest źródłem prawdy |

## 9. Podsumowanie zmian w repo

Pliki do edycji:
- `.env` / `.env.example` — dodaj `DIRECT_URL`
- `prisma/schema.prisma` — dodaj `directUrl = env("DIRECT_URL")`
- Opcjonalnie: `prisma/schema.prisma` — zmień `Embedding.vector` na `Unsupported("vector")?` jeśli chcesz similarity search
- `.gitignore` — upewnij się że `.env` jest ignorowane

Pliki bez zmian:
- `src/server/prisma.ts` — singleton działa tak samo
