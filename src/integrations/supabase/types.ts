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
      artists: {
        Row: {
          account: string | null
          account_holder: string | null
          agency: string | null
          artist_types: string[] | null
          bank: string | null
          bio: string | null
          birth_date: string | null
          contract_status: string | null
          cpf_cnpj: string | null
          created_at: string
          created_by: string | null
          distributor_emails: Json | null
          distributors: string[] | null
          documents_url: string | null
          email: string | null
          full_address: string | null
          full_name: string | null
          genre: string | null
          id: string
          image_url: string | null
          instagram: string | null
          instagram_url: string | null
          legal_name: string | null
          manager_email: string | null
          manager_name: string | null
          manager_phone: string | null
          name: string
          observations: string | null
          phone: string | null
          pix_key: string | null
          profile_type: string | null
          record_label_name: string | null
          rg: string | null
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
          account?: string | null
          account_holder?: string | null
          agency?: string | null
          artist_types?: string[] | null
          bank?: string | null
          bio?: string | null
          birth_date?: string | null
          contract_status?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          created_by?: string | null
          distributor_emails?: Json | null
          distributors?: string[] | null
          documents_url?: string | null
          email?: string | null
          full_address?: string | null
          full_name?: string | null
          genre?: string | null
          id?: string
          image_url?: string | null
          instagram?: string | null
          instagram_url?: string | null
          legal_name?: string | null
          manager_email?: string | null
          manager_name?: string | null
          manager_phone?: string | null
          name: string
          observations?: string | null
          phone?: string | null
          pix_key?: string | null
          profile_type?: string | null
          record_label_name?: string | null
          rg?: string | null
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
          account?: string | null
          account_holder?: string | null
          agency?: string | null
          artist_types?: string[] | null
          bank?: string | null
          bio?: string | null
          birth_date?: string | null
          contract_status?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          created_by?: string | null
          distributor_emails?: Json | null
          distributors?: string[] | null
          documents_url?: string | null
          email?: string | null
          full_address?: string | null
          full_name?: string | null
          genre?: string | null
          id?: string
          image_url?: string | null
          instagram?: string | null
          instagram_url?: string | null
          legal_name?: string | null
          manager_email?: string | null
          manager_name?: string | null
          manager_phone?: string | null
          name?: string
          observations?: string | null
          phone?: string | null
          pix_key?: string | null
          profile_type?: string | null
          record_label_name?: string | null
          rg?: string | null
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
      contracts: {
        Row: {
          advance_amount: number | null
          artist_id: string | null
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
          fixed_value: number | null
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
          start_date: string | null
          status: string | null
          terms: string | null
          title: string
          updated_at: string
          value: number | null
        }
        Insert: {
          advance_amount?: number | null
          artist_id?: string | null
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
          fixed_value?: number | null
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
          start_date?: string | null
          status?: string | null
          terms?: string | null
          title: string
          updated_at?: string
          value?: number | null
        }
        Update: {
          advance_amount?: number | null
          artist_id?: string | null
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
          fixed_value?: number | null
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
          start_date?: string | null
          status?: string | null
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
          id: string
          observations: string | null
          payment_method: string | null
          project_id: string | null
          responsible_by: string | null
          status: string | null
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
          id?: string
          observations?: string | null
          payment_method?: string | null
          project_id?: string | null
          responsible_by?: string | null
          status?: string | null
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
          id?: string
          observations?: string | null
          payment_method?: string | null
          project_id?: string | null
          responsible_by?: string | null
          status?: string | null
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
            foreignKeyName: "financial_transactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
          id: string
          isrc: string | null
          iswc: string | null
          key: string | null
          participants: Json | null
          publishers: string[] | null
          release_date: string | null
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
          id?: string
          isrc?: string | null
          iswc?: string | null
          key?: string | null
          participants?: Json | null
          publishers?: string[] | null
          release_date?: string | null
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
          id?: string
          isrc?: string | null
          iswc?: string | null
          key?: string | null
          participants?: Json | null
          publishers?: string[] | null
          release_date?: string | null
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
      phonograms: {
        Row: {
          artist_id: string | null
          audio_url: string | null
          created_at: string
          created_by: string | null
          duration: number | null
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
          status: string | null
          title: string
          updated_at: string
          version_type: string | null
          work_id: string | null
        }
        Insert: {
          artist_id?: string | null
          audio_url?: string | null
          created_at?: string
          created_by?: string | null
          duration?: number | null
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
          status?: string | null
          title: string
          updated_at?: string
          version_type?: string | null
          work_id?: string | null
        }
        Update: {
          artist_id?: string | null
          audio_url?: string | null
          created_at?: string
          created_by?: string | null
          duration?: number | null
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
          updated_at?: string
        }
        Relationships: []
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
      releases: {
        Row: {
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
          project_id: string | null
          release_date: string | null
          release_type: string | null
          status: string | null
          title: string
          tracks: Json | null
          type: string | null
          updated_at: string
        }
        Insert: {
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
          project_id?: string | null
          release_date?: string | null
          release_type?: string | null
          status?: string | null
          title: string
          tracks?: Json | null
          type?: string | null
          updated_at?: string
        }
        Update: {
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
          project_id?: string | null
          release_date?: string | null
          release_type?: string | null
          status?: string | null
          title?: string
          tracks?: Json | null
          type?: string | null
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
          created_at: string
          created_by: string | null
          description: string
          discount_type: string | null
          discount_value: number | null
          final_price: number
          id: string
          observations: string | null
          sale_price: number
          service_type: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          description: string
          discount_type?: string | null
          discount_value?: number | null
          final_price?: number
          id?: string
          observations?: string | null
          sale_price?: number
          service_type: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          discount_type?: string | null
          discount_value?: number | null
          final_price?: number
          id?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "user"
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
      app_role: ["admin", "manager", "user"],
    },
  },
} as const
