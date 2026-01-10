# Credenziali di Test - 22Club

Questo documento contiene le credenziali di test per tutti gli utenti del sistema.

## 🔐 Pattern Password

Le password seguono un pattern standard per facilitare i test:

- **Atleti**: `[Nome]2024!` (es: `Mario2024!`)
- **Personal Trainer**: `PT[Nome]2024!` (es: `PTPT2024!`)
- **Amministratori**: `Admin[Nome]2024!` (es: `AdminTest2024!`)

## 📋 Credenziali Utenti

### 👑 Amministratori

| Email                    | Password          | Nome  | Cognome |
| ------------------------ | ----------------- | ----- | ------- |
| `admin@22club.it`        | `AdminAdmin2024!` | Admin | Sistema |
| `test-admin@22club.test` | `AdminTest2024!`  | Test  | Admin   |

### 💪 Personal Trainer

| Email                 | Password       | Nome  | Cognome |
| --------------------- | -------------- | ----- | ------- |
| `test-pt@22club.test` | `PTTest2024!`  | Test  | PT      |
| `pt@22club.it`        | `PTPT2024!`    | PT    | User    |
| `pt1@22club.it`       | `PTMarco2024!` | Marco | Rossi   |
| `pt2@22club.it`       | `PTPt22024!`   | Pt2   | User    |
| `pt3@22club.it`       | `PTPT32024!`   | PT3   | User    |

### 🏃 Atleti

| Email                           | Password          | Nome       | Cognome    |
| ------------------------------- | ----------------- | ---------- | ---------- |
| `test-atleta@22club.test`       | `Test2024!`       | Test       | Atleta     |
| `atleta1@22club.it`             | `Luigi2024!`      | Luigi      | Bianchi    |
| `atleta2@22club.it`             | `Atleta22024!`    | Atleta2    | User       |
| `atleta3@22club.it`             | `Atleta32024!`    | Atleta3    | User       |
| `mario.rossi@22club.it`         | `Mario2024!`      | Mario      | Rossi      |
| `giulia.bianchi@22club.it`      | `Giulia2024!`     | Giulia     | Bianchi    |
| `luca.verdi@22club.it`          | `Luca2024!`       | Luca       | Verdi      |
| `sofia.neri@22club.it`          | `Sofia2024!`      | Sofia      | Neri       |
| `alessandro.ferrari@22club.it`  | `Alessandro2024!` | Alessandro | Ferrari    |
| `chiara.romano@22club.it`       | `Chiara2024!`     | Chiara     | Romano     |
| `alex@22club.it`                | `Alex2024!`       | Alex       | Bergo      |
| `francescobernotto09@gmail.com` | `Francesco2024!`  | Francesco  | Bernotto   |
| `dima.kushniriuk@gmail.com`     | `Dmytro2024!`     | Dmytro     | Kushniriuk |

## 🔄 Reimpostazione Password

Per reimpostare tutte le password con il pattern standard, esegui:

```bash
npm run db:reset-passwords
```

Oppure direttamente:

```bash
npx tsx scripts/reset-test-passwords.ts
```

Lo script:

1. Legge tutti i profili dal database
2. Genera password secondo il pattern standard
3. Aggiorna le password in Supabase Auth
4. Salva le credenziali in `test-credentials.txt`

## ⚠️ Note Importanti

- **Solo per ambiente di test/development**: Non usare queste password in produzione!
- **Le password sono hashate**: Non è possibile recuperare password esistenti, solo reimpostarle
- **Service Role Key richiesta**: Lo script richiede `SUPABASE_SERVICE_ROLE_KEY` nel file `.env.local`

## 🔍 Verifica Credenziali

Dopo aver reimpostato le password, puoi verificare le credenziali:

1. **File generato**: Controlla `test-credentials.txt` nella root del progetto
2. **Login manuale**: Prova a fare login con una delle credenziali sopra
3. **Database**: Verifica che gli utenti esistano in `auth.users` e `profiles`

## 📝 Aggiornamento Manuale

Se devi aggiornare manualmente una password specifica, puoi usare il Supabase Dashboard:

1. Vai su **Authentication** > **Users**
2. Trova l'utente per email
3. Clicca su **...** > **Reset Password**
4. Inserisci la nuova password

Oppure usa l'Admin API:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

await supabaseAdmin.auth.admin.updateUserById(userId, {
  password: 'NuovaPassword123!',
})
```
