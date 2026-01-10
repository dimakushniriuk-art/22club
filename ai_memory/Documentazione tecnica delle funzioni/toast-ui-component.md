# Componente: Toast (UI Base)

## 📋 Descrizione

Componente toast/notifiche per feedback utente. Supporta 4 varianti (success, error, warning, info), auto-dismiss, max 3 toast contemporanei, portal rendering e hook useToast. Utilizzato per notifiche, feedback e messaggi temporanei.

## 📁 Percorso File

`src/components/ui/toast.tsx`

## 🔧 Props

### Toast Interface

```typescript
interface Toast {
  id: string
  title?: string
  message: string
  variant: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}
```

### ToastProvider Props

```typescript
{
  children: React.ReactNode
}
```

## 📦 Dipendenze

### React

- `React.createContext`, `React.useContext`, `React.useState`, `React.useEffect`, `React.useCallback`, `createPortal` da `react`
- `X`, `CheckCircle`, `AlertCircle`, `Info`, `AlertTriangle` da `lucide-react`

### Utilities

- `cn` da `@/lib/utils`

## ⚙️ Funzionalità

### Core

1. **4 Varianti**: success, error, warning, info
2. **Auto-dismiss**: Chiusura automatica dopo duration
3. **Max Toast**: Massimo 3 toast contemporanei
4. **Portal Rendering**: Rendering in portal per overlay
5. **Hook useToast**: Hook per aggiungere toast
6. **Manual Close**: Chiusura manuale con bottone X

### Funzionalità Avanzate

- **Context API**: Gestione stato con React Context
- **Portal**: Rendering in document.body con createPortal
- **Animation**: Slide-in animation con delay
- **Hover Effects**: Hover con scale e shadow
- **Accessibility**: ARIA attributes per screen readers

### UI/UX

- Toast posizionato in alto a destra
- Icone per ogni variante
- Titolo e messaggio
- Close button
- Animazioni smooth
- Layout responsive

## 🎨 Struttura UI

```
ToastProvider (Context Provider)
  ├── Children
  └── ToastContainer (portal in body)
      └── ToastItem[] (per ogni toast)
          ├── Icon (variante)
          ├── Content
          │   ├── Title (opzionale)
          │   └── Message
          └── Close Button
```

## 💡 Esempi d'Uso

```tsx
// Provider setup
;<ToastProvider>
  <App />
</ToastProvider>

// Hook usage
const { addToast } = useToast()

// Aggiungere toast
addToast({
  title: 'Successo',
  message: 'Operazione completata',
  variant: 'success',
  duration: 3000,
})

// Toast con varianti
addToast({ message: 'Errore!', variant: 'error' })
addToast({ message: 'Attenzione', variant: 'warning' })
addToast({ message: 'Info', variant: 'info' })

// Toast senza titolo
addToast({
  message: 'Messaggio semplice',
  variant: 'success',
})
```

## 📝 Note Tecniche

- Utilizza React Context per gestione stato
- Portal rendering con createPortal in document.body
- Max 3 toast contemporanei (slice(-3))
- Auto-dismiss con setTimeout (default 3000ms)
- ID generato con Math.random().toString(36)
- 4 varianti con colori e icone diverse
- Slide-in animation con delay basato su index
- Hover effects con scale-[1.02] e shadow-xl
- Z-index z-[100] per overlay
- Position fixed top-right
- Responsive: full width mobile, 420px desktop
- ARIA attributes per accessibilità
- Stili con tema consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
