# Profili Atleta per Test

Questo documento descrive come creare e utilizzare i profili atleta per il testing della piattaforma.

## Creazione Profili Atleta

### Prerequisiti

Assicurati di avere le seguenti variabili d'ambiente nel file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tuo-progetto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=la_tua_service_role_key
```

### Eseguire lo Script

Per creare 6 profili atleta completi, esegui:

```bash
npm run db:create-athletes
```

Oppure direttamente:

```bash
npx tsx scripts/create-test-athletes.ts
```

## Profili Creati

Lo script crea 6 atleti con dati completi:

### 1. Mario Rossi

- **Email**: `mario.rossi@22club.it`
- **Password**: `Mario2024!`
- **Stato**: Attivo
- **Note**: Atleta dedicato, obiettivo: aumento massa muscolare

### 2. Giulia Bianchi

- **Email**: `giulia.bianchi@22club.it`
- **Password**: `Giulia2024!`
- **Stato**: Attivo
- **Note**: Principiante, obiettivo: perdita peso e tonificazione

### 3. Luca Verdi

- **Email**: `luca.verdi@22club.it`
- **Password**: `Luca2024!`
- **Stato**: Attivo
- **Note**: Esperto, pratica bodybuilding da 5 anni

### 4. Sofia Neri

- **Email**: `sofia.neri@22club.it`
- **Password**: `Sofia2024!`
- **Stato**: Attivo
- **Note**: Intermedio, pratica crossfit

### 5. Alessandro Ferrari

- **Email**: `alessandro.ferrari@22club.it`
- **Password**: `Alessandro2024!`
- **Stato**: Inattivo
- **Note**: In pausa per infortunio

### 6. Chiara Romano

- **Email**: `chiara.romano@22club.it`
- **Password**: `Chiara2024!`
- **Stato**: Attivo
- **Note**: Principiante, preferisce yoga e pilates

## Cosa Viene Creato

Per ogni atleta lo script:

1. **Crea l'utente in Supabase Auth** con email e password
2. **Crea il profilo** nella tabella `profiles` con:
   - Nome e cognome
   - Email e telefono
   - Data di iscrizione
   - Stato (attivo/inattivo/sospeso)
   - Note personalizzate
   - Ruolo 'atleta' (o 'athlete' per compatibilità)

## Gestione Utenti Esistenti

Se un utente con la stessa email esiste già:

- Lo script aggiorna la password
- Aggiorna i dati del profilo
- Non elimina dati esistenti

## Verifica Creazione

Dopo l'esecuzione, puoi verificare i profili creati:

1. **Login**: Prova a fare login con una delle credenziali
2. **Database**: Controlla la tabella `profiles` in Supabase
3. **Auth**: Controlla la sezione Authentication in Supabase Dashboard

## Risoluzione Problemi

### Errore: "Configura NEXT_PUBLIC_SUPABASE_URL"

- Verifica che il file `.env.local` esista nella root del progetto
- Controlla che le variabili siano corrette

### Errore: "User already registered"

- Normalmente gestito automaticamente (aggiorna il profilo)
- Se persiste, elimina manualmente l'utente da Supabase Auth

### Errore: "role 'atleta' does not exist"

- Lo script prova automaticamente con 'athlete'
- Se entrambi falliscono, verifica che la tabella `roles` abbia i valori corretti

## Credenziali Rapide

Tutte le password seguono il formato: `[Nome]2024!`

Esempio: `Mario2024!`, `Giulia2024!`, ecc.
