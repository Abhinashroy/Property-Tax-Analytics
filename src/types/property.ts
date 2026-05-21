export type PropertyStatus = 'Approved' | 'Rejected' | 'Pending';

export interface Property {
  property_id: string;
  tenant: string;
  owner_name: string;
  property_type: string;
  ward: string;
  area_sqft: number;
  status: PropertyStatus;
  annual_tax_inr: number;
  collection_inr: number;
  registration_date: string;
  floor_count: number;
  address: string;
}

export interface DashboardKPIs {
  totalRegistered: number;
  totalApproved: number;
  totalRejected: number;
  totalPending: number;
  totalCollection: number;
}

export interface CityData {
  city: string;
  registered: number;
  approved: number;
  rejected: number;
  pending: number;
  collection: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}
