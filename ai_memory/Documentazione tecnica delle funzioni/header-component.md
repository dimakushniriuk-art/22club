# Componente: Header

## 📋 Descrizione

Componente header principale dell'applicazione. Mostra il titolo, gestisce notifiche con badge contatore, menu utente con dropdown e preview notifiche. Supporta navigazione e logout.

## 📁 Percorso File

`src/components/header.tsx`

## 🔧 Props

```typescript
interface HeaderProps {
  title?: string
  showNotifications?: boolean
  showUserMenu?: boolean
}
```

### Dettaglio Props

- **`title`** (string, optional): Titolo da mostrare nell'header (default: '22Club')
- **`showNotifications`** (boolean, optional): Mostra/nasconde il pulsante notifiche (default: true)
- **`showUserMenu`** (boolean, optional): Mostra/nasconde il menu utente (default: true)

## 📦 Dipendenze

### UI Components

- `Button` da `@/components/ui`
- `Badge` da `@/components/ui`
- `Bell`, `Settings`, `LogOut`, `User` da `lucide-react`

### Hooks

- `useNotifications` da `@/hooks/use-notifications`
- `useAuth` da `@/hooks/use-auth`

## ⚙️ Funzionalità

### Core

1. **Titolo**: Mostra titolo personalizzabile
2. **Notifiche**: Pulsante notifiche con badge contatore non lette
3. **Preview Notifiche**: Dropdown con preview delle prime 3 notifiche non lette
4. **Menu Utente**: Dropdown menu con informazioni utente e azioni
5. **Navigazione**: Link a notifiche, impostazioni, profilo
6. **Logout**: Gestione logout con redirect

### Funzionalità Avanzate

- **Badge Contatore**: Badge con numero notifiche non lette (max 9+)
- **Dropdown Notifiche**: Preview notifiche con link diretti
- **Dropdown Utente**: Menu con nome, ruolo, link rapidi
- **Ruolo Display**: Traduzione ruoli in italiano (admin, pt, atleta)
- **Display Name**: Estrae nome utente da email
- **Navigazione Condizionale**: Link diversi in base al ruolo

### UI/UX

- Header con bordo inferiore
- Layout flex responsive
- Badge notifiche posizionato assoluto
- Dropdown posizionati assoluti con z-index
- Hover states sui pulsanti
- Preview notifiche scrollabile (max-h-64)

## 🎨 Struttura UI

```
Header (bg-background-secondary border-b)
  ├── Flex Container
  │   ├── Logo/Title (h1)
  │   └── Right Actions
  │       ├── Notifiche Button (se showNotifications)
  │       │   ├── Icon Bell
  │       │   └── Badge (se hasUnread)
  │       │       └── Contatore (9+ se > 9)
  │       ├── User Menu Button (se showUserMenu)
  │       │   ├── Icon User
  │       │   └── Display Name (hidden md:inline)
  │       └── Dropdowns
  │           ├── Notification Dropdown (se showNotificationDropdown)
  │           │   ├── Header: "Notifiche non lette" + "Vedi tutte"
  │           │   └── Lista (max 3 notifiche)
  │           │       └── Item (clickable)
  │           │           ├── Titolo
  │           │           ├── Corpo (line-clamp-2)
  │           │           └── Data
  │           └── User Dropdown (se showUserDropdown)
  │               ├── Header: Nome + Ruolo
  │               └── Menu Items
  │                   ├── Notifiche (con badge se hasUnread)
  │                   ├── Impostazioni
  │                   ├── Separator
  │                   └── Logout (destructive)
```

## 💡 Esempi d'Uso

```tsx
// Header base
<Header />

// Header personalizzato
<Header
  title="Dashboard"
  showNotifications={true}
  showUserMenu={true}
/>

// Header minimale
<Header
  title="22Club"
  showNotifications={false}
  showUserMenu={false}
/>
```

## 📝 Note Tecniche

- Utilizza `useNotifications` per gestire notifiche
- Utilizza `useAuth` per gestire autenticazione e logout
- Dropdown gestiti con stato locale (`useState`)
- Navigazione tramite `window.location.href`
- Badge contatore con logica "9+" per valori > 9
- Preview notifiche limitata a 3 items
- Formattazione date con `toLocaleDateString`
- Stili con tema consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
