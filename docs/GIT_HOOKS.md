# 🔗 Git Hooks - Configurazione Completa

Questo progetto usa **Husky** per gestire git hooks automatici che garantiscono qualità del codice prima di commit e push.

---

## 📋 Hooks Configurati

### 🔍 Pre-Commit Hook (`.husky/pre-commit`)

**Quando si attiva**: Prima di ogni `git commit`

**Cosa fa** (in sequenza):

1. ✅ **Formatta codice automaticamente** (`npm run format`)
2. ✅ **Corregge ESLint automaticamente** (`npm run lint:fix`)
3. ✅ **Verifica TypeScript** (`npm run typecheck`)
4. ✅ **Verifica ESLint finale** (`npm run lint`)

**Tempo stimato**: 10-30 secondi

**Blocca commit se**:

- Errori TypeScript
- Errori ESLint non correggibili automaticamente

**Fix automatici**:

- Formattazione codice (Prettier)
- Problemi ESLint risolvibili automaticamente

---

### 🚀 Pre-Push Hook (`.husky/pre-push`)

**Quando si attiva**: Prima di ogni `git push`

**Cosa fa** (in sequenza):

1. ✅ **Test unitari completi** (`npm run test:run`)
   - Include tutti i test hooks (17+ file di test hooks)
   - Test in `src/hooks/__tests__/`
   - Test in `src/hooks/athlete-profile/__tests__/`
   - Test in `tests/unit/`
   - Test in `tests/integration/`

2. ✅ **Build produzione** (`npm run build`)
   - Verifica che tutto compili correttamente
   - Build Next.js ottimizzato

3. ⚪ **Verifica servizi** (`npm run verify:all`) - Opzionale
   - Solo se `.env.local` esiste
   - Verifica Next.js, Supabase, Database, Profili

4. ✅ **Pre-deploy check finale** (`npm run pre-deploy`)
   - Package.json
   - Environment files
   - TypeScript check
   - ESLint check
   - Test run
   - Build check

**Tempo stimato**: 3-5 minuti

**Blocca push se**:

- Test falliscono (inclusi test hooks)
- Build fallisce
- Pre-deploy check fallisce

**Permette push se**:

- Solo verifica servizi fallisce (opzionale)

---

## 🧪 Test Hooks Inclusi

Il pre-push hook esegue automaticamente tutti i test hooks:

### Hooks Testati (17+ file):

**Hooks principali:**

- `src/hooks/__tests__/use-appointments.test.ts`
- `src/hooks/__tests__/use-auth.test.ts`
- `src/hooks/__tests__/use-clienti.test.ts`
- `src/hooks/__tests__/use-documents.test.ts`
- `src/hooks/__tests__/use-payments.test.ts`
- `src/hooks/__tests__/use-progress-data.test.ts`
- `src/hooks/__tests__/use-transformed-appointments.test.ts`
- `src/hooks/__tests__/use-workouts.test.ts`

**Hooks athlete-profile:**

- `src/hooks/athlete-profile/__tests__/use-athlete-administrative.test.ts`
- `src/hooks/athlete-profile/__tests__/use-athlete-ai-data.test.ts`
- `src/hooks/athlete-profile/__tests__/use-athlete-anagrafica.test.ts`
- `src/hooks/athlete-profile/__tests__/use-athlete-fitness.test.ts`
- `src/hooks/athlete-profile/__tests__/use-athlete-massage.test.ts`
- `src/hooks/athlete-profile/__tests__/use-athlete-medical.test.ts`
- `src/hooks/athlete-profile/__tests__/use-athlete-motivational.test.ts`
- `src/hooks/athlete-profile/__tests__/use-athlete-nutrition.test.ts`
- `src/hooks/athlete-profile/__tests__/use-athlete-smart-tracking.test.ts`

**Altri test hooks:**

- `tests/unit/hooks.test.tsx`
- `tests/unit/realtime-hooks.test.tsx`
- `tests/integration/hooks.test.tsx`

**Totale**: 17+ file di test hooks eseguiti automaticamente ad ogni push.

---

## 🔧 Configurazione

### Installazione Husky

Husky è già configurato tramite `package.json`:

```json
{
  "scripts": {
    "prepare": "husky install || true"
  },
  "devDependencies": {
    "husky": "^9.1.7"
  }
}
```

L'installazione avviene automaticamente quando esegui `npm install`.

### File Hooks

- `.husky/pre-commit` - Hook pre-commit
- `.husky/pre-push` - Hook pre-push
- `scripts/prepush-check-complete.js` - Script completo pre-push

---

## 🚫 Disabilitare Hooks (Temporaneamente)

### Disabilitare pre-commit:

```bash
git commit --no-verify -m "messaggio"
```

⚠️ **Attenzione**: Usa solo in caso di emergenza!

### Disabilitare pre-push:

```bash
git push --no-verify
```

⚠️ **Attenzione**: Usa solo in caso di emergenza!

---

## ✅ Workflow Completo

### Flusso Automatico:

1. **Fai modifiche al codice**
2. **Fai commit** → Pre-commit hook esegue:
   - Format automatico
   - Lint fix automatico
   - TypeCheck
   - Lint finale
3. **Fai push** → Pre-push hook esegue:
   - Test completi (inclusi test hooks)
   - Build produzione
   - Verifica servizi (opzionale)
   - Pre-deploy check
4. **Push completato** → Codice verificato e pronto!

---

## 📊 Statistiche

### Pre-Commit:

- ✅ Formattazione automatica
- ✅ Fix automatici ESLint
- ✅ 2 controlli (TypeCheck, Lint)
- ⏱️ Tempo: 10-30 secondi

### Pre-Push:

- ✅ Test unitari (368+ test)
- ✅ Test hooks (17+ file)
- ✅ Build produzione
- ✅ Pre-deploy check (9 controlli)
- ⏱️ Tempo: 3-5 minuti

---

## 🔍 Risoluzione Problemi

### Pre-commit fallisce:

```bash
# 1. Verifica errori TypeScript
npm run typecheck

# 2. Verifica errori ESLint
npm run lint

# 3. Correggi automaticamente
npm run format
npm run lint:fix

# 4. Riprova commit
git commit -m "messaggio"
```

### Pre-push fallisce:

```bash
# 1. Verifica test
npm run test:run

# 2. Verifica build
npm run build

# 3. Verifica pre-deploy
npm run pre-deploy

# 4. Correggi errori e riprova push
git push
```

---

## 📝 Note Importanti

1. **Pre-commit è veloce**: Esegue solo controlli rapidi (format, lint, typecheck)
2. **Pre-push è completo**: Esegue test completi, build, e verifica finale
3. **Test hooks inclusi**: Tutti i test hooks vengono eseguiti automaticamente
4. **Tempo totale**: Pre-commit (10-30s) + Pre-push (3-5min) = ~3-6 minuti per push completo
5. **Blocca push se test falliscono**: Garantisce che il codice pushato sia sempre testato

---

## 🎯 Benefici

✅ **Qualità codice garantita**: Ogni commit e push è verificato  
✅ **Test hooks sempre eseguiti**: 17+ file di test hooks verificati ad ogni push  
✅ **Build sempre funzionante**: Build produzione verificata prima di push  
✅ **Nessun codice rotto in repo**: Pre-push blocca push con test falliti  
✅ **Fix automatici**: Format e lint fix automatici in pre-commit

---

## 📝 Documentazione Aggiornata

Ultima revisione: 2026-01-03  
Versione hooks: 2.0  
Husky versione: 9.1.7
