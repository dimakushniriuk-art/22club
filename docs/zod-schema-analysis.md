# 🔍 Analisi Schema Zod - Verifica Restrittività

Documentazione dell'analisi e allineamento degli schema Zod con il database schema.

## 📋 Overview

Analisi completa degli schema Zod per identificare:

- Schemi troppo restrittivi che bloccano dati validi
- Disallineamenti con database schema
- Vincoli mancanti o eccessivi

## 🔍 Schema Analizzati

### 1. Appointments Schema (`src/lib/validations/appointment.ts`)

**Schema Attuale:**

```typescript
export const createAppointmentSchema = z.object({
  athlete_id: z.string().uuid('ID atleta non valido'),
  staff_id: z.string().uuid('ID staff non valido'),
  type: z.enum(['allenamento', 'cardio', 'check', 'consulenza']),
  starts_at: z.string().datetime('Data inizio non valida'),
  ends_at: z.string().datetime('Data fine non valida'),
  status: z.enum(['attivo', 'completato', 'annullato']).optional().default('attivo'),
  notes: z.string().max(500, 'Note troppo lunghe').optional().nullable(),
  location: z.string().max(200, 'Luogo troppo lungo').optional().nullable(),
  org_id: z.string().optional().default('default-org'),
})
```

**Problemi Potenziali:**

- ✅ `staff_id` potrebbe essere opzionale (alcuni appuntamenti potrebbero non avere staff assegnato)
- ✅ `notes` max 500 caratteri - verificare limite database
- ✅ `location` max 200 caratteri - verificare limite database
- ⚠️ `starts_at` e `ends_at` richiedono formato datetime ISO - potrebbe essere troppo restrittivo per input utente

**Raccomandazioni:**

```typescript
export const createAppointmentSchema = z.object({
  athlete_id: z.string().uuid('ID atleta non valido'),
  staff_id: z.string().uuid('ID staff non valido').optional(), // Rilassato
  type: z.enum(['allenamento', 'cardio', 'check', 'consulenza']),
  starts_at: z.string().datetime('Data inizio non valida').or(z.string().date()), // Accetta anche date
  ends_at: z.string().datetime('Data fine non valida').or(z.string().date()),
  status: z.enum(['attivo', 'completato', 'annullato']).optional().default('attivo'),
  notes: z.string().max(1000, 'Note troppo lunghe').optional().nullable(), // Aumentato se DB lo permette
  location: z.string().max(255, 'Luogo troppo lungo').optional().nullable(), // Standard VARCHAR
  org_id: z.string().optional().default('default-org'),
})
```

### 2. Cliente Schema (`src/lib/validations/cliente.ts`)

**Schema Attuale:**

```typescript
export const clienteSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().min(1).max(100),
  cognome: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().nullable(),
  avatar_url: z.string().url().nullable(),
  // ...
})
```

**Problemi Potenziali:**

- ⚠️ `phone` non ha validazione regex - potrebbe accettare valori non validi
- ⚠️ `avatar_url` richiede URL valido - potrebbe essere troppo restrittivo (potrebbe essere path relativo)
- ✅ `nome` e `cognome` max 100 - verificare limite database

**Raccomandazioni:**

```typescript
export const clienteSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().min(1).max(100),
  cognome: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-()]+$/, 'Numero di telefono non valido')
    .nullable(),
  avatar_url: z.string().url().or(z.string().startsWith('/')).nullable(), // Accetta anche path relativi
  // ...
})
```

### 3. Invito Schema (`src/lib/validations/invito.ts`)

**Schema Attuale:**

```typescript
export const createInvitoSchema = z.object({
  nome_atleta: z.string().trim().min(1, 'Nome obbligatorio').max(100, 'Nome troppo lungo'),
  email: z
    .string()
    .refine(
      (val) => {
        if (!val || val === '') return true
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(val)
      },
      { message: 'Email non valida' },
    )
    .optional(),
  giorni_validita: z
    .number()
    .int()
    .min(1, 'Minimo 1 giorno')
    .max(90, 'Massimo 90 giorni')
    .default(7),
})
```

**Problemi Potenziali:**

- ✅ Email opzionale - corretto
- ✅ Validazione email custom - potrebbe essere sostituita con `.email()` di Zod
- ✅ `giorni_validita` max 90 - verificare se è troppo restrittivo

**Raccomandazioni:**

```typescript
export const createInvitoSchema = z.object({
  nome_atleta: z.string().trim().min(1, 'Nome obbligatorio').max(100, 'Nome troppo lungo'),
  email: z.string().email('Email non valida').optional().or(z.literal('')), // Usa validazione Zod nativa
  giorni_validita: z
    .number()
    .int()
    .min(1, 'Minimo 1 giorno')
    .max(365, 'Massimo 365 giorni')
    .default(7), // Aumentato
})
```

### 4. Allenamento Schema (`src/lib/validations/allenamento.ts`)

**Schema Attuale:**

```typescript
export const allenamentoSchema = z.object({
  durata_minuti: z.number().int().min(0).max(300),
  stato: z.enum(['completato', 'in_corso', 'programmato', 'saltato']),
  // ...
})
```

**Problemi Potenziali:**

- ⚠️ `durata_minuti` max 300 (5 ore) - potrebbe essere troppo restrittivo per sessioni lunghe
- ✅ Enum stati - verificare se corrisponde al database

**Raccomandazioni:**

```typescript
export const allenamentoSchema = z.object({
  durata_minuti: z.number().int().min(0).max(480), // Aumentato a 8 ore
  stato: z.enum(['completato', 'in_corso', 'programmato', 'saltato']),
  // ...
})
```

### 5. Athlete Profile Schema (`src/types/athlete-profile.schema.ts`)

**Problemi Potenziali Identificati:**

#### Anagrafica

- ⚠️ `codice_fiscale`: `.length(16)` - troppo restrittivo (potrebbe essere opzionale o variabile)
- ⚠️ `data_nascita`: `.date()` - potrebbe non accettare datetime
- ✅ `altezza_cm` min 50 max 250 - ragionevole
- ✅ `peso_iniziale_kg` min 20 max 300 - ragionevole

#### Medical

- ⚠️ `certificato_medico_url`: `.url()` - potrebbe essere troppo restrittivo (path relativo)
- ✅ Array validazioni - corrette

#### Fitness

- ✅ `durata_sessione_minuti` min 15 max 300 - ragionevole
- ✅ `giorni_settimana_allenamento` min 1 max 7 - corretto

#### Nutrition

- ⚠️ `calorie_giornaliere_target` min 800 max 10000 - verificare se max è troppo alto
- ✅ `macronutrienti_target` - validazioni ragionevoli

**Raccomandazioni:**

```typescript
// Anagrafica
codice_fiscale: z
  .string()
  .length(16, 'Codice fiscale deve essere di 16 caratteri')
  .regex(/^[A-Z0-9]{16}$/i, 'Codice fiscale non valido')
  .nullable()
  .optional()
  .or(z.string().length(11)), // Accetta anche partita IVA (11 caratteri)

data_nascita: z.string().date('Data di nascita non valida')
  .or(z.string().datetime()) // Accetta anche datetime
  .nullable()
  .optional(),

// Medical
certificato_medico_url: z.string().url('URL certificato non valido')
  .or(z.string().startsWith('/')) // Accetta path relativi
  .nullable()
  .optional(),

// Nutrition
calorie_giornaliere_target: z
  .number()
  .int()
  .min(800, 'Calorie minime 800 kcal')
  .max(8000, 'Calorie massime 8000 kcal') // Ridotto da 10000
  .nullable()
  .optional(),
```

## 🧪 Test di Validazione

### Test Cases da Eseguire

1. **Appointments:**
   - [ ] Creare appuntamento senza `staff_id`
   - [ ] Creare appuntamento con `notes` > 500 caratteri
   - [ ] Creare appuntamento con date in formato diverso da ISO

2. **Cliente:**
   - [ ] Creare cliente con `phone` non valido
   - [ ] Creare cliente con `avatar_url` come path relativo
   - [ ] Creare cliente con `nome` > 100 caratteri

3. **Invito:**
   - [ ] Creare invito con `giorni_validita` > 90
   - [ ] Creare invito senza email
   - [ ] Creare invito con email non valida

4. **Athlete Profile:**
   - [ ] Salvare anagrafica con `codice_fiscale` di 11 caratteri (P.IVA)
   - [ ] Salvare anagrafica con `data_nascita` come datetime
   - [ ] Salvare medical con `certificato_medico_url` come path relativo
   - [ ] Salvare nutrition con `calorie_giornaliere_target` > 8000

## 🔧 Fix Applicati

### Fix 1: Appointments - staff_id opzionale

```typescript
// PRIMA
staff_id: z.string().uuid('ID staff non valido'),

// DOPO
staff_id: z.string().uuid('ID staff non valido').optional(),
```

### Fix 2: Cliente - phone validation

```typescript
// PRIMA
phone: z.string().nullable(),

// DOPO
phone: z.string().regex(/^\+?[0-9\s\-()]+$/, 'Numero di telefono non valido').nullable(),
```

### Fix 3: Invito - email validation semplificata

```typescript
// PRIMA
email: z.string().refine((val) => {
  if (!val || val === '') return true
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(val)
}, { message: 'Email non valida' }).optional(),

// DOPO
email: z.string().email('Email non valida').optional().or(z.literal('')),
```

## 📊 Report Allineamento

### Schema Allineati ✅

- `clienteFiltersSchema` - Allineato
- `allenamentoFiltersSchema` - Allineato
- `invitoFiltersSchema` - Allineato

### Schema da Rivedere ⚠️

- `createAppointmentSchema` - `staff_id` dovrebbe essere opzionale
- `clienteSchema` - `phone` e `avatar_url` validazione migliorabile
- `createInvitoSchema` - `email` validazione semplificabile
- `allenamentoSchema` - `durata_minuti` max aumentabile
- `athleteAnagraficaSchema` - `codice_fiscale` e `data_nascita` più flessibili

## 🎯 Best Practices

1. **Usa validazioni Zod native** quando possibile (`.email()`, `.url()`, etc.)
2. **Rendi opzionali i campi** che possono essere null nel database
3. **Accetta formati multipli** per date/datetime quando appropriato
4. **Verifica limiti database** prima di impostare max length
5. **Testa con dati reali** per identificare restrizioni eccessive

## 🔗 Riferimenti

- [Zod Documentation](https://zod.dev/)
- [Database Schema](../supabase/migrations/)
- [Validation Files](../src/lib/validations/)
