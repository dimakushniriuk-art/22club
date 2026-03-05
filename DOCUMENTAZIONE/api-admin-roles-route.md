# 📚 Documentazione Tecnica: API Admin Roles

**Percorso**: `src/app/api/admin/roles/route.ts`  
**Tipo Modulo**: Next.js API Route (Server Route)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

API route per gestione ruoli admin. Fornisce GET per lista ruoli con conteggio utenti e PUT per aggiornare descrizione e permessi di un ruolo.

---

## 🔧 Endpoints

### 1. `GET /api/admin/roles`

**Classificazione**: API Route, GET Handler, Admin Only  
**Autenticazione**: Richiesta (session)  
**Autorizzazione**: Solo ruolo `admin`

**Query Parameters**: Nessuno

**Response Success** (200):

```typescript
{
  roles: Array<{
    id: string
    name: string
    description: string | null
    permissions: Record<string, boolean>
    user_count: number // conteggio utenti con questo ruolo
    // ... altri campi ruolo
  }>
}
```

**Response Error**:

- `401`: Non autenticato
- `403`: Non autorizzato (non admin)
- `500`: Errore server

**Descrizione**: Endpoint lista ruoli con:

- **Fetch Ruoli**: Tutti i ruoli ordinati per nome
- **Conteggio Utenti**: Conta utenti per ogni ruolo da `profiles`
- **Response**: Ruoli con campo `user_count` aggiunto

### 2. `PUT /api/admin/roles`

**Classificazione**: API Route, PUT Handler, Admin Only  
**Autenticazione**: Richiesta (session)  
**Autorizzazione**: Solo ruolo `admin`

**Request Body**:

```typescript
{
  roleId: string // UUID
  description?: string | null // opzionale
  permissions?: Record<string, boolean> // opzionale
}
```

**Validation**: Zod schema `updateRoleSchema`

**Response Success** (200):

```typescript
{
  role: {
    id: string
    name: string
    description: string | null
    permissions: Record<string, boolean>
    // ... altri campi ruolo
  }
}
```

**Response Error**:

- `400`: Dati non validi (validation error)
- `401`: Non autenticato
- `403`: Non autorizzato (non admin)
- `500`: Errore server

**Descrizione**: Endpoint aggiornamento ruolo con:

- **Validazione**: Zod schema per `roleId`, `description`, `permissions`
- **Update Parziale**: Aggiorna solo campi forniti (`description` e/o `permissions`)
- **Null Handling**: `description` può essere `null` (rimuove descrizione)

---

## 🔄 Flusso Logico

### GET /api/admin/roles

1. **Autenticazione e Autorizzazione**:
   - Verifica session
   - Verifica ruolo `admin`

2. **Fetch Ruoli**:
   - Query `roles` ordinati per nome

3. **Conteggio Utenti**:
   - Query `profiles` per tutti i ruoli
   - Aggrega conteggio per ruolo: `roleCounts[role]++`

4. **Merge Dati**:
   - Aggiunge `user_count` a ogni ruolo

### PUT /api/admin/roles

1. **Autenticazione e Autorizzazione**:
   - Verifica session
   - Verifica ruolo `admin`

2. **Validazione**:
   - Parse body con Zod schema
   - Ritorna errore 400 se validation fallisce

3. **Update**:
   - Costruisce `updateData` solo con campi forniti
   - `description`: può essere `null` (rimuove)
   - `permissions`: aggiorna oggetto permessi

4. **Response**:
   - Ritorna ruolo aggiornato

---

## 📊 Dipendenze

**Dipende da**: Next.js (`NextRequest`, `NextResponse`), Zod (`z`), Supabase Server Client (`createServerClient`)

**Utilizzato da**: Componente `AdminRolesContent`

---

## ⚠️ Note Tecniche

- **Validation**: Usa Zod per validazione input
- **Partial Update**: Aggiorna solo campi forniti (non richiede tutti i campi)
- **Null Description**: Supporta rimozione descrizione con `null`

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
