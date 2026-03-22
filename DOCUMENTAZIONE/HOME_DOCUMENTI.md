# Pagina Documenti Atleta – /home/documenti

## Panoramica

**URL:** `http://localhost:3001/home/documenti` (o `/home/documenti` in produzione)

La pagina **I miei Documenti** consente all’atleta di vedere in un’unica lista tutti i propri documenti (certificati, liberatorie, contratti, dossier onboarding, referti, fatture), di aprirli in una nuova scheda e di caricare o sostituire documenti quando previsto.

**Utenti:** atleti autenticati (profilo valido). Il layout home gestisce redirect se non autenticato.

---

## Funzionalità principali

### Lista unificata

- **Fonti aggregate:** tabella `documents`, certificato/referti da `athlete_medical_data`, documenti contrattuali da `athlete_administrative_data`, fatture da `payments` (con `invoice_url`).
- Ogni voce mostra: categoria, label (nome file/descrizione), data, stato (valido / in scadenza / scaduto / non valido), eventuali note e scadenza.
- Categorie supportate: certificato, liberatoria, contratto, altro, dossier_onboarding, referto, fattura.

### Visualizza

- Pulsante **Visualizza** su ogni card: apre il documento in **nuova scheda**.
- Documenti su Storage privato (signed): l’URL usato è `/api/document-preview?bucket=...&path=...` (proxy server-side che genera la signed URL e fa stream del file).
- Documenti con URL pubblico: apertura diretta di `item.open.url`.

### Carica

- Pulsante **Carica** in header (e “Carica primo documento” se la lista è vuota): apre il file picker (PDF, JPG, JPEG, PNG).
- Se la categoria è “altro” o non specificata, viene mostrato un **dialog** per scegliere categoria (certificato, liberatoria, contratto, altro) prima di procedere.
- Upload: validazione file (`validateDocumentFile`), poi `uploadDocument` → Storage bucket `documents` + inserimento in tabella `documents` con `athlete_id` e `uploaded_by_profile_id` = profile dell’atleta.

### Nuovo (sostituzione)

- Pulsante **Nuovo** visibile solo su documenti **sostituibili** (`item.canReplace`), ad es. scaduti / in scadenza / non valido.
- Avvia lo stesso flusso di Carica per la categoria del documento selezionato.

### Statistiche rapide

- Due card in alto: **Validi** (conteggio `status === 'valido'`) e **In scadenza** (conteggio `status === 'in_scadenza'`).

### Info aggiuntive

- Card con avvertenze: certificati annuali, liberatorie 2 anni, contratti e date, formati ammessi (PDF/JPG).

---

## Architettura

### Route e componenti

| Percorso                          | Descrizione                                                                                            |
| --------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `src/app/home/documenti/page.tsx` | Pagina Next.js (App Router). Export default wrappa il contenuto in `<Suspense>` con fallback skeleton. |
| `DocumentiPageContent`            | Componente principale: header, statistiche, lista card, card info, dialog categoria.                   |

### Dati e tipi

- **`UnifiedDocumentItem`** (da `@/lib/all-athlete-documents`): tipo unico per ogni voce in lista.
  - `id`, `category`, `categoryKey`, `label`, `date`, `expires_at`, `status`, `notes`
  - `open`: `{ type: 'public', url }` oppure `{ type: 'signed', bucket, path }`
  - `source`: `documents` | `medical_certificate` | `medical_referto` | `contract` | `invoice`
  - `canReplace`, opzionale `publicUrlFallback`

- **Identificativi atleta:** `documents` e `payments` usano `profiles.id`; `athlete_medical_data` e `athlete_administrative_data` usano `profiles.user_id` (auth). La pagina passa entrambi a `getAllAthleteDocuments(profileId, userId)`.

### Lib e API

| Modulo / API                              | Ruolo                                                                                                                                                                                                                                                                       |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@/lib/all-athlete-documents`             | `getAllAthleteDocuments(profileId, userId)` aggrega tutte le fonti e restituisce `UnifiedDocumentItem[]`. Normalizza i path Storage (es. dossier: `profile_id/dossier/...` → `dossier/profile_id/...`).                                                                     |
| `@/lib/documents`                         | `getDocuments(profileId)`, `uploadDocument(file, category, athleteId, uploadedByProfileId)`, `validateDocumentFile(file)`.                                                                                                                                                  |
| `GET /api/document-preview?bucket=&path=` | Route API che crea una signed URL server-side (Supabase client con cookie), scarica il file da Storage e lo restituisce in streaming con `Content-Type` e `X-Frame-Options: SAMEORIGIN`. Usata per aprire documenti in nuova scheda senza problemi di CORS/X-Frame-Options. |

### Storage Supabase

- **Bucket:** `documents` (privato).
- **Path tipici:** `dossier/{profile_id}/{filename}`, `fatture/{profile_id}/{filename}`, altri sotto `{profile_id}/...`.
- **RLS (Storage):** policy per atleta: SELECT su `dossier/{proprio_profile_id}/...`, su `fatture/{proprio_profile_id}/...`, e su path con primo segmento = `profiles.id` (migrations 20260218, 20260219). Il path del dossier in DB può essere normalizzato da `all-athlete-documents` (formato errato `profile_id/dossier/...` → `dossier/profile_id/...`).

---

## Flussi utente

1. **Apertura pagina:** caricamento lista con `getAllAthleteDocuments`; se non c’è utente/profilo valido viene mostrato uno skeleton (il layout può fare redirect).
2. **Visualizza:** click su “Visualizza” → costruzione URL (proxy per signed, diretto per public) → `window.open(url, '_blank')`.
3. **Carica:** click su “Carica” → file picker → validazione → (se categoria “altro” → dialog categoria) → `performUpload` → `uploadDocument` + refresh lista + notifica successo.
4. **Nuovo:** click su “Nuovo” su un documento sostituibile → stesso flusso Carica per quella categoria.

---

## File di riferimento

- `src/app/home/documenti/page.tsx` – UI e logica pagina
- `src/lib/all-athlete-documents.ts` – aggregazione documenti e tipi
- `src/lib/documents.ts` – getDocuments, uploadDocument, validateDocumentFile
- `src/app/api/document-preview/route.ts` – proxy per visualizzazione documenti signed
- Migration Storage: `20260218_storage_documents_athlete_view_own_fatture.sql`, `20260219_storage_documents_athlete_view_own_dossier.sql`, `20260219_storage_documents_athlete_view_own_profile_id.sql`
- Verifica Storage: `supabase/migrations/20260219_verifica_storage_documenti.sql` (script da eseguire nel SQL Editor per controllare policy e path)
