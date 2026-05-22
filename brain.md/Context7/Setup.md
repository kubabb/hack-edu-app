---
tags: [context7, mcp, docs, libraries]
---

# Context7 MCP - Dokumentacja dla Hack-Edu

## Co to Context7?
Context7 (context7.com) to platforma z aktualna dokumentacja kodowa dla LLM i AI edytorow.
Pozwala pobierac najnowsze snippets z bibliotek w czasie rzeczywistym.

## Biblioteki do Podłączenia (via MCP)

### 1. Next.js 14+
- Context7 URL: https://context7.com/nextjs
- MCP integration: `context7-mcp` server
- Uzycie: routing, server actions, app router patterns

### 2. Prisma ORM
- Context7 URL: https://context7.com/prisma
- MCP integration: schema design, migrations, raw queries
- Uzycie: Book, BookPage, BookChunk, Embedding, GraphNode, GraphEdge

### 3. pgvector
- Context7 URL: https://context7.com/pgvector
- MCP integration: vector operations, similarity search
- Uzycie: embeddings, RAG queries, cosine similarity

### 4. react-force-graph
- Context7 URL: https://context7.com/react-force-graph
- MCP integration: graph visualization props, events, customization
- Uzycie: KnowledgeGraph component, node styling, interaction handlers

### 5. Tailwind CSS
- Context7 URL: https://context7.com/tailwindcss
- MCP integration: utility classes, dark mode, responsive design
- Uzycie: cały UI

### 6. TypeScript
- Context7 URL: https://context7.com/typescript
- MCP integration: types, generics, strict mode
- Uzycie: caly projekt

## Jak Podłączyć MCP Context7

### Hermes Config (oryginalny plik do merge)
Sciezka do pliku: /home/kubar/.hermes/config.yaml

```yaml
mcp_servers:
  context7-nextjs:
    command: npx
    args: ["-y", "@upstash/context7-mcp", "--library", "nextjs"]
    env: {}
  context7-prisma:
    command: npx
    args: ["-y", "@upstash/context7-mcp", "--library", "prisma"]
    env: {}
  context7-pgvector:
    command: npx
    args: ["-y", "@upstash/context7-mcp", "--library", "pgvector"]
    env: {}
  context7-react-force-graph:
    command: npx
    args: ["-y", "@upstash/context7-mcp", "--library", "react-force-graph"]
    env: {}
```

### Jak Uzyc
Wewnatrz sesji mozna odpytac Context7 o konkretny pattern:
- "context7: How to implement server actions in Next.js 14 App Router?"
- "context7: Prisma schema for vector embeddings with pgvector extension"
- "context7: react-force-graph-2d custom nodeCanvasObject example"

### Context7-LIBRARIAN Agent
Agent specjalnie odpowiedzialny za:
1. Odpowiadanie na pytania o API bibliotek
2. Suggestowanie aktualnych patterns i best practices
3. Aktualizowanie docs/ gdy biblioteki sie zmieniaja
