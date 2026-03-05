# Componente: LoginForm

## 📋 Descrizione

Componente form di login completo con protezione tentativi falliti, gestione errori, account demo e design moderno con gradienti. Include validazione, loading states e redirect automatico.

## 📁 Percorso File

`src/components/auth/login-form.tsx`

## 🔧 Props

Il componente non accetta props (usa `useSearchParams` per errori dalla URL).

## 📦 Dipendenze

### React

- `useState`, `useEffect`, `Suspense` da `react`
- `useSearchParams` da `next/navigation`
- `Link` da `next/link`

### UI Components

- `Button`, `Card`, `CardContent`, `CardDescription`, `CardHeader`, `CardTitle`, `Input`, `Badge` da `@/components/ui`

### Hooks

- `useAuth` da `@/hooks/use-auth`
- `useLoginProtection` da `@/hooks/use-login-protection`

## ⚙️ Funzionalità

### Core

1. **Form Login**: Input email e password con validazione
2. **Protezione Tentativi**: Blocco temporaneo dopo tentativi falliti
3. **Gestione Errori**: Errori da URL params e validazione
4. **Account Demo**: Sezione con account demo predefiniti
5. **Loading States**: Stati di caricamento durante login
6. **Success Feedback**: Messaggio di successo durante redirect

### Funzionalità Avanzate

- **Login Protection**: Hook per gestire tentativi e lockout
- **Error Handling**: Gestione errori da URL params (profilo, accesso_negato, errore_server)
- **Auto-fill Helper**: Helper text con account demo
- **Suspense Wrapper**: Wrapper Suspense per gestire `useSearchParams`
- **Background Gradients**: Gradienti decorativi di sfondo
- **Glow Effects**: Effetti glow sulla card
- **Responsive Design**: Layout responsive con max-width

### UI/UX

- Background con gradienti decorativi
- Card con backdrop blur e border teal
- Icona emoji grande (🏋️)
- Titolo con gradient text
- Input con helper text
- Messaggi errore/successo con icone
- Badge contatore tentativi
- Sezione account demo con codice colorato
- Link a homepage e reset password
- Loading state sul bottone

## 🎨 Struttura UI

```
Suspense
  └── LoginFormContent
      └── Container (min-h-screen)
          ├── Background Gradients (absolute)
          └── Card (max-w-md)
              ├── Decorative Gradient Top
              ├── CardHeader
              │   ├── Icon Container (emoji 🏋️)
              │   ├── CardTitle "22Club" (gradient)
              │   └── CardDescription
              └── CardContent
                  └── Form
                      ├── Input Email (con helper text)
                      ├── Input Password (con helper text)
                      ├── Error Message (se error)
                      ├── Success Message (se success)
                      ├── Badge Tentativi (se attempts > 0)
                      ├── Button Submit (con loading/locked states)
                      ├── Links (Homepage, Reset Password)
                      └── Demo Accounts Section
                          └── Account Cards (Admin, PT, Atleta, Password)
```

## 💡 Esempi d'Uso

```tsx
// Uso base (in pagina login)
import LoginForm from '@/components/auth/login-form'

export default function LoginPage() {
  return <LoginForm />
}
```

## 📝 Note Tecniche

- Utilizza `Suspense` per gestire `useSearchParams` (Next.js 15 requirement)
- `useLoginProtection` hook per protezione tentativi falliti
- Gestione errori da URL params con `useSearchParams`
- Account demo hardcoded per sviluppo/demo
- Auto-complete attributes per accessibilità
- Disabilitazione form durante lockout
- Vibrazione opzionale (non implementata nel form)
- Stili con tema teal-cyan consistente
- Helper text con account demo per facilitare testing

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
