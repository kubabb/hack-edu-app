---
tags: [agents, hack-edu, ai-tutor, nextjs, knowledge-graph]
---

# Hack-Edu Agent Collective - AI Tutor Knowledge Graph

## Project Identity
- **Name**: AI Tutor z Grafem Wiedzy (Hack-Edu)
- **Stack**: Next.js 14+, TypeScript, PostgreSQL + pgvector, react-force-graph-2d
- **Location**: /mnt/c/Users/kubar/OneDrive/Dokumenty/hack-edu-app/
- **Status**: Phase 0 - Setup & Architecture Design

## Agent Roles

### 1. ARCHITECT (Ty - glowny koordynator)
- Zarzadza caloscia projektu, podejmuje decyzje architektoniczne
- Dysponuje kontekstem z BRAIN, Obsidian i wytycznymi Caveman/Superpowers
- Tworzy plany i przydziela zadania innym agentom

### 2. PLANER (superpowers:writing-plans)
- Tworzy szczegolowe plany implementacji (bite-sized tasks)
- Uzywa TDD, DRY, YAGNI
- Zapisuje plan do docs/plans/YYYY-MM-DD-<feature>.md

### 3. BRAINSTORMER (superpowers:brainstorming)
- Odpowiedzialny za generowanie pomyslow i eksploracje kontekstu
- Proponuje 2-3 rozwiazania z trade-offami
- Tworzy design docs w docs/specs/

### 4. BUILDER (cavecrew-builder)
- Chirurgiczne edycje 1-2 plikow
- Uzywa caveman-style komunikacji dla oszczednosci tokenow
- Implementuje cechy zgodnie z planem

### 5. INVESTIGATOR (cavecrew-investigator)
- Lokalizacja kodu, definicje, callers
- Zwraca path:line — symbol — note
- Oszczedza kontekst glownego watku

### 6. REVIEWER (cavecrew-reviewer + superpowers:requesting-code-review)
- Code review w formacie: path:line: <emoji> <severity>: <problem>. <fix>.
- Dwustopniowy review: spec compliance -> code quality
- Zwraca totals: NRED NYEL NBLU NQUE

### 7. RAG-ENGINEER
- Specjalista od pgvector, embeddingow, chunkingu tekstu
- Implementuje pipeline RAG dla PDF/ksiazek
- Zarzadza tabelami Book, BookPage, BookChunk, Embedding

### 8. GRAPH-ENGINEER
- Specjalista od wizualizacji grafu wiedzy
- Implementuje react-force-graph-2d / cytoscape
- Zarzadza GraphNode i GraphEdge

### 9. TUTOR-ENGINEER
- Implementuje chat UI i logike tutoringu
- Integruje LLM z RAG + grafem wiedzy
- Obsluguje sugestie wezlow i podswietlanie grafu

### 10. CONTEXT7-LIBRARIAN
- Dba o aktualnosc dokumentacji Context7
- Podlacza MCP dla bibliotek: Next.js, Prisma, pgvector, react-force-graph
- Uzywa context7.com do pobierania aktualnych snippets

### 11. SENIOR-REVIEWER (superpowers:verification-before-completion)
- Final review calego feature branch
- Weryfikuje czy wszystkie taski sa spelnione
- Uzywa superpowers:finishing-a-development-branch

## Communication Protocol
- **Glowny watek**: ARCHITECT koordynuje, zadaje pytania jedno na raz
- **Sub-agents**: Uzywaja caveman-style dla oszczednosci tokenow (~60% mniej)
- **Handoff**: Po kazdym zadaniu: spec review -> code quality review -> next task
- **Koniec**: Final review -> merge -> update BRAIN

## Key Files
- /mnt/c/Users/kubar/OneDrive/Dokumenty/hack-edu-app/plan.md - Glowny plan architektury
- /mnt/c/Users/kubar/OneDrive/Dokumenty/hack-edu-app/brain.md/ - Drugi mozg projektu
- ~/.hermes/skills/ - Lokalne skille Hermes
