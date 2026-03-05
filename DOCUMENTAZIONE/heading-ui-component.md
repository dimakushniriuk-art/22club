# Componente: Heading (UI Base)

## 📋 Descrizione

Componente heading per titoli. Supporta 6 tag HTML (h1-h6), 6 dimensioni e className personalizzabile. Utilizzato per titoli, heading e testi prominenti.

## 📁 Percorso File

`src/components/ui/heading.tsx`

## 🔧 Props

```typescript
interface HeadingProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
  children: React.ReactNode
}
```

### Dettaglio Props

- **`as`** (string, optional): Tag HTML da utilizzare (default: 'h2')
- **`size`** (string, optional): Dimensione testo (default: 'md')
- **`className`** (string, optional): Classi CSS aggiuntive
- **`children`** (ReactNode, required): Contenuto heading

## 📦 Dipendenze

### Utilities

- `cn` da `@/lib/utils`

## ⚙️ Funzionalità

### Core

1. **6 Tag HTML**: h1, h2, h3, h4, h5, h6
2. **6 Dimensioni**: xs, sm, md, lg, xl, 2xl
3. **Semantic HTML**: Utilizzo tag semantici appropriati
4. **Flexible Styling**: ClassName personalizzabile

### Funzionalità Avanzate

- **Tag Selection**: Scelta tag HTML indipendente da dimensione
- **Size Mapping**: Mapping dimensioni a classi Tailwind
- **Semantic Separation**: Separazione semantica (tag) e visiva (size)

### UI/UX

- Heading con dimensione appropriata
- Tag semantico per SEO
- Layout flessibile
- Stili personalizzabili

## 🎨 Struttura UI

```
Tag (h1-h6, dinamico)
  └── Children (contenuto)
```

## 💡 Esempi d'Uso

```tsx
// Heading base
<Heading>Titolo</Heading>

// Heading con tag e dimensione
<Heading as="h1" size="2xl">
  Titolo Principale
</Heading>

// Heading piccolo
<Heading as="h3" size="sm">
  Sottotitolo
</Heading>

// Heading con className
<Heading
  as="h2"
  size="xl"
  className="text-brand"
>
  Titolo Colorato
</Heading>
```

## 📝 Note Tecniche

- 6 tag HTML: h1, h2, h3, h4, h5, h6 (default: h2)
- 6 dimensioni: xs (text-xs), sm (text-sm), md (text-base), lg (text-lg), xl (text-xl), 2xl (text-2xl)
- Separazione semantica (tag) e visiva (size)
- ClassName personalizzabile per override
- Layout flessibile
- Stili con tema consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
