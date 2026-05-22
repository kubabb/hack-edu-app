---
tags: [setup, completion, summary]
date: 2026-05-22
---

# SESSION 2026-05-22: Setup Hack-Edu Infrastructure

## Wykonane Zadania
- [x] Pobrano caveman z github.com/JuliusBrussee/caveman
- [x] Pobrano superpowers z github.com/obra/superpowers
- [x] Przeanalizowano skille z skills.sh i github.com/obra/superpowers
- [x] Przeczytano plan.md projektu AI Tutora
- [x] Zaintegrowano notatki z Obsidian i BRAIN
- [x] Stworzono folder brain.md jako drugi mózg projektu
- [x] Przygotowano custom skills: hack-edu-graph, hack-edu-rag, hack-edu-tutor
- [x] Skonfigurowano Context7 MCP w ~/.hermes/config.yaml
- [x] Zdefiniowano 11-agent collective

## Pliki Utworzone
1. brain.md/Agents/AGENTS.md - definicje agentow
2. brain.md/Decisions/ADR-001_11_Agent_Architecture.md
3. brain.md/Resources/Obsidian_Integration.md
4. brain.md/Resources/Caveman_Superpowers_Integration.md
5. brain.md/Context7/Setup.md
6. brain.md/MASTER_INDEX.md
7. brain.md/Sessions/_TEMPLATE.md
8. ~/.hermes/skills/hack-edu-graph/SKILL.md
9. ~/.hermes/skills/hack-edu-rag/SKILL.md
10. ~/.hermes/skills/hack-edu-tutor/SKILL.md

## MCP Dodany
```yaml
mcp_servers:
  context7-docs:
    command: npx
    args: ['-y', '@upstash/context7-mcp@latest']
    timeout: 120
```

## Nastepne Kroki
1. Restart Hermes aby zaladowac MCP
2. Utworzenie Next.js scaffold (npx create-next-app@latest)
3. Setup PostgreSQL + pgvector (Docker lub lokalnie)
4. Implementacja Prisma schema
5. Etap 1: Baza + prosty RAG (bez grafu)
