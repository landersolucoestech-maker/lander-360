import { Database } from '@/integrations/supabase/types';

// Re-export database types for easier access
export type Tables = Database['public']['Tables'];
export type Enums = Database['public']['Enums'];

// Entity types for easier usage
export type Artist = Tables['artists']['Row'];
export type ArtistInsert = Tables['artists']['Insert'];
export type ArtistUpdate = Tables['artists']['Update'];

export type Project = Tables['projects']['Row'];
export type ProjectInsert = Tables['projects']['Insert'];
export type ProjectUpdate = Tables['projects']['Update'];

export type Contract = Tables['contracts']['Row'];
export type ContractInsert = Tables['contracts']['Insert'];
export type ContractUpdate = Tables['contracts']['Update'];

export type FinancialTransaction = Tables['financial_transactions']['Row'];
export type FinancialTransactionInsert = Tables['financial_transactions']['Insert'];
export type FinancialTransactionUpdate = Tables['financial_transactions']['Update'];

export type Invoice = Tables['invoices']['Row'];
export type InvoiceInsert = Tables['invoices']['Insert'];
export type InvoiceUpdate = Tables['invoices']['Update'];

export type MarketingCampaign = Tables['marketing_campaigns']['Row'];
export type MarketingCampaignInsert = Tables['marketing_campaigns']['Insert'];
export type MarketingCampaignUpdate = Tables['marketing_campaigns']['Update'];

export type MusicRegistration = Tables['music_registry']['Row'];
export type MusicRegistrationInsert = Tables['music_registry']['Insert'];
export type MusicRegistrationUpdate = Tables['music_registry']['Update'];

export type InventoryItem = Tables['inventory']['Row'];
export type InventoryItemInsert = Tables['inventory']['Insert'];
export type InventoryItemUpdate = Tables['inventory']['Update'];

export type AgendaEvent = Tables['agenda_events']['Row'];
export type AgendaEventInsert = Tables['agenda_events']['Insert'];
export type AgendaEventUpdate = Tables['agenda_events']['Update'];

export type CrmContact = Tables['crm_contacts']['Row'];
export type CrmContactInsert = Tables['crm_contacts']['Insert'];
export type CrmContactUpdate = Tables['crm_contacts']['Update'];

export type Profile = Tables['profiles']['Row'];
export type ProfileInsert = Tables['profiles']['Insert'];
export type ProfileUpdate = Tables['profiles']['Update'];

export type Release = Tables['releases']['Row'];
export type ReleaseInsert = Tables['releases']['Insert'];
export type ReleaseUpdate = Tables['releases']['Update'];

export type UserRole = Tables['user_roles']['Row'];
export type UserRoleInsert = Tables['user_roles']['Insert'];
export type UserRoleUpdate = Tables['user_roles']['Update'];

export type AppRole = 'admin' | 'user' | 'manager'; // Based on app_role enum in database

// Extended types with relationships
export interface ArtistWithDetails extends Artist {
  music_registrations?: MusicRegistration[];
  contracts?: Contract[];
}

export interface ProjectWithDetails extends Project {
  music_registrations?: MusicRegistration[];
  contracts?: Contract[];
}

export interface ContractWithDetails extends Contract {
  artist?: Artist;
  project?: Project;
}

export interface FinancialTransactionWithDetails extends FinancialTransaction {
  release?: Release;
  contract?: Contract;
  campaign?: MarketingCampaign;
}

export interface ReleaseWithDetails extends Release {
  registration?: MusicRegistration;
  marketing_campaigns?: MarketingCampaign[];
  financial_transactions?: FinancialTransaction[];
}

export interface MarketingCampaignWithDetails extends MarketingCampaign {
  release?: Release;
  financial_transactions?: FinancialTransaction[];
}

export interface MusicRegistrationWithDetails extends MusicRegistration {
  artist?: Artist;
  project?: Project;
  releases?: Release[];
}

// Dashboard statistics types
export interface DashboardStats {
  totalArtists: number;
  activeArtists: number;
  totalWorks: number;
  activeContracts: number;
  monthlyRevenue: number;
  recentActivities: RecentActivity[];
}

export interface RecentActivity {
  id: string;
  type: 'artist' | 'project' | 'contract' | 'transaction' | 'release';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
}