# 🛡️ Guida Sicurezza - 22Club

**Ultimo Aggiornamento**: 2025-02-02  
**Versione**: 1.0.0

---

## 📋 Indice

1. [Panoramica](#panoramica)
2. [Autenticazione](#autenticazione)
3. [Autorizzazione](#autorizzazione)
4. [Row Level Security (RLS)](#row-level-security-rls)
5. [API Security](#api-security)
6. [Environment Variables](#environment-variables)
7. [Input Validation](#input-validation)
8. [Best Practices](#best-practices)

---

## Panoramica

22Club implementa sicurezza multi-livello:

- **Autenticazione**: Supabase Auth
- **Autorizzazione**: Role-based (RLS policies)
- **API Security**: Rate limiting, validation
- **Input Validation**: Zod schemas

---

## Autenticazione

### Supabase Auth

**Login Flow**:

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
})
```

**Session Management**:

```typescript
// Server Component
const supabase = await createServerClient()
const {
  data: { session },
} = await supabase.auth.getSession()
```

**Logout**:

```typescript
await supabase.auth.signOut()
```

### Password Security

- **Min Length**: 6 caratteri (configurabile)
- **Hashing**: Bcrypt (gestito da Supabase)
- **Reset Password**: Email-based

---

## Autorizzazione

### Role-Based Access Control

**Ruoli**:

- `admin`: Accesso completo
- `pt`: Personal trainer
- `trainer`: Trainer
- `atleta`: Atleta (read-only)

**Verifica Ruolo**:

```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('user_id', session.user.id)
  .single()

if (profile?.role !== 'admin') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
}
```

---

## Row Level Security (RLS)

### Policies Supabase

**Esempio Policy**:

```sql
-- Profili: utente può vedere solo il proprio
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

-- Staff può vedere tutti i profili
CREATE POLICY "Staff can view all profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'pt', 'trainer')
  )
);
```

### Verifica RLS

```bash
# Analizza RLS policies
npm run db:analyze-rls

# Verifica RLS con auth
npm run db:verify-rls-auth
```

---

## API Security

### Rate Limiting

**API Routes**:

```typescript
import { rateLimit } from '@/lib/rate-limit'

export async function GET(req: NextRequest) {
  const rateLimitResponse = await rateLimit({
    windowMs: 60000,
    maxRequests: 30,
  })(req)

  if (rateLimitResponse) return rateLimitResponse
  // ...
}
```

### Authentication Check

**Pattern Standard**:

```typescript
export async function GET(req: NextRequest) {
  const supabase = await createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ...
}
```

### Authorization Check

```typescript
// Verifica ruolo
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('user_id', session.user.id)
  .single()

if (profile?.role !== 'admin') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

---

## Environment Variables

### Security Best Practices

**NON esporre mai**:

- `SUPABASE_SERVICE_ROLE_KEY`
- `VAPID_PRIVATE_KEY`
- `CRON_SECRET`

**Sicure da esporre**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_VAPID_KEY`

### .env.local

```bash
# ✅ CORRETTO - .env.local in .gitignore
# ❌ SBAGLIATO - Non committare .env.local
```

---

## Input Validation

### Zod Schemas

**API Routes**:

```typescript
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const result = schema.safeParse(body)
if (!result.success) {
  return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
}
```

**Client Components**:

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const form = useForm({
  resolver: zodResolver(schema),
})
```

### SQL Injection Prevention

**Usa sempre parametri**:

```typescript
// ✅ CORRETTO - Parametri
const { data } = await supabase.from('profiles').select('*').eq('id', userId) // Parametrizzato

// ❌ SBAGLIATO - String interpolation
const query = `SELECT * FROM profiles WHERE id = '${userId}'`
```

---

## Best Practices

1. **Always Validate**: Input validation con Zod
2. **Least Privilege**: RLS policies minimali necessarie
3. **Rate Limiting**: Proteggi API routes
4. **Environment Variables**: Non committare secrets
5. **HTTPS Only**: In produzione sempre HTTPS
6. **Regular Updates**: Aggiorna dipendenze regolarmente

---

**Ultimo aggiornamento**: 2025-02-02
