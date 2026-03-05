# Documentazione: Upload profilo trainer, RPC e vista atleta

Riferimento piano: upload certificati/media, RPC `get_trainer_profile_full`, vista atleta profilo trainer, validazione e fix storage/UX.

---

## 1. Upload file (certificati e media)

### 1.1 Helper `src/lib/trainer-storage.ts`

- **`uploadTrainerCertificate(file: File)`**: upload su bucket `trainer-certificates`, path `{auth.uid()}/certificati/{uuid}_{filename}`. Tipi ammessi: PDF, JPG, PNG, WebP. Max 5 MB. Restituisce signed URL (1 anno) da salvare in DB.
- **`uploadTrainerMedia(file: File, tipo: 'galleria' | 'video')`**: upload su bucket `trainer-media`, path `{auth.uid()}/media/{tipo}/{uuid}_{filename}`. Galleria: immagini, max 10 MB; video: MP4/WebM, max 100 MB. Restituisce signed URL (1 anno).

Gestione errori: messaggio dedicato se la risposta è HTML invece di JSON (es. URL Supabase errato); controllo `supabase.storage` per mock client.

### 1.2 Integrazione nel tab profilo trainer

- **Impostazioni → Profilo professionale** (`src/components/settings/settings-trainer-profile-tab.tsx`):
  - **Certificazioni**: input file nascosto + pulsante "Carica file" → chiamata `uploadTrainerCertificate` → URL in `certificationsForm.file_url`; stati loading/errore.
  - **Formazione**: stesso pattern per `educationForm.documento_url`.
  - **Media**: "Carica video" (un solo video) e "Aggiungi alla galleria" (max 10 immagini); URL in `media.url_video_presentazione` e `media.galleria_urls`.
  - **Trasformazioni**: due upload "Carica prima" e "Carica dopo" che popolano `prima_dopo_urls` come `{ prima: url, dopo: url }`.

---

## 2. Policy storage (fix RLS)

Le policy originali usavano `profiles WHERE id = auth.uid()` per il ruolo trainer; nel progetto il legame con l’utente è `profiles.user_id = auth.uid()`.

- **Migration `20260236_trainer_storage_policies_user_id.sql`**: tutte le policy sui bucket `trainer-certificates` e `trainer-media` riscritte con `(SELECT role FROM profiles WHERE user_id = auth.uid() LIMIT 1) = 'trainer'`. Da applicare su Supabase per far funzionare l’upload.

---

## 3. RPC e tipi TypeScript

### 3.1 `get_trainer_profile_full(p_profile_id uuid)`

- **Migration `20260233_get_trainer_profile_full.sql`**: funzione che restituisce un unico `jsonb` con profilo esteso:
  - `profile`: riga da `trainer_profiles` per quel `profile_id`;
  - `education`, `certifications`, `courses`, `specializations`, `experience`, `testimonials`, `transformations`: array dalle rispettive tabelle 1:N.
- **Accesso**: solo se chiamante è **admin** (`profiles.user_id = auth.uid() AND role = 'admin'`) oppure **atleta assegnato** (`pt_atleti.pt_id = p_profile_id` e `atleta_id` = profilo dell’utente corrente). Altrimenti ritorno `null`.

### 3.2 `get_my_trainer_profile()` con `pt_id`

- **Migration `20260234_get_my_trainer_profile_pt_id.sql`**: la funzione restituisce anche `pt_id` (prima colonna) oltre a pt_nome, pt_cognome, pt_email, pt_telefono, pt_avatar_url. Necessario per chiamare `get_trainer_profile_full(pt_id)` dalla vista atleta.
- **Migration `20260235_get_my_trainer_profile_profile_id_fallback.sql`**: fallback su `profiles WHERE id = auth.uid()` se non esiste una riga con `user_id = auth.uid()` (compatibilità ambienti dove `profile.id = auth.uid()`).

### 3.3 Tipo TypeScript

- **`src/types/trainer-profile.ts`**: interfaccia `TrainerProfileFull` (profile, education, certifications, courses, specializations, experience, testimonials, transformations) usata per la risposta dell’RPC.

---

## 4. Vista atleta: pagina Profilo trainer

### 4.1 Pagina `/home/trainer` (`src/app/home/trainer/page.tsx`)

- Chiamata `get_my_trainer_profile()` per ottenere dati base e `pt_id`.
- Se presente `pt_id`, chiamata `get_trainer_profile_full(pt_id)` per il profilo esteso.
- **Sezioni mostrate** (solo se ci sono dati):
  - Card principale: avatar, nome, cognome, email, telefono.
  - **Bio**: descrizione breve/estesa, filosofia, perché lavoro, target.
  - **Certificazioni**: per ogni certificazione, testo + anteprima documento (thumbnail immagine o card con icona PDF 24×24).
  - **Specializzazioni**: elenco in card.
  - **Formazione**: titolo, istituto, anno + anteprima documento (thumbnail o icona PDF).
  - **Corsi**: nome, durata, anno.
  - **Esperienza**: struttura, ruolo, date.
  - **Testimonianze**: feedback e nome cliente.
  - **Trasformazioni**: obiettivo, risultato, durata + immagini Prima/Dopo (o array `urls`).
  - **Media**: card “Video presentazione” (icona Video + “Apri video”) e galleria immagini in thumbnail 24×24.

Stile UI: tutte le card di sezione usano `border-teal-500/30`, `shadow-lg shadow-teal-500/10`, overlay `bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5`, contenuto con `relative z-10`.

### 4.2 Card “Il tuo trainer” in overview atleta

- **`src/components/home-profile/athlete-overview-tab.tsx`**: card “Il tuo trainer” con `sm:col-span-2` per occupare tutta la larghezza della griglia (come la card “Lezioni”). Link “Visualizza profilo Trainer” → `/home/trainer`.

---

## 5. Validazione e UX

- **Limiti**: certificati 5 MB; galleria max 10 immagini; video max 100 MB; tipi file controllati lato client (PDF/immagini per certificati; immagini/video per media).
- **Stati**: loading su tutti i pulsanti di upload e sui “Salva”; messaggi di errore sotto i pulsanti e toast; messaggio dedicato in caso di risposta HTML (es. URL Supabase errato).
- **Trasformazioni**: formato `{ prima: url, dopo: url }` supportato in lettura e in salvataggio.

---

## 6. File e migration toccati

| Area              | File |
|-------------------|------|
| Helper upload     | `src/lib/trainer-storage.ts` |
| Tab profilo       | `src/components/settings/settings-trainer-profile-tab.tsx` |
| Vista atleta      | `src/app/home/trainer/page.tsx` |
| Card overview     | `src/components/home-profile/athlete-overview-tab.tsx` |
| Tipi              | `src/types/trainer-profile.ts` (TrainerProfileFull già presente) |
| Migration RPC     | `supabase/migrations/20260233_get_trainer_profile_full.sql` |
| Migration pt_id   | `supabase/migrations/20260234_get_my_trainer_profile_pt_id.sql` |
| Migration fallback| `supabase/migrations/20260235_get_my_trainer_profile_profile_id_fallback.sql` |
| Migration storage | `supabase/migrations/20260236_trainer_storage_policies_user_id.sql` |

---

## 7. Ordine applicazione migration

1. `20260233_get_trainer_profile_full.sql`
2. `20260234_get_my_trainer_profile_pt_id.sql` (richiede `DROP FUNCTION` per cambio tipo ritorno)
3. `20260235_get_my_trainer_profile_profile_id_fallback.sql` (opzionale, se serve fallback `id = auth.uid()`)
4. `20260236_trainer_storage_policies_user_id.sql` (necessaria per upload certificati/documenti da trainer)

Dopo l’applicazione delle migration, verificare che il ruolo trainer in `profiles` sia `'trainer'` (o estendere le policy a `'pt'` se usato).
