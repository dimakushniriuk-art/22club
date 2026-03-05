/**
 * Script per inserire 3 esercizi di esempio completi nel database
 * Eseguire con: npx tsx scripts/insert-example-exercises.ts
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Carica variabili d'ambiente da .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Configura NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY in .env.local')
  console.error('   Valori trovati:', {
    url: supabaseUrl ? '✅' : '❌',
    key: supabaseKey ? '✅' : '❌',
  })
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const exampleExercises = [
  {
    name: 'Squat con Bilanciere',
    muscle_group: 'Quadricipiti',
    equipment: 'Bilanciere',
    difficulty: 'medium',
    description:
      'Esercizio fondamentale per lo sviluppo delle gambe. Partire con i piedi alla larghezza delle spalle, scendere mantenendo la schiena dritta fino a formare un angolo di 90° con le ginocchia, poi risalire spingendo con i talloni. Mantenere il core contratto durante tutto il movimento. Esegui 3-4 serie da 8-12 ripetizioni.',
  },
  {
    name: 'Panca Piana',
    muscle_group: 'Pettorali',
    equipment: 'Bilanciere',
    difficulty: 'medium',
    description:
      "Esercizio principale per lo sviluppo del petto. Sdraiarsi sulla panca, impugnare il bilanciere con presa leggermente più larga delle spalle. Abbassare il bilanciere fino al petto e spingere verso l'alto mantenendo i gomiti leggermente aperti. Mantenere i piedi ben piantati a terra. Esegui 3-4 serie da 8-10 ripetizioni.",
  },
  {
    name: 'Stacco da Terra',
    muscle_group: 'Lombari',
    equipment: 'Bilanciere',
    difficulty: 'hard',
    description:
      "Esercizio completo per la catena cinetica posteriore. Posizionare i piedi sotto il bilanciere, piegarsi mantenendo la schiena dritta, afferrare il bilanciere e sollevare estendendo anche e ginocchia. Attenzione alla tecnica per evitare infortuni. Importante mantenere il core contratto e il petto alto durante tutta l'esecuzione. Esegui 3-5 serie da 5-8 ripetizioni.",
  },
]

async function insertExercises() {
  console.log('🚀 Inserimento esercizi di esempio...\n')

  for (const exercise of exampleExercises) {
    try {
      const { error } = await supabase.from('exercises').insert(exercise).select().single()

      if (error) {
        console.error(`❌ Errore inserendo ${exercise.name}:`, error.message)
      } else {
        console.log(
          `✅ Inserito: ${exercise.name} (${exercise.difficulty}) - ${exercise.muscle_group}`,
        )
      }
    } catch (err) {
      console.error(`❌ Errore inserendo ${exercise.name}:`, err)
    }
  }

  console.log('\n✨ Inserimento completato!')
}

insertExercises()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Errore:', err)
    process.exit(1)
  })
