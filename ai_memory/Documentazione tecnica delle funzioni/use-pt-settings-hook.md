# 📚 Documentazione Tecnica: usePTSettings

**Percorso**: `src/hooks/use-pt-settings.ts`  
**Tipo Modulo**: React Hook (Settings Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

Hook per gestione impostazioni PT. Gestisce profilo, notifiche, privacy, e aspetto con autosave debounced e persistenza localStorage.

---

## 🔧 Funzioni e Export

### 1. `usePTSettings`

**Classificazione**: React Hook, Settings Hook, Client Component, Side-Effecting  
**Tipo**: `(authUserId: string) => UsePTSettingsReturn`

**Parametri**:

- `authUserId`: `string` - ID utente autenticato

**Output**: Oggetto con:

- **Stato**:
  - `settings`: `Settings` - Impostazioni complete
    - `profile`: Profilo (nome, cognome, email, phone, bio, address, avatar)
    - `notifications`: Notifiche (email/push/SMS per vari eventi)
    - `privacy`: Privacy (profilo pubblico, mostra email/telefono, condividi statistiche)
    - `appearance`: Aspetto (theme, accent_color, sidebar_collapsed)
  - `isSavingSettings`: `boolean` - Stato salvataggio
  - `saveSuccess`: `boolean` - True se salvataggio riuscito (mostra feedback)
  - `isDirty`: `boolean` - True se modifiche non salvate
- **Funzioni**:
  - `handleSaveSettings()`: `() => Promise<void>` - Salva impostazioni manualmente
  - `updateProfile(field, value)`: `(field: string, value: string) => void` - Aggiorna campo profilo
  - `toggleNotification(field)`: `(field: string) => void` - Toggle notifica
  - `togglePrivacy(field)`: `(field: string) => void` - Toggle privacy
  - `updateAppearance(field, value)`: `(field: string, value: any) => void` - Aggiorna aspetto

**Descrizione**: Hook per impostazioni PT con:

- Autosave debounced (800ms) per profilo
- Persistenza localStorage per aspetto (theme, colori)
- Salvataggio database per profilo (upsert `profiles`)
- BeforeUnload warning se modifiche non salvate
- Toggle dark mode automatico (document.documentElement.classList)

---

## 🔄 Flusso Logico

### Update Profile/Notification/Privacy/Appearance

1. Aggiorna `settings` state
2. Chiama `scheduleAutoSave()`:
   - Imposta `isDirty = true`
   - Chiama `debouncedSaveRef.current()` (debounce 800ms)

### AutoSave (Debounced)

1. Dopo 800ms senza modifiche:
   - Chiama `handleSaveSettings()`

### Handle Save Settings

1. **Salvataggio Profilo**:
   - UPDATE/UPSERT `profiles` con dati profilo
   - Attende 300ms (simula delay)

2. **Aggiornamento Stato**:
   - `isSavingSettings = false`
   - `saveSuccess = true` (mostra feedback 3s)
   - `isDirty = false`

### BeforeUnload Warning

1. Se `isDirty` → mostra warning browser prima di chiudere pagina

### Appearance localStorage

1. Salva `settings.appearance` in localStorage: `impostazioni:appearance`
2. Applica dark mode: `document.documentElement.classList.toggle('dark', theme === 'dark')`

---

## 📊 Dipendenze

**Dipende da**: React (`useState`, `useEffect`, `useCallback`, `useRef`), `createClient` (Supabase)

**Utilizzato da**: Pagina impostazioni PT

---

## ⚠️ Note Tecniche

- **Autosave**: Debounce 800ms per evitare troppi salvataggi
- **LocalStorage**: Solo aspetto in localStorage (profilo in database)
- **Dark Mode**: Toggle automatico classe `dark` su `document.documentElement`

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
