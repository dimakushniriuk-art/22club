# Componente: TwoFactorSetup

## 📋 Descrizione

Componente drawer per configurare l'autenticazione a due fattori (2FA) tramite TOTP. Gestisce enroll, generazione QR code, verifica codice e generazione backup codes.

## 📁 Percorso File

`src/components/settings/two-factor-setup.tsx`

## 🔧 Props

```typescript
interface TwoFactorSetupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}
```

### Dettaglio Props

- **`open`** (boolean, required): Controlla la visibilità del drawer
- **`onOpenChange`** (function, required): Callback chiamato quando il drawer viene aperto/chiuso

## 📦 Dipendenze

### React

- `React` (useState, useEffect, useCallback)

### Next.js

- `Image` da `next/image`

### UI Components

- `Drawer`, `DrawerContent`, `DrawerHeader`, `DrawerBody`, `DrawerFooter` da `@/components/ui`
- `Button`, `Input`, `Card`, `CardContent`, `CardHeader`, `CardTitle` da `@/components/ui`
- `useToast` da `@/components/ui/toast`
- `Copy`, `Check`, `Download` da `lucide-react`

### Hooks

- `useSupabase` da `@/hooks/use-supabase`
- `useUserSettings` da `@/hooks/use-user-settings`

### External Libraries

- `QRCode` da `qrcode` (generazione QR code)

## ⚙️ Funzionalità

### Core

1. **Enroll 2FA**: Avvia processo enroll TOTP con Supabase Auth
2. **Generazione QR Code**: Genera QR code da OTP URI per app autenticatore
3. **Verifica Codice**: Verifica codice a 6 cifre inserito dall'utente
4. **Backup Codes**: Genera 10 codici backup alfanumerici di 8 caratteri
5. **Salvataggio**: Salva stato 2FA e backup codes in `user_settings`

### Funzionalità Avanzate

- **QR Code Generation**: Genera QR code da OTP URI usando libreria `qrcode`
- **OTP URI Fallback**: Costruisce URI manualmente se non fornito da Supabase
- **Backup Codes**: 10 codici alfanumerici generati randomicamente
- **Copy to Clipboard**: Permette di copiare singoli backup codes
- **Download Backup Codes**: Scarica tutti i backup codes come file .txt

### Flusso

1. **Apertura Drawer**: Avvia automaticamente `startEnroll()` quando `open === true`
2. **Enroll**: Chiama `supabase.auth.mfa.enroll({ factorType: 'totp' })`
3. **QR Code**: Genera QR code da OTP URI
4. **Challenge**: Genera challenge per verifica
5. **Verifica**: Utente inserisce codice a 6 cifre
6. **Verifica Codice**: Chiama `supabase.auth.mfa.verify()`
7. **Backup Codes**: Genera e mostra backup codes
8. **Salvataggio**: Salva in `user_settings` tramite `saveTwoFactor()`

### Stati

- **Loading**: Durante enroll o verifica
- **QR Code Ready**: QR code generato, in attesa codice
- **Verifying**: Verifica codice in corso
- **Backup Codes**: Mostra backup codes dopo verifica successo
- **Error**: Errore durante enroll o verifica

### UI/UX

- Drawer laterale (side="right", size="md")
- Card con QR code centrato
- Input codice a 6 cifre (solo numeri)
- Card backup codes con griglia 2 colonne
- Pulsanti copy per ogni backup code
- Pulsante download per tutti i backup codes

## 🎨 Struttura UI

```
Drawer (side="right", size="md")
  └── DrawerContent
      ├── DrawerHeader
      │   ├── Title "Configura 2FA"
      │   └── Description
      ├── DrawerBody
      │   └── div (space-y-6)
      │       ├── Card "Scansiona il QR Code"
      │       │   ├── Image QR Code (192x192)
      │       │   └── OTP URI (se non scansionabile)
      │       ├── Input "Codice a 6 cifre" (se !showBackupCodes)
      │       └── Card "Backup Codes" (se showBackupCodes)
      │           ├── Lista backup codes (grid 2 colonne)
      │           │   └── div (per ogni codice)
      │           │       ├── code (codice)
      │           │       └── Button Copy
      │           └── Button "Scarica Backup Codes"
      └── DrawerFooter
          ├── Button "Annulla" (se !showBackupCodes)
          ├── Button "Verifica e attiva" (se !showBackupCodes)
          └── Button "Ho salvato i backup codes" (se showBackupCodes)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { TwoFactorSetup } from '@/components/settings/two-factor-setup'

function SettingsPage() {
  const [isOpen, setIsOpen] = useState(false)

  return <TwoFactorSetup open={isOpen} onOpenChange={setIsOpen} />
}
```

## 🔍 Note Tecniche

### Enroll 2FA

- Chiama `supabase.auth.mfa.enroll({ factorType: 'totp' })`
- Riceve `EnrollResponse` con `id`, `secret`, `totp.uri`
- Estrae OTP URI da `totp.uri` o costruisce da `secret`

### Generazione QR Code

- Utilizza libreria `qrcode` per generare data URL
- Formato: `QRCode.toDataURL(otpauth)`
- QR code 192x192px con padding bianco

### OTP URI Format

- Preferito: `totp.uri` da Supabase
- Fallback: `otpauth://totp/22Club?secret=${secret}&issuer=22Club`
- Label e account gestiti dal client

### Challenge e Verifica

- Genera challenge: `supabase.auth.mfa.challenge({ factorId })`
- Verifica: `supabase.auth.mfa.verify({ factorId, challengeId, code })`
- Codice deve essere esattamente 6 cifre

### Backup Codes

- 10 codici alfanumerici di 8 caratteri
- Caratteri: A-Z, 0-9
- Generati randomicamente
- Salvati in `user_settings` tramite `saveTwoFactor()`

### Salvataggio

- Chiama `saveTwoFactor(true, secret, codes)` da `useUserSettings`
- Estrae secret dall'OTP URI se disponibile
- Se salvataggio fallisce, mostra warning ma non blocca

### Limitazioni

- Non gestisce disattivazione 2FA
- Backup codes generati lato client (non crittografati)
- Secret estratto da URI (potrebbe non essere sempre disponibile)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
