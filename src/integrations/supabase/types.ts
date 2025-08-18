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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      agenda_events: {
        Row: {
          artist_id: string | null
          attendees: string[] | null
          created_at: string
          created_by_id: string | null
          description: string | null
          end_date: string | null
          event_type: string
          id: string
          location: string | null
          org_id: string
          priority: string
          project_id: string | null
          start_date: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          artist_id?: string | null
          attendees?: string[] | null
          created_at?: string
          created_by_id?: string | null
          description?: string | null
          end_date?: string | null
          event_type: string
          id?: string
          location?: string | null
          org_id: string
          priority?: string
          project_id?: string | null
          start_date: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          artist_id?: string | null
          attendees?: string[] | null
          created_at?: string
          created_by_id?: string | null
          description?: string | null
          end_date?: string | null
          event_type?: string
          id?: string
          location?: string | null
          org_id?: string
          priority?: string
          project_id?: string | null
          start_date?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      artist_contributors: {
        Row: {
          artist_id: string
          contributor_id: string
          id: string
          org_id: string
          relation: string | null
        }
        Insert: {
          artist_id: string
          contributor_id: string
          id?: string
          org_id: string
          relation?: string | null
        }
        Update: {
          artist_id?: string
          contributor_id?: string
          id?: string
          org_id?: string
          relation?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artist_contributors_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_contributors_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "contributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_contributors_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "v_contributor_balance"
            referencedColumns: ["contributor_id"]
          },
          {
            foreignKeyName: "artist_contributors_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      artists: {
        Row: {
          apple_id: string | null
          country: string | null
          created_at: string
          id: string
          instagram: string | null
          legal_name: string | null
          name: string
          org_id: string
          soundcloud: string | null
          spotify_id: string | null
          tiktok: string | null
          updated_at: string
          website: string | null
          youtube_channel_id: string | null
        }
        Insert: {
          apple_id?: string | null
          country?: string | null
          created_at?: string
          id?: string
          instagram?: string | null
          legal_name?: string | null
          name: string
          org_id: string
          soundcloud?: string | null
          spotify_id?: string | null
          tiktok?: string | null
          updated_at?: string
          website?: string | null
          youtube_channel_id?: string | null
        }
        Update: {
          apple_id?: string | null
          country?: string | null
          created_at?: string
          id?: string
          instagram?: string | null
          legal_name?: string | null
          name?: string
          org_id?: string
          soundcloud?: string | null
          spotify_id?: string | null
          tiktok?: string | null
          updated_at?: string
          website?: string | null
          youtube_channel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artists_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          entity_id: string
          entity_type: string
          id: string
          mime_type: string | null
          org_id: string
          storage_path: string
          uploaded_at: string
        }
        Insert: {
          entity_id: string
          entity_type: string
          id?: string
          mime_type?: string | null
          org_id: string
          storage_path: string
          uploaded_at?: string
        }
        Update: {
          entity_id?: string
          entity_type?: string
          id?: string
          mime_type?: string | null
          org_id?: string
          storage_path?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      composition_contributors: {
        Row: {
          composition_id: string
          contributor_id: string
          id: string
          org_id: string
          role: Database["public"]["Enums"]["contributor_role"]
          share_percent: number
        }
        Insert: {
          composition_id: string
          contributor_id: string
          id?: string
          org_id: string
          role: Database["public"]["Enums"]["contributor_role"]
          share_percent: number
        }
        Update: {
          composition_id?: string
          contributor_id?: string
          id?: string
          org_id?: string
          role?: Database["public"]["Enums"]["contributor_role"]
          share_percent?: number
        }
        Relationships: [
          {
            foreignKeyName: "composition_contributors_composition_id_fkey"
            columns: ["composition_id"]
            isOneToOne: false
            referencedRelation: "compositions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "composition_contributors_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "contributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "composition_contributors_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "v_contributor_balance"
            referencedColumns: ["contributor_id"]
          },
          {
            foreignKeyName: "composition_contributors_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      compositions: {
        Row: {
          created_at: string
          id: string
          iswc: string | null
          org_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          iswc?: string | null
          org_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          iswc?: string | null
          org_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compositions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          advance_amount: number | null
          artist_id: string | null
          contract_path: string | null
          contract_type: string
          contributor_id: string | null
          created_at: string
          effective_from: string
          effective_to: string | null
          id: string
          notes: string | null
          org_id: string
          royalty_rate: number | null
          updated_at: string
        }
        Insert: {
          advance_amount?: number | null
          artist_id?: string | null
          contract_path?: string | null
          contract_type: string
          contributor_id?: string | null
          created_at?: string
          effective_from: string
          effective_to?: string | null
          id?: string
          notes?: string | null
          org_id: string
          royalty_rate?: number | null
          updated_at?: string
        }
        Update: {
          advance_amount?: number | null
          artist_id?: string | null
          contract_path?: string | null
          contract_type?: string
          contributor_id?: string | null
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          id?: string
          notes?: string | null
          org_id?: string
          royalty_rate?: number | null
          updated_at?: string
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
            foreignKeyName: "contracts_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "contributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "v_contributor_balance"
            referencedColumns: ["contributor_id"]
          },
          {
            foreignKeyName: "contracts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contributors: {
        Row: {
          country: string | null
          created_at: string
          display_name: string
          email: string | null
          id: string
          notes: string | null
          org_id: string
          payee_type: string | null
          tax_id: string | null
          updated_at: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          display_name: string
          email?: string | null
          id?: string
          notes?: string | null
          org_id: string
          payee_type?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Update: {
          country?: string | null
          created_at?: string
          display_name?: string
          email?: string | null
          id?: string
          notes?: string | null
          org_id?: string
          payee_type?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contributors_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_contacts: {
        Row: {
          company: string | null
          contact_type: string
          created_at: string
          email: string | null
          id: string
          name: string
          next_action: string | null
          observations: string | null
          org_id: string
          phone: string | null
          position: string | null
          priority: string
          status: string
          updated_at: string
        }
        Insert: {
          company?: string | null
          contact_type: string
          created_at?: string
          email?: string | null
          id?: string
          name: string
          next_action?: string | null
          observations?: string | null
          org_id: string
          phone?: string | null
          position?: string | null
          priority?: string
          status?: string
          updated_at?: string
        }
        Update: {
          company?: string | null
          contact_type?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          next_action?: string | null
          observations?: string | null
          org_id?: string
          phone?: string | null
          position?: string | null
          priority?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      distributions: {
        Row: {
          delivered_at: string | null
          dsp_id: string
          id: string
          notes: string | null
          org_id: string
          reference: string | null
          release_id: string
          status: Database["public"]["Enums"]["delivery_status"]
        }
        Insert: {
          delivered_at?: string | null
          dsp_id: string
          id?: string
          notes?: string | null
          org_id: string
          reference?: string | null
          release_id: string
          status?: Database["public"]["Enums"]["delivery_status"]
        }
        Update: {
          delivered_at?: string | null
          dsp_id?: string
          id?: string
          notes?: string | null
          org_id?: string
          reference?: string | null
          release_id?: string
          status?: Database["public"]["Enums"]["delivery_status"]
        }
        Relationships: [
          {
            foreignKeyName: "distributions_dsp_id_fkey"
            columns: ["dsp_id"]
            isOneToOne: false
            referencedRelation: "dsps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distributions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distributions_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "releases"
            referencedColumns: ["id"]
          },
        ]
      }
      dsps: {
        Row: {
          code: string | null
          id: string
          name: string
          website: string | null
        }
        Insert: {
          code?: string | null
          id?: string
          name: string
          website?: string | null
        }
        Update: {
          code?: string | null
          id?: string
          name?: string
          website?: string | null
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          amount: number
          artist_id: string | null
          attachments: string[] | null
          category: string
          contact_id: string | null
          created_at: string
          currency: string
          description: string
          due_date: string | null
          id: string
          notes: string | null
          org_id: string
          payment_method: string | null
          project_id: string | null
          reference_number: string | null
          status: string
          transaction_date: string
          transaction_type: string
          updated_at: string
        }
        Insert: {
          amount: number
          artist_id?: string | null
          attachments?: string[] | null
          category: string
          contact_id?: string | null
          created_at?: string
          currency?: string
          description: string
          due_date?: string | null
          id?: string
          notes?: string | null
          org_id: string
          payment_method?: string | null
          project_id?: string | null
          reference_number?: string | null
          status?: string
          transaction_date?: string
          transaction_type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          artist_id?: string | null
          attachments?: string[] | null
          category?: string
          contact_id?: string | null
          created_at?: string
          currency?: string
          description?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          org_id?: string
          payment_method?: string | null
          project_id?: string | null
          reference_number?: string | null
          status?: string
          transaction_date?: string
          transaction_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          category: string
          created_at: string
          entry_date: string
          id: string
          invoice_number: string | null
          location: string
          name: string
          observations: string | null
          org_id: string
          purchase_location: string | null
          quantity: number
          responsible: string
          sector: string
          status: string
          total_value: number | null
          unit_value: number | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          entry_date?: string
          id?: string
          invoice_number?: string | null
          location: string
          name: string
          observations?: string | null
          org_id: string
          purchase_location?: string | null
          quantity?: number
          responsible: string
          sector: string
          status?: string
          total_value?: number | null
          unit_value?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          entry_date?: string
          id?: string
          invoice_number?: string | null
          location?: string
          name?: string
          observations?: string | null
          org_id?: string
          purchase_location?: string | null
          quantity?: number
          responsible?: string
          sector?: string
          status?: string
          total_value?: number | null
          unit_value?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      invoice_lines: {
        Row: {
          amount: number
          description: string | null
          id: number
          invoice_id: string
          org_id: string
          track_id: string | null
        }
        Insert: {
          amount: number
          description?: string | null
          id?: number
          invoice_id: string
          org_id: string
          track_id?: string | null
        }
        Update: {
          amount?: number
          description?: string | null
          id?: number
          invoice_id?: string
          org_id?: string
          track_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_lines_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_lines_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_lines_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          contributor_id: string
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          id: string
          org_id: string
          period_end: string
          period_start: string
          status: Database["public"]["Enums"]["payout_status"]
          total_amount: number
          updated_at: string
        }
        Insert: {
          contributor_id: string
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          id?: string
          org_id: string
          period_end: string
          period_start: string
          status?: Database["public"]["Enums"]["payout_status"]
          total_amount?: number
          updated_at?: string
        }
        Update: {
          contributor_id?: string
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          id?: string
          org_id?: string
          period_end?: string
          period_start?: string
          status?: Database["public"]["Enums"]["payout_status"]
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "contributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "v_contributor_balance"
            referencedColumns: ["contributor_id"]
          },
          {
            foreignKeyName: "invoices_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_briefings: {
        Row: {
          budget: number | null
          campaign: string | null
          created_at: string
          created_by_id: string | null
          created_by_name: string | null
          deadline: string | null
          deliverables: string[] | null
          description: string | null
          id: string
          org_id: string
          priority: string
          status: string
          target_audience: string | null
          title: string
          updated_at: string
        }
        Insert: {
          budget?: number | null
          campaign?: string | null
          created_at?: string
          created_by_id?: string | null
          created_by_name?: string | null
          deadline?: string | null
          deliverables?: string[] | null
          description?: string | null
          id?: string
          org_id: string
          priority?: string
          status?: string
          target_audience?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          budget?: number | null
          campaign?: string | null
          created_at?: string
          created_by_id?: string | null
          created_by_name?: string | null
          deadline?: string | null
          deliverables?: string[] | null
          description?: string | null
          id?: string
          org_id?: string
          priority?: string
          status?: string
          target_audience?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      marketing_campaigns: {
        Row: {
          budget: number | null
          clicks: number | null
          conversions: number | null
          cpc: number | null
          created_at: string
          ctr: number | null
          end_date: string | null
          id: string
          impressions: number | null
          name: string
          org_id: string
          platform: string | null
          reach: number | null
          roas: number | null
          spent: number | null
          start_date: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          budget?: number | null
          clicks?: number | null
          conversions?: number | null
          cpc?: number | null
          created_at?: string
          ctr?: number | null
          end_date?: string | null
          id?: string
          impressions?: number | null
          name: string
          org_id: string
          platform?: string | null
          reach?: number | null
          roas?: number | null
          spent?: number | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          budget?: number | null
          clicks?: number | null
          conversions?: number | null
          cpc?: number | null
          created_at?: string
          ctr?: number | null
          end_date?: string | null
          id?: string
          impressions?: number | null
          name?: string
          org_id?: string
          platform?: string | null
          reach?: number | null
          roas?: number | null
          spent?: number | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      marketing_tasks: {
        Row: {
          assignee_id: string | null
          assignee_name: string | null
          campaign: string | null
          category: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          org_id: string
          priority: string
          progress: number | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          assignee_name?: string | null
          campaign?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          org_id: string
          priority?: string
          progress?: number | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          assignee_name?: string | null
          campaign?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          org_id?: string
          priority?: string
          progress?: number | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      music_registry: {
        Row: {
          artist_id: string | null
          composers: string[] | null
          copyright_year: number | null
          created_at: string
          duration_seconds: number | null
          file_path: string | null
          genre: string | null
          id: string
          isrc: string | null
          iswc: string | null
          lyricists: string[] | null
          lyrics: string | null
          master_rights_owner: string | null
          notes: string | null
          org_id: string
          producers: string[] | null
          publishing_percentage: number | null
          recording_date: string | null
          registration_date: string
          status: string
          studio: string | null
          title: string
          updated_at: string
        }
        Insert: {
          artist_id?: string | null
          composers?: string[] | null
          copyright_year?: number | null
          created_at?: string
          duration_seconds?: number | null
          file_path?: string | null
          genre?: string | null
          id?: string
          isrc?: string | null
          iswc?: string | null
          lyricists?: string[] | null
          lyrics?: string | null
          master_rights_owner?: string | null
          notes?: string | null
          org_id: string
          producers?: string[] | null
          publishing_percentage?: number | null
          recording_date?: string | null
          registration_date?: string
          status?: string
          studio?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          artist_id?: string | null
          composers?: string[] | null
          copyright_year?: number | null
          created_at?: string
          duration_seconds?: number | null
          file_path?: string | null
          genre?: string | null
          id?: string
          isrc?: string | null
          iswc?: string | null
          lyricists?: string[] | null
          lyrics?: string | null
          master_rights_owner?: string | null
          notes?: string | null
          org_id?: string
          producers?: string[] | null
          publishing_percentage?: number | null
          recording_date?: string | null
          registration_date?: string
          status?: string
          studio?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      org_members: {
        Row: {
          created_at: string
          org_id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          org_id: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          org_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payee_accounts: {
        Row: {
          advance_total: number | null
          contributor_id: string
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          id: string
          notes: string | null
          org_id: string
          recoup_cap: number | null
          updated_at: string
        }
        Insert: {
          advance_total?: number | null
          contributor_id: string
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          id?: string
          notes?: string | null
          org_id: string
          recoup_cap?: number | null
          updated_at?: string
        }
        Update: {
          advance_total?: number | null
          contributor_id?: string
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          id?: string
          notes?: string | null
          org_id?: string
          recoup_cap?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payee_accounts_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "contributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payee_accounts_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "v_contributor_balance"
            referencedColumns: ["contributor_id"]
          },
          {
            foreignKeyName: "payee_accounts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          contributor_id: string
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          id: string
          invoice_id: string | null
          method: string | null
          notes: string | null
          org_id: string
          paid_at: string | null
          reference: string | null
          status: Database["public"]["Enums"]["payout_status"]
        }
        Insert: {
          amount: number
          contributor_id: string
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          id?: string
          invoice_id?: string | null
          method?: string | null
          notes?: string | null
          org_id: string
          paid_at?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["payout_status"]
        }
        Update: {
          amount?: number
          contributor_id?: string
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          id?: string
          invoice_id?: string | null
          method?: string | null
          notes?: string | null
          org_id?: string
          paid_at?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["payout_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payments_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "contributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "v_contributor_balance"
            referencedColumns: ["contributor_id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          is_active: boolean | null
          last_login: string | null
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
          full_name?: string | null
          id: string
          is_active?: boolean | null
          last_login?: string | null
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
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
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
          created_at: string
          description: string | null
          id: string
          name: string
          org_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          org_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      releases: {
        Row: {
          artist_id: string
          cover_path: string | null
          created_at: string
          explicit: boolean | null
          id: string
          label_name: string | null
          language: string | null
          org_id: string
          primary_genre: string | null
          release_date: string | null
          release_type: Database["public"]["Enums"]["release_type"]
          secondary_genre: string | null
          title: string
          upc: string | null
          updated_at: string
        }
        Insert: {
          artist_id: string
          cover_path?: string | null
          created_at?: string
          explicit?: boolean | null
          id?: string
          label_name?: string | null
          language?: string | null
          org_id: string
          primary_genre?: string | null
          release_date?: string | null
          release_type: Database["public"]["Enums"]["release_type"]
          secondary_genre?: string | null
          title: string
          upc?: string | null
          updated_at?: string
        }
        Update: {
          artist_id?: string
          cover_path?: string | null
          created_at?: string
          explicit?: boolean | null
          id?: string
          label_name?: string | null
          language?: string | null
          org_id?: string
          primary_genre?: string | null
          release_date?: string | null
          release_type?: Database["public"]["Enums"]["release_type"]
          secondary_genre?: string | null
          title?: string
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
            foreignKeyName: "releases_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      royalty_splits: {
        Row: {
          contributor_id: string
          effective_from: string
          effective_to: string | null
          id: string
          org_id: string
          share_percent: number
          track_id: string
        }
        Insert: {
          contributor_id: string
          effective_from?: string
          effective_to?: string | null
          id?: string
          org_id: string
          share_percent: number
          track_id: string
        }
        Update: {
          contributor_id?: string
          effective_from?: string
          effective_to?: string | null
          id?: string
          org_id?: string
          share_percent?: number
          track_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "royalty_splits_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "contributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "royalty_splits_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "v_contributor_balance"
            referencedColumns: ["contributor_id"]
          },
          {
            foreignKeyName: "royalty_splits_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "royalty_splits_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_report_lines: {
        Row: {
          country: string | null
          currency: Database["public"]["Enums"]["currency_code"] | null
          dsp_id: string | null
          event_date: string | null
          extra_json: Json | null
          fee_amount: number
          gross_amount: number
          id: number
          net_amount: number
          org_id: string
          release_id: string | null
          report_id: string
          track_id: string | null
          units: number
          usage_type: string | null
        }
        Insert: {
          country?: string | null
          currency?: Database["public"]["Enums"]["currency_code"] | null
          dsp_id?: string | null
          event_date?: string | null
          extra_json?: Json | null
          fee_amount?: number
          gross_amount?: number
          id?: number
          net_amount?: number
          org_id: string
          release_id?: string | null
          report_id: string
          track_id?: string | null
          units?: number
          usage_type?: string | null
        }
        Update: {
          country?: string | null
          currency?: Database["public"]["Enums"]["currency_code"] | null
          dsp_id?: string | null
          event_date?: string | null
          extra_json?: Json | null
          fee_amount?: number
          gross_amount?: number
          id?: number
          net_amount?: number
          org_id?: string
          release_id?: string | null
          report_id?: string
          track_id?: string | null
          units?: number
          usage_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_report_lines_dsp_id_fkey"
            columns: ["dsp_id"]
            isOneToOne: false
            referencedRelation: "dsps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_report_lines_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_report_lines_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "releases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_report_lines_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "sales_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_report_lines_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_reports: {
        Row: {
          currency: Database["public"]["Enums"]["currency_code"]
          file_path: string | null
          id: string
          imported_at: string | null
          org_id: string
          period_end: string
          period_start: string
          source: string
        }
        Insert: {
          currency?: Database["public"]["Enums"]["currency_code"]
          file_path?: string | null
          id?: string
          imported_at?: string | null
          org_id: string
          period_end: string
          period_start: string
          source: string
        }
        Update: {
          currency?: Database["public"]["Enums"]["currency_code"]
          file_path?: string | null
          id?: string
          imported_at?: string | null
          org_id?: string
          period_end?: string
          period_start?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_reports_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      social_media_metrics: {
        Row: {
          created_at: string
          engagement_growth: number | null
          engagement_rate: number | null
          followers: number | null
          followers_growth: number | null
          id: string
          metric_date: string
          org_id: string
          platform: string
          posts_count: number | null
          reach: number | null
          reach_growth: number | null
          stories_count: number | null
        }
        Insert: {
          created_at?: string
          engagement_growth?: number | null
          engagement_rate?: number | null
          followers?: number | null
          followers_growth?: number | null
          id?: string
          metric_date?: string
          org_id: string
          platform: string
          posts_count?: number | null
          reach?: number | null
          reach_growth?: number | null
          stories_count?: number | null
        }
        Update: {
          created_at?: string
          engagement_growth?: number | null
          engagement_rate?: number | null
          followers?: number | null
          followers_growth?: number | null
          id?: string
          metric_date?: string
          org_id?: string
          platform?: string
          posts_count?: number | null
          reach?: number | null
          reach_growth?: number | null
          stories_count?: number | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assignee_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          org_id: string
          project_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          org_id: string
          project_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          org_id?: string
          project_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      track_compositions: {
        Row: {
          composition_id: string
          id: string
          org_id: string
          track_id: string
        }
        Insert: {
          composition_id: string
          id?: string
          org_id: string
          track_id: string
        }
        Update: {
          composition_id?: string
          id?: string
          org_id?: string
          track_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "track_compositions_composition_id_fkey"
            columns: ["composition_id"]
            isOneToOne: false
            referencedRelation: "compositions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "track_compositions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "track_compositions_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      track_contributors: {
        Row: {
          contributor_id: string
          id: string
          notes: string | null
          org_id: string
          rights_end: string | null
          rights_start: string | null
          role: Database["public"]["Enums"]["contributor_role"]
          split_percent: number
          track_id: string
        }
        Insert: {
          contributor_id: string
          id?: string
          notes?: string | null
          org_id: string
          rights_end?: string | null
          rights_start?: string | null
          role: Database["public"]["Enums"]["contributor_role"]
          split_percent?: number
          track_id: string
        }
        Update: {
          contributor_id?: string
          id?: string
          notes?: string | null
          org_id?: string
          rights_end?: string | null
          rights_start?: string | null
          role?: Database["public"]["Enums"]["contributor_role"]
          split_percent?: number
          track_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "track_contributors_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "contributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "track_contributors_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "v_contributor_balance"
            referencedColumns: ["contributor_id"]
          },
          {
            foreignKeyName: "track_contributors_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "track_contributors_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      tracks: {
        Row: {
          artist_id: string | null
          audio_path: string | null
          bpm: number | null
          created_at: string
          disc_number: number | null
          duration_ms: number | null
          explicit: boolean | null
          id: string
          isrc: string | null
          lyrics: string | null
          musical_key: string | null
          org_id: string
          preview_path: string | null
          primary_genre: string | null
          release_id: string | null
          secondary_genre: string | null
          title: string
          track_number: number | null
          updated_at: string
        }
        Insert: {
          artist_id?: string | null
          audio_path?: string | null
          bpm?: number | null
          created_at?: string
          disc_number?: number | null
          duration_ms?: number | null
          explicit?: boolean | null
          id?: string
          isrc?: string | null
          lyrics?: string | null
          musical_key?: string | null
          org_id: string
          preview_path?: string | null
          primary_genre?: string | null
          release_id?: string | null
          secondary_genre?: string | null
          title: string
          track_number?: number | null
          updated_at?: string
        }
        Update: {
          artist_id?: string | null
          audio_path?: string | null
          bpm?: number | null
          created_at?: string
          disc_number?: number | null
          duration_ms?: number | null
          explicit?: boolean | null
          id?: string
          isrc?: string | null
          lyrics?: string | null
          musical_key?: string | null
          org_id?: string
          preview_path?: string | null
          primary_genre?: string | null
          release_id?: string | null
          secondary_genre?: string | null
          title?: string
          track_number?: number | null
          updated_at?: string
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
            foreignKeyName: "tracks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_contributor_balance: {
        Row: {
          balance: number | null
          contributor_id: string | null
          org_id: string | null
          total_due: number | null
          total_paid: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contributors_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      v_contributor_royalties: {
        Row: {
          amount_due: number | null
          contributor_id: string | null
          org_id: string | null
          track_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "track_contributors_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "contributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "track_contributors_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "v_contributor_balance"
            referencedColumns: ["contributor_id"]
          },
          {
            foreignKeyName: "track_contributors_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "track_contributors_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      v_track_revenue: {
        Row: {
          net_revenue: number | null
          org_id: string | null
          track_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_report_lines_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_report_lines_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      create_admin_user: {
        Args: {
          user_email: string
          user_full_name: string
          user_password: string
          user_phone?: string
        }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      is_org_admin: {
        Args: { org_id: string; user_id?: string }
        Returns: boolean
      }
      is_org_member: {
        Args: { p_org: string }
        Returns: boolean
      }
      is_user_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "editor" | "viewer" | "member"
      contributor_role:
        | "primary_artist"
        | "featured_artist"
        | "producer"
        | "remixer"
        | "composer"
        | "lyricist"
        | "arranger"
        | "mixer"
        | "mastering_engineer"
        | "musician"
        | "other"
      currency_code:
        | "USD"
        | "EUR"
        | "GBP"
        | "BRL"
        | "JPY"
        | "AUD"
        | "CAD"
        | "MXN"
        | "ARS"
        | "CLP"
        | "COP"
      delivery_status:
        | "pending"
        | "delivered"
        | "failed"
        | "takedown"
        | "redelivered"
      payout_status: "pending" | "approved" | "paid" | "canceled"
      release_type: "single" | "ep" | "album" | "compilation"
      user_role: "owner" | "admin" | "member" | "viewer"
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
      app_role: ["admin", "manager", "editor", "viewer", "member"],
      contributor_role: [
        "primary_artist",
        "featured_artist",
        "producer",
        "remixer",
        "composer",
        "lyricist",
        "arranger",
        "mixer",
        "mastering_engineer",
        "musician",
        "other",
      ],
      currency_code: [
        "USD",
        "EUR",
        "GBP",
        "BRL",
        "JPY",
        "AUD",
        "CAD",
        "MXN",
        "ARS",
        "CLP",
        "COP",
      ],
      delivery_status: [
        "pending",
        "delivered",
        "failed",
        "takedown",
        "redelivered",
      ],
      payout_status: ["pending", "approved", "paid", "canceled"],
      release_type: ["single", "ep", "album", "compilation"],
      user_role: ["owner", "admin", "member", "viewer"],
    },
  },
} as const
