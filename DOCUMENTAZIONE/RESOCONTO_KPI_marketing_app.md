# Resoconto: allineamento app KPI marketing (execution_mode + vista)

---

## 1) File candidati completamento workout (già allineati)

| File | Ruolo |
|------|--------|
| `src/app/home/allenamenti/oggi/page.tsx` | Pulsante "Completa allenamento" → modale → `handleTrainerSessionConfirm(withTrainer)` inserisce in `workout_logs` con `execution_mode: withTrainer ? 'coached' : 'solo'`. **Già implementato** (vedi PLAN_KPI_marketing_execution_mode.md). |
| `src/components/workout/trainer-session-modal.tsx` | Modale con due pulsanti: "Con trainer" e "Eseguito da solo". **Già implementato.** |
| `src/app/home/allenamenti/riepilogo/page.tsx` | Solo lettura post-completamento; nessuna modifica necessaria. |

L’atleta sceglie già “Eseguito da solo” o “Con trainer” prima di confermare; il valore viene salvato in `workout_logs.execution_mode` nell’insert. Nessuna modifica aggiuntiva per il flusso atleta.

---

## 2) File modificati (max 5)

| # | File | Modifica |
|---|------|----------|
| 1 | `src/lib/supabase/types.ts` | Aggiunto tipo per la view `athlete_marketing_metrics` (Row: athlete_id, workouts_total_count, workouts_solo_count, workouts_coached_count, last_workout_at) per tipizzare la query lato API. |
| 2 | `src/app/api/marketing/kpi/route.ts` | **Nuovo.** GET: verifica sessione e ruolo (solo `admin` o `marketing`); con `createAdminClient()` legge dalla view `athlete_marketing_metrics`; restituisce JSON. Marketing non accede mai a `workout_logs`/`workout_plans`. |
| 3 | `src/app/dashboard/marketing/page.tsx` | **Nuovo.** Pagina dashboard marketing: guard su ruolo (solo `marketing` o `admin`), fetch `GET /api/marketing/kpi`, mostra card (totale allenamenti, solo, coached, % coached, ultimo allenamento) e tabella per atleta. Solo dati dalla view. |
| 4 | `src/components/shared/dashboard/sidebar.tsx` | Aggiunto ramo `userRole === 'marketing'`: nav con Dashboard → `/dashboard/marketing`, Profilo, Impostazioni. |
| 5 | `src/components/shared/dashboard/dashboard-mobile-nav.tsx` | Stessa nav per ruolo `marketing`; link logo per marketing → `/dashboard/marketing`. |

---

## 3) Diff sintetici

- **types.ts:** In `Database['public']['Tables']` aggiunto blocco `athlete_marketing_metrics: { Row: { athlete_id, workouts_total_count, workouts_solo_count, workouts_coached_count, last_workout_at } }`.
- **api/marketing/kpi/route.ts:** Nuovo file; GET con check ruolo admin/marketing, `adminClient.from('athlete_marketing_metrics').select(...)`, return `{ data }`.
- **dashboard/marketing/page.tsx:** Nuovo file; redirect se ruolo non marketing/admin; fetch `/api/marketing/kpi`; card aggregate (total, solo, coached, % coached, last_workout_at) + tabella per atleta.
- **sidebar.tsx:** In un `else if (userRole === 'marketing')` impostata `nav` con 3 voci (Dashboard, Profilo, Impostazioni).
- **dashboard-mobile-nav.tsx:** Aggiunto `else if (userRole === 'marketing')` per `nav`; nel `Link` del logo aggiunto `userRole === 'marketing' ? '/dashboard/marketing'`.

---

## 4) Riepilogo

- **Atleta:** Il flusso “Completa allenamento” è già corretto: modale “Eseguito da solo” / “Con trainer”, insert in `workout_logs` con `execution_mode`. Nessun intervento aggiuntivo.
- **Marketing:** Può entrare in dashboard solo su `/dashboard/marketing` (via nav). La pagina chiama solo `GET /api/marketing/kpi`, che legge **solo** la view `athlete_marketing_metrics` (nessun accesso a `workout_logs`/`workout_plans`). L’API è riservata ai ruoli `admin` e `marketing`.
- **RLS:** L’update di `workout_logs` (reps, ecc.) resta regolato dalle policy esistenti; l’insert con `execution_mode` avviene in un’unica operazione al completamento; non è stato introdotto un endpoint dedicato di update per il solo `execution_mode`.

**Nota (opzionale):** Se si vuole che l’utente con ruolo `marketing` che accede a `/dashboard` venga reindirizzato a `/dashboard/marketing`, si può aggiungere in `src/middleware.ts` un ramo per `normalizedRole === 'marketing'` (redirect a `/dashboard/marketing` e whitelist path come per nutrizionista/massaggiatore).
