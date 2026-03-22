# 🔧 FIX RIMANENTI - Alert/Confirm Nativi in Altre Pagine

**Data**: 2025-01-27  
**Status**: ⚠️ **DA IMPLEMENTARE**

---

## 📋 OVERVIEW

Durante l'audit della dashboard principale (`/dashboard`), abbiamo risolto tutti i problemi critici. Tuttavia, ci sono ancora `alert()` e `confirm()` nativi in altre pagine del dashboard che dovrebbero essere sostituiti con Dialog accessibili.

---

## 🔍 PROBLEMI IDENTIFICATI

### Pagine con `alert()` e `confirm()` nativi:

1. **`src/app/dashboard/esercizi/page.tsx`**
   - ❌ `confirm()` - Linea 228

2. **`src/app/dashboard/abbonamenti/page.tsx`**
   - ❌ `confirm()` - Linea 623

3. **`src/app/dashboard/invita-atleta/page.tsx`**
   - ❌ `confirm()` - Linea 241, 270
   - ❌ `alert()` - Linea 248, 279

4. **`src/app/dashboard/pagamenti/page.tsx`**
   - ❌ `confirm()` - Linea 86
   - ❌ `alert()` - Linea 99, 121

5. **`src/app/dashboard/impostazioni/page.tsx`**
   - ❌ `confirm()` - Linea 363
   - ❌ `alert()` - Linea 333, 338, 350, 356

6. **`src/app/dashboard/profilo/page.tsx`**
   - ❌ `alert()` - Linea 106

7. **`src/components/dashboard/pagamenti/new-payment-modal.tsx`**
   - ❌ `alert()` - Linea 26

8. **`src/components/dashboard/export-report-button.tsx`**
   - ❌ `alert()` - Linea 21

---

## ✅ SOLUZIONE

### Strategia:

1. **Riutilizzare `ConfirmDialog`** già creato (`src/components/shared/ui/confirm-dialog.tsx`)
2. **Sostituire `alert()`** con toast (già disponibile via `useToast`)
3. **Sostituire `confirm()`** con `ConfirmDialog`

### Componenti Disponibili:

- ✅ `ConfirmDialog` - Già creato e testato
- ✅ `useToast` - Già disponibile in tutto il progetto

---

## 📝 CHECKLIST FIX

### Priorità Alta (Pagine più usate):

- [ ] ⏳ `src/app/dashboard/pagamenti/page.tsx` - 3 occorrenze
- [ ] ⏳ `src/app/dashboard/impostazioni/page.tsx` - 5 occorrenze
- [ ] ⏳ `src/app/dashboard/invita-atleta/page.tsx` - 4 occorrenze

### Priorità Media:

- [ ] ⏳ `src/app/dashboard/esercizi/page.tsx` - 1 occorrenza
- [ ] ⏳ `src/app/dashboard/abbonamenti/page.tsx` - 1 occorrenza
- [ ] ⏳ `src/app/dashboard/profilo/page.tsx` - 1 occorrenza

### Priorità Bassa (Componenti):

- [ ] ⏳ `src/components/dashboard/pagamenti/new-payment-modal.tsx` - 1 occorrenza
- [ ] ⏳ `src/components/dashboard/export-report-button.tsx` - 1 occorrenza

**Totale**: 8 file, ~17 occorrenze

---

## 🎯 ESEMPIO FIX

### Prima (❌):

```typescript
const handleDelete = () => {
  if (confirm('Sei sicuro di voler eliminare questo elemento?')) {
    // Elimina
  }
}
```

### Dopo (✅):

```typescript
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

const handleDelete = () => {
  setDeleteDialogOpen(true)
}

const handleDeleteConfirm = async () => {
  // Elimina
  setDeleteDialogOpen(false)
}

return (
  <>
    <Button onClick={handleDelete}>Elimina</Button>
    <ConfirmDialog
      open={deleteDialogOpen}
      onOpenChange={setDeleteDialogOpen}
      title="Elimina elemento"
      description="Sei sicuro di voler eliminare questo elemento?"
      confirmText="Elimina"
      cancelText="Annulla"
      variant="destructive"
      onConfirm={handleDeleteConfirm}
    />
  </>
)
```

---

## 📊 STIMA

### Complessità:

- **Piccola**: 1-2 occorrenze per file
- **Media**: 3-5 occorrenze per file

### Tempo Stimato:

- **Priorità Alta**: ~2-3 ore
- **Priorità Media**: ~1-2 ore
- **Priorità Bassa**: ~30 minuti

**Totale**: ~4-6 ore

---

## ✅ CRITERI DI ACCETTAZIONE

### Fix Completato se:

- ✅ Nessun `alert()` o `confirm()` nativo rimasto in dashboard
- ✅ Tutti i `confirm()` sostituiti con `ConfirmDialog`
- ✅ Tutti gli `alert()` sostituiti con toast
- ✅ Focus management corretto (già implementato in `ConfirmDialog`)
- ✅ Accessibilità verificata (WCAG AA)

---

## 🎯 PRIORITÀ

### Implementare Subito:

1. **Pagine più usate** (pagamenti, impostazioni, invita-atleta)
2. **Pagine critiche** (esercizi, abbonamenti)

### Implementare in Seguito:

1. **Componenti riusabili** (new-payment-modal, export-report-button)

---

## 📝 NOTE

### Vantaggi:

- ✅ Accessibilità migliorata (WCAG AA)
- ✅ UX migliorata (Dialog più belli e accessibili)
- ✅ Coerenza con resto dell'app (stesso pattern usato in dashboard principale)

### Rischi:

- ⚠️ Basso rischio (solo sostituzione UI, logica invariata)
- ⚠️ Test necessario per verificare che tutto funzioni

---

**Status**: ✅ **COMPLETATO AL 100%** (8 file, 17 occorrenze sostituite)
