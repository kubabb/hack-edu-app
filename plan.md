# Plan architektury AI tutora z grafem wiedzy (Next.js)

## 1. Cel systemu

- Uczeń może wgrywać książki / zbiory zadań (PDF, ewentualnie obrazy) jako bazę wiedzy.
- System przetwarza dokument na:
  - tekst + strukturę (rozdziały, sekcje, zadania),
  - graf wiedzy (węzły = pojęcia / zadania / fragmenty tekstu, krawędzie = powiązania).
- Uczeń rozmawia z AI tutorem (tekst/głos), a odpowiedzi są oparte na:
  - kontekście z książki (RAG),
  - grafie wiedzy (np. "pokaż powiązane pojęcia", "co muszę umieć, zanim zrobię to zadanie").
- Front: Next.js (app router), wizualizacja grafu podobna do tej z załączonego screena (force-directed graph: np. `react-force-graph-2d` lub `react-cytoscapejs`).[web:17][web:24][web:29]

---

## 2. Stack technologiczny

### 2.1 Frontend (Next.js)

- **Framework**: Next.js 14+ (App Router, server actions).
- **Język**: TypeScript.
- **UI**: Tailwind CSS + Headless UI / Radix UI.
- **Auth**: NextAuth.js (e-mail, OAuth) albo Clerk/Auth0 (na później).
- **Upload plików**: `next/server` + np. UploadThing / własny endpoint API do S3/Wasabi.
- **Graf**:
  - `react-force-graph-2d` albo `react-force-graph-3d` do wizualizacji grafu z możliwością drag/zoom i eventów kliknięcia.[web:17][web:29]
  - Alternatywa: `react-cytoscapejs` (Cytoscape w React) – bardziej rozbudowane layouty, relacje, style.[web:24][web:30]
- **Chat UI**: komponent w stylu czatu (np. shadcn/ui), osobny panel z grafem obok.

### 2.2 Backend / API

- **Runtime**: Next.js API routes / server actions (Node.js), opcjonalnie osobny FastAPI/Express dla cięższych zadań.
- **Baza danych operacyjna**: PostgreSQL (przez Prisma).
- **Vector search (RAG)**: PostgreSQL + rozszerzenie `pgvector` zamiast osobnego wektorowego DB.[web:19][web:25][web:28][web:31]
- **Kolejki / batch processing** (opcjonalnie): np. BullMQ (Redis) jeśli przetwarzanie dużych książek.

### 2.3 AI / NLP

- **OCR**: 
  - MVP: Mathpix API (świetne do PDF + matematyka).[web:10]
  - Alternatywa tańsza: Tesseract przez usługę backendową.
- **Embeddings**: 
  - modele typu OpenAI text-embedding lub open‑source (np. BAAI bge) serwowane osobno.
- **LLM**: provider przez API (OpenAI / Anthropic / inny), z warstwą RAG.
- **Budowa grafu wiedzy**: 
  - heurystyki + LLM (np. generowanie węzłów/relacji na podstawie rozdziałów, definicji, zadań).

### 2.4 Infrastruktura

- Hosting: Vercel (frontend + lekkie API) + osobny serwer (np. Railway/Fly.io) dla cięższych jobów i OCR, jeśli potrzeba.
- DB: zarządzany PostgreSQL (Supabase, Neon, Railway) z `pgvector`.
- Storage: S3‑compatible (AWS S3, Cloudflare R2, Wasabi) na pliki PDF/obrazy.

---

## 3. Model danych

### 3.1 Schemat Postgres (przez Prisma)

Minimalne tabele (pomijam szczegóły typów):

- `User`
  - `id`
  - `email`
  - `name`

- `Book`
  - `id`
  - `userId` (owner)
  - `title`
  - `originalFileUrl`
  - `status` (uploaded | processing | ready | failed)

- `BookPage`
  - `id`
  - `bookId`
  - `pageNumber`
  - `imageUrl` (opcjonalnie)
  - `ocrText` (pełny tekst z OCR)

- `BookChunk`
  - `id`
  - `bookId`
  - `pageId`
  - `chunkIndex`
  - `content` (tekst fragmentu)
  - `type` ("theory" | "task" | "example" | "definition")
  - `taskNumber` (opcjonalnie, np. "Zadanie 3")

- `Embedding`
  - `id`
  - `chunkId`
  - `vector` (`vector` typ z pgvector)

- `GraphNode`
  - `id`
  - `bookId`
  - `type` ("concept" | "task" | "section" | "page")
  - `label`
  - `chunkId` (opcjonalnie, link do BookChunk)
  - `metadata` (JSON – np. numer strony, tagi)

- `GraphEdge`
  - `id`
  - `bookId`
  - `sourceNodeId`
  - `targetNodeId`
  - `relation` ("depends_on" | "explains" | "is_example_of" | "similar_to")

- `ChatSession`
  - `id`
  - `userId`
  - `bookId`
  - `createdAt`

- `ChatMessage`
  - `id`
  - `sessionId`
  - `role` (user | assistant | system)
  - `content`
  - `createdAt`

### 3.2 Struktura danych grafu na frontendzie

Dla biblioteki `react-force-graph` potrzebujemy:

```ts
{
  nodes: { id: string; label: string; type: string; }[],
  links: { source: string; target: string; relation: string; }[],
}
```

Backend zwraca gotową strukturę dla konkretnej książki + opcjonalne filtrowanie (np. tylko węzły typu "concept" i "task").[web:17][web:29]

---

## 4. Flow użytkownika (MVP)

### 4.1 Dodanie książki

1. Uczeń loguje się.
2. Wchodzi w widok "Moje książki" i klika "Dodaj książkę".
3. Upload PDF → zapis do storage + rekord w `Book` ze statusem `uploaded`.
4. Job backendowy:
   - dzieli PDF na strony,
   - robi OCR każdej strony → zapis do `BookPage.ocrText`,
   - dzieli tekst na fragmenty (`BookChunk`) wg heurystyk (nagłówki, numerowane zadania),
   - generuje embeddingi dla `BookChunk` → zapis do `Embedding`,
   - wywołuje LLM do wygenerowania węzłów grafu i relacji:
     - węzły typu "concept" na podstawie definicji/pojęć,
     - węzły "task" na podstawie zadań,
     - krawędzie "depends_on" (zadanie wymaga pojęć X, Y),
   - zapisuje do `GraphNode` i `GraphEdge`,
   - ustawia `Book.status = 'ready'`.

### 4.2 Widok książki + graf

1. Uczeń wybiera książkę (tylko `status = ready`).
2. Strona Next.js pobiera:
   - metadane książki,
   - graf (`nodes`, `links`),
   - listę rozdziałów/zadań.
3. W centrum ekranu – graf (force‑directed) z możliwością:
   - zoom/drag,
   - hover: pokazuje label + typ węzła,
   - kliknięcie węzła:
     - po prawej panel z treścią (np. zadanie, definicja),
     - przyciski: "Wyjaśnij", "Zrób ze mną", "Pokaż poprzednie pojęcia".

### 4.3 Rozmowa z tutorem

1. Uczeń ma panel czatu powiązany z aktywną książką (i opcjonalnie z wybranym węzłem grafu).
2. Przy wysyłaniu pytania:
   - backend bierze pytanie + ID aktywnego węzła (jeśli jest),
   - wektor zapytania → pgvector: szuka najbliższych `Embedding` (RAG),
   - do promptu LLM dokłada:
     - treść najbliższych `BookChunk`,
     - listę powiązanych węzłów z grafu (np. prerequisite concepts),
     - instrukcje "bądź tutorem, idź krok po kroku".
3. LLM generuje odpowiedź + ewentualnie sugestie kolejnych węzłów/pojęć, które warto odwiedzić.
4. Front:
   - pokazuje odpowiedź w czacie,
   - opcjonalnie podświetla na grafie węzły, do których nawiązał tutor (ID dostarczone przez backend).

---

## 5. API i kontrakty (szkic)

### 5.1 Upload książki

- `POST /api/books`
  - body: multipart/form-data (plik PDF).
  - response: `{ bookId }`.

### 5.2 Status przetwarzania książki

- `GET /api/books/:id`
  - response: `{ id, title, status, createdAt }`.

### 5.3 Pobranie grafu dla książki

- `GET /api/books/:id/graph`
  - query: filtrowanie (np. `nodeTypes=concept,task`).
  - response:
    ```json
    {
      "nodes": [{ "id": "n1", "label": "Twierdzenie Pitagorasa", "type": "concept" }],
      "links": [{ "source": "n1", "target": "n2", "relation": "depends_on" }]
    }
    ```

### 5.4 Pobranie treści węzła

- `GET /api/nodes/:id`
  - response: `{ node, chunk, relatedNodes }`.

### 5.5 Chat z tutorem

- `POST /api/chat`
  - body: `{ sessionId?, bookId, nodeId?, message }`.
  - backend:
    - tworzy/aktualizuje `ChatSession`, zapisuje `ChatMessage` (user),
    - wykonuje RAG + LLM,
    - zapisuje odpowiedź jako `ChatMessage` (assistant),
    - zwraca: `{ reply, suggestedNodeIds }`.

---

## 6. Wizualizacja grafu w Next.js (szkic komponentu)

- Komponent `KnowledgeGraph.tsx`:
  - pobiera dane grafu z `/api/books/:id/graph` (SWR/React Query),
  - używa `react-force-graph-2d`:
    - propsy: `graphData`, `nodeLabel`, `onNodeClick`.
  - styl ciemny, zbliżony do screena: ciemne tło, jasne węzły, grubsze krawędzie, różne kolory w zależności od typu węzła.[web:17][web:29]

Przykładowo (pseudokod):

```tsx
<ForceGraph2D
  graphData={data}
  nodeLabel={(node) => `${node.label} (${node.type})`}
  nodeCanvasObject={(node, ctx, globalScale) => {/* custom rysowanie */}}
  onNodeClick={(node) => onSelectNode(node.id)}
/>
```

---

## 7. Etapy wdrożenia (MVP → rozbudowa)

### Etap 1 – baza + prosty RAG

- Postawienie Next.js + Postgres z pgvector.
- Obsługa uploadu PDF.
- Przetwarzanie:
  - OCR (choćby podstawowy),
  - krotki text split → embeddingi → zapisy do DB.
- Prosty chat na poziomie książki (bez grafu).

### Etap 2 – generowanie grafu

- Dodanie tabel `GraphNode`, `GraphEdge`.
- Pipeline LLM, który na podstawie `BookChunk` tworzy:
  - węzły konceptów,
  - węzły zadań,
  - relacje "depends_on" i "is_example_of".
- Endpoint `/api/books/:id/graph` + komponent wizualizacji.

### Etap 3 – integracja grafu z tutoringiem

- Wysyłanie do LLM informacji o aktywnym węźle.
- Zwracanie z LLM ID węzłów, które powinny być podświetlone / zaproponowane.
- Możliwość startu rozmowy od kliknięcia w dowolny węzeł.

### Etap 4 – optymalizacje i UX

- Filtry na grafie (typy węzłów, poziom trudności).
- Grupowanie węzłów w klastery (rozdziały, działy przedmiotu).
- Zapisywanie "ścieżek nauki" ucznia jako subgrafów.

---

## 8. Dalsze kierunki (po MVP)

- Personalizowany graf dla ucznia (ważone krawędzie na podstawie wyników, błędów).
- Integracja z wideo awatarem (HeyGen) – backend generuje tekst odpowiedzi + wideo, front odtwarza obok / zamiast dymków czatu.
- Współdzielone książki/grafy między uczniami (społeczność, nauczyciel jako "kurator" grafu).
