# 🔒 Checklist Verifica Sicurezza End-to-End - Task 6.9

**Data**: 2025-01-28  
**Priorità**: 🟠 ALTA  
**Stato**: ⏳ In corso

## 📋 Overview

Questo documento contiene la checklist completa per verificare la sicurezza end-to-end del sistema, in particolare per i dati dell'atleta.

---

## ✅ 1. Verifica SQL Injection Protection

### 1.1 Query Supabase (Client-side)

- [x] **Verificato**: Supabase.js usa parametri preparati automaticamente
- [x] **Conclusione**: Tutte le query `.from()`, `.select()`, `.insert()`, `.update()`, `.delete()` sono protette
- [x] **Nota**: Supabase client previene automaticamente SQL injection tramite parametri preparati

**File verificati**:

- `src/hooks/athlete-profile/*.ts` - Tutti gli hook usano `.eq()`, `.insert()`, `.update()` correttamente
- Nessuna concatenazione di stringhe per costruire query SQL trovata

### 1.2 RPC Functions (Server-side)

- [ ] **Da verificare**: RPC functions nel database devono usare parametri tipizzati
- [ ] **File**: `supabase/migrations/*_rpc_*.sql`

**Azioni**:

- [ ] Verificare che tutte le RPC functions usino parametri tipizzati (es. `p_athlete_id UUID`)
- [ ] Verificare che non ci siano `EXECUTE format()` con interpolazione diretta

---

## ✅ 2. Verifica XSS Protection

### 2.1 Rendering React

- [x] **Verificato**: React escape automaticamente tutti i valori JSX (`{variable}`)
- [x] **File verificati**: Tutti i componenti `athlete-*-tab.tsx`
- [x] **Conclusione**: Nessun uso di `dangerouslySetInnerHTML` trovato

### 2.2 Sanitizzazione Input

- [x] **Verificato**: Funzioni di sanitizzazione presenti in `src/lib/sanitize.ts`
- [x] **Task 6.3**: Sanitizzazione implementata in tutti i componenti tab
- [x] **Conclusione**: Input sanitizzato prima del salvataggio

**Payload XSS test consigliati** (da testare manualmente):

```javascript
// Input campi testo
'<script>alert("XSS")</script>'
'<img src=x onerror=alert("XSS")>'
'javascript:alert("XSS")'
'<svg/onload=alert("XSS")>'
```

---

## ✅ 3. Verifica RLS (Row Level Security)

### 3.1 Tabelle Athlete Data

- [x] **Verificato**: RLS abilitato su tutte le tabelle `athlete_*_data`
- [x] **Policies**: Presenti e verificate in Task 6.2

**Test RLS da eseguire** (scenari da testare manualmente):

1. **PT non può accedere dati atleti non assegnati**:

   ```typescript
   // Come PT, tentare:
   supabase.from('athlete_medical_data').select('*').eq('athlete_id', 'ATHLETE_ID_NON_ASSEGNATO')
   // Atteso: [] (vuoto) o errore
   ```

2. **Atleta non può accedere dati altri atleti**:

   ```typescript
   // Come Atleta, tentare:
   supabase.from('athlete_medical_data').select('*').eq('athlete_id', 'ALTRO_ATHLETE_ID')
   // Atteso: [] (vuoto) o errore
   ```

3. **Admin può accedere tutto**:
   ```typescript
   // Come Admin, tentare:
   supabase.from('athlete_medical_data').select('*')
   // Atteso: Array con tutti i dati
   ```

---

## ✅ 4. Verifica Storage Access (File Security)

### 4.1 RLS Policies Storage

- [x] **Verificato**: RLS abilitato su `storage.objects`
- [x] **Verificato**: 4 bucket privati configurati
- [x] **Verificato**: Policies SELECT/INSERT/UPDATE/DELETE presenti

**Test Storage da eseguire**:

1. **Atleta non può accedere file altri atleti**:

   ```typescript
   // Come Atleta, tentare download:
   supabase.storage.from('athlete-certificates').download('ALTRO_ATHLETE_ID/certificato.pdf')
   // Atteso: Errore 404 o 403
   ```

2. **Path traversal bloccato**:

   ```typescript
   // Tentare path traversal:
   supabase.storage.from('athlete-certificates').download('../altro-bucket/file.pdf')
   // Atteso: Errore o file non trovato
   ```

3. **Upload file malizioso bloccato**:
   ```typescript
   // Tentare upload con nome file malizioso:
   const maliciousFile = new File(['content'], '../../etc/passwd')
   supabase.storage.from('athlete-certificates').upload('../../etc/passwd', maliciousFile)
   // Atteso: Errore o file caricato in path corretto (sanitizzato)
   ```

---

## ✅ 5. Verifica Input Validation

### 5.1 Client-side (Zod)

- [x] **Task 6.4**: Validazione Zod implementata in tutti i componenti tab
- [x] **Schemi**: Presenti in `src/types/athlete-profile.schema.ts`

**Test validazione da eseguire**:

1. **Email invalida**:

   ```typescript
   // Tentare salvare con email invalida:
   {
     email: 'not-an-email'
   }
   // Atteso: Errore validazione Zod, salvataggio bloccato
   ```

2. **Numero fuori range**:

   ```typescript
   // Tentare salvare altezza fuori range:
   {
     altezza_cm: 500
   } // Max: 250
   // Atteso: Errore validazione Zod
   ```

3. **Stringa troppo lunga**:
   ```typescript
   // Tentare salvare stringa > maxLength:
   {
     note_mediche: 'a'.repeat(3000)
   } // Max: 2000
   // Atteso: Stringa troncata a 2000 caratteri
   ```

### 5.2 Server-side (CHECK Constraints)

- [x] **Task 6.5**: Constraint CHECK aggiunti al database
- [x] **Verificato**: Funzioni PL/pgSQL per validazione formato (email, telefono, etc.)

**Test server-side da eseguire**:

- [ ] Tentare INSERT diretto via SQL con dati invalidi (deve fallire)

---

## ✅ 6. Verifica File Upload Security

### 6.1 Validazione File

- [x] **Verificato**: Limiti file size configurati (5-10MB)
- [x] **Verificato**: MIME types validati per ogni bucket
- [x] **Verificato**: Funzioni `sanitizeFilename()` e `isSafeStoragePath()` presenti

**Test file upload da eseguire**:

1. **File troppo grande**:

   ```typescript
   // Tentare upload file > 10MB
   const largeFile = new File([new ArrayBuffer(11 * 1024 * 1024)], 'large.pdf')
   // Atteso: Errore "File too large"
   ```

2. **MIME type non consentito**:

   ```typescript
   // Tentare upload .exe come certificato medico
   const exeFile = new File(['content'], 'malware.exe', { type: 'application/x-msdownload' })
   // Atteso: Errore "MIME type not allowed"
   ```

3. **Nome file malizioso**:
   ```typescript
   // Tentare upload con nome file contenente path traversal
   const maliciousFile = new File(['content'], '../../../etc/passwd.pdf')
   // Atteso: Nome file sanitizzato, path corretto (user_id/filename)
   ```

---

## ✅ 7. Verifica Audit Logs

### 7.1 Trigger Audit

- [x] **Task 6.7**: Trigger audit creati su 11 tabelle critiche
- [x] **Verificato**: Funzione `log_audit_event()` presente

**Test audit logs da eseguire**:

1. **Log INSERT**:

   ```typescript
   // Eseguire INSERT su athlete_medical_data
   // Verificare che sia loggato in audit_logs
   ```

2. **Log UPDATE**:

   ```typescript
   // Eseguire UPDATE su athlete_medical_data
   // Verificare che old_data e new_data siano loggati
   ```

3. **Log DELETE**:

   ```typescript
   // Eseguire DELETE su athlete_medical_data
   // Verificare che sia loggato con old_data
   ```

4. **RLS Audit Logs**:
   ```typescript
   // Come non-Admin, tentare SELECT su audit_logs
   supabase.from('audit_logs').select('*')
   // Atteso: [] (vuoto) - solo Admin può vedere
   ```

---

## 📝 Note e Raccomandazioni

### Test Manuali Necessari

I seguenti test richiedono esecuzione manuale o setup di ambiente di test:

1. **Test RLS con utenti reali**:
   - Creare utenti test con ruoli diversi (PT, Atleta, Admin)
   - Verificare accesso a dati

2. **Test Storage con file reali**:
   - Tentare upload/download con vari tipi di file
   - Verificare path traversal protection

3. **Test SQL Injection via API**:
   - Tentare payload SQL injection nei parametri API
   - Verificare che Supabase li blocchi

4. **Test XSS in produzione**:
   - Inserire payload XSS in campi input
   - Verificare che non vengano eseguiti

### Prossimi Passi

- [ ] Creare script di test automatizzati con Vitest
- [ ] Setup ambiente di test con utenti mock
- [ ] Eseguire test manuali sopra descritti
- [ ] Documentare risultati

---

**Ultimo aggiornamento**: 2025-01-28
