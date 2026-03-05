# Logica Supabase nel codice

Documentazione estratta dalle pagine dell’app (scope: file `page.tsx` elencati sotto). Solo lettura ed estrazione, nessuna modifica al codice.

---

## 1) Panoramica

### Dove viene inizializzato Supabase

- **Browser (client):** `src/lib/supabase/client.ts`
  - `createClient()` usa `createBrowserClient` da `@supabase/ssr`.
  - Singleton in browser: un solo client per evitare multipli refresh token.
  - Se env non configurata o mock/bypass (`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`), viene restituito un **mock client** (no chiamate reali).
- **Server (API / RSC):** `src/lib/supabase/server.ts`
  - `createClient(cookieStore?)` usa `createServerClient` con cookies Next.
  - `createAdminClient()` usa service role key (solo API routes, mai in client).
- **Middleware:** `src/lib/supabase/middleware.ts`
  - `createClient(request)` restituisce `{ supabase, response }` per session/redirect.
- **Barrel:** `src/lib/supabase.ts` re-esporta da `./supabase/client` (deprecato: usare `@/lib/supabase/client` o `server`).

Nelle pagine **client** si usa quasi sempre:
- `createClient()` da `@/lib/supabase/client`, oppure
- `useSupabaseClient()` da `@/hooks/use-supabase-client` (ritorna il singleton `supabase` da client.ts).

### Browser vs Server

- **Pagine analizzate:** tutte client (`'use client'`) tranne `privacy` e `termini` (server, senza Supabase).
- Il **data fetching** Supabase avviene in client (useEffect, handler, hook che usa createClient/singleton).
- Le **API route** (fuori scope) usano `createClient()` o `createAdminClient()` da `@/lib/supabase/server`.

### Pattern ricorrenti

- **Client:** `const supabase = createClient()` o `useSupabaseClient()`; query in `useEffect` o in funzioni async (submit, load).
- **Error handling:** spesso `if (error)` + `setError` / `notifyError` / `addToast`; non ovunque try/catch.
- **Loading:** stati `loading`/`setLoading` prima/dopo le chiamate; skeleton o spinner in UI.
- **Redirect/guard:** dopo auth (login/registrati) redirect per ruolo; alcune pagine controllano `user`/`isValidProfile` e mostrano skeleton o redirect a login.

---

## 2) Mappa per pagina

### `/` — `src/app/page.tsx`
- **Tipo uso Supabase:** nessuno.
- **Note:** Solo `router.replace('/login')` in useEffect. Nessuna chiamata Supabase.

---

### `/design-system` — `src/app/design-system/page.tsx`
- **Tipo uso Supabase:** nessuno.
- **Note:** Solo export design system (CSS/React/PDF). Nessuna logica Supabase.

---

### `/forgot-password` — `src/app/forgot-password/page.tsx`
- **Tipo uso Supabase:** nessuno (auth delegata a API).
- **Chiamate:** Nessuna diretta. Richiesta reset password via `fetch('/api/auth/forgot-password')`.
- **Trigger UX:** loading, success, error in stato locale; messaggio success con link a login.

---

### `/home` — `src/app/home/page.tsx`
- **Tipo uso Supabase:** indiretto (hook).
- **Chiamate:** Nessuna diretta nel file. Usa `useInvitiCliente(isAtleta ? profileId : null)` che internamente usa Supabase (inviti/client).
- **Tabelle (da hook):** inviti/collezioni legate a inviti clienti.
- **Trigger UX:** skeleton se `!user || !isValidUser`; wizard inviti se atleta con invitiCount > 0.

---

### `/home/allenamenti` — `src/app/home/allenamenti/page.tsx`
- **Tipo uso Supabase:** DB, RPC.
- **Client:** `useSupabaseClient()`.
- **Chiamate:**
  - `supabase.rpc('get_my_trainer_profile')` per avatar trainer (useEffect).
  - `supabase.from('workout_days').select('id').eq('workout_plan_id', ...).order(...).limit(1).single()` per media “oggi”.
  - `supabase.from('workout_day_exercises').select('exercise_id').eq(...).order(...).limit(1).single()`.
  - `supabase.from('exercises').select('video_url, thumb_url, image_url').eq('id', ...).single()`.
- **Tabelle:** workout_days, workout_day_exercises, exercises (oltre a dati da useAllenamenti / useWorkouts).
- **Operazioni:** select.
- **Trigger UX:** loading skeleton; errori tramite notifyError; refresh su profileId.
- **Note:** useAllenamenti e useWorkouts (hook) gestiscono workout_logs e workout plans; in pagina solo RPC + 3 query per media card “oggi”.

---

### `/home/allenamenti/oggi` — `src/app/home/allenamenti/oggi/page.tsx`
- **Tipo uso Supabase:** DB.
- **Client:** `createClient()` in componente.
- **Chiamate:**
  - `supabase.from('profiles').select(...).eq(...).maybeSingle()` per profilo atleta.
  - `supabase.from('workout_sets').update(payload).eq('id', set.id)` (aggiornamento set).
  - `supabase.from('workout_sets').insert(...)` (nuovi set).
  - `supabase.from('workout_logs').insert(...)` per completamento sessione.
  - `supabase.from('workout_sets').update(...).eq('workout_log_id', ...)` in batch al completamento.
- **Tabelle:** profiles, workout_sets, workout_logs.
- **Operazioni:** select, update, insert.
- **Trigger UX:** loading, completingWorkout, error; toast; uso useWorkoutSession (hook).
- **Note:** Logica pesante in pagina; molte dipendenze da searchParams e stato sessione.

---

### `/home/allenamenti/riepilogo` — `src/app/home/allenamenti/riepilogo/page.tsx`
- **Tipo uso Supabase:** DB.
- **Client:** `createClient()`.
- **Chiamate:**
  - `supabase.from('workout_logs').select(...con relazioni scheda/workout_days/workout_day_exercises/exercises...).eq('id', workoutIdFromParams).eq('atleta_id', ...).eq('stato','completato').single()` oppure stesso select con `.eq('atleta_id', ...).eq('stato','completato').order('data', { ascending: false }).limit(1).maybeSingle()`.
  - `supabase.from('workout_sets').select(...).eq('workout_log_id', ...).order('set_number')`.
- **Tabelle:** workout_logs, workout_plans, workout_days, workout_day_exercises, exercises, workout_sets.
- **Operazioni:** select.
- **Trigger UX:** loading, error, notifyError; redirect a login se non autenticato; messaggio “nessun allenamento completato”.
- **Note:** handleSubmitToPT è simulato (setTimeout), non scrive su DB.

---

### `/home/allenamenti/[id]` — `src/app/home/allenamenti/[id]/page.tsx`
- **Tipo uso Supabase:** DB.
- **Client:** `createClient()` dentro `fetchPlanAndDays`.
- **Chiamate:**
  - `supabase.from('workout_plans').select('id, name, description').eq('id', planId).single()`.
  - `supabase.from('workout_days').select('id, day_number, title, day_name').eq('workout_plan_id', planId).order('day_number')`.
  - `supabase.from('workout_day_exercises').select(...).in('workout_day_id', dayIds).order('order_index')`.
  - `supabase.from('exercises').select(...).in('id', exerciseIds)`.
- **Tabelle:** workout_plans, workout_days, workout_day_exercises, exercises.
- **Operazioni:** select.
- **Trigger UX:** loading, error; guard atleta (isValidProfile + isValidUUID); redirect “Torna agli allenamenti” se non atleta.

---

### `/home/allenamenti/esercizio/[exerciseId]` — `src/app/home/allenamenti/esercizio/[exerciseId]/page.tsx`
- **Tipo uso Supabase:** DB.
- **Client:** `createClient()` in useEffect.
- **Chiamate:** `supabase.from('exercises').select('id, name, description, video_url, thumb_url, image_url, difficulty, equipment, muscle_group').eq('id', exerciseId).single()`.
- **Tabelle:** exercises.
- **Operazioni:** select.
- **Trigger UX:** loading, error; back link con planId se presente.

---

### `/home/appuntamenti` — `src/app/home/appuntamenti/page.tsx`
- **Tipo uso Supabase:** indiretto (hook).
- **Chiamate:** Nessuna diretta. Usa `useAppointments`, `useAthleteCalendarPage` (hook che usano Supabase).
- **Tabelle (da hook):** appointments e relazioni.
- **Trigger UX:** loading skeleton, error, refetch; form/popover per modifica/cancellazione.

---

### `/home/chat` — `src/app/home/chat/page.tsx`
- **Tipo uso Supabase:** DB, RPC.
- **Client:** `useSupabaseClient()`.
- **Chiamate:**
  - `supabase.from('pt_atleti').select(...).eq('atleta_id', user.id).limit(1)` per PT; in alternativa `supabase.rpc('get_my_trainer_profile')`.
  - `supabase.from('staff_atleti').select(...).eq('atleta_id', user.id)` per link staff.
  - `supabase.from('profiles').select(...).in('id', ids)` per nomi/avatar.
- **Tabelle:** pt_atleti, staff_atleti, profiles.
- **RPC:** get_my_trainer_profile.
- **Operazioni:** select.
- **Trigger UX:** loading, error (notifyError); useChat (hook) per messaggi/canali.
- **Note:** Logica messaggi e realtime è nel hook use-chat.

---

### `/home/documenti` — `src/app/home/documenti/page.tsx`
- **Tipo uso Supabase:** indiretto (lib).
- **Chiamate:** Nessuna diretta nel file. Usa `getAllAthleteDocuments(profileId, userId)` da `@/lib/all-athlete-documents` e `uploadDocument` / `validateDocumentFile` da `@/lib/documents` (che usano Supabase e storage).
- **Tabelle/Storage:** documents, athlete_medical_data, athlete_administrative_data, payments (invoice_url); bucket `documents`.
- **Trigger UX:** loading, error/success notify; upload e visualizzazione tramite proxy `/api/document-preview`.

---

### `/home/foto-risultati` — `src/app/home/foto-risultati/page.tsx`
- **Tipo uso Supabase:** DB, Storage.
- **Client:** `createClient()` in handleDelete.
- **Chiamate:**
  - `supabase.storage.from('progress-photos').remove([path])`.
  - `supabase.from('progress_photos').delete().eq('id', photo.id)`.
- **Bucket:** progress-photos.
- **Tabelle:** progress_photos.
- **Operazioni:** delete (DB), remove (storage).
- **Trigger UX:** useProgressPhotos (hook) per lista; deletingId, notify success/error su delete.
- **Note:** Lista foto viene da hook; in pagina solo delete + storage remove.

---

### `/home/foto-risultati/aggiungi` — `src/app/home/foto-risultati/aggiungi/page.tsx`
- **Tipo uso Supabase:** DB, Storage.
- **Client:** `useSupabaseClient()`.
- **Chiamate:**
  - `supabase.from('progress_photos').select('id').eq('profile_id', profileId).eq('date', today).limit(1)` per check esistente.
  - `supabase.from('progress_photos').insert(...)` (inserimento record).
  - `supabase.storage.from(BUCKET).upload(path, file, ...)`.
  - `supabase.storage.from(BUCKET).getPublicUrl(path)`; poi insert in `progress_photos` con url.
- **Bucket:** progress-photos (costante BUCKET).
- **Tabelle:** progress_photos.
- **Operazioni:** select, insert; upload, getPublicUrl.
- **Trigger UX:** loading, notify success/error, redirect dopo successo.

---

### `/home/massaggiatore` — `src/app/home/massaggiatore/page.tsx`
- **Tipo uso Supabase:** indiretto (hook).
- **Chiamate:** Nessuna diretta. Usa `useAthleteMassageStats` (hook).
- **Trigger UX:** LoadingState, ErrorState, guard su user/profile.

---

### `/home/nutrizionista` — `src/app/home/nutrizionista/page.tsx`
- **Tipo uso Supabase:** indiretto (hook).
- **Chiamate:** Nessuna diretta nel file. Contenuto dinamico da componenti/hook (non Supabase in pagina).
- **Trigger UX:** LoadingState, ErrorState, guard.

---

### `/home/pagamenti` — `src/app/home/pagamenti/page.tsx`
- **Tipo uso Supabase:** DB.
- **Client:** `createClient()`.
- **Chiamate:**
  - `supabase.from('profiles').select('id').eq('user_id', user.id).single()` (o simile) per profileId.
  - `supabase.from('payments').select(...).eq('profile_id', profileId).order(...)`.
  - `supabase.from('lesson_counters').select(...).eq('profile_id', profileId)`.
- **Tabelle:** profiles, payments, lesson_counters.
- **Operazioni:** select.
- **Trigger UX:** loading, error; dati mostrati in UI.

---

### `/home/profilo` — `src/app/home/profilo/page.tsx`
- **Tipo uso Supabase:** Auth.
- **Client:** `useSupabaseClient()`.
- **Chiamate:** `supabase.auth.signOut()` in handler; poi `router.push('/login')`.
- **Operazioni:** signOut.
- **Trigger UX:** pulsante logout → signOut + redirect. Resto profilo da AuthProvider/hook.

---

### `/home/progressi` — `src/app/home/progressi/page.tsx`
- **Tipo uso Supabase:** nessuno.
- **Note:** Solo link alle sotto-pagine (misurazioni, allenamenti, storico, foto). Nessuna chiamata Supabase.

---

### `/home/progressi/allenamenti` — `src/app/home/progressi/allenamenti/page.tsx`
- **Tipo uso Supabase:** indiretto (hook).
- **Chiamate:** Nessuna diretta. Usa `useWorkoutExerciseStats(athleteUserId)`.
- **Trigger UX:** loading, redirect se non autenticato; grafici da componente dinamico.

---

### `/home/progressi/foto` — `src/app/home/progressi/foto/page.tsx`
- **Tipo uso Supabase:** Storage (signed URL).
- **Client:** `useSupabaseClient()`.
- **Chiamate:** `supabase.storage.from('progress-photos').createSignedUrl(path, 3600)` per visualizzare foto.
- **Bucket:** progress-photos.
- **Operazioni:** createSignedUrl (lettura).
- **Trigger UX:** notify su errore; lista/url da stato/hook.

---

### `/home/progressi/misurazioni` — `src/app/home/progressi/misurazioni/page.tsx`
- **Tipo uso Supabase:** indiretto (hook).
- **Chiamate:** Nessuna diretta. Usa `useProgressAnalytics` (hook).
- **Trigger UX:** redirect se non autenticato; RangeStatusMeter e KPI da hook.

---

### `/home/progressi/nuovo` — `src/app/home/progressi/nuovo/page.tsx`
- **Tipo uso Supabase:** Auth, DB.
- **Client:** `createClient()`.
- **Chiamate:**
  - `supabase.auth.getUser()` per user_id/profile.
  - `supabase.from('profiles').select(...).eq('user_id', ...).single()` (o maybeSingle).
  - `supabase.from('progress_logs').select(...)` per ultima misurazione (opzionale).
  - `supabase.from('progress_logs').insert(...)` al submit.
- **Tabelle:** profiles, progress_logs.
- **Operazioni:** select, insert.
- **Trigger UX:** loading, error; form con validazione.

---

### `/home/progressi/storico` — `src/app/home/progressi/storico/page.tsx`
- **Tipo uso Supabase:** Auth, DB.
- **Client:** `createClient()` in useEffect.
- **Chiamate:**
  - `supabase.auth.getUser()`.
  - `supabase.from('profiles').select('id').eq('user_id', user.id).single()` per profile id.
  - `supabase.from('workout_logs').select(...).eq('atleta_id', profileId).order(...)` (con filtri).
- **Tabelle:** profiles, workout_logs.
- **Operazioni:** select.
- **Trigger UX:** loading, error; lista storico.

---

### `/home/trainer` — `src/app/home/trainer/page.tsx`
- **Tipo uso Supabase:** RPC.
- **Client:** `useSupabaseClient()`.
- **Chiamate:**
  - `supabase.rpc('get_my_trainer_profile')` per PT assegnato.
  - `supabase.rpc('get_trainer_profile_full', { p_profile_id: trainer.pt_id })` per dettaglio PT.
- **RPC:** get_my_trainer_profile, get_trainer_profile_full.
- **Operazioni:** rpc (lettura).
- **Trigger UX:** loading, error; card con dati trainer.

---

### `/login` — `src/app/login/page.tsx`
- **Tipo uso Supabase:** Auth, DB.
- **Client:** `useMemo(() => createClient(), [])`.
- **Chiamate:**
  - `supabase.auth.signInWithPassword({ email, password })`.
  - `supabase.from('profiles').select('role, org_id, first_login').eq('user_id', data.user.id).single()` dopo login.
- **Tabelle:** profiles.
- **Operazioni:** signIn (auth), select.
- **Trigger UX:** loading, error, validation; rate limit tentativi; redirect per ruolo (performPostLoginRedirect); fallback a `/post-login` su errore profilo.

---

### `/post-login` — `src/app/post-login/page.tsx`
- **Tipo uso Supabase:** nessuno diretto.
- **Note:** Usa solo `useAuth()` (AuthProvider); redirect in base a role. Nessuna chiamata Supabase nel file.

---

### `/privacy` — `src/app/privacy/page.tsx`
- **Tipo uso Supabase:** nessuno.
- **Note:** Pagina statica (metadata, link, accordion). Server component, nessun client Supabase.

---

### `/registrati` — `src/app/registrati/page.tsx`
- **Tipo uso Supabase:** Auth, DB.
- **Client:** `createClient()`.
- **Chiamate:**
  - `supabase.auth.signUp({ email, password, options: { data: { nome, cognome, role, org_id } } })`.
  - `supabase.from('profiles').select('id').eq('user_id', authData.user.id).single()` per verificare profilo esistente.
  - Poi `fetch('/api/register/complete-profile', ...)` per completare profilo/invito.
- **Tabelle:** profiles (lettura per check).
- **Operazioni:** signUp, select.
- **Trigger UX:** loading, error; redirect dopo successo; gestione codice invito.

---

### `/reset` — `src/app/reset/page.tsx`
- **Tipo uso Supabase:** nessuno.
- **Chiamate:** `fetch('/api/auth/forgot-password', ...)` (come forgot-password).
- **Trigger UX:** loading, success, error.

---

### `/reset-password` — `src/app/reset-password/page.tsx`
- **Tipo uso Supabase:** Auth.
- **Client:** `createClient()`.
- **Chiamate:**
  - `supabase.auth.getUser()` (anche retry e dopo refresh).
  - `supabase.auth.onAuthStateChange(...)` per gestire session.
  - `supabase.auth.refreshSession()`.
  - `supabase.auth.updateUser({ password })` per nuova password.
- **Operazioni:** getUser, onAuthStateChange, refreshSession, updateUser.
- **Trigger UX:** loading, error, gestione token/hash in URL; redirect dopo successo.

---

### `/termini` — `src/app/termini/page.tsx`
- **Tipo uso Supabase:** nessuno.
- **Note:** Pagina statica (metadata, accordion). Server component.

---

### `/welcome` — `src/app/welcome/page.tsx`
- **Tipo uso Supabase:** DB, RPC.
- **Client:** `createClient()` a livello modulo; cast a `supabaseExt` per `.from()`/`.rpc()` tipizzati.
- **Chiamate:**
  - `supabase.from('profiles').select('*').eq('user_id', authUserId).maybeSingle()`.
  - `supabaseExt.rpc('get_my_trainer_profile')`.
  - `supabaseExt.from('athlete_questionnaires').select('anamnesi, manleva, liberatoria_media').eq('athlete_id', row.id).eq('version', ...).maybeSingle()`.
  - `supabase.from('profiles').update(payload).eq('user_id', authUserId)` (save step).
  - `supabaseExt.from('athlete_questionnaires').upsert(fullPayload, { onConflict: 'athlete_id,version' })`.
  - `supabase.from('profiles').update(profileUpdates).eq('user_id', authUserId)` (post-questionnaire).
- **Tabelle:** profiles, athlete_questionnaires.
- **RPC:** get_my_trainer_profile.
- **Operazioni:** select, update, upsert.
- **Trigger UX:** loading, stepError, setCompleteError; wizard multi-step onboarding.

---

### `/dashboard` — `src/app/dashboard/page.tsx`
- **Tipo uso Supabase:** DB.
- **Client:** `useMemo(() => createClient(), [])`; `fetchTodayAgenda(supabase)` riceve il client.
- **Chiamate:** `supabaseClient.from('appointments').select(...)` (in fetchTodayAgenda: appuntamenti oggi).
- **Tabelle:** appointments.
- **Operazioni:** select.
- **Trigger UX:** loading; agenda oggi in dashboard.

---

### `/dashboard/abbonamenti` — `src/app/dashboard/abbonamenti/page.tsx`
- **Tipo uso Supabase:** DB, Storage, RPC (custom).
- **Client:** `createClient()`; anche `supabaseRef = useRef(createClient())` per stabilità in loadAbbonamenti.
- **Chiamate:**
  - `supabase.storage.from('documents').createSignedUrl(...)` per URL signed documenti.
  - RPC custom (nome non standard) per dati abbonamenti; fallback a `lesson_counters` e `credit_ledger`.
  - `supabase.from('payments').select(...)` con filtri e possibili join a profiles/lesson_counters/credit_ledger.
  - `supabase.storage.from('documents').upload(...)` upload file.
  - `supabase.from('payments').update(...)` aggiornamento pagamento (es. allegato).
  - `supabase.from('profiles').select('id, nome, cognome').in('id', athleteIds)`.
  - `supabase.from('payments').update(...)` per stato/note.
- **Tabelle:** payments, profiles, lesson_counters, credit_ledger.
- **Bucket:** documents (signed URL, upload).
- **Operazioni:** select, update; storage upload, createSignedUrl.
- **Trigger UX:** loading, addToast; gestione filtri e tabella pagamenti.

---

### `/dashboard/allenamenti` — `src/app/dashboard/allenamenti/page.tsx`
- **Tipo uso Supabase:** indiretto (hook).
- **Chiamate:** Nessuna diretta nel file. Lista/gestione allenamenti tramite hook (useAppointments / useWorkouts o simili).
- **Trigger UX:** LoadingState, eventuali modali.

---

### `/dashboard/appuntamenti` — `src/app/dashboard/appuntamenti/page.tsx`
- **Tipo uso Supabase:** indiretto (hook).
- **Chiamate:** Nessuna diretta. Usa `useAppointments` (e simile) con `org_id` da useAuth.
- **Tabelle (da hook):** appointments.
- **Trigger UX:** loading, modali modifica/dettaglio.

---

### `/dashboard/atleti/[id]` — `src/app/dashboard/atleti/[id]/page.tsx`
- **Tipo uso Supabase:** indiretto (hook).
- **Chiamate:** Nessuna diretta. Usa `useAthleteProfileData(id)` per atleta e statistiche.
- **Trigger UX:** LoadingState, ErrorState, tab profilo; modale modifica.

---

### `/dashboard/calendario` — `src/app/dashboard/calendario/page.tsx`
- **Tipo uso Supabase:** indiretto (hook/componenti).
- **Chiamate:** Nessuna diretta nel file (solo Array.from per UI). Dati calendario da hook/context.
- **Trigger UX:** vista calendario, eventuali modali.

---

### `/dashboard/chat` — `src/app/dashboard/chat/page.tsx`
- **Tipo uso Supabase:** DB.
- **Client:** `supabase` da `@/lib/supabase` (singleton).
- **Chiamate:** `supabase.from('profiles').select('id, nome, cognome, role, avatar').eq('id', withParam).maybeSingle()` per partecipante da query `?with=`.
- **Tabelle:** profiles.
- **Operazioni:** select.
- **Trigger UX:** setRequestedParticipant; useChat per messaggi.

---

### `/dashboard/clienti` — `src/app/dashboard/clienti/page.tsx`
- **Tipo uso Supabase:** indiretto (hook).
- **Chiamate:** Nessuna diretta. Usa useClienti, useClientiPermissions, useLessonCounters, useInvitiClientePendentiStaff, deleteCliente (da hook/lib).
- **Trigger UX:** KPI, tabella, filtri, bulk delete, modali crea/invita/modifica.

---

### `/dashboard/comunicazioni` — `src/app/dashboard/comunicazioni/page.tsx`
- **Tipo uso Supabase:** indiretto (hook/API).
- **Chiamate:** Nessuna diretta nel file (da verificare in componenti/hook).
- **Trigger UX:** loading, invio comunicazioni.

---

### `/dashboard/documenti` — `src/app/dashboard/documenti/page.tsx`
- **Tipo uso Supabase:** DB.
- **Client:** `createClient()` dentro useEffect loadDocuments.
- **Chiamate:** `supabase.from('documents').select('*').order('created_at', { ascending: false })`.
- **Tabelle:** documents.
- **Operazioni:** select.
- **Trigger UX:** loading, addToast su errore; filtri con useDocumentsFilters; drawer/dettaglio, mark invalid (solo stato locale in questo file).

---

### `/dashboard/esercizi` — `src/app/dashboard/esercizi/page.tsx`
- **Tipo uso Supabase:** DB.
- **Client:** `supabase` da `@/lib/supabase/client` (singleton).
- **Chiamate:**
  - `supabase.from('exercises').select(...)` con filtri (search, muscle group, equipment).
  - `supabase.from('exercises').delete().eq('id', exerciseToDelete.id)`.
- **Tabelle:** exercises.
- **Operazioni:** select, delete.
- **Trigger UX:** loading, addToast, ConfirmDialog per delete; filtri e tabella.

---

### `/dashboard/impostazioni` — `src/app/dashboard/impostazioni/page.tsx`
- **Tipo uso Supabase:** DB, Auth.
- **Client:** `useMemo(() => createClient(), [])`.
- **Chiamate:**
  - `supabase.from('profiles').update(payload).eq('id', profile.id)` per aggiornamento profilo.
  - `supabase.auth.updateUser({ password: passwords.new })` per cambio password.
- **Tabelle:** profiles.
- **Operazioni:** update (profiles), updateUser (password).
- **Trigger UX:** notify success/error; form profilo e form password.

---

### `/dashboard/invita-atleta` — `src/app/dashboard/invita-atleta/page.tsx`
- **Tipo uso Supabase:** indiretto (bulk delete).
- **Chiamate:** Nessuna diretta. `bulkDeleteInvitations(Array.from(selectedIds))` (funzione/hook che usa Supabase).
- **Trigger UX:** lista inviti, selezione, bulk delete, skeleton.

---

### `/dashboard/massaggiatore` — `src/app/dashboard/massaggiatore/page.tsx`
- **Tipo uso Supabase:** indiretto (hook/componenti).
- **Chiamate:** Nessuna diretta nel file.
- **Trigger UX:** layout staff massaggiatore.

---

### `/dashboard/nutrizionista` — `src/app/dashboard/nutrizionista/page.tsx`
- **Tipo uso Supabase:** indiretto (hook/componenti).
- **Chiamate:** Nessuna dirette nel file.
- **Trigger UX:** layout staff nutrizionista.

---

### `/dashboard/pagamenti` — `src/app/dashboard/pagamenti/page.tsx`
- **Tipo uso Supabase:** indiretto (hook).
- **Chiamate:** Nessuna dirette nel file. Gestione pagamenti tramite hook/componenti.
- **Trigger UX:** loading, tabella pagamenti.

---

### `/dashboard/profilo` — `src/app/dashboard/profilo/page.tsx`
- **Tipo uso Supabase:** indiretto (hook/componenti).
- **Chiamate:** Nessuna dirette nel file. useSettingsProfile o simile per dati profilo.
- **Trigger UX:** form profilo staff.

---

### `/dashboard/schede` — `src/app/dashboard/schede/page.tsx`
- **Tipo uso Supabase:** indiretto (hook).
- **Chiamate:** Nessuna dirette nel file.
- **Trigger UX:** lista schede, link a nuova/modifica.

---

### `/dashboard/schede/nuova` — `src/app/dashboard/schede/nuova/page.tsx`
- **Tipo uso Supabase:** indiretto (hook/componenti).
- **Chiamate:** Nessuna dirette nel file.
- **Trigger UX:** form creazione scheda.

---

### `/dashboard/schede/[id]/modifica` — `src/app/dashboard/schede/[id]/modifica/page.tsx`
- **Tipo uso Supabase:** indiretto (hook/componenti).
- **Chiamate:** Nessuna dirette nel file.
- **Trigger UX:** form modifica scheda.

---

### `/dashboard/statistiche` — `src/app/dashboard/statistiche/page.tsx`
- **Tipo uso Supabase:** DB.
- **Client:** `createClient()`; funzione `getAnalyticsDataClient(supabase, org_id)` con query interne.
- **Chiamate (in getAnalyticsDataClient):**
  - `supabase.from('workout_logs').select(...)` per trend e dati workout.
  - `supabase.from('documents').select(...)` per documenti.
  - `supabase.from('workout_logs').select(...)` per performance/aggregati.
- **Tabelle:** workout_logs, documents.
- **Operazioni:** select.
- **Trigger UX:** loading; grafici/analytics da getAnalyticsDataClient.

---

### `/dashboard/admin` — `src/app/dashboard/admin/page.tsx`
- **Tipo uso Supabase:** indiretto (componenti).
- **Chiamate:** Nessuna dirette nel file. Contenuto da admin-dashboard-content (che può usare createClient).
- **Trigger UX:** overview admin.

---

### `/dashboard/admin/organizzazioni` — `src/app/dashboard/admin/organizzazioni/page.tsx`
- **Tipo uso Supabase:** indiretto (componenti).
- **Chiamate:** Nessuna dirette nel file (admin-organizations-content usa createClient).
- **Trigger UX:** gestione organizzazioni.

---

### `/dashboard/admin/ruoli` — `src/app/dashboard/admin/ruoli/page.tsx`
- **Tipo uso Supabase:** indiretto (API/hook).
- **Chiamate:** Nessuna dirette nel file.
- **Trigger UX:** gestione ruoli.

---

### `/dashboard/admin/statistiche` — `src/app/dashboard/admin/statistiche/page.tsx`
- **Tipo uso Supabase:** indiretto (API/hook).
- **Chiamate:** Nessuna dirette nel file.
- **Trigger UX:** statistiche admin.

---

### `/dashboard/admin/utenti` — `src/app/dashboard/admin/utenti/page.tsx`
- **Tipo uso Supabase:** indiretto (API/hook).
- **Chiamate:** Nessuna dirette nel file.
- **Trigger UX:** gestione utenti.

---

## 3) Indice Tabelle / Storage / Canali / RPC

### Tabelle usate (da pagine e hook richiamati in pagina)

- **profiles** — login, registrati, welcome, post-login (via auth), home/profilo (auth), home/pagamenti, home/chat, home/trainer (via RPC), home/allenamenti/oggi, dashboard (impostazioni, abbonamenti, chat), reset-password (auth)
- **workout_logs** — home/allenamenti (hook), home/allenamenti/oggi, home/allenamenti/riepilogo, home/progressi/storico, dashboard/statistiche
- **workout_plans** — home/allenamenti (hook), home/allenamenti/[id], home/allenamenti/riepilogo
- **workout_days** — home/allenamenti, home/allenamenti/[id], home/allenamenti/riepilogo
- **workout_day_exercises** — home/allenamenti, home/allenamenti/[id], home/allenamenti/riepilogo
- **workout_sets** — home/allenamenti/oggi, home/allenamenti/riepilogo
- **exercises** — home/allenamenti, home/allenamenti/[id], home/allenamenti/esercizio/[exerciseId], dashboard/esercizi
- **progress_photos** — home/foto-risultati, home/foto-risultati/aggiungi, home/progressi/foto (storage)
- **progress_logs** — home/progressi/nuovo
- **documents** — home/documenti (lib), dashboard/documenti, dashboard/abbonamenti (storage + payments), dashboard/statistiche
- **payments** — home/pagamenti, dashboard/abbonamenti
- **lesson_counters** — home/pagamenti, dashboard/abbonamenti
- **credit_ledger** — dashboard/abbonamenti
- **appointments** — dashboard, dashboard/appuntamenti (hook), home/appuntamenti (hook)
- **pt_atleti** — home/chat
- **staff_atleti** — home/chat
- **athlete_questionnaires** — welcome
- **invitations** (o simile) — home (useInvitiCliente), dashboard/invita-atleta

### Bucket Storage

- **progress-photos** — home/foto-risultati (remove), home/foto-risultati/aggiungi (upload, getPublicUrl), home/progressi/foto (createSignedUrl)
- **documents** — dashboard/abbonamenti (createSignedUrl, upload); home/documenti (lib, proxy preview)

### Canali Realtime

- Nessun canale realtime sottoscritto direttamente nei file `page.tsx` analizzati. La chat usa il hook use-chat che può usare canali realtime per messaggi (non analizzato in dettaglio nello scope).

### RPC

- **get_my_trainer_profile** — home/allenamenti, home/chat, home/trainer, welcome
- **get_trainer_profile_full** — home/trainer (con argomento `p_profile_id`)
- RPC custom (abbonamenti) — dashboard/abbonamenti (nome non standard in codice)

---

## 4) Problemi e miglioramenti (solo suggerimenti, non applicati)

1. **Deduplicazione client e dipendenze**
   - **Problema:** In diverse pagine si usa `createClient()` più volte (in callback/useEffect) o si passa `supabase` nelle dependency array causando ri-run.
   - **Suggerimento:** Preferire ovunque `useSupabaseClient()` (singleton) e non mettere `supabase` in dependency se non necessario.
   - **Impatto:** Meno istanze, meno risk di loop. **Complessità:** bassa. **Rischio:** basso.

2. **Try/catch e gestione errori**
   - **Problema:** Alcune query (es. home/allenamenti/oggi, riepilogo) hanno try/catch; altre solo `if (error)` senza try/catch attorno alla promise.
   - **Suggerimento:** Wrapper uniforme (es. helper che fa .then().catch() o async/await in try/catch) e sempre notifica utente su errore.
   - **Impatto:** UX e debug migliori. **Complessità:** media. **Rischio:** basso.

3. **Fetch in render / useEffect senza cancel**
   - **Problema:** In varie pagine il fetch è in useEffect con `let cancelled = false` e cleanup; in altre manca cleanup su unmount.
   - **Suggerimento:** Pattern unificato: `let cancelled = false` in useEffect, check `if (cancelled) return` prima di setState, return `() => { cancelled = true }`.
   - **Impatto:** Evita setState su componenti smontati. **Complessità:** bassa. **Rischio:** medio se non fatto.

4. **Query duplicate (workout_logs, profiles)**
   - **Problema:** Stesse tabelle (es. workout_logs, profiles) interrogate da più hook/pagine con filtri simili; possibile sovrapposizione (es. home/allenamenti + useAllenamenti + fetch media “oggi”).
   - **Suggerimento:** Centralizzare in hook con cache/key (es. React Query o SWR) o un solo “data loader” per route.
   - **Impatto:** Meno chiamate, caricamento più prevedibile. **Complessità:** media-alta. **Rischio:** medio (refactor hook).

5. **Riepilogo allenamento: “Invia al PT” simulato**
   - **Problema:** handleSubmitToPT in home/allenamenti/riepilogo fa solo `setTimeout` e non persiste nulla su DB.
   - **Suggerimento:** Se l’azione deve essere reale, implementare insert/update (es. notifica, flag, o tabella “invii”) e rimuovere la simulazione.
   - **Impatto:** Allineamento comportamento reale con UX. **Complessità:** bassa. **Rischio:** basso.

6. **Storage: path e policy**
   - **Problema:** Uso di bucket `progress-photos` e `documents` con path costruiti in client; dipendenza da RLS/policy corrette.
   - **Suggerimento:** Documentare in un unico posto path e policy; considerare helper centralizzati per path (es. `getStoragePathFromProgressPhotoUrl` già usato) e verificare policy per upload/delete.
   - **Impatto:** Sicurezza e manutenzione. **Complessità:** bassa. **Rischio:** medio se policy incomplete.

7. **Welcome: client a livello modulo**
   - **Problema:** In welcome `const supabase = createClient()` a livello modulo può in SSR/edge creare client non desiderato (pagina è client, ma il modulo può essere valutato in contesti diversi).
   - **Suggerimento:** Usare `useSupabaseClient()` o `createClient()` dentro component/hook per coerenza con le altre pagine.
   - **Impatto:** Coerenza e meno rischi in SSR. **Complessità:** bassa. **Rischio:** basso.

8. **Dashboard abbonamenti: RPC e fallback**
   - **Problema:** Uso di RPC “custom” con fallback su lesson_counters/credit_ledger; logica complessa e dipendenze da supabaseRef.
   - **Suggerimento:** Estrarre la logica in un hook dedicato (es. useAbbonamenti) con interfaccia chiara e test; documentare nome RPC e schema risposta.
   - **Impatto:** Manutenibilità e test. **Complessità:** media. **Rischio:** medio.

9. **Caching e invalidazione**
   - **Problema:** Nessun layer di cache esplicito; ogni mount/refresh rifà le stesse query.
   - **Suggerimento:** Introdurre cache (React Query, SWR o simile) per liste critiche (documenti, payments, workout_logs) con invalidazione su mutate.
   - **Impatto:** Performance e UX. **Complessità:** media-alta. **Rischio:** medio.

10. **Controlli ruolo e guard**
    - **Problema:** Guard atleta/staff sono fatte con `isValidProfile`/`isValidUUID` e redirect; non c’è un middleware unico che documenti tutte le route protette.
    - **Suggerimento:** Documentare in un unico punto (o in un middleware) le route per ruolo (athlete vs staff vs admin) e le guard usate in pagina per coerenza.
    - **Impatto:** Sicurezza e onboarding. **Complessità:** bassa. **Rischio:** basso.

---

*Documento generato per scope: solo file `page.tsx` elencati nella richiesta. Nessuna modifica applicata al codice.*
