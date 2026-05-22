---
tags: [index, master, brain, hack-edu]
---

# MASTER INDEX - Brain.md

## Struktura brain.md/
```
brain.md/
├── Agents/
│   └── AGENTS.md           # Definicje 11 agentow
├── Decisions/
│   └── ADR-001_11_Agent_Architecture.md
├── Resources/
│   └── Obsidian_Integration.md
├── Skills/
│   (skill templates dla agentow)
├── Context7/
│   └── Setup.md            # MCP Context7 config
├── MCP/
│   (konfiguracje MCP)
└── Sessions/
    └── _TEMPLATE.md
```

## Key Links
- **Plan glowny**: ../plan.md
- **Repo zrodlo**: https://github.com/JuliusBrussee/caveman
- **Superpowers**: https://github.com/obra/superpowers
- **Skills.sh**: https://www.skills.sh
- **Context7**: https://context7.com

## Status Projektu
| Etap | Status |
|------|--------|
| Setup architektury | IN PROGRESS |
| Custom skills | DONE |
| Context7 MCP | PENDING CONFIG |
| Next.js scaffold | PENDING |
| PostgreSQL + pgvector | PENDING |
| RAG pipeline | PENDING |
| Graph viz | PENDING |
| Tutor chat | PENDING |

## Quick Commands
```bash
# Skille projektowe
ls ~/.hermes/skills/hack-edu-*

# Log sesji
cat brain.md/Sessions/*.md

# Decyzje
cat brain.md/Decisions/ADR-*.md
```

## Wiedza Cross-Project
- FitnessApp: voice system, senior UI patterns -> TUTOR-ENGINEER
- GalaxyNotes: 3D graph, semantic linking -> GRAPH-ENGINEER  
- Motodefend: entity schemas, shop system -> RAG schema design
- TestingAgents: 8-agent arch -> nasza 11-agent arch
