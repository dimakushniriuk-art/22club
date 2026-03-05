# 💡 Gestione Organizzazioni (Multi-Tenancy) - Futuro Sviluppo

**Data decisione**: 2025-02-01  
**Status**: ⏸️ **Rimandato** - Idea per futuro sviluppo  
**Motivo**: Sistema funziona correttamente con `'default-org'` per tutti

---

## 📋 Situazione Attuale

Il progetto ha già una **base multi-tenancy parziale**:

### ✅ Già Implementato

1. **Colonne `org_id` presenti** in tutte le tabelle:
   - `profiles`, `appointments`, `documents`, `exercises`, `workouts`, `payments`, ecc.
   - Tutti con default `'default-org'`

2. **RLS Policies configurate**:
   - Filtrano per `org_id` usando `auth.jwt() ->> 'org_id'`
   - Isolamento dati già previsto

3. **Infrastruttura pronta**:
   - JWT claims supportano `org_id`
   - Middleware può estrarre `org_id` dalla sessione

### ❌ Manca

- **Tabella `organizations`** (non esiste nel DB)
- **Gestione reale** di organizzazioni multiple
- **UI Admin** per creare/modificare organizzazioni
- **Assegnazione utenti** a organizzazioni

---

## 🎯 Cosa Comporterebbe Implementarla

### 1. Database (SQL Migration)

**Complessità**: 🔴 **ALTA** (4-6 ore)

```sql
-- Creare tabella organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE, -- URL-friendly identifier
  settings JSONB, -- Configurazioni personalizzate
  subscription_tier TEXT, -- free, pro, enterprise
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cambiare org_id da TEXT a UUID con FK
ALTER TABLE profiles
  ALTER COLUMN org_id TYPE UUID USING org_id::UUID,
  ADD CONSTRAINT profiles_org_id_fkey
    FOREIGN KEY (org_id) REFERENCES organizations(id);
```

**Implicazioni**:

- ⚠️ Migrazione dati: tutti i `'default-org'` devono diventare un UUID reale
- ⚠️ Aggiornare tutte le tabelle (circa 10+ tabelle)
- ⚠️ Potenziale downtime durante la migrazione

### 2. Backend (API Routes)

**Complessità**: 🟡 **MEDIA** (3-4 ore)

**Nuove API da creare**:

- `GET /api/admin/organizations` - Lista organizzazioni
- `POST /api/admin/organizations` - Crea organizzazione
- `PUT /api/admin/organizations/[id]` - Modifica organizzazione
- `DELETE /api/admin/organizations/[id]` - Elimina organizzazione
- `POST /api/admin/organizations/[id]/users` - Assegna utenti

**Modifiche alle API esistenti**:

- Tutte le query devono filtrare per `org_id` (già fatto con RLS, ma va verificato)
- Admin deve poter vedere tutte le organizzazioni
- Altri ruoli vedono solo la propria organizzazione

### 3. Frontend (UI Admin)

**Complessità**: 🟡 **MEDIA** (4-5 ore)

**Nuova sezione Dashboard Admin**:

- `/dashboard/admin/organizzazioni` - Lista organizzazioni
- Form creazione/modifica organizzazione
- Assegnazione utenti a organizzazioni
- Statistiche per organizzazione

**Modifiche esistenti**:

- Filtri per organizzazione nelle statistiche
- Select organizzazione nel form utenti
- Badge organizzazione nei profili

### 4. Autenticazione e JWT

**Complessità**: 🔴 **ALTA** (2-3 ore)

**Modifiche necessarie**:

- Inserire `org_id` nel JWT token di Supabase
- Middleware per estrarre `org_id` dalla sessione
- Context provider per `org_id` globale

**File da modificare**:

- `src/lib/supabase/server.ts` - Estrazione `org_id` dalla sessione
- `src/providers/auth-provider.tsx` - Context con `org_id`
- `src/middleware.ts` - Verifica `org_id` nelle richieste

### 5. RLS Policies

**Complessità**: 🔴 **ALTA** (2-3 ore)

**Aggiornamenti**:

- Verificare che tutte le policies usino correttamente `org_id`
- Admin deve vedere tutte le organizzazioni (policy speciale)
- Testare isolamento dati tra organizzazioni

### 6. Migrazione Dati Esistenti

**Complessità**: 🔴 **ALTA** (3-4 ore)

**Script SQL necessario**:

```sql
-- 1. Creare organizzazione "default"
INSERT INTO organizations (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'Organizzazione Default', 'default');

-- 2. Aggiornare tutti i profili
UPDATE profiles SET org_id = '00000000-0000-0000-0000-000000000001'
WHERE org_id = 'default-org';

-- 3. Aggiornare tutte le altre tabelle
UPDATE appointments SET org_id = '00000000-0000-0000-0000-000000000001'
WHERE org_id = 'default-org';
-- ... (per ogni tabella)
```

---

## 📊 Complessità Totale Stimata

| Componente         | Ore stimate | Criticità                      |
| ------------------ | ----------- | ------------------------------ |
| Database migration | 4-6h        | 🔴 Alta (rischio perdita dati) |
| API routes         | 3-4h        | 🟡 Media                       |
| UI Admin           | 4-5h        | 🟡 Media                       |
| JWT/Auth           | 2-3h        | 🔴 Alta (blocca accessi)       |
| RLS policies       | 2-3h        | 🔴 Alta (sicurezza)            |
| Testing            | 3-4h        | 🔴 Alta                        |
| **Totale**         | **18-25h**  | -                              |

---

## 🤔 Decisioni Architetturali Necessarie

### 1. Tipo di `org_id`

- **Opzione A**: Mantenere `TEXT` (più semplice, meno performante)
- **Opzione B**: Passare a `UUID` con FK (più corretto, migrazione complessa)

### 2. Admin Globale

- Super-admin vede tutte le organizzazioni?
- Admin per organizzazione o globale?

### 3. Utenti Multi-Organizzazione

- Un utente può appartenere a più organizzazioni?
- Se sì, come gestire il contesto?

### 4. Dati Esistenti

- Tutti i dati attuali vanno in "default-org"?
- Creare organizzazioni separate per utenti esistenti?

---

## ✅ Raccomandazione

**Per ora**: ⏸️ **Non implementare**

**Motivi**:

- Sistema funziona correttamente con `'default-org'` per tutti
- Complessità alta (18-25h) non giustificata al momento
- Nessun requisito business immediato

**Quando implementare**:

- Quando ci sarà bisogno reale di multi-tenancy
- Quando ci saranno clienti che richiedono isolamento dati
- Quando il business model richiederà organizzazioni separate

**Come procedere quando necessario**:

1. Pianificare migrazione con backup completo
2. Testare in ambiente di sviluppo
3. Implementare in fasi (DB → API → UI)
4. Testare isolamento dati tra organizzazioni

---

## 📝 Note Tecniche

- Tutte le tabelle hanno già `org_id TEXT DEFAULT 'default-org'`
- RLS policies già configurate per filtrare per `org_id`
- JWT claims supportano `org_id` (da verificare implementazione)
- Middleware può estrarre `org_id` dalla sessione

**File di riferimento**:

- `supabase/migrations/20250110_003_profiles.sql` - Schema `profiles` con `org_id`
- `supabase/migrations/2025_security_policies.sql` - RLS policies con `org_id`
- `docs/architecture.md` - Architettura multi-tenant prevista

---

**Ultimo aggiornamento**: 2025-02-01
