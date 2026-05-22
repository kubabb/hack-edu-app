---
tags: [integration, obsidian, brain, memory]
---

# Integracja Notatek z Projektem Hack-Edu

## Zrodla Wiedzy

### 1. Obsidian Vault
- Lokalizacja: /mnt/c/Users/kubar/OneDrive/Dokumenty/Obsidian Vault/
- Zawartosc:
  - FitnessApp/Project_Log.md - log projektu fitness (senior UI, voice)
  - Knowledge/Phishing_Model_Metrics.md - metryki ML
  - Knowledge/Project_Final_Report.md - raport koncowy
  - Witaj.md - powitalna (pusta)

### 2. BRAIN Knowledge Base
- Lokalizacja: /mnt/c/Users/kubar/OneDrive/Dokumenty/BRAIN/01_Projects/
- Struktura (inspiracja dla Hack-Edu):
```
BRAIN/01_Projects/
  TestingAgentsProject/    <- struktura agentowa, AGENTS.md, PLAN.md
  FitnessApp/              <- voice, UI patterns, senior-friendly
    Bugs/
    Decisions/ADR-*.md
    Features/
    Knowledge/
    Sessions/
  GalaxyNotes/             <- 3D graf, semantic linking
    Decisions/ADR-001_Architektura_8_Agentow.md
  Motodefend/              <- game dev, bestiary, shop system
```

## Lekcje dla Hack-Edu
1. **ADR (Architecture Decision Records)**: Kazda decyzja architektoniczna to ADR w brain.md/Decisions/
2. **Session Logs**: Kazda sesja agenta logowana w brain.md/Sessions/
3. **Bug Tracker**: brain.md/Bugs/ z repro steps
4. **Feature Specs**: brain.md/Features/ z acceptance criteria

## Uzycie w Projektach
- Przed kazdym taskiem: sprawdz brain.md/Sessions/ czy cos podobnego robione
- Po kazdej sesji: zapisz podsumowanie do brain.md/Sessions/
- Decyzje architektoniczne: ADR w brain.md/Decisions/

## Cross-Project Patterns (z FitnessApp i innych)
1. Voice system: VoiceManager singleton -> TUTOR-ENGINEER moze dodac voice input
2. Game instruction screen -> TUTOR moze dodac "instruction mode" przed zadaniem
3. Neon green #39FF14 highlights -> HACK-EDU graph node highlights
4. Room entities schema -> HACK-EDU Prisma schema inspiracja
5. 8-agent architecture (GalaxyNotes ADR-001) -> HACK-EDU 11-agent collective
