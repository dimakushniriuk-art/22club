# 📊 Analisi Dati Antropometrici - Dati Mancanti

## ✅ DATI PRESENTI NEL SISTEMA

### 📐 Misure Antropometriche di Base

- ✅ **Peso corporeo** (`weight_kg` in `progress_logs`, `peso_iniziale_kg`, `peso_corrente_kg` in `profiles`)
- ✅ **Statura** (`altezza_cm` in `profiles`)

### 📊 Composizione Corporea

- ✅ **Massa adiposa** (`massa_grassa_kg`, `massa_grassa_percentuale` in `progress_logs`)
- ✅ **Massa muscolare** (`massa_muscolare_kg` in `progress_logs`)
- ✅ **Massa magra** (`massa_magra_kg` in `progress_logs`)
- ✅ **Massa muscolare scheletrica** (`massa_muscolare_scheletrica_kg` in `progress_logs`)

### 📏 Perimetri (Circonferenze)

- ✅ **Vita** (`waist_cm` in `progress_logs`)
- ✅ **Fianchi** (`hips_cm` in `progress_logs`)
- ✅ **Coscia media** (`coscia_media_cm` in `progress_logs`)
- ✅ **Braccio rilassato** (`braccio_rilassato_cm` in `progress_logs`)
- ✅ **Braccio contratto** (`braccio_contratto_cm` in `progress_logs`)
- ✅ **Polpaccio** (`polpaccio_cm` in `progress_logs`)
- ✅ Altri perimetri: collo, spalle, torace, avambraccio, polso, vita alta, addome basso, glutei, coscia alta/bassa, ginocchio, caviglia

---

## ❌ DATI MANCANTI NEL SISTEMA

### 📐 Misure Antropometriche di Base

- ❌ **Statura allungata** (altezza massima raggiungibile)
- ❌ **Statura da seduto** (altezza in posizione seduta)
- ❌ **Apertura braccia** (distanza tra le punte delle dita con braccia aperte)

### 📊 Composizione Corporea (4 Componenti)

- ❌ **Massa ossea** (abbiamo solo massa muscolare scheletrica, non la massa ossea separata)
- ❌ **Massa residuale** (organi interni, sangue, ecc.)

### 🧮 Indici Principali

- ❌ **IMC (Indice di Massa Corporea)** - _Calcolabile da peso e altezza_
- ❌ **Indice vita/fianchi** - _Calcolabile da vita e fianchi_
- ❌ **Indice adiposo-muscolare** (rapporto massa adiposa/massa muscolare)
- ❌ **Indice muscolo/osseo** (rapporto massa muscolare/massa ossea)
- ❌ **Indice di conicità** (indice di distribuzione del grasso)
- ❌ **Indice Manouvrier** (rapporto arti inferiori/statura)
- ❌ **Indice cormico** (rapporto tronco/statura)
- ❌ **Area superficie corporea** (BSA - Body Surface Area)

### 🩺 Metabolismo

- ❌ **Metabolismo basale (Harris-Benedict)** - _Calcolabile da peso, altezza, età, sesso_
- ❌ **Dispendio energetico totale stimato** - _Calcolabile da metabolismo basale e livello attività_
- ❌ **Livello attività** (sedentario, leggero, moderato, attivo, molto attivo)

### 🧬 Somatotipo (Heath-Carter)

- ❌ **Endomorfia** (componente grassa)
- ❌ **Mesomorfia** (componente muscolare)
- ❌ **Ectomorfia** (componente lineare)

### 📏 Pliche Cutanee (mm)

- ❌ **Tricipite**
- ❌ **Sottoscapolare**
- ❌ **Bicipite**
- ❌ **Cresta iliaca**
- ❌ **Sopraspinale**
- ❌ **Addominale**
- ❌ **Coscia**
- ❌ **Gamba**

### 📐 Perimetri Corretti

- ❌ **Braccio corretto** (braccio contratto - plica tricipite)
- ❌ **Coscia corretta** (coscia - plica coscia)
- ❌ **Gamba corretta** (gamba - plica gamba)

### 🦴 Diametri Ossei (cm)

- ❌ **Omero** (larghezza del gomito)
- ❌ **Bistiloideo** (larghezza del polso)
- ❌ **Femore** (larghezza del ginocchio)

### ⚠️ Osservazioni Cliniche Strutturate

- ❌ **Rischio cardiometabolico** (basso, medio, alto, molto alto)
- ❌ **Adiposità centrale** (normale, moderata, elevata)
- ❌ **Struttura muscolo-scheletrica** (valutazione qualitativa)
- ❌ **Capacità di dispersione del calore** (valutazione qualitativa)
- ❌ **Note cliniche strutturate** (campo note generico presente, ma non strutturato)

---

## 💡 SUGGERIMENTI PER IMPLEMENTAZIONE

### Indici Calcolabili

Alcuni indici possono essere calcolati automaticamente dai dati esistenti:

- **IMC**: `peso_kg / (altezza_m)²`
- **Indice vita/fianchi**: `vita_cm / fianchi_cm`
- **Metabolismo basale**: Formula Harris-Benedict (richiede anche età e sesso)

### Campi da Aggiungere a `progress_logs`

```sql
-- Misure antropometriche aggiuntive
statura_allungata_cm DECIMAL(5,2),
statura_seduto_cm DECIMAL(5,2),
apertura_braccia_cm DECIMAL(5,2),

-- Composizione corporea
massa_ossea_kg DECIMAL(5,2),
massa_residuale_kg DECIMAL(5,2),

-- Indici (calcolabili o inseriti)
imc DECIMAL(4,2),
indice_vita_fianchi DECIMAL(4,2),
indice_adiposo_muscolare DECIMAL(4,2),
indice_muscolo_osseo DECIMAL(4,2),
indice_conicita DECIMAL(4,2),
indice_manouvrier DECIMAL(4,2),
indice_cormico DECIMAL(4,2),
area_superficie_corporea_m2 DECIMAL(4,2),

-- Metabolismo
metabolismo_basale_kcal INTEGER,
dispendio_energetico_totale_kcal INTEGER,
livello_attivita TEXT CHECK (livello_attivita IN ('sedentario', 'leggero', 'moderato', 'attivo', 'molto_attivo')),

-- Somatotipo
endomorfia DECIMAL(4,2),
mesomorfia DECIMAL(4,2),
ectomorfia DECIMAL(4,2),

-- Pliche cutanee (mm)
plica_tricipite_mm DECIMAL(5,2),
plica_sottoscapolare_mm DECIMAL(5,2),
plica_bicipite_mm DECIMAL(5,2),
plica_cresta_iliaca_mm DECIMAL(5,2),
plica_sopraspinale_mm DECIMAL(5,2),
plica_addominale_mm DECIMAL(5,2),
plica_coscia_mm DECIMAL(5,2),
plica_gamba_mm DECIMAL(5,2),

-- Perimetri corretti
braccio_corretto_cm DECIMAL(5,2),
coscia_corretta_cm DECIMAL(5,2),
gamba_corretta_cm DECIMAL(5,2),

-- Diametri ossei
diametro_omero_cm DECIMAL(4,2),
diametro_bistiloideo_cm DECIMAL(4,2),
diametro_femore_cm DECIMAL(4,2),

-- Osservazioni cliniche
rischio_cardiometabolico TEXT CHECK (rischio_cardiometabolico IN ('basso', 'medio', 'alto', 'molto_alto')),
adiposita_centrale TEXT CHECK (adiposita_centrale IN ('normale', 'moderata', 'elevata')),
struttura_muscolo_scheletrica TEXT,
capacita_dispersione_calore TEXT
```

### Tabella Separata per Pliche Cutanee

Potrebbe essere utile creare una tabella separata `skin_folds` per gestire meglio le pliche:

```sql
CREATE TABLE skin_folds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  progress_log_id UUID REFERENCES progress_logs(id) ON DELETE CASCADE,
  site TEXT NOT NULL CHECK (site IN ('tricipite', 'sottoscapolare', 'bicipite', 'cresta_iliaca', 'sopraspinale', 'addominale', 'coscia', 'gamba')),
  value_mm DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 📝 NOTE

- I dati presenti sono principalmente in `progress_logs` e `profiles`
- Alcuni indici possono essere calcolati automaticamente
- Le pliche cutanee potrebbero richiedere una struttura dati separata per maggiore flessibilità
- Le osservazioni cliniche potrebbero essere gestite tramite un campo JSON strutturato o una tabella separata
