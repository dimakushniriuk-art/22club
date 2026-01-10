# 🔑 Guida Configurazione VAPID Keys per Push Notifications

**Obiettivo**: Configurare le chiavi VAPID per abilitare push notifications reali nel sistema comunicazioni.

---

## 📋 Cosa sono le VAPID Keys?

VAPID (Voluntary Application Server Identification) è un protocollo che permette al server di identificarsi quando invia push notifications ai browser. Le chiavi VAPID consistono in:

- **Public Key**: Chiave pubblica (esposta al client)
- **Private Key**: Chiave privata (segreta, solo server)

---

## 🚀 Generazione VAPID Keys

### Opzione 1: Usando Node.js (Consigliato)

Installare `web-push` globalmente o usare npx:

```bash
npm install -g web-push
# oppure
npx web-push generate-vapid-keys
```

Eseguire:

```bash
web-push generate-vapid-keys
```

Output esempio:

```
=======================================

Public Key:
BKn8l3kL7n2Xp9Qr4tY6uI8oP0aS2dF5gH7jK9lM1nO3pQ5rS7tU9vW1xY3zA5bC7dE9fG1h

Private Key:
Xp9Qr4tY6uI8oP0aS2dF5gH7jK9lM1nO3pQ5rS7tU9vW1xY3zA5bC7dE9fG1hI3jK5lM

=======================================
```

### Opzione 2: Usando un Tool Online

1. Visita: https://vapidkeys.com/
2. Inserisci una email (es: `notifications@22club.it`)
3. Clicca "Generate"
4. Copia Public Key e Private Key

---

## ⚙️ Configurazione Variabili Ambiente

Aggiungi le seguenti variabili al file `.env.local` (o `.env` per produzione):

```env
# VAPID Keys per Web Push Notifications
NEXT_PUBLIC_VAPID_KEY=La_Tua_Public_Key_Qui
VAPID_PRIVATE_KEY=La_Tua_Private_Key_Qui
VAPID_EMAIL=notifications@22club.it
```

**Importante**:

- `NEXT_PUBLIC_VAPID_KEY`: Deve essere esposta (prefisso `NEXT_PUBLIC_`)
- `VAPID_PRIVATE_KEY`: **Mai** esporre pubblicamente, solo server-side
- `VAPID_EMAIL`: Email di contatto per il provider push

---

## ✅ Verifica Configurazione

### 1. Verifica Variabili Caricate

Controlla che le variabili siano caricate correttamente:

```typescript
// src/lib/notifications/push.ts dovrebbe avere accesso a:
console.log(
  'VAPID Public Key:',
  process.env.NEXT_PUBLIC_VAPID_KEY ? '✅ Configurata' : '❌ Mancante',
)
console.log('VAPID Private Key:', process.env.VAPID_PRIVATE_KEY ? '✅ Configurata' : '❌ Mancante')
console.log('VAPID Email:', process.env.VAPID_EMAIL || '❌ Mancante')
```

### 2. Test Invio Push

1. Apri la dashboard comunicazioni: `http://localhost:3001/dashboard/comunicazioni`
2. Crea una nuova comunicazione push
3. Seleziona destinatari
4. Invia comunicazione
5. Verifica che venga inviata (non simulata)

Se le VAPID keys non sono configurate, il sistema userà automaticamente la simulazione (vedrai nei log "Simulating push notification...").

---

## 🔍 Troubleshooting

### Problema: Push notifications non arrivano

**Possibili cause**:

1. **VAPID keys non configurate**: Il sistema usa simulazione
2. **Subscription non valida**: Il client deve registrarsi per ricevere push
3. **Browser non supporta push**: Verifica supporto browser
4. **HTTPS richiesto**: Push funziona solo su HTTPS (in produzione) o localhost

### Problema: Errore "VAPID keys invalid"

**Soluzione**:

- Verifica che le chiavi siano complete (nessun carattere mancante)
- Assicurati che non ci siano spazi extra
- Rigenera le chiavi se necessario

### Problema: Subscription non funziona

**Soluzione**:

- Verifica che il browser abbia dato permesso per notifiche
- Controlla che la subscription sia salvata in `push_subscriptions`
- Verifica che `NEXT_PUBLIC_VAPID_KEY` sia corretta (deve essere la stessa usata per registrare)

---

## 📝 Note Importanti

1. **Produzione**: Assicurati che le VAPID keys siano configurate anche in produzione
2. **Sicurezza**: Non committare mai `VAPID_PRIVATE_KEY` nel repository
3. **Email**: Usa un'email valida, potrebbe essere usata dal provider push
4. **Stessa chiave**: Usa sempre la stessa coppia di chiavi per lo stesso dominio

---

## 🔗 Risorse Utili

- [Web Push Protocol](https://tools.ietf.org/html/rfc8030)
- [VAPID Specification](https://tools.ietf.org/html/rfc8292)
- [web-push library documentation](https://github.com/web-push-libs/web-push)

---

**Ultimo Aggiornamento**: 2025-01-31
