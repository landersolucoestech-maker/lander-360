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
      agenda_events: {
        Row: {
          artist_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          end_time: string | null
          event_type: string | null
          expected_audience: number | null
          id: string
          location: string | null
          observations: string | null
          start_date: string
          start_time: string | null
          status: string | null
          ticket_price: number | null
          title: string
          updated_at: string
          venue_address: string | null
          venue_capacity: number | null
          venue_contact: string | null
          venue_name: string | null
        }
        Insert: {
          artist_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          event_type?: string | null
          expected_audience?: number | null
          id?: string
          location?: string | null
          observations?: string | null
          start_date: string
          start_time?: string | null
          status?: string | null
          ticket_price?: number | null
          title: string
          updated_at?: string
          venue_address?: string | null
          venue_capacity?: number | null
          venue_contact?: string | null
          venue_name?: string | null
        }
        Update: {
          artist_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          event_type?: string | null
          expected_audience?: number | null
          id?: string
          location?: string | null
          observations?: string | null
          start_date?: string
          start_time?: string | null
          status?: string | null
          ticket_price?: number | null
          title?: string
          updated_at?: string
          venue_address?: string | null
          venue_capacity?: number | null
          venue_contact?: string | null
          venue_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agenda_events_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      artist_career_diagnostics: {
        Row: {
          artist_id: string | null
          audience_score: number | null
          career_level: Database["public"]["Enums"]["artist_career_level"]
          created_at: string | null
          dominant_bottleneck: string | null
          id: string
          identity_score: number | null
          instagram_data: Json | null
          last_diagnosis_at: string | null
          marketing_score: number | null
          monetization_score: number | null
          music_score: number | null
          ninety_day_plan: Json | null
          overall_score: number | null
          spotify_data: Json | null
          tiktok_data: Json | null
          unlocked_modules: string[] | null
          updated_at: string | null
          user_id: string
          youtube_data: Json | null
        }
        Insert: {
          artist_id?: string | null
          audience_score?: number | null
          career_level?: Database["public"]["Enums"]["artist_career_level"]
          created_at?: string | null
          dominant_bottleneck?: string | null
          id?: string
          identity_score?: number | null
          instagram_data?: Json | null
          last_diagnosis_at?: string | null
          marketing_score?: number | null
          monetization_score?: number | null
          music_score?: number | null
          ninety_day_plan?: Json | null
          overall_score?: number | null
          spotify_data?: Json | null
          tiktok_data?: Json | null
          unlocked_modules?: string[] | null
          updated_at?: string | null
          user_id: string
          youtube_data?: Json | null
        }
        Update: {
          artist_id?: string | null
          audience_score?: number | null
          career_level?: Database["public"]["Enums"]["artist_career_level"]
          created_at?: string | null
          dominant_bottleneck?: string | null
          id?: string
          identity_score?: number | null
          instagram_data?: Json | null
          last_diagnosis_at?: string | null
          marketing_score?: number | null
          monetization_score?: number | null
          music_score?: number | null
          ninety_day_plan?: Json | null
          overall_score?: number | null
          spotify_data?: Json | null
          tiktok_data?: Json | null
          unlocked_modules?: string[] | null
          updated_at?: string | null
          user_id?: string
          youtube_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "artist_career_diagnostics_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      artist_goals: {
        Row: {
          artist_id: string
          created_at: string
          created_by: string | null
          current_value: number | null
          description: string | null
          end_date: string
          goal_type: string
          id: string
          period: string | null
          platform: string | null
          priority: string | null
          start_date: string
          status: string | null
          target_value: number
          title: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          artist_id: string
          created_at?: string
          created_by?: string | null
          current_value?: number | null
          description?: string | null
          end_date: string
          goal_type: string
          id?: string
          period?: string | null
          platform?: string | null
          priority?: string | null
          start_date: string
          status?: string | null
          target_value: number
          title: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          artist_id?: string
          created_at?: string
          created_by?: string | null
          current_value?: number | null
          description?: string | null
          end_date?: string
          goal_type?: string
          id?: string
          period?: string | null
          platform?: string | null
          priority?: string | null
          start_date?: string
          status?: string | null
          target_value?: number
          title?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_goals_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      artist_sensitive_data: {
        Row: {
          account: string | null
          account_holder: string | null
          agency: string | null
          artist_id: string
          bank: string | null
          cpf_cnpj: string | null
          created_at: string | null
          email: string | null
          full_address: string | null
          id: string
          phone: string | null
          pix_key: string | null
          rg: string | null
          updated_at: string | null
        }
        Insert: {
          account?: string | null
          account_holder?: string | null
          agency?: string | null
          artist_id: string
          bank?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string | null
          full_address?: string | null
          id?: string
          phone?: string | null
          pix_key?: string | null
          rg?: string | null
          updated_at?: string | null
        }
        Update: {
          account?: string | null
          account_holder?: string | null
          agency?: string | null
          artist_id?: string
          bank?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string | null
          full_address?: string | null
          id?: string
          phone?: string | null
          pix_key?: string | null
          rg?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artist_sensitive_data_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: true
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      artists: {
        Row: {
          apple_music_url: string | null
          artist_types: string[] | null
          bio: string | null
          birth_date: string | null
          contract_status: string | null
          created_at: string
          created_by: string | null
          deezer_url: string | null
          distributor_emails: Json | null
          distributors: string[] | null
          documents_url: string | null
          email: string | null
          full_name: string | null
          genre: string | null
          id: string
          image_url: string | null
          instagram: string | null
          instagram_url: string | null
          label_contact_email: string | null
          label_contact_name: string | null
          label_contact_phone: string | null
          legal_name: string | null
          manager_email: string | null
          manager_name: string | null
          manager_phone: string | null
          name: string
          observations: string | null
          phone: string | null
          profile_type: string | null
          record_label_name: string | null
          soundcloud: string | null
          spotify_id: string | null
          spotify_url: string | null
          stage_name: string | null
          tiktok: string | null
          updated_at: string
          youtube_channel_id: string | null
          youtube_url: string | null
        }
        Insert: {
          apple_music_url?: string | null
          artist_types?: string[] | null
          bio?: string | null
          birth_date?: string | null
          contract_status?: string | null
          created_at?: string
          created_by?: string | null
          deezer_url?: string | null
          distributor_emails?: Json | null
          distributors?: string[] | null
          documents_url?: string | null
          email?: string | null
          full_name?: string | null
          genre?: string | null
          id?: string
          image_url?: string | null
          instagram?: string | null
          instagram_url?: string | null
          label_contact_email?: string | null
          label_contact_name?: string | null
          label_contact_phone?: string | null
          legal_name?: string | null
          manager_email?: string | null
          manager_name?: string | null
          manager_phone?: string | null
          name: string
          observations?: string | null
          phone?: string | null
          profile_type?: string | null
          record_label_name?: string | null
          soundcloud?: string | null
          spotify_id?: string | null
          spotify_url?: string | null
          stage_name?: string | null
          tiktok?: string | null
          updated_at?: string
          youtube_channel_id?: string | null
          youtube_url?: string | null
        }
        Update: {
          apple_music_url?: string | null
          artist_types?: string[] | null
          bio?: string | null
          birth_date?: string | null
          contract_status?: string | null
          created_at?: string
          created_by?: string | null
          deezer_url?: string | null
          distributor_emails?: Json | null
          distributors?: string[] | null
          documents_url?: string | null
          email?: string | null
          full_name?: string | null
          genre?: string | null
          id?: string
          image_url?: string | null
          instagram?: string | null
          instagram_url?: string | null
          label_contact_email?: string | null
          label_contact_name?: string | null
          label_contact_phone?: string | null
          legal_name?: string | null
          manager_email?: string | null
          manager_name?: string | null
          manager_phone?: string | null
          name?: string
          observations?: string | null
          phone?: string | null
          profile_type?: string | null
          record_label_name?: string | null
          soundcloud?: string | null
          spotify_id?: string | null
          spotify_url?: string | null
          stage_name?: string | null
          tiktok?: string | null
          updated_at?: string
          youtube_channel_id?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      automated_reports: {
        Row: {
          created_at: string | null
          created_by: string | null
          frequency: string
          id: string
          is_active: boolean | null
          last_generated_at: string | null
          next_generation_at: string | null
          parameters: Json | null
          recipients: Json | null
          report_name: string
          report_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          frequency: string
          id?: string
          is_active?: boolean | null
          last_generated_at?: string | null
          next_generation_at?: string | null
          parameters?: Json | null
          recipients?: Json | null
          report_name: string
          report_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          last_generated_at?: string | null
          next_generation_at?: string | null
          parameters?: Json | null
          recipients?: Json | null
          report_name?: string
          report_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      compositions: {
        Row: {
          created_at: string
          id: string
          iswc: string | null
          publishers: string[] | null
          title: string
          track_id: string | null
          writers: string[] | null
        }
        Insert: {
          created_at?: string
          id?: string
          iswc?: string | null
          publishers?: string[] | null
          title: string
          track_id?: string | null
          writers?: string[] | null
        }
        Update: {
          created_at?: string
          id?: string
          iswc?: string | null
          publishers?: string[] | null
          title?: string
          track_id?: string | null
          writers?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "compositions_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_templates: {
        Row: {
          clauses: Json | null
          created_at: string
          created_by: string | null
          default_fields: Json | null
          description: string | null
          footer_html: string | null
          header_html: string | null
          id: string
          is_active: boolean | null
          name: string
          template_type: string
          updated_at: string
          version: number | null
        }
        Insert: {
          clauses?: Json | null
          created_at?: string
          created_by?: string | null
          default_fields?: Json | null
          description?: string | null
          footer_html?: string | null
          header_html?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          template_type: string
          updated_at?: string
          version?: number | null
        }
        Update: {
          clauses?: Json | null
          created_at?: string
          created_by?: string | null
          default_fields?: Json | null
          description?: string | null
          footer_html?: string | null
          header_html?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          template_type?: string
          updated_at?: string
          version?: number | null
        }
        Relationships: []
      }
      contracts: {
        Row: {
          advance_amount: number | null
          artist_id: string | null
          autentique_document_id: string | null
          client_type: string | null
          contract_type: string | null
          contractor_contact: string | null
          created_at: string
          created_by: string | null
          description: string | null
          document_url: string | null
          effective_from: string | null
          effective_to: string | null
          end_date: string | null
          financial_support: number | null
          fixed_value: number | null
          generated_document_content: string | null
          id: string
          notes: string | null
          observations: string | null
          payment_type: string | null
          project_id: string | null
          registry_date: string | null
          registry_office: boolean | null
          responsible_person: string | null
          royalties_percentage: number | null
          royalty_rate: number | null
          service_type: string | null
          signature_request_date: string | null
          signed_date: string | null
          start_date: string | null
          status: string | null
          template_id: string | null
          terms: string | null
          title: string
          updated_at: string
          value: number | null
        }
        Insert: {
          advance_amount?: number | null
          artist_id?: string | null
          autentique_document_id?: string | null
          client_type?: string | null
          contract_type?: string | null
          contractor_contact?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          document_url?: string | null
          effective_from?: string | null
          effective_to?: string | null
          end_date?: string | null
          financial_support?: number | null
          fixed_value?: number | null
          generated_document_content?: string | null
          id?: string
          notes?: string | null
          observations?: string | null
          payment_type?: string | null
          project_id?: string | null
          registry_date?: string | null
          registry_office?: boolean | null
          responsible_person?: string | null
          royalties_percentage?: number | null
          royalty_rate?: number | null
          service_type?: string | null
          signature_request_date?: string | null
          signed_date?: string | null
          start_date?: string | null
          status?: string | null
          template_id?: string | null
          terms?: string | null
          title: string
          updated_at?: string
          value?: number | null
        }
        Update: {
          advance_amount?: number | null
          artist_id?: string | null
          autentique_document_id?: string | null
          client_type?: string | null
          contract_type?: string | null
          contractor_contact?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          document_url?: string | null
          effective_from?: string | null
          effective_to?: string | null
          end_date?: string | null
          financial_support?: number | null
          fixed_value?: number | null
          generated_document_content?: string | null
          id?: string
          notes?: string | null
          observations?: string | null
          payment_type?: string | null
          project_id?: string | null
          registry_date?: string | null
          registry_office?: boolean | null
          responsible_person?: string | null
          royalties_percentage?: number | null
          royalty_rate?: number | null
          service_type?: string | null
          signature_request_date?: string | null
          signed_date?: string | null
          start_date?: string | null
          status?: string | null
          template_id?: string | null
          terms?: string | null
          title?: string
          updated_at?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "contract_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      contributors: {
        Row: {
          created_at: string
          id: string
          name: string
          role: string | null
          track_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          role?: string | null
          track_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          role?: string | null
          track_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contributors_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      creative_ai_chats: {
        Row: {
          artist_id: string | null
          context: Json | null
          created_at: string
          created_by: string | null
          id: string
          messages: Json | null
          title: string | null
          updated_at: string
        }
        Insert: {
          artist_id?: string | null
          context?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          messages?: Json | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          artist_id?: string | null
          context?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          messages?: Json | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "creative_ai_chats_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      creative_ideas: {
        Row: {
          additional_notes: string | null
          artist_id: string | null
          campaign_id: string | null
          channel: string | null
          content_format: string | null
          created_at: string
          created_by: string | null
          description: string
          engagement_strategies: string[] | null
          execution_notes: string | null
          feedback_notes: string | null
          id: string
          is_useful: boolean | null
          keywords: string[] | null
          music_registry_id: string | null
          objective: string
          parent_id: string | null
          post_frequency: string | null
          priority: string | null
          recommended_dates: string[] | null
          release_id: string | null
          status: string | null
          suggested_channel: string | null
          target_audience: Json | null
          title: string
          tone: string | null
          updated_at: string
          version: number | null
        }
        Insert: {
          additional_notes?: string | null
          artist_id?: string | null
          campaign_id?: string | null
          channel?: string | null
          content_format?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          engagement_strategies?: string[] | null
          execution_notes?: string | null
          feedback_notes?: string | null
          id?: string
          is_useful?: boolean | null
          keywords?: string[] | null
          music_registry_id?: string | null
          objective: string
          parent_id?: string | null
          post_frequency?: string | null
          priority?: string | null
          recommended_dates?: string[] | null
          release_id?: string | null
          status?: string | null
          suggested_channel?: string | null
          target_audience?: Json | null
          title: string
          tone?: string | null
          updated_at?: string
          version?: number | null
        }
        Update: {
          additional_notes?: string | null
          artist_id?: string | null
          campaign_id?: string | null
          channel?: string | null
          content_format?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          engagement_strategies?: string[] | null
          execution_notes?: string | null
          feedback_notes?: string | null
          id?: string
          is_useful?: boolean | null
          keywords?: string[] | null
          music_registry_id?: string | null
          objective?: string
          parent_id?: string | null
          post_frequency?: string | null
          priority?: string | null
          recommended_dates?: string[] | null
          release_id?: string | null
          status?: string | null
          suggested_channel?: string | null
          target_audience?: Json | null
          title?: string
          tone?: string | null
          updated_at?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "creative_ideas_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creative_ideas_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creative_ideas_music_registry_id_fkey"
            columns: ["music_registry_id"]
            isOneToOne: false
            referencedRelation: "music_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creative_ideas_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "creative_ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creative_ideas_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "releases"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_contacts: {
        Row: {
          address: string | null
          artist_name: string | null
          city: string | null
          company: string | null
          contact_type: string | null
          created_at: string
          created_by: string | null
          document: string | null
          email: string | null
          id: string
          image_url: string | null
          interactions: Json | null
          name: string
          next_action: string | null
          notes: string | null
          phone: string | null
          position: string | null
          priority: string | null
          state: string | null
          status: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          artist_name?: string | null
          city?: string | null
          company?: string | null
          contact_type?: string | null
          created_at?: string
          created_by?: string | null
          document?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          interactions?: Json | null
          name: string
          next_action?: string | null
          notes?: string | null
          phone?: string | null
          position?: string | null
          priority?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          artist_name?: string | null
          city?: string | null
          company?: string | null
          contact_type?: string | null
          created_at?: string
          created_by?: string | null
          document?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          interactions?: Json | null
          name?: string
          next_action?: string | null
          notes?: string | null
          phone?: string | null
          position?: string | null
          priority?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      distributions: {
        Row: {
          created_at: string
          distributed_at: string | null
          id: string
          platform: string
          release_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          distributed_at?: string | null
          id?: string
          platform: string
          release_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          distributed_at?: string | null
          id?: string
          platform?: string
          release_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "distributions_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "releases"
            referencedColumns: ["id"]
          },
        ]
      }
      ecad_divergences: {
        Row: {
          created_at: string
          detected_count: number | null
          detected_value: number | null
          detection_id: string | null
          divergence_type: string
          ecad_count: number | null
          ecad_report_item_id: string | null
          ecad_value: number | null
          id: string
          music_registry_id: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          detected_count?: number | null
          detected_value?: number | null
          detection_id?: string | null
          divergence_type: string
          ecad_count?: number | null
          ecad_report_item_id?: string | null
          ecad_value?: number | null
          id?: string
          music_registry_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          detected_count?: number | null
          detected_value?: number | null
          detection_id?: string | null
          divergence_type?: string
          ecad_count?: number | null
          ecad_report_item_id?: string | null
          ecad_value?: number | null
          id?: string
          music_registry_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ecad_divergences_detection_id_fkey"
            columns: ["detection_id"]
            isOneToOne: false
            referencedRelation: "radio_tv_detections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ecad_divergences_ecad_report_item_id_fkey"
            columns: ["ecad_report_item_id"]
            isOneToOne: false
            referencedRelation: "ecad_report_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ecad_divergences_music_registry_id_fkey"
            columns: ["music_registry_id"]
            isOneToOne: false
            referencedRelation: "music_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      ecad_report_items: {
        Row: {
          artist_name: string | null
          created_at: string
          divergence_notes: string | null
          divergence_type: string | null
          ecad_report_id: string
          ecad_work_code: string | null
          execution_count: number | null
          execution_value: number | null
          id: string
          matched: boolean | null
          music_registry_id: string | null
          period: string | null
          platform: string | null
          title: string | null
        }
        Insert: {
          artist_name?: string | null
          created_at?: string
          divergence_notes?: string | null
          divergence_type?: string | null
          ecad_report_id: string
          ecad_work_code?: string | null
          execution_count?: number | null
          execution_value?: number | null
          id?: string
          matched?: boolean | null
          music_registry_id?: string | null
          period?: string | null
          platform?: string | null
          title?: string | null
        }
        Update: {
          artist_name?: string | null
          created_at?: string
          divergence_notes?: string | null
          divergence_type?: string | null
          ecad_report_id?: string
          ecad_work_code?: string | null
          execution_count?: number | null
          execution_value?: number | null
          id?: string
          matched?: boolean | null
          music_registry_id?: string | null
          period?: string | null
          platform?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ecad_report_items_ecad_report_id_fkey"
            columns: ["ecad_report_id"]
            isOneToOne: false
            referencedRelation: "ecad_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ecad_report_items_music_registry_id_fkey"
            columns: ["music_registry_id"]
            isOneToOne: false
            referencedRelation: "music_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      ecad_reports: {
        Row: {
          created_at: string
          created_by: string | null
          divergent_records: number | null
          file_name: string | null
          file_url: string | null
          id: string
          import_error: string | null
          import_status: string | null
          imported_at: string | null
          matched_records: number | null
          report_period: string
          report_type: string | null
          total_records: number | null
          total_value: number | null
          unmatched_records: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          divergent_records?: number | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          import_error?: string | null
          import_status?: string | null
          imported_at?: string | null
          matched_records?: number | null
          report_period: string
          report_type?: string | null
          total_records?: number | null
          total_value?: number | null
          unmatched_records?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          divergent_records?: number | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          import_error?: string | null
          import_status?: string | null
          imported_at?: string | null
          matched_records?: number | null
          report_period?: string
          report_type?: string | null
          total_records?: number | null
          total_value?: number | null
          unmatched_records?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      email_otp_codes: {
        Row: {
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          amount: number
          artist_id: string | null
          attachment_url: string | null
          authorized_by: string | null
          category: string | null
          contract_id: string | null
          created_at: string
          created_by: string | null
          crm_contact_id: string | null
          date: string
          description: string
          event_id: string | null
          id: string
          observations: string | null
          payment_method: string | null
          payment_type: string | null
          project_id: string | null
          responsible_by: string | null
          status: string | null
          subcategory: string | null
          transaction_date: string | null
          transaction_type: string | null
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          artist_id?: string | null
          attachment_url?: string | null
          authorized_by?: string | null
          category?: string | null
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          crm_contact_id?: string | null
          date: string
          description: string
          event_id?: string | null
          id?: string
          observations?: string | null
          payment_method?: string | null
          payment_type?: string | null
          project_id?: string | null
          responsible_by?: string | null
          status?: string | null
          subcategory?: string | null
          transaction_date?: string | null
          transaction_type?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          artist_id?: string | null
          attachment_url?: string | null
          authorized_by?: string | null
          category?: string | null
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          crm_contact_id?: string | null
          date?: string
          description?: string
          event_id?: string | null
          id?: string
          observations?: string | null
          payment_method?: string | null
          payment_type?: string | null
          project_id?: string | null
          responsible_by?: string | null
          status?: string | null
          subcategory?: string | null
          transaction_date?: string | null
          transaction_type?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_crm_contact_id_fkey"
            columns: ["crm_contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "agenda_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      genre_reference: {
        Row: {
          created_at: string | null
          display_name: string
          id: string
          name: string
          normalized_name: string
        }
        Insert: {
          created_at?: string | null
          display_name: string
          id?: string
          name: string
          normalized_name: string
        }
        Update: {
          created_at?: string | null
          display_name?: string
          id?: string
          name?: string
          normalized_name?: string
        }
        Relationships: []
      }
      influencers: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          created_by: string | null
          engagement_rate: number | null
          followers: number | null
          handle: string | null
          id: string
          last_collaboration: string | null
          name: string
          niche: string | null
          notes: string | null
          platform: string
          price_per_post: number | null
          price_per_story: number | null
          price_per_video: number | null
          status: string | null
          total_collaborations: number | null
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          engagement_rate?: number | null
          followers?: number | null
          handle?: string | null
          id?: string
          last_collaboration?: string | null
          name: string
          niche?: string | null
          notes?: string | null
          platform: string
          price_per_post?: number | null
          price_per_story?: number | null
          price_per_video?: number | null
          status?: string | null
          total_collaborations?: number | null
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          engagement_rate?: number | null
          followers?: number | null
          handle?: string | null
          id?: string
          last_collaboration?: string | null
          name?: string
          niche?: string | null
          notes?: string | null
          platform?: string
          price_per_post?: number | null
          price_per_story?: number | null
          price_per_video?: number | null
          status?: string | null
          total_collaborations?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          entry_date: string | null
          id: string
          invoice_number: string | null
          location: string | null
          name: string
          observations: string | null
          purchase_location: string | null
          quantity: number | null
          responsible: string | null
          sector: string | null
          status: string | null
          unit_value: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          entry_date?: string | null
          id?: string
          invoice_number?: string | null
          location?: string | null
          name: string
          observations?: string | null
          purchase_location?: string | null
          quantity?: number | null
          responsible?: string | null
          sector?: string | null
          status?: string | null
          unit_value?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          entry_date?: string | null
          id?: string
          invoice_number?: string | null
          location?: string | null
          name?: string
          observations?: string | null
          purchase_location?: string | null
          quantity?: number | null
          responsible?: string | null
          sector?: string | null
          status?: string | null
          unit_value?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          client_document: string | null
          client_email: string | null
          client_name: string
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          invoice_number: string
          issue_date: string
          paid_date: string | null
          project_id: string | null
          status: string | null
          tax_amount: number | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          amount: number
          client_document?: string | null
          client_email?: string | null
          client_name: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          issue_date: string
          paid_date?: string | null
          project_id?: string | null
          status?: string | null
          tax_amount?: number | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          amount?: number
          client_document?: string | null
          client_email?: string | null
          client_name?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string
          paid_date?: string | null
          project_id?: string | null
          status?: string | null
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      landerzap_conversations: {
        Row: {
          archived: boolean
          channel: string
          contact_id: string
          contact_image: string | null
          contact_initials: string
          contact_name: string
          contact_type: string
          created_at: string
          id: string
          last_message: string | null
          last_message_at: string
          starred: boolean
          unread: boolean
          updated_at: string
        }
        Insert: {
          archived?: boolean
          channel: string
          contact_id: string
          contact_image?: string | null
          contact_initials: string
          contact_name: string
          contact_type: string
          created_at?: string
          id?: string
          last_message?: string | null
          last_message_at?: string
          starred?: boolean
          unread?: boolean
          updated_at?: string
        }
        Update: {
          archived?: boolean
          channel?: string
          contact_id?: string
          contact_image?: string | null
          contact_initials?: string
          contact_name?: string
          contact_type?: string
          created_at?: string
          id?: string
          last_message?: string | null
          last_message_at?: string
          starred?: boolean
          unread?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      landerzap_messages: {
        Row: {
          channel: string
          content: string
          conversation_id: string
          created_at: string
          from_me: boolean
          id: string
          sent_at: string
          status: string
        }
        Insert: {
          channel: string
          content: string
          conversation_id: string
          created_at?: string
          from_me?: boolean
          id?: string
          sent_at?: string
          status?: string
        }
        Update: {
          channel?: string
          content?: string
          conversation_id?: string
          created_at?: string
          from_me?: boolean
          id?: string
          sent_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "landerzap_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "landerzap_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_badges: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          points: number | null
          stage_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          points?: number | null
          stage_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          points?: number | null
          stage_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_badges_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "learning_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_lessons: {
        Row: {
          best_practices: string[] | null
          checklist: Json | null
          content_text: string | null
          content_type: Database["public"]["Enums"]["learning_content_type"]
          content_url: string | null
          copywriting_tips: string | null
          created_at: string
          description: string | null
          difficulty: Database["public"]["Enums"]["learning_difficulty"] | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          lesson_order: number
          related_module: string | null
          screenshots: string[] | null
          title: string
          topic_id: string
          updated_at: string
        }
        Insert: {
          best_practices?: string[] | null
          checklist?: Json | null
          content_text?: string | null
          content_type?: Database["public"]["Enums"]["learning_content_type"]
          content_url?: string | null
          copywriting_tips?: string | null
          created_at?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["learning_difficulty"] | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          lesson_order: number
          related_module?: string | null
          screenshots?: string[] | null
          title: string
          topic_id: string
          updated_at?: string
        }
        Update: {
          best_practices?: string[] | null
          checklist?: Json | null
          content_text?: string | null
          content_type?: Database["public"]["Enums"]["learning_content_type"]
          content_url?: string | null
          copywriting_tips?: string | null
          created_at?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["learning_difficulty"] | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          lesson_order?: number
          related_module?: string | null
          screenshots?: string[] | null
          title?: string
          topic_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_lessons_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "learning_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_notes: {
        Row: {
          created_at: string
          id: string
          is_bookmarked: boolean | null
          lesson_id: string
          note_text: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_bookmarked?: boolean | null
          lesson_id: string
          note_text?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_bookmarked?: boolean | null
          lesson_id?: string
          note_text?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_notes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "learning_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string
          id: string
          lesson_id: string
          started_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id: string
          started_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id?: string
          started_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "learning_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_stages: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          module_category: string | null
          required_career_level:
            | Database["public"]["Enums"]["artist_career_level"]
            | null
          stage_number: number
          title: string
          track_type: Database["public"]["Enums"]["learning_track_type"] | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          module_category?: string | null
          required_career_level?:
            | Database["public"]["Enums"]["artist_career_level"]
            | null
          stage_number: number
          title: string
          track_type?: Database["public"]["Enums"]["learning_track_type"] | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          module_category?: string | null
          required_career_level?:
            | Database["public"]["Enums"]["artist_career_level"]
            | null
          stage_number?: number
          title?: string
          track_type?: Database["public"]["Enums"]["learning_track_type"] | null
          updated_at?: string
        }
        Relationships: []
      }
      learning_topics: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          stage_id: string
          title: string
          topic_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          stage_id: string
          title: string
          topic_order: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          stage_id?: string
          title?: string
          topic_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_topics_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "learning_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "learning_badges"
            referencedColumns: ["id"]
          },
        ]
      }
      login_attempts: {
        Row: {
          attempt_count: number
          created_at: string
          email: string
          id: string
          last_attempt_at: string
          locked_until: string | null
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          email: string
          id?: string
          last_attempt_at?: string
          locked_until?: string | null
        }
        Update: {
          attempt_count?: number
          created_at?: string
          email?: string
          id?: string
          last_attempt_at?: string
          locked_until?: string | null
        }
        Relationships: []
      }
      login_history: {
        Row: {
          browser: string | null
          device_type: string | null
          id: string
          ip_address: string | null
          location: string | null
          login_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          browser?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          location?: string | null
          login_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          browser?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          location?: string | null
          login_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      marketing_briefings: {
        Row: {
          budget: number | null
          campaign: string | null
          campaign_id: string | null
          content: string | null
          created_at: string
          created_by: string | null
          created_by_name: string | null
          deadline: string | null
          deliverables: string[] | null
          description: string | null
          id: string
          priority: string | null
          status: string | null
          target_audience: string | null
          title: string
          updated_at: string
        }
        Insert: {
          budget?: number | null
          campaign?: string | null
          campaign_id?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          deadline?: string | null
          deliverables?: string[] | null
          description?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          target_audience?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          budget?: number | null
          campaign?: string | null
          campaign_id?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          deadline?: string | null
          deliverables?: string[] | null
          description?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          target_audience?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_briefings_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_campaigns: {
        Row: {
          artist_id: string | null
          budget: number | null
          clicks: number | null
          conversions: number | null
          cpc: number | null
          created_at: string
          created_by: string | null
          ctr: number | null
          description: string | null
          end_date: string | null
          id: string
          impressions: number | null
          name: string
          reach: number | null
          roas: number | null
          spent: number | null
          start_date: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          artist_id?: string | null
          budget?: number | null
          clicks?: number | null
          conversions?: number | null
          cpc?: number | null
          created_at?: string
          created_by?: string | null
          ctr?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          impressions?: number | null
          name: string
          reach?: number | null
          roas?: number | null
          spent?: number | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          artist_id?: string | null
          budget?: number | null
          clicks?: number | null
          conversions?: number | null
          cpc?: number | null
          created_at?: string
          created_by?: string | null
          ctr?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          impressions?: number | null
          name?: string
          reach?: number | null
          roas?: number | null
          spent?: number | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_campaigns_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_content: {
        Row: {
          campaign_id: string | null
          content_type: string | null
          content_url: string | null
          created_at: string
          created_by: string | null
          id: string
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          campaign_id?: string | null
          content_type?: string | null
          content_url?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          campaign_id?: string | null
          content_type?: string | null
          content_url?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_content_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_tasks: {
        Row: {
          assigned_to: string | null
          assignee_name: string | null
          campaign: string | null
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          progress: number | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          assignee_name?: string | null
          campaign?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          progress?: number | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          assignee_name?: string | null
          campaign?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          progress?: number | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      module_permissions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          module_id: string | null
          permission: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          module_id?: string | null
          permission: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          module_id?: string | null
          permission?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_permissions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "system_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      music_registry: {
        Row: {
          abramus_code: string | null
          artist_id: string | null
          bpm: number | null
          created_at: string
          created_by: string | null
          duration: number | null
          ecad_code: string | null
          genre: string | null
          genre_normalized: string | null
          id: string
          isrc: string | null
          iswc: string | null
          key: string | null
          participants: Json | null
          project_id: string | null
          publishers: string[] | null
          release_date: string | null
          royalties_expected: number | null
          royalties_notes: string | null
          royalties_received: number | null
          royalties_share_applied: boolean | null
          royalties_verified: boolean | null
          royalties_verified_at: string | null
          status: string | null
          title: string
          updated_at: string
          writers: string[] | null
        }
        Insert: {
          abramus_code?: string | null
          artist_id?: string | null
          bpm?: number | null
          created_at?: string
          created_by?: string | null
          duration?: number | null
          ecad_code?: string | null
          genre?: string | null
          genre_normalized?: string | null
          id?: string
          isrc?: string | null
          iswc?: string | null
          key?: string | null
          participants?: Json | null
          project_id?: string | null
          publishers?: string[] | null
          release_date?: string | null
          royalties_expected?: number | null
          royalties_notes?: string | null
          royalties_received?: number | null
          royalties_share_applied?: boolean | null
          royalties_verified?: boolean | null
          royalties_verified_at?: string | null
          status?: string | null
          title: string
          updated_at?: string
          writers?: string[] | null
        }
        Update: {
          abramus_code?: string | null
          artist_id?: string | null
          bpm?: number | null
          created_at?: string
          created_by?: string | null
          duration?: number | null
          ecad_code?: string | null
          genre?: string | null
          genre_normalized?: string | null
          id?: string
          isrc?: string | null
          iswc?: string | null
          key?: string | null
          participants?: Json | null
          project_id?: string | null
          publishers?: string[] | null
          release_date?: string | null
          royalties_expected?: number | null
          royalties_notes?: string | null
          royalties_received?: number | null
          royalties_share_applied?: boolean | null
          royalties_verified?: boolean | null
          royalties_verified_at?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          writers?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "music_registry_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "music_registry_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      paid_campaigns: {
        Row: {
          ad_url: string | null
          artist_id: string | null
          budget: number | null
          campaign_type: string | null
          clicks: number | null
          conversions: number | null
          cpc: number | null
          cpm: number | null
          created_at: string
          created_by: string | null
          creative_urls: Json | null
          ctr: number | null
          daily_budget: number | null
          description: string | null
          end_date: string | null
          id: string
          impressions: number | null
          landing_url: string | null
          marketing_campaign_id: string | null
          name: string
          platform: string
          release_id: string | null
          roas: number | null
          spent: number | null
          start_date: string | null
          status: string | null
          target_audience: Json | null
          updated_at: string
        }
        Insert: {
          ad_url?: string | null
          artist_id?: string | null
          budget?: number | null
          campaign_type?: string | null
          clicks?: number | null
          conversions?: number | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string
          created_by?: string | null
          creative_urls?: Json | null
          ctr?: number | null
          daily_budget?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          impressions?: number | null
          landing_url?: string | null
          marketing_campaign_id?: string | null
          name: string
          platform: string
          release_id?: string | null
          roas?: number | null
          spent?: number | null
          start_date?: string | null
          status?: string | null
          target_audience?: Json | null
          updated_at?: string
        }
        Update: {
          ad_url?: string | null
          artist_id?: string | null
          budget?: number | null
          campaign_type?: string | null
          clicks?: number | null
          conversions?: number | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string
          created_by?: string | null
          creative_urls?: Json | null
          ctr?: number | null
          daily_budget?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          impressions?: number | null
          landing_url?: string | null
          marketing_campaign_id?: string | null
          name?: string
          platform?: string
          release_id?: string | null
          roas?: number | null
          spent?: number | null
          start_date?: string | null
          status?: string | null
          target_audience?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "paid_campaigns_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paid_campaigns_marketing_campaign_id_fkey"
            columns: ["marketing_campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paid_campaigns_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "releases"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_email_changes: {
        Row: {
          confirmed_at: string | null
          created_at: string
          current_email: string
          expires_at: string
          id: string
          new_email: string
          token: string
          user_id: string
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string
          current_email: string
          expires_at?: string
          id?: string
          new_email: string
          token: string
          user_id: string
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string
          current_email?: string
          expires_at?: string
          id?: string
          new_email?: string
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      pending_shares: {
        Row: {
          artist_name: string | null
          created_at: string
          created_by: string | null
          id: string
          music_title: string
          notes: string | null
          participant_name: string
          participant_role: string | null
          share_percentage: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          artist_name?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          music_title: string
          notes?: string | null
          participant_name: string
          participant_role?: string | null
          share_percentage?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          artist_name?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          music_title?: string
          notes?: string | null
          participant_name?: string
          participant_role?: string | null
          share_percentage?: number | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      phonograms: {
        Row: {
          abramus_code: string | null
          artist_id: string | null
          audio_url: string | null
          created_at: string
          created_by: string | null
          duration: number | null
          ecad_code: string | null
          genre: string | null
          id: string
          is_remix: boolean | null
          isrc: string | null
          label: string | null
          language: string | null
          master_owner: string | null
          participants: Json | null
          recording_date: string | null
          recording_location: string | null
          recording_studio: string | null
          remix_artist: string | null
          royalties_expected: number | null
          royalties_notes: string | null
          royalties_received: number | null
          royalties_share_applied: boolean | null
          royalties_verified: boolean | null
          royalties_verified_at: string | null
          status: string | null
          title: string
          updated_at: string
          version_type: string | null
          work_id: string | null
        }
        Insert: {
          abramus_code?: string | null
          artist_id?: string | null
          audio_url?: string | null
          created_at?: string
          created_by?: string | null
          duration?: number | null
          ecad_code?: string | null
          genre?: string | null
          id?: string
          is_remix?: boolean | null
          isrc?: string | null
          label?: string | null
          language?: string | null
          master_owner?: string | null
          participants?: Json | null
          recording_date?: string | null
          recording_location?: string | null
          recording_studio?: string | null
          remix_artist?: string | null
          royalties_expected?: number | null
          royalties_notes?: string | null
          royalties_received?: number | null
          royalties_share_applied?: boolean | null
          royalties_verified?: boolean | null
          royalties_verified_at?: string | null
          status?: string | null
          title: string
          updated_at?: string
          version_type?: string | null
          work_id?: string | null
        }
        Update: {
          abramus_code?: string | null
          artist_id?: string | null
          audio_url?: string | null
          created_at?: string
          created_by?: string | null
          duration?: number | null
          ecad_code?: string | null
          genre?: string | null
          id?: string
          is_remix?: boolean | null
          isrc?: string | null
          label?: string | null
          language?: string | null
          master_owner?: string | null
          participants?: Json | null
          recording_date?: string | null
          recording_location?: string | null
          recording_studio?: string | null
          remix_artist?: string | null
          royalties_expected?: number | null
          royalties_notes?: string | null
          royalties_received?: number | null
          royalties_share_applied?: boolean | null
          royalties_verified?: boolean | null
          royalties_verified_at?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          version_type?: string | null
          work_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "phonograms_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "phonograms_work_id_fkey"
            columns: ["work_id"]
            isOneToOne: false
            referencedRelation: "music_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          permissions: string[] | null
          phone: string | null
          role_display: string | null
          roles: string[] | null
          sector: string | null
          sector_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean | null
          permissions?: string[] | null
          phone?: string | null
          role_display?: string | null
          roles?: string[] | null
          sector?: string | null
          sector_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: string[] | null
          phone?: string | null
          role_display?: string | null
          roles?: string[] | null
          sector?: string | null
          sector_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          artist_id: string | null
          audio_files: Json | null
          budget: number | null
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          artist_id?: string | null
          audio_files?: Json | null
          budget?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          artist_id?: string | null
          audio_files?: Json | null
          budget?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      radio_tv_detections: {
        Row: {
          artist_id: string | null
          artist_name: string | null
          confidence_score: number | null
          created_at: string
          created_by: string | null
          detected_at: string
          duration_seconds: number | null
          ecad_matched: boolean | null
          ecad_report_id: string | null
          fingerprint_provider: string | null
          id: string
          metadata: Json | null
          music_registry_id: string | null
          platform: string
          station_channel: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          artist_id?: string | null
          artist_name?: string | null
          confidence_score?: number | null
          created_at?: string
          created_by?: string | null
          detected_at?: string
          duration_seconds?: number | null
          ecad_matched?: boolean | null
          ecad_report_id?: string | null
          fingerprint_provider?: string | null
          id?: string
          metadata?: Json | null
          music_registry_id?: string | null
          platform: string
          station_channel?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          artist_id?: string | null
          artist_name?: string | null
          confidence_score?: number | null
          created_at?: string
          created_by?: string | null
          detected_at?: string
          duration_seconds?: number | null
          ecad_matched?: boolean | null
          ecad_report_id?: string | null
          fingerprint_provider?: string | null
          id?: string
          metadata?: Json | null
          music_registry_id?: string | null
          platform?: string
          station_channel?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "radio_tv_detections_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "radio_tv_detections_music_registry_id_fkey"
            columns: ["music_registry_id"]
            isOneToOne: false
            referencedRelation: "music_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          created_at: string | null
          id: string
          key: string
          requests: number | null
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          requests?: number | null
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          requests?: number | null
          window_start?: string | null
        }
        Relationships: []
      }
      release_streaming_metrics: {
        Row: {
          created_at: string
          fetched_at: string
          id: string
          platform: string
          playlist_adds: number | null
          release_id: string
          saves: number | null
          streams: number | null
          views: number | null
        }
        Insert: {
          created_at?: string
          fetched_at?: string
          id?: string
          platform: string
          playlist_adds?: number | null
          release_id: string
          saves?: number | null
          streams?: number | null
          views?: number | null
        }
        Update: {
          created_at?: string
          fetched_at?: string
          id?: string
          platform?: string
          playlist_adds?: number | null
          release_id?: string
          saves?: number | null
          streams?: number | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "release_streaming_metrics_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "releases"
            referencedColumns: ["id"]
          },
        ]
      }
      releases: {
        Row: {
          actual_release_date: string | null
          artist_id: string | null
          copyright: string | null
          cover_url: string | null
          created_at: string
          created_by: string | null
          distributors: string[] | null
          genre: string | null
          id: string
          label: string | null
          language: string | null
          planned_release_date: string | null
          project_id: string | null
          release_date: string | null
          release_type: string | null
          royalties_expected: number | null
          royalties_notes: string | null
          royalties_received: number | null
          royalties_share_applied: boolean | null
          royalties_verified: boolean | null
          royalties_verified_at: string | null
          status: string | null
          title: string
          tracks: Json | null
          type: string | null
          upc: string | null
          updated_at: string
        }
        Insert: {
          actual_release_date?: string | null
          artist_id?: string | null
          copyright?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          distributors?: string[] | null
          genre?: string | null
          id?: string
          label?: string | null
          language?: string | null
          planned_release_date?: string | null
          project_id?: string | null
          release_date?: string | null
          release_type?: string | null
          royalties_expected?: number | null
          royalties_notes?: string | null
          royalties_received?: number | null
          royalties_share_applied?: boolean | null
          royalties_verified?: boolean | null
          royalties_verified_at?: string | null
          status?: string | null
          title: string
          tracks?: Json | null
          type?: string | null
          upc?: string | null
          updated_at?: string
        }
        Update: {
          actual_release_date?: string | null
          artist_id?: string | null
          copyright?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          distributors?: string[] | null
          genre?: string | null
          id?: string
          label?: string | null
          language?: string | null
          planned_release_date?: string | null
          project_id?: string | null
          release_date?: string | null
          release_type?: string | null
          royalties_expected?: number | null
          royalties_notes?: string | null
          royalties_received?: number | null
          royalties_share_applied?: boolean | null
          royalties_verified?: boolean | null
          royalties_verified_at?: string | null
          status?: string | null
          title?: string
          tracks?: Json | null
          type?: string | null
          upc?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "releases_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "releases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      royalty_distrokid: {
        Row: {
          artist: string | null
          asset_type: string | null
          country_of_sale: string | null
          created_at: string
          earnings_usd: number | null
          id: string
          inserted: string | null
          quantity: number | null
          report_id: string | null
          reported: string | null
          sale_month: string | null
          splits: string | null
          store: string | null
          title: string | null
        }
        Insert: {
          artist?: string | null
          asset_type?: string | null
          country_of_sale?: string | null
          created_at?: string
          earnings_usd?: number | null
          id?: string
          inserted?: string | null
          quantity?: number | null
          report_id?: string | null
          reported?: string | null
          sale_month?: string | null
          splits?: string | null
          store?: string | null
          title?: string | null
        }
        Update: {
          artist?: string | null
          asset_type?: string | null
          country_of_sale?: string | null
          created_at?: string
          earnings_usd?: number | null
          id?: string
          inserted?: string | null
          quantity?: number | null
          report_id?: string | null
          reported?: string | null
          sale_month?: string | null
          splits?: string | null
          store?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "royalty_distrokid_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "royalty_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      royalty_onerpm_details_commissions: {
        Row: {
          accounted_date: string | null
          created_at: string
          currency: string | null
          id: string
          report_id: string | null
          revenue: number | null
          title: string | null
          transaction_month: string | null
        }
        Insert: {
          accounted_date?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          report_id?: string | null
          revenue?: number | null
          title?: string | null
          transaction_month?: string | null
        }
        Update: {
          accounted_date?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          report_id?: string | null
          revenue?: number | null
          title?: string | null
          transaction_month?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "royalty_onerpm_details_commissions_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "royalty_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      royalty_onerpm_details_masters: {
        Row: {
          accounted_date: string | null
          album_title: string | null
          artists: string | null
          avg_unit_gross: number | null
          created_at: string
          currency: string | null
          exchange_rate: number | null
          fees: number | null
          gross: number | null
          gross_original: number | null
          id: string
          isrc: string | null
          label: string | null
          net: number | null
          original_currency: string | null
          product_type: string | null
          quantity: number | null
          report_id: string | null
          sale_type: string | null
          share_percent: number | null
          store: string | null
          territory: string | null
          track_title: string | null
          transaction_month: string | null
          upc: string | null
        }
        Insert: {
          accounted_date?: string | null
          album_title?: string | null
          artists?: string | null
          avg_unit_gross?: number | null
          created_at?: string
          currency?: string | null
          exchange_rate?: number | null
          fees?: number | null
          gross?: number | null
          gross_original?: number | null
          id?: string
          isrc?: string | null
          label?: string | null
          net?: number | null
          original_currency?: string | null
          product_type?: string | null
          quantity?: number | null
          report_id?: string | null
          sale_type?: string | null
          share_percent?: number | null
          store?: string | null
          territory?: string | null
          track_title?: string | null
          transaction_month?: string | null
          upc?: string | null
        }
        Update: {
          accounted_date?: string | null
          album_title?: string | null
          artists?: string | null
          avg_unit_gross?: number | null
          created_at?: string
          currency?: string | null
          exchange_rate?: number | null
          fees?: number | null
          gross?: number | null
          gross_original?: number | null
          id?: string
          isrc?: string | null
          label?: string | null
          net?: number | null
          original_currency?: string | null
          product_type?: string | null
          quantity?: number | null
          report_id?: string | null
          sale_type?: string | null
          share_percent?: number | null
          store?: string | null
          territory?: string | null
          track_title?: string | null
          transaction_month?: string | null
          upc?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "royalty_onerpm_details_masters_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "royalty_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      royalty_onerpm_details_publishing: {
        Row: {
          accounted_date: string | null
          avg_unit_gross: number | null
          created_at: string
          currency: string | null
          custom_id: string | null
          exchange_rate: number | null
          fees: number | null
          gross: number | null
          gross_original: number | null
          id: string
          isrc: string | null
          iswc: string | null
          net: number | null
          original_currency: string | null
          owned_share: number | null
          performers: string | null
          quantity: number | null
          report_id: string | null
          revenue_source: string | null
          share_percent: number | null
          song_title: string | null
          territory: string | null
          transaction_month: string | null
          writers: string | null
        }
        Insert: {
          accounted_date?: string | null
          avg_unit_gross?: number | null
          created_at?: string
          currency?: string | null
          custom_id?: string | null
          exchange_rate?: number | null
          fees?: number | null
          gross?: number | null
          gross_original?: number | null
          id?: string
          isrc?: string | null
          iswc?: string | null
          net?: number | null
          original_currency?: string | null
          owned_share?: number | null
          performers?: string | null
          quantity?: number | null
          report_id?: string | null
          revenue_source?: string | null
          share_percent?: number | null
          song_title?: string | null
          territory?: string | null
          transaction_month?: string | null
          writers?: string | null
        }
        Update: {
          accounted_date?: string | null
          avg_unit_gross?: number | null
          created_at?: string
          currency?: string | null
          custom_id?: string | null
          exchange_rate?: number | null
          fees?: number | null
          gross?: number | null
          gross_original?: number | null
          id?: string
          isrc?: string | null
          iswc?: string | null
          net?: number | null
          original_currency?: string | null
          owned_share?: number | null
          performers?: string | null
          quantity?: number | null
          report_id?: string | null
          revenue_source?: string | null
          share_percent?: number | null
          song_title?: string | null
          territory?: string | null
          transaction_month?: string | null
          writers?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "royalty_onerpm_details_publishing_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "royalty_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      royalty_onerpm_details_share: {
        Row: {
          accounted_date: string | null
          artists: string | null
          created_at: string
          currency: string | null
          id: string
          item_id: string | null
          net: number | null
          parent_id: string | null
          payer_name: string | null
          product_type: string | null
          quantity: number | null
          receiver_name: string | null
          report_id: string | null
          sale_type: string | null
          share_percent: number | null
          share_type: string | null
          store: string | null
          territory: string | null
          title: string | null
          transaction_month: string | null
        }
        Insert: {
          accounted_date?: string | null
          artists?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          item_id?: string | null
          net?: number | null
          parent_id?: string | null
          payer_name?: string | null
          product_type?: string | null
          quantity?: number | null
          receiver_name?: string | null
          report_id?: string | null
          sale_type?: string | null
          share_percent?: number | null
          share_type?: string | null
          store?: string | null
          territory?: string | null
          title?: string | null
          transaction_month?: string | null
        }
        Update: {
          accounted_date?: string | null
          artists?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          item_id?: string | null
          net?: number | null
          parent_id?: string | null
          payer_name?: string | null
          product_type?: string | null
          quantity?: number | null
          receiver_name?: string | null
          report_id?: string | null
          sale_type?: string | null
          share_percent?: number | null
          share_type?: string | null
          store?: string | null
          territory?: string | null
          title?: string | null
          transaction_month?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "royalty_onerpm_details_share_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "royalty_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      royalty_onerpm_details_summary: {
        Row: {
          catalog_revenue: number | null
          created_at: string
          currency: string | null
          id: string
          net: number | null
          report_id: string | null
          share_in: number | null
          share_out: number | null
          source: string | null
          transaction_month: string | null
        }
        Insert: {
          catalog_revenue?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          net?: number | null
          report_id?: string | null
          share_in?: number | null
          share_out?: number | null
          source?: string | null
          transaction_month?: string | null
        }
        Update: {
          catalog_revenue?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          net?: number | null
          report_id?: string | null
          share_in?: number | null
          share_out?: number | null
          source?: string | null
          transaction_month?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "royalty_onerpm_details_summary_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "royalty_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      royalty_onerpm_details_youtube: {
        Row: {
          accounted_date: string | null
          avg_unit_gross: number | null
          channel_id: string | null
          channel_name: string | null
          created_at: string
          currency: string | null
          exchange_rate: number | null
          fees: number | null
          gross: number | null
          gross_original: number | null
          id: string
          net: number | null
          original_currency: string | null
          quantity: number | null
          report_id: string | null
          sale_type: string | null
          share_percent: number | null
          store: string | null
          territory: string | null
          transaction_month: string | null
          video_id: string | null
          video_title: string | null
        }
        Insert: {
          accounted_date?: string | null
          avg_unit_gross?: number | null
          channel_id?: string | null
          channel_name?: string | null
          created_at?: string
          currency?: string | null
          exchange_rate?: number | null
          fees?: number | null
          gross?: number | null
          gross_original?: number | null
          id?: string
          net?: number | null
          original_currency?: string | null
          quantity?: number | null
          report_id?: string | null
          sale_type?: string | null
          share_percent?: number | null
          store?: string | null
          territory?: string | null
          transaction_month?: string | null
          video_id?: string | null
          video_title?: string | null
        }
        Update: {
          accounted_date?: string | null
          avg_unit_gross?: number | null
          channel_id?: string | null
          channel_name?: string | null
          created_at?: string
          currency?: string | null
          exchange_rate?: number | null
          fees?: number | null
          gross?: number | null
          gross_original?: number | null
          id?: string
          net?: number | null
          original_currency?: string | null
          quantity?: number | null
          report_id?: string | null
          sale_type?: string | null
          share_percent?: number | null
          store?: string | null
          territory?: string | null
          transaction_month?: string | null
          video_id?: string | null
          video_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "royalty_onerpm_details_youtube_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "royalty_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      royalty_onerpm_statement: {
        Row: {
          artista: string | null
          created_at: string
          faixa: string | null
          id: string
          isrc: string | null
          receitas: number | null
          report_id: string | null
          streams: number | null
          territorio: string | null
        }
        Insert: {
          artista?: string | null
          created_at?: string
          faixa?: string | null
          id?: string
          isrc?: string | null
          receitas?: number | null
          report_id?: string | null
          streams?: number | null
          territorio?: string | null
        }
        Update: {
          artista?: string | null
          created_at?: string
          faixa?: string | null
          id?: string
          isrc?: string | null
          receitas?: number | null
          report_id?: string | null
          streams?: number | null
          territorio?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "royalty_onerpm_statement_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "royalty_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      royalty_onerpm_summary: {
        Row: {
          album_channel: string | null
          artists: string | null
          created_at: string
          currency: string | null
          id: string
          item_id: string | null
          net: number | null
          parent_id: string | null
          product_type: string | null
          quantity: number | null
          report_id: string | null
          sales_type: string | null
          title: string | null
        }
        Insert: {
          album_channel?: string | null
          artists?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          item_id?: string | null
          net?: number | null
          parent_id?: string | null
          product_type?: string | null
          quantity?: number | null
          report_id?: string | null
          sales_type?: string | null
          title?: string | null
        }
        Update: {
          album_channel?: string | null
          artists?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          item_id?: string | null
          net?: number | null
          parent_id?: string | null
          product_type?: string | null
          quantity?: number | null
          report_id?: string | null
          sales_type?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "royalty_onerpm_summary_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "royalty_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      royalty_reports: {
        Row: {
          created_at: string
          created_by: string | null
          distributor: string
          file_name: string
          file_type: string
          id: string
          record_count: number
          report_month: string | null
          status: string
          upload_date: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          distributor: string
          file_name: string
          file_type: string
          id?: string
          record_count?: number
          report_month?: string | null
          status?: string
          upload_date?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          distributor?: string
          file_name?: string
          file_type?: string
          id?: string
          record_count?: number
          report_month?: string | null
          status?: string
          upload_date?: string
        }
        Relationships: []
      }
      scheduled_notifications: {
        Row: {
          channels: string[] | null
          created_at: string | null
          entity_id: string
          entity_type: string
          error_message: string | null
          id: string
          message_data: Json | null
          message_template: string
          notification_type: string
          recipient_email: string | null
          recipient_id: string | null
          recipient_name: string | null
          recipient_phone: string | null
          recipient_type: string
          retry_count: number | null
          scheduled_for: string
          sent_at: string | null
          status: string | null
        }
        Insert: {
          channels?: string[] | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          error_message?: string | null
          id?: string
          message_data?: Json | null
          message_template: string
          notification_type: string
          recipient_email?: string | null
          recipient_id?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          recipient_type: string
          retry_count?: number | null
          scheduled_for: string
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          channels?: string[] | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          error_message?: string | null
          id?: string
          message_data?: Json | null
          message_template?: string
          notification_type?: string
          recipient_email?: string | null
          recipient_id?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          recipient_type?: string
          retry_count?: number | null
          scheduled_for?: string
          sent_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      sectors: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      security_audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          new_value: string | null
          old_value: string | null
          setting_type: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_value?: string | null
          old_value?: string | null
          setting_type: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_value?: string | null
          old_value?: string | null
          setting_type?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          category: string
          cost_price: number | null
          created_at: string
          created_by: string | null
          description: string
          discount_type: string | null
          discount_value: number | null
          final_price: number
          grupo: string | null
          id: string
          margin: number | null
          name: string
          observations: string | null
          sale_price: number
          service_type: string
          updated_at: string
        }
        Insert: {
          category: string
          cost_price?: number | null
          created_at?: string
          created_by?: string | null
          description: string
          discount_type?: string | null
          discount_value?: number | null
          final_price?: number
          grupo?: string | null
          id?: string
          margin?: number | null
          name: string
          observations?: string | null
          sale_price?: number
          service_type: string
          updated_at?: string
        }
        Update: {
          category?: string
          cost_price?: number | null
          created_at?: string
          created_by?: string | null
          description?: string
          discount_type?: string | null
          discount_value?: number | null
          final_price?: number
          grupo?: string | null
          id?: string
          margin?: number | null
          name?: string
          observations?: string | null
          sale_price?: number
          service_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      social_media_metrics: {
        Row: {
          artist_id: string | null
          campaign_id: string | null
          created_at: string
          date: string
          engagement_growth: number | null
          engagement_rate: number | null
          followers: number | null
          followers_growth: number | null
          id: string
          metric_type: string
          platform: string
          posts_count: number | null
          reach: number | null
          reach_growth: number | null
          stories_count: number | null
          value: number | null
        }
        Insert: {
          artist_id?: string | null
          campaign_id?: string | null
          created_at?: string
          date: string
          engagement_growth?: number | null
          engagement_rate?: number | null
          followers?: number | null
          followers_growth?: number | null
          id?: string
          metric_type: string
          platform: string
          posts_count?: number | null
          reach?: number | null
          reach_growth?: number | null
          stories_count?: number | null
          value?: number | null
        }
        Update: {
          artist_id?: string | null
          campaign_id?: string | null
          created_at?: string
          date?: string
          engagement_growth?: number | null
          engagement_rate?: number | null
          followers?: number | null
          followers_growth?: number | null
          id?: string
          metric_type?: string
          platform?: string
          posts_count?: number | null
          reach?: number | null
          reach_growth?: number | null
          stories_count?: number | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "social_media_metrics_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_media_metrics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      spotify_artist_tokens: {
        Row: {
          access_token: string
          artist_id: string
          connected_at: string
          created_at: string
          expires_at: string
          id: string
          refresh_token: string
          updated_at: string
        }
        Insert: {
          access_token: string
          artist_id: string
          connected_at?: string
          created_at?: string
          expires_at: string
          id?: string
          refresh_token: string
          updated_at?: string
        }
        Update: {
          access_token?: string
          artist_id?: string
          connected_at?: string
          created_at?: string
          expires_at?: string
          id?: string
          refresh_token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "spotify_artist_tokens_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: true
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      spotify_metrics: {
        Row: {
          artist_id: string
          created_at: string
          fetched_at: string
          followers: number | null
          id: string
          monthly_listeners: number | null
          popularity: number | null
          spotify_artist_id: string
          top_tracks: Json | null
          total_streams: number | null
        }
        Insert: {
          artist_id: string
          created_at?: string
          fetched_at?: string
          followers?: number | null
          id?: string
          monthly_listeners?: number | null
          popularity?: number | null
          spotify_artist_id: string
          top_tracks?: Json | null
          total_streams?: number | null
        }
        Update: {
          artist_id?: string
          created_at?: string
          fetched_at?: string
          followers?: number | null
          id?: string
          monthly_listeners?: number | null
          popularity?: number | null
          spotify_artist_id?: string
          top_tracks?: Json | null
          total_streams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "spotify_metrics_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      spotify_oauth_states: {
        Row: {
          artist_id: string
          created_at: string
          expires_at: string
          id: string
          state: string
        }
        Insert: {
          artist_id: string
          created_at?: string
          expires_at: string
          id?: string
          state: string
        }
        Update: {
          artist_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          state?: string
        }
        Relationships: [
          {
            foreignKeyName: "spotify_oauth_states_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_licenses: {
        Row: {
          advance_payment: number | null
          artist_id: string | null
          brief_url: string | null
          client_company: string | null
          client_name: string | null
          contact_id: string | null
          contract_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          duration: string | null
          end_date: string | null
          exclusivity: boolean | null
          id: string
          license_fee: number | null
          license_type: string
          media_type: string | null
          music_registry_id: string | null
          phonogram_id: string | null
          project_name: string | null
          proposal_date: string | null
          royalty_percentage: number | null
          signed_date: string | null
          start_date: string | null
          status: string | null
          territory: string | null
          title: string
          updated_at: string
          usage_description: string | null
        }
        Insert: {
          advance_payment?: number | null
          artist_id?: string | null
          brief_url?: string | null
          client_company?: string | null
          client_name?: string | null
          contact_id?: string | null
          contract_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration?: string | null
          end_date?: string | null
          exclusivity?: boolean | null
          id?: string
          license_fee?: number | null
          license_type?: string
          media_type?: string | null
          music_registry_id?: string | null
          phonogram_id?: string | null
          project_name?: string | null
          proposal_date?: string | null
          royalty_percentage?: number | null
          signed_date?: string | null
          start_date?: string | null
          status?: string | null
          territory?: string | null
          title: string
          updated_at?: string
          usage_description?: string | null
        }
        Update: {
          advance_payment?: number | null
          artist_id?: string | null
          brief_url?: string | null
          client_company?: string | null
          client_name?: string | null
          contact_id?: string | null
          contract_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration?: string | null
          end_date?: string | null
          exclusivity?: boolean | null
          id?: string
          license_fee?: number | null
          license_type?: string
          media_type?: string | null
          music_registry_id?: string | null
          phonogram_id?: string | null
          project_name?: string | null
          proposal_date?: string | null
          royalty_percentage?: number | null
          signed_date?: string | null
          start_date?: string | null
          status?: string | null
          territory?: string | null
          title?: string
          updated_at?: string
          usage_description?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sync_licenses_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sync_licenses_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sync_licenses_music_registry_id_fkey"
            columns: ["music_registry_id"]
            isOneToOne: false
            referencedRelation: "music_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sync_licenses_phonogram_id_fkey"
            columns: ["phonogram_id"]
            isOneToOne: false
            referencedRelation: "phonograms"
            referencedColumns: ["id"]
          },
        ]
      }
      system_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          days_until_due: number | null
          entity_id: string | null
          entity_name: string | null
          entity_type: string | null
          id: string
          is_dismissed: boolean | null
          is_read: boolean | null
          message: string
          resolved_at: string | null
          severity: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          days_until_due?: number | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message: string
          resolved_at?: string | null
          severity?: string
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          days_until_due?: number | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message?: string
          resolved_at?: string | null
          severity?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      system_modules: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      takedowns: {
        Row: {
          artist_id: string | null
          content_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          dispute_status: string | null
          evidence_urls: Json | null
          id: string
          infringing_party: string | null
          is_incoming: boolean | null
          music_registry_id: string | null
          platform: string
          reason: string
          release_id: string | null
          request_date: string
          resolved_date: string | null
          response_notes: string | null
          status: string | null
          submitted_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          artist_id?: string | null
          content_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          dispute_status?: string | null
          evidence_urls?: Json | null
          id?: string
          infringing_party?: string | null
          is_incoming?: boolean | null
          music_registry_id?: string | null
          platform: string
          reason: string
          release_id?: string | null
          request_date?: string
          resolved_date?: string | null
          response_notes?: string | null
          status?: string | null
          submitted_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          artist_id?: string | null
          content_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          dispute_status?: string | null
          evidence_urls?: Json | null
          id?: string
          infringing_party?: string | null
          is_incoming?: boolean | null
          music_registry_id?: string | null
          platform?: string
          reason?: string
          release_id?: string | null
          request_date?: string
          resolved_date?: string | null
          response_notes?: string | null
          status?: string | null
          submitted_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "takedowns_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "takedowns_music_registry_id_fkey"
            columns: ["music_registry_id"]
            isOneToOne: false
            referencedRelation: "music_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "takedowns_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "releases"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          project_id: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          project_id?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          project_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tracks: {
        Row: {
          artist_id: string | null
          created_at: string
          duration: number | null
          id: string
          isrc: string | null
          primary_genre: string | null
          release_id: string | null
          title: string
          track_number: number | null
        }
        Insert: {
          artist_id?: string | null
          created_at?: string
          duration?: number | null
          id?: string
          isrc?: string | null
          primary_genre?: string | null
          release_id?: string | null
          title: string
          track_number?: number | null
        }
        Update: {
          artist_id?: string | null
          created_at?: string
          duration?: number | null
          id?: string
          isrc?: string | null
          primary_genre?: string | null
          release_id?: string | null
          title?: string
          track_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tracks_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracks_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "releases"
            referencedColumns: ["id"]
          },
        ]
      }
      user_2fa_settings: {
        Row: {
          created_at: string
          email_2fa_enabled: boolean | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_2fa_enabled?: boolean | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_2fa_enabled?: boolean | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_access_scopes: {
        Row: {
          created_at: string | null
          id: string
          scope_id: string | null
          scope_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          scope_id?: string | null
          scope_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          scope_id?: string | null
          scope_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_artists: {
        Row: {
          access_level: string | null
          artist_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          access_level?: string | null
          artist_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          access_level?: string | null
          artist_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_artists_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      user_module_permissions: {
        Row: {
          created_at: string | null
          id: string
          module_id: string
          permissions: string[]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          module_id: string
          permissions?: string[]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          module_id?: string
          permissions?: string[]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_module_permissions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "system_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          browser: string | null
          created_at: string
          device_type: string | null
          id: string
          ip_address: string | null
          is_active: boolean
          last_activity_at: string
          location: string | null
          session_token: string
          terminated_at: string | null
          terminated_reason: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          browser?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean
          last_activity_at?: string
          location?: string | null
          session_token: string
          terminated_at?: string | null
          terminated_reason?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          browser?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean
          last_activity_at?: string
          location?: string | null
          session_token?: string
          terminated_at?: string | null
          terminated_reason?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: {
          p_key: string
          p_max_requests?: number
          p_window_seconds?: number
        }
        Returns: boolean
      }
      generate_contract_expiry_alerts: { Args: never; Returns: undefined }
      generate_obra_pending_alerts: { Args: never; Returns: undefined }
      generate_release_alerts: { Args: never; Returns: undefined }
      get_default_role_permissions: {
        Args: { _role: string }
        Returns: {
          module_name: string
          permissions: string[]
        }[]
      }
      has_artist_scope: {
        Args: { _artist_id: string; _user_id: string }
        Returns: boolean
      }
      has_module_permission: {
        Args: { _module_name: string; _permission: string; _user_id: string }
        Returns: boolean
      }
      has_project_scope: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_sensitive_data_access: {
        Args: { _user_id: string }
        Returns: boolean
      }
      normalize_genre: { Args: { input_genre: string }; Returns: string }
      schedule_contract_notifications: { Args: never; Returns: undefined }
      user_can_access_artist: {
        Args: { _artist_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "manager"
        | "user"
        | "empresario"
        | "financeiro"
        | "marketing"
        | "juridico"
        | "artista"
        | "produtor_artistico"
      app_role_v2:
        | "admin"
        | "gestor_artistico"
        | "financeiro"
        | "marketing"
        | "artista"
        | "colaborador"
        | "leitor"
      artist_career_level:
        | "nivel_1"
        | "nivel_2"
        | "nivel_3"
        | "nivel_4"
        | "nivel_5"
        | "nivel_6"
        | "nivel_7"
      artist_profile_type:
        | "independente"
        | "com_empresario"
        | "gravadora_propria"
        | "gravadora_externa"
        | "produtor"
        | "compositor"
      contract_status_enum:
        | "rascunho"
        | "em_analise"
        | "aguardando_assinatura"
        | "assinado"
        | "ativo"
        | "vencido"
        | "cancelado"
        | "rescindido"
      genre_enum:
        | "pop"
        | "rock"
        | "hip_hop"
        | "rap"
        | "funk"
        | "sertanejo"
        | "pagode"
        | "samba"
        | "mpb"
        | "forro"
        | "axe"
        | "reggae"
        | "eletronica"
        | "gospel"
        | "classica"
        | "jazz"
        | "blues"
        | "country"
        | "trap"
        | "drill"
        | "arrocha"
        | "piseiro"
        | "brega"
        | "indie"
        | "alternativo"
        | "r_and_b"
        | "soul"
        | "folk"
        | "metal"
        | "punk"
        | "outro"
      learning_content_type: "video" | "text" | "pdf" | "link" | "template"
      learning_difficulty: "beginner" | "intermediate" | "advanced"
      learning_track_type: "sistema" | "carreira" | "operacional"
      music_genre:
        | "funk"
        | "trap"
        | "piseiro"
        | "arrocha"
        | "arrochadeira"
        | "sertanejo"
        | "axe"
        | "pagode"
        | "forro"
        | "reggaeton"
        | "pop"
        | "rock"
        | "mpb"
        | "hip_hop"
        | "eletronica"
        | "gospel"
        | "outro"
      obra_status_enum:
        | "rascunho"
        | "em_analise"
        | "pendente_registro"
        | "registrada"
        | "aprovada"
        | "rejeitada"
        | "arquivada"
      project_status_enum:
        | "rascunho"
        | "planejamento"
        | "em_producao"
        | "em_revisao"
        | "aprovado"
        | "finalizado"
        | "cancelado"
        | "pausado"
      release_status_enum:
        | "rascunho"
        | "em_analise"
        | "aprovado"
        | "agendado"
        | "distribuindo"
        | "lancado"
        | "cancelado"
        | "pausado"
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
    Enums: {
      app_role: [
        "admin",
        "manager",
        "user",
        "empresario",
        "financeiro",
        "marketing",
        "juridico",
        "artista",
        "produtor_artistico",
      ],
      app_role_v2: [
        "admin",
        "gestor_artistico",
        "financeiro",
        "marketing",
        "artista",
        "colaborador",
        "leitor",
      ],
      artist_career_level: [
        "nivel_1",
        "nivel_2",
        "nivel_3",
        "nivel_4",
        "nivel_5",
        "nivel_6",
        "nivel_7",
      ],
      artist_profile_type: [
        "independente",
        "com_empresario",
        "gravadora_propria",
        "gravadora_externa",
        "produtor",
        "compositor",
      ],
      contract_status_enum: [
        "rascunho",
        "em_analise",
        "aguardando_assinatura",
        "assinado",
        "ativo",
        "vencido",
        "cancelado",
        "rescindido",
      ],
      genre_enum: [
        "pop",
        "rock",
        "hip_hop",
        "rap",
        "funk",
        "sertanejo",
        "pagode",
        "samba",
        "mpb",
        "forro",
        "axe",
        "reggae",
        "eletronica",
        "gospel",
        "classica",
        "jazz",
        "blues",
        "country",
        "trap",
        "drill",
        "arrocha",
        "piseiro",
        "brega",
        "indie",
        "alternativo",
        "r_and_b",
        "soul",
        "folk",
        "metal",
        "punk",
        "outro",
      ],
      learning_content_type: ["video", "text", "pdf", "link", "template"],
      learning_difficulty: ["beginner", "intermediate", "advanced"],
      learning_track_type: ["sistema", "carreira", "operacional"],
      music_genre: [
        "funk",
        "trap",
        "piseiro",
        "arrocha",
        "arrochadeira",
        "sertanejo",
        "axe",
        "pagode",
        "forro",
        "reggaeton",
        "pop",
        "rock",
        "mpb",
        "hip_hop",
        "eletronica",
        "gospel",
        "outro",
      ],
      obra_status_enum: [
        "rascunho",
        "em_analise",
        "pendente_registro",
        "registrada",
        "aprovada",
        "rejeitada",
        "arquivada",
      ],
      project_status_enum: [
        "rascunho",
        "planejamento",
        "em_producao",
        "em_revisao",
        "aprovado",
        "finalizado",
        "cancelado",
        "pausado",
      ],
      release_status_enum: [
        "rascunho",
        "em_analise",
        "aprovado",
        "agendado",
        "distribuindo",
        "lancado",
        "cancelado",
        "pausado",
      ],
    },
  },
} as const
