# 🔍 Code Review Issues - Riepilogo e Soluzioni

Documento che riassume i problemi identificati durante la code review e le soluzioni proposte.

## 📊 Overview

**Data Review**: 2025-02-16  
**Stato**: In Progress  
**Issues Totali**: ~22 TODO/FIXME + Lint warnings

---

## 🔴 Criticità Prioritarie

### 1. Regola `@typescript-eslint/no-require-imports`

**Problema**: Uso di `require()` invece di `import` in configurazioni e test.

**File Coinvolti**:

- `next.config.ts`
- `next.config.production.ts`
- File test/unit e mock

**Rischio**: Build bloccata dal lint; mancata coerenza ESM con Next.js 15.

**Soluzione**:

```typescript
// ❌ SBAGLIATO
const config = require('./config')

// ✅ CORRETTO
import config from './config'

// Se necessario CommonJS
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
```

**Azione**: Convertire tutti i `require()` in `import` o migrare file a ESM (`.mjs`/`tsconfig`).

---

### 2. Violazioni `react-hooks/rules-of-hooks`

**Problema**: Hook chiamati condizionalmente.

**File Coinvolti**:

- `src/hooks/useRealtimeChannel.ts`
- `tests/__mocks__/framer-motion.tsx`

**Rischio**: Comportamento runtime imprevedibile.

**Soluzione**:

```typescript
// ❌ SBAGLIATO
if (condition) {
  useEffect(() => {
    // ...
  }, [])
}

// ✅ CORRETTO
useEffect(() => {
  if (condition) {
    // ...
  }
}, [condition])
```

**Azione**: Spostare hook fuori dai percorsi condizionali; rifattorizzare mock.

---

### 3. Cleanup Script CLI (`prefer-const`, `any`)

**Problema**: Variabili `let` invece di `const`, uso di `any`.

**File Coinvolti**:

- `scripts/create-test-athletes.ts`
- `scripts/create-workout-script.ts`
- Altri script CLI

**Soluzione**:

```typescript
// ❌ SBAGLIATO
let data: any = {}
let result = await query()

// ✅ CORRETTO
const data: TablesInsert<'profiles'> = {}
const result = await query()
```

**Azione**: Promuovere variabili a `const`, introdurre tipi espliciti (`TablesInsert`, interfacce dedicate).

---

## 🟡 Warning Rilevanti

### Import Inutilizzati / Variabili Non Usate

**File Coinvolti**:

- Pagine dashboard
- Modali
- Script

**Esempi**:

- `CardHeader` importato ma non usato
- `toast` importato ma non usato
- `user` importato ma non usato
- `router` importato ma non usato

**Soluzione**:

```typescript
// ❌ SBAGLIATO
import { CardHeader } from '@/components/ui'
import { toast } from '@/hooks/use-toast'

// ✅ CORRETTO - Rimuovere se non usato
// Oppure prefissare con _ se placeholder intenzionale
import { _unused } from '@/components/ui'
```

**Azione**: Rimuovere import non utilizzati o prefissare con `_` se placeholder intenzionale.

---

### `any` Diffusi

**File Coinvolti**:

- Hook (`use-clienti`, `use-chat`, `use-workouts`)
- Componenti calendario
- Mock

**Soluzione**:

```typescript
// ❌ SBAGLIATO
function processData(data: any) {
  return data.map((item: any) => item.id)
}

// ✅ CORRETTO
function processData(data: Tables<'profiles'>[]) {
  return data.map((item) => item.id)
}
```

**Azione**: Sostituire con tipi Supabase (`Tables`, `TablesInsert`) o tipi di dominio.

---

### Regole React (`react-hooks/exhaustive-deps`)

**File Coinvolti**:

- `dashboard/atleti/[id]`
- `nuovo-pagamento-modal`
- `two-factor-setup`

**Problema**: Dipendenze mancanti o eccessive in `useEffect`, `useCallback`, `useMemo`.

**Soluzione**:

```typescript
// ❌ SBAGLIATO
useEffect(() => {
  fetchData(userId)
}, []) // userId mancante

// ✅ CORRETTO
useEffect(() => {
  fetchData(userId)
}, [userId])
```

**Azione**: Riesaminare dipendenze e memorizzazioni (`useCallback`, `useMemo`).

---

### Accessibilità / Testo

**File Coinvolti**:

- `document-uploader.tsx`
- Altri componenti con immagini/testo

**Problemi**:

- Manca `alt` in immagini
- Apostrofi non escapati (`'` invece di `&apos;`)

**Soluzione**:

```typescript
// ❌ SBAGLIATO
<img src={url} />
<p>L'utente</p>

// ✅ CORRETTO
<img src={url} alt="Descrizione immagine" />
<p>L&apos;utente</p>
```

**Azione**: Aggiungere `alt` in immagini, escapare apostrofi.

---

### Config/PostCSS

**Problema**: Esportazioni anonime in `postcss.config.mjs`.

**Soluzione**:

```javascript
// ❌ SBAGLIATO
export default {
  plugins: {}
}

// ✅ CORRETTO
const config = {
  plugins: {}
}
export default config
```

**Azione**: Rinominare esportazioni anonime.

---

## 📝 TODO/FIXME/HACK/BUG

### TODO (22 trovati)

**Priorità Alta**:

- [ ] TODO critici da risolvere prima del deploy

**Priorità Media**:

- [ ] TODO importanti da risolvere in prossima release

**Priorità Bassa**:

- [ ] TODO nice-to-have per future release

**Azione**:

1. Risolvere TODO critici
2. Documentare TODO rimanenti
3. Creare issue per TODO futuri

---

## 🔧 Console.log e Debugging

### Console Statements

**Problema**: Uso di `console.log` invece di logger.

**Soluzione**:

```typescript
// ❌ SBAGLIATO
console.log('User logged in', userId)
console.error('Error:', error)

// ✅ CORRETTO
import { logger } from '@/lib/logger'
logger.info('User logged in', { userId })
logger.error('Error:', error)
```

**Azione**: Sostituire tutti i `console.log/error/warn` con logger.

---

### Debugger Statements

**Problema**: `debugger` statements nel codice.

**Azione**: Rimuovere tutti i `debugger` statements.

---

## 🎯 Piano di Azione

### Fase 1: Criticità (1-2 giorni)

1. ✅ Convertire `require()` in `import`
2. ✅ Fix hook condizionali
3. ✅ Cleanup script CLI

### Fase 2: Warning Importanti (2-3 giorni)

1. ⏳ Rimuovere import inutilizzati
2. ⏳ Sostituire `any` con tipi corretti
3. ⏳ Fix dipendenze React hooks
4. ⏳ Fix accessibilità

### Fase 3: Polish (1-2 giorni)

1. ⏳ Rimuovere console.log
2. ⏳ Rimuovere debugger
3. ⏳ Review TODO/FIXME
4. ⏳ Rimuovere codice commentato

---

## 📊 Metriche Target

- **TypeScript Errors**: 0 ✅
- **ESLint Errors**: 0 ✅
- **ESLint Warnings**: < 100 ⏳
- **TODO/FIXME**: < 20 (tutti documentati) ⏳
- **console.log**: 0 ⏳
- **debugger**: 0 ⏳
- **any types**: < 10 ⏳

---

## 🔗 Riferimenti

- [Code Review Checklist](./CODE_REVIEW_CHECKLIST.md)
- [Hard Plan](../hard.plan.md)
- [ESLint Config](../eslint.config.mjs)
- [TypeScript Config](../tsconfig.json)

---

**Ultimo aggiornamento**: 2025-02-16
