# Decisione tecnica — unificazione controllo overlap (appointments)

**Stato:** piano operativo (nessuna modifica codice/SQL in questo documento).  
**Riferimenti:** `audit/APPOINTMENTS_DUPLICATIONS.md`, `audit/SUPABASE_USAGE_MAP.md` (menzione `appointment-utils` + client browser).

---

## Nota sui “3 punti” nel codice

| #   | Ubicazione                                                                            | Ruolo                                                 |
| --- | ------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 1   | `src/hooks/useAthleteAppointments.ts` → `checkOverlap`                                | RPC `check_appointment_overlap`                       |
| 2   | `src/hooks/calendar/use-calendar-page.ts` → funzione locale `checkAppointmentOverlap` | Query su `appointments` (staff calendario)            |
| 3   | `src/lib/appointment-utils.ts` → `checkAppointmentOverlap`                            | Query su `appointments` (filtri cancellazione/status) |

L’audit elencava `use-appointments.ts` (root) per l’RPC: **oggi l’RPC è usata solo da `useAthleteAppointments`** (verifica grep su `src/hooks`).

---

## 1. Confronto delle tre implementazioni

### 1.1 RPC (`useAthleteAppointments.checkOverlap` → `check_appointment_overlap`)

| Aspetto                      | Dettaglio                                                                                                                                                                                                                                            |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Input**                    | `p_staff_id` (UUID profilo staff), `p_starts_at`, `p_ends_at`, `p_exclude_appointment_id?`                                                                                                                                                           |
| **Filtri**                   | Definiti **solo lato DB** (implementazione non versionata nel repo in `supabase/migrations`; firma in `src/lib/supabase/types.ts`: ritorno `has_overlap`, `conflicting_appointments`). Assunzione: intervallo su `staff_id` coerente con uso client. |
| **Eccezioni / regole extra** | Nessun parametro per `allenamento_doppio` o collaboratore nel client.                                                                                                                                                                                |
| **Output**                   | `boolean` (`has_overlap`); in caso di errore nel `catch`: **`false`** (fallimento silenzioso → rischio “nessun overlap” percepito).                                                                                                                  |

### 1.2 Query inline — `use-calendar-page.ts` (`checkAppointmentOverlap` locale)

| Aspetto       | Dettaglio                                                                                                                                                                                                                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Input**     | `staffId`, `startsAt`, `endsAt`, opzioni: `excludeAppointmentId`, `appointmentType`, `isCollaborator`                                                                                                                                                                                                   |
| **Filtri**    | `staff_id = staffId`, overlap temporale: `starts_at < endsAt` AND `ends_at > startsAt`. **Non** filtra `cancelled_at` né `status`.                                                                                                                                                                      |
| **Eccezioni** | Se `appointmentType === 'allenamento_doppio'`: overlap “valido” fino a **2** righe con `type === 'allenamento_doppio'` nello stesso slot; oltre → overlap. Altrimenti **≥1** riga sovrapposta → overlap. `isCollaborator` è passato ma **non usato nella funzione** (solo messaggi UI diversi a valle). |
| **Output**    | `boolean`                                                                                                                                                                                                                                                                                               |

### 1.3 `appointment-utils.ts` (`checkAppointmentOverlap`)

| Aspetto       | Dettaglio                                                                                                                     |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Input**     | `staffId`, `startsAt`, `endsAt`, `excludeAppointmentId?`                                                                      |
| **Filtri**    | `staff_id`, `cancelled_at IS NULL`, `status != 'annullato'`, stesso criterio intervallo (`lt`/`gt` su `starts_at`/`ends_at`). |
| **Eccezioni** | Nessuna regola `allenamento_doppio`.                                                                                          |
| **Output**    | `{ hasOverlap, conflictingAppointments }`; su errore → `hasOverlap: false` (simile rischio silenzioso).                       |

**Consumo attuale:** import da `appointment-utils` per overlap è **commentato** in `use-calendar-page.ts`; la lib resta divergenza potenziale se riattivata o usata altrove.

---

## 2. Differenze che possono produrre bug

1. **Annullati / cancellati:** calendario staff conta righe ancora presenti con `cancelled_at` valorizzato o `status = annullato`; `appointment-utils` le esclude. Esito: **slot “occupato” in calendario anche con appuntamento logicamente chiuso** (se le righe restano in tabella con overlap temporale).
2. **`allenamento_doppio`:** solo il calendario ammette due sovrapposizioni dello stesso tipo; RPC e utils **no** → stesso slot potrebbe essere **bloccato** per flussi che usano RPC/utils e **ammesso** (fino a 2) nel form calendario.
3. **Collaboratori:** logica overlap identica a trainer nel codice locale; solo copy diversa → nessun bug di conteggio, ma **aspettativa prodotto** (“mai doppio per nutrizionista”) non è enforced nel check.
4. **Error handling RPC / utils:** ritorno `false` su errore → **doppia prenotazione possibile** se la chiamata fallisce (rete, permessi, RPC assente).
5. **Drag / resize calendario:** `handleEventDrop` / `handleEventResize` **non** richiamano alcun overlap → incoerenza rispetto al form (modifica senza stesso gate).
6. **Allineamento RPC vs DB reale:** senza SQL nel repo, la RPC potrebbe differire ancora da quanto documentato in `DOCUMENTAZIONE/07_database_supabase_e_rls.md` (stub); va verificata su **istanza Supabase reale** prima di allineare tutto alla RPC.

---

## 3. Proposta di source of truth unica (conservativa)

**Decisione raccomandata (obiettivo batch successivo):**

- **Source of truth logica = una sola implementazione lato database:** RPC `check_appointment_overlap` **estesa** (parametri es. tipo appuntamento, flag collaboratore, coerenza filtri `cancelled_at` / `status`) in modo che **staff calendario, atleta e ogni altro client** chiamino solo quella funzione.
- **Motivo:** un solo punto di verità, stessi risultati indipendentemente da RLS sulle `select` client, e possibilità di evolvere regole senza duplicare query TS.

**Fino a quell’allineamento SQL (stato attuale):**

- Trattare esplicitamente **due comportamenti** in documentazione interna: “overlap atleta / consumer RPC” vs “overlap calendario staff (query + doppio)”, per evitare refactor prematuro che rompa `allenamento_doppio` o i filtri annullati senza migration.

**Non candidata come SoT finale:** triplicazione query client (`appointment-utils` vs inline vs RPC parziale).

---

## 4. Patch batch minimo futuro (≤ 5 file, ordine suggerito)

_vincolo: includere migration RPC = oltre 5 file se contata separatamente; sotto ipotesi “solo client” dopo che la RPC è già stata estesa dal DBA._

| #   | File                                                                              | Azione                                                                                                                                                               |
| --- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `supabase/migrations/…` _(batch SQL dedicato, fuori dal limite TS se necessario)_ | Estendere `check_appointment_overlap` (filtri annullati, `allenamento_doppio`, collaboratore se richiesto).                                                          |
| 2   | `src/lib/supabase/types.ts`                                                       | Rigenerare/aggiornare tipi RPC.                                                                                                                                      |
| 3   | `src/lib/appointments/check-overlap.ts` _(nuovo)_                                 | Wrapper unico: `checkAppointmentOverlapUnified(client, args)` → solo `rpc('check_appointment_overlap', …)` + gestione errore esplicita (non mascherare con `false`). |
| 4   | `src/hooks/useAthleteAppointments.ts`                                             | Delegare `checkOverlap` al wrapper (1).                                                                                                                              |
| 5   | `src/hooks/calendar/use-calendar-page.ts`                                         | Rimuovere `checkAppointmentOverlap` locale; usare wrapper; opzionale stesso check su drop/resize se prodotto lo richiede.                                            |

`appointment-utils.ts`: deprecare `checkAppointmentOverlap` o farlo delegare al wrapper (stesso file #3 se si accorpa in lib esistente — altrimenti 6° file; **batch minimo stretto:** deprecare con commento + re-export verso wrapper nello stesso nuovo file per non toccare troppi call site).

_Se il batch deve restare **solo TS senza SQL** (non consigliato per vera unificazione): massimo 5 file = estrarre la logica calendario in `src/lib/appointments/staff-calendar-overlap.ts` e far usare quella `useAthleteAppointments` **solo dopo** aver verificato equivalenza con RPC — rischio alto di nuovo drift; **non raccomandato** come SoT unica._

---

## 5. Rischi e test da eseguire

**Rischi**

- Estensione RPC che non replica esattamente il comportamento attuale calendario → regressioni su `allenamento_doppio` o su slot con annullati.
- Chiamate overlap da più ruoli con RLS diverse → test con utenti reali (trainer, collaboratore, atleta).
- Performance: RPC per ogni slot in creazione ricorrente (loop in `use-calendar-page`).

**Test (manuali / E2E mirati)**

1. Creare due `allenamento_doppio` nello stesso intervallo stesso staff → terzo rifiutato (comportamento atteso calendario).
2. Stesso intervallo con primo appuntamento `annullato` + `cancelled_at` → nuovo appuntamento **deve** essere consentito (definire con prodotto; allineare RPC di conseguenza).
3. Atleta: creazione/modifica che usa `checkOverlap` → stesso esito di una verifica SQL diretta sulla RPC.
4. Simulare errore RPC (es. network offline) → UI non deve interpretare come “libero” senza avviso.
5. Dopo unificazione: drag su slot già occupato (se si aggiunge check) — coerenza con form.

**Test automatici**

- Estendere `src/hooks/__tests__/use-athlete-appointments.test.ts` per mock RPC e casi limite.
- Aggiungere test unitario sul wrapper (mock Supabase client) per parametri passati alla RPC.

---

_Documento generato per batch decisionale; nessuna modifica a codice o RLS in questa fase._
