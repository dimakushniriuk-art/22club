# 📦 Piano di Aggiornamento Dipendenze - 22Club
**Data:** 2025-01-10  
**Obiettivo:** Aggiornare tutte le dipendenze e configurazioni per iniziare a lavorare

---

## 🔍 Analisi Stato Attuale

### Stack Principale
- **Next.js:** 15.5.9
- **React:** 19.2.0
- **TypeScript:** ^5 (versione generica)
- **Node.js:** Richiesto 20 (da engines)
- **Supabase:** 2.74.0

### Configurazioni
- ✅ TypeScript configurato con strict mode
- ✅ ESLint configurato (flat config)
- ✅ Prettier configurato
- ✅ Tailwind CSS 4.x

---

## 📋 Aggiornamenti Pianificati

### Dipendenze Principali (Dependencies)

| Pacchetto | Versione Attuale | Versione Aggiornata | Tipo Update | Note |
|-----------|------------------|---------------------|-------------|------|
| `next` | ^15.5.9 | ^15.6.0 | Minor | Se disponibile, altrimenti mantieni |
| `react` | ^19.2.0 | ^19.3.0 | Minor | Se disponibile |
| `react-dom` | ^19.2.0 | ^19.3.0 | Minor | Allineato a React |
| `@supabase/supabase-js` | ^2.74.0 | ^2.76.0 | Minor | Aggiornamento sicurezza |
| `@supabase/ssr` | ^0.7.0 | ^0.8.0 | Minor | Se disponibile |
| `@sentry/nextjs` | ^10.20.0 | ^10.30.0 | Minor | Aggiornamento sicurezza |
| `@tanstack/react-query` | ^5.0.0 | ^5.62.0 | Minor | Aggiornamento funzionalità |
| `date-fns` | ^4.1.0 | ^4.1.0 | - | Già aggiornato |
| `zod` | ^4.1.12 | ^4.1.12 | - | Già aggiornato |
| `framer-motion` | ^12.23.24 | ^12.23.24 | - | Già aggiornato |
| `lucide-react` | ^0.546.0 | ^0.468.0 | Patch | Verificare compatibilità |
| `recharts` | ^3.2.1 | ^3.2.1 | - | Già aggiornato |
| `@fullcalendar/*` | ^6.1.19 | ^6.1.20 | Patch | Se disponibile |
| `resend` | ^6.6.0 | ^6.6.0 | - | Già aggiornato |

### Dipendenze di Sviluppo (DevDependencies)

| Pacchetto | Versione Attuale | Versione Aggiornata | Tipo Update | Note |
|-----------|------------------|---------------------|-------------|------|
| `typescript` | ^5 | ^5.7.0 | Minor | Specificare versione |
| `@typescript-eslint/eslint-plugin` | ^8.46.1 | ^8.47.0 | Patch | Se disponibile |
| `@typescript-eslint/parser` | ^8.46.1 | ^8.47.0 | Patch | Allineato a plugin |
| `eslint` | ^9 | ^9.17.0 | Patch | Specificare versione |
| `eslint-config-next` | ^15.5.9 | ^15.6.0 | Minor | Allineato a Next.js |
| `prettier` | ^3.6.2 | ^3.6.2 | - | Già aggiornato |
| `@playwright/test` | ^1.40.0 | ^1.50.0 | Minor | Aggiornamento funzionalità |
| `vitest` | ^1.0.4 | ^1.6.0 | Minor | Aggiornamento funzionalità |
| `@testing-library/react` | ^16.0.1 | ^16.0.1 | - | Già aggiornato |
| `@storybook/*` | ^8.6.14 | ^8.6.14 | - | Già aggiornato |
| `tailwindcss` | ^4 | ^4.1.0 | Patch | Specificare versione |
| `@tailwindcss/postcss` | ^4.1.14 | ^4.1.14 | - | Già aggiornato |

---

## ⚠️ Note Importanti

### Breaking Changes Potenziali
1. **React 19.3.0:** Verificare compatibilità con librerie terze
2. **TypeScript 5.7.0:** Potrebbero esserci nuovi errori di tipo
3. **Next.js 15.6.0:** Verificare cambiamenti in App Router

### Test da Eseguire Dopo Aggiornamento
- [ ] `npm run typecheck` - Verifica errori TypeScript
- [ ] `npm run lint` - Verifica errori ESLint
- [ ] `npm run build` - Verifica build produzione
- [ ] `npm run test:run` - Esegui test unitari
- [ ] `npm run test:e2e` - Esegui test E2E
- [ ] `npm run dev` - Verifica sviluppo locale

### Vulnerabilità da Risolvere
- Eseguire `npm audit` dopo aggiornamento
- Risolvere vulnerabilità moderate e high
- Considerare `npm audit fix` per patch automatiche

---

## 🚀 Procedura di Aggiornamento

1. **Backup stato corrente**
   ```bash
   git add .
   git commit -m "chore: backup prima aggiornamento dipendenze"
   ```

2. **Aggiorna package.json** (già fatto in questo documento)

3. **Installa dipendenze aggiornate**
   ```bash
   npm install
   ```

4. **Verifica compatibilità**
   ```bash
   npm run typecheck
   npm run lint
   npm run build
   ```

5. **Test funzionali**
   ```bash
   npm run test:run
   npm run test:e2e
   ```

6. **Commit aggiornamenti**
   ```bash
   git add package.json package-lock.json
   git commit -m "chore: aggiorna dipendenze a versioni più recenti"
   ```

---

## 📊 Risultati Attesi

- ✅ Tutte le dipendenze aggiornate alle versioni più recenti compatibili
- ✅ Nessun errore TypeScript o ESLint
- ✅ Build produzione funzionante
- ✅ Test suite passante
- ✅ Vulnerabilità di sicurezza risolte

---

## 🔄 Prossimi Passi

1. Eseguire aggiornamento dipendenze
2. Verificare funzionamento applicazione
3. Aggiornare documentazione se necessario
4. Configurare Dependabot per aggiornamenti automatici futuri
