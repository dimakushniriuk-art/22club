# 🗄️ Database Schema - Modulo Profilo Atleta

**Versione**: 1.0  
**Ultimo aggiornamento**: 2025-01-29

---

## Overview

Il modulo Profilo Atleta utilizza **9 tabelle principali** più la tabella `profiles` estesa per gestire tutte le categorie dati.

---

## Tabella: `profiles` (Estesa)

La tabella `profiles` è stata estesa con colonne anagrafiche aggiuntive.

### Colonne Aggiunte

```sql
-- Dati anagrafici estesi
data_nascita DATE,
sesso VARCHAR(10) CHECK (sesso IN ('maschio', 'femmina', 'altro', 'non_specificato')),
phone VARCHAR(20),
indirizzo TEXT,
citta VARCHAR(100),
cap VARCHAR(10),
provincia VARCHAR(100),
paese VARCHAR(100) DEFAULT 'Italia',
contatto_emergenza_nome VARCHAR(255),
contatto_emergenza_telefono VARCHAR(20),
contatto_emergenza_relazione VARCHAR(100),
codice_fiscale VARCHAR(16),
carta_identita_numero VARCHAR(50),
carta_identita_scadenza DATE,
note_anagrafiche TEXT
```

**Migrazione**: `20250127_extend_profiles_anagrafica.sql`

---

## Tabella: `athlete_medical_data`

Dati medici dell'atleta: certificati, referti, allergie, patologie.

### Schema

```sql
CREATE TABLE athlete_medical_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,

  -- Certificato medico
  certificato_medico_url TEXT,
  certificato_medico_tipo VARCHAR(50),
  certificato_medico_scadenza DATE,

  -- Referti medici (JSONB array)
  referti_medici JSONB DEFAULT '[]'::jsonb,

  -- Allergie e patologie
  allergie TEXT[] DEFAULT '{}',
  patologie TEXT[] DEFAULT '{}',
  farmaci_assunti TEXT[] DEFAULT '{}',

  -- Note
  note_mediche TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT athlete_medical_data_athlete_id_key UNIQUE (athlete_id)
);
```

**Migrazione**: `20250127_create_athlete_medical_data.sql`

### Indici

```sql
CREATE INDEX idx_athlete_medical_data_athlete_id ON athlete_medical_data(athlete_id);
CREATE INDEX idx_athlete_medical_data_certificato_scadenza ON athlete_medical_data(certificato_medico_scadenza) WHERE certificato_medico_scadenza IS NOT NULL;
```

---

## Tabella: `athlete_fitness_data`

Dati fitness: misurazioni, obiettivi, livello esperienza.

### Schema

```sql
CREATE TABLE athlete_fitness_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,

  -- Misurazioni
  peso_kg DECIMAL(5,2),
  altezza_cm INTEGER,
  bmi DECIMAL(4,2), -- Calcolato automaticamente

  -- Livello e obiettivi
  livello_esperienza VARCHAR(20) CHECK (livello_esperienza IN ('principiante', 'intermedio', 'avanzato', 'professionista')),
  obiettivo_primario VARCHAR(50) CHECK (obiettivo_primario IN ('dimagrimento', 'massa_muscolare', 'forza', 'resistenza', 'tonificazione', 'riabilitazione', 'altro')),
  obiettivi_secondari TEXT[] DEFAULT '{}',

  -- Zone problematiche
  zone_problematiche TEXT[] DEFAULT '{}',

  -- Note
  note_fitness TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT athlete_fitness_data_athlete_id_key UNIQUE (athlete_id)
);
```

**Migrazione**: `20250127_create_athlete_fitness_data.sql`

### Trigger BMI

```sql
CREATE OR REPLACE FUNCTION calculate_bmi()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.peso_kg IS NOT NULL AND NEW.altezza_cm IS NOT NULL AND NEW.altezza_cm > 0 THEN
    NEW.bmi := (NEW.peso_kg / POWER(NEW.altezza_cm / 100.0, 2))::DECIMAL(4,2);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_bmi
  BEFORE INSERT OR UPDATE ON athlete_fitness_data
  FOR EACH ROW
  EXECUTE FUNCTION calculate_bmi();
```

---

## Tabella: `athlete_motivational_data`

Dati motivazionali: obiettivi, motivazioni, preferenze.

### Schema

```sql
CREATE TABLE athlete_motivational_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,

  -- Motivazioni
  motivazione_principale TEXT,
  motivazioni_secondarie TEXT[] DEFAULT '{}',
  ostacoli_percepiti TEXT[] DEFAULT '{}',

  -- Preferenze
  preferenze_ambiente TEXT[] DEFAULT '{}',
  preferenze_compagnia TEXT[] DEFAULT '{}',

  -- Livello motivazione (1-10)
  livello_motivazione INTEGER CHECK (livello_motivazione >= 1 AND livello_motivazione <= 10),

  -- Storico
  storico_abbandoni JSONB DEFAULT '[]'::jsonb,

  -- Note
  note_motivazionali TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT athlete_motivational_data_athlete_id_key UNIQUE (athlete_id)
);
```

**Migrazione**: `20250127_create_athlete_motivational_data.sql`

---

## Tabella: `athlete_nutrition_data`

Dati nutrizionali: obiettivi, macronutrienti, preferenze alimentari.

### Schema

```sql
CREATE TABLE athlete_nutrition_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,

  -- Obiettivi
  obiettivo_calorico INTEGER,
  macronutrienti_target JSONB DEFAULT '{}'::jsonb, -- {proteine, carboidrati, grassi}

  -- Intolleranze e allergie
  intolleranze TEXT[] DEFAULT '{}',
  allergie_alimentari TEXT[] DEFAULT '{}',

  -- Preferenze
  preferenze_alimentari TEXT[] DEFAULT '{}',
  preferenze_orari_pasti TEXT[] DEFAULT '{}',

  -- Note
  note_nutrizionali TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT athlete_nutrition_data_athlete_id_key UNIQUE (athlete_id)
);
```

**Migrazione**: `20250127_create_athlete_nutrition_data.sql`

---

## Tabella: `athlete_massage_data`

Dati massaggi: preferenze, zone problematiche.

### Schema

```sql
CREATE TABLE athlete_massage_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,

  -- Preferenze
  tipi_massaggio_preferiti TEXT[] DEFAULT '{}',
  zone_problematiche TEXT[] DEFAULT '{}',
  frequenza_massaggi VARCHAR(50),
  preferenze_pressione VARCHAR(50),

  -- Storico
  storico_massaggi JSONB DEFAULT '[]'::jsonb,

  -- Note
  note_massaggi TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT athlete_massage_data_athlete_id_key UNIQUE (athlete_id)
);
```

**Migrazione**: `20250127_create_athlete_massage_data.sql`

---

## Tabella: `athlete_administrative_data`

Dati amministrativi: abbonamenti, pagamenti, documenti.

### Schema

```sql
CREATE TABLE athlete_administrative_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,

  -- Abbonamento
  tipo_abbonamento VARCHAR(50) CHECK (tipo_abbonamento IN ('mensile', 'trimestrale', 'semestrale', 'annuale', 'pacchetto_lezioni', 'nessuno')),
  stato_abbonamento VARCHAR(20) CHECK (stato_abbonamento IN ('attivo', 'scaduto', 'sospeso', 'in_attesa')),
  data_inizio_abbonamento DATE,
  data_scadenza_abbonamento DATE,

  -- Lezioni
  lezioni_incluse INTEGER DEFAULT 0,
  lezioni_utilizzate INTEGER DEFAULT 0,
  lezioni_rimanenti INTEGER DEFAULT 0, -- Calcolato da trigger

  -- Pagamenti
  metodo_pagamento_preferito VARCHAR(50),

  -- Documenti
  documenti_contrattuali JSONB DEFAULT '[]'::jsonb,

  -- Note
  note_contrattuali TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT athlete_administrative_data_athlete_id_key UNIQUE (athlete_id)
);
```

**Migrazione**: `20250127_create_athlete_administrative_data.sql`

### Trigger Lezioni Rimanenti

```sql
CREATE OR REPLACE FUNCTION calculate_lezioni_rimanenti()
RETURNS TRIGGER AS $$
BEGIN
  NEW.lezioni_rimanenti := GREATEST(0, NEW.lezioni_incluse - NEW.lezioni_utilizzate);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_lezioni_rimanenti
  BEFORE INSERT OR UPDATE ON athlete_administrative_data
  FOR EACH ROW
  EXECUTE FUNCTION calculate_lezioni_rimanenti();
```

---

## Tabella: `athlete_smart_tracking_data`

Dati smart tracking: wearable, metriche automatiche.

### Schema

```sql
CREATE TABLE athlete_smart_tracking_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  data_rilevazione DATE NOT NULL,

  -- Dispositivo
  dispositivo_tipo VARCHAR(50),
  dispositivo_marca VARCHAR(100),

  -- Metriche
  passi_giornalieri INTEGER,
  calorie_bruciate INTEGER,
  distanza_percorsa_km DECIMAL(6,2),
  battito_cardiaco_medio INTEGER,
  battito_cardiaco_max INTEGER,
  battito_cardiaco_min INTEGER,
  ore_sonno DECIMAL(4,2),
  qualita_sonno VARCHAR(20),
  attivita_minuti INTEGER,

  -- Metriche custom (JSONB)
  metrica_custom JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT athlete_smart_tracking_data_athlete_data_key UNIQUE (athlete_id, data_rilevazione)
);
```

**Migrazione**: `20250127_create_athlete_smart_tracking_data.sql`

### Indici

```sql
CREATE INDEX idx_athlete_smart_tracking_athlete_data ON athlete_smart_tracking_data(athlete_id, data_rilevazione DESC);
```

---

## Tabella: `athlete_ai_data`

Dati AI: insights, raccomandazioni, predizioni.

### Schema

```sql
CREATE TABLE athlete_ai_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  data_analisi DATE NOT NULL,

  -- Insights
  insights_aggregati JSONB DEFAULT '{}'::jsonb,
  raccomandazioni TEXT[] DEFAULT '{}',
  pattern_rilevati TEXT[] DEFAULT '{}',
  predizioni_performance JSONB DEFAULT '[]'::jsonb,

  -- Score
  score_engagement DECIMAL(3,1),
  score_progresso DECIMAL(3,1),

  -- Fattori rischio
  fattori_rischio TEXT[] DEFAULT '{}',

  -- Note
  note_ai TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT athlete_ai_data_athlete_data_key UNIQUE (athlete_id, data_analisi)
);
```

**Migrazione**: `20250127_create_athlete_ai_data.sql`

### Indici

```sql
CREATE INDEX idx_athlete_ai_data_athlete_data ON athlete_ai_data(athlete_id, data_analisi DESC);
```

---

## Trigger Comuni

### Trigger `updated_at`

Tutte le tabelle hanno un trigger per aggiornare automaticamente `updated_at`:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applicato a tutte le tabelle
CREATE TRIGGER trigger_update_updated_at
  BEFORE UPDATE ON athlete_xxx_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## Storage Buckets

### Bucket: `athlete-certificates`

**Path pattern**: `{athlete_id}/certificati/{filename}`

**RLS Policies**:

- PT può leggere/scrivere certificati dei propri atleti
- Atleta può leggere/scrivere solo i propri certificati

### Bucket: `athlete-reports`

**Path pattern**: `{athlete_id}/referti/{filename}`

**RLS Policies**: Stesso pattern di `athlete-certificates`

### Bucket: `athlete-documents`

**Path pattern**: `{athlete_id}/documenti/{filename}`

**RLS Policies**: Stesso pattern di `athlete-certificates`

---

## RLS Policies

Tutte le tabelle hanno RLS abilitato con policies per:

- **PT**: Può leggere/scrivere dati dei propri atleti
- **Atleta**: Può leggere/scrivere solo i propri dati
- **Admin**: Accesso completo

**Migrazione**: `20250128_complete_rls_verification_task_6_1.sql`

---

## Indici Performance

Tutte le tabelle hanno indici ottimizzati per:

- Ricerca per `athlete_id`
- Ordinamento per date
- Query con filtri comuni

**Migrazione**: `20250127_add_athlete_profile_indexes.sql`

---

**Ultimo aggiornamento**: 2025-01-29
