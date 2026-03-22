# Checklist test manuali – Ruolo Marketing end-to-end

## Pre-requisiti

- Migration `20260228000000_marketing_role_setup.sql` eseguita su Supabase.
- Ruolo `marketing` presente in `profiles_role_check` e in `roles`.

---

## 1) DB e constraint

- [ ] `profiles.role` accetta il valore `'marketing'` (INSERT con role='marketing' non fallisce).
- [ ] Tabella `roles` contiene la riga `('marketing', 'Marketing - accesso solo KPI aggregati')`.
- [ ] Funzione `get_current_user_role()` restituisce `'marketing'` per un utente con `profiles.role = 'marketing'`.
- [ ] Funzione `is_marketing()` restituisce `true` per utente marketing, `false` per altri.
- [ ] RPC `get_athlete_marketing_metrics()` eseguibile da utente autenticato; restituisce righe solo se ruolo è admin o marketing.

---

## 2) Creazione utente marketing (Admin)

- [ ] Login come **admin**.
- [ ] Da Dashboard Admin aprire **Crea utente Marketing** (card o link).
- [ ] Inserire email `marketing@22club.it`, password `123456`, nome/cognome, org_id (opzionale).
- [ ] Submit: risposta `{ success: true, user_id, profile_id }`, messaggio di successo in UI.
- [ ] Verificare in Supabase (Auth + `profiles`) che l’utente esista con `role = 'marketing'`, `stato = 'attivo'`.

---

## 3) Login e redirect Marketing

- [ ] Logout da admin.
- [ ] Login con **marketing@22club.it** / **123456**.
- [ ] Apertura di `/dashboard` → redirect a `/dashboard/marketing`.
- [ ] Pagina KPI marketing caricata (card totali, solo, coached, % coached, ultimo allenamento; tabella atleti con nome/cognome/email).
- [ ] Tentativo di aprire `/dashboard/admin` → redirect a `/dashboard/marketing` (o 403).
- [ ] Sidebar/mobile nav: solo voci Dashboard (Marketing), Profilo, Impostazioni, Logout.

---

## 4) Profilo e impostazioni Marketing

- [ ] Da `/dashboard/marketing` aprire **Profilo** → `/dashboard/profilo` accessibile, dati corretti (nome, cognome, email, role).
- [ ] Aprire **Impostazioni** → `/dashboard/impostazioni` accessibile.

---

## 5) Visibilità ruoli (non marketing)

- [ ] Login come **atleta** o **trainer** o **nutrizionista** o **massaggiatore**: in sidebar/nav **non** compare la voce “Marketing” o “KPI Marketing”.
- [ ] Accesso diretto a `/dashboard/marketing` (con ruolo non marketing) → redirect alla propria dashboard o 403.

---

## 6) API

- [ ] **GET /api/marketing/kpi** con sessione **marketing** → 200, body `{ data: [...] }` (array con almeno `athlete_id`, counts, `nome`, `cognome`, `email`).
- [ ] **GET /api/marketing/kpi** con sessione **trainer** (o atleta) → 403.
- [ ] **GET /api/marketing/kpi** senza sessione → 401.
- [ ] **POST /api/admin/users/marketing** con sessione **admin** → 200 e utente creato.
- [ ] **POST /api/admin/users/marketing** con sessione **trainer** (o marketing) → 403.

---

## 7) JWT e sicurezza

- [ ] Dopo login marketing, in DevTools (Application / Storage) o da `getSession()`: in `user.app_metadata` o custom claims sono presenti `role: 'marketing'` e `org_id` (se impostato).
- [ ] Nessuna query client-side diretta a `workout_logs` o alla view `athlete_marketing_metrics`: la dashboard marketing usa solo `fetch('/api/marketing/kpi')`.

---

## 8) UX e stile

- [ ] KPI in card leggibili (Apple-like dark), tabella ordinata per “Ultimo” (last_workout_at desc).
- [ ] Tabella atleti mostra: Atleta (nome/cognome), Email, Totale, Solo, Con trainer, Ultimo.
- [ ] Gestione errori: 401 → redirect a `/login`; 403 → redirect a `/dashboard` o `/dashboard/marketing`; messaggi chiari in caso di errore API.

---

## Seed rapido (dev)

Per creare velocemente un utente marketing di test:

- Usare la pagina **Crea utente Marketing** da admin con email `marketing@22club.it` e password `123456`, oppure
- Chiamare (solo in dev) `POST /api/admin/users/marketing` con body `{ "email": "marketing@22club.it", "password": "123456", "nome": "Marketing", "cognome": "Test" }` con sessione admin.
