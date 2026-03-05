# 🔧 Script Risoluzione Automatica Errori Build

Questo script analizza e risolve automaticamente gli errori di build TypeScript uno alla volta.

## 📋 Algoritmo

1. **Esegue `npm run build`**
2. **Analizza gli errori TypeScript** dal output
3. **Seleziona il primo errore** da risolvere
4. **Applica strategie di fix** automatiche:
   - Tipizzazione esplicita per query Supabase (`type 'never'`)
   - Workaround `as any` per inferenza tipo Supabase
   - Rimozione import/variabili non utilizzate
   - Type assertion per parametri
5. **Ripete** fino a quando:
   - ✅ Build completa con successo
   - ⚠️ Nessun fix automatico disponibile
   - ⚠️ Numero errori non diminuisce
   - ⚠️ Raggiunto limite iterazioni (50)

## 🚀 Uso

### Script TypeScript (Raccomandato)

```bash
npx tsx scripts/fix-build-errors.ts
```

### Script Bash (Alternativo)

```bash
chmod +x scripts/fix-build-errors.sh
./scripts/fix-build-errors.sh
```

## 🎯 Strategie di Fix Implementate

### 1. Property 'X' does not exist on type 'never'

**Causa**: Query Supabase con `.select()` non tipizzate correttamente

**Fix**: Aggiunge type assertion esplicita

```typescript
type ProfileData = { role?: string }
const profileData = (profile as ProfileData) || null
```

### 2. Type 'X' is not assignable to parameter of type 'never'

**Causa**: Inferenza tipo Supabase fallisce per `.update()` / `.insert()`

**Fix**: Aggiunge workaround `as any`

```typescript
await (supabase.from('profiles') as any).update(data as any)
```

### 3. 'X' is defined but never used

**Causa**: Import o variabile non utilizzata

**Fix**: Rimuove dall'import o dalla dichiarazione

### 4. Argument of type 'X' is not assignable

**Causa**: Parametri non tipizzati correttamente

**Fix**: Aggiunge type assertion al parametro

## 📝 Note

- Lo script risolve **un errore alla volta** per evitare sovraccarico
- Se un errore non può essere risolto automaticamente, lo script si ferma e mostra i dettagli
- Lo script mantiene un limite di 50 iterazioni per evitare loop infiniti
- Se il numero di errori non diminuisce tra iterazioni, lo script si ferma

## 🔍 Debug

Per vedere l'output completo del build:

```bash
npm run build 2>&1 | tee build-output.log
```

## ⚠️ Limitazioni

- Non risolve errori di sintassi
- Non risolve errori di logica
- Non risolve errori che richiedono modifiche architetturali
- Si concentra solo su errori TypeScript comuni con Supabase

## 🛠️ Estensione

Per aggiungere nuove strategie di fix, modifica `FIX_STRATEGIES` in `fix-build-errors.ts`:

```typescript
{
  pattern: /Nuovo pattern errore/,
  description: "Descrizione fix",
  fix: (error, content) => {
    // Logica di fix
    return fixedContent || null
  }
}
```
