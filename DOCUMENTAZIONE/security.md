# 🔐 Sicurezza - Modulo Profilo Atleta

**Versione**: 1.0  
**Ultimo aggiornamento**: 2025-01-29

---

## Overview

Il modulo Profilo Atleta implementa un sistema di sicurezza multi-livello per proteggere i dati sensibili degli atleti.

---

## 🛡️ Livelli di Sicurezza

### 1. Row Level Security (RLS)

Tutte le tabelle hanno **RLS abilitato** con policies specifiche per ruolo.

#### Policy Pattern PT

```sql
-- PT può leggere dati dei propri atleti
CREATE POLICY "pt_can_read_athlete_data"
ON athlete_xxx_data
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM pt_atleti
    WHERE pt_atleti.pt_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    AND pt_atleti.atleta_id = athlete_xxx_data.athlete_id
  )
);
```

#### Policy Pattern Atleta

```sql
-- Atleta può leggere/scrivere solo i propri dati
CREATE POLICY "athlete_can_manage_own_data"
ON athlete_xxx_data
FOR ALL
TO authenticated
USING (athlete_id = auth.uid())
WITH CHECK (athlete_id = auth.uid());
```

#### Policy Pattern Admin

```sql
-- Admin ha accesso completo
CREATE POLICY "admin_full_access"
ON athlete_xxx_data
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);
```

**Migrazione**: `20250128_complete_rls_verification_task_6_1.sql`

---

### 2. Storage RLS Policies

I bucket di storage hanno policies RLS per controllare accesso ai file.

#### Policy Upload

```sql
CREATE POLICY "pt_can_upload_athlete_files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'athlete-certificates'
  AND (
    -- PT può uploadare per i propri atleti
    (storage.foldername(name))[1] IN (
      SELECT atleta_id::text FROM pt_atleti
      WHERE pt_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
    OR
    -- Atleta può uploadare solo per se stesso
    (storage.foldername(name))[1] = auth.uid()::text
  )
);
```

#### Policy Download

```sql
CREATE POLICY "pt_and_athlete_can_download_files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'athlete-certificates'
  AND (
    -- PT può scaricare file dei propri atleti
    (storage.foldername(name))[1] IN (
      SELECT atleta_id::text FROM pt_atleti
      WHERE pt_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
    OR
    -- Atleta può scaricare solo i propri file
    (storage.foldername(name))[1] = auth.uid()::text
  )
);
```

**Migrazione**: `20250128_complete_storage_rls_verification_task_6_2.sql`

---

### 3. Input Sanitization

Tutti gli input utente vengono sanitizzati prima di essere salvati.

#### Funzione Sanitizzazione

```typescript
// src/lib/sanitize.ts
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Rimuovi tag HTML
    .replace(/javascript:/gi, '') // Rimuovi javascript:
    .replace(/on\w+=/gi, '') // Rimuovi event handlers
}
```

#### Utilizzo

```typescript
import { sanitizeString } from '@/lib/sanitize'

const handleInput = (value: string) => {
  const sanitized = sanitizeString(value)
  setFormData((prev) => ({ ...prev, field: sanitized }))
}
```

**File**: `src/lib/sanitize.ts`

---

### 4. Validazione Client (Zod)

Tutti i dati vengono validati lato client con **Zod** prima di essere inviati al server.

#### Schema Validazione

```typescript
// src/types/athlete-profile.schema.ts
export const updateAthleteXxxSchema = z.object({
  field1: z.string().min(1).max(255),
  field2: z.number().min(0).max(100),
  field3: z.array(z.string()).max(10),
})
```

#### Utilizzo

```typescript
import { updateAthleteXxxSchema } from '@/types/athlete-profile.schema'

const handleSave = async () => {
  try {
    const validated = updateAthleteXxxSchema.parse(formData)
    await updateMutation.mutateAsync(validated)
  } catch (error) {
    if (error instanceof ZodError) {
      setErrors(error.errors)
    }
  }
}
```

**File**: `src/types/athlete-profile.schema.ts`

---

### 5. Validazione Server (CHECK Constraints)

Il database ha **CHECK constraints** per validare i dati a livello server.

#### Esempio Constraint

```sql
-- Valida livello esperienza
ALTER TABLE athlete_fitness_data
ADD CONSTRAINT athlete_fitness_data_livello_esperienza_check
CHECK (livello_esperienza IN ('principiante', 'intermedio', 'avanzato', 'professionista'));

-- Valida obiettivo primario
ALTER TABLE athlete_fitness_data
ADD CONSTRAINT athlete_fitness_data_obiettivo_primario_check
CHECK (obiettivo_primario IN ('dimagrimento', 'massa_muscolare', 'forza', 'resistenza', 'tonificazione', 'riabilitazione', 'altro'));
```

**Migrazione**: `20250128_complete_server_validation_verification_task_6_5.sql`

---

### 6. Protezione XSS

#### React Escape Automatico

React escape automaticamente tutti i valori renderizzati:

```typescript
// ✅ Sicuro - React escape automatico
<div>{userInput}</div>

// ❌ Pericoloso - Non fare mai questo
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

#### Sanitizzazione Path File

```typescript
// src/lib/sanitize.ts
export function sanitizePath(path: string): string {
  return path
    .replace(/\.\./g, '') // Rimuovi path traversal
    .replace(/[^a-zA-Z0-9_\-./]/g, '') // Solo caratteri sicuri
    .replace(/\/+/g, '/') // Normalizza slash
}
```

---

### 7. Audit Logs

Tutte le modifiche ai dati vengono registrate in **audit logs**.

#### Trigger Audit Log

```sql
CREATE OR REPLACE FUNCTION log_athlete_xxx_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    table_name,
    record_id,
    action,
    user_id,
    old_data,
    new_data,
    created_at
  ) VALUES (
    'athlete_xxx_data',
    NEW.id,
    CASE
      WHEN TG_OP = 'INSERT' THEN 'INSERT'
      WHEN TG_OP = 'UPDATE' THEN 'UPDATE'
      WHEN TG_OP = 'DELETE' THEN 'DELETE'
    END,
    auth.uid(),
    row_to_json(OLD),
    row_to_json(NEW),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_audit_athlete_xxx
  AFTER INSERT OR UPDATE OR DELETE ON athlete_xxx_data
  FOR EACH ROW
  EXECUTE FUNCTION log_athlete_xxx_changes();
```

**Migrazione**: `20250128_complete_audit_logs_task_6_7.sql`

---

### 8. File Access Security

#### Sanitizzazione Nome File

```typescript
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Solo caratteri sicuri
    .replace(/^\.+/, '') // Rimuovi punti iniziali
    .substring(0, 255) // Limita lunghezza
}
```

#### Validazione Tipo File

```typescript
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

const validateFile = (file: File): boolean => {
  return ALLOWED_TYPES.includes(file.type) && file.size <= 10 * 1024 * 1024 // 10MB
}
```

**Migrazione**: `20250128_verify_and_secure_file_access_task_6_8.sql`

---

## 🔍 Verifica Sicurezza

### Checklist Sicurezza

- ✅ RLS policies su tutte le tabelle
- ✅ RLS policies su storage buckets
- ✅ Input sanitization implementata
- ✅ Validazione client (Zod)
- ✅ Validazione server (CHECK constraints)
- ✅ Protezione XSS
- ✅ Audit logs attivi
- ✅ File access security

**File**: `tests/security/security-checklist-task-6-9.md`

---

## 🧪 Test Sicurezza

### Test RLS Policies

```sql
-- Verifica PT può leggere dati atleta
SET ROLE authenticated;
SET request.jwt.claim.sub = 'pt-user-id';

SELECT * FROM athlete_xxx_data WHERE athlete_id = 'athlete-id';
-- ✅ Dovrebbe funzionare se PT è associato all'atleta

-- Verifica atleta non può leggere dati altri atleti
SET request.jwt.claim.sub = 'athlete-1-id';
SELECT * FROM athlete_xxx_data WHERE athlete_id = 'athlete-2-id';
-- ❌ Dovrebbe fallire
```

**Script**: `supabase/migrations/20250128_test_rls_athlete_profile.sql`

---

## 📚 Risorse

- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)

---

**Ultimo aggiornamento**: 2025-01-29
