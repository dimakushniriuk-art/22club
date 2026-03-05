/**
 * Script per creare una scheda di allenamento completa nel database
 * Eseguire con: npx tsx scripts/create-workout-script.ts
 */

import { createClient } from '@supabase/supabase-js'
import type { PostgrestError } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Leggi .env.local se esiste
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf-8')
  envFile.split('\n').forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^["']|["']$/g, '')
      process.env[key] = value
    }
  })
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SUPABASE_URL || (!SUPABASE_ANON_KEY && !SUPABASE_SERVICE_KEY)) {
  console.error(
    "❌ Configura le variabili d'ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY (o SUPABASE_SERVICE_ROLE_KEY)",
  )
  process.exit(1)
}

// Usa service key se disponibile, altrimenti anon key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY)

type ProfileRow = {
  id: string
  nome: string
  cognome: string
  email: string
  user_id: string
  role?: string | null
}

type ExerciseRow = {
  id: string
  name: string
  muscle_group?: string | null
  equipment?: string | null
}

type WorkoutInsertPayload = {
  athlete_id: string
  name: string
  description: string
  is_active: boolean
  created_by: string | null
}

// Type per workout record (mantenuto per uso futuro)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type WorkoutRecord = WorkoutInsertPayload & {
  id: string
  difficulty?: string | null
}

type WorkoutDayRecord = {
  id: string
  title?: string | null
}

type WorkoutDayExerciseInsert = {
  workout_day_id: string
  exercise_id: string
  target_sets?: number
  target_reps?: number
  target_weight?: number | null
  rest_timer_sec?: number
  order_index?: number
  sets?: number
  reps?: number
  weight?: number | null
  rest_seconds?: number
  order_num?: number
}

type FinalWorkoutSummary = {
  name: string
  difficulty?: string | null
  status?: string | null
  workout_days?: Array<{
    title?: string | null
    workout_day_exercises?: Array<{
      id: string
    }>
  }>
}

async function createCompleteWorkout() {
  try {
    console.log('🔍 Recupero atleti...')
    // Recupera un atleta (prova prima 'athlete', poi 'atleta' per compatibilità)
    const { data: athletes, error: athletesError } = await supabase
      .from<ProfileRow>('profiles')
      .select('id, nome, cognome, email, user_id, role')
      .in('role', ['athlete', 'atleta'])
      .limit(1)

    if (athletesError) {
      throw new Error(`Errore recupero atleti: ${athletesError.message}`)
    }

    let athlete: ProfileRow

    if (!athletes || athletes.length === 0) {
      console.log('⚠️  Nessun atleta trovato, cerco qualsiasi profilo...')
      // Prova a prendere qualsiasi profilo
      const { data: fallbackProfiles } = await supabase
        .from<ProfileRow>('profiles')
        .select('id, nome, cognome, email, user_id, role')
        .limit(1)

      if (!fallbackProfiles || fallbackProfiles.length === 0) {
        console.error('❌ Nessun profilo trovato nel database')
        console.log('💡 Crea prima almeno un profilo nel database (può essere qualsiasi ruolo)')
        console.log('💡 Lo script userà quel profilo per creare la scheda')
        return
      } else {
        athlete = fallbackProfiles[0]
        console.log(
          `⚠️  Usando profilo ${athlete.role || 'sconosciuto'}: ${athlete.nome} ${athlete.cognome}`,
        )
      }
    } else {
      athlete = athletes[0]
    }
    console.log(`✅ Atleta trovato: ${athlete.nome} ${athlete.cognome} (${athlete.email})`)

    // Recupera un profilo staff per created_by (user_id)
    console.log('\n🔍 Recupero profilo staff...')
    const { data: staffProfiles } = await supabase
      .from<Pick<ProfileRow, 'user_id'>>('profiles')
      .select('user_id')
      .in('role', ['admin', 'trainer', 'pt', 'staff'])
      .limit(1)

    const staffUserId = staffProfiles && staffProfiles.length > 0 ? staffProfiles[0].user_id : null

    console.log('\n🔍 Recupero esercizi disponibili...')
    // Recupera esercizi
    const { data: exercises, error: exercisesError } = await supabase
      .from<ExerciseRow>('exercises')
      .select('id, name, muscle_group, equipment')
      .limit(20)

    if (exercisesError) {
      throw new Error(`Errore recupero esercizi: ${exercisesError.message}`)
    }

    if (!exercises || exercises.length === 0) {
      console.error('❌ Nessun esercizio trovato nel database')
      console.log('💡 Crea prima alcuni esercizi nel database')
      return
    }

    console.log(`✅ Trovati ${exercises.length} esercizi disponibili`)

    // Trova esercizi per categoria
    const exercisesList = exercises as ExerciseRow[]

    const getExercise = (searchTerms: string[], muscleGroup?: string) => {
      // Cerca per nome
      for (const term of searchTerms) {
        const found = exercisesList.find((e) => e.name.toLowerCase().includes(term.toLowerCase()))
        if (found) return found
      }
      // Cerca per gruppo muscolare
      if (muscleGroup) {
        const found = exercisesList.find(
          (e) => e.muscle_group?.toLowerCase() === muscleGroup.toLowerCase(),
        )
        if (found) return found
      }
      // Fallback: prendi il primo disponibile
      return exercisesList[0]
    }

    console.log('\n🏋️ Creazione scheda di allenamento...')

    // 1. Crea la scheda workout
    const workoutData: WorkoutInsertPayload = {
      athlete_id: athlete.id,
      name: 'Scheda Forza Completa - Settimana 1',
      description:
        'Scheda di allenamento completa per lo sviluppo della forza muscolare. Focus su esercizi multi-articolari con progressione settimanale. Adatta per atleti intermedi.',
      is_active: true,
      created_by: staffUserId, // user_id del profilo staff
    }

    const { data: workout, error: workoutError } = await supabase
      .from('workout_plans')
      .insert(workoutData)
      .select()
      .single()

    if (workoutError || !workout) {
      throw new Error(`Errore creazione workout: ${workoutError?.message}`)
    }

    console.log(`✅ Scheda creata: "${workout.name}" (ID: ${workout.id})`)

    // 2. Definisci i giorni di allenamento
    const daysConfig = [
      {
        day_number: 1,
        title: 'Giorno 1 - Upper Body (Petto e Spalle)',
        day_name: 'Lunedì',
        description: 'Allenamento completo per petto, spalle e tricipiti',
        exercises: [
          {
            search: ['panca', 'bench'],
            muscleGroup: 'chest',
            sets: 4,
            reps: 8,
            weight: 70,
            rest: 120,
            note: 'Riscaldamento con 50% del peso target per 2 serie',
            order: 1,
          },
          {
            search: ['push', 'press'],
            muscleGroup: 'chest',
            sets: 3,
            reps: 10,
            weight: 50,
            rest: 90,
            order: 2,
          },
          {
            search: ['shoulder', 'spalle'],
            muscleGroup: 'shoulders',
            sets: 3,
            reps: 12,
            weight: 25,
            rest: 90,
            order: 3,
          },
          {
            search: ['triceps', 'tricipiti'],
            muscleGroup: 'triceps',
            sets: 3,
            reps: 12,
            rest: 60,
            order: 4,
          },
        ],
      },
      {
        day_number: 2,
        title: 'Giorno 2 - Lower Body (Gambe)',
        day_name: 'Mercoledì',
        description: 'Allenamento completo per quadricipiti, glutei e polpacci',
        exercises: [
          {
            search: ['squat'],
            muscleGroup: 'legs',
            sets: 4,
            reps: 8,
            weight: 100,
            rest: 120,
            note: 'Attenzione alla tecnica corretta e profondità del movimento',
            order: 1,
          },
          {
            search: ['leg press', 'pressa'],
            muscleGroup: 'legs',
            sets: 3,
            reps: 10,
            weight: 120,
            rest: 90,
            order: 2,
          },
          {
            search: ['lunge', 'affondi'],
            muscleGroup: 'legs',
            sets: 3,
            reps: 12,
            weight: 20,
            rest: 90,
            order: 3,
          },
          {
            search: ['calf', 'polpacci'],
            muscleGroup: 'calves',
            sets: 3,
            reps: 15,
            rest: 60,
            order: 4,
          },
        ],
      },
      {
        day_number: 3,
        title: 'Giorno 3 - Back & Biceps',
        day_name: 'Venerdì',
        description: 'Allenamento completo per dorsali e bicipiti',
        exercises: [
          {
            search: ['lat', 'pull', 'trazioni'],
            muscleGroup: 'back',
            sets: 4,
            reps: 8,
            weight: 70,
            rest: 120,
            order: 1,
          },
          {
            search: ['row', 'remo'],
            muscleGroup: 'back',
            sets: 3,
            reps: 10,
            weight: 60,
            rest: 90,
            order: 2,
          },
          {
            search: ['curl', 'bicipiti'],
            muscleGroup: 'biceps',
            sets: 3,
            reps: 12,
            weight: 15,
            rest: 90,
            order: 3,
          },
          {
            search: ['hammer', 'martello'],
            muscleGroup: 'biceps',
            sets: 3,
            reps: 12,
            weight: 12,
            rest: 60,
            order: 4,
          },
        ],
      },
    ]

    // 3. Crea i giorni e gli esercizi
    for (const dayConfig of daysConfig) {
      console.log(`\n📅 Creazione giorno ${dayConfig.day_number}: ${dayConfig.title}`)

      // Prova prima con la struttura standard, poi con quella alternativa
      let workoutDay: WorkoutDayRecord | null = null

      const { data: day1, error: err1 } = await supabase
        .from('workout_days')
        .insert({
          workout_plan_id: workout.id,
          day_number: dayConfig.day_number,
          title: dayConfig.title,
          day_name: dayConfig.day_name,
          description: dayConfig.description,
        })
        .select()
        .single()

      if (err1 && (err1.message.includes('day_number') || err1.message.includes('title'))) {
        // Prova con struttura alternativa (order_num, day_name)
        const { data: day2, error: err2 } = await supabase
          .from('workout_days')
          .insert({
            workout_plan_id: workout.id,
            order_num: dayConfig.day_number,
            day_name: dayConfig.title || dayConfig.day_name,
          })
          .select()
          .single()

        if (err2 || !day2) {
          throw new Error(`Errore creazione giorno ${dayConfig.day_number}: ${err2?.message}`)
        }
        workoutDay = day2 as WorkoutDayRecord
      } else if (err1 || !day1) {
        throw new Error(`Errore creazione giorno ${dayConfig.day_number}: ${err1?.message}`)
      } else {
        workoutDay = day1 as WorkoutDayRecord
      }

      if (!workoutDay) {
        throw new Error(`Errore creazione giorno ${dayConfig.day_number}`)
      }

      console.log(`  ✅ Giorno creato: "${workoutDay.title}"`)

      // Aggiungi esercizi al giorno
      for (const exConfig of dayConfig.exercises) {
        const exercise = getExercise(exConfig.search, exConfig.muscleGroup)

        // Prova prima con struttura standard, poi con alternativa
        let exerciseInsertError: PostgrestError | null = null

        // Prova prima senza note
        const insertDataWithoutNote: WorkoutDayExerciseInsert = {
          workout_day_id: workoutDay.id,
          exercise_id: exercise.id,
          target_sets: exConfig.sets,
          target_reps: exConfig.reps,
          target_weight: exConfig.weight || null,
          rest_timer_sec: exConfig.rest || 90,
          order_index: exConfig.order,
        }

        const { error: err1 } = await supabase
          .from('workout_day_exercises')
          .insert(insertDataWithoutNote)

        if (
          err1 &&
          (err1.message.includes('target_sets') ||
            err1.message.includes('target_reps') ||
            err1.message.includes('order_index') ||
            err1.message.includes('note'))
        ) {
          // Prova con struttura alternativa (sets, reps, order_num) senza note
          const fallbackExerciseData: WorkoutDayExerciseInsert = {
            workout_day_id: workoutDay.id,
            exercise_id: exercise.id,
            sets: exConfig.sets,
            reps: exConfig.reps,
            weight: exConfig.weight || null,
            rest_seconds: exConfig.rest || 90,
            order_num: exConfig.order,
          }

          const { error: err2 } = await supabase
            .from('workout_day_exercises')
            .insert(fallbackExerciseData)

          exerciseInsertError = err2
        } else {
          exerciseInsertError = err1
        }

        const exerciseError = exerciseInsertError

        if (exerciseError) {
          console.warn(
            `  ⚠️  Errore aggiunta esercizio "${exercise.name}": ${exerciseError.message}`,
          )
        } else {
          console.log(
            `    ✅ ${exercise.name} - ${exConfig.sets}x${exConfig.reps} ${exConfig.weight ? `${exConfig.weight}kg` : ''}`,
          )
        }
      }
    }

    // 4. Riepilogo finale
    const { data: finalWorkout, error: finalError } = await supabase
      .from('workout_plans')
      .select(
        `
        *,
        workout_days(
          id,
          day_number,
          title,
          workout_day_exercises(
            id,
            target_sets,
            target_reps,
            exercise:exercises(name)
          )
        )
      `,
      )
      .eq('id', workout.id)
      .single()

    if (!finalError && finalWorkout) {
      const finalWorkoutSummary = finalWorkout as FinalWorkoutSummary
      const workoutDays = finalWorkoutSummary.workout_days ?? []
      const totalExercises = workoutDays.reduce((sum, day) => {
        const exercisesCount = day.workout_day_exercises?.length ?? 0
        return sum + exercisesCount
      }, 0)

      console.log('\n🎉 SCHEDA COMPLETA CREATA CON SUCCESSO!')
      console.log('═'.repeat(50))
      console.log(`📋 Scheda: ${finalWorkoutSummary.name}`)
      console.log(`👤 Atleta: ${athlete.nome} ${athlete.cognome}`)
      console.log(`📅 Giorni: ${workoutDays.length}`)
      console.log(`💪 Esercizi totali: ${totalExercises}`)
      console.log(`📊 Stato: ${finalWorkoutSummary.is_active ? 'Attivo' : 'Completato'}`)
      console.log('═'.repeat(50))
    }
  } catch (error) {
    console.error('\n❌ ERRORE durante la creazione della scheda:')
    console.error(error)
    process.exit(1)
  }
}

// Esegui lo script
createCompleteWorkout()
