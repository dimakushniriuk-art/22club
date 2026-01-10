# 📚 Documentazione Tecnica: useAthleteNutritionForm

**Percorso**: `src/hooks/athlete-profile/use-athlete-nutrition-form.ts`  
**Tipo Modulo**: React Hook (Form Management Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-01T23:50:00Z

---

## 📋 Panoramica

Hook per gestione form dati nutrizionali atleta. Gestisce stato form, validazione, sanitizzazione, salvataggio con React Query mutation, e gestione array dinamici (intolleranze, allergie, alimenti preferiti/evitati, spuntini).

---

## 🔧 Funzioni e Export

### 1. `useAthleteNutritionForm`

**Classificazione**: React Hook, Form Management Hook, Client Component  
**Tipo**: `(props: UseAthleteNutritionFormProps) => UseAthleteNutritionFormReturn`

**Parametri**:

- `nutrition` (object | null): Dati nutrizionali esistenti
  - `obiettivo_nutrizionale`: `ObiettivoNutrizionaleEnum | null`
  - `calorie_giornaliere_target`: `number | null`
  - `macronutrienti_target`: `MacronutrientiTarget | null`
  - `dieta_seguita`: `DietaEnum | null`
  - `intolleranze_alimentari`: `string[]`
  - `allergie_alimentari`: `string[]`
  - `alimenti_preferiti`: `string[]`
  - `alimenti_evitati`: `string[]`
  - `preferenze_orari_pasti`: `PreferenzeOrariPasti | null`
  - `note_nutrizionali`: `string | null`
- `athleteId` (string): UUID dell'atleta

**Output**: Oggetto con:

- `isEditing`: `boolean` - Stato modifica form
- `setIsEditing`: `(value: boolean) => void` - Setter stato modifica
- `formData`: `AthleteNutritionDataUpdate` - Dati form correnti
- `setFormData`: `(data: AthleteNutritionDataUpdate) => void` - Setter dati form
- `newArrayItem`: `object` - Item temporaneo per array dinamici
- `setNewArrayItem`: `(item: object) => void` - Setter item temporaneo
- `handleSave`: `() => Promise<void>` - Salva dati form
- `handleCancel`: `() => void` - Annulla modifiche
- `addArrayItem`: `(field, value) => void` - Aggiunge item a array
- `removeArrayItem`: `(field, index) => void` - Rimuove item da array
- `updateMacronutrienti`: `(field, value) => void` - Aggiorna macronutrienti
- `updateOrarioPasto`: `(pasto, value) => void` - Aggiorna orario pasto
- `addSpuntino`: `(orario) => void` - Aggiunge spuntino
- `removeSpuntino`: `(index) => void` - Rimuove spuntino
- `updateMutation`: React Query mutation object

**Descrizione**: Hook completo per gestione form nutrizione con:

- Inizializzazione automatica da dati esistenti
- Sanitizzazione input (stringhe, numeri, array, JSONB)
- Validazione Zod prima del salvataggio
- Gestione array dinamici (intolleranze, allergie, alimenti, spuntini)
- Gestione macronutrienti (proteine, carboidrati, grassi)
- Gestione orari pasti (colazione, pranzo, cena, spuntini)
- Toast notifications per successo/errore

---

## 🔄 Flusso Logico

### Inizializzazione

1. Hook riceve `nutrition` e `athleteId`
2. `useEffect` inizializza `formData` quando `nutrition` cambia e non si sta editando
3. Valori default per campi mancanti

### Modifica Form

1. Utente clicca "Modifica" → `setIsEditing(true)`
2. Utente modifica campi → `setFormData` aggiorna stato
3. Per array dinamici:
   - `addArrayItem`: sanitizza, verifica duplicati, aggiunge
   - `removeArrayItem`: rimuove per indice
4. Per macronutrienti: `updateMacronutrienti` con validazione range
5. Per orari pasti: `updateOrarioPasto` con formato HH:MM
6. Per spuntini: `addSpuntino` / `removeSpuntino`

### Salvataggio

1. Utente clicca "Salva" → `handleSave()`
2. `sanitizeFormData()` sanitizza tutti i campi:
   - Stringhe: max length, trim
   - Numeri: range validation (calorie 800-5000, macronutrienti)
   - Array: sanitizzazione elementi
   - JSONB: sanitizzazione oggetti annidati
3. `handleAthleteProfileSave()`:
   - Valida con `updateAthleteNutritionDataSchema` (Zod)
   - Esegue mutation React Query
   - Optimistic update
   - Toast successo/errore
   - `setIsEditing(false)` su successo

### Annullamento

1. Utente clicca "Annulla" → `handleCancel()`
2. `setIsEditing(false)`
3. Reset `formData` ai valori originali da `nutrition`

---

## 📊 Dipendenze

**Dipende da**:

- `useUpdateAthleteNutrition` (hook React Query)
- `useToast` (toast notifications)
- `handleAthleteProfileSave` (utility salvataggio)
- `sanitizeString`, `sanitizeStringArray`, `sanitizeNumber`, `sanitizeJsonb` (sanitizzazione)
- `updateAthleteNutritionDataSchema` (validazione Zod)

**Utilizzato da**:

- Componenti tab nutrizione atleta (es. `athlete-nutrition-tab.tsx`)

---

## ⚠️ Errori Possibili

1. **Validazione Zod fallita**: Campi non conformi allo schema → Toast errore
2. **Mutation fallita**: Errore database/network → Toast errore, rollback optimistic update
3. **Sanitizzazione fallita**: Valori fuori range → Valori corretti automaticamente o ignorati

---

## 📝 Esempi d'Uso

```typescript
const {
  isEditing,
  setIsEditing,
  formData,
  setFormData,
  handleSave,
  handleCancel,
  addArrayItem,
  removeArrayItem,
  updateMacronutrienti,
  addSpuntino,
} = useAthleteNutritionForm({
  nutrition: nutritionData,
  athleteId: 'uuid-atleta',
})

// Aggiungi intolleranza
addArrayItem('intolleranze_alimentari', 'Lattosio')

// Aggiorna macronutrienti
updateMacronutrienti('proteine_g', 150)

// Aggiungi spuntino
addSpuntino('10:30')

// Salva modifiche
await handleSave()
```

---

## 🔍 Note Tecniche

- **Sanitizzazione Numeri**: Range specifici per campo (calorie: 800-5000, proteine: 0-1000, carboidrati: 0-2000, grassi: 0-500)
- **Array Dinamici**: Rimozione automatica duplicati, sanitizzazione elementi
- **Orari Pasti**: Formato HH:MM, validazione formato stringa
- **Optimistic Updates**: Gestiti da `handleAthleteProfileSave` tramite React Query mutation
- **Cache Invalidation**: Automatica dopo salvataggio tramite React Query

---

**Ultimo aggiornamento**: 2025-02-01T23:50:00Z
