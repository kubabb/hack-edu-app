---
tags: [adr, architecture, hack-edu, decision]
date: 2026-05-22
status: accepted
---

# ADR-001: Architektura 11-Agent Collective dla Hack-Edu

## Kontekst
Potrzebujemy systemu AI Tutora z grafem wiedzy opartego na Next.js. Projekt zlozony (PDF processing, OCR, RAG, graph viz, chat, LLM). Wymaga wielu specialistycznych kompetencji.

## Decyzja
Uzywamy modelu 11-Agent Collective z podzialem rol:

| # | Agent | Odpowiedzialnosc | Skill |
|---|-------|------------------|-------|
| 1 | ARCHITECT | Koordynacja, decyzje, kontekst | Brain + Plan |
| 2 | PLANER | Plany implementacji | superpowers:writing-plans |
| 3 | BRAINSTORMER | Eksploracja, design docs | superpowers:brainstorming |
| 4 | BUILDER | Chirurgiczne edycje | cavecrew-builder |
| 5 | INVESTIGATOR | Lokalizacja kodu | cavecrew-investigator |
| 6 | REVIEWER | Code review 2-stopniowy | cavecrew-reviewer |
| 7 | RAG-ENGINEER | PDF->RAG pipeline | hack-edu-rag |
| 8 | GRAPH-ENGINEER | Wizualizacja grafu | hack-edu-graph |
| 9 | TUTOR-ENGINEER | Chat UI + logika | hack-edu-tutor |
| 10 | CONTEXT7-LIBRARIAN | Dokumentacja bibliotek | context7-mcp |
| 11 | SENIOR-REVIEWER | Final review | superpowers:verification-before-completion |

## Konsekwencje
- **Pozytywne**: Modularnosc, specjalizacja, oszczednosc tokenow (caveman sub-agents)
- **Negatywne**: Koszt wiecej wywolan sub-agentow, wymaga dobrego koordynatora

## Alternatywy Odrzucone
- Single agent: zbyt szeroki zakres, context exhaustion
- 3-4 agenty: brak specjalizacji RAG/graph/tutor

## Powiazane Decyzje
- ADR-002: Wybor LLM Providera (do uzgodnienia)
- ADR-003: Wybor Graph Viz Library (react-force-graph vs cytoscape)
