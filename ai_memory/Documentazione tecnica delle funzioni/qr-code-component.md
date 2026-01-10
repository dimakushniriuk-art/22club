# Componente: QRCodeComponent

## 📋 Descrizione

Componente per generare e visualizzare QR code per inviti di registrazione atleti. Include funzionalità di copia link e download del QR code come immagine.

## 📁 Percorso File

`src/components/invitations/qr-code.tsx`

## 🔧 Props

```typescript
interface QRCodeProps {
  invitationCode: string
  athleteName: string
  onCopy?: () => void
}
```

### Dettaglio Props

- **`invitationCode`** (string, required): Codice invito per generare il QR code
- **`athleteName`** (string, required): Nome atleta per il nome file download
- **`onCopy`** (function, optional): Callback chiamato quando si copia il link

## 📦 Dipendenze

### React

- `useState`, `useEffect` da `react`
- `Image` da `next/image`

### UI Components

- `Card`, `CardContent`, `CardHeader`, `CardTitle` da `@/components/ui`
- `Button` da `@/components/ui`
- `Download`, `Copy`, `Check` da `lucide-react`

### Libraries

- `qrcode` (dynamic import) - Libreria per generazione QR code

## ⚙️ Funzionalità

### Core

1. **Generazione QR Code**: Genera QR code dal codice invito
2. **Visualizzazione**: Mostra QR code come immagine
3. **Copia Link**: Copia link registrazione negli appunti
4. **Download**: Scarica QR code come immagine PNG
5. **Loading State**: Mostra skeleton durante generazione

### Funzionalità Avanzate

- **Dynamic Import**: Import dinamico di `qrcode` per evitare problemi SSR
- **URL Generazione**: Genera URL registrazione con codice invito
- **Feedback Copia**: Mostra "Copiato!" per 2 secondi dopo copia
- **Nome File**: Nome file download basato su nome atleta
- **QR Code Config**: Configurazione colori (dark/light) personalizzata

### UI/UX

- Card con header e content
- QR code con background bianco
- Nome atleta visualizzato
- Pulsanti copia e download
- Link registrazione mostrato
- Loading skeleton durante generazione
- Feedback visivo dopo copia

## 🎨 Struttura UI

```
Card (max-w-sm)
  ├── CardHeader
  │   └── CardTitle: "QR Code Invito"
  └── CardContent
      ├── Se loading
      │   ├── Skeleton (h-64 w-64)
      │   └── "Generando QR code..."
      └── Se !loading
          ├── QR Code Image (256x256, bg-white)
          ├── Nome Atleta
          ├── Actions (flex gap-2)
          │   ├── Button Copia (con icona Check se copied)
          │   └── Button Download
          └── Link Registrazione
              └── URL (break-all)
```

## 💡 Esempi d'Uso

```tsx
<QRCodeComponent
  invitationCode="ABC123"
  athleteName="Mario Rossi"
  onCopy={() => console.log('Link copiato')}
/>
```

## 📝 Note Tecniche

- Utilizza dynamic import per `qrcode` per evitare problemi SSR
- Genera URL registrazione usando `NEXT_PUBLIC_APP_URL`
- Configurazione QR code: width 256, margin 2, colori dark/light personalizzati
- Copia negli appunti tramite `navigator.clipboard`
- Download tramite creazione link temporaneo
- Nome file: `22club-invito-{nome-atleta}.png`
- Loading state durante generazione asincrona
- Feedback copia con timeout 2 secondi
- Stili con tema consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
