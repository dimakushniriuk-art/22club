# 📚 Documentazione Tecnica: AthleteAnagraficaTab Component

**Percorso**: `src/components/dashboard/athlete-profile/athlete-anagrafica-tab.tsx`  
**Tipo Modulo**: React Component (Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-01-29T15:30:00Z

---

## 📋 Panoramica

Componente React per visualizzare e modificare dati anagrafici atleta nella dashboard Personal Trainer. Include form editabile, validazione client-side, sanitizzazione input, e gestione stato.

---

## 🔧 Componente Principale

### `AthleteAnagraficaTab`

**Classificazione**: React Component, Client Component, Side-Effecting  
**Tipo**: `({ athleteId }: AthleteAnagraficaTabProps) => JSX.Element`

**Parametri**:

- `athleteId` (string): UUID dell'atleta (user_id)

**Output**: JSX.Element (form anagrafica con visualizzazione/edit)

**Descrizione**: Tab component per gestione completa dati anagrafici atleta.

---

## 🔄 Flusso Logico

### Inizializzazione

1. Hook `useAthleteAnagrafica(athleteId)` per caricare dati
2. Hook `useUpdateAthleteAnagrafica(athleteId)` per mutation
3. Hook `useToast()` per notifiche
4. State `isEditing` per modalità edit/view
5. State `formData` per dati form

### Caricamento Dati (useEffect)

1. Quando `anagrafica` viene caricata e `!isEditing`:
   - Inizializza `formData` con tutti i campi da `anagrafica`
   - Gestisce valori `null`/`undefined` correttamente

### Salvataggio (`handleSave`)

1. **Sanitizzazione**:
   - Sanitizza tutti i campi stringa con `sanitizeString()`
   - Sanitizza email con `sanitizeEmail()`
   - Sanitizza telefoni con `sanitizePhone()`
   - Applica maxLength appropriati

2. **Validazione Zod**:
   - Valida `sanitizedData` con `updateAthleteAnagraficaSchema.safeParse()`
   - Se fallita → mostra toast con primo errore, return

3. **Mutation**:
   - Chiama `updateMutation.mutateAsync(sanitizedData)`
   - Se successo → mostra toast successo, `setIsEditing(false)`
   - Se errore → mostra toast errore

### Rendering

1. **Loading State**: Mostra `<LoadingState />` se `isLoading`
2. **Error State**: Mostra `<ErrorState />` se `error`
3. **Edit Mode**: Form editabile con input fields
4. **View Mode**: Visualizzazione read-only con icona edit

---

## 📥 Props

### `AthleteAnagraficaTabProps`

```typescript
{
  athleteId: string // UUID atleta (user_id)
}
```

---

## 📤 Output (JSX)

Componente form con:

- Card header con titolo e pulsanti edit/save/cancel
- Sezioni form:
  - Dati Personali (nome, cognome, email, telefono, data nascita, sesso)
  - Dati Residenza (indirizzo, città, provincia, nazione, CAP)
  - Contatto Emergenza (nome, telefono, relazione)
  - Altri Dati (codice fiscale, professione, altezza, peso, gruppo sanguigno)
- Loading/Error states
- Toast notifications

---

## ⚠️ Errori Possibili

1. **Errore caricamento dati**: Mostra `<ErrorState />`
2. **Validazione fallita**: Toast errore con messaggio validazione
3. **Mutation fallita**: Toast errore con messaggio API
4. **Sanitizzazione fallita**: Valori `null` gestiti gracefully

**Gestione**: Tutti gli errori sono gestiti con UI feedback (toast, error state).

---

## 🔗 Dipendenze Critiche

1. **React Hooks**:
   - `useState` - stato locale
   - `useEffect` - effetti collaterali
   - `useCallback` - memoizzazione callback
   - `useMemo` - memoizzazione valori

2. **Custom Hooks**:
   - `useAthleteAnagrafica()` - query dati
   - `useUpdateAthleteAnagrafica()` - mutation update
   - `useToast()` - notifiche

3. **UI Components**:
   - `Card`, `CardContent`, `CardHeader`, `CardTitle`
   - `Button`, `Input`, `Label`
   - `LoadingState`, `ErrorState`

4. **Utilities**:
   - `sanitizeString()`, `sanitizeEmail()`, `sanitizePhone()`, `sanitizeNumber()`
   - `updateAthleteAnagraficaSchema` (Zod)

5. **Icons**: `lucide-react` (User, Mail, Phone, Calendar, MapPin, Edit, Save, X, AlertCircle)

---

## 🎯 Utilizzo

```typescript
import { AthleteAnagraficaTab } from '@/components/dashboard/athlete-profile/athlete-anagrafica-tab'

export default function AthleteProfile({ athleteId }: { athleteId: string }) {
  return (
    <Tabs>
      <TabsList>
        <TabsTrigger value="anagrafica">Anagrafica</TabsTrigger>
      </TabsList>
      <TabsContent value="anagrafica">
        <AthleteAnagraficaTab athleteId={athleteId} />
      </TabsContent>
    </Tabs>
  )
}
```

**Utilizzato da**: `src/app/dashboard/atleti/[id]/page.tsx`

---

## 🔄 Side-Effects

1. **Query Database**: Caricamento dati anagrafici via React Query
2. **Update Database**: Update dati via React Query mutation
3. **State Updates**: Aggiornamento stato React (`isEditing`, `formData`)
4. **Toast Notifications**: Mostra notifiche successo/errore

---

## 📝 Note Tecniche

- **Sanitizzazione**: Tutti gli input vengono sanitizzati prima della validazione
- **Validazione**: Doppia validazione (client-side Zod + server-side)
- **Optimistic Updates**: React Query gestisce optimistic updates automaticamente
- **Form State**: Gestione form state manuale (non usa React Hook Form)

---

## 📝 Changelog

### 2025-01-29

- ✅ Componente completo e funzionante
- ✅ Sanitizzazione input implementata
- ✅ Validazione Zod client-side
- ✅ Gestione errori robusta con toast
- ✅ Design aggiornato con `!bg-transparent` (UI-002 risolto)

---

**Ultimo aggiornamento**: 2025-01-29T15:30:00Z
