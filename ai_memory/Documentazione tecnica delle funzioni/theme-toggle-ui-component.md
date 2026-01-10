# Componente: ThemeToggle (UI Base)

## 📋 Descrizione

Componente toggle per cambiare tema (dark/light). Supporta 2 temi (athletica-dark, athletica-light), toggle tra temi, persistenza in data-theme attribute e icona emoji dinamica. Utilizzato per dark mode toggle e cambio tema applicazione.

## 📁 Percorso File

`src/components/ui/theme-toggle.tsx`

## 🔧 Props

Nessuna prop (componente standalone)

## 📦 Dipendenze

### React

- `React.useState`, `React.useCallback` da `react`

## ⚙️ Funzionalità

### Core

1. **Theme Toggle**: Toggle tra dark e light theme
2. **2 Temi**: athletica-dark, athletica-light
3. **Data Attribute**: Imposta data-theme su documentElement
4. **State Management**: Gestione stato tema corrente
5. **Emoji Icon**: Icona emoji dinamica (🌙/☀️)

### Funzionalità Avanzate

- **Initial State**: Lettura tema corrente da data-theme attribute
- **Persistence**: Persistenza tema in data-theme
- **Toggle Logic**: Toggle tra i due temi
- **Callback Optimization**: useCallback per performance

### UI/UX

- Bottone con icona emoji
- Toggle smooth
- Feedback visivo immediato
- Layout semplice

## 🎨 Struttura UI

```
Button (btn btn-sm btn-ghost)
  └── Emoji Icon (🌙 o ☀️)
```

## 💡 Esempi d'Uso

```tsx
// ThemeToggle base
<ThemeToggle />

// In header
<Header>
  <ThemeToggle />
</Header>
```

## 📝 Note Tecniche

- Lettura tema iniziale da document.documentElement.getAttribute('data-theme')
- Default: 'athletica-dark' se non presente
- Toggle: dark → light, light → dark
- Impostazione: document.documentElement.setAttribute('data-theme', next)
- Icona: 🌙 per dark, ☀️ per light
- useCallback per ottimizzazione performance
- Stili con classi btn (presumibilmente da design system)
- Layout semplice

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
