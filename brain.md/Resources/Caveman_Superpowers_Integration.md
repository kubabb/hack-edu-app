---
tags: [caveman, integration, superpowers, skills]
---

# Caveman + Superpowers Integration dla Hack-Edu

## Co Zainstalowano

### Caveman (JuliusBrussee/caveman)
Lokalizacja: /mnt/c/Users/kubar/OneDrive/Dokumenty/hack-edu-app/caveman-repo/

Skille do Hermes (symboliczne linki juz istnieja w ~/.hermes/skills/):
- caveman-compress -> ../.agents/skills/caveman-compress
- caveman-help -> ../.agents/skills/caveman-help

Dostepne skille w repo:
- skills/caveman/SKILL.md - glowny tryb caveman (lite/full/ultra/wenyan)
- skills/caveman-commit/SKILL.md - commit messages w stylu caveman
- skills/caveman-review/SKILL.md - code review w stylu caveman
- skills/caveman-help/SKILL.md - quick reference
- skills/caveman-compress/SKILL.md - kompresja tekstu + Python scripts/
- skills/cavecrew/SKILL.md - delegation guide dla subagentow

Agenci (agents/):
- cavecrew-investigator.md - lokalizacja kodu (haiku model)
- cavecrew-builder.md - chirurgiczne edycje 1-2 plikow
- cavecrew-reviewer.md - diff/file reviewer

### Superpowers (obra/superpowers)
Lokalizacja: /mnt/c/Users/kubar/OneDrive/Dokumenty/hack-edu-app/superpowers-repo/

Kluczowe skille dla Hack-Edu:
- skills/brainstorming/SKILL.md - przed kazdym feature: design docs
- skills/writing-plans/SKILL.md - plany implementacji z TDD
- skills/subagent-driven-development/SKILL.md - wykonywanie planow przez subagentow
- skills/executing-plans/SKILL.md - alternatywa: inline execution
- skills/test-driven-development/SKILL.md - TDD red-green-refactor
- skills/systematic-debugging/SKILL.md - 4-fazowe debugowanie
- skills/requesting-code-review/SKILL.md - szablon review
- skills/finishing-a-development-branch/SKILL.md - finalizacja brancha
- skills/verification-before-completion/SKILL.md - final verification

## Workflow: Jak Uzyc

### Start Feature (ARCHITECT -> BRAINSTORMER)
1. ARCHITECT zleca: "Przygotuj design dla [feature]"
2. BRAINSTORMER uzywa superpowers:brainstorming
3. Efekt: docs/specs/YYYY-MM-DD-[feature]-design.md

### Plan Implementation (ARCHITECT -> PLANER)
1. ARCHITECT zleca: "Napisz plan implementacji"
2. PLANER uzywa superpowers:writing-plans
3. Efekt: docs/plans/YYYY-MM-DD-[feature].md

### Execution (ARCHITECT -> subagents)
**Opcja A**: Subagent-Driven Development
- ARCHITECT uzywa superpowers:subagent-driven-development
- Per task: implementer -> spec reviewer -> code quality reviewer
- Fresh subagent per task

**Opcja B**: Executing Plans (inline)
- ARCHITECT uzywa superpowers:executing-plans
- Wszystkie taski w jednej sesji

### Code Review (auto)
- cavecrew-reviewer po kazdej zmianie (caveman style)
- superpowers:requesting-code-review dla formal review

### Final Review
- superpowers:verification-before-completion
- superpowers:finishing-a-development-branch

## Caveman Mode w Hack-Edu
- ARCHITECT: normal prose (koordynacja wymaga jasnosci)
- Sub-agents (BUILDER, INVESTIGATOR, REVIEWER): caveman-full (~60% token savings)
- TUTOR-ENGINEER: normal Polish (user-facing)
- SENIOR-REVIEWER: normal prose (final review musi byc dokladny)

## Aktywacja
```
# Wlacz caveman-full w sesji
/caveman full

# Wlacz caveman-ultra (max savings)
/caveman ultra

# Wylacz
stop caveman
```
