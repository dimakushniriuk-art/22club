# Piano Integrazione DuckDB - 22Club (Futuro)

**Status**: 📋 Piano preparato - Implementazione quando necessario  
**Priorità**: 🟢 BASSA (non prioritario al momento)

## 📋 Overview

Piano dettagliato per integrazione DuckDB quando necessario. Questo documento serve come blueprint per implementazione futura.

## 🎯 Obiettivi

1. **Analytics Avanzati**: Query OLAP complesse
2. **Performance**: Query più veloci su dataset grandi
3. **Scalabilità**: Gestione dataset molto grandi
4. **Funzionalità**: Machine learning, data science workflows

## 🏗️ Architettura

### Componenti

```
┌─────────────┐
│  Supabase   │ (Database principale)
│  (Postgres) │
└──────┬──────┘
       │
       │ Export periodico
       ▼
┌─────────────┐
│   Parquet    │ (Storage efficiente)
│   Files      │
└──────┬──────┘
       │
       │ Load
       ▼
┌─────────────┐
│   DuckDB     │ (Analytics engine)
│   (Node.js)  │
└──────┬──────┘
       │
       │ Query
       ▼
┌─────────────┐
│   API       │ (Next.js API Routes)
│   Routes    │
└─────────────┘
```

### Stack Tecnologico

- **DuckDB**: `duckdb` (Node.js) o `@duckdb/duckdb-wasm` (client-side)
- **Parquet**: Formato storage efficiente
- **Sincronizzazione**: Cron job o Supabase Realtime
- **API**: Next.js API Routes

## 📦 Installazione

### Dipendenze

```json
{
  "dependencies": {
    "duckdb": "^1.0.0"
  }
}
```

### Setup

```bash
npm install duckdb
```

## 🔧 Implementazione

### 1. DuckDB Client

```typescript
// src/lib/analytics/duckdb-client.ts
import duckdb from 'duckdb'

export class DuckDBAnalytics {
  private db: duckdb.Database | null = null
  private connection: duckdb.Connection | null = null

  async init(): Promise<void> {
    this.db = new duckdb.Database(':memory:')
    this.connection = this.db.connect()
  }

  async loadParquet(path: string): Promise<void> {
    await this.connection?.exec(`CREATE TABLE data AS SELECT * FROM read_parquet('${path}')`)
  }

  async query<T>(sql: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.connection?.all(sql, (err, result) => {
        if (err) reject(err)
        else resolve(result as T[])
      })
    })
  }

  async close(): Promise<void> {
    this.connection?.close()
    this.db?.close()
  }
}
```

### 2. Export Supabase → Parquet

```typescript
// src/lib/analytics/export-to-parquet.ts
import { createClient } from '@/lib/supabase/server'
import { writeFile } from 'fs/promises'

export async function exportSupabaseToParquet() {
  const supabase = createClient()

  // Export tabelle principali
  const tables = ['profiles', 'payments', 'workout_logs', 'progress_logs']

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*')
    if (error) throw error

    // Converti a Parquet (usando libreria parquet)
    const parquetData = convertToParquet(data)
    await writeFile(`./data/${table}.parquet`, parquetData)
  }
}
```

### 3. Sincronizzazione

```typescript
// src/lib/analytics/sync-duckdb.ts
import { DuckDBAnalytics } from './duckdb-client'
import { exportSupabaseToParquet } from './export-to-parquet'

export async function syncDuckDB() {
  // 1. Export Supabase → Parquet
  await exportSupabaseToParquet()

  // 2. Load Parquet → DuckDB
  const duckdb = new DuckDBAnalytics()
  await duckdb.init()

  const tables = ['profiles', 'payments', 'workout_logs', 'progress_logs']
  for (const table of tables) {
    await duckdb.loadParquet(`./data/${table}.parquet`)
  }

  return duckdb
}
```

### 4. API Route

```typescript
// src/app/api/analytics/duckdb/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { syncDuckDB } from '@/lib/analytics/sync-duckdb'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query')

  if (!query) {
    return NextResponse.json({ error: 'Query required' }, { status: 400 })
  }

  try {
    const duckdb = await syncDuckDB()
    const result = await duckdb.query(query)
    await duckdb.close()

    return NextResponse.json({ data: result })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
```

### 5. Cron Job

```typescript
// src/app/api/cron/sync-duckdb/route.ts
import { syncDuckDB } from '@/lib/analytics/sync-duckdb'

export async function GET(request: NextRequest) {
  // Verifica secret per sicurezza
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await syncDuckDB()
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
```

## 📊 Query Esempio

### Query Complesse

```sql
-- Time-series analysis
SELECT
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as total,
  SUM(amount) as revenue
FROM payments
GROUP BY month
ORDER BY month DESC

-- Predictive analytics
SELECT
  athlete_id,
  AVG(weight_kg) as avg_weight,
  TREND(weight_kg) as weight_trend
FROM progress_logs
GROUP BY athlete_id

-- Segmentation avanzata
SELECT
  CASE
    WHEN total_spent > 1000 THEN 'VIP'
    WHEN total_spent > 500 THEN 'Premium'
    ELSE 'Standard'
  END as segment,
  COUNT(*) as count
FROM (
  SELECT athlete_id, SUM(amount) as total_spent
  FROM payments
  GROUP BY athlete_id
)
GROUP BY segment
```

## 🧪 Testing

### Test Performance

```typescript
// tests/analytics/duckdb-performance.test.ts
describe('DuckDB Performance', () => {
  it('should execute complex queries < 1s', async () => {
    const start = Date.now()
    const result = await duckdb.query('SELECT ...')
    const duration = Date.now() - start

    expect(duration).toBeLessThan(1000)
  })
})
```

### Test Sincronizzazione

```typescript
describe('DuckDB Sync', () => {
  it('should sync data from Supabase', async () => {
    await syncDuckDB()
    const result = await duckdb.query('SELECT COUNT(*) FROM profiles')
    expect(result[0].count).toBeGreaterThan(0)
  })
})
```

## 📈 Monitoring

### Metriche da Monitorare

1. **Performance**
   - Tempo esecuzione query
   - Tempo sincronizzazione
   - Memory usage

2. **Dati**
   - Numero record sincronizzati
   - Dimensione Parquet files
   - Frequenza sincronizzazione

3. **Errori**
   - Errori sincronizzazione
   - Errori query
   - Timeout

## 🚀 Deployment

### Variabili d'Ambiente

```env
# DuckDB
DUCKDB_ENABLED=false
DUCKDB_SYNC_CRON=0 2 * * *  # Daily at 2 AM
DUCKDB_PARQUET_PATH=./data
CRON_SECRET=your-secret-key
```

### Build

```bash
# Build con DuckDB (quando abilitato)
npm run build
```

## ⚠️ Considerazioni

### Performance

- ✅ Query più veloci su dataset grandi
- ⚠️ Overhead sincronizzazione
- ⚠️ Memory usage (DuckDB in-memory)

### Scalabilità

- ✅ Gestione dataset molto grandi
- ⚠️ Storage Parquet necessario
- ⚠️ Sincronizzazione può essere lenta

### Manutenzione

- ⚠️ Due sorgenti dati da mantenere
- ⚠️ Sincronizzazione da monitorare
- ⚠️ Debugging più complesso

## 📚 Riferimenti

- [DuckDB Documentation](https://duckdb.org/docs/)
- [DuckDB Node.js](https://github.com/duckdb/duckdb-node)
- [Parquet Format](https://parquet.apache.org/)
- [Evaluation Report](./duckdb-integration-evaluation.md)
