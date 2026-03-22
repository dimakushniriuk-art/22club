# 📱 Configurazione Capacitor per 22Club

## Panoramica

Capacitor è stato integrato nel progetto per permettere la creazione di app native iOS e Android partendo dall'applicazione Next.js web.

## Installazione

### 1. Installare le dipendenze

```bash
npm install --legacy-peer-deps
```

**Nota**: Usiamo `--legacy-peer-deps` perché alcune dipendenze (come `lucide-react`) non hanno ancora supporto ufficiale per React 19 nei peerDependencies, ma funzionano correttamente.

Se riscontri problemi con i permessi della cache npm, esegui:

```bash
sudo chown -R $(whoami) ~/.npm
npm install --legacy-peer-deps
```

### Requisiti di Sistema

- **Node.js**: 20.0.0 o superiore (Capacitor 7 richiede Node.js ≥20)
- **npm**: 10.x o superiore
- **macOS** (per iOS): Xcode 16.0+ e CocoaPods
- **Android**: Android Studio 2024.2.1+ e Android SDK API level 23+

### 2. Inizializzare Capacitor (solo la prima volta)

```bash
npm run capacitor:init
```

Questo comando ti chiederà:

- **App name**: 22Club
- **App ID**: com.club22.app (o un ID personalizzato)
- **Web dir**: out

## Configurazione

### File di configurazione

- **`capacitor.config.ts`**: Configurazione principale di Capacitor
  - `appId`: Identificatore univoco dell'app
  - `appName`: Nome dell'app
  - `webDir`: Cartella di output di Next.js (deve essere `out` per export statico)

### Next.js per Capacitor

Il progetto è configurato per supportare sia il build web normale che quello per Capacitor:

- **Build normale**: `npm run build` (per deployment web)
- **Build Capacitor**: `npm run build:capacitor` (genera export statico in `out/`)

La configurazione Next.js abilita automaticamente `output: 'export'` quando `CAPACITOR=true` è impostato.

## Aggiungere piattaforme

### iOS

```bash
npm run capacitor:add:ios
```

**Requisiti**:

- macOS
- Xcode installato
- CocoaPods installato (`sudo gem install cocoapods`)

### Android

```bash
npm run capacitor:add:android
```

**Requisiti**:

- Android Studio installato
- Java Development Kit (JDK) installato
- Variabili d'ambiente Android configurate

## Workflow di sviluppo

### 1. Sviluppo web normale

```bash
npm run dev
```

### 2. Build e sync per Capacitor

```bash
# Build completo e sync
npm run build:capacitor

# Build e apri iOS
npm run build:capacitor:ios

# Build e apri Android
npm run build:capacitor:android
```

### 3. Solo sync (dopo modifiche a capacitor.config.ts)

```bash
npm run capacitor:sync
```

## Plugin Capacitor installati

- **@capacitor/app**: Gestione ciclo di vita app, URL scheme, deep linking
- **@capacitor/haptics**: Feedback tattile
- **@capacitor/keyboard**: Gestione tastiera virtuale
- **@capacitor/status-bar**: Personalizzazione status bar
- **@capacitor/splash-screen**: Gestione splash screen

## Utilizzo dei plugin nel codice

### Esempio: Rilevare quando l'app va in background

```typescript
import { App } from '@capacitor/app'

App.addListener('appStateChange', ({ isActive }) => {
  console.log('App state changed. Is active?', isActive)
})
```

### Esempio: Feedback tattile

```typescript
import { Haptics, ImpactStyle } from '@capacitor/haptics'

async function triggerHaptic() {
  await Haptics.impact({ style: ImpactStyle.Medium })
}
```

### Esempio: Gestione tastiera

```typescript
import { Keyboard } from '@capacitor/keyboard'

Keyboard.addListener('keyboardWillShow', (info) => {
  console.log('keyboard will show with height:', info.keyboardHeight)
})

Keyboard.addListener('keyboardWillHide', () => {
  console.log('keyboard will hide')
})
```

## Limitazioni con Next.js

### Export statico

Quando si usa Capacitor, Next.js deve generare un export statico. Questo significa:

- ❌ **NON disponibili**: API Routes, Server Components, Server Actions, route dinamiche senza `generateStaticParams()`, pagine che usano `cookies()`
- ✅ **Disponibili**: Client Components, Static Generation, tutte le funzionalità client-side

### Gestione automatica delle limitazioni

Il progetto include script automatici che:

1. **Spostano temporaneamente** le API routes durante il build
2. **Escludono** le route dinamiche e le pagine server-side
3. **Ripristinano** tutto dopo il build

Questo permette di mantenere il codice completo per il web e generare solo le parti compatibili per Capacitor.

### Soluzioni per funzionalità server-side

1. **API Routes**: Spostare la logica in un backend separato (es. Supabase Functions, API esterna)
2. **Server Components**: Convertire in Client Components
3. **Server Actions**: Usare chiamate API standard

## Configurazione per produzione

### iOS

1. Apri il progetto in Xcode:

   ```bash
   npm run capacitor:open:ios
   ```

2. Configura:
   - Bundle Identifier
   - Signing & Capabilities
   - Info.plist (permissions, URL schemes)

3. Build per App Store:
   - Product → Archive
   - Distribuisci tramite App Store Connect

### Android

1. Apri il progetto in Android Studio:

   ```bash
   npm run capacitor:open:android
   ```

2. Configura:
   - `android/app/build.gradle` (versionCode, versionName)
   - `AndroidManifest.xml` (permissions, intent filters)

3. Build APK/AAB:
   - Build → Generate Signed Bundle / APK

## Variabili d'ambiente

Per distinguere tra ambiente web e mobile, puoi usare:

```typescript
import { Capacitor } from '@capacitor/core'

const isNative = Capacitor.isNativePlatform()
const platform = Capacitor.getPlatform() // 'ios', 'android', o 'web'
```

## Troubleshooting

### Problema: Build fallisce con errori SSR

**Soluzione**: Assicurati di usare `CAPACITOR=true` nel build:

```bash
npm run build:capacitor
```

### Problema: Plugin non funzionano

**Soluzione**: Esegui sync dopo aver installato nuovi plugin:

```bash
npm run capacitor:sync
```

### Problema: Modifiche non visibili nell'app

**Soluzione**:

1. Ricostruisci: `npm run build:capacitor`
2. Oppure solo copy: `npm run capacitor:copy`

### Problema: Errori di permessi iOS

**Soluzione**: Verifica che le capabilities siano configurate correttamente in Xcode.

## Script disponibili

| Script                    | Descrizione                              |
| ------------------------- | ---------------------------------------- |
| `capacitor:init`          | Inizializza Capacitor (solo prima volta) |
| `capacitor:add:ios`       | Aggiunge piattaforma iOS                 |
| `capacitor:add:android`   | Aggiunge piattaforma Android             |
| `capacitor:sync`          | Sincronizza web assets e plugin          |
| `capacitor:copy`          | Copia solo web assets                    |
| `capacitor:update`        | Aggiorna Capacitor e plugin              |
| `capacitor:open:ios`      | Apre progetto iOS in Xcode               |
| `capacitor:open:android`  | Apre progetto Android in Android Studio  |
| `build:capacitor`         | Build Next.js per Capacitor e sync       |
| `build:capacitor:ios`     | Build e apri iOS                         |
| `build:capacitor:android` | Build e apri Android                     |

## Risorse

- [Documentazione Capacitor](https://capacitorjs.com/docs)
- [Guida Next.js + Capacitor](https://capacitorjs.com/docs/guides/nextjs)
- [Plugin Capacitor](https://capacitorjs.com/docs/plugins)
