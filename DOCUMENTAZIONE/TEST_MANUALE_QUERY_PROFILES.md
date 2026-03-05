# 🧪 Test Manuale - Query a `profiles`

## 📋 Preparazione

### STEP 0 — Setup DevTools

1. **Avvia dev server:**
   ```bash
   npm run dev
   ```

2. **Apri Chrome DevTools:**
   - Apri DevTools (F12)
   - Tab **Network**
   - ✅ Check **"Preserve log"** (mantiene log durante redirect)
   - ✅ Check **"Disable cache"** (forza richieste fresche)
   - Filtra per: `profiles` (scrivi nella barra di ricerca Network)

3. **Apri Console:**
   - Tab **Console**
   - Filtra per: `[profiles]` (scrivi nella barra di ricerca Console)

---

## 🔐 SCENARIO A — Login Completo

### Procedura

1. **Apri finestra InPrivate/Incognito** (per evitare cache/cookie residui)

2. **Vai su `/login`**

3. **Fai login con credenziali:**
   - **Trainer:** `b.francesco@22club.it` / `FrancescoB`
   - **Admin:** `admin@22club.it` / `adminadmin`
   - **Athlete:** `dima.kushniriuk@gmail.com` / `Ivan123`

4. **Attendi redirect completo:**
   - `/login` → `/post-login` → `/dashboard` o `/home`
   - Aspetta che la pagina sia completamente caricata (no spinner, no loading)

5. **Ferma tutto e annota**

### 📊 DATI DA RACCOGLIERE (Scenario A)

#### Per ogni ruolo (trainer, admin, athlete):

**A1. Network Tab:**
- Numero totale richieste filtrate `profiles`: __
- Lista endpoint esatti (copia URL):
  ```
  1. /rest/v1/profiles?...
  2. /rest/v1/profiles?...
  3. ...
  ```

**A2. Console Tab:**
- Log `[profiles]` in ordine temporale (copia tutti):
  ```
  1. [profiles] ... → ...
  2. [profiles] ... → ...
  3. ...
  ```

---

## 🔄 SCENARIO B — Refresh Pagina

### Procedura

1. **Sei già su `/dashboard` (trainer/admin) oppure `/home` (athlete)**

2. **Pulisci Network Tab:**
   - Clicca icona "Clear" (cestino) nel Network tab
   - Pulisci anche Console (opzionale)

3. **Premi F5** (refresh)

4. **Attendi render completo** (pagina completamente caricata)

5. **Annota**

### 📊 DATI DA RACCOGLIERE (Scenario B)

**B1. Network Tab:**
- Numero totale richieste filtrate `profiles`: __
- Lista endpoint:
  ```
  1. /rest/v1/profiles?...
  2. ...
  ```

**B2. Console Tab:**
- Log `[profiles]`:
  ```
  1. [profiles] ... → ...
  2. ...
  ```

**Nota:** Ripeti per trainer, admin, athlete (se possibile, altrimenti indica il ruolo testato).

---

## 🪟 SCENARIO C — Multi-Tab

### Procedura

1. **Apri Tab A e Tab B** (stesso browser, non InPrivate)

2. **Tab A:**
   - Se non sei già autenticato, fai login
   - Vai su `/dashboard` o `/home`
   - **Annota quante query `profiles`** (clear Network prima)

3. **Tab B:**
   - Vai direttamente su `/dashboard` o `/home`
   - Aspetta caricamento
   - Fai refresh (F5)
   - **Annota quante query `profiles`** (clear Network prima)

4. **Tab A:**
   - Fai logout (clicca logout)
   - Osserva Tab B: deve ricevere evento `SIGNED_OUT` e pulire stato

5. **Tab B (dopo logout Tab A):**
   - Verifica se fa query `profiles` extra (dovrebbe pulire cache, non fare query)
   - **Annota**

### 📊 DATI DA RACCOGLIERE (Scenario C)

**C1. Tab A (login + navigazione):**
- Numero query `profiles`: __
- Lista endpoint:
  ```
  1. /rest/v1/profiles?...
  2. ...
  ```

**C2. Tab B (refresh su pagina protetta):**
- Numero query `profiles`: __
- Lista endpoint:
  ```
  1. /rest/v1/profiles?...
  2. ...
  ```

**C3. Tab B (dopo logout Tab A):**
- Fa query `profiles` extra? (sì/no): __
- Se sì, quante: __

**C4. Console Tab B:**
- Log `[profiles]` dopo logout Tab A:
  ```
  1. [profiles] ... → ...
  2. ...
  ```

**C5. Duplicate nello stesso tab:**
- Tab A ha fatto query duplicate? (sì/no): __
- Tab B ha fatto query duplicate? (sì/no): __

---

## 📝 TEMPLATE REPORT FINALE

Copia questo template e compilalo con i tuoi risultati:

```markdown
=== REPORT TEST MANUALE QUERY PROFILES ===

SCENARIO A — Login Completo
────────────────────────────

Trainer:
- Query totali: __
- Endpoint:
  1. /rest/v1/profiles?...
  2. ...
- Console log:
  1. [profiles] ... → ...
  2. ...

Admin:
- Query totali: __
- Endpoint:
  1. /rest/v1/profiles?...
  2. ...
- Console log:
  1. [profiles] ... → ...
  2. ...

Athlete:
- Query totali: __
- Endpoint:
  1. /rest/v1/profiles?...
  2. ...
- Console log:
  1. [profiles] ... → ...
  2. ...


SCENARIO B — Refresh Pagina
────────────────────────────

Trainer:
- Query totali: __
- Endpoint:
  1. /rest/v1/profiles?...
  2. ...

Admin:
- Query totali: __
- Endpoint:
  1. /rest/v1/profiles?...
  2. ...

Athlete:
- Query totali: __
- Endpoint:
  1. /rest/v1/profiles?...
  2. ...


SCENARIO C — Multi-Tab
───────────────────────

Tab A (login + navigazione):
- Query totali: __
- Endpoint:
  1. /rest/v1/profiles?...
  2. ...
- Query duplicate nello stesso tab: (sì/no)

Tab B (refresh su pagina protetta):
- Query totali: __
- Endpoint:
  1. /rest/v1/profiles?...
  2. ...
- Query duplicate nello stesso tab: (sì/no)

Tab B (dopo logout Tab A):
- Fa query extra: (sì/no)
- Se sì, quante: __
- Console log:
  1. [profiles] ... → ...
  2. ...


ALLEGATI (OBBLIGATORI)
──────────────────────

1. Screenshot Network Tab filtrato "profiles" (Scenario A):
   [incolla screenshot o descrizione]

2. Screenshot Network Tab filtrato "profiles" (Scenario B):
   [incolla screenshot o descrizione]

3. Screenshot Network Tab filtrato "profiles" (Scenario C):
   [incolla screenshot o descrizione]

4. Screenshot Console Tab filtrato "[profiles]" (Scenario A):
   [incolla screenshot o copia testo]

5. Copia completa output Console [profiles] per tutti gli scenari:
   [incolla qui tutto il testo]
```

---

## ✅ CHECKLIST PRE-TEST

Prima di iniziare, verifica:

- [ ] Dev server avviato (`npm run dev`)
- [ ] DevTools aperto (Network + Console)
- [ ] "Preserve log" attivato (Network)
- [ ] "Disable cache" attivato (Network)
- [ ] Filtro "profiles" applicato (Network)
- [ ] Filtro "[profiles]" applicato (Console)
- [ ] Credenziali di test pronte

---

## 🎯 OBIETTIVO FINALE

Raccogliere dati reali per:
1. Verificare se le ottimizzazioni (phone in UserProfile, useAuth in useProfileId) hanno ridotto le query
2. Identificare eventuali query duplicate residue
3. Confermare che singleflight + cache funzionano correttamente
4. Verificare comportamento multi-tab

**Dopo aver completato il test, incolla il report finale qui nel chat.**
