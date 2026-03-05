# 📅 AppointmentForm Component - Documentazione Tecnica

**File**: `src/components/calendar/appointment-form.tsx`  
**Classificazione**: React Component, Client Component, Form Component  
**Stato**: ✅ COMPLETO (100%)  
**Ultimo Aggiornamento**: 2025-01-29T16:55:00Z

---

## 📋 Panoramica

Componente React form per creare e modificare appuntamenti. Gestisce validazione client-side, mappatura tipi appuntamento, auto-calcolo orario fine, e integrazione con hook `useAppointments`. Supporta sia creazione che modifica di appuntamenti esistenti.

---

## 🔧 Parametri

### Props

```typescript
interface AppointmentFormProps {
  appointment?: CreateAppointmentData | UpdateAppointmentData | EditAppointmentData
  athletes: Athlete[]
  onSubmit: (data: CreateAppointmentData) => Promise<void> | void
  onCancel: () => void
  loading?: boolean
}
```

**Parametri**:

- `appointment` (opzionale): Dati appuntamento esistente per modifica. Se assente, form in modalità creazione.
- `athletes` (obbligatorio): Array di atleti disponibili per selezione
- `onSubmit` (obbligatorio): Callback chiamato al submit con dati validati. Può essere async.
- `onCancel` (obbligatorio): Callback chiamato quando l'utente annulla
- `loading` (opzionale): Stato caricamento esterno (default: `false`)

---

## 📤 Output

**Tipo**: `JSX.Element`

**Rendering**:

- Card form con header, campi input, e pulsanti azione
- Validazione in tempo reale con messaggi errore
- Disabilitazione form durante submit

**Campi Form**:

1. **Atleta** (obbligatorio): Select dropdown con lista atleti
2. **Data** (obbligatorio): Input date
3. **Orario Inizio** (obbligatorio): Select dropdown (06:00-22:00, ogni 30 min)
4. **Orario Fine** (obbligatorio): Select dropdown (06:00-22:00, ogni 30 min)
5. **Tipo Appuntamento** (obbligatorio): Select dropdown (allenamento, prima_visita, riunione, massaggio, nutrizionista)
6. **Note** (opzionale): Input text

---

## 🔄 Flusso Logico

### 1. Inizializzazione Form Data

```typescript
const getDefaultDateTime = () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(10, 0, 0, 0) // Default: domani alle 10:00

  return {
    date: appointment?.starts_at
      ? appointment.starts_at.split('T')[0]
      : tomorrow.toISOString().split('T')[0],
    start_time: appointment?.starts_at
      ? appointment.starts_at.split('T')[1].substring(0, 5)
      : '10:00',
    end_time: appointment?.ends_at ? appointment.ends_at.split('T')[1].substring(0, 5) : '11:00', // Default: 1 ora dopo
  }
}
```

**Comportamento**:

- **Modifica**: Usa dati appuntamento esistente
- **Creazione**: Default domani alle 10:00, fine 11:00

### 2. Mappatura Tipo Appuntamento

```typescript
const mapAppointmentType = (
  appointmentType: string,
): 'allenamento' | 'cardio' | 'check' | 'consulenza' => {
  switch (appointmentType) {
    case 'allenamento':
      return 'allenamento'
    case 'riunione':
      return 'check'
    case 'prima_visita':
    case 'massaggio':
    case 'nutrizionista':
      return 'consulenza'
    default:
      return 'allenamento'
  }
}
```

**Mappatura UI → Database**:

- `'allenamento'` → `'allenamento'`
- `'riunione'` → `'check'`
- `'prima_visita'`, `'massaggio'`, `'nutrizionista'` → `'consulenza'`

### 3. Generazione Note con Tipo Specifico

```typescript
const getAppointmentNotes = (): string | null => {
  const baseNotes = formData.notes?.trim() || ''

  if (formData.appointment_type === 'prima_visita') {
    return baseNotes ? `${baseNotes} - Prima Visita` : 'Prima Visita'
  }
  if (formData.appointment_type === 'massaggio') {
    return baseNotes ? `${baseNotes} - Massaggio` : 'Massaggio'
  }
  if (formData.appointment_type === 'nutrizionista') {
    return baseNotes ? `${baseNotes} - Nutrizionista` : 'Nutrizionista'
  }

  return baseNotes || null
}
```

**Comportamento**:

- Per consulenze specializzate, aggiunge tipo alle note
- Se note vuote, usa solo il tipo come nota

### 4. Validazione Form

```typescript
const validateForm = () => {
  const newErrors: Record<string, string> = {}

  // Validazioni obbligatorie
  if (!formData.athlete_id) {
    newErrors.athlete_id = 'Seleziona un atleta'
  }
  if (!formData.date) {
    newErrors.date = 'Seleziona una data'
  }
  if (!formData.start_time) {
    newErrors.start_time = 'Seleziona un orario di inizio'
  }
  if (!formData.end_time) {
    newErrors.end_time = 'Seleziona un orario di fine'
  }

  // Validazione data/ora non nel passato
  if (formData.date && formData.start_time) {
    const startDateTime = new Date(`${formData.date}T${formData.start_time}:00`)
    if (startDateTime < new Date()) {
      newErrors.date = 'La data e orario non possono essere nel passato'
    }
  }

  // Validazione orario fine > orario inizio
  if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
    newErrors.end_time = "L'orario di fine deve essere successivo all'orario di inizio"
  }

  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}
```

**Validazioni**:

1. Campi obbligatori non vuoti
2. Data/ora non nel passato
3. Orario fine > orario inizio

**Nota**: ⚠️ **NON verifica sovrapposizioni** (vedi P4-004)

### 5. Auto-Calcolo Orario Fine

```typescript
const handleStartTimeChange = (value: string) => {
  setFormData((prev) => {
    if (value) {
      const [hours, minutes] = value.split(':').map(Number)
      const endTime = new Date()
      endTime.setHours(hours + 1, minutes, 0, 0)
      const endTimeStr = `${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`
      return { ...prev, start_time: value, end_time: endTimeStr }
    }
    return { ...prev, start_time: value }
  })
}
```

**Comportamento**:

- Quando cambia orario inizio, auto-calcola orario fine (+1 ora)
- Utente può comunque modificare manualmente l'orario fine

### 6. Submit Form

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!validateForm()) return
  if (isSubmitting || loading) return

  setIsSubmitting(true)

  try {
    const starts_at = new Date(`${formData.date}T${formData.start_time}:00`).toISOString()
    const ends_at = new Date(`${formData.date}T${formData.end_time}:00`).toISOString()

    const data: CreateAppointmentData = {
      athlete_id: formData.athlete_id!,
      trainer_id: '', // Sarà popolato dal componente padre
      type: mapAppointmentType(formData.appointment_type),
      starts_at,
      ends_at,
      org_id: 'default-org',
      status: 'attivo',
      location: null,
      notes: getAppointmentNotes(),
      recurrence_rule: undefined,
    }

    const result = onSubmit(data)
    if (result instanceof Promise) {
      await result
    }
  } catch (err) {
    console.error('Errore nel form:', err)
    setIsSubmitting(false)
  }
}
```

**Comportamento**:

- Valida form prima di submit
- Costruisce oggetto `CreateAppointmentData` con date ISO
- Chiama `onSubmit` (può essere async)
- Gestisce errori e reset `isSubmitting`

---

## ⚠️ Errori Possibili

### Errori Validazione

- **Campi Obbligatori Vuoti**: Mostra messaggio errore sotto il campo
- **Data/Ora nel Passato**: Mostra errore "La data e orario non possono essere nel passato"
- **Orario Fine <= Orario Inizio**: Mostra errore "L'orario di fine deve essere successivo all'orario di inizio"

### Errori Submit

- **Network Error**: Se `onSubmit` fallisce, errore loggato in console
- **Database Error**: Gestito dal componente padre (es. RLS policy error)

### Errori Formato Data

- **Invalid Date**: Se `appointment.starts_at` non è ISO string valida
  - Sintomo: `Invalid Date` in `getDefaultDateTime`
  - Fix: Verificare formato ISO 8601

---

## 🔗 Dipendenze Critiche

### Dipendenze Esterne

1. **React Hooks** (`useState`, `useEffect`)
   - Gestione stato form e validazione

2. **UI Components** (`@/components/ui`)
   - `Card`, `CardContent`, `CardHeader`, `CardTitle`
   - `Button`, `Input`
   - `SimpleSelect`

3. **Icons** (`lucide-react`)
   - `Calendar`, `Clock`, `User`, `X`

### Dipendenze Interne

- **Types** (`@/types/appointment`): `CreateAppointmentData`, `UpdateAppointmentData`, `EditAppointmentData`
- **Time Options**: Generati staticamente (`TIME_OPTIONS`)

---

## 📝 Esempi d'Uso

### Esempio 1: Creazione Appuntamento

```typescript
import { AppointmentForm } from '@/components/calendar'
import { useAppointments } from '@/hooks/use-appointments'

function CreateAppointmentModal() {
  const { createAppointment, loading } = useAppointments({ userId, role: 'pt' })
  const [athletes, setAthletes] = useState([])

  const handleSubmit = async (data: CreateAppointmentData) => {
    await createAppointment({
      ...data,
      trainer_id: userId, // Popola trainer_id
    })
    // Chiudi modal
  }

  return (
    <AppointmentForm
      athletes={athletes}
      onSubmit={handleSubmit}
      onCancel={() => closeModal()}
      loading={loading}
    />
  )
}
```

### Esempio 2: Modifica Appuntamento

```typescript
const { updateAppointment, loading } = useAppointments({ userId, role: 'pt' })

const handleSubmit = async (data: CreateAppointmentData) => {
  await updateAppointment(appointment.id, {
    ...data,
    trainer_id: userId,
  })
}

<AppointmentForm
  appointment={existingAppointment}
  athletes={athletes}
  onSubmit={handleSubmit}
  onCancel={() => closeModal()}
  loading={loading}
/>
```

### Esempio 3: Con Validazione Sovrapposizioni (Miglioramento Futuro)

```typescript
const { checkOverlap } = useAppointments({ userId, role: 'pt' })

const handleSubmit = async (data: CreateAppointmentData) => {
  // Verifica sovrapposizioni prima di salvare
  const hasOverlap = await checkOverlap(
    userId,
    data.starts_at,
    data.ends_at,
    appointment?.id, // Escludi appuntamento corrente se in modifica
  )

  if (hasOverlap) {
    alert('Esiste già un appuntamento in questo orario!')
    return
  }

  await createAppointment({ ...data, trainer_id: userId })
}
```

---

## 🎯 Side-Effects

### Side-Effects Positivi

1. **State Updates**: Aggiorna `formData`, `errors`, `isSubmitting`
2. **Auto-Calcolo**: Calcola automaticamente orario fine quando cambia orario inizio
3. **Validazione Real-time**: Rimuove errori quando utente inizia a digitare
4. **Console Logging**: Log errori submit

### Side-Effects Negativi (da evitare)

- Nessun side-effect negativo identificato

---

## 🔍 Note Tecniche

### Performance

- **Time Options**: Generati una volta staticamente (non ad ogni render)
- **Validazione**: Eseguita solo al submit (non ad ogni keystroke)
- **Re-render**: Minimizzati con gestione stato locale

### Limitazioni

- **Nessuna Validazione Sovrapposizioni**: Non usa `checkOverlap` (vedi P4-004)
- **Nessuna Gestione Ricorrenze**: Campo `recurrence_rule` sempre `undefined` (vedi P4-005)
- **Trainer ID**: Deve essere popolato dal componente padre (non gestito internamente)

### Miglioramenti Futuri

- Integrare `checkOverlap` per validazione sovrapposizioni
- Aggiungere UI per gestione ricorrenze
- Auto-popolare `trainer_id` da context/hook
- Aggiungere validazione Zod per type safety

---

## 🎨 UI/UX

### Design

- **Card Style**: Variante `trainer` con gradient teal/cyan
- **Layout Compatto**: Grid 3 colonne per data/orari
- **Icons**: Lucide icons per ogni campo
- **Error States**: Messaggi errore rossi sotto campi

### Accessibilità

- **Labels**: Ogni campo ha label associata
- **Required Fields**: Indicati con asterisco (\*)
- **Error Messages**: Descritti chiaramente
- **Disabled States**: Form disabilitato durante submit

---

## 📚 Changelog

### 2025-01-29T16:55:00Z - Documentazione Iniziale

- ✅ Documentazione completa componente `AppointmentForm`
- ✅ Descrizione validazione e mappatura tipi
- ✅ Esempi d'uso
- ✅ Note tecniche e miglioramenti futuri
- ⚠️ Identificato problema P4-004 (validazione sovrapposizioni mancante)
- ⚠️ Identificato problema P4-005 (ricorrenze non implementate)

---

**Stato**: ✅ COMPLETO  
**Prossimi Passi**: Documentare sistema Esercizi
