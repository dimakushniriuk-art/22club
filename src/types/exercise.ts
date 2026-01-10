export interface Exercise {
  id: string
  org_id: string
  name: string
  category: string
  muscle_group: string
  difficulty: 'bassa' | 'media' | 'alta'
  description?: string | null
  equipment?: string | null
  image_url?: string | null
  video_url?: string | null
  thumb_url?: string | null
  duration_seconds?: number | null
  created_at: string
  updated_at?: string
}

export type CreateExerciseData = Omit<Exercise, 'id' | 'created_at' | 'updated_at'>
export type UpdateExerciseData = Partial<Exercise>
