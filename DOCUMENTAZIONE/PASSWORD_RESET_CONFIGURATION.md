# 🔐 Configurazione Reset Password - 22Club

## 📋 Riepilogo

Questo documento descrive la configurazione completa del sistema di reset password per 22Club.

## 🎯 Componenti Configurati

### 1. **Supabase Config (`supabase/config.toml`)**

#### URL e Redirect
- **site_url**: `http://localhost:3001` (porta principale)
- **additional_redirect_urls**: Include sia porta 3000 che 3001 per compatibilità

#### Durata Token
- **jwt_expiry**: `3600` secondi (1 ora)
  - Questo controlla anche la durata del token di recovery per reset password
  - Massimo consentito: 604800 secondi (1 settimana)

#### Email Template
- **Template personalizzato**: `supabase/templates/recovery.html`
- **Subject**: "Reimposta la tua password - 22 PERSONAL TRAINING Club"

### 2. **Template Email (`supabase/templates/recovery.html`)**

Template HTML personalizzato con:
- Design allineato al brand 22Club
- Colori e stile coerenti con l'applicazione
- Link di reset password funzionante
- Messaggio di sicurezza per utenti che non hanno richiesto il reset
- Link di fallback testuale se il pulsante non funziona

### 3. **Frontend (`src/app/reset-password/page.tsx`)**

#### Funzionalità
- ✅ Verifica automatica della sessione al caricamento
- ✅ Gestione errori URL (link scaduti/non validi)
- ✅ Form per inserire nuova password con validazione
- ✅ Toggle per mostrare/nascondere password
- ✅ Validazione password (minimo 6 caratteri, corrispondenza)
- ✅ Messaggio di successo e reindirizzamento automatico
- ✅ Listener per eventi di autenticazione Supabase

#### Stati della Pagina
1. **Loading**: Durante verifica sessione
2. **Errore**: Link scaduto/non valido
3. **Form**: Input nuova password
4. **Successo**: Password aggiornata

### 4. **Database (`supabase/migrations/20260109_verify_password_reset_config.sql`)**

#### Verifiche
- ✅ Indici per performance
- ✅ RLS policies (non interferiscono con reset password)
- ✅ Funzione utility `check_user_exists()` per debug

## 🔄 Flusso Completo

### 1. Richiesta Reset Password
```
Utente → /forgot-password → Inserisce email → Clicca "Invia istruzioni"
```

### 2. Invio Email
```
Supabase → Genera token → Invia email con template personalizzato
```

### 3. Click Link Email
```
Utente → Clicca link email → Supabase verifica token → Crea sessione temporanea
```

### 4. Reset Password
```
Utente → /reset-password → Verifica sessione → Inserisce nuova password → Aggiorna password
```

### 5. Successo
```
Password aggiornata → Messaggio successo → Reindirizzamento a /login (3 secondi)
```

## 🧪 Testing

### Ambiente Locale

1. **Avvia Supabase**:
   ```bash
   supabase start
   ```

2. **Verifica Inbucket**:
   - URL: `http://localhost:54324`
   - Le email di reset password appariranno qui

3. **Test Flusso Completo**:
   ```
   1. Vai su http://localhost:3001/forgot-password
   2. Inserisci email esistente
   3. Controlla Inbucket per email
   4. Clicca sul link nell'email
   5. Inserisci nuova password (es: Ivan123)
   6. Verifica successo e reindirizzamento
   ```

### Ambiente Produzione

1. **Configura SMTP in Supabase Dashboard**:
   - Settings → Auth → Email Templates
   - Configura provider SMTP (SendGrid, Custom SMTP, etc.)

2. **Verifica URL Redirect**:
   - Assicurati che l'URL di produzione sia in `additional_redirect_urls`

3. **Test Email Reali**:
   - Usa email reali per testare il flusso completo

## ⚙️ Configurazioni Importanti

### URL Redirect

Nel file `supabase/config.toml`:
```toml
site_url = "http://localhost:3001"
additional_redirect_urls = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://localhost:3000",
  "https://localhost:3001"
]
```

**Per produzione**, aggiungi l'URL di produzione:
```toml
additional_redirect_urls = [
  "https://your-production-domain.com",
  "https://your-production-domain.com/reset-password"
]
```

### Durata Token

Il token di reset password scade dopo **1 ora** (3600 secondi).

Per modificare:
```toml
jwt_expiry = 3600  # 1 ora
# Massimo: 604800 (1 settimana)
```

### Template Email

Il template è in `supabase/templates/recovery.html`.

Variabili disponibili:
- `{{ .ConfirmationURL }}`: Link di reset password
- `{{ .Email }}`: Email dell'utente (se disponibile)

## 🔍 Troubleshooting

### Problema: Link scade immediatamente

**Soluzione**: Verifica `jwt_expiry` in `config.toml`. Deve essere almeno 3600.

### Problema: Email non arriva (locale)

**Soluzione**: 
1. Verifica che Inbucket sia avviato: `http://localhost:54324`
2. Controlla i log di Supabase: `supabase logs`

### Problema: Email non arriva (produzione)

**Soluzione**:
1. Verifica configurazione SMTP in Supabase Dashboard
2. Controlla cartella spam
3. Verifica rate limits del provider SMTP

### Problema: Link non funziona

**Soluzione**:
1. Verifica che l'URL sia in `additional_redirect_urls`
2. Controlla che il token non sia scaduto
3. Verifica che l'utente esista nel database

### Problema: Sessione non valida

**Soluzione**:
1. Verifica che il link sia stato cliccato entro 1 ora
2. Controlla i log del browser per errori
3. Richiedi un nuovo link di reset

## 📝 Note Importanti

1. **Sicurezza**: 
   - I token scadono dopo 1 ora
   - Ogni token può essere usato una sola volta
   - Il link contiene un hash sicuro generato da Supabase

2. **Performance**:
   - Gli indici su `profiles.user_id` migliorano le query
   - Le RLS policies non interferiscono con il reset password

3. **UX**:
   - Messaggi di errore chiari per l'utente
   - Feedback visivo durante il processo
   - Reindirizzamento automatico dopo successo

## 🔗 File Correlati

- `supabase/config.toml` - Configurazione Supabase
- `supabase/templates/recovery.html` - Template email
- `src/app/reset-password/page.tsx` - Frontend reset password
- `src/app/forgot-password/page.tsx` - Frontend richiesta reset
- `supabase/migrations/20260109_verify_password_reset_config.sql` - Verifica DB

## ✅ Checklist Configurazione

- [x] URL redirect configurati in `config.toml`
- [x] Template email personalizzato creato
- [x] Frontend reset password implementato
- [x] Validazione password implementata
- [x] Gestione errori implementata
- [x] Indici database verificati
- [x] RLS policies verificate
- [x] Documentazione completa

---

**Ultimo aggiornamento**: 2026-01-09
