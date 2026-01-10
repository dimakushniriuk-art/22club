# Utility: Utils CN (Class Name Merger)

## 📋 Descrizione

Utility per merge classi CSS. Combina clsx e tailwind-merge per gestire conflitti classi Tailwind, utile per conditional classes.

## 📁 Percorso File

`src/lib/utils.ts`

## 📦 Dipendenze

- `clsx` (`clsx`)
- `tailwind-merge` (`twMerge`)

## ⚙️ Funzionalità

### Funzioni Principali

1. **`cn(...inputs)`**: Merge classi CSS
   - Combina clsx (conditional classes) e twMerge (Tailwind conflict resolution)
   - Supporta ClassValue (string, array, object, undefined, null)

## 🔍 Note Tecniche

- Risolve conflitti classi Tailwind (es: p-2 e p-4 → p-4)
- Supporta tutte le varianti clsx (conditional, array, object)

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
