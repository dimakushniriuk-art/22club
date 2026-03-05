# 👤 ProfiloPT Page - Documentazione Tecnica

**File**: `src/app/dashboard/profilo/page.tsx`  
**Classificazione**: Next.js Page, Client Component, Profile Page  
**Stato**: ✅ COMPLETO (100%)  
**Ultimo Aggiornamento**: 2025-01-29T17:30:00Z

---

## 📋 Panoramica

Pagina Next.js completa per gestione profilo Personal Trainer. Include 4 tab principali: Profilo (informazioni personali, statistiche, badge), Notifiche (gestione e filtri), Impostazioni (profilo, notifiche, privacy, aspetto), e Statistiche (KPI e metriche). Supporta modifica profilo, upload avatar, cambio password, 2FA, e gestione preferenze.

---

## 🔧 Struttura Pagina

### Tabs Principali

1. **Profilo** (`activeTab === 'profilo'`)
   - Informazioni personali (nome, cognome, email, telefono)
   - Avatar upload
   - Statistiche (clienti attivi, sessioni mese, anni esperienza, valutazione, certificazioni, revenue)
   - Badge e achievement
   - Data iscrizione

2. **Notifiche** (`activeTab === 'notifiche'`)
   - Lista notifiche con filtri (tutte/non lette/lette, categoria)
   - Ricerca testuale
   - Marca come letto/non letto
   - Push notifications setup

3. **Impostazioni** (`activeTab === 'impostazioni'`)
   - **Sottotab Profilo**: Informazioni personali, bio, indirizzo
   - **Sottotab Notifiche**: Preferenze email/push/SMS
   - **Sottotab Privacy**: Visibilità profilo, condivisione dati
   - **Sottotab Aspetto**: Theme (dark/light), accent color, sidebar collapsed

4. **Statistiche** (`activeTab === 'statistiche'`)
   - KPI cards (clienti, sessioni, revenue)
   - Grafici performance
   - Link a pagina statistiche completa

---

## 🔄 Flusso Logico

### 1. Caricamento Profilo

```typescript
useEffect(() => {
  const loadProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Mock stats (TODO: calcolare da dati reali)
    const stats = {
      clienti_attivi: 15,
      sessioni_mese: 65,
      anni_esperienza: 3,
      valutazione_media: 4.8,
      certificazioni_conseguite: 4,
      revenue_mensile: 3200,
    }

    setProfile({
      nome: profileData.nome || '',
      cognome: profileData.cognome || '',
      email: profileData.email || '',
      phone: profileData.telefono || '',
      avatar: profileData.avatar || null,
      stats,
      badge: mockBadge,
    })
  }
  loadProfile()
}, [authUserId])
```

**Comportamento**:

- Carica profilo da `profiles` table
- Statistiche sono mock (TODO: calcolare da dati reali)
- Badge sono mock (TODO: implementare sistema badge reale)

### 2. Salvataggio Profilo

```typescript
const handleSave = async () => {
  const { error } = await supabase
    .from('profiles')
    .update({
      nome: profile.nome,
      cognome: profile.cognome,
      email: profile.email,
      phone: profile.phone,
      specializzazione: profile.specializzazione,
      certificazioni: profile.certificazioni,
    })
    .eq('user_id', authUserId)
}
```

**Comportamento**:

- Aggiorna solo campi modificati
- Gestisce errori con alert
- Mostra feedback successo

### 3. Upload Avatar

```typescript
<AvatarUploader
  userId={authUserId}
  onUploaded={(publicUrl) => {
    setProfile((prev) => ({ ...prev, avatar: publicUrl }))
    // Aggiorna anche in settings
    setSettings((prev) => ({
      ...prev,
      profile: { ...prev.profile, avatar: publicUrl },
    }))
  }}
/>
```

**Comportamento**:

- Usa componente `AvatarUploader`
- Aggiorna profilo e settings dopo upload
- Mostra preview avatar

### 4. Gestione Notifiche

```typescript
const filteredNotifications = notifications.filter((notification) => {
  const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase())
  const matchesReadFilter = filterType === 'all' || ...
  const matchesCategory = filterCategory === 'all' || ...
  return matchesSearch && matchesReadFilter && matchesCategory
})
```

**Filtri**:

- **Ricerca**: Testuale in `title` e `body`
- **Stato**: Tutte / Non lette / Lette
- **Categoria**: Tutte / Cliente / Pagamento / Appuntamento / etc.

### 5. Auto-save Impostazioni

```typescript
const debouncedSaveRef = useRef<(() => void) | null>(null)

useEffect(() => {
  debouncedSaveRef.current = debounce(() => {
    void handleSaveSettings()
  }, 800)
}, [handleSaveSettings])
```

**Comportamento**:

- Auto-save dopo 800ms di inattività
- Salva in database e localStorage (per aspetto)
- Mostra feedback successo

### 6. Gestione Theme

```typescript
useEffect(() => {
  document.documentElement.classList.toggle('dark', settings.appearance.theme === 'dark')
  window.localStorage.setItem('impostazioni:appearance', JSON.stringify(settings.appearance))
}, [settings.appearance])
```

**Comportamento**:

- Toggle classe `dark` su `<html>`
- Salva preferenze in localStorage
- Persiste tra sessioni

---

## ⚠️ Errori Possibili

### Errori Caricamento

- **Profilo Non Trovato**: Se `user_id` non esiste in `profiles`
  - Sintomo: Alert "Errore nel caricamento del profilo"
  - Fix: Verificare che trigger `handle_new_user` crei profilo automaticamente (vedi P1-002)

- **RLS Policy Error**: Se RLS blocca accesso
  - Sintomo: `0 righe visibili` o `permission denied`
  - Fix: Verificare RLS policies (vedi P1-001)

### Errori Salvataggio

- **Network Error**: Se update fallisce
  - Sintomo: Alert "Errore nel salvare il profilo"
  - Fix: Verificare connessione, RLS policies

### Errori Upload Avatar

- **Storage Bucket Non Esiste**: Se bucket `avatars` non esiste
  - Sintomo: `Bucket not found` error
  - Fix: Creare bucket (vedi P1-003, P4-012)

---

## 🔗 Dipendenze Critiche

### Dipendenze Esterne

1. **Supabase Client** (`@/lib/supabase`)
   - Query profilo, update, storage

2. **React Hooks** (`useState`, `useEffect`, `useCallback`, `useRef`)
   - Gestione stato complesso

3. **UI Components** (`@/components/ui`)
   - Card, Tabs, Button, Input, Avatar, Badge, Progress

4. **Components** (`@/components/settings`)
   - `AvatarUploader`, `ChangePasswordModal`, `TwoFactorSetup`

5. **Hooks** (`@/hooks`)
   - `usePush` per push notifications

### Dipendenze Interne

- **Profiles Table**: Per dati profilo
- **Storage Bucket**: `avatars` per upload avatar
- **Types**: `Notification` interface

---

## 📝 Esempi d'Uso

### Esempio 1: Uso Base

```typescript
// La pagina è già una route Next.js
// Accessibile a: /dashboard/profilo
// Solo per ruoli: 'pt', 'trainer', 'admin'
```

### Esempio 2: Con Middleware Protection

```typescript
// middleware.ts protegge automaticamente /dashboard
// Solo utenti con role 'admin' o 'trainer' possono accedere
```

---

## 🎯 Side-Effects

### Side-Effects Positivi

1. **Query Database**: Carica profilo, aggiorna dati
2. **Upload Storage**: Upload avatar a Supabase Storage
3. **State Updates**: Aggiorna stato profilo, notifiche, settings
4. **LocalStorage**: Salva preferenze aspetto
5. **DOM Manipulation**: Toggle classe `dark` per theme

### Side-Effects Negativi (da evitare)

- Nessun side-effect negativo identificato

---

## 🔍 Note Tecniche

### Performance

- **Lazy Loading**: Modali pesanti (`ChangePasswordModal`, `TwoFactorSetup`) lazy loaded
- **Debounce**: Auto-save impostazioni con debounce 800ms
- **Memoization**: Potrebbe beneficiare di `useMemo` per filtri notifiche

### Limitazioni

- **Statistiche Mock**: Statistiche sono hardcoded (TODO: calcolare da dati reali)
- **Badge Mock**: Badge sono hardcoded (TODO: implementare sistema badge)
- **Naming Confusion**: Usa `nome/cognome` e `first_name/last_name` (vedi P4-011)

### Miglioramenti Futuri

- Calcolare statistiche reali da database
- Implementare sistema badge reale
- Unificare naming profili (vedi P4-011)
- Aggiungere validazione form esplicita

---

## 📚 Changelog

### 2025-01-29T17:30:00Z - Documentazione Iniziale

- ✅ Documentazione completa pagina `ProfiloPTPage`
- ✅ Descrizione 4 tab principali
- ✅ Gestione profilo, notifiche, impostazioni
- ✅ Esempi d'uso
- ⚠️ Identificato problema P4-011 (naming confusion)
- ⚠️ Identificato problema P4-012 (avatar upload implementato ma bucket mancante)

---

**Stato**: ✅ COMPLETO  
**Prossimi Passi**: Documentare `AvatarUploader` e profilo Admin
