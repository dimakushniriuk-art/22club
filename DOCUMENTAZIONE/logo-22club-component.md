# Componente: Logo22Club

## 📋 Descrizione

Componente SVG del logo 22Club. Logo vettoriale scalabile con design personalizzato che rappresenta il brand dell'applicazione.

## 📁 Percorso File

`src/components/shared/logo-22club.tsx`

## 🔧 Props

```typescript
interface Logo22ClubProps {
  className?: string
}
```

### Dettaglio Props

- **`className`** (string, optional): Classi CSS aggiuntive per personalizzare lo stile

## 📦 Dipendenze

Nessuna dipendenza esterna (componente puro SVG).

## ⚙️ Funzionalità

### Core

1. **Logo SVG**: Logo vettoriale scalabile
2. **Personalizzazione**: Supporto per className personalizzata
3. **Responsive**: Scalabile a qualsiasi dimensione

### Funzionalità Avanzate

- **SVG Ottimizzato**: Utilizza maschere SVG per ottimizzazione
- **Colori Brand**: Colore teal (#02B3BF) per il brand
- **ViewBox**: ViewBox ottimizzato per scaling

### UI/UX

- SVG vettoriale scalabile
- Colori brand consistenti
- Supporto per className personalizzata
- Dimensioni predefinite (180x169) ma scalabile

## 🎨 Struttura UI

```
SVG (180x169, viewBox 663x620)
  └── Maschere SVG
      └── Paths
          ├── Path "22" (fill white)
          └── Path "Club" (fill #02B3BF)
```

## 💡 Esempi d'Uso

```tsx
// Logo base
<Logo22Club />

// Logo con classe personalizzata
<Logo22Club className="h-12 w-12 text-teal-500" />

// Logo grande
<Logo22Club className="h-24 w-24" />
```

## 📝 Note Tecniche

- Componente SVG puro senza dipendenze
- Utilizza maschere SVG per ottimizzazione rendering
- Colore brand: #02B3BF (teal)
- ViewBox: 0 0 663 620
- Dimensioni default: 180x169
- Scalabile tramite className o CSS
- Accessibile (SVG con alt text implicito)

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
