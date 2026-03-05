# Piano di implementazione – Profilo trainer completo

Piano operativo per implementare il profilo professionale completo del trainer in dashboard/impostazioni. Riferimento dati esistenti: `docs/TRAINER_PROFILE_DB_STATE.md`.

---

## Obiettivo

Permettere al trainer (ruolo `trainer` / `pt` / `staff`) di compilare e gestire il proprio profilo pubblico tramite **Dashboard → Impostazioni**, con tutti i blocchi definiti (identità, bio, formazione, certificazioni, specializzazioni, metodo, risultati, testimonianze, esperienza, strumenti, etica, dati legali, statistiche, media), inclusi upload di immagini e file.

---

## Fasi e dipendenze (overview)

```
Fase 0: Verifica e preparazione
Fase 1: Schema DB (profiles + trainer_profiles + tabelle 1:N) + Storage
Fase 2: RLS + RPC
Fase 3: Tipi TypeScript + hook/API lato app
Fase 4: UI Dashboard – Tab “Profilo professionale” e blocchi
Fase 5: Integrazione e test
```

Ogni fase può essere spezzata in sotto-task; le fasi 1→2→3→4 vanno rispettate nell’ordine.

---

## Fase 0: Verifica e preparazione

| # | Task | Deliverable | Note |
|---|------|-------------|------|
| 0.1 | Verificare struttura e uso di `trainer_athletes` | Nota in TRAINER_PROFILE_DB_STATE.md o doc dedicata | Query `SELECT * FROM trainer_athletes LIMIT 1` + `information_schema.columns`. Decidere se usare solo `pt_atleti` o anche `trainer_athletes`. |
| 0.2 | Decidere naming ruoli | Scelta: `trainer` vs `pt` vs `staff` | In app e RLS usare coerente (es. tutti come `trainer` o `pt`). |
| 0.3 | Creare branch / milestone | Branch `feature/trainer-profile` (opzionale) | Per sviluppi lunghi. |

**Output:** Decisioni documentate; nessun blocco per le fasi successive.

---

## Fase 1: Schema database e storage

### 1.1 Estensioni su `profiles` (blocco identità – riuso)

Aggiungere solo colonne necessarie non già presenti. Da `TRAINER_PROFILE_DB_STATE.md`, su `profiles` esistono già: nome, cognome, email, phone, telefono, avatar, avatar_url, citta, provincia, nazione, cap, indirizzo, data_nascita, professione, stato, codice_fiscale.

| # | Task | Deliverable |
|---|------|-------------|
| 1.1.1 | Migration: aggiungere colonne trainer su `profiles` (se mancanti) | File `supabase/migrations/YYYYMMDD_trainer_profiles_columns.sql` | Colonne suggerite: `titolo_professionale` (varchar 60), `anni_esperienza` (integer 0–60), `modalita_lavoro` (text[] o jsonb), `stato_profilo` (varchar: bozza/verifica/pubblicato). Valutare `lat`/`lng` per geolocalizzazione. |
| 1.1.2 | Aggiornare tipi TypeScript generati (Supabase) | `src/lib/supabase/types.ts` aggiornato | Dopo migration: `supabase gen types typescript` (o manuale se non usate codegen). |

### 1.2 Tabella `trainer_profiles` (1:1 con profiles)

Contiene: bio, metodo di lavoro, etica, dati legali, strumenti, statistiche (campi flat o json dove ha senso).

| # | Task | Deliverable |
|---|------|-------------|
| 1.2.1 | Definire schema `trainer_profiles` | Stesso file migration o secondo file | Colonne: `profile_id` (uuid PK, FK → profiles.id UNIQUE), `descrizione_breve` (varchar 300), `descrizione_estesa` (text), `filosofia` (text), `perche_lavoro` (text), `target_clienti` (text[] o jsonb), `valutazione_iniziale` (boolean), `test_funzionali` (boolean), `analisi_postura` (boolean), `misurazioni_corporee` (text[]), `periodizzazione` (boolean), `check_settimanali` (boolean), `report_progressi` (boolean), `uso_app` (boolean), `clienti_seguiti` (integer), `pct_successo` (numeric), `media_kg_persi` (numeric), `media_aumento_forza` (text), `no_doping` (boolean), `no_diete_estreme` (boolean), `no_promesse_irrealistiche` (boolean), `focus_salute` (boolean), `educazione_movimento` (boolean), `privacy_garantita` (boolean), `partita_iva` (varchar), `assicurazione` (boolean), `assicurazione_url` (text), `registro_professionale` (varchar), `consenso_immagini_clienti` (boolean), `termini_accettati` (boolean), `app_monitoraggio` (varchar), `software_programmazione` (varchar), `metodi_misurazione` (text[]), `url_video_presentazione` (text), `galleria_urls` (text[]), `created_at`, `updated_at`. Adattare lunghezze e obbligatorietà in base a requisiti. |
| 1.2.2 | Creare tabella in migration | SQL `CREATE TABLE trainer_profiles (...)` | Con `profile_id` UNIQUE e FK a `profiles(id) ON DELETE CASCADE`. |
| 1.2.3 | Trigger `updated_at` | In migration | `BEFORE UPDATE SET updated_at = now()`. |

### 1.3 Tabelle 1:N (formazione, certificazioni, corsi, specializzazioni, esperienze, testimonianze, trasformazioni)

Una migration per tabella (o una migration unica con più `CREATE TABLE`).

| Tabella | Colonne principali | Deliverable |
|---------|---------------------|-------------|
| `trainer_education` | id, profile_id (FK), tipo (laurea/diploma), titolo, istituto, anno, documento_url | Migration + RLS (Fase 2) |
| `trainer_certifications` | id, profile_id, nome, ente, anno, numero_certificato, stato (attivo/aggiornamento/scaduto), file_url | Idem |
| `trainer_courses` | id, profile_id, nome, durata_valore, durata_unita (ore/mesi), anno | Idem |
| `trainer_specializations` | id, profile_id, nome, livello (base/avanzato/expert), anni_esperienza | Idem |
| `trainer_experience` | id, profile_id, nome_struttura, ruolo, data_inizio, data_fine, collaborazioni, atleti_seguiti | Idem |
| `trainer_testimonials` | id, profile_id, nome_cliente, eta, obiettivo, durata_percorso, risultato, feedback, valutazione (1–5) | Idem |
| `trainer_transformations` | id, profile_id, prima_dopo_urls (jsonb o text[]), durata_settimane, obiettivo, risultato, verificato, consenso | Idem |

| # | Task | Deliverable |
|---|------|-------------|
| 1.3.1 | Scrivere migration per tutte le tabelle 1:N | Un file o più file in `supabase/migrations/` | Con FKs `profile_id` → `profiles(id) ON DELETE CASCADE`, indici su `profile_id`. |
| 1.3.2 | Aggiornare tipi TypeScript | types.ts | Dopo `supabase gen types` o manuale. |

### 1.4 Storage

| # | Task | Deliverable |
|---|------|-------------|
| 1.4.1 | Foto professionale trainer | Nessuna nuova tabella | Riutilizzare bucket `avatars`; path es. `{profile_id}/avatar.png` (come atleti). Policy: trainer può upload/update solo nella propria cartella. |
| 1.4.2 | Certificati e documenti trainer | Bucket `trainer-certificates` (o uso `documents` con policy) | Policy: lettura/scrittura solo per `profile_id` = trainer loggato (e admin). Mime: PDF, image/*. |
| 1.4.3 | Galleria e video | Bucket `trainer-media` (o sottocartelle in `general-files`) | Policy: come sopra. Limiti: es. max 10 immagini galleria, 1 video presentazione (max 90 sec). |

**Checklist Fase 1:** Migration applicata, tabelle create, bucket/policy storage definite, tipi aggiornati.

---

## Fase 2: RLS e RPC

### 2.1 RLS su tabelle trainer_*

Per ogni tabella `trainer_profiles`, `trainer_education`, `trainer_certifications`, …:

| # | Task | Deliverable |
|---|------|-------------|
| 2.1.1 | Abilitare RLS | In migration o file separato | `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`. |
| 2.1.2 | Policy SELECT | Trainer vede solo i propri dati | `profile_id = get_current_trainer_profile_id()`. Admin: policy separata `is_admin()`. |
| 2.1.3 | Policy INSERT/UPDATE/DELETE | Solo il proprio profile_id | Stessa condizione. |

### 2.2 RPC (opzionali ma utili)

| # | Task | Deliverable |
|---|------|-------------|
| 2.2.1 | `get_trainer_profile_full(profile_id uuid)` | RPC che restituisce profilo esteso (trainer_profiles + righe 1:N) | Solo se chiamante è admin oppure atleta assegnato (pt_atleti) a quel profile_id. Usabile da app atleta per “vedi profilo trainer”. |
| 2.2.2 | Mantenere `get_my_trainer_profile()` | Già esistente | Continua a servire card “Il tuo trainer” e pagina /home/trainer. |

**Checklist Fase 2:** RLS attive su tutte le tabelle trainer_*, RPC pubblica (se prevista) con controlli corretti.

---

## Fase 3: Tipi TypeScript e dati in app

### 3.1 Tipi e hook

| # | Task | Deliverable |
|---|------|-------------|
| 3.1.1 | Tipi per trainer_profiles e tabelle 1:N | File `src/types/trainer-profile.ts` (o in types esistenti) | Interfacce per form e risposte API. Allineate a Supabase types. |
| 3.1.2 | Hook `useTrainerProfile(profileId)` | Carica trainer_profiles + eventuali 1:N | Per dashboard: profileId = get_current_trainer_profile_id (da auth/session). |
| 3.1.3 | Hook o funzioni `useUpdateTrainerProfile`, `useTrainerEducation`, … | Mutations per salvare ogni blocco | Chiamate Supabase da client (INSERT/UPDATE/DELETE) con RLS. |

### 3.2 Upload file

| # | Task | Deliverable |
|---|------|-------------|
| 3.2.1 | Helper upload avatar | Riutilizzare logica esistente `avatars` | Stesso pattern di settings-profile-tab / avatar-uploader. |
| 3.2.2 | Helper upload certificati / galleria / video | Upload su bucket trainer-certificates e trainer-media | Path: `{profile_id}/{tipo}/{filename}`. Salvare URL restituito in DB (trainer_certifications.file_url, trainer_profiles.galleria_urls, url_video_presentazione). |

**Checklist Fase 3:** Tipi definiti, hook che leggono/scrivono su Supabase, upload funzionanti e URL salvati.

---

## Fase 4: UI – Dashboard Impostazioni

### 4.1 Struttura pagina

| # | Task | Deliverable |
|---|------|-------------|
| 4.1.1 | Nuovo tab “Profilo professionale” (o espandere “Profilo”) | In `src/app/dashboard/impostazioni/page.tsx` | Aggiungere TabsTrigger e TabsContent. Visibile solo se `user.role IN ('trainer','pt','staff','admin')`. |
| 4.1.2 | Layout tab: sezioni/accordion per blocco | Componente contenitore | Una sezione per ogni blocco (1–16). Ordinamento: Identità → Bio → Formazione → … → Media. |

### 4.2 Blocchi UI (ordine implementazione suggerito)

Implementare in questo ordine per avere subito un flusso utilizzabile:

| Ordine | Blocco | Componente / contenuto | Dipendenze |
|--------|--------|------------------------|------------|
| 1 | **Blocco 1 – Identità** | Form: foto (avatar), nome, cognome, titolo professionale, età (o data nascita), città/area, modalità lavoro (checkbox), anni esperienza, stato profilo (badge read-only) | profiles + upload avatars |
| 2 | **Blocco 2 – Bio** | Form: descrizione breve (textarea 300), descrizione estesa (2000), filosofia (1000), perché fai questo lavoro (800), target clienti (select multipla) | trainer_profiles |
| 3 | **Blocco 12 – Etica & Valori** | Checkbox obbligatorie: no doping, no diete estreme, … (tutte devono essere true per “pubblicabile”) | trainer_profiles |
| 4 | **Blocco 13 – Dati legali** | P.IVA, assicurazione (boolean + upload polizza), registro professionale, consenso immagini, termini e condizioni | trainer_profiles + storage |
| 5 | **Blocco 3 – Formazione** | Liste: Laurea (titolo, istituto, anno), Diploma (titolo, anno); Certificazioni (nome, ente, anno, numero, stato, upload file); Corsi (nome, durata, anno) | trainer_education, trainer_certifications, trainer_courses |
| 6 | **Blocco 4 – Specializzazioni** | Lista: nome (select + custom), livello, anni esperienza | trainer_specializations |
| 7 | **Blocco 5 – Metodo di lavoro** | Checkbox: valutazione iniziale, test funzionali, analisi postura, misurazioni (multi), periodizzazione, check settimanali, report, uso app | trainer_profiles |
| 8 | **Blocco 11 – Strumenti** | App monitoraggio, software programmazione, metodi misurazione (checkbox) | trainer_profiles |
| 9 | **Blocco 6 – Risultati** | Clienti seguiti, % successo, media kg persi, media forza; Lista trasformazioni (prima/dopo, durata, obiettivo, risultato, upload, verificato) | trainer_profiles + trainer_transformations |
| 10 | **Blocco 7 – Testimonianze** | Lista: nome cliente, età, obiettivo, durata, risultato, feedback, valutazione 1–5 | trainer_testimonials |
| 11 | **Blocco 8 – Esperienza lavorativa** | Lista: struttura, ruolo, periodo, collaborazioni, atleti seguiti | trainer_experience |
| 12 | **Blocco 15 – Statistiche (PRO)** | Clienti attivi, retention, rinnovi, % trasformazioni, durata media, KPI (opzionale) | trainer_profiles o vista calcolata |
| 13 | **Blocco 16 – Media** | Galleria (max 10 immagini), video presentazione (link o upload, max 90 s), video esercizi (opzionale) | trainer_profiles + storage trainer-media |

### 4.3 Componenti riutilizzabili

| # | Task | Deliverable |
|---|------|-------------|
| 4.3.1 | Sezione collassabile (accordion/card) | Componente `TrainerProfileSection` con titolo + contenuto | Usato per ogni blocco. |
| 4.3.2 | Lista dinamica (add/remove righe) | Componente generico per education, certifications, testimonials, … | Props: campi, valori iniziali, onSave. |
| 4.3.3 | Upload con preview e progress | Estensione di `avatar-uploader` o nuovo per certificati/galleria | Bucket trainer-certificates / trainer-media. |

### 4.4 Validazione e messaggi

| # | Task | Deliverable |
|---|------|-------------|
| 4.4.1 | Validazione lato client (max length, obbligatorietà) | Zod schema o analogo per ogni blocco | Allineati a vincoli DB. |
| 4.4.2 | Messaggi di successo/errore | Toast/notify dopo save | Coerenti con resto app. |
| 4.4.3 | Stato “profilo pubblicabile” | Badge o indicatore | Es. “Completo” se blocchi obbligatori e etica compilati. |

**Checklist Fase 4:** Tab visibile ai trainer, tutti i blocchi implementati con form e salvataggio, upload funzionanti, validazione e feedback utente.

---

## Fase 5: Integrazione e test

| # | Task | Deliverable |
|---|------|-------------|
| 5.1 | E2E: login come trainer → Impostazioni → Profilo professionale → compilare Blocco 1 e salvare | Test Playwright (se presenti) o checklist manuale | Verifica che dati compaiano in `profiles` e, se applicabile, in `trainer_profiles`. |
| 5.2 | Verifica RLS | Test: altro utente (atleta) non può leggere/scrivere trainer_profiles di un altro | Query da client con JWT atleta. |
| 5.3 | Pagina atleta “Profilo trainer” | Già esistente /home/trainer; eventualmente estendere con dati da `get_trainer_profile_full` | Mostrare anche bio, specializzazioni, ecc. se RPC è implementata. |
| 5.4 | Documentazione | Aggiornare TRAINER_PROFILE_DB_STATE.md con schema finale e indicare “Implementato” in TRAINER_PROFILE_IMPLEMENTATION_PLAN.md | Breve guida per futuri sviluppi. |

---

## Stima tempi (indicativa)

| Fase | Stima | Note |
|------|--------|------|
| Fase 0 | 0.5–1 h | Verifiche e decisioni. |
| Fase 1 | 2–4 h | Migration + storage; possibile spezzare in più commit. |
| Fase 2 | 1–2 h | RLS + eventuale RPC. |
| Fase 3 | 2–3 h | Tipi + hook + upload. |
| Fase 4 | 8–16 h | Dipende da quanti blocchi si implementano per primi; consiglio partire da 1, 2, 12, 13 poi il resto. |
| Fase 5 | 1–2 h | Test e doc. |
| **Totale** | **~15–28 h** | Da adattare in base a priorità (MVP solo blocchi 1+2+12+13). |

---

## MVP (primo rilascio utile)

Per un primo rilascio minimo:

1. **Fase 1:** Solo `profiles` (eventuali nuove colonne) + tabella `trainer_profiles` con: descrizione_breve, descrizione_estesa, target_clienti, booleani etica, partita_iva, assicurazione, termini_accettati. Nessuna tabella 1:N.
2. **Fase 2:** RLS su `trainer_profiles`.
3. **Fase 4:** Un solo tab “Profilo professionale” con Blocco 1 (identità su profiles) + Blocco 2 (bio su trainer_profiles) + Blocco 12 (etica) + Blocco 13 (dati legali). Upload solo avatar (avatars) e eventuale polizza (documents o trainer-certificates).

Poi estendere con formazione, certificazioni, specializzazioni, testimonianze, media in iterazioni successive.

---

## Riferimenti

- **Stato DB e riuso dati:** `docs/TRAINER_PROFILE_DB_STATE.md`
- **Pagina impostazioni:** `src/app/dashboard/impostazioni/page.tsx`
- **Tab Profilo attuale:** `src/components/settings/settings-profile-tab.tsx`
- **Upload avatar:** `src/components/settings/avatar-uploader.tsx`
- **RPC trainer:** `get_my_trainer_profile`, `get_current_trainer_profile_id` (migration 20260227 e 20260213)
