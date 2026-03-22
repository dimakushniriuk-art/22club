# Indice regole esistenti (canonico vs contesto)

| Fonte | Tipo | Priorità |
|-------|------|----------|
| `.cursor/rules/22club-project-rules.mdc` | **Canonico operativo** (stack, divieti cartelle, DB, design system) | Massima per l’agent |
| `audit/existing_rules_candidates.txt` | Elenco path candidati (rules, docs, workflow) | Indice grezzo |
| `DOCUMENTAZIONE/00_indice_dati_progetto.md` … `12_suggerimenti_prioritizzati.md` | Architettura / flussi numerati | **Canonico narrativo** (allineare audit a questi per concetti) |
| `DOCUMENTAZIONE/CHANGELOG_LEGACY_ROLES_2026-03-01.md` | Ruoli legacy → attuali | Riferimento ruoli |
| `docs/DEPLOY_VERCEL.md` | Deploy | Operativo deploy |
| `.github/workflows/*.yml` | CI/E2E | Verità su pipeline |

**Storico / secondario:** tutto `DOCUMENTAZIONE/*` non in elenco sopra che duplica architettura (PAGE_AUDIT_*, RESOCONTO_*, FIX_*, ecc.) — usare solo dopo incrocio con file numerati 01–12.
