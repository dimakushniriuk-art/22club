# 🗄️ Migrazione: Campi Completi Progress Logs

## 📋 Panoramica

Questa migrazione aggiunge tutti i campi necessari per monitorare i progressi completi degli atleti nella tabella `progress_logs` esistente.

**File migrazione:** `supabase/migrations/20250201_add_progress_logs_comprehensive_fields.sql`

## ✅ Cosa Aggiunge

### Valori Principali (Composizione Corporea)

- `massa_grassa_percentuale` - Percentuale di massa grassa
- `massa_grassa_kg` - Massa grassa in kg
- `massa_magra_kg` - Massa magra in kg
- `massa_muscolare_kg` - Massa muscolare totale in kg
- `massa_muscolare_scheletrica_kg` - Massa muscolare scheletrica in kg

### Circonferenze (Volumi Muscolari)

- `collo_cm` - Circonferenza collo
- `spalle_cm` - Circonferenza spalle
- `torace_inspirazione_cm` - Torace in inspirazione
- `braccio_rilassato_cm` - Braccio rilassato
- `braccio_contratto_cm` - Braccio contratto
- `avambraccio_cm` - Avambraccio
- `polso_cm` - Polso
- `vita_alta_cm` - Vita alta
- `addome_basso_cm` - Addome basso
- `glutei_cm` - Glutei
- `coscia_alta_cm` - Coscia alta
- `coscia_media_cm` - Coscia media
- `coscia_bassa_cm` - Coscia bassa
- `ginocchio_cm` - Ginocchio
- `polpaccio_cm` - Polpaccio
- `caviglia_cm` - Caviglia

## 🚀 Come Eseguire la Migrazione

### Metodo 1: Supabase Dashboard (Consigliato) ⭐

1. Vai su [https://app.supabase.com](https://app.supabase.com)
2. Seleziona il tuo progetto
3. Naviga a **Database** → **SQL Editor**
4. Apri il file `supabase/migrations/20250201_add_progress_logs_comprehensive_fields.sql`
5. Copia tutto il contenuto
6. Incolla nel SQL Editor
7. Clicca **Run** o premi `Ctrl+Enter`
8. Verifica che non ci siano errori

### Metodo 2: CLI Supabase

```bash
# 1. Verifica che Supabase CLI sia installato
npx supabase --version

# 2. Linka il progetto (se non già fatto)
npx supabase link --project-ref YOUR_PROJECT_REF

# 3. Pusha la migrazione specifica
npx supabase db push

# Oppure applica solo questa migrazione
npx supabase migration up
```

### Metodo 3: Applicazione Manuale via psql

```bash
# Connettiti al database
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Esegui la migrazione
\i supabase/migrations/20250201_add_progress_logs_comprehensive_fields.sql

# Verifica le colonne aggiunte
\d progress_logs
```

## ✅ Verifica Post-Migrazione

Dopo aver eseguito la migrazione, verifica che le colonne siano state aggiunte:

```sql
-- Verifica colonne composizione corporea
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'progress_logs'
  AND column_name IN (
    'massa_grassa_percentuale',
    'massa_grassa_kg',
    'massa_magra_kg',
    'massa_muscolare_kg',
    'massa_muscolare_scheletrica_kg'
  );

-- Verifica colonne circonferenze
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'progress_logs'
  AND column_name IN (
    'collo_cm',
    'spalle_cm',
    'braccio_contratto_cm',
    'glutei_cm',
    'coscia_media_cm',
    'vita_cm',
    'addome_basso_cm'
  );
```

## 📊 Struttura Tabella Finale

La tabella `progress_logs` avrà queste colonne aggiuntive:

| Colonna                          | Tipo         | Descrizione                       |
| -------------------------------- | ------------ | --------------------------------- |
| `massa_grassa_percentuale`       | DECIMAL(5,2) | % massa grassa                    |
| `massa_grassa_kg`                | DECIMAL(5,2) | Massa grassa in kg                |
| `massa_magra_kg`                 | DECIMAL(5,2) | Massa magra in kg                 |
| `massa_muscolare_kg`             | DECIMAL(5,2) | Massa muscolare in kg             |
| `massa_muscolare_scheletrica_kg` | DECIMAL(5,2) | Massa muscolare scheletrica in kg |
| `collo_cm`                       | DECIMAL(5,2) | Circonferenza collo               |
| `spalle_cm`                      | DECIMAL(5,2) | Circonferenza spalle              |
| `torace_inspirazione_cm`         | DECIMAL(5,2) | Torace in inspirazione            |
| `braccio_rilassato_cm`           | DECIMAL(5,2) | Braccio rilassato                 |
| `braccio_contratto_cm`           | DECIMAL(5,2) | Braccio contratto                 |
| `avambraccio_cm`                 | DECIMAL(5,2) | Avambraccio                       |
| `polso_cm`                       | DECIMAL(5,2) | Polso                             |
| `vita_alta_cm`                   | DECIMAL(5,2) | Vita alta                         |
| `addome_basso_cm`                | DECIMAL(5,2) | Addome basso                      |
| `glutei_cm`                      | DECIMAL(5,2) | Glutei                            |
| `coscia_alta_cm`                 | DECIMAL(5,2) | Coscia alta                       |
| `coscia_media_cm`                | DECIMAL(5,2) | Coscia media                      |
| `coscia_bassa_cm`                | DECIMAL(5,2) | Coscia bassa                      |
| `ginocchio_cm`                   | DECIMAL(5,2) | Ginocchio                         |
| `polpaccio_cm`                   | DECIMAL(5,2) | Polpaccio                         |
| `caviglia_cm`                    | DECIMAL(5,2) | Caviglia                          |

## ⚠️ Note Importanti

1. **Non crea nuove tabelle**: La migrazione aggiunge solo colonne alla tabella `progress_logs` esistente
2. **Sicura**: Usa `IF NOT EXISTS` quindi può essere eseguita più volte senza errori
3. **Compatibilità**: Mantiene compatibilità con i campi esistenti (`chest_cm`, `waist_cm`, `hips_cm`, `biceps_cm`, `thighs_cm`)
4. **Dati esistenti**: I dati esistenti non vengono modificati, solo aggiunte nuove colonne NULL

## 🔄 Dopo la Migrazione

Una volta eseguita la migrazione:

1. ✅ La pagina `/home/progressi/nuovo` potrà salvare tutti i nuovi campi
2. ✅ La pagina `/home/progressi` mostrerà i grafici per composizione corporea e circonferenze
3. ✅ I dati esistenti continueranno a funzionare normalmente

## 📝 Prossimi Passi (Opzionali)

Per i progressi di **Performance Fisica**, **Mobilità** e **Recupero** (punti 4-7 della lista), potresti voler creare tabelle separate o aggiungere colonne aggiuntive in futuro. Per ora, questi dati non sono ancora implementati nel database.
