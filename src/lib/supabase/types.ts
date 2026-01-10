export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.5'
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          athlete_id: string
          athlete_name: string | null
          cancelled_at: string | null
          created_at: string | null
          ends_at: string
          id: string
          location: string | null
          notes: string | null
          org_id: string | null
          recurrence_rule: string | null
          staff_id: string
          starts_at: string
          status: string | null
          trainer_id: string | null
          trainer_name: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          athlete_id: string
          athlete_name?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          ends_at: string
          id?: string
          location?: string | null
          notes?: string | null
          org_id?: string | null
          recurrence_rule?: string | null
          staff_id: string
          starts_at: string
          status?: string | null
          trainer_id?: string | null
          trainer_name?: string | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          athlete_id?: string
          athlete_name?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          ends_at?: string
          id?: string
          location?: string | null
          notes?: string | null
          org_id?: string | null
          recurrence_rule?: string | null
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
            foreignKeyName: 'appointments_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: false
            referencedRelation: 'payments_per_staff_view'
            referencedColumns: ['staff_id']
          },
          {
            foreignKeyName: 'appointments_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'appointments_staff_id_fkey'
            columns: ['staff_id']
            isOneToOne: false
            referencedRelation: 'payments_per_staff_view'
            referencedColumns: ['staff_id']
          },
          {
            foreignKeyName: 'appointments_staff_id_fkey'
            columns: ['staff_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'appointments_trainer_id_fkey'
            columns: ['trainer_id']
            isOneToOne: false
            referencedRelation: 'payments_per_staff_view'
            referencedColumns: ['staff_id']
          },
          {
            foreignKeyName: 'appointments_trainer_id_fkey'
            columns: ['trainer_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
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
            foreignKeyName: 'athlete_administrative_data_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: true
            referencedRelation: 'payments_per_staff_view'
            referencedColumns: ['staff_id']
          },
          {
            foreignKeyName: 'athlete_administrative_data_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
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
            foreignKeyName: 'athlete_ai_data_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: false
            referencedRelation: 'payments_per_staff_view'
            referencedColumns: ['staff_id']
          },
          {
            foreignKeyName: 'athlete_ai_data_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
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
            foreignKeyName: 'athlete_fitness_data_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: true
            referencedRelation: 'payments_per_staff_view'
            referencedColumns: ['staff_id']
          },
          {
            foreignKeyName: 'athlete_fitness_data_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
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
            foreignKeyName: 'athlete_massage_data_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: true
            referencedRelation: 'payments_per_staff_view'
            referencedColumns: ['staff_id']
          },
          {
            foreignKeyName: 'athlete_massage_data_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
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
            foreignKeyName: 'athlete_medical_data_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: true
            referencedRelation: 'payments_per_staff_view'
            referencedColumns: ['staff_id']
          },
          {
            foreignKeyName: 'athlete_medical_data_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
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
            foreignKeyName: 'athlete_motivational_data_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: true
            referencedRelation: 'payments_per_staff_view'
            referencedColumns: ['staff_id']
          },
          {
            foreignKeyName: 'athlete_motivational_data_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
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
            foreignKeyName: 'athlete_nutrition_data_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: true
            referencedRelation: 'payments_per_staff_view'
            referencedColumns: ['staff_id']
          },
          {
            foreignKeyName: 'athlete_nutrition_data_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
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
            foreignKeyName: 'athlete_smart_tracking_data_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: false
            referencedRelation: 'payments_per_staff_view'
            referencedColumns: ['staff_id']
          },
          {
            foreignKeyName: 'athlete_smart_tracking_data_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
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
            foreignKeyName: 'chat_messages_receiver_id_fkey'
            columns: ['receiver_id']
            isOneToOne: false
            referencedRelation: 'payments_per_staff_view'
            referencedColumns: ['staff_id']
          },
          {
            foreignKeyName: 'chat_messages_receiver_id_fkey'
            columns: ['receiver_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'chat_messages_sender_id_fkey'
            columns: ['sender_id']
            isOneToOne: false
            referencedRelation: 'payments_per_staff_view'
            referencedColumns: ['staff_id']
          },
          {
            foreignKeyName: 'chat_messages_sender_id_fkey'
            columns: ['sender_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
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
          recipient_type: string
          sent_at: string | null
          status: string
          updated_at: string | null
          user_id: string
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
          recipient_type: string
          sent_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
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
          recipient_type?: string
          sent_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'communication_recipients_communication_id_fkey'
            columns: ['communication_id']
            isOneToOne: false
            referencedRelation: 'communications'
            referencedColumns: ['id']
          },
        ]
      }
      communications: {
        Row: {
          created_at: string | null
          created_by: string
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
          created_by: string
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
          created_by?: string
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
        Relationships: []
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
          org_id: string | null
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
          org_id?: string | null
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
          org_id?: string | null
          status?: string | null
          updated_at?: string | null
          uploaded_by_name?: string | null
          uploaded_by_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'documents_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: false
            referencedRelation: 'payments_per_staff_view'
            referencedColumns: ['staff_id']
          },
          {
            foreignKeyName: 'documents_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'documents_uploaded_by_profile_id_fkey'
            columns: ['uploaded_by_profile_id']
            isOneToOne: false
            referencedRelation: 'payments_per_staff_view'
            referencedColumns: ['staff_id']
          },
          {
            foreignKeyName: 'documents_uploaded_by_profile_id_fkey'
            columns: ['uploaded_by_profile_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      exercises: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty: string
          duration_seconds: number | null
          equipment: string | null
          id: string
          image_url: string | null
          muscle_group: string
          name: string
          org_id: string | null
          thumb_url: string | null
          thumbnail_url: string | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty: string
          duration_seconds?: number | null
          equipment?: string | null
          id?: string
          image_url?: string | null
          muscle_group: string
          name: string
          org_id?: string | null
          thumb_url?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string
          duration_seconds?: number | null
          equipment?: string | null
          id?: string
          image_url?: string | null
          muscle_group?: string
          name?: string
          org_id?: string | null
          thumb_url?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
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
            foreignKeyName: 'inviti_atleti_invited_by_fkey'
            columns: ['invited_by']
            isOneToOne: false
            referencedRelation: 'payments_per_staff_view'
            referencedColumns: ['staff_id']
          },
          {
            foreignKeyName: 'inviti_atleti_invited_by_fkey'
            columns: ['invited_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
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
            foreignKeyName: 'lesson_counters_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: true
            referencedRelation: 'payments_per_staff_view'
            referencedColumns: ['staff_id']
          },
          {
            foreignKeyName: 'lesson_counters_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      notifications: {
        Row: {
          action_text: string | null
          appointment_id: string | null
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
            foreignKeyName: 'notifications_appointment_id_fkey'
            columns: ['appointment_id']
            isOneToOne: false
            referencedRelation: 'appointments'
            referencedColumns: ['id']
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          athlete_id: string
          created_at: string | null
          created_by_staff_id: string
          currency: string | null
          id: string
          invoice_url: string | null
          is_reversal: boolean | null
          lessons_purchased: number
          notes: string | null
          org_id: string | null
          payment_date: string | null
          payment_method: string
          ref_payment_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          athlete_id: string
          created_at?: string | null
          created_by_staff_id: string
          currency?: string | null
          id?: string
          invoice_url?: string | null
          is_reversal?: boolean | null
          lessons_purchased: number
          notes?: string | null
          org_id?: string | null
          payment_date?: string | null
          payment_method?: string
          ref_payment_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          athlete_id?: string
          created_at?: string | null
          created_by_staff_id?: string
          currency?: string | null
          id?: string
          invoice_url?: string | null
          is_reversal?: boolean | null
          lessons_purchased?: number
          notes?: string | null
          org_id?: string | null
          payment_date?: string | null
          payment_method?: string
          ref_payment_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'payments_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: false
            referencedRelation: 'payments_per_staff_view'
            referencedColumns: ['staff_id']
          },
          {
            foreignKeyName: 'payments_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'payments_created_by_staff_id_fkey'
            columns: ['created_by_staff_id']
            isOneToOne: false
            referencedRelation: 'payments_per_staff_view'
            referencedColumns: ['staff_id']
          },
          {
            foreignKeyName: 'payments_created_by_staff_id_fkey'
            columns: ['created_by_staff_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
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
          documenti_scadenza: boolean | null
          email: string
          first_name: string | null
          gruppo_sanguigno: string | null
          id: string
          indirizzo: string | null
          indirizzo_residenza: string | null
          infortuni_recenti: string | null
          intolleranze: string[] | null
          last_name: string | null
          limitazioni: string | null
          livello_esperienza: string | null
          livello_motivazione: number | null
          nazione: string | null
          nome: string | null
          note: string | null
          note_amministrative: string | null
          obiettivi_fitness: string[] | null
          obiettivo_nutrizionale: string | null
          obiettivo_peso: number | null
          operazioni_passate: string | null
          org_id: string | null
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
          telefono: string | null
          tipo_abbonamento: string | null
          tipo_atleta: string | null
          ultimo_accesso: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          abbonamento_scadenza?: string | null
          abitudini_alimentari?: string | null
          allergie?: string | null
          allergie_alimentari?: string[] | null
          altezza_cm?: number | null
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
          documenti_scadenza?: boolean | null
          email: string
          first_name?: string | null
          gruppo_sanguigno?: string | null
          id?: string
          indirizzo?: string | null
          indirizzo_residenza?: string | null
          infortuni_recenti?: string | null
          intolleranze?: string[] | null
          last_name?: string | null
          limitazioni?: string | null
          livello_esperienza?: string | null
          livello_motivazione?: number | null
          nazione?: string | null
          nome?: string | null
          note?: string | null
          note_amministrative?: string | null
          obiettivi_fitness?: string[] | null
          obiettivo_nutrizionale?: string | null
          obiettivo_peso?: number | null
          operazioni_passate?: string | null
          org_id?: string | null
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
          telefono?: string | null
          tipo_abbonamento?: string | null
          tipo_atleta?: string | null
          ultimo_accesso?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          abbonamento_scadenza?: string | null
          abitudini_alimentari?: string | null
          allergie?: string | null
          allergie_alimentari?: string[] | null
          altezza_cm?: number | null
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
          documenti_scadenza?: boolean | null
          email?: string
          first_name?: string | null
          gruppo_sanguigno?: string | null
          id?: string
          indirizzo?: string | null
          indirizzo_residenza?: string | null
          infortuni_recenti?: string | null
          intolleranze?: string[] | null
          last_name?: string | null
          limitazioni?: string | null
          livello_esperienza?: string | null
          livello_motivazione?: number | null
          nazione?: string | null
          nome?: string | null
          note?: string | null
          note_amministrative?: string | null
          obiettivi_fitness?: string[] | null
          obiettivo_nutrizionale?: string | null
          obiettivo_peso?: number | null
          operazioni_passate?: string | null
          org_id?: string | null
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
          telefono?: string | null
          tipo_abbonamento?: string | null
          tipo_atleta?: string | null
          ultimo_accesso?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_role_fkey'
            columns: ['role']
            isOneToOne: false
            referencedRelation: 'roles'
            referencedColumns: ['name']
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
            foreignKeyName: 'profiles_tags_assigned_by_fkey'
            columns: ['assigned_by']
            isOneToOne: false
            referencedRelation: 'payments_per_staff_view'
            referencedColumns: ['staff_id']
          },
          {
            foreignKeyName: 'profiles_tags_assigned_by_fkey'
            columns: ['assigned_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'profiles_tags_profile_id_fkey'
            columns: ['profile_id']
            isOneToOne: false
            referencedRelation: 'payments_per_staff_view'
            referencedColumns: ['staff_id']
          },
          {
            foreignKeyName: 'profiles_tags_profile_id_fkey'
            columns: ['profile_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'profiles_tags_tag_id_fkey'
            columns: ['tag_id']
            isOneToOne: false
            referencedRelation: 'cliente_tags'
            referencedColumns: ['id']
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
            foreignKeyName: 'progress_logs_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: false
            referencedRelation: 'payments_per_staff_view'
            referencedColumns: ['staff_id']
          },
          {
            foreignKeyName: 'progress_logs_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
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
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'progress_photos_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: false
            referencedRelation: 'payments_per_staff_view'
            referencedColumns: ['staff_id']
          },
          {
            foreignKeyName: 'progress_photos_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
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
            foreignKeyName: 'pt_atleti_atleta_id_fkey'
            columns: ['atleta_id']
            isOneToOne: false
            referencedRelation: 'payments_per_staff_view'
            referencedColumns: ['staff_id']
          },
          {
            foreignKeyName: 'pt_atleti_atleta_id_fkey'
            columns: ['atleta_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'pt_atleti_pt_id_fkey'
            columns: ['pt_id']
            isOneToOne: false
            referencedRelation: 'payments_per_staff_view'
            referencedColumns: ['staff_id']
          },
          {
            foreignKeyName: 'pt_atleti_pt_id_fkey'
            columns: ['pt_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
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
        }
        Relationships: []
      }
      workout_day_exercises: {
        Row: {
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
            foreignKeyName: 'workout_day_exercises_exercise_id_fkey'
            columns: ['exercise_id']
            isOneToOne: false
            referencedRelation: 'exercises'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'workout_day_exercises_workout_day_id_fkey'
            columns: ['workout_day_id']
            isOneToOne: false
            referencedRelation: 'workout_days'
            referencedColumns: ['id']
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
            foreignKeyName: 'workout_days_workout_plan_id_fkey'
            columns: ['workout_plan_id']
            isOneToOne: false
            referencedRelation: 'workout_plans'
            referencedColumns: ['id']
          },
        ]
      }
      workout_logs: {
        Row: {
          athlete_id: string | null
          atleta_id: string
          completato: boolean | null
          created_at: string | null
          data: string | null
          durata_minuti: number | null
          esercizi_completati: number | null
          esercizi_totali: number | null
          id: string
          note: string | null
          scheda_id: string | null
          stato: string | null
          updated_at: string | null
          volume_totale: number | null
        }
        Insert: {
          athlete_id?: string | null
          atleta_id: string
          completato?: boolean | null
          created_at?: string | null
          data?: string | null
          durata_minuti?: number | null
          esercizi_completati?: number | null
          esercizi_totali?: number | null
          id?: string
          note?: string | null
          scheda_id?: string | null
          stato?: string | null
          updated_at?: string | null
          volume_totale?: number | null
        }
        Update: {
          athlete_id?: string | null
          atleta_id?: string
          completato?: boolean | null
          created_at?: string | null
          data?: string | null
          durata_minuti?: number | null
          esercizi_completati?: number | null
          esercizi_totali?: number | null
          id?: string
          note?: string | null
          scheda_id?: string | null
          stato?: string | null
          updated_at?: string | null
          volume_totale?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'fk_workout_logs_scheda_workout_plans'
            columns: ['scheda_id']
            isOneToOne: false
            referencedRelation: 'workout_plans'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'workout_logs_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: false
            referencedRelation: 'payments_per_staff_view'
            referencedColumns: ['staff_id']
          },
          {
            foreignKeyName: 'workout_logs_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'workout_logs_atleta_id_fkey'
            columns: ['atleta_id']
            isOneToOne: false
            referencedRelation: 'payments_per_staff_view'
            referencedColumns: ['staff_id']
          },
          {
            foreignKeyName: 'workout_logs_atleta_id_fkey'
            columns: ['atleta_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      workout_plans: {
        Row: {
          athlete_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          name: string
          start_date: string | null
          trainer_id: string | null
          updated_at: string | null
        }
        Insert: {
          athlete_id: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          start_date?: string | null
          trainer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          athlete_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          start_date?: string | null
          trainer_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'workout_plans_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: false
            referencedRelation: 'payments_per_staff_view'
            referencedColumns: ['staff_id']
          },
          {
            foreignKeyName: 'workout_plans_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'workout_plans_trainer_id_fkey'
            columns: ['trainer_id']
            isOneToOne: false
            referencedRelation: 'payments_per_staff_view'
            referencedColumns: ['staff_id']
          },
          {
            foreignKeyName: 'workout_plans_trainer_id_fkey'
            columns: ['trainer_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
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
        }
        Relationships: [
          {
            foreignKeyName: 'workout_sets_workout_day_exercise_id_fkey'
            columns: ['workout_day_exercise_id']
            isOneToOne: false
            referencedRelation: 'workout_day_exercises'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
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
            foreignKeyName: 'progress_logs_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: false
            referencedRelation: 'payments_per_staff_view'
            referencedColumns: ['staff_id']
          },
          {
            foreignKeyName: 'progress_logs_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      workout_stats_mensili: {
        Row: {
          allenamenti_mese: number | null
          atleta_id: string | null
          mese: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'workout_logs_atleta_id_fkey'
            columns: ['atleta_id']
            isOneToOne: false
            referencedRelation: 'payments_per_staff_view'
            referencedColumns: ['staff_id']
          },
          {
            foreignKeyName: 'workout_logs_atleta_id_fkey'
            columns: ['atleta_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Functions: {
      calculate_athlete_progress_score: {
        Args: { athlete_uuid: string }
        Returns: Json
      }
      check_certificato_scadenza: {
        Args: { athlete_uuid: string }
        Returns: Json
      }
      check_pt_athlete_relationship: {
        Args: { receiver_uuid: string; sender_uuid: string }
        Returns: boolean
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
      decrement_lessons_used: {
        Args: { p_athlete_id: string }
        Returns: boolean
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
      get_athlete_profile_complete: {
        Args: { athlete_uuid: string }
        Returns: Json
      }
      get_clienti_stats: { Args: never; Returns: Json }
      get_conversation_participants: {
        Args: { user_uuid: string }
        Returns: {
          last_message_at: string
          other_user_id: string
          other_user_name: string
          other_user_role: string
          unread_count: number
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
          from: '*'
          to: 'user_settings'
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_profile_full_name: { Args: { p_profile_id: string }; Returns: string }
      get_profile_id: { Args: never; Returns: string }
      get_progress_stats: { Args: { athlete_uuid: string }; Returns: Json }
      get_scheda_attiva: { Args: { p_atleta_id: string }; Returns: string }
      get_unread_notifications_count: { Args: never; Returns: number }
      get_user_org_id: { Args: never; Returns: string }
      get_user_role: { Args: never; Returns: string }
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
      is_safe_storage_path: { Args: { path_text: string }; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
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
      reverse_payment: {
        Args: {
          p_created_by_staff_id: string
          p_notes?: string
          p_payment_id: string
        }
        Returns: string
      }
      run_daily_notifications: {
        Args: never
        Returns: {
          count: number
          notification_type: string
        }[]
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
      update_expired_invites: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
