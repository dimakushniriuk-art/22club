export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          athlete_id: string | null
          athlete_name: string | null
          cancelled_at: string | null
          color: string | null
          created_at: string | null
          created_by_role: string | null
          ends_at: string
          id: string
          is_open_booking_day: boolean
          location: string | null
          notes: string | null
          org_id: string
          org_id_text: string | null
          recurrence_rule: string | null
          service_type: string | null
          staff_id: string
          starts_at: string
          status: string | null
          trainer_id: string | null
          trainer_name: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          athlete_id?: string | null
          athlete_name?: string | null
          cancelled_at?: string | null
          color?: string | null
          created_at?: string | null
          created_by_role?: string | null
          ends_at: string
          id?: string
          is_open_booking_day?: boolean
          location?: string | null
          notes?: string | null
          org_id: string
          org_id_text?: string | null
          recurrence_rule?: string | null
          service_type?: string | null
          staff_id: string
          starts_at: string
          status?: string | null
          trainer_id?: string | null
          trainer_name?: string | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          athlete_id?: string | null
          athlete_name?: string | null
          cancelled_at?: string | null
          color?: string | null
          created_at?: string | null
          created_by_role?: string | null
          ends_at?: string
          id?: string
          is_open_booking_day?: boolean
          location?: string | null
          notes?: string | null
          org_id?: string
          org_id_text?: string | null
          recurrence_rule?: string | null
          service_type?: string | null
          staff_id?: string
          starts_at?: string
          status?: string | null
          trainer_id?: string | null
          trainer_name?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "appointments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "appointments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "appointments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "appointments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "appointments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "appointments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "appointments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "appointments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "appointments_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "appointments_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "appointments_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "appointments_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_cancellations: {
        Row: {
          id: string
          appointment_id: string
          athlete_id: string
          cancelled_at: string
          cancelled_by_profile_id: string
          cancellation_type: string
          lesson_deducted: boolean
        }
        Insert: {
          id?: string
          appointment_id: string
          athlete_id: string
          cancelled_at?: string
          cancelled_by_profile_id: string
          cancellation_type: string
          lesson_deducted?: boolean
        }
        Update: {
          id?: string
          appointment_id?: string
          athlete_id?: string
          cancelled_at?: string
          cancelled_by_profile_id?: string
          cancellation_type?: string
          lesson_deducted?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "appointment_cancellations_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_cancellations_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_blocks: {
        Row: {
          id: string
          org_id: string
          staff_id: string | null
          starts_at: string
          ends_at: string
          reason: string
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          staff_id?: string | null
          starts_at: string
          ends_at: string
          reason: string
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          staff_id?: string | null
          starts_at?: string
          ends_at?: string
          reason?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_blocks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_blocks_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_calendar_settings: {
        Row: {
          id: string
          staff_id: string
          org_id: string
          default_durations: Json
          enabled_appointment_types: Json
          custom_appointment_types: Json
          type_colors: Json
          default_calendar_view: string
          default_week_start: string
          show_free_pass_calendar: boolean
          show_collaborators_calendars: boolean
          recurrence_options: Json
          work_hours: Json | null
          slot_duration_minutes: number
          max_free_pass_athletes_per_slot: number
          view_density: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          staff_id: string
          org_id: string
          default_durations?: Json
          enabled_appointment_types?: Json
          custom_appointment_types?: Json
          type_colors?: Json
          default_calendar_view?: string
          default_week_start?: string
          show_free_pass_calendar?: boolean
          show_collaborators_calendars?: boolean
          recurrence_options?: Json
          work_hours?: Json | null
          slot_duration_minutes?: number
          max_free_pass_athletes_per_slot?: number
          view_density?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          staff_id?: string
          org_id?: string
          default_durations?: Json
          enabled_appointment_types?: Json
          custom_appointment_types?: Json
          type_colors?: Json
          default_calendar_view?: string
          default_week_start?: string
          show_free_pass_calendar?: boolean
          show_collaborators_calendars?: boolean
          recurrence_options?: Json
          work_hours?: Json | null
          slot_duration_minutes?: number
          max_free_pass_athletes_per_slot?: number
          view_density?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_calendar_settings_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_calendar_settings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_administrative_data: {
        Row: {
          athlete_id: string
          created_at: string | null
          data_inizio_abbonamento: string | null
          data_scadenza_abbonamento: string | null
          documenti_contrattuali: Json | null
          id: string
          lezioni_incluse: number | null
          lezioni_rimanenti: number | null
          lezioni_utilizzate: number | null
          metodo_pagamento_preferito: string | null
          note_contrattuali: string | null
          stato_abbonamento: string | null
          tipo_abbonamento: string | null
          updated_at: string | null
        }
        Insert: {
          athlete_id: string
          created_at?: string | null
          data_inizio_abbonamento?: string | null
          data_scadenza_abbonamento?: string | null
          documenti_contrattuali?: Json | null
          id?: string
          lezioni_incluse?: number | null
          lezioni_rimanenti?: number | null
          lezioni_utilizzate?: number | null
          metodo_pagamento_preferito?: string | null
          note_contrattuali?: string | null
          stato_abbonamento?: string | null
          tipo_abbonamento?: string | null
          updated_at?: string | null
        }
        Update: {
          athlete_id?: string
          created_at?: string | null
          data_inizio_abbonamento?: string | null
          data_scadenza_abbonamento?: string | null
          documenti_contrattuali?: Json | null
          id?: string
          lezioni_incluse?: number | null
          lezioni_rimanenti?: number | null
          lezioni_utilizzate?: number | null
          metodo_pagamento_preferito?: string | null
          note_contrattuali?: string | null
          stato_abbonamento?: string | null
          tipo_abbonamento?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "athlete_administrative_data_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      athlete_ai_data: {
        Row: {
          athlete_id: string
          created_at: string | null
          data_analisi: string | null
          fattori_rischio: string[] | null
          id: string
          insights_aggregati: Json | null
          note_ai: string | null
          pattern_rilevati: Json | null
          predizioni_performance: Json | null
          raccomandazioni: Json | null
          score_engagement: number | null
          score_progresso: number | null
          updated_at: string | null
        }
        Insert: {
          athlete_id: string
          created_at?: string | null
          data_analisi?: string | null
          fattori_rischio?: string[] | null
          id?: string
          insights_aggregati?: Json | null
          note_ai?: string | null
          pattern_rilevati?: Json | null
          predizioni_performance?: Json | null
          raccomandazioni?: Json | null
          score_engagement?: number | null
          score_progresso?: number | null
          updated_at?: string | null
        }
        Update: {
          athlete_id?: string
          created_at?: string | null
          data_analisi?: string | null
          fattori_rischio?: string[] | null
          id?: string
          insights_aggregati?: Json | null
          note_ai?: string | null
          pattern_rilevati?: Json | null
          predizioni_performance?: Json | null
          raccomandazioni?: Json | null
          score_engagement?: number | null
          score_progresso?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "athlete_ai_data_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      athlete_fitness_data: {
        Row: {
          athlete_id: string
          attivita_precedenti: string[] | null
          created_at: string | null
          durata_sessione_minuti: number | null
          giorni_settimana_allenamento: number | null
          id: string
          infortuni_pregressi: Json | null
          livello_esperienza: string | null
          note_fitness: string | null
          obiettivi_secondari: string[] | null
          obiettivo_primario: string | null
          preferenze_orario: string[] | null
          updated_at: string | null
          zone_problematiche: string[] | null
        }
        Insert: {
          athlete_id: string
          attivita_precedenti?: string[] | null
          created_at?: string | null
          durata_sessione_minuti?: number | null
          giorni_settimana_allenamento?: number | null
          id?: string
          infortuni_pregressi?: Json | null
          livello_esperienza?: string | null
          note_fitness?: string | null
          obiettivi_secondari?: string[] | null
          obiettivo_primario?: string | null
          preferenze_orario?: string[] | null
          updated_at?: string | null
          zone_problematiche?: string[] | null
        }
        Update: {
          athlete_id?: string
          attivita_precedenti?: string[] | null
          created_at?: string | null
          durata_sessione_minuti?: number | null
          giorni_settimana_allenamento?: number | null
          id?: string
          infortuni_pregressi?: Json | null
          livello_esperienza?: string | null
          note_fitness?: string | null
          obiettivi_secondari?: string[] | null
          obiettivo_primario?: string | null
          preferenze_orario?: string[] | null
          updated_at?: string | null
          zone_problematiche?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "athlete_fitness_data_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      athlete_marketing_kpis: {
        Row: {
          athlete_profile_id: string
          last_activity_at: string | null
          last_workout_at: string | null
          massages_30d: number
          nutrition_visits_30d: number
          org_id: string
          org_id_text: string
          updated_at: string
          workouts_coached_30d: number
          workouts_coached_7d: number
          workouts_coached_90d: number
          workouts_solo_30d: number
          workouts_solo_7d: number
          workouts_solo_90d: number
        }
        Insert: {
          athlete_profile_id: string
          last_activity_at?: string | null
          last_workout_at?: string | null
          massages_30d?: number
          nutrition_visits_30d?: number
          org_id: string
          org_id_text: string
          updated_at?: string
          workouts_coached_30d?: number
          workouts_coached_7d?: number
          workouts_coached_90d?: number
          workouts_solo_30d?: number
          workouts_solo_7d?: number
          workouts_solo_90d?: number
        }
        Update: {
          athlete_profile_id?: string
          last_activity_at?: string | null
          last_workout_at?: string | null
          massages_30d?: number
          nutrition_visits_30d?: number
          org_id?: string
          org_id_text?: string
          updated_at?: string
          workouts_coached_30d?: number
          workouts_coached_7d?: number
          workouts_coached_90d?: number
          workouts_solo_30d?: number
          workouts_solo_7d?: number
          workouts_solo_90d?: number
        }
        Relationships: [
          {
            foreignKeyName: "athlete_marketing_kpis_athlete_profile_id_fkey"
            columns: ["athlete_profile_id"]
            isOneToOne: true
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "athlete_marketing_kpis_athlete_profile_id_fkey"
            columns: ["athlete_profile_id"]
            isOneToOne: true
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "athlete_marketing_kpis_athlete_profile_id_fkey"
            columns: ["athlete_profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_marketing_kpis_athlete_profile_id_fkey"
            columns: ["athlete_profile_id"]
            isOneToOne: true
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "athlete_marketing_kpis_athlete_profile_id_fkey"
            columns: ["athlete_profile_id"]
            isOneToOne: true
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "athlete_marketing_kpis_athlete_profile_id_fkey"
            columns: ["athlete_profile_id"]
            isOneToOne: true
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_massage_data: {
        Row: {
          allergie_prodotti: string[] | null
          athlete_id: string
          created_at: string | null
          id: string
          intensita_preferita: string | null
          note_terapeutiche: string | null
          preferenze_tipo_massaggio: string[] | null
          storico_massaggi: Json | null
          updated_at: string | null
          zone_problematiche: string[] | null
        }
        Insert: {
          allergie_prodotti?: string[] | null
          athlete_id: string
          created_at?: string | null
          id?: string
          intensita_preferita?: string | null
          note_terapeutiche?: string | null
          preferenze_tipo_massaggio?: string[] | null
          storico_massaggi?: Json | null
          updated_at?: string | null
          zone_problematiche?: string[] | null
        }
        Update: {
          allergie_prodotti?: string[] | null
          athlete_id?: string
          created_at?: string | null
          id?: string
          intensita_preferita?: string | null
          note_terapeutiche?: string | null
          preferenze_tipo_massaggio?: string[] | null
          storico_massaggi?: Json | null
          updated_at?: string | null
          zone_problematiche?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "athlete_massage_data_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      athlete_medical_data: {
        Row: {
          allergie: string[] | null
          athlete_id: string
          certificato_medico_scadenza: string | null
          certificato_medico_tipo: string | null
          certificato_medico_url: string | null
          created_at: string | null
          farmaci_assunti: Json | null
          id: string
          interventi_chirurgici: Json | null
          note_mediche: string | null
          patologie: string[] | null
          referti_medici: Json | null
          updated_at: string | null
        }
        Insert: {
          allergie?: string[] | null
          athlete_id: string
          certificato_medico_scadenza?: string | null
          certificato_medico_tipo?: string | null
          certificato_medico_url?: string | null
          created_at?: string | null
          farmaci_assunti?: Json | null
          id?: string
          interventi_chirurgici?: Json | null
          note_mediche?: string | null
          patologie?: string[] | null
          referti_medici?: Json | null
          updated_at?: string | null
        }
        Update: {
          allergie?: string[] | null
          athlete_id?: string
          certificato_medico_scadenza?: string | null
          certificato_medico_tipo?: string | null
          certificato_medico_url?: string | null
          created_at?: string | null
          farmaci_assunti?: Json | null
          id?: string
          interventi_chirurgici?: Json | null
          note_mediche?: string | null
          patologie?: string[] | null
          referti_medici?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "athlete_medical_data_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      athlete_motivational_data: {
        Row: {
          athlete_id: string
          created_at: string | null
          id: string
          livello_motivazione: number | null
          motivazione_principale: string | null
          motivazioni_secondarie: string[] | null
          note_motivazionali: string | null
          ostacoli_percepiti: string[] | null
          preferenze_ambiente: string[] | null
          preferenze_compagnia: string[] | null
          storico_abbandoni: Json | null
          updated_at: string | null
        }
        Insert: {
          athlete_id: string
          created_at?: string | null
          id?: string
          livello_motivazione?: number | null
          motivazione_principale?: string | null
          motivazioni_secondarie?: string[] | null
          note_motivazionali?: string | null
          ostacoli_percepiti?: string[] | null
          preferenze_ambiente?: string[] | null
          preferenze_compagnia?: string[] | null
          storico_abbandoni?: Json | null
          updated_at?: string | null
        }
        Update: {
          athlete_id?: string
          created_at?: string | null
          id?: string
          livello_motivazione?: number | null
          motivazione_principale?: string | null
          motivazioni_secondarie?: string[] | null
          note_motivazionali?: string | null
          ostacoli_percepiti?: string[] | null
          preferenze_ambiente?: string[] | null
          preferenze_compagnia?: string[] | null
          storico_abbandoni?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "athlete_motivational_data_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      athlete_nutrition_data: {
        Row: {
          alimenti_evitati: string[] | null
          alimenti_preferiti: string[] | null
          allergie_alimentari: string[] | null
          athlete_id: string
          calorie_giornaliere_target: number | null
          created_at: string | null
          dieta_seguita: string | null
          id: string
          intolleranze_alimentari: string[] | null
          macronutrienti_target: Json | null
          note_nutrizionali: string | null
          obiettivo_nutrizionale: string | null
          preferenze_orari_pasti: Json | null
          updated_at: string | null
        }
        Insert: {
          alimenti_evitati?: string[] | null
          alimenti_preferiti?: string[] | null
          allergie_alimentari?: string[] | null
          athlete_id: string
          calorie_giornaliere_target?: number | null
          created_at?: string | null
          dieta_seguita?: string | null
          id?: string
          intolleranze_alimentari?: string[] | null
          macronutrienti_target?: Json | null
          note_nutrizionali?: string | null
          obiettivo_nutrizionale?: string | null
          preferenze_orari_pasti?: Json | null
          updated_at?: string | null
        }
        Update: {
          alimenti_evitati?: string[] | null
          alimenti_preferiti?: string[] | null
          allergie_alimentari?: string[] | null
          athlete_id?: string
          calorie_giornaliere_target?: number | null
          created_at?: string | null
          dieta_seguita?: string | null
          id?: string
          intolleranze_alimentari?: string[] | null
          macronutrienti_target?: Json | null
          note_nutrizionali?: string | null
          obiettivo_nutrizionale?: string | null
          preferenze_orari_pasti?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "athlete_nutrition_data_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      athlete_questionnaires: {
        Row: {
          anamnesi: Json
          athlete_id: string
          created_at: string
          id: string
          liberatoria_media: Json
          manleva: Json
          signed_at: string | null
          updated_at: string
          version: string
        }
        Insert: {
          anamnesi?: Json
          athlete_id: string
          created_at?: string
          id?: string
          liberatoria_media?: Json
          manleva?: Json
          signed_at?: string | null
          updated_at?: string
          version: string
        }
        Update: {
          anamnesi?: Json
          athlete_id?: string
          created_at?: string
          id?: string
          liberatoria_media?: Json
          manleva?: Json
          signed_at?: string | null
          updated_at?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "athlete_questionnaires_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "athlete_questionnaires_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "athlete_questionnaires_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_questionnaires_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "athlete_questionnaires_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "athlete_questionnaires_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_smart_tracking_data: {
        Row: {
          athlete_id: string
          attivita_minuti: number | null
          battito_cardiaco_max: number | null
          battito_cardiaco_medio: number | null
          battito_cardiaco_min: number | null
          calorie_bruciate: number | null
          created_at: string | null
          data_rilevazione: string
          dispositivo_marca: string | null
          dispositivo_tipo: string | null
          distanza_percorsa_km: number | null
          id: string
          metrica_custom: Json | null
          ore_sonno: number | null
          passi_giornalieri: number | null
          qualita_sonno: string | null
          updated_at: string | null
        }
        Insert: {
          athlete_id: string
          attivita_minuti?: number | null
          battito_cardiaco_max?: number | null
          battito_cardiaco_medio?: number | null
          battito_cardiaco_min?: number | null
          calorie_bruciate?: number | null
          created_at?: string | null
          data_rilevazione: string
          dispositivo_marca?: string | null
          dispositivo_tipo?: string | null
          distanza_percorsa_km?: number | null
          id?: string
          metrica_custom?: Json | null
          ore_sonno?: number | null
          passi_giornalieri?: number | null
          qualita_sonno?: string | null
          updated_at?: string | null
        }
        Update: {
          athlete_id?: string
          attivita_minuti?: number | null
          battito_cardiaco_max?: number | null
          battito_cardiaco_medio?: number | null
          battito_cardiaco_min?: number | null
          calorie_bruciate?: number | null
          created_at?: string | null
          data_rilevazione?: string
          dispositivo_marca?: string | null
          dispositivo_tipo?: string | null
          distanza_percorsa_km?: number | null
          id?: string
          metrica_custom?: Json | null
          ore_sonno?: number | null
          passi_giornalieri?: number | null
          qualita_sonno?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "athlete_smart_tracking_data_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      athlete_trainer_assignments: {
        Row: {
          activated_at: string
          athlete_id: string
          created_at: string
          created_by_profile_id: string | null
          deactivated_at: string | null
          id: string
          org_id: string
          org_id_text: string
          status: string
          trainer_id: string
        }
        Insert: {
          activated_at?: string
          athlete_id: string
          created_at?: string
          created_by_profile_id?: string | null
          deactivated_at?: string | null
          id?: string
          org_id: string
          org_id_text: string
          status: string
          trainer_id: string
        }
        Update: {
          activated_at?: string
          athlete_id?: string
          created_at?: string
          created_by_profile_id?: string | null
          deactivated_at?: string | null
          id?: string
          org_id?: string
          org_id_text?: string
          status?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "athlete_trainer_assignments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "athlete_trainer_assignments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "athlete_trainer_assignments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_trainer_assignments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "athlete_trainer_assignments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "athlete_trainer_assignments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_trainer_assignments_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "athlete_trainer_assignments_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "athlete_trainer_assignments_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_trainer_assignments_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "athlete_trainer_assignments_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "athlete_trainer_assignments_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_trainer_assignments_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "athlete_trainer_assignments_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "athlete_trainer_assignments_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_trainer_assignments_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "athlete_trainer_assignments_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "athlete_trainer_assignments_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
      athletes: {
        Row: {
          converted_from_lead_id: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          org_id: string
          phone: string | null
          status: string
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          converted_from_lead_id?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          org_id: string
          phone?: string | null
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          converted_from_lead_id?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          org_id?: string
          phone?: string | null
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_profile_id: string | null
          created_at: string | null
          id: string
          impersonated_profile_id: string | null
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          org_id: string | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          actor_profile_id?: string | null
          created_at?: string | null
          id?: string
          impersonated_profile_id?: string | null
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          org_id?: string | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          actor_profile_id?: string | null
          created_at?: string | null
          id?: string
          impersonated_profile_id?: string | null
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          org_id?: string | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "audit_logs_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "audit_logs_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "audit_logs_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "audit_logs_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_impersonated_profile_id_fkey"
            columns: ["impersonated_profile_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "audit_logs_impersonated_profile_id_fkey"
            columns: ["impersonated_profile_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "audit_logs_impersonated_profile_id_fkey"
            columns: ["impersonated_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_impersonated_profile_id_fkey"
            columns: ["impersonated_profile_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "audit_logs_impersonated_profile_id_fkey"
            columns: ["impersonated_profile_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "audit_logs_impersonated_profile_id_fkey"
            columns: ["impersonated_profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          message: string
          read_at: string | null
          receiver_id: string
          sender_id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          message: string
          read_at?: string | null
          receiver_id: string
          sender_id: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          message?: string
          read_at?: string | null
          receiver_id?: string
          sender_id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "chat_messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "chat_messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "chat_messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "chat_messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
      cliente_tags: {
        Row: {
          color: string | null
          colore: string | null
          created_at: string | null
          description: string | null
          descrizione: string | null
          id: string
          name: string | null
          nome: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          colore?: string | null
          created_at?: string | null
          description?: string | null
          descrizione?: string | null
          id?: string
          name?: string | null
          nome: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          colore?: string | null
          created_at?: string | null
          description?: string | null
          descrizione?: string | null
          id?: string
          name?: string | null
          nome?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      communication_recipients: {
        Row: {
          communication_id: string
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          failed_at: string | null
          id: string
          metadata: Json | null
          opened_at: string | null
          recipient_profile_id: string
          recipient_type: string
          sent_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          communication_id: string
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          recipient_profile_id: string
          recipient_type: string
          sent_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          communication_id?: string
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          recipient_profile_id?: string
          recipient_type?: string
          sent_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_recipients_communication_id_fkey"
            columns: ["communication_id"]
            isOneToOne: false
            referencedRelation: "communications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_recipients_recipient_profile_id_fkey"
            columns: ["recipient_profile_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "communication_recipients_recipient_profile_id_fkey"
            columns: ["recipient_profile_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "communication_recipients_recipient_profile_id_fkey"
            columns: ["recipient_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_recipients_recipient_profile_id_fkey"
            columns: ["recipient_profile_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "communication_recipients_recipient_profile_id_fkey"
            columns: ["recipient_profile_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "communication_recipients_recipient_profile_id_fkey"
            columns: ["recipient_profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
      communications: {
        Row: {
          created_at: string | null
          created_by_profile_id: string
          id: string
          message: string
          metadata: Json | null
          recipient_filter: Json | null
          scheduled_for: string | null
          sent_at: string | null
          status: string
          title: string
          total_delivered: number | null
          total_failed: number | null
          total_opened: number | null
          total_recipients: number | null
          total_sent: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by_profile_id: string
          id?: string
          message: string
          metadata?: Json | null
          recipient_filter?: Json | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          title: string
          total_delivered?: number | null
          total_failed?: number | null
          total_opened?: number | null
          total_recipients?: number | null
          total_sent?: number | null
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by_profile_id?: string
          id?: string
          message?: string
          metadata?: Json | null
          recipient_filter?: Json | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          title?: string
          total_delivered?: number | null
          total_failed?: number | null
          total_opened?: number | null
          total_recipients?: number | null
          total_sent?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communications_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "communications_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "communications_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "communications_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "communications_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_ledger: {
        Row: {
          applies_to_counter: boolean
          appointment_id: string | null
          athlete_id: string
          created_at: string
          created_by_profile_id: string | null
          entry_type: string
          id: string
          org_id: string
          payment_id: string | null
          qty: number
          reason: string | null
          service_type: string
        }
        Insert: {
          applies_to_counter?: boolean
          appointment_id?: string | null
          athlete_id: string
          created_at?: string
          created_by_profile_id?: string | null
          entry_type: string
          id?: string
          org_id?: string
          payment_id?: string | null
          qty: number
          reason?: string | null
          service_type: string
        }
        Update: {
          applies_to_counter?: boolean
          appointment_id?: string | null
          athlete_id?: string
          created_at?: string
          created_by_profile_id?: string | null
          entry_type?: string
          id?: string
          org_id?: string
          payment_id?: string | null
          qty?: number
          reason?: string | null
          service_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_ledger_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_ledger_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "credit_ledger_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "credit_ledger_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_ledger_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "credit_ledger_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "credit_ledger_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_ledger_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "credit_ledger_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "credit_ledger_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_ledger_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "credit_ledger_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "credit_ledger_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_ledger_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          athlete_id: string
          category: string
          created_at: string | null
          expires_at: string | null
          file_url: string
          id: string
          notes: string | null
          org_id: string
          org_id_text: string | null
          status: string | null
          updated_at: string | null
          uploaded_by_name: string | null
          uploaded_by_profile_id: string
        }
        Insert: {
          athlete_id: string
          category: string
          created_at?: string | null
          expires_at?: string | null
          file_url: string
          id?: string
          notes?: string | null
          org_id: string
          org_id_text?: string | null
          status?: string | null
          updated_at?: string | null
          uploaded_by_name?: string | null
          uploaded_by_profile_id: string
        }
        Update: {
          athlete_id?: string
          category?: string
          created_at?: string | null
          expires_at?: string | null
          file_url?: string
          id?: string
          notes?: string | null
          org_id?: string
          org_id_text?: string | null
          status?: string | null
          updated_at?: string | null
          uploaded_by_name?: string | null
          uploaded_by_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "documents_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "documents_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "documents_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "documents_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_profile_id_fkey"
            columns: ["uploaded_by_profile_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_profile_id_fkey"
            columns: ["uploaded_by_profile_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_profile_id_fkey"
            columns: ["uploaded_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_profile_id_fkey"
            columns: ["uploaded_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_profile_id_fkey"
            columns: ["uploaded_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_profile_id_fkey"
            columns: ["uploaded_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          category: string | null
          created_at: string | null
          created_by_profile_id: string
          description: string | null
          difficulty: string
          duration_seconds: number | null
          equipment: string | null
          id: string
          image_url: string | null
          muscle_group: string
          name: string
          org_id: string
          org_id_text: string | null
          thumb_url: string | null
          thumbnail_url: string | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by_profile_id: string
          description?: string | null
          difficulty: string
          duration_seconds?: number | null
          equipment?: string | null
          id?: string
          image_url?: string | null
          muscle_group: string
          name: string
          org_id: string
          org_id_text?: string | null
          thumb_url?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by_profile_id?: string
          description?: string | null
          difficulty?: string
          duration_seconds?: number | null
          equipment?: string | null
          id?: string
          image_url?: string | null
          muscle_group?: string
          name?: string
          org_id?: string
          org_id_text?: string | null
          thumb_url?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "exercises_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "exercises_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "exercises_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "exercises_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
      inviti_atleti: {
        Row: {
          accepted_at: string | null
          codice: string
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          invited_by: string | null
          nome_atleta: string
          pt_id: string
          qr_url: string | null
          stato: string
          status: string | null
          token: string
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          codice: string
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          nome_atleta: string
          pt_id: string
          qr_url?: string | null
          stato?: string
          status?: string | null
          token: string
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          codice?: string
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          nome_atleta?: string
          pt_id?: string
          qr_url?: string | null
          stato?: string
          status?: string | null
          token?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inviti_atleti_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "inviti_atleti_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "inviti_atleti_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inviti_atleti_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "inviti_atleti_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "inviti_atleti_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inviti_atleti_pt_id_fkey"
            columns: ["pt_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "inviti_atleti_pt_id_fkey"
            columns: ["pt_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "inviti_atleti_pt_id_fkey"
            columns: ["pt_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inviti_atleti_pt_id_fkey"
            columns: ["pt_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "inviti_atleti_pt_id_fkey"
            columns: ["pt_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "inviti_atleti_pt_id_fkey"
            columns: ["pt_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
      inviti_cliente: {
        Row: {
          atleta_id: string
          created_at: string | null
          expires_at: string | null
          id: string
          responded_at: string | null
          staff_id: string
          stato: string
        }
        Insert: {
          atleta_id: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          responded_at?: string | null
          staff_id: string
          stato?: string
        }
        Update: {
          atleta_id?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          responded_at?: string | null
          staff_id?: string
          stato?: string
        }
        Relationships: [
          {
            foreignKeyName: "inviti_cliente_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "inviti_cliente_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "inviti_cliente_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inviti_cliente_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "inviti_cliente_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "inviti_cliente_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inviti_cliente_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "inviti_cliente_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "inviti_cliente_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inviti_cliente_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "inviti_cliente_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "inviti_cliente_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_to_athlete_links: {
        Row: {
          athlete_profile_id: string
          created_at: string
          created_by: string | null
          id: string
          lead_id: string
          org_id: string
        }
        Insert: {
          athlete_profile_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          lead_id: string
          org_id: string
        }
        Update: {
          athlete_profile_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          lead_id?: string
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_to_athlete_links_athlete_profile_id_fkey"
            columns: ["athlete_profile_id"]
            isOneToOne: true
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "lead_to_athlete_links_athlete_profile_id_fkey"
            columns: ["athlete_profile_id"]
            isOneToOne: true
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "lead_to_athlete_links_athlete_profile_id_fkey"
            columns: ["athlete_profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_to_athlete_links_athlete_profile_id_fkey"
            columns: ["athlete_profile_id"]
            isOneToOne: true
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "lead_to_athlete_links_athlete_profile_id_fkey"
            columns: ["athlete_profile_id"]
            isOneToOne: true
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "lead_to_athlete_links_athlete_profile_id_fkey"
            columns: ["athlete_profile_id"]
            isOneToOne: true
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_to_athlete_links_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "marketing_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_counters: {
        Row: {
          athlete_id: string
          count: number | null
          created_at: string | null
          id: string
          lesson_type: string
          updated_at: string | null
        }
        Insert: {
          athlete_id: string
          count?: number | null
          created_at?: string | null
          id?: string
          lesson_type: string
          updated_at?: string | null
        }
        Update: {
          athlete_id?: string
          count?: number | null
          created_at?: string | null
          id?: string
          lesson_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_counters_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "lesson_counters_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "lesson_counters_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_counters_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "lesson_counters_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "lesson_counters_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_counters_athlete_profile_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "lesson_counters_athlete_profile_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "lesson_counters_athlete_profile_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_counters_athlete_profile_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "lesson_counters_athlete_profile_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "lesson_counters_athlete_profile_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_automations: {
        Row: {
          action_payload: Json
          action_type: string
          created_at: string
          id: string
          is_active: boolean
          last_run_at: string | null
          name: string
          org_id: string
          org_id_text: string
          segment_id: string
          updated_at: string
        }
        Insert: {
          action_payload?: Json
          action_type: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          name: string
          org_id: string
          org_id_text: string
          segment_id: string
          updated_at?: string
        }
        Update: {
          action_payload?: Json
          action_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          name?: string
          org_id?: string
          org_id_text?: string
          segment_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_automations_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "marketing_segments"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_campaigns: {
        Row: {
          budget: number | null
          channel: string | null
          created_at: string
          end_at: string | null
          id: string
          name: string
          org_id: string
          org_id_text: string
          start_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          budget?: number | null
          channel?: string | null
          created_at?: string
          end_at?: string | null
          id?: string
          name: string
          org_id: string
          org_id_text: string
          start_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          budget?: number | null
          channel?: string | null
          created_at?: string
          end_at?: string | null
          id?: string
          name?: string
          org_id?: string
          org_id_text?: string
          start_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      marketing_events: {
        Row: {
          actor_profile_id: string | null
          campaign_id: string | null
          created_at: string
          id: string
          lead_id: string | null
          medium: string | null
          occurred_at: string
          org_id: string
          org_id_text: string
          payload: Json | null
          source: string | null
          type: string
          utm_campaign: string | null
        }
        Insert: {
          actor_profile_id?: string | null
          campaign_id?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          medium?: string | null
          occurred_at?: string
          org_id: string
          org_id_text: string
          payload?: Json | null
          source?: string | null
          type: string
          utm_campaign?: string | null
        }
        Update: {
          actor_profile_id?: string | null
          campaign_id?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          medium?: string | null
          occurred_at?: string
          org_id?: string
          org_id_text?: string
          payload?: Json | null
          source?: string | null
          type?: string
          utm_campaign?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_events_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "marketing_events_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "marketing_events_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_events_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "marketing_events_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "marketing_events_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "marketing_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_lead_notes: {
        Row: {
          author_id: string | null
          created_at: string
          id: string
          lead_id: string
          note: string
          org_id: string
          org_id_text: string
        }
        Insert: {
          author_id?: string | null
          created_at?: string
          id?: string
          lead_id: string
          note: string
          org_id: string
          org_id_text: string
        }
        Update: {
          author_id?: string | null
          created_at?: string
          id?: string
          lead_id?: string
          note?: string
          org_id?: string
          org_id_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_lead_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "marketing_lead_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "marketing_lead_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_lead_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "marketing_lead_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "marketing_lead_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_lead_notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "marketing_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_lead_status_history: {
        Row: {
          changed_by_profile_id: string | null
          created_at: string
          from_status: string | null
          id: string
          lead_id: string
          org_id: string
          org_id_text: string
          to_status: string
        }
        Insert: {
          changed_by_profile_id?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          lead_id: string
          org_id: string
          org_id_text: string
          to_status: string
        }
        Update: {
          changed_by_profile_id?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          lead_id?: string
          org_id?: string
          org_id_text?: string
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_lead_status_history_changed_by_profile_id_fkey"
            columns: ["changed_by_profile_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "marketing_lead_status_history_changed_by_profile_id_fkey"
            columns: ["changed_by_profile_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "marketing_lead_status_history_changed_by_profile_id_fkey"
            columns: ["changed_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_lead_status_history_changed_by_profile_id_fkey"
            columns: ["changed_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "marketing_lead_status_history_changed_by_profile_id_fkey"
            columns: ["changed_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "marketing_lead_status_history_changed_by_profile_id_fkey"
            columns: ["changed_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_lead_status_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "marketing_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_leads: {
        Row: {
          converted_at: string | null
          converted_athlete_profile_id: string | null
          converted_by_profile_id: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          org_id: string
          org_id_text: string
          phone: string | null
          source: string | null
          status: string
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          converted_at?: string | null
          converted_athlete_profile_id?: string | null
          converted_by_profile_id?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          org_id: string
          org_id_text: string
          phone?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          converted_at?: string | null
          converted_athlete_profile_id?: string | null
          converted_by_profile_id?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          org_id?: string
          org_id_text?: string
          phone?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_leads_converted_athlete_profile_id_fkey"
            columns: ["converted_athlete_profile_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "marketing_leads_converted_athlete_profile_id_fkey"
            columns: ["converted_athlete_profile_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "marketing_leads_converted_athlete_profile_id_fkey"
            columns: ["converted_athlete_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_leads_converted_athlete_profile_id_fkey"
            columns: ["converted_athlete_profile_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "marketing_leads_converted_athlete_profile_id_fkey"
            columns: ["converted_athlete_profile_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "marketing_leads_converted_athlete_profile_id_fkey"
            columns: ["converted_athlete_profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_leads_converted_by_profile_id_fkey"
            columns: ["converted_by_profile_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "marketing_leads_converted_by_profile_id_fkey"
            columns: ["converted_by_profile_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "marketing_leads_converted_by_profile_id_fkey"
            columns: ["converted_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_leads_converted_by_profile_id_fkey"
            columns: ["converted_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "marketing_leads_converted_by_profile_id_fkey"
            columns: ["converted_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "marketing_leads_converted_by_profile_id_fkey"
            columns: ["converted_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_segments: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          org_id: string
          org_id_text: string
          rules: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          org_id: string
          org_id_text: string
          rules?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          org_id?: string
          org_id_text?: string
          rules?: Json
          updated_at?: string
        }
        Relationships: []
      }
      marketing_trials: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          lead_id: string
          notes: string | null
          org_id: string
          starts_at: string
          status: string
          trainer_id: string | null
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          lead_id: string
          notes?: string | null
          org_id: string
          starts_at: string
          status?: string
          trainer_id?: string | null
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          lead_id?: string
          notes?: string | null
          org_id?: string
          starts_at?: string
          status?: string
          trainer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_trials_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "marketing_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_text: string | null
          appointment_id: string | null
          body: string | null
          created_at: string | null
          id: string
          is_push_sent: boolean | null
          is_read: boolean | null
          link: string | null
          message: string | null
          read_at: string | null
          scheduled_for: string | null
          sent_at: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_text?: string | null
          appointment_id?: string | null
          body?: string | null
          created_at?: string | null
          id?: string
          is_push_sent?: boolean | null
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          read_at?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_text?: string | null
          appointment_id?: string | null
          body?: string | null
          created_at?: string | null
          id?: string
          is_push_sent?: boolean | null
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          read_at?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_adaptive_settings: {
        Row: {
          adjust_frequency_days: number | null
          created_at: string
          goal_type: string
          id: string
          max_calorie_adjustment: number | null
          min_calorie_adjustment: number | null
          protein_floor_per_kg: number | null
          tolerance_percent: number | null
          version_id: string
          weekly_target_percent: number | null
        }
        Insert: {
          adjust_frequency_days?: number | null
          created_at?: string
          goal_type: string
          id?: string
          max_calorie_adjustment?: number | null
          min_calorie_adjustment?: number | null
          protein_floor_per_kg?: number | null
          tolerance_percent?: number | null
          version_id: string
          weekly_target_percent?: number | null
        }
        Update: {
          adjust_frequency_days?: number | null
          created_at?: string
          goal_type?: string
          id?: string
          max_calorie_adjustment?: number | null
          min_calorie_adjustment?: number | null
          protein_floor_per_kg?: number | null
          tolerance_percent?: number | null
          version_id?: string
          weekly_target_percent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_adaptive_settings_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: true
            referencedRelation: "nutrition_plan_versions_legacy"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_adjustments: {
        Row: {
          adjustment_reason: string | null
          applied: boolean | null
          athlete_id: string
          calories_after: number | null
          calories_before: number | null
          carbs_after: number | null
          carbs_before: number | null
          confirmed_at: string | null
          created_at: string
          fat_after: number | null
          fat_before: number | null
          id: string
          new_version_id: string
          previous_version_id: string
          protein_after: number | null
          protein_before: number | null
        }
        Insert: {
          adjustment_reason?: string | null
          applied?: boolean | null
          athlete_id: string
          calories_after?: number | null
          calories_before?: number | null
          carbs_after?: number | null
          carbs_before?: number | null
          confirmed_at?: string | null
          created_at?: string
          fat_after?: number | null
          fat_before?: number | null
          id?: string
          new_version_id: string
          previous_version_id: string
          protein_after?: number | null
          protein_before?: number | null
        }
        Update: {
          adjustment_reason?: string | null
          applied?: boolean | null
          athlete_id?: string
          calories_after?: number | null
          calories_before?: number | null
          carbs_after?: number | null
          carbs_before?: number | null
          confirmed_at?: string | null
          created_at?: string
          fat_after?: number | null
          fat_before?: number | null
          id?: string
          new_version_id?: string
          previous_version_id?: string
          protein_after?: number | null
          protein_before?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_adjustments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "nutrition_adjustments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "nutrition_adjustments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_adjustments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "nutrition_adjustments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "nutrition_adjustments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_adjustments_new_version_id_fkey"
            columns: ["new_version_id"]
            isOneToOne: false
            referencedRelation: "nutrition_plan_versions_legacy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_adjustments_previous_version_id_fkey"
            columns: ["previous_version_id"]
            isOneToOne: false
            referencedRelation: "nutrition_plan_versions_legacy"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_auto_config: {
        Row: {
          carb_cycling: boolean | null
          created_at: string
          id: string
          macro_distribution_mode: string | null
          meals_per_day: number | null
          version_id: string
        }
        Insert: {
          carb_cycling?: boolean | null
          created_at?: string
          id?: string
          macro_distribution_mode?: string | null
          meals_per_day?: number | null
          version_id: string
        }
        Update: {
          carb_cycling?: boolean | null
          created_at?: string
          id?: string
          macro_distribution_mode?: string | null
          meals_per_day?: number | null
          version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_auto_config_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: true
            referencedRelation: "nutrition_plan_versions_legacy"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_plan_days: {
        Row: {
          calories_total: number | null
          day_of_week: number
          id: string
          version_id: string
        }
        Insert: {
          calories_total?: number | null
          day_of_week: number
          id?: string
          version_id: string
        }
        Update: {
          calories_total?: number | null
          day_of_week?: number
          id?: string
          version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_plan_days_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "nutrition_plan_versions_legacy"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_plan_groups: {
        Row: {
          athlete_id: string
          created_at: string
          goal: string | null
          id: string
          nutrizionista_id: string
          org_id: string
          title: string
        }
        Insert: {
          athlete_id: string
          created_at?: string
          goal?: string | null
          id?: string
          nutrizionista_id: string
          org_id: string
          title: string
        }
        Update: {
          athlete_id?: string
          created_at?: string
          goal?: string | null
          id?: string
          nutrizionista_id?: string
          org_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_plan_groups_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "nutrition_plan_groups_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "nutrition_plan_groups_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_plan_groups_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "nutrition_plan_groups_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "nutrition_plan_groups_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_plan_groups_nutrizionista_id_fkey"
            columns: ["nutrizionista_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "nutrition_plan_groups_nutrizionista_id_fkey"
            columns: ["nutrizionista_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "nutrition_plan_groups_nutrizionista_id_fkey"
            columns: ["nutrizionista_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_plan_groups_nutrizionista_id_fkey"
            columns: ["nutrizionista_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "nutrition_plan_groups_nutrizionista_id_fkey"
            columns: ["nutrizionista_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "nutrition_plan_groups_nutrizionista_id_fkey"
            columns: ["nutrizionista_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_plan_groups_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_plan_items: {
        Row: {
          carbs: number | null
          fats: number | null
          food_name: string
          id: string
          kcal: number | null
          meal_id: string
          name: string | null
          plan_meal_id: string | null
          protein: number | null
          quantity: number | null
          unit: string | null
        }
        Insert: {
          carbs?: number | null
          fats?: number | null
          food_name: string
          id?: string
          kcal?: number | null
          meal_id: string
          name?: string | null
          plan_meal_id?: string | null
          protein?: number | null
          quantity?: number | null
          unit?: string | null
        }
        Update: {
          carbs?: number | null
          fats?: number | null
          food_name?: string
          id?: string
          kcal?: number | null
          meal_id?: string
          name?: string | null
          plan_meal_id?: string | null
          protein?: number | null
          quantity?: number | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_plan_items_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "nutrition_plan_meals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_plan_items_plan_meal_id_fkey"
            columns: ["plan_meal_id"]
            isOneToOne: false
            referencedRelation: "nutrition_plan_meals"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_plan_meals: {
        Row: {
          id: string
          name: string
          plan_day_id: string
          time_suggested: string | null
        }
        Insert: {
          id?: string
          name: string
          plan_day_id: string
          time_suggested?: string | null
        }
        Update: {
          id?: string
          name?: string
          plan_day_id?: string
          time_suggested?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_plan_meals_plan_day_id_fkey"
            columns: ["plan_day_id"]
            isOneToOne: false
            referencedRelation: "nutrition_plan_days"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_plan_versions: {
        Row: {
          behavior_notes: string | null
          calories_target: number | null
          created_at: string
          created_by: string | null
          diff_base_version_id: string | null
          end_date: string | null
          guidelines: string | null
          id: string
          macros: Json | null
          meal_structure: Json | null
          org_id: string | null
          pdf_file_path: string | null
          plan_id: string
          published_at: string | null
          published_by: string | null
          start_date: string | null
          status: string
          substitutions: Json | null
          version_number: number
          weekly_meal_plan: Json | null
        }
        Insert: {
          behavior_notes?: string | null
          calories_target?: number | null
          created_at?: string
          created_by?: string | null
          diff_base_version_id?: string | null
          end_date?: string | null
          guidelines?: string | null
          id?: string
          macros?: Json | null
          meal_structure?: Json | null
          org_id?: string | null
          pdf_file_path?: string | null
          plan_id: string
          published_at?: string | null
          published_by?: string | null
          start_date?: string | null
          status?: string
          substitutions?: Json | null
          version_number: number
          weekly_meal_plan?: Json | null
        }
        Update: {
          behavior_notes?: string | null
          calories_target?: number | null
          created_at?: string
          created_by?: string | null
          diff_base_version_id?: string | null
          end_date?: string | null
          guidelines?: string | null
          id?: string
          macros?: Json | null
          meal_structure?: Json | null
          org_id?: string | null
          pdf_file_path?: string | null
          plan_id?: string
          published_at?: string | null
          published_by?: string | null
          start_date?: string | null
          status?: string
          substitutions?: Json | null
          version_number?: number
          weekly_meal_plan?: Json | null
        }
        Relationships: []
      }
      nutrition_plan_versions_legacy: {
        Row: {
          auto_adjustment_reason: string | null
          auto_generated: boolean | null
          calories_target: number | null
          carb_target: number | null
          created_at: string
          created_by: string
          end_date: string | null
          fat_target: number | null
          id: string
          mode: string
          pdf_file_path: string | null
          plan_group_id: string
          protein_target: number | null
          start_date: string | null
          status: string
          version_number: number
        }
        Insert: {
          auto_adjustment_reason?: string | null
          auto_generated?: boolean | null
          calories_target?: number | null
          carb_target?: number | null
          created_at?: string
          created_by: string
          end_date?: string | null
          fat_target?: number | null
          id?: string
          mode: string
          pdf_file_path?: string | null
          plan_group_id: string
          protein_target?: number | null
          start_date?: string | null
          status: string
          version_number: number
        }
        Update: {
          auto_adjustment_reason?: string | null
          auto_generated?: boolean | null
          calories_target?: number | null
          carb_target?: number | null
          created_at?: string
          created_by?: string
          end_date?: string | null
          fat_target?: number | null
          id?: string
          mode?: string
          pdf_file_path?: string | null
          plan_group_id?: string
          protein_target?: number | null
          start_date?: string | null
          status?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_plan_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "nutrition_plan_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "nutrition_plan_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_plan_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "nutrition_plan_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "nutrition_plan_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_plan_versions_plan_group_id_fkey"
            columns: ["plan_group_id"]
            isOneToOne: false
            referencedRelation: "nutrition_plan_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_progress: {
        Row: {
          athlete_id: string
          body_fat: number | null
          created_at: string
          created_by_profile_id: string | null
          created_by_role: string | null
          hip: number | null
          id: string
          org_id: string
          source: string | null
          waist: number | null
          weight: number | null
        }
        Insert: {
          athlete_id: string
          body_fat?: number | null
          created_at?: string
          created_by_profile_id?: string | null
          created_by_role?: string | null
          hip?: number | null
          id?: string
          org_id: string
          source?: string | null
          waist?: number | null
          weight?: number | null
        }
        Update: {
          athlete_id?: string
          body_fat?: number | null
          created_at?: string
          created_by_profile_id?: string | null
          created_by_role?: string | null
          hip?: number | null
          id?: string
          org_id?: string
          source?: string | null
          waist?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_progress_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "nutrition_progress_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "nutrition_progress_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_progress_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "nutrition_progress_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "nutrition_progress_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_progress_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "nutrition_progress_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "nutrition_progress_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_progress_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "nutrition_progress_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "nutrition_progress_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_progress_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_weekly_analysis: {
        Row: {
          adjustment_applied: boolean | null
          athlete_id: string
          avg_weight: number | null
          created_at: string
          delta_weight: number | null
          id: string
          target_delta: number | null
          version_id: string
          week_end: string
          week_start: string
        }
        Insert: {
          adjustment_applied?: boolean | null
          athlete_id: string
          avg_weight?: number | null
          created_at?: string
          delta_weight?: number | null
          id?: string
          target_delta?: number | null
          version_id: string
          week_end: string
          week_start: string
        }
        Update: {
          adjustment_applied?: boolean | null
          athlete_id?: string
          avg_weight?: number | null
          created_at?: string
          delta_weight?: number | null
          id?: string
          target_delta?: number | null
          version_id?: string
          week_end?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_weekly_analysis_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "nutrition_weekly_analysis_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "nutrition_weekly_analysis_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_weekly_analysis_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "nutrition_weekly_analysis_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "nutrition_weekly_analysis_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_weekly_analysis_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "nutrition_plan_versions_legacy"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          athlete_id: string
          created_at: string | null
          created_by_profile_id: string
          created_by_staff_id: string
          currency: string | null
          deleted_at: string | null
          deleted_by_profile_id: string | null
          id: string
          invoice_url: string | null
          is_reversal: boolean | null
          lessons_purchased: number
          notes: string | null
          org_id: string
          org_id_text: string | null
          payment_date: string | null
          payment_method: string
          payment_type: string | null
          ref_payment_id: string | null
          service_type: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          athlete_id: string
          created_at?: string | null
          created_by_profile_id: string
          created_by_staff_id: string
          currency?: string | null
          deleted_at?: string | null
          deleted_by_profile_id?: string | null
          id?: string
          invoice_url?: string | null
          is_reversal?: boolean | null
          lessons_purchased: number
          notes?: string | null
          org_id: string
          org_id_text?: string | null
          payment_date?: string | null
          payment_method?: string
          payment_type?: string | null
          ref_payment_id?: string | null
          service_type: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          athlete_id?: string
          created_at?: string | null
          created_by_profile_id?: string
          created_by_staff_id?: string
          currency?: string | null
          deleted_at?: string | null
          deleted_by_profile_id?: string | null
          id?: string
          invoice_url?: string | null
          is_reversal?: boolean | null
          lessons_purchased?: number
          notes?: string | null
          org_id?: string
          org_id_text?: string | null
          payment_date?: string | null
          payment_method?: string
          payment_type?: string | null
          ref_payment_id?: string | null
          service_type?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "payments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "payments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "payments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "payments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "payments_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "payments_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "payments_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "payments_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_created_by_staff_id_fkey"
            columns: ["created_by_staff_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "payments_created_by_staff_id_fkey"
            columns: ["created_by_staff_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "payments_created_by_staff_id_fkey"
            columns: ["created_by_staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_created_by_staff_id_fkey"
            columns: ["created_by_staff_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "payments_created_by_staff_id_fkey"
            columns: ["created_by_staff_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "payments_created_by_staff_id_fkey"
            columns: ["created_by_staff_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_deleted_by_profile_id_fkey"
            columns: ["deleted_by_profile_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "payments_deleted_by_profile_id_fkey"
            columns: ["deleted_by_profile_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "payments_deleted_by_profile_id_fkey"
            columns: ["deleted_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_deleted_by_profile_id_fkey"
            columns: ["deleted_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "payments_deleted_by_profile_id_fkey"
            columns: ["deleted_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "payments_deleted_by_profile_id_fkey"
            columns: ["deleted_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_tombstones: {
        Row: {
          created_at: string
          deleted_at: string
          deleted_by_profile_id: string | null
          display_name: string | null
          email_hash: string | null
          org_id: string
          org_id_text: string
          profile_id: string
          reason: string | null
          role_at_time: string
        }
        Insert: {
          created_at?: string
          deleted_at: string
          deleted_by_profile_id?: string | null
          display_name?: string | null
          email_hash?: string | null
          org_id: string
          org_id_text: string
          profile_id: string
          reason?: string | null
          role_at_time: string
        }
        Update: {
          created_at?: string
          deleted_at?: string
          deleted_by_profile_id?: string | null
          display_name?: string | null
          email_hash?: string | null
          org_id?: string
          org_id_text?: string
          profile_id?: string
          reason?: string | null
          role_at_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_tombstones_deleted_by_profile_id_fkey"
            columns: ["deleted_by_profile_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "profile_tombstones_deleted_by_profile_id_fkey"
            columns: ["deleted_by_profile_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "profile_tombstones_deleted_by_profile_id_fkey"
            columns: ["deleted_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_tombstones_deleted_by_profile_id_fkey"
            columns: ["deleted_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "profile_tombstones_deleted_by_profile_id_fkey"
            columns: ["deleted_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "profile_tombstones_deleted_by_profile_id_fkey"
            columns: ["deleted_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_tombstones_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "profile_tombstones_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "profile_tombstones_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_tombstones_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "profile_tombstones_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "profile_tombstones_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          abbonamento_scadenza: string | null
          abitudini_alimentari: string | null
          allergie: string | null
          allergie_alimentari: string[] | null
          altezza_cm: number | null
          anni_esperienza: number | null
          avatar: string | null
          avatar_url: string | null
          bmi: number | null
          cap: string | null
          certificato_medico_data_rilascio: string | null
          certificato_medico_scadenza: string | null
          certificato_medico_tipo: string | null
          circonferenza_fianchi_cm: number | null
          circonferenza_torace_cm: number | null
          circonferenza_vita_cm: number | null
          citta: string | null
          codice_fiscale: string | null
          cognome: string | null
          contatto_emergenza_nome: string | null
          contatto_emergenza_relazione: string | null
          contatto_emergenza_telefono: string | null
          created_at: string | null
          data_iscrizione: string | null
          data_nascita: string | null
          deleted_at: string | null
          deleted_by_profile_id: string | null
          documenti_scadenza: boolean | null
          email: string
          first_login: boolean | null
          first_name: string | null
          gruppo_sanguigno: string | null
          id: string
          indirizzo: string | null
          indirizzo_residenza: string | null
          infortuni_recenti: string | null
          intolleranze: string[] | null
          is_deleted: boolean
          last_name: string | null
          limitazioni: string | null
          livello_esperienza: string | null
          livello_motivazione: number | null
          modalita_lavoro: string[] | null
          nazione: string | null
          nome: string | null
          note: string | null
          note_amministrative: string | null
          obiettivi_fitness: string[] | null
          obiettivo_nutrizionale: string | null
          obiettivo_peso: number | null
          operazioni_passate: string | null
          org_id: string
          org_id_text: string | null
          pacchetti_pt_acquistati: number | null
          pacchetti_pt_usati: number | null
          percentuale_massa_grassa: number | null
          peso_corrente_kg: number | null
          peso_iniziale_kg: number | null
          phone: string | null
          pressione_sanguigna: string | null
          professione: string | null
          provincia: string | null
          role: string
          sesso: string | null
          stato: string | null
          stato_cliente: string | null
          stato_profilo: string | null
          telefono: string | null
          tipo_abbonamento: string | null
          tipo_atleta: string | null
          titolo_professionale: string | null
          ultimo_accesso: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          abbonamento_scadenza?: string | null
          abitudini_alimentari?: string | null
          allergie?: string | null
          allergie_alimentari?: string[] | null
          altezza_cm?: number | null
          anni_esperienza?: number | null
          avatar?: string | null
          avatar_url?: string | null
          bmi?: number | null
          cap?: string | null
          certificato_medico_data_rilascio?: string | null
          certificato_medico_scadenza?: string | null
          certificato_medico_tipo?: string | null
          circonferenza_fianchi_cm?: number | null
          circonferenza_torace_cm?: number | null
          circonferenza_vita_cm?: number | null
          citta?: string | null
          codice_fiscale?: string | null
          cognome?: string | null
          contatto_emergenza_nome?: string | null
          contatto_emergenza_relazione?: string | null
          contatto_emergenza_telefono?: string | null
          created_at?: string | null
          data_iscrizione?: string | null
          data_nascita?: string | null
          deleted_at?: string | null
          deleted_by_profile_id?: string | null
          documenti_scadenza?: boolean | null
          email: string
          first_login?: boolean | null
          first_name?: string | null
          gruppo_sanguigno?: string | null
          id?: string
          indirizzo?: string | null
          indirizzo_residenza?: string | null
          infortuni_recenti?: string | null
          intolleranze?: string[] | null
          is_deleted?: boolean
          last_name?: string | null
          limitazioni?: string | null
          livello_esperienza?: string | null
          livello_motivazione?: number | null
          modalita_lavoro?: string[] | null
          nazione?: string | null
          nome?: string | null
          note?: string | null
          note_amministrative?: string | null
          obiettivi_fitness?: string[] | null
          obiettivo_nutrizionale?: string | null
          obiettivo_peso?: number | null
          operazioni_passate?: string | null
          org_id: string
          org_id_text?: string | null
          pacchetti_pt_acquistati?: number | null
          pacchetti_pt_usati?: number | null
          percentuale_massa_grassa?: number | null
          peso_corrente_kg?: number | null
          peso_iniziale_kg?: number | null
          phone?: string | null
          pressione_sanguigna?: string | null
          professione?: string | null
          provincia?: string | null
          role: string
          sesso?: string | null
          stato?: string | null
          stato_cliente?: string | null
          stato_profilo?: string | null
          telefono?: string | null
          tipo_abbonamento?: string | null
          tipo_atleta?: string | null
          titolo_professionale?: string | null
          ultimo_accesso?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          abbonamento_scadenza?: string | null
          abitudini_alimentari?: string | null
          allergie?: string | null
          allergie_alimentari?: string[] | null
          altezza_cm?: number | null
          anni_esperienza?: number | null
          avatar?: string | null
          avatar_url?: string | null
          bmi?: number | null
          cap?: string | null
          certificato_medico_data_rilascio?: string | null
          certificato_medico_scadenza?: string | null
          certificato_medico_tipo?: string | null
          circonferenza_fianchi_cm?: number | null
          circonferenza_torace_cm?: number | null
          circonferenza_vita_cm?: number | null
          citta?: string | null
          codice_fiscale?: string | null
          cognome?: string | null
          contatto_emergenza_nome?: string | null
          contatto_emergenza_relazione?: string | null
          contatto_emergenza_telefono?: string | null
          created_at?: string | null
          data_iscrizione?: string | null
          data_nascita?: string | null
          deleted_at?: string | null
          deleted_by_profile_id?: string | null
          documenti_scadenza?: boolean | null
          email?: string
          first_login?: boolean | null
          first_name?: string | null
          gruppo_sanguigno?: string | null
          id?: string
          indirizzo?: string | null
          indirizzo_residenza?: string | null
          infortuni_recenti?: string | null
          intolleranze?: string[] | null
          is_deleted?: boolean
          last_name?: string | null
          limitazioni?: string | null
          livello_esperienza?: string | null
          livello_motivazione?: number | null
          modalita_lavoro?: string[] | null
          nazione?: string | null
          nome?: string | null
          note?: string | null
          note_amministrative?: string | null
          obiettivi_fitness?: string[] | null
          obiettivo_nutrizionale?: string | null
          obiettivo_peso?: number | null
          operazioni_passate?: string | null
          org_id?: string
          org_id_text?: string | null
          pacchetti_pt_acquistati?: number | null
          pacchetti_pt_usati?: number | null
          percentuale_massa_grassa?: number | null
          peso_corrente_kg?: number | null
          peso_iniziale_kg?: number | null
          phone?: string | null
          pressione_sanguigna?: string | null
          professione?: string | null
          provincia?: string | null
          role?: string
          sesso?: string | null
          stato?: string | null
          stato_cliente?: string | null
          stato_profilo?: string | null
          telefono?: string | null
          tipo_abbonamento?: string | null
          tipo_atleta?: string | null
          titolo_professionale?: string | null
          ultimo_accesso?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_deleted_by_profile_id_fkey"
            columns: ["deleted_by_profile_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "profiles_deleted_by_profile_id_fkey"
            columns: ["deleted_by_profile_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "profiles_deleted_by_profile_id_fkey"
            columns: ["deleted_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_deleted_by_profile_id_fkey"
            columns: ["deleted_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "profiles_deleted_by_profile_id_fkey"
            columns: ["deleted_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "profiles_deleted_by_profile_id_fkey"
            columns: ["deleted_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles_tags: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          profile_id: string
          tag_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          profile_id: string
          tag_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          profile_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tags_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "profiles_tags_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "profiles_tags_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_tags_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "profiles_tags_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "profiles_tags_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_tags_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "profiles_tags_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "profiles_tags_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_tags_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "profiles_tags_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "profiles_tags_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "cliente_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      progress_logs: {
        Row: {
          addome_basso_cm: number | null
          adiposita_centrale: string | null
          apertura_braccia_cm: number | null
          area_superficie_corporea_m2: number | null
          athlete_id: string
          avambraccio_cm: number | null
          biceps_cm: number | null
          braccio_contratto_cm: number | null
          braccio_corretto_cm: number | null
          braccio_rilassato_cm: number | null
          capacita_dispersione_calore: string | null
          caviglia_cm: number | null
          chest_cm: number | null
          collo_cm: number | null
          coscia_alta_cm: number | null
          coscia_bassa_cm: number | null
          coscia_corretta_cm: number | null
          coscia_media_cm: number | null
          created_at: string | null
          created_by_profile_id: string | null
          date: string
          diametro_bistiloideo_cm: number | null
          diametro_femore_cm: number | null
          diametro_omero_cm: number | null
          dispendio_energetico_totale_kcal: number | null
          ectomorfia: number | null
          endomorfia: number | null
          gamba_corretta_cm: number | null
          ginocchio_cm: number | null
          glutei_cm: number | null
          hips_cm: number | null
          id: string
          imc: number | null
          indice_adiposo_muscolare: number | null
          indice_conicita: number | null
          indice_cormico: number | null
          indice_manouvrier: number | null
          indice_muscolo_osseo: number | null
          indice_vita_fianchi: number | null
          livello_attivita: string | null
          massa_grassa_kg: number | null
          massa_grassa_percentuale: number | null
          massa_magra_kg: number | null
          massa_muscolare_kg: number | null
          massa_muscolare_scheletrica_kg: number | null
          massa_ossea_kg: number | null
          massa_residuale_kg: number | null
          max_bench_kg: number | null
          max_deadlift_kg: number | null
          max_squat_kg: number | null
          mesomorfia: number | null
          metabolismo_basale_kcal: number | null
          mood_text: string | null
          note: string | null
          plica_addominale_mm: number | null
          plica_bicipite_mm: number | null
          plica_coscia_mm: number | null
          plica_cresta_iliaca_mm: number | null
          plica_gamba_mm: number | null
          plica_sopraspinale_mm: number | null
          plica_sottoscapolare_mm: number | null
          plica_tricipite_mm: number | null
          polpaccio_cm: number | null
          polso_cm: number | null
          rischio_cardiometabolico: string | null
          source: string | null
          spalle_cm: number | null
          statura_allungata_cm: number | null
          statura_seduto_cm: number | null
          struttura_muscolo_scheletrica: string | null
          thighs_cm: number | null
          torace_inspirazione_cm: number | null
          updated_at: string | null
          vita_alta_cm: number | null
          waist_cm: number | null
          weight_kg: number | null
        }
        Insert: {
          addome_basso_cm?: number | null
          adiposita_centrale?: string | null
          apertura_braccia_cm?: number | null
          area_superficie_corporea_m2?: number | null
          athlete_id: string
          avambraccio_cm?: number | null
          biceps_cm?: number | null
          braccio_contratto_cm?: number | null
          braccio_corretto_cm?: number | null
          braccio_rilassato_cm?: number | null
          capacita_dispersione_calore?: string | null
          caviglia_cm?: number | null
          chest_cm?: number | null
          collo_cm?: number | null
          coscia_alta_cm?: number | null
          coscia_bassa_cm?: number | null
          coscia_corretta_cm?: number | null
          coscia_media_cm?: number | null
          created_at?: string | null
          created_by_profile_id?: string | null
          date: string
          diametro_bistiloideo_cm?: number | null
          diametro_femore_cm?: number | null
          diametro_omero_cm?: number | null
          dispendio_energetico_totale_kcal?: number | null
          ectomorfia?: number | null
          endomorfia?: number | null
          gamba_corretta_cm?: number | null
          ginocchio_cm?: number | null
          glutei_cm?: number | null
          hips_cm?: number | null
          id?: string
          imc?: number | null
          indice_adiposo_muscolare?: number | null
          indice_conicita?: number | null
          indice_cormico?: number | null
          indice_manouvrier?: number | null
          indice_muscolo_osseo?: number | null
          indice_vita_fianchi?: number | null
          livello_attivita?: string | null
          massa_grassa_kg?: number | null
          massa_grassa_percentuale?: number | null
          massa_magra_kg?: number | null
          massa_muscolare_kg?: number | null
          massa_muscolare_scheletrica_kg?: number | null
          massa_ossea_kg?: number | null
          massa_residuale_kg?: number | null
          max_bench_kg?: number | null
          max_deadlift_kg?: number | null
          max_squat_kg?: number | null
          mesomorfia?: number | null
          metabolismo_basale_kcal?: number | null
          mood_text?: string | null
          note?: string | null
          plica_addominale_mm?: number | null
          plica_bicipite_mm?: number | null
          plica_coscia_mm?: number | null
          plica_cresta_iliaca_mm?: number | null
          plica_gamba_mm?: number | null
          plica_sopraspinale_mm?: number | null
          plica_sottoscapolare_mm?: number | null
          plica_tricipite_mm?: number | null
          polpaccio_cm?: number | null
          polso_cm?: number | null
          rischio_cardiometabolico?: string | null
          source?: string | null
          spalle_cm?: number | null
          statura_allungata_cm?: number | null
          statura_seduto_cm?: number | null
          struttura_muscolo_scheletrica?: string | null
          thighs_cm?: number | null
          torace_inspirazione_cm?: number | null
          updated_at?: string | null
          vita_alta_cm?: number | null
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Update: {
          addome_basso_cm?: number | null
          adiposita_centrale?: string | null
          apertura_braccia_cm?: number | null
          area_superficie_corporea_m2?: number | null
          athlete_id?: string
          avambraccio_cm?: number | null
          biceps_cm?: number | null
          braccio_contratto_cm?: number | null
          braccio_corretto_cm?: number | null
          braccio_rilassato_cm?: number | null
          capacita_dispersione_calore?: string | null
          caviglia_cm?: number | null
          chest_cm?: number | null
          collo_cm?: number | null
          coscia_alta_cm?: number | null
          coscia_bassa_cm?: number | null
          coscia_corretta_cm?: number | null
          coscia_media_cm?: number | null
          created_at?: string | null
          created_by_profile_id?: string | null
          date?: string
          diametro_bistiloideo_cm?: number | null
          diametro_femore_cm?: number | null
          diametro_omero_cm?: number | null
          dispendio_energetico_totale_kcal?: number | null
          ectomorfia?: number | null
          endomorfia?: number | null
          gamba_corretta_cm?: number | null
          ginocchio_cm?: number | null
          glutei_cm?: number | null
          hips_cm?: number | null
          id?: string
          imc?: number | null
          indice_adiposo_muscolare?: number | null
          indice_conicita?: number | null
          indice_cormico?: number | null
          indice_manouvrier?: number | null
          indice_muscolo_osseo?: number | null
          indice_vita_fianchi?: number | null
          livello_attivita?: string | null
          massa_grassa_kg?: number | null
          massa_grassa_percentuale?: number | null
          massa_magra_kg?: number | null
          massa_muscolare_kg?: number | null
          massa_muscolare_scheletrica_kg?: number | null
          massa_ossea_kg?: number | null
          massa_residuale_kg?: number | null
          max_bench_kg?: number | null
          max_deadlift_kg?: number | null
          max_squat_kg?: number | null
          mesomorfia?: number | null
          metabolismo_basale_kcal?: number | null
          mood_text?: string | null
          note?: string | null
          plica_addominale_mm?: number | null
          plica_bicipite_mm?: number | null
          plica_coscia_mm?: number | null
          plica_cresta_iliaca_mm?: number | null
          plica_gamba_mm?: number | null
          plica_sopraspinale_mm?: number | null
          plica_sottoscapolare_mm?: number | null
          plica_tricipite_mm?: number | null
          polpaccio_cm?: number | null
          polso_cm?: number | null
          rischio_cardiometabolico?: string | null
          source?: string | null
          spalle_cm?: number | null
          statura_allungata_cm?: number | null
          statura_seduto_cm?: number | null
          struttura_muscolo_scheletrica?: string | null
          thighs_cm?: number | null
          torace_inspirazione_cm?: number | null
          updated_at?: string | null
          vita_alta_cm?: number | null
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_logs_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "progress_logs_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "progress_logs_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "progress_logs_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_logs_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "progress_logs_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "progress_logs_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
      progress_photos: {
        Row: {
          angle: string
          athlete_id: string
          created_at: string | null
          date: string
          id: string
          image_url: string
          note: string | null
          session_saved_at: string | null
          updated_at: string | null
        }
        Insert: {
          angle: string
          athlete_id: string
          created_at?: string | null
          date: string
          id?: string
          image_url: string
          note?: string | null
          session_saved_at?: string | null
          updated_at?: string | null
        }
        Update: {
          angle?: string
          athlete_id?: string
          created_at?: string | null
          date?: string
          id?: string
          image_url?: string
          note?: string | null
          session_saved_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_photos_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "progress_photos_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "progress_photos_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_photos_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "progress_photos_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "progress_photos_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
      pt_atleti: {
        Row: {
          assigned_at: string | null
          atleta_id: string
          created_at: string | null
          id: string
          pt_id: string
        }
        Insert: {
          assigned_at?: string | null
          atleta_id: string
          created_at?: string | null
          id?: string
          pt_id: string
        }
        Update: {
          assigned_at?: string | null
          atleta_id?: string
          created_at?: string | null
          id?: string
          pt_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pt_atleti_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "pt_atleti_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "pt_atleti_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pt_atleti_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "pt_atleti_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "pt_atleti_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pt_atleti_pt_id_fkey"
            columns: ["pt_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "pt_atleti_pt_id_fkey"
            columns: ["pt_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "pt_atleti_pt_id_fkey"
            columns: ["pt_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pt_atleti_pt_id_fkey"
            columns: ["pt_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "pt_atleti_pt_id_fkey"
            columns: ["pt_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "pt_atleti_pt_id_fkey"
            columns: ["pt_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          permissions: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          permissions?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          permissions?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      staff_atleti: {
        Row: {
          activated_at: string
          atleta_id: string
          created_at: string | null
          deactivated_at: string | null
          id: string
          org_id: string
          staff_id: string
          staff_type: string
          status: string
          updated_at: string
        }
        Insert: {
          activated_at?: string
          atleta_id: string
          created_at?: string | null
          deactivated_at?: string | null
          id?: string
          org_id: string
          staff_id: string
          staff_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          activated_at?: string
          atleta_id?: string
          created_at?: string | null
          deactivated_at?: string | null
          id?: string
          org_id?: string
          staff_id?: string
          staff_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_atleti_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "staff_atleti_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_atleti_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_atleti_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "staff_atleti_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "staff_atleti_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_atleti_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_atleti_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "staff_atleti_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_atleti_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_atleti_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "staff_atleti_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "staff_atleti_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_inviti_esterni: {
        Row: {
          athlete_id: string | null
          cognome: string
          created_at: string
          email: string
          id: string
          nome: string
          org_id: string
          staff_id: string
          staff_type: string
          telefono: string
        }
        Insert: {
          athlete_id?: string | null
          cognome: string
          created_at?: string
          email: string
          id?: string
          nome: string
          org_id: string
          staff_id: string
          staff_type: string
          telefono: string
        }
        Update: {
          athlete_id?: string | null
          cognome?: string
          created_at?: string
          email?: string
          id?: string
          nome?: string
          org_id?: string
          staff_id?: string
          staff_type?: string
          telefono?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_inviti_esterni_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "staff_inviti_esterni_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_inviti_esterni_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_inviti_esterni_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "staff_inviti_esterni_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "staff_inviti_esterni_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_inviti_esterni_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_inviti_esterni_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "staff_inviti_esterni_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_inviti_esterni_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_inviti_esterni_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "staff_inviti_esterni_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "staff_inviti_esterni_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_requests: {
        Row: {
          athlete_id: string
          created_at: string
          id: string
          org_id: string
          reason: string | null
          staff_id: string
          staff_type: string
          status: string
          updated_at: string
        }
        Insert: {
          athlete_id: string
          created_at?: string
          id?: string
          org_id: string
          reason?: string | null
          staff_id: string
          staff_type: string
          status: string
          updated_at?: string
        }
        Update: {
          athlete_id?: string
          created_at?: string
          id?: string
          org_id?: string
          reason?: string | null
          staff_id?: string
          staff_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_requests_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "staff_requests_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_requests_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_requests_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "staff_requests_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "staff_requests_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_requests_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_requests_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "staff_requests_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_requests_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_requests_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "staff_requests_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "staff_requests_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_athletes: {
        Row: {
          athlete_id: string
          created_at: string
          id: string
          org_id: string
          trainer_id: string
        }
        Insert: {
          athlete_id: string
          created_at?: string
          id?: string
          org_id: string
          trainer_id: string
        }
        Update: {
          athlete_id?: string
          created_at?: string
          id?: string
          org_id?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_athletes_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "trainer_athletes_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "trainer_athletes_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_athletes_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "trainer_athletes_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "trainer_athletes_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_athletes_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "trainer_athletes_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "trainer_athletes_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_athletes_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "trainer_athletes_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "trainer_athletes_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_certifications: {
        Row: {
          anno: number | null
          created_at: string | null
          ente: string | null
          file_url: string | null
          id: string
          nome: string
          numero_certificato: string | null
          profile_id: string
          stato: string
        }
        Insert: {
          anno?: number | null
          created_at?: string | null
          ente?: string | null
          file_url?: string | null
          id?: string
          nome: string
          numero_certificato?: string | null
          profile_id: string
          stato?: string
        }
        Update: {
          anno?: number | null
          created_at?: string | null
          ente?: string | null
          file_url?: string | null
          id?: string
          nome?: string
          numero_certificato?: string | null
          profile_id?: string
          stato?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_certifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "trainer_certifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "trainer_certifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_certifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "trainer_certifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "trainer_certifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_courses: {
        Row: {
          anno: number | null
          created_at: string | null
          durata_unita: string | null
          durata_valore: number | null
          id: string
          nome: string
          profile_id: string
        }
        Insert: {
          anno?: number | null
          created_at?: string | null
          durata_unita?: string | null
          durata_valore?: number | null
          id?: string
          nome: string
          profile_id: string
        }
        Update: {
          anno?: number | null
          created_at?: string | null
          durata_unita?: string | null
          durata_valore?: number | null
          id?: string
          nome?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_courses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "trainer_courses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "trainer_courses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_courses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "trainer_courses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "trainer_courses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_education: {
        Row: {
          anno: number | null
          created_at: string | null
          documento_url: string | null
          id: string
          istituto: string | null
          profile_id: string
          tipo: string
          titolo: string
        }
        Insert: {
          anno?: number | null
          created_at?: string | null
          documento_url?: string | null
          id?: string
          istituto?: string | null
          profile_id: string
          tipo: string
          titolo: string
        }
        Update: {
          anno?: number | null
          created_at?: string | null
          documento_url?: string | null
          id?: string
          istituto?: string | null
          profile_id?: string
          tipo?: string
          titolo?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_education_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "trainer_education_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "trainer_education_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_education_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "trainer_education_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "trainer_education_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_experience: {
        Row: {
          atleti_seguiti: number | null
          collaborazioni: string | null
          created_at: string | null
          data_fine: string | null
          data_inizio: string
          id: string
          nome_struttura: string
          profile_id: string
          ruolo: string | null
        }
        Insert: {
          atleti_seguiti?: number | null
          collaborazioni?: string | null
          created_at?: string | null
          data_fine?: string | null
          data_inizio: string
          id?: string
          nome_struttura: string
          profile_id: string
          ruolo?: string | null
        }
        Update: {
          atleti_seguiti?: number | null
          collaborazioni?: string | null
          created_at?: string | null
          data_fine?: string | null
          data_inizio?: string
          id?: string
          nome_struttura?: string
          profile_id?: string
          ruolo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trainer_experience_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "trainer_experience_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "trainer_experience_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_experience_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "trainer_experience_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "trainer_experience_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_profiles: {
        Row: {
          analisi_postura: boolean | null
          app_monitoraggio: string | null
          assicurazione: boolean | null
          assicurazione_url: string | null
          check_settimanali: boolean | null
          clienti_seguiti: number | null
          consenso_immagini_clienti: boolean | null
          created_at: string | null
          descrizione_breve: string | null
          descrizione_estesa: string | null
          educazione_movimento: boolean | null
          filosofia: string | null
          focus_salute: boolean | null
          galleria_urls: string[] | null
          media_aumento_forza: string | null
          media_kg_persi: number | null
          metodi_misurazione: string[] | null
          misurazioni_corporee: string[] | null
          no_diete_estreme: boolean | null
          no_doping: boolean | null
          no_promesse_irrealistiche: boolean | null
          partita_iva: string | null
          pct_successo: number | null
          perche_lavoro: string | null
          periodizzazione: boolean | null
          privacy_garantita: boolean | null
          profile_id: string
          registro_professionale: string | null
          report_progressi: boolean | null
          software_programmazione: string | null
          target_clienti: string[] | null
          termini_accettati: boolean | null
          test_funzionali: boolean | null
          updated_at: string | null
          url_video_presentazione: string | null
          uso_app: boolean | null
          valutazione_iniziale: boolean | null
        }
        Insert: {
          analisi_postura?: boolean | null
          app_monitoraggio?: string | null
          assicurazione?: boolean | null
          assicurazione_url?: string | null
          check_settimanali?: boolean | null
          clienti_seguiti?: number | null
          consenso_immagini_clienti?: boolean | null
          created_at?: string | null
          descrizione_breve?: string | null
          descrizione_estesa?: string | null
          educazione_movimento?: boolean | null
          filosofia?: string | null
          focus_salute?: boolean | null
          galleria_urls?: string[] | null
          media_aumento_forza?: string | null
          media_kg_persi?: number | null
          metodi_misurazione?: string[] | null
          misurazioni_corporee?: string[] | null
          no_diete_estreme?: boolean | null
          no_doping?: boolean | null
          no_promesse_irrealistiche?: boolean | null
          partita_iva?: string | null
          pct_successo?: number | null
          perche_lavoro?: string | null
          periodizzazione?: boolean | null
          privacy_garantita?: boolean | null
          profile_id: string
          registro_professionale?: string | null
          report_progressi?: boolean | null
          software_programmazione?: string | null
          target_clienti?: string[] | null
          termini_accettati?: boolean | null
          test_funzionali?: boolean | null
          updated_at?: string | null
          url_video_presentazione?: string | null
          uso_app?: boolean | null
          valutazione_iniziale?: boolean | null
        }
        Update: {
          analisi_postura?: boolean | null
          app_monitoraggio?: string | null
          assicurazione?: boolean | null
          assicurazione_url?: string | null
          check_settimanali?: boolean | null
          clienti_seguiti?: number | null
          consenso_immagini_clienti?: boolean | null
          created_at?: string | null
          descrizione_breve?: string | null
          descrizione_estesa?: string | null
          educazione_movimento?: boolean | null
          filosofia?: string | null
          focus_salute?: boolean | null
          galleria_urls?: string[] | null
          media_aumento_forza?: string | null
          media_kg_persi?: number | null
          metodi_misurazione?: string[] | null
          misurazioni_corporee?: string[] | null
          no_diete_estreme?: boolean | null
          no_doping?: boolean | null
          no_promesse_irrealistiche?: boolean | null
          partita_iva?: string | null
          pct_successo?: number | null
          perche_lavoro?: string | null
          periodizzazione?: boolean | null
          privacy_garantita?: boolean | null
          profile_id?: string
          registro_professionale?: string | null
          report_progressi?: boolean | null
          software_programmazione?: string | null
          target_clienti?: string[] | null
          termini_accettati?: boolean | null
          test_funzionali?: boolean | null
          updated_at?: string | null
          url_video_presentazione?: string | null
          uso_app?: boolean | null
          valutazione_iniziale?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "trainer_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "trainer_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "trainer_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "trainer_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "trainer_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_specializations: {
        Row: {
          anni_esperienza: number | null
          created_at: string | null
          id: string
          livello: string | null
          nome: string
          profile_id: string
        }
        Insert: {
          anni_esperienza?: number | null
          created_at?: string | null
          id?: string
          livello?: string | null
          nome: string
          profile_id: string
        }
        Update: {
          anni_esperienza?: number | null
          created_at?: string | null
          id?: string
          livello?: string | null
          nome?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_specializations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "trainer_specializations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "trainer_specializations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_specializations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "trainer_specializations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "trainer_specializations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_testimonials: {
        Row: {
          created_at: string | null
          durata_percorso: string | null
          eta: number | null
          feedback: string
          id: string
          nome_cliente: string | null
          obiettivo: string | null
          profile_id: string
          risultato: string | null
          valutazione: number | null
        }
        Insert: {
          created_at?: string | null
          durata_percorso?: string | null
          eta?: number | null
          feedback: string
          id?: string
          nome_cliente?: string | null
          obiettivo?: string | null
          profile_id: string
          risultato?: string | null
          valutazione?: number | null
        }
        Update: {
          created_at?: string | null
          durata_percorso?: string | null
          eta?: number | null
          feedback?: string
          id?: string
          nome_cliente?: string | null
          obiettivo?: string | null
          profile_id?: string
          risultato?: string | null
          valutazione?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trainer_testimonials_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "trainer_testimonials_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "trainer_testimonials_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_testimonials_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "trainer_testimonials_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "trainer_testimonials_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_transformations: {
        Row: {
          consenso: boolean | null
          created_at: string | null
          durata_settimane: number | null
          id: string
          obiettivo: string | null
          prima_dopo_urls: Json | null
          profile_id: string
          risultato: string | null
          verificato: boolean | null
        }
        Insert: {
          consenso?: boolean | null
          created_at?: string | null
          durata_settimane?: number | null
          id?: string
          obiettivo?: string | null
          prima_dopo_urls?: Json | null
          profile_id: string
          risultato?: string | null
          verificato?: boolean | null
        }
        Update: {
          consenso?: boolean | null
          created_at?: string | null
          durata_settimane?: number | null
          id?: string
          obiettivo?: string | null
          prima_dopo_urls?: Json | null
          profile_id?: string
          risultato?: string | null
          verificato?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "trainer_transformations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "trainer_transformations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "trainer_transformations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_transformations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "trainer_transformations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "trainer_transformations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          account_settings: Json | null
          created_at: string | null
          id: string
          notification_settings: Json | null
          privacy_settings: Json | null
          two_factor_backup_codes: string[] | null
          two_factor_enabled: boolean | null
          two_factor_enabled_at: string | null
          two_factor_secret: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_settings?: Json | null
          created_at?: string | null
          id?: string
          notification_settings?: Json | null
          privacy_settings?: Json | null
          two_factor_backup_codes?: string[] | null
          two_factor_enabled?: boolean | null
          two_factor_enabled_at?: string | null
          two_factor_secret?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_settings?: Json | null
          created_at?: string | null
          id?: string
          notification_settings?: Json | null
          privacy_settings?: Json | null
          two_factor_backup_codes?: string[] | null
          two_factor_enabled?: boolean | null
          two_factor_enabled_at?: string | null
          two_factor_secret?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      web_vitals: {
        Row: {
          created_at: string | null
          id: string
          metric_name: string
          metric_rating: string
          metric_value: number
          timestamp: string | null
          url: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metric_name: string
          metric_rating: string
          metric_value: number
          timestamp?: string | null
          url: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metric_name?: string
          metric_rating?: string
          metric_value?: number
          timestamp?: string | null
          url?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      workout_day_exercises: {
        Row: {
          circuit_block_id: string | null
          created_at: string | null
          execution_time_sec: number | null
          exercise_id: string
          id: string
          note: string | null
          order_index: number | null
          order_num: number
          reps: number
          rest_seconds: number
          rest_timer_sec: number | null
          sets: number
          target_reps: number | null
          target_sets: number | null
          target_weight: number | null
          updated_at: string | null
          weight: number | null
          workout_day_id: string
        }
        Insert: {
          circuit_block_id?: string | null
          created_at?: string | null
          execution_time_sec?: number | null
          exercise_id: string
          id?: string
          note?: string | null
          order_index?: number | null
          order_num: number
          reps: number
          rest_seconds: number
          rest_timer_sec?: number | null
          sets: number
          target_reps?: number | null
          target_sets?: number | null
          target_weight?: number | null
          updated_at?: string | null
          weight?: number | null
          workout_day_id: string
        }
        Update: {
          circuit_block_id?: string | null
          created_at?: string | null
          execution_time_sec?: number | null
          exercise_id?: string
          id?: string
          note?: string | null
          order_index?: number | null
          order_num?: number
          reps?: number
          rest_seconds?: number
          rest_timer_sec?: number | null
          sets?: number
          target_reps?: number | null
          target_sets?: number | null
          target_weight?: number | null
          updated_at?: string | null
          weight?: number | null
          workout_day_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_day_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_day_exercises_workout_day_id_fkey"
            columns: ["workout_day_id"]
            isOneToOne: false
            referencedRelation: "workout_days"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_days: {
        Row: {
          created_at: string | null
          day_name: string
          day_number: number
          description: string | null
          id: string
          order_num: number
          title: string | null
          updated_at: string | null
          workout_plan_id: string | null
        }
        Insert: {
          created_at?: string | null
          day_name: string
          day_number: number
          description?: string | null
          id?: string
          order_num: number
          title?: string | null
          updated_at?: string | null
          workout_plan_id?: string | null
        }
        Update: {
          created_at?: string | null
          day_name?: string
          day_number?: number
          description?: string | null
          id?: string
          order_num?: number
          title?: string | null
          updated_at?: string | null
          workout_plan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_days_workout_plan_id_fkey"
            columns: ["workout_plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_logs: {
        Row: {
          athlete_id: string | null
          atleta_id: string
          coached_by_profile_id: string | null
          completato: boolean | null
          completed_at: string | null
          created_at: string | null
          data: string | null
          durata_minuti: number | null
          duration_minutes: number | null
          esercizi_completati: number | null
          esercizi_totali: number | null
          execution_mode: string
          id: string
          is_coached: boolean
          note: string | null
          scheda_id: string | null
          started_at: string | null
          stato: string | null
          updated_at: string | null
          user_id: string | null
          volume_totale: number | null
          workout_id: string | null
        }
        Insert: {
          athlete_id?: string | null
          atleta_id: string
          coached_by_profile_id?: string | null
          completato?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          data?: string | null
          durata_minuti?: number | null
          duration_minutes?: number | null
          esercizi_completati?: number | null
          esercizi_totali?: number | null
          execution_mode?: string
          id?: string
          is_coached?: boolean
          note?: string | null
          scheda_id?: string | null
          started_at?: string | null
          stato?: string | null
          updated_at?: string | null
          user_id?: string | null
          volume_totale?: number | null
          workout_id?: string | null
        }
        Update: {
          athlete_id?: string | null
          atleta_id?: string
          coached_by_profile_id?: string | null
          completato?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          data?: string | null
          durata_minuti?: number | null
          duration_minutes?: number | null
          esercizi_completati?: number | null
          esercizi_totali?: number | null
          execution_mode?: string
          id?: string
          is_coached?: boolean
          note?: string | null
          scheda_id?: string | null
          started_at?: string | null
          stato?: string | null
          updated_at?: string | null
          user_id?: string | null
          volume_totale?: number | null
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_logs_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "workout_logs_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "workout_logs_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_logs_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "workout_logs_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "workout_logs_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_logs_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "workout_logs_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "workout_logs_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_logs_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "workout_logs_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "workout_logs_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_logs_coached_by_profile_id_fkey"
            columns: ["coached_by_profile_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "workout_logs_coached_by_profile_id_fkey"
            columns: ["coached_by_profile_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "workout_logs_coached_by_profile_id_fkey"
            columns: ["coached_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_logs_coached_by_profile_id_fkey"
            columns: ["coached_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "workout_logs_coached_by_profile_id_fkey"
            columns: ["coached_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "workout_logs_coached_by_profile_id_fkey"
            columns: ["coached_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_logs_scheda_id_fkey"
            columns: ["scheda_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_logs_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_plans: {
        Row: {
          athlete_id: string
          created_at: string | null
          created_by_profile_id: string
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          name: string
          objective: string | null
          start_date: string | null
          trainer_id: string | null
          updated_at: string | null
        }
        Insert: {
          athlete_id: string
          created_at?: string | null
          created_by_profile_id: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          objective?: string | null
          start_date?: string | null
          trainer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          athlete_id?: string
          created_at?: string | null
          created_by_profile_id?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          objective?: string | null
          start_date?: string | null
          trainer_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_plans_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "workout_plans_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "workout_plans_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_plans_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "workout_plans_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "workout_plans_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_plans_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "workout_plans_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "workout_plans_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_plans_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "workout_plans_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "workout_plans_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_plans_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "workout_plans_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "workout_plans_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_plans_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "workout_plans_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "workout_plans_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sets: {
        Row: {
          completed_at: string | null
          created_at: string | null
          execution_time_sec: number | null
          id: string
          reps: number | null
          reps_completed: number | null
          rest_timer_sec: number | null
          set_number: number
          weight_kg: number | null
          weight_used: number | null
          workout_day_exercise_id: string
          workout_log_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          execution_time_sec?: number | null
          id?: string
          reps?: number | null
          reps_completed?: number | null
          rest_timer_sec?: number | null
          set_number: number
          weight_kg?: number | null
          weight_used?: number | null
          workout_day_exercise_id: string
          workout_log_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          execution_time_sec?: number | null
          id?: string
          reps?: number | null
          reps_completed?: number | null
          rest_timer_sec?: number | null
          set_number?: number
          weight_kg?: number | null
          weight_used?: number | null
          workout_day_exercise_id?: string
          workout_log_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_sets_workout_day_exercise_id_fkey"
            columns: ["workout_day_exercise_id"]
            isOneToOne: false
            referencedRelation: "workout_day_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_sets_workout_log_id_fkey"
            columns: ["workout_log_id"]
            isOneToOne: false
            referencedRelation: "workout_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          athlete_id: string | null
          created_at: string | null
          created_by_trainer_id: string | null
          descrizione: string | null
          difficulty: string | null
          id: string
          status: string | null
          titolo: string
          updated_at: string | null
        }
        Insert: {
          athlete_id?: string | null
          created_at?: string | null
          created_by_trainer_id?: string | null
          descrizione?: string | null
          difficulty?: string | null
          id?: string
          status?: string | null
          titolo: string
          updated_at?: string | null
        }
        Update: {
          athlete_id?: string | null
          created_at?: string | null
          created_by_trainer_id?: string | null
          descrizione?: string | null
          difficulty?: string | null
          id?: string
          status?: string | null
          titolo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workouts_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "workouts_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "workouts_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workouts_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "workouts_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "workouts_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workouts_created_by_trainer_id_fkey"
            columns: ["created_by_trainer_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "workouts_created_by_trainer_id_fkey"
            columns: ["created_by_trainer_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "workouts_created_by_trainer_id_fkey"
            columns: ["created_by_trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workouts_created_by_trainer_id_fkey"
            columns: ["created_by_trainer_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "workouts_created_by_trainer_id_fkey"
            columns: ["created_by_trainer_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "workouts_created_by_trainer_id_fkey"
            columns: ["created_by_trainer_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      athlete_marketing_metrics: {
        Row: {
          athlete_id: string | null
          last_workout_at: string | null
          workouts_coached_count: number | null
          workouts_solo_count: number | null
          workouts_total_count: number | null
        }
        Relationships: []
      }
      marketing_athletes: {
        Row: {
          athlete_id: string | null
          email: string | null
          first_name: string | null
          last_name: string | null
          last_workout_at: string | null
          stato: string | null
          workouts_coached_30d: number | null
          workouts_coached_7d: number | null
          workouts_solo_30d: number | null
          workouts_solo_7d: number | null
        }
        Relationships: []
      }
      payments_per_staff_view: {
        Row: {
          atleti_serviti: number | null
          mese: string | null
          nome_staff: string | null
          staff_id: string | null
          totale_incassato: number | null
          transazioni_totali: number | null
        }
        Relationships: []
      }
      progress_trend_view: {
        Row: {
          athlete_id: string | null
          bench_medio: number | null
          deadlift_medio: number | null
          mese: string | null
          misurazioni_mese: number | null
          nome_atleta: string | null
          percentuale_incremento_bench: number | null
          percentuale_incremento_deadlift: number | null
          percentuale_incremento_squat: number | null
          percentuale_variazione_peso: number | null
          peso_medio: number | null
          squat_medio: number | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_logs_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      v_current_athlete_trainer: {
        Row: {
          athlete_id: string | null
          org_id: string | null
          trainer_id: string | null
        }
        Insert: {
          athlete_id?: string | null
          org_id?: string | null
          trainer_id?: string | null
        }
        Update: {
          athlete_id?: string | null
          org_id?: string | null
          trainer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "athlete_trainer_assignments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "athlete_trainer_assignments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "athlete_trainer_assignments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_trainer_assignments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "athlete_trainer_assignments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "athlete_trainer_assignments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_trainer_assignments_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "athlete_trainer_assignments_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "athlete_trainer_assignments_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_trainer_assignments_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "athlete_trainer_assignments_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "athlete_trainer_assignments_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
      v_marketing_athletes: {
        Row: {
          athlete_profile_id: string | null
          cognome: string | null
          email: string | null
          first_name: string | null
          kpis_updated_at: string | null
          last_activity_at: string | null
          last_name: string | null
          last_workout_at: string | null
          massages_30d: number | null
          nome: string | null
          nutrition_visits_30d: number | null
          org_id: string | null
          phone: string | null
          stato: string | null
          workouts_coached_30d: number | null
          workouts_coached_7d: number | null
          workouts_coached_90d: number | null
          workouts_solo_30d: number | null
          workouts_solo_7d: number | null
          workouts_solo_90d: number | null
        }
        Relationships: []
      }
      v_nutrition_plan_versions_with_settings: {
        Row: {
          created_at: string | null
          has_adaptive_settings: boolean | null
          has_auto_config: boolean | null
          plan_id: string | null
          status: string | null
          version_id: string | null
          version_number: number | null
        }
        Relationships: []
      }
      v_nutritionist_athletes: {
        Row: {
          active_plan_version: number | null
          assignment_status: string | null
          athlete_email: string | null
          athlete_id: string | null
          athlete_name: string | null
          atleta_id: string | null
          last_checkin_date: string | null
          last_progress_at: string | null
          review_date: string | null
          staff_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_atleti_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "staff_atleti_atleta_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "staff_atleti_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_atleti_atleta_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_atleti_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_atleti_atleta_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_atleti_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "staff_atleti_atleta_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "staff_atleti_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "staff_atleti_atleta_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "staff_atleti_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_atleti_atleta_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_atleti_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "staff_atleti_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_atleti_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_atleti_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "staff_atleti_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "staff_atleti_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
      v_nutritionist_documents: {
        Row: {
          athlete_email: string | null
          athlete_id: string | null
          athlete_name: string | null
          category: string | null
          created_at: string | null
          document_id: string | null
          expires_at: string | null
          file_url: string | null
          notes: string | null
          nutritionist_id: string | null
          org_id: string | null
          org_id_text: string | null
          status: string | null
          updated_at: string | null
          uploaded_by_name: string | null
          uploaded_by_profile_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "documents_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "documents_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "documents_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "documents_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_profile_id_fkey"
            columns: ["uploaded_by_profile_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_profile_id_fkey"
            columns: ["uploaded_by_profile_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_profile_id_fkey"
            columns: ["uploaded_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_profile_id_fkey"
            columns: ["uploaded_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_profile_id_fkey"
            columns: ["uploaded_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_profile_id_fkey"
            columns: ["uploaded_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_atleti_staff_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "staff_atleti_staff_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_atleti_staff_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_atleti_staff_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "staff_atleti_staff_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "staff_atleti_staff_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
      v_nutritionist_progress_athletes: {
        Row: {
          athlete_email: string | null
          athlete_id: string | null
          athlete_name: string | null
          days_since_last_progress: number | null
          last_body_fat: number | null
          last_hip: number | null
          last_progress_at: string | null
          last_waist: number | null
          last_weight: number | null
          nutritionist_id: string | null
          weight_delta_7d: number | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_atleti_atleta_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "staff_atleti_atleta_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_atleti_atleta_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_atleti_atleta_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "staff_atleti_atleta_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "staff_atleti_atleta_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_atleti_staff_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "staff_atleti_staff_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_atleti_staff_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_atleti_staff_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "staff_atleti_staff_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "staff_atleti_staff_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
      v_nutritionist_progress_logs_timeline: {
        Row: {
          athlete_email: string | null
          athlete_name: string | null
          athlete_profile_id: string | null
          athlete_user_id: string | null
          created_at: string | null
          created_by_profile_id: string | null
          date: string | null
          hips_cm: number | null
          massa_grassa_kg: number | null
          massa_grassa_percentuale: number | null
          massa_magra_kg: number | null
          massa_muscolare_kg: number | null
          progress_id: string | null
          source: string | null
          waist_cm: number | null
          weight_kg: number | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_logs_athlete_id_fkey"
            columns: ["athlete_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "progress_logs_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "progress_logs_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "progress_logs_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_logs_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "progress_logs_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "progress_logs_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
      v_nutritionist_progress_timeline: {
        Row: {
          athlete_email: string | null
          athlete_id: string | null
          athlete_name: string | null
          body_fat: number | null
          created_at: string | null
          created_by_profile_id: string | null
          created_by_role: string | null
          hip: number | null
          nutritionist_id: string | null
          org_id: string | null
          progress_id: string | null
          source: string | null
          waist: number | null
          weight: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_progress_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "nutrition_progress_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "nutrition_progress_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_progress_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "nutrition_progress_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "nutrition_progress_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_progress_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "nutrition_progress_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "nutrition_progress_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_progress_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "nutrition_progress_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "nutrition_progress_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_progress_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_atleti_staff_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "staff_atleti_staff_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_atleti_staff_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_atleti_staff_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "staff_atleti_staff_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "staff_atleti_staff_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
      v_nutritionist_weekly_analysis: {
        Row: {
          abs_delta_vs_target: number | null
          adjustment_applied: boolean | null
          athlete_email: string | null
          athlete_id: string | null
          athlete_name: string | null
          avg_weight: number | null
          created_at: string | null
          delta_vs_target: number | null
          delta_weight: number | null
          nutritionist_id: string | null
          target_delta: number | null
          version_id: string | null
          week_end: string | null
          week_start: string | null
          weekly_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_weekly_analysis_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "nutrition_weekly_analysis_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "nutrition_weekly_analysis_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_weekly_analysis_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "nutrition_weekly_analysis_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "nutrition_weekly_analysis_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_weekly_analysis_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "nutrition_plan_versions_legacy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_atleti_staff_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "staff_atleti_staff_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_atleti_staff_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_atleti_staff_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "staff_atleti_staff_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "staff_atleti_staff_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
      v_profiles_marketing_subset: {
        Row: {
          cognome: string | null
          email: string | null
          first_name: string | null
          id: string | null
          last_name: string | null
          nome: string | null
          org_id: string | null
          phone: string | null
          role: string | null
          stato: string | null
        }
        Insert: {
          cognome?: string | null
          email?: string | null
          first_name?: never
          id?: string | null
          last_name?: never
          nome?: string | null
          org_id?: string | null
          phone?: never
          role?: string | null
          stato?: string | null
        }
        Update: {
          cognome?: string | null
          email?: string | null
          first_name?: never
          id?: string | null
          last_name?: never
          nome?: string | null
          org_id?: string | null
          phone?: never
          role?: string | null
          stato?: string | null
        }
        Relationships: []
      }
      workout_stats_mensili: {
        Row: {
          allenamenti_mese: number | null
          atleta_id: string | null
          mese: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_logs_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "marketing_athletes"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "workout_logs_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "payments_per_staff_view"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "workout_logs_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_logs_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "v_marketing_athletes"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "workout_logs_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "v_nutritionist_progress_logs_timeline"
            referencedColumns: ["athlete_profile_id"]
          },
          {
            foreignKeyName: "workout_logs_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_marketing_subset"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accetta_invito_cliente: { Args: { p_invito_id: string }; Returns: Json }
      activate_nutrition_plan_version: {
        Args: { p_version_id: string }
        Returns: Json
      }
      audit_write: {
        Args: {
          p_action: string
          p_actor_profile_id?: string
          p_after?: Json
          p_before?: Json
          p_impersonated_profile_id?: string
          p_org_id?: string
          p_record_id: string
          p_table_name: string
        }
        Returns: string
      }
      bootstrap_athlete_data: {
        Args: { p_athlete_user_id: string }
        Returns: undefined
      }
      calculate_athlete_progress_score: {
        Args: { athlete_uuid: string }
        Returns: Json
      }
      can_nutrizionista_or_massaggiatore_view_invited_athlete: {
        Args: { target_profile_id: string }
        Returns: boolean
      }
      chat_profiles_same_org: {
        Args: { profile_id_a: string; profile_id_b: string }
        Returns: boolean
      }
      chat_receiver_is_assigned_pt: {
        Args: { receiver_id: string; sender_id: string }
        Returns: boolean
      }
      chat_receiver_is_staff_athlete: {
        Args: { receiver_id: string; sender_id: string }
        Returns: boolean
      }
      check_appointment_overlap: {
        Args: {
          p_ends_at: string
          p_exclude_appointment_id?: string
          p_staff_id: string
          p_starts_at: string
        }
        Returns: {
          conflicting_appointments: Json
          has_overlap: boolean
        }[]
      }
      check_certificato_scadenza: {
        Args: { athlete_uuid: string }
        Returns: Json
      }
      check_email_exists: {
        Args: { p_email: string }
        Returns: {
          auth_user_id: string
          exists_in_auth: boolean
          exists_in_profiles: boolean
          profile_id: string
        }[]
      }
      check_pt_athlete_relationship: {
        Args: { receiver_uuid: string; sender_uuid: string }
        Returns: boolean
      }
      check_user_exists: {
        Args: { user_email: string }
        Returns: {
          created_at: string
          email: string
          email_confirmed_at: string
          user_id: string
        }[]
      }
      check_user_exists_for_reset: {
        Args: { user_email: string }
        Returns: {
          created_at: string
          email: string
          email_confirmed_at: string
          last_sign_in_at: string
          user_id: string
        }[]
      }
      cleanup_expired_push_subscriptions: { Args: never; Returns: number }
      column_exists: {
        Args: { column_name: string; table_name: string }
        Returns: boolean
      }
      complete_athlete_registration: {
        Args: {
          athlete_email: string
          athlete_name: string
          athlete_surname: string
          athlete_user_id: string
          invite_code: string
        }
        Returns: Json
      }
      count_slot_bookings:
        | {
            Args: {
              p_ends_at: string
              p_exclude_id?: string
              p_org_id: string
              p_starts_at: string
            }
            Returns: number
          }
        | {
            Args: {
              p_ends_at: string
              p_exclude_appointment_id: string
              p_org_id: string
              p_starts_at: string
            }
            Returns: number
          }
      crea_invito_cliente: {
        Args: { p_cognome: string; p_email: string; p_nome: string }
        Returns: Json
      }
      crea_invito_cliente_esterno: {
        Args: {
          p_cognome: string
          p_email: string
          p_nome: string
          p_telefono: string
        }
        Returns: Json
      }
      create_appointment_simple: {
        Args: {
          p_athlete_id: string
          p_ends_at: string
          p_location?: string
          p_notes?: string
          p_org_id?: string
          p_staff_id: string
          p_starts_at: string
          p_type?: string
        }
        Returns: string
      }
      create_document_reminders: { Args: never; Returns: undefined }
      create_notification: {
        Args: {
          p_action_text?: string
          p_body: string
          p_link?: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      create_payment: {
        Args: {
          p_amount: number
          p_athlete_id: string
          p_created_by_staff_id: string
          p_lessons_purchased: number
          p_method_text: string
          p_notes?: string
        }
        Returns: string
      }
      create_test_user_and_profile: {
        Args: {
          p_cognome?: string
          p_email: string
          p_first_name?: string
          p_last_name?: string
          p_nome?: string
          p_org_id?: string
          p_role?: string
        }
        Returns: string
      }
      current_org_id: { Args: never; Returns: string }
      current_profile: {
        Args: never
        Returns: {
          abbonamento_scadenza: string | null
          abitudini_alimentari: string | null
          allergie: string | null
          allergie_alimentari: string[] | null
          altezza_cm: number | null
          anni_esperienza: number | null
          avatar: string | null
          avatar_url: string | null
          bmi: number | null
          cap: string | null
          certificato_medico_data_rilascio: string | null
          certificato_medico_scadenza: string | null
          certificato_medico_tipo: string | null
          circonferenza_fianchi_cm: number | null
          circonferenza_torace_cm: number | null
          circonferenza_vita_cm: number | null
          citta: string | null
          codice_fiscale: string | null
          cognome: string | null
          contatto_emergenza_nome: string | null
          contatto_emergenza_relazione: string | null
          contatto_emergenza_telefono: string | null
          created_at: string | null
          data_iscrizione: string | null
          data_nascita: string | null
          deleted_at: string | null
          deleted_by_profile_id: string | null
          documenti_scadenza: boolean | null
          email: string
          first_login: boolean | null
          first_name: string | null
          gruppo_sanguigno: string | null
          id: string
          indirizzo: string | null
          indirizzo_residenza: string | null
          infortuni_recenti: string | null
          intolleranze: string[] | null
          is_deleted: boolean
          last_name: string | null
          limitazioni: string | null
          livello_esperienza: string | null
          livello_motivazione: number | null
          modalita_lavoro: string[] | null
          nazione: string | null
          nome: string | null
          note: string | null
          note_amministrative: string | null
          obiettivi_fitness: string[] | null
          obiettivo_nutrizionale: string | null
          obiettivo_peso: number | null
          operazioni_passate: string | null
          org_id: string
          org_id_text: string | null
          pacchetti_pt_acquistati: number | null
          pacchetti_pt_usati: number | null
          percentuale_massa_grassa: number | null
          peso_corrente_kg: number | null
          peso_iniziale_kg: number | null
          phone: string | null
          pressione_sanguigna: string | null
          professione: string | null
          provincia: string | null
          role: string
          sesso: string | null
          stato: string | null
          stato_cliente: string | null
          stato_profilo: string | null
          telefono: string | null
          tipo_abbonamento: string | null
          tipo_atleta: string | null
          titolo_professionale: string | null
          ultimo_accesso: string | null
          updated_at: string | null
          user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      current_profile_ctx: {
        Args: never
        Returns: {
          org_id: string
          profile_id: string
          role: string
        }[]
      }
      current_profile_id: { Args: never; Returns: string }
      current_role: { Args: never; Returns: string }
      debug_get_current_staff_profile_id: {
        Args: never
        Returns: {
          current_user_id: string
          function_result: string
          is_staff: boolean
          profile_exists: boolean
          profile_id: string
          profile_role: string
        }[]
      }
      debug_trainer_clienti_visibility: {
        Args: never
        Returns: {
          trainer_profile_id: string
          visible_count: number
        }[]
      }
      decrement_lessons_used: {
        Args: { p_athlete_id: string }
        Returns: boolean
      }
      delete_athlete_profile_safe: {
        Args: { p_profile_id: string }
        Returns: number
      }
      delete_profile_bypass_rls: {
        Args: { profile_id_to_delete: string }
        Returns: Json
      }
      delete_profile_bypass_rls_and_triggers: {
        Args: { profile_id_to_delete: string }
        Returns: Json
      }
      delete_profile_simple: {
        Args: { profile_id_to_delete: string }
        Returns: Json
      }
      disable_triggers_for_deletion: { Args: never; Returns: Json }
      disdici_collegamento_staff_atleta: {
        Args: { p_staff_type: string }
        Returns: Json
      }
      enable_triggers_after_deletion: { Args: never; Returns: Json }
      find_trainer_by_identifier: {
        Args: { p_identifier: string }
        Returns: {
          found: boolean
          trainer_cognome: string
          trainer_email: string
          trainer_id: string
          trainer_nome: string
        }[]
      }
      fk_exists: {
        Args: { p_constraint_name: string; p_table_name: string }
        Returns: boolean
      }
      generate_invite_code: { Args: never; Returns: string }
      get_abbonamenti_with_stats: {
        Args: { p_page?: number; p_page_size?: number }
        Returns: {
          amount: number
          athlete_id: string
          athlete_name: string
          created_at: string
          id: string
          invoice_url: string
          lessons_purchased: number
          lessons_remaining: number
          lessons_used: number
          payment_date: string
          status: string
          total_count: number
        }[]
      }
      get_actor_profile_id_from_jwt: { Args: never; Returns: string }
      get_allenamenti_mese: { Args: { p_atleta_id: string }; Returns: number }
      get_analytics_distribution_data: {
        Args: never
        Returns: {
          count: number
          percentage: number
          type: string
        }[]
      }
      get_analytics_performance_data: {
        Args: { p_limit?: number }
        Returns: {
          athlete_id: string
          athlete_name: string
          avg_duration: number
          completion_rate: number
          total_workouts: number
        }[]
      }
      get_analytics_trend_data: {
        Args: { p_days?: number }
        Returns: {
          allenamenti: number
          day: string
          documenti: number
          ore_totali: number
        }[]
      }
      get_athlete_insights: { Args: { athlete_uuid: string }; Returns: Json }
      get_athlete_marketing_metrics: {
        Args: never
        Returns: {
          athlete_id: string
          last_workout_at: string
          workouts_coached_count: number
          workouts_solo_count: number
          workouts_total_count: number
        }[]
      }
      get_athlete_profile_complete: {
        Args: { athlete_uuid: string }
        Returns: Json
      }
      get_clienti_stats: { Args: never; Returns: Json }
      get_conversation_participants: {
        Args: { user_uuid: string }
        Returns: {
          avatar: string
          last_message_at: string
          other_user_id: string
          other_user_name: string
          other_user_role: string
          unread_count: number
        }[]
      }
      get_current_athlete_profile_id: { Args: never; Returns: string }
      get_current_org_id: { Args: never; Returns: string }
      get_current_staff_profile_id: { Args: never; Returns: string }
      get_current_trainer_profile_id: { Args: never; Returns: string }
      get_current_user_profile_id: { Args: never; Returns: string }
      get_current_user_role: { Args: never; Returns: string }
      get_impersonated_profile_id_from_jwt: { Args: never; Returns: string }
      get_inviti_cliente_atleta_con_staff: {
        Args: never
        Returns: {
          atleta_ha_altro_attivo: boolean
          atleta_id: string
          created_at: string
          expires_at: string
          id: string
          responded_at: string
          staff_avatar_url: string
          staff_cognome: string
          staff_id: string
          staff_nome: string
          staff_role: string
          stato: string
        }[]
      }
      get_inviti_cliente_pendenti_staff: {
        Args: never
        Returns: {
          atleta_id: string
          cognome: string
          created_at: string
          email: string
          invito_id: string
          nome: string
        }[]
      }
      get_monthly_revenue: {
        Args: { p_month?: number; p_year?: number }
        Returns: {
          total_lessons_sold: number
          total_payments: number
          total_revenue: number
        }[]
      }
      get_my_org_id: { Args: never; Returns: string }
      get_my_trainer_profile: {
        Args: never
        Returns: {
          pt_avatar_url: string
          pt_cognome: string
          pt_email: string
          pt_id: string
          pt_nome: string
          pt_telefono: string
        }[]
      }
      get_open_slot_booking_count: {
        Args: { p_ends_at: string; p_org_id: string; p_starts_at: string }
        Returns: number
      }
      get_or_create_user_settings: {
        Args: { p_user_id: string }
        Returns: {
          account_settings: Json | null
          created_at: string | null
          id: string
          notification_settings: Json | null
          privacy_settings: Json | null
          two_factor_backup_codes: string[] | null
          two_factor_enabled: boolean | null
          two_factor_enabled_at: string | null
          two_factor_secret: string | null
          updated_at: string | null
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "user_settings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_org_id_for_current_user: { Args: never; Returns: string }
      get_profile_full_name: { Args: { p_profile_id: string }; Returns: string }
      get_profile_id: { Args: never; Returns: string }
      get_profile_id_from_user_id: {
        Args: { user_uuid: string }
        Returns: string
      }
      get_progress_stats: { Args: { athlete_uuid: string }; Returns: Json }
      get_scheda_attiva: { Args: { p_atleta_id: string }; Returns: string }
      get_trainer_id_by_identifier: {
        Args: { p_identifier: string }
        Returns: string
      }
      get_trainer_profile_full: {
        Args: { p_profile_id: string }
        Returns: Json
      }
      get_unread_notifications_count: { Args: never; Returns: number }
      get_user_org_id: { Args: never; Returns: string }
      get_user_role: { Args: never; Returns: string }
      get_visible_athletes: {
        Args: never
        Returns: {
          email: string
          first_name: string
          id: string
          last_name: string
          org_id: string
        }[]
      }
      get_web_vitals_stats: {
        Args: { days_back?: number; metric_name_filter?: string }
        Returns: {
          avg_value: number
          good_count: number
          max_value: number
          metric_name: string
          min_value: number
          needs_improvement_count: number
          poor_count: number
          total_count: number
        }[]
      }
      insert_workout_day_exercises: {
        Args: { p_day_id: string; p_exercises: Json }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_athlete: { Args: never; Returns: boolean }
      is_athlete_assigned_to_current_trainer: {
        Args: { athlete_profile_id: string }
        Returns: boolean
      }
      is_athlete_assigned_to_trainer: {
        Args: { athlete_profile_id: string }
        Returns: boolean
      }
      is_current_user_admin: { Args: never; Returns: boolean }
      is_current_user_massaggiatore: { Args: never; Returns: boolean }
      is_current_user_nutrizionista: { Args: never; Returns: boolean }
      is_current_user_staff: { Args: never; Returns: boolean }
      is_marketing: { Args: never; Returns: boolean }
      is_massaggiatore_not_trainer: { Args: never; Returns: boolean }
      is_nutrizionista_not_trainer: { Args: never; Returns: boolean }
      is_safe_storage_path: { Args: { path_text: string }; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      is_staff_appointments: { Args: never; Returns: boolean }
      is_valid_codice_fiscale: { Args: { cf: string }; Returns: boolean }
      is_valid_email: { Args: { email_text: string }; Returns: boolean }
      is_valid_gruppo_sanguigno: { Args: { gs: string }; Returns: boolean }
      is_valid_phone: { Args: { phone_text: string }; Returns: boolean }
      is_valid_url: { Args: { url_text: string }; Returns: boolean }
      log_audit_event: {
        Args: {
          p_action: string
          p_new_data?: Json
          p_old_data?: Json
          p_record_id: string
          p_table_name: string
        }
        Returns: undefined
      }
      mark_all_notifications_as_read: { Args: never; Returns: number }
      mark_notification_as_read: {
        Args: { p_notification_id: string }
        Returns: boolean
      }
      marketing_convert_lead_to_athlete__deprecated: {
        Args: { p_lead_id: string; p_trial_days?: number }
        Returns: Json
      }
      marketing_link_lead_to_profile: {
        Args: { p_lead_id: string; p_profile_id: string }
        Returns: Json
      }
      marketing_list_athletes:
        | {
            Args: { p_limit?: number; p_offset?: number; p_search?: string }
            Returns: Json[]
          }
        | {
            Args: {
              p_limit?: number
              p_offset?: number
              p_search?: string
              p_stato?: string
            }
            Returns: {
              athlete_profile_id: string
              email: string
              first_name: string
              last_activity_at: string
              last_name: string
              last_workout_at: string
              massages_30d: number
              nutrition_visits_30d: number
              org_id: string
              phone: string
              stato: string
              updated_at: string
              workouts_coached_30d: number
              workouts_coached_7d: number
              workouts_coached_90d: number
              workouts_solo_30d: number
              workouts_solo_7d: number
              workouts_solo_90d: number
            }[]
          }
      migrate_progress_logs_to_fitness_data: {
        Args: never
        Returns: {
          note_fitness: string
          result_athlete_id: string
          zone_problematiche: string[]
        }[]
      }
      notify_expiring_documents: { Args: never; Returns: number }
      notify_low_lesson_balance: { Args: never; Returns: number }
      notify_missing_progress: { Args: never; Returns: number }
      notify_no_active_workouts: { Args: never; Returns: number }
      nutrition_analyze_week: { Args: { p_version_id: string }; Returns: Json }
      nutrition_confirm_adjustment: {
        Args: { p_version_id: string }
        Returns: Json
      }
      nutrition_generate_adjusted_version: {
        Args: { p_version_id: string }
        Returns: Json
      }
      refresh_athlete_marketing_kpis:
        | { Args: never; Returns: undefined }
        | {
            Args: { p_athlete_profile_id?: string; p_org_id?: string }
            Returns: undefined
          }
        | {
            Args: { p_athlete_profile_id?: string; p_org_id?: string }
            Returns: undefined
          }
      resolve_org_text_to_uuid: { Args: { t: string }; Returns: string }
      reverse_payment: {
        Args: {
          p_created_by_staff_id: string
          p_notes?: string
          p_payment_id: string
        }
        Returns: string
      }
      rifiuta_invito_cliente: { Args: { p_invito_id: string }; Returns: Json }
      run_daily_notifications: {
        Args: never
        Returns: {
          count: number
          notification_type: string
        }[]
      }
      run_marketing_kpi_refresh: { Args: never; Returns: undefined }
      safe_text_to_uuid: { Args: { t: string }; Returns: string }
      search_athletes_for_marketing: {
        Args: { q?: string }
        Returns: {
          athlete_id: string
          email: string
          first_name: string
          last_name: string
        }[]
      }
      slot_has_open_booking_for_rls:
        | {
            Args: { p_ends_at: string; p_org_id: string; p_starts_at: string }
            Returns: boolean
          }
        | {
            Args: { p_ends_at: string; p_org_id: string; p_starts_at: string }
            Returns: boolean
          }
      slot_is_open_booking:
        | {
            Args: { p_ends_at: string; p_org_id: string; p_starts_at: string }
            Returns: boolean
          }
        | {
            Args: { p_ends_at: string; p_org_id: string; p_starts_at: string }
            Returns: boolean
          }
      soft_delete_payments_for_profile: {
        Args: { p_actor_profile_id?: string; p_profile_id: string }
        Returns: number
      }
      soft_delete_profile: {
        Args: {
          p_actor_profile_id: string
          p_profile_id: string
          p_reason?: string
        }
        Returns: Json
      }
      staff_requests_apply_transition: {
        Args: { p_new_status: string; p_request_id: string }
        Returns: Json
      }
      start_impersonation: {
        Args: {
          p_actor_profile_id: string
          p_reason?: string
          p_target_profile_id: string
        }
        Returns: Json
      }
      stop_impersonation:
        | { Args: { p_actor_profile_id: string }; Returns: Json }
        | {
            Args: {
              p_actor_profile_id: string
              p_impersonated_profile_id?: string
            }
            Returns: Json
          }
      sync_all_appointment_names: {
        Args: never
        Returns: {
          appointments_updated: number
          athletes_synced: number
          trainers_synced: number
        }[]
      }
      sync_profile_names: { Args: never; Returns: undefined }
      update_document_statuses: { Args: never; Returns: undefined }
      update_expired_invites: { Args: never; Returns: number }
      validate_user_import_data: {
        Args: {
          p_cognome?: string
          p_email: string
          p_nome?: string
          p_phone?: string
          p_role?: string
          p_stato?: string
        }
        Returns: {
          cognome: string
          email: string
          error_message: string
          is_valid: boolean
          nome: string
          phone: string
          role: string
          stato: string
        }[]
      }
      workout_plans_staff_assigned_condition: {
        Args: { plan_athlete_id: string }
        Returns: boolean
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
