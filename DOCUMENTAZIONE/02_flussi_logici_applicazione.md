# 🔄 02 - Flussi Logici Applicazione

> **Analisi dei flussi principali basata sul codice**

---

## 🎯 FLUSSO 1: Primo Accesso Utente

### Sequenza

```
1. Utente naviga a / (root)
2. Middleware intercetta
3. Redirect a /login (sempre, anche se autenticato)
4. LoginPage renderizza form
5. Utente inserisce credenziali
6. signInWithPassword() → Supabase Auth
7. Redirect a /post-login
8. PostLoginPage attende AuthProvider
9. AuthProvider carica profilo da DB
10. Redirect basato su ruolo
```

### File Coinvolti

| Step | File                                      | Funzione               |
| ---- | ----------------------------------------- | ---------------------- |
| 2-3  | `src/middleware.ts:234-238`               | Redirect root to login |
| 4    | `src/app/login/page.tsx`                  | Form rendering         |
| 6    | `src/app/login/page.tsx:74-77`            | signInWithPassword     |
| 7    | `src/app/login/page.tsx:129`              | router.replace         |
| 8-9  | `src/providers/auth-provider.tsx:264-721` | loadUser               |
| 10   | `src/app/post-login/page.tsx:12-33`       | useEffect redirect     |

### Punti di Errore

- ❌ Supabase non configurato → Mock client
- ❌ Credenziali errate → "Credenziali non valide"
- ❌ Profilo mancante → PGRST116 error
- ❌ Refresh token invalido → Logout automatico

---

## 🎯 FLUSSO 2: Navigazione Autenticata

### Sequenza (Trainer)

```
1. Utente su /dashboard naviga a /dashboard/clienti
2. Next.js Link component (prefetch)
3. Middleware verifica sessione (cache 1 min)
4. Verifica ruolo: trainer ∈ ['admin', 'trainer'] ✓
5. Permetti navigazione
6. ClientiPage renderizza
7. useClienti() fetch dati
8. RLS filtra per trainer
9. Render lista
```

### Sequenza (Atleta)

```
1. Utente su /home naviga a /home/allenamenti
2. Next.js Link component (prefetch)
3. Middleware verifica sessione
4. Verifica ruolo: athlete === 'athlete' ✓
5. Permetti navigazione
6. AllenamentiPage renderizza
7. useWorkouts() fetch dati
8. RLS filtra per athlete_id
9. Render schede
```

### File Coinvolti

| Step | File                                           |
| ---- | ---------------------------------------------- |
| 3-5  | `src/middleware.ts:143-221`                    |
| 7    | `src/hooks/use-clienti.ts` o `use-workouts.ts` |
| 8    | Supabase RLS policies                          |

---

## 🎯 FLUSSO 3: Creazione Appuntamento

### Sequenza

```
1. Trainer clicca "Nuovo Appuntamento"
2. Modal/Drawer apre form
3. Utente compila dati
4. Submit → useAppointments().createAppointment()
5. checkOverlap() → RPC function
6. Se no overlap → INSERT
7. Realtime trigger
8. QueryClient invalidate
9. Lista aggiornata
```

### File Coinvolti

| Step | File                                          | Funzione           |
| ---- | --------------------------------------------- | ------------------ |
| 2    | `src/components/dashboard/modals-wrapper.tsx` | Modal container    |
| 4-5  | `src/hooks/use-appointments.ts:229-256`       | createMutation     |
| 5    | `src/hooks/use-appointments.ts:336-365`       | checkOverlap       |
| 7-8  | `src/hooks/use-appointments.ts:218-226`       | useRealtimeChannel |

### Validazione

```javascript
// Dati richiesti
{
  org_id: string,      // Da AuthProvider
  athlete_id: string,  // Selezionato
  trainer_id: string,  // Staff corrente
  starts_at: string,   // ISO datetime
  ends_at: string,     // ISO datetime
  type: string,        // 'allenamento' | 'consulenza' | ...
}
```

---

## 🎯 FLUSSO 4: Caricamento Dashboard

### Sequenza (Server + Client)

```
1. Request a /dashboard
2. Middleware verifica (cache hit o query)
3. DashboardPage (Server Component) esegue
4. createClient() con cookies
5. getUser() → utente
6. Query profiles → profilo
7. Query appointments → agenda oggi
8. Serializza dati
9. Passa a AgendaClient
10. Client hydration
11. DashboardLayout monta
12. Realtime subscriptions attivate
```

### File Coinvolti

| Step | File                                 |
| ---- | ------------------------------------ |
| 3-8  | `src/app/dashboard/page.tsx:55-271`  |
| 9    | `src/app/dashboard/page.tsx:373`     |
| 11   | `src/app/dashboard/layout.tsx`       |
| 12   | `src/app/dashboard/layout.tsx:54-70` |

### Dipendenze Dati

```
Dashboard dipende da:
├── profiles (profilo staff)
├── appointments (agenda oggi)
└── profiles JOIN (atleti appuntamenti)
```

---

## 🎯 FLUSSO 5: Logout

### Sequenza

```
1. Utente clicca Logout
2. supabase.auth.signOut()
3. Cookie session rimosso
4. AuthProvider.onAuthStateChange triggered
5. setUser(null), setRole(null)
6. router.push('/login') o redirect
7. Middleware successivo → no session → permetti /login
```

### File Coinvolti

| Step | File                                      |
| ---- | ----------------------------------------- |
| 2    | Component che chiama signOut              |
| 3-5  | `src/providers/auth-provider.tsx:725-801` |

---

## 🎯 FLUSSO 6: Refresh Token Fallito

### Sequenza (Automatica)

```
1. Token scaduto
2. Supabase tenta refresh
3. Refresh token invalido
4. getSession() ritorna errore
5. Middleware: session = null
6. Se route protetta → redirect /login
7. AuthProvider rileva errore
8. signOut() chiamato
9. Redirect a /login
```

### Gestione Errore

```javascript
// Middleware (src/middleware.ts:88-107)
if (isRefreshTokenError) {
  session = null // Silenzia errore, flusso normale gestisce
}

// AuthProvider (src/providers/auth-provider.tsx:333-356)
if (isRefreshTokenError) {
  await supabase.auth.signOut()
  window.location.href = '/login'
}
```

---

## 📊 VALUTAZIONE FLUSSI

| Flusso        | Chiarezza | Robustezza | Note                            |
| ------------- | --------- | ---------- | ------------------------------- |
| Login         | ★★★★☆     | ★★★☆☆      | Debug code eccessivo            |
| Navigazione   | ★★★★★     | ★★★★☆      | Middleware solido               |
| Appuntamenti  | ★★★★☆     | ★★★★☆      | React Query ben usato           |
| Dashboard     | ★★★☆☆     | ★★★☆☆      | Server/Client handoff complesso |
| Logout        | ★★★★★     | ★★★★★      | Semplice e funzionante          |
| Token Refresh | ★★★☆☆     | ★★★★☆      | Gestione silenziosa ok          |

---

## ⚠️ CRITICITÀ FLUSSI

1. **Race Condition Post-Login**: AuthProvider potrebbe non aver caricato quando PostLoginPage verifica
2. **Debug Logging**: Rallenta tutti i flussi
3. **Cache Middleware**: Ruolo stale per 1 minuto dopo cambio
4. **Serializzazione Dashboard**: Potenziali errori silenti
