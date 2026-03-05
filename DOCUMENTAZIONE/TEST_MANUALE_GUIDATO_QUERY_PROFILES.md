# 🧪 Test Manuale Guidato - Query a `profiles`

**Obiettivo:** Contare quante query reali a `profiles` avvengono in 3 scenari: A (Login), B (Refresh), C (Multi-tab).

**⚠️ IMPORTANTE:** Questo è un test MANUALE guidato. NON viene modificato codice. Solo istruzioni operative.

---

## 📋 PREPARAZIONE (Obbligatoria)

### 1. Avvia Progetto

Apri terminale e avvia il server:

```bash
npm run dev
```

Attendi che il server sia avviato (dovresti vedere "Ready" nel terminale).

---

### 2. Apri Browser in Modalità Incognito

- **Chrome:** `Ctrl+Shift+N` (Windows) o `Cmd+Shift+N` (Mac)
- **Firefox:** `Ctrl+Shift+P` (Windows) o `Cmd+Shift+P` (Mac)
- **Edge:** `Ctrl+Shift+N` (Windows) o `Cmd+Shift+N` (Mac)

**Motivo:** Parti pulito, senza cache/cookie residui.

---

### 3. Configura DevTools

#### A. Apri DevTools

- **Chrome/Edge:** `F12` o `Ctrl+Shift+I` (Windows) o `Cmd+Option+I` (Mac)
- **Firefox:** `F12` o `Ctrl+Shift+I` (Windows) o `Cmd+Option+I` (Mac)

#### B. Tab Network

1. Clicca sul tab **"Network"**
2. Spunta **"Preserve log"** (mantiene log durante redirect)
3. Spunta **"Disable cache"** (forza richieste fresche)
4. Nella barra di ricerca Network, scrivi: **`profiles`**
   - Questo filtra solo le richieste a `profiles`
   - Dovresti vedere: `Filter: profiles` nella barra

#### C. Tab Console (Opzionale ma Consigliato)

1. Clicca sul tab **"Console"**
2. Nella barra di ricerca Console, scrivi: **`[profiles]`**
   - Questo filtra solo i log `[profiles]`
   - Vedrai i log aggiuntivi che abbiamo aggiunto

---

## 🔐 SCENARIO A — LOGIN COMPLETO

**Obiettivo:** Contare query `profiles` durante login completo (da `/login` a `/dashboard` o `/home`).

### Procedura per ogni Ruolo

Ripeti questa procedura **3 volte** (una per Trainer, una per Admin, una per Athlete):

#### Step 1: Preparazione

1. Vai su `/login`
2. Nel DevTools → Network, clicca il pulsante **"Clear"** (icona cestino) per pulire il log
3. Assicurati che il filtro `profiles` sia attivo

#### Step 2: Login

1. **Trainer:**
   - Email: `b.francesco@22club.it`
   - Password: `FrancescoB`
   
2. **Admin:**
   - Email: `admin@22club.it`
   - Password: `adminadmin`
   
3. **Athlete:**
   - Email: `dima.kushniriuk@gmail.com`
   - Password: `Ivan123`

Clicca **"Login"** e attendi il redirect completo:
- Trainer → `/dashboard`
- Admin → `/dashboard/admin`
- Athlete → `/home`

#### Step 3: Attendi Caricamento Completo

- Aspetta che la pagina sia completamente caricata (no spinner, no loading)
- **NON cliccare altre pagine** o navigare

#### Step 4: Conta e Raccogli Dati

1. **Conta quante richieste "profiles"** appaiono nel Network tab
   - Dovrebbero essere tutte visibili se il filtro `profiles` è attivo
   - Conta le righe nella tabella Network

2. **Copia URL delle richieste:**
   - Per ogni richiesta `profiles`, fai **Right-click** sulla riga
   - Seleziona **"Copy" → "Copy link address"** (o "Copy URL" in alcuni browser)
   - Incolla gli URL nel report (vedi template sotto)

3. **Copia log Console `[profiles]` (se presenti):**
   - Nel tab Console (filtrato `[profiles]`), seleziona tutti i log
   - **Right-click → Copy** (o `Ctrl+C` / `Cmd+C`)
   - Incolla nel report

4. **Screenshot Network (Opzionale ma Consigliato):**
   - Assicurati che il Network tab sia visibile con tutte le richieste `profiles`
   - Premi `Windows+Shift+S` (Windows) o `Cmd+Shift+4` (Mac) per screenshot
   - Salva lo screenshot con nome: `scenario-a-trainer.png`, `scenario-a-admin.png`, `scenario-a-athlete.png`

---

## 🔄 SCENARIO B — REFRESH PAGINA (F5)

**Obiettivo:** Contare query `profiles` dopo refresh (F5) sulla pagina finale.

### Procedura per ogni Ruolo

Ripeti questa procedura per ogni ruolo (Trainer, Admin, Athlete) se possibile, altrimenti indica quale ruolo stai testando.

#### Step 1: Preparazione

1. **Sei già su `/dashboard` (trainer/admin) o `/home` (athlete)** dopo login
2. Nel DevTools → Network, clicca **"Clear"** per pulire il log
3. Assicurati che il filtro `profiles` sia attivo

#### Step 2: Refresh

1. Premi **F5** (o `Ctrl+R` / `Cmd+R`)
2. Attendi che la pagina sia completamente caricata (no spinner, no loading)

#### Step 3: Conta e Raccogli Dati

1. **Conta quante richieste "profiles"** appaiono nel Network tab
2. **Copia URL delle richieste** (stessa procedura Scenario A)
3. **Copia log Console `[profiles]`** (se presenti)
4. **Screenshot Network (Opzionale):**
   - Salva con nome: `scenario-b-trainer.png`, `scenario-b-admin.png`, `scenario-b-athlete.png`

---

## 🪟 SCENARIO C — MULTI-TAB

**Obiettivo:** Verificare comportamento multi-tab e logout.

### Procedura

#### Step 1: Preparazione Tab A e Tab B

1. **Apri Tab A e Tab B** nella stessa finestra del browser (NON finestre separate)
   - Tab A: nuova tab (`Ctrl+T` / `Cmd+T`)
   - Tab B: nuova tab (`Ctrl+T` / `Cmd+T`)
   
2. **Tab A:**
   - Vai su `/login`
   - Nel DevTools → Network, clicca **"Clear"**
   - Assicurati che il filtro `profiles` sia attivo

#### Step 2: Login Tab A

1. In **Tab A**, fai login (usa uno dei ruoli: Trainer, Admin, o Athlete)
2. Attendi redirect a `/dashboard` o `/home`
3. **NOTA:** Conta quante query `profiles` in Tab A (se vuoi, ma non è obbligatorio per questo scenario)

#### Step 3: Refresh Tab B

1. In **Tab B:**
   - Vai direttamente su `/dashboard` o `/home` (dovrebbe essere già autenticato perché condividono cookie sessione)
   - Nel DevTools → Network (Tab B), clicca **"Clear"**
   - Assicurati che il filtro `profiles` sia attivo
   
2. Premi **F5** (refresh) in Tab B
3. Attendi caricamento completo

4. **Conta quante richieste "profiles"** in Tab B
5. **Copia URL delle richieste** (stessa procedura Scenario A)

#### Step 4: Logout Tab A e Verifica Tab B

1. In **Tab A:**
   - Fai logout (clicca su logout/profilo → logout)
   
2. In **Tab B:**
   - Nel DevTools → Network (Tab B), **NON fare Clear** (mantieni log precedente)
   - Osserva se compaiono nuove richieste `profiles` dopo il logout di Tab A
   - **Dovrebbe essere 0** (solo pulizia cache, no query extra)
   
3. **Conta quante richieste "profiles" extra** in Tab B dopo logout Tab A (dovrebbe essere 0)
4. **Copia URL delle richieste** (se ce ne sono)

---

## 📝 TEMPLATE REPORT (Da Compilare)

Copia questo template e compilalo con i tuoi risultati:

```markdown
=== REPORT TEST MANUALE QUERY PROFILES ===
Data: [DATA DI OGGI]
Browser: [Chrome / Firefox / Edge]
Versione Browser: [es: Chrome 120]

─────────────────────────────────────────
SCENARIO A — LOGIN COMPLETO
─────────────────────────────────────────

TRAINER:
- Query totali profiles: __
- Lista URL richieste (copiate da Network):
  1. [incolla URL 1]
  2. [incolla URL 2]
  3. [incolla URL 3]
  ...
- Log Console [profiles] (se presenti):
  [incolla log qui]
- Screenshot: [allegato / non disponibile]

ADMIN:
- Query totali profiles: __
- Lista URL richieste (copiate da Network):
  1. [incolla URL 1]
  2. [incolla URL 2]
  3. [incolla URL 3]
  ...
- Log Console [profiles] (se presenti):
  [incolla log qui]
- Screenshot: [allegato / non disponibile]

ATHLETE:
- Query totali profiles: __
- Lista URL richieste (copiate da Network):
  1. [incolla URL 1]
  2. [incolla URL 2]
  3. [incolla URL 3]
  ...
- Log Console [profiles] (se presenti):
  [incolla log qui]
- Screenshot: [allegato / non disponibile]


─────────────────────────────────────────
SCENARIO B — REFRESH PAGINA (F5)
─────────────────────────────────────────

TRAINER:
- Query totali profiles: __
- Lista URL richieste (copiate da Network):
  1. [incolla URL 1]
  2. [incolla URL 2]
  ...
- Screenshot: [allegato / non disponibile]

ADMIN:
- Query totali profiles: __
- Lista URL richieste (copiate da Network):
  1. [incolla URL 1]
  2. [incolla URL 2]
  ...
- Screenshot: [allegato / non disponibile]

ATHLETE:
- Query totali profiles: __
- Lista URL richieste (copiate da Network):
  1. [incolla URL 1]
  2. [incolla URL 2]
  ...
- Screenshot: [allegato / non disponibile]


─────────────────────────────────────────
SCENARIO C — MULTI-TAB
─────────────────────────────────────────

TAB A (Login):
- Query totali profiles: __
- Ruolo testato: [Trainer / Admin / Athlete]
- Lista URL richieste (opzionale, se raccolti):
  1. [incolla URL 1]
  2. [incolla URL 2]
  ...

TAB B (Refresh su pagina protetta):
- Query totali profiles: __
- Lista URL richieste (copiate da Network):
  1. [incolla URL 1]
  2. [incolla URL 2]
  ...

TAB B (Dopo logout Tab A):
- Query totali profiles extra: __ (dovrebbe essere 0)
- Lista URL richieste extra (se presenti):
  [se 0, scrivi "Nessuna query extra (comportamento corretto)"]
  [se >0, incolla URL]

─────────────────────────────────────────
NOTE AGGIUNTIVE (Opzionale)
─────────────────────────────────────────

[Eventuali osservazioni, anomalie, o note aggiuntive]


─────────────────────────────────────────
SCREENSHOT ALLEGATI (Opzionale)
─────────────────────────────────────────

[Se hai screenshot, incolla qui o indica "Allegati separatamente"]
```

---

## 💡 COME COPIARE URL DA NETWORK TAB

### Metodo 1: Right-Click → Copy URL

1. Nel Network tab, trova una richiesta `profiles`
2. **Right-click** sulla riga della richiesta
3. Seleziona **"Copy" → "Copy link address"** (Chrome/Edge) o **"Copy URL"** (Firefox)
4. Incolla nel report

### Metodo 2: Click sulla Richiesta → Copia URL

1. Nel Network tab, **clicca** su una richiesta `profiles`
2. Nel pannello destro (Headers/Preview/Response), vai su **"Headers"**
3. Trova **"Request URL"** (o "General" → "Request URL")
4. **Seleziona** l'URL completo
5. **Copia** (`Ctrl+C` / `Cmd+C`)
6. Incolla nel report

**Esempio URL atteso:**
```
https://[tuo-progetto].supabase.co/rest/v1/profiles?user_id=eq.[uuid]&select=role
https://[tuo-progetto].supabase.co/rest/v1/profiles?user_id=eq.[uuid]&select=id,user_id,role,org_id,email,nome,cognome,avatar,avatar_url,created_at,updated_at,first_name,last_name,phone
```

---

## 📸 COME FARE SCREENSHOT

### Windows:
- **Screenshot intera schermata:** `Windows+PrintScreen`
- **Screenshot area selezionata:** `Windows+Shift+S` (seleziona area)
- **Screenshot finestra attiva:** `Alt+PrintScreen`

### Mac:
- **Screenshot intera schermata:** `Cmd+Shift+3`
- **Screenshot area selezionata:** `Cmd+Shift+4` (seleziona area)
- **Screenshot finestra attiva:** `Cmd+Shift+4` poi `Space`

### Dove Salvare:
Salva gli screenshot nella cartella del progetto o sul Desktop con nomi:
- `scenario-a-trainer.png`
- `scenario-a-admin.png`
- `scenario-a-athlete.png`
- `scenario-b-trainer.png`
- `scenario-b-admin.png`
- `scenario-b-athlete.png`

---

## ✅ CHECKLIST PRE-TEST

Prima di iniziare, verifica:

- [ ] Server avviato (`npm run dev` → "Ready")
- [ ] Browser in modalità Incognito
- [ ] DevTools aperto (Network + Console)
- [ ] Network → "Preserve log" attivato
- [ ] Network → "Disable cache" attivato
- [ ] Network → Filtro "profiles" applicato
- [ ] Console → Filtro "[profiles]" applicato (opzionale)
- [ ] Credenziali di test pronte (Trainer/Admin/Athlete)

---

## 🎯 OBIETTIVO FINALE

Dopo aver completato tutti e 3 gli scenari:

1. **Compila il template report** con i numeri reali
2. **Incolla il report qui nel chat**
3. **Con quei numeri verifichiamo:**
   - Se le ottimizzazioni funzionano correttamente
   - Se ci sono query duplicate residue
   - Qual è l'ultima query extra da tagliare (se presente)

---

## 📩 FEEDBACK RICHIESTO

**Dopo il test, incollami qui nel chat:**

```markdown
=== RISULTATI TEST MANUALE ===

SCENARIO A (Login):
Trainer: __ query profiles
Admin: __ query profiles
Athlete: __ query profiles
[+ lista URL richieste profiles]

SCENARIO B (F5):
Trainer: __ query profiles
Admin: __ query profiles
Athlete: __ query profiles
[+ lista URL richieste profiles]

SCENARIO C (Multi-tab):
Tab A: __ query profiles
Tab B: __ query profiles
Dopo logout Tab A, Tab B: __ query profiles extra
[+ lista URL richieste profiles]

[Opzionale: screenshot Network filtrato profiles]
```

**Con quei numeri ti dirò subito:**
- ✅ Se sei già "perfetto" (query minimizzate correttamente)
- ❌ Oppure qual è l'ultima query extra da tagliare (di solito `useAppointments.getProfileId`)
