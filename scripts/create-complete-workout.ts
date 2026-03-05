/**
 * Script per creare una scheda di allenamento completa
 *
 * Questo script crea:
 * - Una scheda workout completa
 * - 3-4 giorni di allenamento
 * - Esercizi con serie e ripetizioni per ogni giorno
 */

import { createClient } from '@/lib/supabase/server'
import path from 'path'
import { fileURLToPath } from 'url'

interface CreateWorkoutData {
  athlete_id: string
  name: string
  description?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  days: Array<{
    day_number: number
    title: string
    day_name?: string
    description?: string
    exercises: Array<{
      exercise_id: string
      target_sets: number
      target_reps: number
      target_weight?: number
      rest_timer_sec?: number
      order_index: number
      note?: string
    }>
  }>
}

async function createCompleteWorkout(data: CreateWorkoutData) {
  const supabase = await createClient()

  try {
    // 1. Crea la scheda workout
    // Recupera user_id del profilo staff per created_by (fallback se non disponibile)
    let createdByUserId: string | null = null

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('user_id', user.id)
          .single()
        createdByUserId = currentProfile?.user_id || user.id
      }
    } catch {
      // Se non c'è utente autenticato, prova a recuperare un profilo staff
      const { data: staffProfiles } = await supabase
        .from('profiles')
        .select('user_id')
        .in('role', ['admin', 'trainer', 'pt', 'staff'])
        .limit(1)
      createdByUserId = staffProfiles && staffProfiles.length > 0 ? staffProfiles[0].user_id : null
    }

    const { data: workout, error: workoutError } = await supabase
      .from('workout_plans')
      .insert({
        athlete_id: data.athlete_id,
        name: data.name,
        description: data.description,
        is_active: true,
        created_by: createdByUserId,
      })
      .select()
      .single()

    if (workoutError || !workout) {
      throw new Error(`Errore creazione workout: ${workoutError?.message}`)
    }

    console.log(`✅ Scheda "${data.name}" creata con ID: ${workout.id}`)

    // 2. Crea i giorni di allenamento
    const workoutDays = []
    for (const day of data.days) {
      const { data: workoutDay, error: dayError } = await supabase
        .from('workout_days')
        .insert({
          workout_plan_id: workout.id,
          day_number: day.day_number,
          title: day.title,
          day_name: day.day_name,
          description: day.description,
        })
        .select()
        .single()

      if (dayError || !workoutDay) {
        throw new Error(`Errore creazione giorno ${day.day_number}: ${dayError?.message}`)
      }

      workoutDays.push(workoutDay)
      console.log(`  ✅ Giorno ${day.day_number}: "${day.title}" creato`)

      // 3. Aggiungi esercizi al giorno
      for (const exercise of day.exercises) {
        const { error: exerciseError } = await supabase.from('workout_day_exercises').insert({
          workout_day_id: workoutDay.id,
          exercise_id: exercise.exercise_id,
          target_sets: exercise.target_sets,
          target_reps: exercise.target_reps,
          target_weight: exercise.target_weight || null,
          rest_timer_sec: exercise.rest_timer_sec || 90,
          order_index: exercise.order_index,
          note: exercise.note || null,
        })

        if (exerciseError) {
          throw new Error(
            `Errore aggiunta esercizio al giorno ${day.day_number}: ${exerciseError.message}`,
          )
        }
      }
      console.log(`    ✅ ${day.exercises.length} esercizi aggiunti al giorno ${day.day_number}`)
    }

    console.log(`\n🎉 Scheda completa creata con successo!`)
    console.log(`   - Scheda: ${workout.name}`)
    console.log(`   - Giorni: ${workoutDays.length}`)
    console.log(
      `   - Totale esercizi: ${data.days.reduce((sum, day) => sum + day.exercises.length, 0)}`,
    )

    return workout
  } catch (error) {
    console.error('❌ Errore durante la creazione della scheda:', error)
    throw error
  }
}

// Esempio di utilizzo
async function main() {
  const supabase = await createClient()

  // 1. Recupera un atleta
  const { data: athletes, error: athletesError } = await supabase
    .from('profiles')
    .select('id, nome, cognome')
    .eq('role', 'athlete')
    .limit(1)

  if (athletesError || !athletes || athletes.length === 0) {
    console.error('❌ Nessun atleta trovato nel database')
    return
  }

  const athlete = athletes[0]
  console.log(`📋 Creando scheda per: ${athlete.nome} ${athlete.cognome}`)

  // 2. Recupera alcuni esercizi
  const { data: exercises, error: exercisesError } = await supabase
    .from('exercises')
    .select('id, name, muscle_group')
    .limit(15)

  if (exercisesError || !exercises || exercises.length === 0) {
    console.error('❌ Nessun esercizio trovato nel database')
    return
  }

  console.log(`📋 Trovati ${exercises.length} esercizi disponibili`)

  // 3. Crea una scheda completa
  const workoutData: CreateWorkoutData = {
    athlete_id: athlete.id,
    name: 'Scheda Forza Completa - Settimana 1',
    description:
      'Scheda di allenamento completa per lo sviluppo della forza muscolare. Focus su esercizi multi-articolari con progressione settimanale.',
    difficulty: 'intermediate',
    days: [
      {
        day_number: 1,
        title: 'Giorno 1 - Upper Body (Petto e Spalle)',
        day_name: 'Lunedì',
        description: 'Allenamento per petto, spalle e tricipiti',
        exercises: [
          {
            exercise_id:
              exercises.find((e) => e.name.toLowerCase().includes('panca'))?.id || exercises[0].id,
            target_sets: 4,
            target_reps: 8,
            target_weight: 70,
            rest_timer_sec: 120,
            order_index: 1,
            note: 'Riscaldamento con 50% del peso target',
          },
          {
            exercise_id:
              exercises.find((e) => e.muscle_group === 'chest')?.id ||
              exercises[1]?.id ||
              exercises[0].id,
            target_sets: 3,
            target_reps: 10,
            target_weight: 50,
            rest_timer_sec: 90,
            order_index: 2,
          },
          {
            exercise_id:
              exercises.find((e) => e.muscle_group === 'shoulders')?.id ||
              exercises[2]?.id ||
              exercises[0].id,
            target_sets: 3,
            target_reps: 12,
            target_weight: 25,
            rest_timer_sec: 90,
            order_index: 3,
          },
          {
            exercise_id:
              exercises.find((e) => e.muscle_group === 'triceps')?.id ||
              exercises[3]?.id ||
              exercises[0].id,
            target_sets: 3,
            target_reps: 12,
            rest_timer_sec: 60,
            order_index: 4,
          },
        ],
      },
      {
        day_number: 2,
        title: 'Giorno 2 - Lower Body (Gambe)',
        day_name: 'Mercoledì',
        description: 'Allenamento per quadricipiti, glutei e polpacci',
        exercises: [
          {
            exercise_id:
              exercises.find((e) => e.name.toLowerCase().includes('squat'))?.id || exercises[0].id,
            target_sets: 4,
            target_reps: 8,
            target_weight: 100,
            rest_timer_sec: 120,
            order_index: 1,
            note: 'Attenzione alla tecnica corretta',
          },
          {
            exercise_id:
              exercises.find((e) => e.muscle_group === 'legs')?.id ||
              exercises[1]?.id ||
              exercises[0].id,
            target_sets: 3,
            target_reps: 10,
            target_weight: 80,
            rest_timer_sec: 90,
            order_index: 2,
          },
          {
            exercise_id:
              exercises.find((e) => e.muscle_group === 'glutes')?.id ||
              exercises[2]?.id ||
              exercises[0].id,
            target_sets: 3,
            target_reps: 12,
            target_weight: 60,
            rest_timer_sec: 90,
            order_index: 3,
          },
          {
            exercise_id:
              exercises.find((e) => e.muscle_group === 'calves')?.id ||
              exercises[3]?.id ||
              exercises[0].id,
            target_sets: 3,
            target_reps: 15,
            rest_timer_sec: 60,
            order_index: 4,
          },
        ],
      },
      {
        day_number: 3,
        title: 'Giorno 3 - Back & Biceps',
        day_name: 'Venerdì',
        description: 'Allenamento per dorsali e bicipiti',
        exercises: [
          {
            exercise_id: exercises.find((e) => e.muscle_group === 'back')?.id || exercises[0].id,
            target_sets: 4,
            target_reps: 8,
            target_weight: 70,
            rest_timer_sec: 120,
            order_index: 1,
          },
          {
            exercise_id:
              exercises.find((e) => e.muscle_group === 'back')?.id ||
              exercises[1]?.id ||
              exercises[0].id,
            target_sets: 3,
            target_reps: 10,
            target_weight: 60,
            rest_timer_sec: 90,
            order_index: 2,
          },
          {
            exercise_id:
              exercises.find((e) => e.muscle_group === 'biceps')?.id ||
              exercises[2]?.id ||
              exercises[0].id,
            target_sets: 3,
            target_reps: 12,
            target_weight: 15,
            rest_timer_sec: 90,
            order_index: 3,
          },
          {
            exercise_id:
              exercises.find((e) => e.muscle_group === 'biceps')?.id ||
              exercises[3]?.id ||
              exercises[0].id,
            target_sets: 3,
            target_reps: 12,
            rest_timer_sec: 60,
            order_index: 4,
          },
        ],
      },
    ],
  }

  await createCompleteWorkout(workoutData)
}

// Esegui solo se chiamato direttamente
const isDirectExecution =
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isDirectExecution) {
  main().catch(console.error)
}

export { createCompleteWorkout, type CreateWorkoutData }
