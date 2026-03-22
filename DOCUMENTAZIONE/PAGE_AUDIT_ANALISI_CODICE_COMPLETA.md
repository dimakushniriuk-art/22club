# 🔍 ANALISI CODICE COMPLETA - Appuntamento Non Visibile

**Data**: 2025-01-27  
**Problema**: Appuntamento esiste ma non viene visualizzato nella dashboard

---

## 📊 FLUSSO DEL CODICE

### 1. Server Component: `src/app/dashboard/page.tsx`

**Step 1: Caricamento Profilo Staff**

```typescript
// Linea 168-173: Query diretta su profiles
const { data: profile, error: directError } = await supabase
  .from('profiles')
  .select('id, role, nome, cognome')
  .eq('user_id', user.id)
  .in('role', ['admin', 'pt', 'trainer', 'staff', 'nutrizionista', 'massaggiatore'])
  .single()
```

**Step 2: Query Appuntamenti**

```typescript
// Linea 88-108: Query appointments con staff_id = profileId
const {
  data: todayAppointments,
  error,
  count,
} = await supabase
  .from('appointments')
  .select(
    'id, starts_at, ends_at, type, status, athlete_id, staff_id, athlete:profiles!athlete_id(...)',
  )
  .eq('staff_id', profileId) // ⚠️ QUESTO È IL PUNTO CRITICO
  .gte('starts_at', todayStart)
  .lt('starts_at', todayEnd)
  .is('cancelled_at', null)
```

**Step 3: Trasformazione in AgendaEvent**

```typescript
// Linea 310-439: reduce() che trasforma TodayAppointment[] in AgendaEvent[]
const agendaCandidates = todayAppointments.reduce<AgendaEvent[]>((acc, apt) => {
  // Filtri:
  // - Esclude completati (status === 'completato' || 'completed')
  // - Esclude cancellati (status === 'cancelled' || 'annullato')
  // - NON esclude più appuntamenti passati (rimosso)

  // Trasforma in AgendaEvent
  acc.push({ id, time, athlete, type, status, ... })
  return acc
}, [])
```

**Step 4: Passaggio a Client Component**

```typescript
// Linea 528: Passa agendaData come initialEvents
<AgendaClient
  initialEvents={agendaData}
  hasMoreAppointments={hasMoreAppointments}
  appointmentsTotalCount={appointmentsTotalCount}
  loadError={loadError}
/>
```

### 2. Client Component: `src/app/dashboard/_components/agenda-client.tsx`

**Step 5: Inizializzazione State**

```typescript
// Linea 34: Inizializza events con initialEvents
const [events, setEvents] = useState<AgendaEvent[]>(initialEvents)
```

**Step 6: Passaggio a AgendaTimeline**

```typescript
// Linea 192: Passa events a AgendaTimeline
<AgendaTimeline
  events={events}
  loading={false}
  ...
/>
```

### 3. UI Component: `src/components/dashboard/agenda-timeline.tsx`

**Step 7: Render Empty State**

```typescript
// Linea 301: Se events.length === 0, mostra empty state
if (events.length === 0) {
  return (
    <div>
      <h3>Nessun appuntamento oggi</h3>
      <p>0 totali</p>
      ...
    </div>
  )
}
```

---

## 🔍 PUNTI CRITICI DA VERIFICARE

### Punto 1: profileId Non Corrisponde

**File**: `src/app/dashboard/page.tsx:94`

```typescript
.eq('staff_id', profileId)  // ⚠️ Se profileId ≠ f6fdd6cb-c602-4ced-89a7-41a347e8faa9, query non trova appuntamenti
```

**Verifica**: Log "Profile loaded successfully" → `matches` deve essere "✅ Match"

### Punto 2: Query Non Trova Appuntamenti

**File**: `src/app/dashboard/page.tsx:264`

```typescript
const { todayAppointments, error, count, hasMore } = await cachedAppointments()
```

**Verifica**: Log "Appointments query completed" → `count` deve essere > 0

### Punto 3: Appuntamenti Filtrati

**File**: `src/app/dashboard/page.tsx:327-336`

```typescript
// Escludi appuntamenti completati
if (statusValue === 'completato' || statusValue === 'completed') {
  return acc
}

// Escludi appuntamenti cancellati
if (statusValue === 'cancelled' || statusValue === 'annullato') {
  return acc
}
```

**Verifica**: Log "Excluding" per vedere se l'appuntamento viene escluso

### Punto 4: agendaData Vuoto

**File**: `src/app/dashboard/page.tsx:448`

```typescript
agendaData = agendaCandidates.sort(...)
```

**Verifica**: Log "Agenda candidates processed" → `total` deve essere > 0

### Punto 5: initialEvents Vuoto

**File**: `src/app/dashboard/_components/agenda-client.tsx:34`

```typescript
const [events, setEvents] = useState<AgendaEvent[]>(initialEvents)
```

**Verifica**: Log "AgendaClient - component mounted" → `initialEventsLength` deve essere > 0

---

## 🐛 POSSIBILI BUG IDENTIFICATI

### Bug 1: Cache Mostra Risultati Vecchi

**File**: `src/app/dashboard/page.tsx:247-262`

- Cache con `revalidate: 10` potrebbe mostrare risultati vecchi
- Se l'appuntamento è stato appena creato, potrebbe essere in cache vuota

**Fix**: Disabilitare temporaneamente cache o ridurre a 0

### Bug 2: profileId Mismatch

**File**: `src/app/dashboard/page.tsx:94`

- Se `profileId` trovato non corrisponde a `f6fdd6cb-c602-4ced-89a7-41a347e8faa9`, query non trova appuntamenti

**Fix**: Verificare quale `profileId` viene trovato e perché non corrisponde

### Bug 3: Status Filtro Errato

**File**: `src/app/dashboard/page.tsx:327-336`

- Se `status` dell'appuntamento è diverso da quello atteso, viene filtrato

**Verifica**: L'appuntamento ha `status = 'attivo'`, quindi NON dovrebbe essere filtrato

---

## ✅ SOLUZIONI PROPOSTE

### Soluzione 1: Disabilitare Cache Temporaneamente

```typescript
// Rimuovi unstable_cache e chiama direttamente
const { todayAppointments, error, count, hasMore } = await getTodayAppointments(...)
```

### Soluzione 2: Aggiungere Logging Dettagliato

- ✅ Già fatto: logging aggiunto in tutti i punti critici

### Soluzione 3: Verificare profileId

- ✅ Già fatto: logging mostra `matches` per verificare corrispondenza

---

## 📋 CHECKLIST DIAGNOSTICA

- [ ] Verifica log "Profile loaded successfully" → `profileId` e `matches`
- [ ] Verifica log "Appointments query completed" → `count` e `appointmentsLength`
- [ ] Verifica log "Agenda candidates processed" → `total` e `filteredOut`
- [ ] Verifica log "AgendaClient - component mounted" → `initialEventsLength`
- [ ] Verifica che `agendaData.length > 0` prima di passare a `AgendaClient`

---

**Status**: ⚠️ **IN ANALISI** - Verificare log console browser
