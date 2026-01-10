# Componente: ProfessionalIcons (UI Base)

## 📋 Descrizione

Componente libreria icone professionali SVG. Include 20+ icone predefinite (Dashboard, Users, Plus, Message, Dumbbell, Book, Calendar, File, Dollar, Megaphone, Bell, User, BarChart, Settings, Home, Target, Check, AlertTriangle, X, Edit, Trash, Paperclip, Image), iconMap per emoji, hook useIcon e componente base ProfessionalIcon. Utilizzato per icone consistenti in tutta l'applicazione.

## 📁 Percorso File

`src/components/ui/professional-icons.tsx`

## 🔧 Props

### ProfessionalIcon Props

```typescript
interface IconProps {
  size?: number
  className?: string
  color?: string
}
```

### Icon Components

Tutte le icone estendono `IconProps`:

- `DashboardIcon`
- `UsersIcon`
- `PlusIcon`
- `MessageIcon`
- `DumbbellIcon`
- `BookIcon`
- `CalendarIcon`
- `FileIcon`
- `DollarIcon`
- `MegaphoneIcon`
- `BellIcon`
- `UserIcon`
- `BarChartIcon`
- `SettingsIcon`
- `HomeIcon`
- `TargetIcon`
- `CheckIcon`
- `AlertTriangleIcon`
- `XIcon`
- `EditIcon`
- `TrashIcon`
- `PaperclipIcon`
- `ImageIcon`

### useIcon Hook

```typescript
useIcon(emoji: string, props?: IconProps): ReactNode
```

## 📦 Dipendenze

### React

- `React.FC` da `react`

## ⚙️ Funzionalità

### Core

1. **20+ Icons**: Libreria icone SVG predefinite
2. **Icon Base**: Componente base ProfessionalIcon
3. **Icon Map**: Mappa emoji → Icon component
4. **useIcon Hook**: Hook per ottenere icona da emoji
5. **Customizable**: Size, className, color personalizzabili

### Funzionalità Avanzate

- **SVG Icons**: Tutte le icone sono SVG custom
- **Emoji Mapping**: Mappa emoji a componenti icona
- **Hook Pattern**: useIcon hook per accesso programmatico
- **Consistent Styling**: Stili consistenti per tutte le icone
- **Type Safety**: TypeScript per tutte le icone

### UI/UX

- Icone SVG scalabili
- Dimensioni personalizzabili
- Colori personalizzabili
- Stili consistenti
- Layout flessibile

## 🎨 Struttura UI

```
ProfessionalIcon (SVG base)
  └── SVG Element
      └── Path/Rect/Circle (per ogni icona)
```

## 💡 Esempi d'Uso

```tsx
// Icona base
<DashboardIcon size={24} color="currentColor" />

// Icona con className
<UserIcon size={32} className="text-teal-500" />

// useIcon hook
const icon = useIcon('📊', { size: 16, className: 'text-teal-400' })

// Icona in button
<Button>
  <PlusIcon size={16} />
  Aggiungi
</Button>
```

## 📝 Note Tecniche

- Componente base ProfessionalIcon con SVG
- 20+ icone predefinite come componenti React
- IconMap: mappa emoji → Icon component
- useIcon hook: restituisce componente icona da emoji
- SVG con viewBox 0 0 24 24
- Stroke width 1.5 per consistenza
- Stroke linecap round e linejoin round
- Dimensioni personalizzabili (default 24)
- Colore personalizzabile (default currentColor)
- Stili consistenti per tutte le icone
- Type-safe con TypeScript

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
