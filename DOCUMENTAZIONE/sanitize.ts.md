# 📚 Documentazione Tecnica: sanitize.ts

**Percorso**: `src/lib/sanitize.ts`  
**Tipo Modulo**: Utility Functions (Pure Functions)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-01-29T14:45:00Z

---

## 📋 Panoramica

Modulo di utilità per sanitizzazione e validazione input utente. Tutte le funzioni sono **pure** (no side-effects) e sincrone.

---

## 🔧 Funzioni

### 1. `sanitizeString`

**Classificazione**: Pure Function, Synchronous  
**Tipo**: `(value: string | null | undefined, maxLength?: number) => string | null`

**Parametri**:

- `value` (string | null | undefined): Valore da sanitizzare
- `maxLength` (number, opzionale): Lunghezza massima consentita

**Output**: Stringa sanitizzata o `null` se vuota

**Descrizione**: Sanitizza una stringa rimuovendo spazi iniziali/finali e caratteri di controllo pericolosi.

**Flusso Logico**:

1. Verifica se `value` è null/undefined → ritorna `null`
2. Applica `trim()` per rimuovere spazi iniziali/finali
3. Se `maxLength` è specificato e la stringa supera il limite, tronca
4. Rimuove caratteri di controllo (eccetto newline e tab per textarea)
5. Ritorna stringa sanitizzata o `null` se vuota

**Side-effects**: Nessuno

**Errori Possibili**: Nessuno (gestisce tutti i casi edge)

**Dipendenze**: Nessuna

**Esempi d'Uso**:

```typescript
sanitizeString('  Hello World  ') // "Hello World"
sanitizeString('Test', 2) // "Te"
sanitizeString(null) // null
```

**Utilizzato da**: Tutti i form components, hooks di validazione

---

### 2. `sanitizeStringArray`

**Classificazione**: Pure Function, Synchronous  
**Tipo**: `(values: (string | null | undefined)[] | null | undefined, maxLength?: number) => string[]`

**Parametri**:

- `values` (array | null | undefined): Array di valori da sanitizzare
- `maxLength` (number, opzionale): Lunghezza massima per ogni elemento

**Output**: Array sanitizzato senza duplicati

**Flusso Logico**:

1. Verifica se `values` è null/undefined o non è array → ritorna `[]`
2. Mappa ogni elemento con `sanitizeString()`
3. Filtra null/undefined e stringhe vuote
4. Rimuove duplicati usando `Set`
5. Ritorna array sanitizzato

**Utilizzato da**: Hooks che gestiscono array di stringhe (es. tags, categorie)

---

### 3. `sanitizeNumber`

**Classificazione**: Pure Function, Synchronous  
**Tipo**: `(value: number | string | null | undefined, min?: number, max?: number) => number | null`

**Parametri**:

- `value`: Valore numerico da sanitizzare
- `min` (opzionale): Valore minimo consentito
- `max` (opzionale): Valore massimo consentito

**Output**: Numero sanitizzato o `null` se invalido

**Flusso Logico**:

1. Verifica se `value` è null/undefined/stringa vuota → ritorna `null`
2. Converte stringa in numero con `parseFloat()`
3. Verifica se è `NaN` → ritorna `null`
4. Applica `min` se specificato e valore < min
5. Applica `max` se specificato e valore > max
6. Ritorna numero sanitizzato

**Utilizzato da**: Form numerici, validazioni metriche

---

### 4. `sanitizeEmail`

**Classificazione**: Pure Function, Synchronous  
**Tipo**: `(email: string | null | undefined) => string | null`

**Output**: Email sanitizzata (lowercase, trimmed) o `null` se formato invalido

**Flusso Logico**:

1. Verifica se `email` è null/undefined → ritorna `null`
2. Applica `trim()` e `toLowerCase()`
3. Valida formato base con regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
4. Ritorna email sanitizzata o `null` se invalida

**Nota**: Validazione più dettagliata in Zod schemas

**Utilizzato da**: Form registrazione, form profilo

---

### 5. `sanitizePhone`

**Classificazione**: Pure Function, Synchronous  
**Tipo**: `(phone: string | null | undefined) => string | null`

**Output**: Telefono sanitizzato o `null` se vuoto

**Flusso Logico**:

1. Verifica se `phone` è null/undefined → ritorna `null`
2. Applica `trim()`
3. Mantiene solo numeri, `+`, spazi, trattini, parentesi (per formati internazionali)
4. Rimuove tutti gli altri caratteri
5. Ritorna telefono sanitizzato o `null` se vuoto

**Utilizzato da**: Form anagrafica, form contatti

---

### 6. `sanitizeUrl`

**Classificazione**: Pure Function, Synchronous  
**Tipo**: `(url: string | null | undefined) => string | null`

**Output**: URL sanitizzato o `null` se invalido

**Flusso Logico**:

1. Verifica se `url` è null/undefined → ritorna `null`
2. Applica `trim()`
3. Valida formato con `new URL()` (lancia eccezione se invalido)
4. Ritorna URL sanitizzato o `null` se invalido

**Utilizzato da**: Form link esterni, documenti

---

### 7. `escapeHtml`

**Classificazione**: Pure Function, Synchronous  
**Tipo**: `(text: string | null | undefined) => string`

**Output**: Testo con caratteri HTML escapati

**Descrizione**: Prevenzione XSS - escape caratteri HTML pericolosi

**Flusso Logico**:

1. Verifica se `text` è null/undefined → ritorna stringa vuota
2. Sostituisce caratteri pericolosi con entità HTML:
   - `&` → `&amp;`
   - `<` → `&lt;`
   - `>` → `&gt;`
   - `"` → `&quot;`
   - `'` → `&#039;`
3. Ritorna testo escapato

**Utilizzato da**: Rendering contenuti utente, prevenzione XSS

---

### 8. `sanitizeFilename`

**Classificazione**: Pure Function, Synchronous  
**Tipo**: `(filename: string | null | undefined) => string`

**Output**: Nome file sanitizzato e sicuro

**Descrizione**: Prevenzione path traversal e caratteri pericolosi

**Flusso Logico**:

1. Verifica se `filename` è null/undefined → ritorna stringa vuota
2. Estrae solo nome file (rimuove path directory)
3. Rimuove caratteri pericolosi: `..`, `/`, `\`, `<`, `>`, `|`, `` ` ``, `&`, `;`, caratteri di controllo
4. Limita lunghezza a 255 caratteri (compatibilità filesystem)
5. Se dopo sanitizzazione è vuoto, usa nome default `file_${timestamp}`
6. Ritorna nome file sanitizzato

**Utilizzato da**: Upload file, gestione documenti

---

### 9. `isSafeStoragePath`

**Classificazione**: Pure Function, Synchronous  
**Tipo**: `(path: string | null | undefined) => boolean`

**Output**: `true` se il path è sicuro, `false` altrimenti

**Descrizione**: Verifica sicurezza path storage (previene path traversal)

**Flusso Logico**:

1. Verifica se `path` è null/undefined → ritorna `false`
2. Verifica path traversal: `../`, `..\\`, `..`
3. Verifica che non inizi con `/` o `\`
4. Verifica caratteri pericolosi: `<`, `>`, `|`, `` ` ``, `&`, `;`
5. Verifica encoding path traversal: `%2e%2e`, `%2E%2E`
6. Ritorna `true` se sicuro, `false` altrimenti

**Utilizzato da**: Storage operations, file upload

---

### 10. `sanitizeJsonb`

**Classificazione**: Pure Function, Synchronous, Recursive  
**Tipo**: `(obj: Record<string, unknown> | null | undefined) => Record<string, unknown> | null`

**Output**: Oggetto JSONB sanitizzato o `null`

**Descrizione**: Sanitizza oggetto JSONB ricorsivamente

**Flusso Logico**:

1. Verifica se `obj` è null/undefined o non è oggetto → ritorna `null`
2. Crea nuovo oggetto sanitizzato
3. Per ogni chiave-valore:
   - Sanitizza chiave con `sanitizeString()`
   - Sanitizza valore in base al tipo:
     - `string` → `sanitizeString()`
     - `number` → `sanitizeNumber()`
     - `array` → mappa ricorsivamente
     - `object` → chiamata ricorsiva `sanitizeJsonb()`
     - altri tipi → mantiene valore originale
4. Ritorna oggetto sanitizzato

**Utilizzato da**: Hooks che gestiscono dati JSONB (es. smart tracking, AI data)

---

### 11. `sanitizeJsonbArray`

**Classificazione**: Pure Function, Synchronous  
**Tipo**: `(arr: (Record<string, unknown> | null | undefined)[] | null | undefined) => Array<Record<string, unknown>>`

**Output**: Array di oggetti JSONB sanitizzati

**Flusso Logico**:

1. Verifica se `arr` è null/undefined o non è array → ritorna `[]`
2. Mappa ogni elemento con `sanitizeJsonb()`
3. Filtra elementi `null`
4. Ritorna array sanitizzato

**Utilizzato da**: Hooks che gestiscono array JSONB

---

### 12. `normalizeSesso`

**Classificazione**: Pure Function, Synchronous  
**Tipo**: `(sesso: string | null | undefined) => 'maschio' | 'femmina' | 'altro' | 'non_specificato' | null`

**Output**: Valore sesso normalizzato o `null`

**Descrizione**: Normalizza campo sesso convertendo valori abbreviati/alternativi in valori standard

**Flusso Logico**:

1. Verifica se `sesso` è null/undefined → ritorna `null`
2. Converte in lowercase e applica `trim()`
3. Verifica valori per "maschio": `m`, `maschio`, `male`, `uomo` → ritorna `'maschio'`
4. Verifica valori per "femmina": `f`, `femmina`, `female`, `donna` → ritorna `'femmina'`
5. Verifica valori per "altro": `altro`, `other` → ritorna `'altro'`
6. Verifica valori per "non_specificato": `non_specificato`, `non specificato`, `not_specified` → ritorna `'non_specificato'`
7. Se non corrisponde a nessun valore valido → ritorna `null`

**Utilizzato da**: Hook `use-athlete-anagrafica.ts`, validazione form anagrafica

**Esempi d'Uso**:

```typescript
normalizeSesso('M') // "maschio"
normalizeSesso('F') // "femmina"
normalizeSesso('male') // "maschio"
normalizeSesso('non specificato') // "non_specificato"
normalizeSesso('invalid') // null
```

---

## 🔗 Dipendenze

**Nessuna dipendenza esterna** - funzioni pure standalone

---

## ⚠️ Errori Possibili

Tutte le funzioni gestiscono gracefully i casi edge:

- Valori `null`/`undefined` → ritornano valori di default sicuri
- Conversioni fallite → ritornano `null` o valori di default
- Nessuna eccezione lanciata

---

## 📝 Changelog

### 2025-01-29

- ✅ Aggiunta funzione `normalizeSesso()` per normalizzazione campo sesso
- ✅ Funzione utilizzata per risolvere problema validazione Zod (VAL-001)

---

**Ultimo aggiornamento**: 2025-01-29T14:45:00Z
