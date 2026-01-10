export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

// Re-export types from lib/supabase/types
export type { TablesInsert, TablesUpdate, Tables } from '@/lib/supabase/types'
export type { Database as SupabaseDatabase } from '@/lib/supabase/types'

export interface Database {
  public: {
    Tables: {
      athlete_smart_tracking_data: {
        Row: {
          id: string
          athlete_id: string
          data_rilevazione: string
          dispositivo_tipo?: string | null
          dispositivo_marca?: string | null
          passi_giornalieri?: number | null
          calorie_bruciate?: number | null
          distanza_percorsa_km?: number | null
          battito_cardiaco_medio?: number | null
          battito_cardiaco_max?: number | null
          battito_cardiaco_min?: number | null
          ore_sonno?: number | null
          qualita_sonno?: string | null
          attivita_minuti?: number | null
          metrica_custom?: Json
          created_at?: string | null
          updated_at?: string | null
        }
        Insert: {
          id?: string
          athlete_id: string
          data_rilevazione: string
          dispositivo_tipo?: string | null
          dispositivo_marca?: string | null
          passi_giornalieri?: number | null
          calorie_bruciate?: number | null
          distanza_percorsa_km?: number | null
          battito_cardiaco_medio?: number | null
          battito_cardiaco_max?: number | null
          battito_cardiaco_min?: number | null
          ore_sonno?: number | null
          qualita_sonno?: string | null
          attivita_minuti?: number | null
          metrica_custom?: Json
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          athlete_id?: string
          data_rilevazione?: string
          dispositivo_tipo?: string | null
          dispositivo_marca?: string | null
          passi_giornalieri?: number | null
          calorie_bruciate?: number | null
          distanza_percorsa_km?: number | null
          battito_cardiaco_medio?: number | null
          battito_cardiaco_max?: number | null
          battito_cardiaco_min?: number | null
          ore_sonno?: number | null
          qualita_sonno?: string | null
          attivita_minuti?: number | null
          metrica_custom?: Json
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          id: string
          org_id: string
          athlete_id: string
          trainer_id: string
          starts_at: string
          ends_at: string
          status: 'attivo' | 'completato' | 'annullato' | 'in_corso'
          type: 'allenamento' | 'prova' | 'valutazione'
          location?: string
          notes?: string
          recurrence_rule?: string
          cancelled_at?: string
          trainer_name?: string
          athlete_name?: string
          created_at: string
          updated_at?: string
        }
        Insert: {
          id?: string
          org_id: string
          athlete_id: string
          trainer_id: string
          starts_at: string
          ends_at: string
          status?: 'attivo' | 'completato' | 'annullato' | 'in_corso'
          type?: 'allenamento' | 'cardio' | 'check' | 'consulenza'
          location?: string
          notes?: string
          recurrence_rule?: string
          cancelled_at?: string
          trainer_name?: string
          athlete_name?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          athlete_id?: string
          trainer_id?: string
          starts_at?: string
          ends_at?: string
          status?: 'attivo' | 'completato' | 'annullato' | 'in_corso'
          type?: 'allenamento' | 'cardio' | 'check' | 'consulenza'
          location?: string
          notes?: string
          recurrence_rule?: string
          cancelled_at?: string
          trainer_name?: string
          athlete_name?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          id: string
          org_id: string
          athlete_id: string
          file_url: string
          file_name: string
          file_type: string
          file_size: number
          status: 'valido' | 'scaduto' | 'in-revisione' | 'in_scadenza' | 'non_valido'
          uploaded_by_name?: string
          expires_at?: string
          notes?: string
          created_at: string
          updated_at?: string
        }
        Insert: {
          id?: string
          org_id: string
          athlete_id: string
          file_url: string
          file_name: string
          file_type: string
          file_size: number
          status?: 'valido' | 'scaduto' | 'in-revisione' | 'in_scadenza' | 'non_valido'
          uploaded_by_name?: string
          expires_at?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          athlete_id?: string
          file_url?: string
          file_name?: string
          file_type?: string
          file_size?: number
          status?: 'valido' | 'scaduto' | 'in-revisione' | 'in_scadenza' | 'non_valido'
          uploaded_by_name?: string
          expires_at?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          user_id?: string | null
          org_id?: string | null
          nome?: string | null
          cognome?: string | null
          first_name?: string | null
          last_name?: string | null
          email: string
          phone?: string | null
          telefono?: string | null
          role?: string | null
          stato?: string | null
          note?: string | null
          data_iscrizione?: string | null
          data_nascita?: string | null
          sesso?: string | null
          codice_fiscale?: string | null
          indirizzo?: string | null
          citta?: string | null
          cap?: string | null
          provincia?: string | null
          nazione?: string | null
          contatto_emergenza_nome?: string | null
          contatto_emergenza_telefono?: string | null
          contatto_emergenza_relazione?: string | null
          professione?: string | null
          altezza_cm?: number | null
          peso_iniziale_kg?: number | null
          gruppo_sanguigno?: string | null
          documenti_scadenza?: boolean | null
          avatar?: string | null
          avatar_url?: string | null
          ultimo_accesso?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Insert: {
          id: string
          user_id?: string | null
          org_id?: string | null
          nome?: string | null
          cognome?: string | null
          first_name?: string | null
          last_name?: string | null
          email: string
          phone?: string | null
          telefono?: string | null
          role?: string | null
          stato?: string | null
          note?: string | null
          data_iscrizione?: string | null
          data_nascita?: string | null
          sesso?: string | null
          codice_fiscale?: string | null
          indirizzo?: string | null
          citta?: string | null
          cap?: string | null
          provincia?: string | null
          nazione?: string | null
          contatto_emergenza_nome?: string | null
          contatto_emergenza_telefono?: string | null
          contatto_emergenza_relazione?: string | null
          professione?: string | null
          altezza_cm?: number | null
          peso_iniziale_kg?: number | null
          gruppo_sanguigno?: string | null
          documenti_scadenza?: boolean | null
          avatar?: string | null
          avatar_url?: string | null
          ultimo_accesso?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          org_id?: string | null
          nome?: string | null
          cognome?: string | null
          first_name?: string | null
          last_name?: string | null
          email?: string
          phone?: string | null
          telefono?: string | null
          role?: string | null
          stato?: string | null
          note?: string | null
          data_iscrizione?: string | null
          data_nascita?: string | null
          sesso?: string | null
          codice_fiscale?: string | null
          indirizzo?: string | null
          citta?: string | null
          cap?: string | null
          provincia?: string | null
          nazione?: string | null
          contatto_emergenza_nome?: string | null
          contatto_emergenza_telefono?: string | null
          contatto_emergenza_relazione?: string | null
          professione?: string | null
          altezza_cm?: number | null
          peso_iniziale_kg?: number | null
          gruppo_sanguigno?: string | null
          documenti_scadenza?: boolean | null
          avatar?: string | null
          avatar_url?: string | null
          ultimo_accesso?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      communication_recipients: {
        Row: {
          id: string
          communication_id: string
          user_id: string
          recipient_type: 'push' | 'email' | 'sms'
          status: 'pending' | 'sent' | 'delivered' | 'opened' | 'failed' | 'bounced'
          sent_at?: string | null
          delivered_at?: string | null
          opened_at?: string | null
          failed_at?: string | null
          error_message?: string | null
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
        }
        Insert: {
          id?: string
          communication_id: string
          user_id: string
          recipient_type: 'push' | 'email' | 'sms'
          status?: 'pending' | 'sent' | 'delivered' | 'opened' | 'failed' | 'bounced'
          sent_at?: string | null
          delivered_at?: string | null
          opened_at?: string | null
          failed_at?: string | null
          error_message?: string | null
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          communication_id?: string
          user_id?: string
          recipient_type?: 'push' | 'email' | 'sms'
          status?: 'pending' | 'sent' | 'delivered' | 'opened' | 'failed' | 'bounced'
          sent_at?: string | null
          delivered_at?: string | null
          opened_at?: string | null
          failed_at?: string | null
          error_message?: string | null
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      exercises: {
        Row: {
          id: string
          org_id: string
          name: string
          category: string | null
          muscle_group?: string | null
          equipment?: string | null
          description?: string
          image_url?: string
          video_url?: string | null
          thumb_url?: string | null
          duration_seconds?: number | null
          created_by?: string | null
          difficulty:
            | 'easy'
            | 'medium'
            | 'hard'
            | 'bassa'
            | 'media'
            | 'alta'
            | 'beginner'
            | 'intermediate'
            | 'advanced'
          created_at: string
          updated_at?: string
        }
        Insert: {
          id?: string
          org_id?: string
          name: string
          category?: string | null
          muscle_group?: string | null
          equipment?: string | null
          description?: string
          image_url?: string
          video_url?: string | null
          thumb_url?: string | null
          duration_seconds?: number | null
          created_by?: string | null
          difficulty?:
            | 'easy'
            | 'medium'
            | 'hard'
            | 'bassa'
            | 'media'
            | 'alta'
            | 'beginner'
            | 'intermediate'
            | 'advanced'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          category?: string | null
          muscle_group?: string | null
          equipment?: string | null
          description?: string
          image_url?: string
          video_url?: string | null
          thumb_url?: string | null
          duration_seconds?: number | null
          created_by?: string | null
          difficulty?:
            | 'easy'
            | 'medium'
            | 'hard'
            | 'bassa'
            | 'media'
            | 'alta'
            | 'beginner'
            | 'intermediate'
            | 'advanced'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      roles: {
        Row: {
          id: string
          name: string
          description?: string
          permissions: Json
          created_at: string
          updated_at?: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          permissions: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          permissions?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_text?: string
          body: string
          created_at?: string
          id: string
          is_push_sent?: boolean
          link?: string
          read_at?: string
          sent_at?: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_text?: string
          body: string
          created_at?: string
          id?: string
          is_push_sent?: boolean
          link?: string
          read_at?: string
          sent_at?: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_text?: string
          body?: string
          created_at?: string
          id?: string
          is_push_sent?: boolean
          link?: string
          read_at?: string
          sent_at?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_push_tokens: {
        Row: {
          id: string
          user_id: string
          device_type?: string
          token: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          user_id: string
          device_type?: string
          token: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          device_type?: string
          token?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          id: string
          user_id: string
          message: string
          created_at: string
          updated_at?: string
        }
        Insert: {
          id?: string
          user_id: string
          message: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          message?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      communications: {
        Row: {
          id: string
          created_by: string
          title: string
          message: string
          type: 'push' | 'email' | 'sms' | 'all'
          status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled'
          scheduled_for?: string | null
          sent_at?: string | null
          recipient_filter?: Json
          total_recipients?: number
          total_sent?: number
          total_delivered?: number
          total_opened?: number
          total_failed?: number
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
        }
        Insert: {
          id?: string
          created_by: string
          title: string
          message: string
          type: 'push' | 'email' | 'sms' | 'all'
          status?: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled'
          scheduled_for?: string | null
          sent_at?: string | null
          recipient_filter?: Json
          total_recipients?: number
          total_sent?: number
          total_delivered?: number
          total_opened?: number
          total_failed?: number
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          created_by?: string
          title?: string
          message?: string
          type?: 'push' | 'email' | 'sms' | 'all'
          status?: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled'
          scheduled_for?: string | null
          sent_at?: string | null
          recipient_filter?: Json
          total_recipients?: number
          total_sent?: number
          total_delivered?: number
          total_opened?: number
          total_failed?: number
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          athlete_id: string
          amount: number
          currency?: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_method?: string
          method_text?: string
          is_reversal?: boolean
          ref_payment_id?: string | null
          notes?: string | null
          lessons_purchased?: number
          created_by_staff_id?: string
          payment_date?: string | null
          org_id?: string
          created_at: string
          updated_at?: string
        }
        Insert: {
          id?: string
          athlete_id: string
          amount: number
          currency?: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_method?: string
          method_text?: string
          is_reversal?: boolean
          ref_payment_id?: string | null
          notes?: string | null
          lessons_purchased?: number
          created_by_staff_id?: string
          payment_date?: string | null
          org_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          athlete_id?: string
          amount?: number
          currency?: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_method?: string
          method_text?: string
          is_reversal?: boolean
          ref_payment_id?: string | null
          notes?: string | null
          lessons_purchased?: number
          created_by_staff_id?: string
          payment_date?: string | null
          org_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      inviti_atleti: {
        Row: {
          id: string
          email: string
          token: string
          status: 'pending' | 'accepted' | 'expired'
          created_at: string
          updated_at?: string
        }
        Insert: {
          id?: string
          email: string
          token: string
          status?: 'pending' | 'accepted' | 'expired'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          token?: string
          status?: 'pending' | 'accepted' | 'expired'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      cliente_tags: {
        Row: {
          id: string
          name: string
          color: string
          created_at: string
          updated_at?: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      lesson_counters: {
        Row: {
          id: string
          athlete_id: string
          lesson_type: string
          count: number
          created_at: string
          updated_at?: string
        }
        Insert: {
          id?: string
          athlete_id: string
          lesson_type: string
          count: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          athlete_id?: string
          lesson_type?: string
          count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      workout_logs: {
        Row: {
          id: string
          atleta_id: string
          athlete_id?: string | null
          scheda_id?: string | null
          workout_plan_id?: string | null
          data: string
          stato?: string | null
          durata_minuti?: number | null
          esercizi_completati?: number
          esercizi_totali?: number
          volume_totale?: number | null
          note?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Insert: {
          id?: string
          atleta_id: string
          athlete_id?: string | null
          scheda_id?: string | null
          workout_plan_id?: string | null
          data: string
          stato?: string | null
          durata_minuti?: number | null
          esercizi_completati?: number
          esercizi_totali?: number
          volume_totale?: number | null
          note?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          atleta_id?: string
          athlete_id?: string | null
          scheda_id?: string | null
          workout_plan_id?: string | null
          data?: string
          stato?: string | null
          durata_minuti?: number | null
          esercizi_completati?: number
          esercizi_totali?: number
          volume_totale?: number | null
          note?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      workout_stats_mensili: {
        Row: {
          id: string
          athlete_id: string
          month: string
          year: number
          total_workouts: number
          completed_workouts: number
          created_at: string
          updated_at?: string
        }
        Insert: {
          id?: string
          athlete_id: string
          month: string
          year: number
          total_workouts: number
          completed_workouts: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          athlete_id?: string
          month?: string
          year?: number
          total_workouts?: number
          completed_workouts?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      workout_completion_rate_view: {
        Row: {
          athlete_id: string
          nome_atleta: string
          schede_assegnate: number
          schede_completate: number
          schede_attive: number
          percentuale_completamento: number
        }
      }
    }
    Functions: {
      get_analytics_distribution_data: {
        Args: Record<PropertyKey, never>
        Returns: Array<{
          type: string
          count: number
          percentage: number
        }>
      }
      get_analytics_performance_data: {
        Args: {
          p_limit?: number
        }
        Returns: Array<{
          athlete_id: string
          athlete_name: string
          total_workouts: number
          avg_duration: number
          completion_rate: number
        }>
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
