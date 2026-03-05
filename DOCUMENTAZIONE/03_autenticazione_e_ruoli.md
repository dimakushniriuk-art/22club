# 🔐 03 - Autenticazione e Ruoli

> **Sistema di autenticazione e autorizzazione 22Club**

---

## 🎭 RUOLI DEFINITI

### Tipi TypeScript

```typescript
// src/types/user.ts:2
export type UserRole = 'athlete' | 'trainer' | 'admin' | 'nutrizionista' | 'massaggiatore'
```

### Mapping Legacy

```typescript
// src/providers/auth-provider.tsx:137-143
const normalized =
  trimmedRole === 'pt' ? 'trainer' : trimmedRole === 'atleta' ? 'athlete' : trimmedRole

// Ulteriori mapping
if (normalized === 'owner') return 'admin'
if (normalized === 'staff') return 'trainer'
```

### Gerarchia Ruoli

```typescript
// src/types/user.ts:38-45
const roleHierarchy: Record<UserRole, number> = {
  athlete: 1,
  trainer: 2,
  nutrizionista: 2,
  massaggiatore: 2,
  admin: 3,
}
```

---

## 🔒 PERMESSI PER RUOLO

| Ruolo         | Dashboard | Home | Admin | Clienti | Schede |
| ------------- | --------- | ---- | ----- | ------- | ------ |
| admin         | ✅        | ❌   | ✅    | ✅      | ✅     |
| trainer       | ✅        | ❌   | ❌    | ✅      | ✅     |
| nutrizionista | ✅        | ❌   | ❌    | ⚠️      | ❌     |
| massaggiatore | ✅        | ❌   | ❌    | ⚠️      | ❌     |
| athlete       | ❌        | ✅   | ❌    | ❌      | 👁️     |

Legenda: ✅ Accesso completo | ⚠️ Accesso limitato | 👁️ Solo lettura | ❌ Nessun accesso

---

## 🔑 FLOW AUTENTICAZIONE

### 1. Login

```
┌──────────────────────────────────────────────────────────────┐
│ LoginPage                                                     │
│ ├── createClient() → Browser Supabase                        │
│ ├── signInWithPassword(email, password)                      │
│ │   └── Supabase Auth API                                    │
│ ├── Se successo: router.replace('/post-login')               │
│ └── Se errore: setError('Credenziali non valide')            │
└──────────────────────────────────────────────────────────────┘
```

### 2. Session Validation (Middleware)

```
┌──────────────────────────────────────────────────────────────┐
│ middleware.ts                                                 │
│ ├── createClient(request)                                    │
│ ├── getSession() → Session o null                            │
│ │   └── Gestione errore refresh token (silenziosa)           │
│ ├── Se session:                                              │
│ │   ├── Cerca ruolo in cache (TTL 1 min)                     │
│ │   ├── Se non in cache: query profiles.role                 │
│ │   ├── Normalizza ruolo (pt→trainer, atleta→athlete)        │
│ │   └── Verifica accesso route                               │
│ └── Se no session:                                           │
│     ├── Route pubblica → next()                              │
│     └── Route protetta → redirect /login                     │
└──────────────────────────────────────────────────────────────┘
```

### 3. Client State (AuthProvider)

```
┌──────────────────────────────────────────────────────────────┐
│ AuthProvider                                                  │
│ ├── useState: user, role, orgId, loading                     │
│ ├── useEffect: loadUser()                                    │
│ │   ├── getSession()                                         │
│ │   ├── Query profiles WHERE user_id = session.user.id       │
│ │   ├── mapProfileToUser(profile)                            │
│ │   └── setUser, setRole, setOrgId                           │
│ ├── onAuthStateChange listener                               │
│ │   └── Aggiorna stato su login/logout                       │
│ └── Context value: { user, role, org_id, loading }           │
└──────────────────────────────────────────────────────────────┘
```

---

## 📍 PUNTI DI VERIFICA

### Middleware (Edge)

```typescript
// src/middleware.ts:204-221
if (pathname.startsWith('/dashboard') && !['admin', 'trainer'].includes(normalizedRole)) {
  return NextResponse.redirect('/login?error=accesso_negato')
}

if (pathname.startsWith('/home') && normalizedRole !== 'athlete') {
  return NextResponse.redirect('/login?error=accesso_negato')
}
```

### Layout (Client)

```typescript
// src/app/home/_components/home-layout-auth.tsx:36-48
if (role && role !== 'athlete') {
  if (role === 'admin') router.push('/dashboard/admin')
  else if (role === 'trainer') router.push('/dashboard')
  else router.push('/login?error=accesso_negato')
}
```

### RLS Policies (Database)

```sql
-- Esempio policy profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Trainers can view assigned athletes" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pt_atleti
      WHERE pt_id = auth.uid() AND atleta_id = profiles.user_id
    )
  );
```

---

## 🔄 REFRESH TOKEN HANDLING

### Middleware

```typescript
// src/middleware.ts:88-107
const isRefreshTokenError =
  errorMessage.includes('Invalid Refresh Token') ||
  errorMessage.includes('Refresh Token Not Found') ||
  sessionError.code === 'refresh_token_not_found'

if (isRefreshTokenError) {
  session = null // Gestione silenziosa
}
```

### AuthProvider

```typescript
// src/providers/auth-provider.tsx:333-356
if (sessionError.message?.includes('Invalid Refresh Token')) {
  await supabase.auth.signOut()
  window.location.href = '/login'
}
```

---

## 📊 VALUTAZIONE

| Aspetto             | Rating    | Note                           |
| ------------------- | --------- | ------------------------------ |
| Chiarezza logica    | ★★★☆☆     | Mapping ruoli confuso (legacy) |
| Robustezza          | ★★★★☆     | Multi-layer verification ok    |
| Debito tecnico      | **MEDIO** | Ruoli legacy da pulire         |
| Rischio regressioni | **MEDIO** | Cambio mapping rompe tutto     |

---

## ⚠️ PROBLEMI RILEVATI

### SEG-012: Mapping Ruoli Legacy

```
🧠 IMPROVE
File: src/providers/auth-provider.tsx
Area: Auth
Motivo: Mapping pt→trainer, atleta→athlete in più punti
Impatto: BASSO (funziona ma legacy)
Urgenza: BASSA
Azione: Normalizzare ruoli a DB level
```

### SEG-005: Cache Ruoli Non Distribuita

```
🧠 RISK
File: src/middleware.ts
Area: Auth
Motivo: Map in-memory non condivisa tra worker
Impatto: MEDIO (ruolo stale possibile)
Urgenza: MEDIA
Azione: Valutare Redis/Memcached
```

---

## 🔗 DIPENDENZE

```
Autenticazione dipende da:
├── Supabase Auth (JWT, sessions)
├── Tabella profiles (ruoli, org_id)
├── Cookie handling (Next.js 15)
└── RLS policies

Autorizzazione dipende da:
├── Middleware (route protection)
├── AuthProvider (client state)
├── Layout guards (double-check)
└── RLS policies (data access)
```
