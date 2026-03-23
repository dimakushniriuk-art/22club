# Route — indice

Fonte: `audit/routes_files.txt`, `audit/PROJECT_DOMAINS.md`.

## Pubbliche e auth

| Path / gruppo                                                    | File principali                                             | Dominio           | Ruoli       | Note                                 |
| ---------------------------------------------------------------- | ----------------------------------------------------------- | ----------------- | ----------- | ------------------------------------ |
| `/`, `/login`, `/post-login`                                     | `src/app/page.tsx`, `login/page.tsx`, `post-login/page.tsx` | Auth ingresso     | pre-auth    | Redirect post-login collegato a RBAC |
| `/forgot-password`, `/reset-password`, `/registrati`, `/welcome` | rispettive `page.tsx`                                       | Auth / onboarding | candidato   | Reset e registrazione                |
| `/privacy`, `/termini`                                           | `privacy/page.tsx`, `termini/page.tsx`                      | Legale            | pubblico    | —                                    |
| `/design-system`                                                 | `design-system/page.tsx` + `_sections/`                     | Design system     | dev / staff | Guida `GUIDA_DESIGN_SYSTEM.md`       |

## Dashboard staff `/dashboard/*`

| Path / gruppo                                      | File principali                                                      | Dominio              | Ruoli             | Note                                                   |
| -------------------------------------------------- | -------------------------------------------------------------------- | -------------------- | ----------------- | ------------------------------------------------------ |
| `/dashboard` (home staff)                          | `dashboard/page.tsx`, `_components/upcoming-appointments-client.tsx` | Shell + widget       | staff             | Agenda in `_components`                                |
| `/dashboard/layout.tsx`                            | layout radice dashboard                                              | Shell                | staff             | Sidebar, staff layouts                                 |
| `/dashboard/clienti`, `/dashboard/atleti/[id]`     | `clienti/page.tsx`, `atleti/[id]/page.tsx`                           | Clienti / anagrafica | trainer, admin    | Lessico clienti/atleti misto (dominio)                 |
| `/dashboard/calendario`, `calendario/impostazioni` | `calendario/page.tsx`, `impostazioni/page.tsx`                       | Calendario           | staff multi-ruolo | Accoppiato a `components/calendar/*`                   |
| `/dashboard/appuntamenti`                          | `appuntamenti/page.tsx`                                              | Appuntamenti lista   | staff             | Parallelo a calendario                                 |
| `/dashboard/comunicazioni` (+ template)            | `comunicazioni/page.tsx`                                             | Comunicazioni        | staff             | —                                                      |
| `/dashboard/chat`                                  | `chat/page.tsx`                                                      | Chat                 | staff             | Coppia con `/home/chat`                                |
| `/dashboard/documenti`                             | `documenti/page.tsx`                                                 | Documenti            | staff             | —                                                      |
| `/dashboard/allenamenti`, `/esercizi`, `/schede/*` | sotto `allenamenti/`, `esercizi/`, `schede/`                         | Workout              | trainer           | —                                                      |
| `/dashboard/pagamenti`, `/abbonamenti`             | rispettive `page.tsx`                                                | Pagamenti            | staff             | Varianti anche nutrizionista/massaggiatore             |
| `/dashboard/invita-atleta`                         | `invita-atleta/page.tsx`                                             | Inviti               | staff             | —                                                      |
| `/dashboard/impostazioni`                          | `impostazioni/page.tsx`                                              | Impostazioni account | autenticati       | Altre “impostazioni” in sottocartelle ruolo            |
| `/dashboard/marketing/*`                           | molte sotto-route (leads, campaigns, segments, …)                    | Marketing            | marketing, admin  | Superficie ampia                                       |
| `/dashboard/admin/*`                               | `admin/page.tsx`, `ruoli`, `utenti`, `statistiche`, …                | Admin / RBAC         | admin             | Layout `admin/layout.tsx`                              |
| `/dashboard/nutrizionista/*`                       | layout + atleti, piani, check-in, calendario, …                      | Nutrizionista        | nutrizionista     | Albero parallelo                                       |
| `/dashboard/massaggiatore/*`                       | layout + calendario, appuntamenti, chat, …                           | Massaggiatore        | massaggiatore     | —                                                      |
| `/dashboard/profilo`                               | `profilo/page.tsx`                                                   | Profilo staff        | staff             | Distinto da `/home/profilo`                            |
| `/dashboard/statistiche`                           | `statistiche/page.tsx`                                               | Statistiche          | staff             | Anche `admin/statistiche`, `massaggiatore/statistiche` |

## Home atleta `/home/*`

| Path / gruppo                                                 | File principali                                                | Dominio             | Ruoli          | Note                                          |
| ------------------------------------------------------------- | -------------------------------------------------------------- | ------------------- | -------------- | --------------------------------------------- |
| `/home`, layout                                               | `home/page.tsx`, `layout.tsx`, `_components/home-layout-*.tsx` | Portale atleta      | atleta         | Entry allenamenti, appuntamenti, documenti, … |
| `/home/allenamenti/**`                                        | `allenamenti/page.tsx`, sottoroute                             | Allenamenti         | atleta         | —                                             |
| `/home/appuntamenti`                                          | `appuntamenti/page.tsx`, `AppointmentListCard.tsx`, …          | Appuntamenti atleta | atleta         | —                                             |
| `/home/chat`, `/home/documenti`                               | `page.tsx` rispettive                                          | Chat / documenti    | atleta         | —                                             |
| `/home/profilo`                                               | `profilo/page.tsx`                                             | Profilo atleta      | atleta         | —                                             |
| `/home/progressi/**`, `/home/foto-risultati/**`               | sotto-route                                                    | Progressi           | atleta         | —                                             |
| `/home/pagamenti`                                             | `pagamenti/page.tsx`                                           | Pagamenti           | atleta         | —                                             |
| `/home/massaggiatore`, `/home/nutrizionista`, `/home/trainer` | `page.tsx`                                                     | Viste dedicate      | atleta / ruolo | Da incrocio con dominio                       |

## API `src/app/api/*`

Raggruppamento sintetico; elenco file in `audit/routes_files.txt` (prime righe) e dettaglio in `05_API_INDEX.md`.

- `api/auth/*`, `api/admin/*`, `api/athletes/*`, `api/clienti/*`, `api/calendar/*`, `api/communications/*`, `api/dashboard/*`, `api/marketing/*`, `api/onboarding/*`, `api/register/*`, `api/invitations/*`, `api/push/*`, `api/exercises/*`, `api/athlete/workout-plans/*`, `api/nutritionist/*`, `api/debug-trainer-visibility`, `api/document-preview`, `api/health`.

## Note trasversali

- **Matcher middleware:** path consentiti e redirect descritti in `audit/CANONICAL_SOURCES.md` / `RULE_CONFLICTS.md` (non duplicare qui le liste complete).
- **`audit/auth_roles_map.txt`:** vuoto nel repo — matrice ruoli da `CANONICAL_SOURCES` + `FEATURE_STATUS`.
