# Welcome / Onboarding atleta — Documentazione

Documentazione del wizard di onboarding atleta (pagina `/welcome`): step, dati, validazioni, persistenza e API.

---

## 1. Panoramica

- **Route:** `src/app/welcome/` (layout + page)
- **Utente:** atleta autenticato (`auth.uid()`); il profilo è identificato da `profiles.user_id = auth.uid()`, `athlete_id = profiles.id`
- **Versione questionario:** `QUESTIONNAIRE_VERSION = 'intake-v1-2026-02-08'` (usata per `athlete_questionnaires.version`)
- **Step totali:** 15 (indici 0–14)

---

## 2. Elenco step (STEPS)

| Indice | Titolo                | Descrizione breve                                      | Salvataggio                          |
|--------|------------------------|--------------------------------------------------------|--------------------------------------|
| 0      | Benvenuto              | Completa il tuo profilo per iniziare.                  | —                                     |
| 1      | Identità               | Nome, cognome, codice fiscale, sesso, data nascita     | `profiles` (formStateToUpdate)        |
| 2      | Contatti & emergenza   | Telefono, contatto emergenza                           | `profiles`                            |
| 3      | Residenza & dati fiscali | Indirizzo, CAP, città, provincia, nazione, professione, codice fiscale | `profiles` |
| 4      | Dati fisici            | Altezza, peso, obiettivo peso, BMI                     | `profiles`                            |
| 5      | Obiettivi & livello    | Livello esperienza, tipo atleta, obiettivi fitness     | `profiles`                            |
| 6      | Motivazione            | Livello 1–5, note                                       | `profiles`                            |
| 7      | Salute                  | Certificato medico, limitazioni, infortuni, operazioni, allergie; upload certificato | `profiles` + Storage + `documents` |
| 8      | Nutrizione             | Obiettivo nutrizionale, intolleranze, allergie alimentari, abitudini | `profiles` |
| 9      | Anamnesi                | Questionario clinico + dichiarazione + firma            | `athlete_questionnaires.anamnesi`    |
| 10     | Manleva                 | Documento manleva, dati read-only, ruolo, firma         | `athlete_questionnaires.manleva`     |
| 11     | Liberatoria foto e video | Consenso media (Autorizzo/Non autorizzo), canali, firma | `athlete_questionnaires.liberatoria_media` |
| 12     | Riepilogo               | Solo lettura, sezioni con CTA “Modifica” → step corrispondente, card Documenti | — |
| 13     | Conferma finale         | Checkbox obbligatoria per procedere                     | Solo stato locale (nessun DB)        |
| 14     | Genera dossier          | Chiamata API, generazione PDF, download, link Documenti | API aggiorna `first_login`, `signed_at`, inserisce in `documents` |

---

## 3. Dati e persistenza

### 3.1 Form profilo (OnboardingFormState)

- **Aggiornamento:** a ogni “Avanti” (da step 1 in poi) viene calcolato un payload da `form` e inviato a `profiles` tramite `updateForm` (Supabase `profiles.update`) per gli step inclusi in `formStateToUpdate` (soglie step 1–8).
- **Prefill:** al caricamento pagina si legge `profiles` (eq `user_id`) e si mappa in `form` con `profileToFormState`.

### 3.2 Questionario (anamnesi, manleva, liberatoria)

- **Tabella:** `public.athlete_questionnaires`
  - Chiave: `(athlete_id, version)` univoca
  - Colonne JSONB: `anamnesi`, `manleva`, `liberatoria_media`
  - Altre: `signed_at`, `created_at`, `updated_at`
- **Prefill:** alla load, se esiste una riga con `athlete_id = profiles.id` e `version = QUESTIONNAIRE_VERSION`, i campi vengono mappati negli state `anamnesi`, `manleva`, `liberatoria`.
- **Upsert:** a step 9/10/11 “Avanti” si chiama `saveQuestionnaire({ anamnesi | manleva | liberatoria_media })`; l’upsert aggiorna solo i blob indicati (merge con il payload completo inviato per quella chiave).

### 3.3 Strutture state documento

- **AnamnesiState:** sonno, bpm_riposo, fumatore, stile_vita, infortuni/operazioni/gravidanza/proporzione, dichiarazione_veridicita, firma_nome_cognome.
- **ManlevaState:** nome_cognome, data_nascita, luogo_nascita, residenza, ruolo (`diretto_responsabile` | `tutore_legale`), nome_minore, dichiarazione_accettazione, firma_nome_cognome.
- **LiberatoriaState:** authorized (`true` | `false` | null), channels (string[]), duration (`fino_a_revoca` | `illimitata`), place, firma_nome_cognome.

---

## 4. Validazioni (bloccanti)

- **Step 1:** nome e cognome obbligatori.
- **Step 5:** livello esperienza obbligatorio.
- **Step 9:** dichiarazione veridicità e firma anamnesi obbligatorie.
- **Step 10:** accettazione manleva, firma (≥3 caratteri); se ruolo = tutore legale, nome minore obbligatorio.
- **Step 11:** scelta Autorizzo/Non autorizzo obbligatoria; firma (≥3 caratteri).
- **Step 13:** checkbox “Confermo che tutti i dati…” obbligatoria per abilitare Avanti.

Se la validazione fallisce, viene mostrato `stepError` e non si avanza.

---

## 5. Step documentali (dettaglio)

### Step 9 — Anamnesi

- Card con questionario clinico (sonno, BPM, fumatore, stile vita, infortuni, operazioni, gravidanza, proporzione).
- Checkbox dichiarazione veridicità e campo firma (nome e cognome).
- Salvataggio in `athlete_questionnaires.anamnesi`; sync opzionale di alcuni campi su `profiles` (es. infortuni_recenti, operazioni_passate).

### Step 10 — Manleva

- Card documento con riassunto + “Leggi tutto” (testo completo manleva, link www.22club.it).
- Dati identificativi in sola lettura da `form` (nome, cognome, data nascita, residenza).
- Campi: luogo di nascita, ruolo (radio: diretto responsabile / tutore legale), nome minore (se tutore), checkbox accettazione, firma.
- Payload salvato in `manleva` include anche nome_cognome, data_nascita, residenza presi da `form` (solo per il documento).

### Step 11 — Liberatoria foto/video

- Card documento con riassunto + “Leggi tutto”.
- Dati identificativi read-only (nome, cognome, data nascita, codice fiscale, residenza).
- Radio Autorizzo / Non autorizzo; se Autorizzo: canali (chips), durata (fino a revoca / illimitata), luogo (opzionale); firma obbligatoria.
- Salvataggio in `liberatoria_media`: authorized, channels, duration, place, signature_text, accepted_at, user_agent.

### Step 12 — Riepilogo

- Sezioni: Profilo base, Contatti, Residenza, Dati fisici, Obiettivi, Motivazione, Salute, Nutrizione, Documenti e consensi.
- Ogni sezione ha “Modifica” → step corrispondente (1–11).
- Card “Documenti e consensi”: stato Anamnesi/Manleva/Liberatoria (Compilata/Accettata/Autorizzata o NON autorizzata/Da scegliere), versione questionario.

---

## 6. Step 13 — Conferma finale

- Testo che invita a confermare i dati; checkbox obbligatoria: “Confermo che tutti i dati inseriti sono corretti e autorizzo la generazione del Dossier Atleta 22Club.”
- Micro-note: modifiche successive dal profilo; dossier salvato in Documenti.
- Nessun salvataggio su DB; stato `finalConfirmation` solo in UI. Avanti abilitato solo con checkbox spuntata.

---

## 7. Step 14 — Genera dossier

- **Stati UI:**
  - **Ready:** card informativa + pulsante “Genera dossier” (in card) + link “Torna al riepilogo” (→ step 12).
  - **Loading:** spinner + “Generazione in corso…”.
  - **Success:** “Dossier generato e salvato nei Documenti.” + “Scarica dossier” (signed URL) + “Vai alla Home” + “Apri Documenti” (`/home/documenti`).
  - **Error:** messaggio di errore + “Riprova” + “Torna al riepilogo”.
- **Chiamata:** `POST /api/onboarding/finish` con body `{ "version": "intake-v1-2026-02-08" }`.
- L’API (lato server) genera il PDF, lo carica su Storage, inserisce un record in `documents`, aggiorna `athlete_questionnaires.signed_at` e `profiles.first_login = false`, e restituisce `downloadUrl` (signed). Ruolo richiesto: `athlete` o `atleta`.

---

## 8. API `POST /api/onboarding/finish`

- **File:** `src/app/api/onboarding/finish/route.ts`
- **Body:** `{ "version"?: string }` (default `intake-v1-2026-02-08`).
- **Flusso:**
  1. Session auth (401 se non autenticato).
  2. Lettura `profiles` per `user_id` (404 se assente).
  3. Controllo ruolo: deve essere `athlete` o `atleta` (403 altrimenti).
  4. Lettura `athlete_questionnaires` per `athlete_id` e `version` (400 se mancante).
  5. Generazione PDF con `buildDossierPdf(profile, questionnaire)`.
  6. Upload PDF su Storage (`documents` bucket), insert in `documents`, update `athlete_questionnaires.signed_at` e `profiles.first_login = false`, `ultimo_accesso`.
  7. Creazione signed URL e risposta `{ success: true, downloadUrl }`.

---

## 9. Database

- **profiles:** tutti i campi anagrafici, fisici, obiettivi, salute, nutrizione usati dal form (vedi `OnboardingFormState` e `profileToFormState` / `formStateToUpdate`).
- **athlete_questionnaires:** vedi migration `20260215_athlete_questionnaires.sql`; RLS abilitata, policy per cui l’atleta può gestire solo il proprio questionario (`athlete_id` = proprio `profiles.id`).
- **documents:** inserimento da API finish per il dossier (category `dossier_onboarding`).

---

## 10. File coinvolti

- `src/app/welcome/page.tsx` — wizard, state, validazioni, UI step 0–14
- `src/app/welcome/layout.tsx` — layout pagina welcome
- `src/app/api/onboarding/finish/route.ts` — generazione dossier e completamento onboarding
- `src/lib/dossier-pdf.ts` — costruzione PDF Dossier Atleta
- `src/lib/documents.ts` — upload documenti (es. certificato medico step 7)
- `supabase/migrations/20260215_athlete_questionnaires.sql` — tabella e RLS questionari

---

*Ultimo aggiornamento: febbraio 2026*
