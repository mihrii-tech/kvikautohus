// ═══════════════════════════════════════════════
// Autohus Kvik – Fælles TypeScript typer
// ═══════════════════════════════════════════════

export type CarStatus = 'draft' | 'for_sale' | 'reserved' | 'sold' | 'archived';
export type LeadType = 'car_inquiry' | 'test_drive' | 'financing' | 'contact';
export type LeadStatus = 'new' | 'contacted' | 'appointment' | 'completed' | 'rejected';
export type TradeInStatus = 'new' | 'contacted' | 'evaluated' | 'offer_sent' | 'completed' | 'rejected';
export type BookingStatus = 'new' | 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface CarImage {
  id: number;
  filePath?: string;
  url?: string;
  webPPath?: string;
  thumbnailPath?: string;
  altText?: string;
  isPrimary?: boolean;
  sortOrder: number;
}

export interface CarFeatureGroup {
  category: string;
  items: string[];
}

export interface CarSummary {
  id: number;
  title: string;
  slug: string;
  make: string;
  model: string;
  variant?: string;
  year: number;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  color?: string;
  price: number;
  monthlyPayment?: number;
  status: CarStatus;
  isFeatured: boolean;
  isNew: boolean;
  badge?: string;
  publishedAt?: string;
  coverImage?: {
    thumbnailPath?: string;
    webPPath?: string;
    altText?: string;
  };
}

export interface CarDetail extends CarSummary {
  colorHex?: string;
  horsepower?: number;
  engineSize?: string;
  fuelConsumption?: number;
  fuelConsumptionKmPerL?: number;
  electricRange?: number;
  co2Emission?: number;
  greenTax?: number;
  numDoors?: number;
  doors?: number;
  numSeats?: number;
  driveType?: string;
  firstRegistration?: string;
  modelYear?: number;
  downPayment?: number;
  loanTermMonths?: number;
  interestRate?: number;
  hasWarranty: boolean;
  warrantyDetails?: string;
  isPrepared: boolean;
  hasServiceHistory: boolean;
  isInspected: boolean;
  description?: string;
  financingInfo?: string;
  warrantyInfo?: string;
  tradeInInfo?: string;
  metaTitle?: string;
  metaDescription?: string;
  vin?: string;
  equipment?: (string | { name: string })[];
  createdAt: string;
  images: CarImage[];
  features: CarFeatureGroup[];
  relatedCars: CarSummary[];
}

export interface CarsResponse {
  cars: CarSummary[];
  total: number;
  totalCount?: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FilterOptions {
  makes: string[];
  models: string[];
  fuelTypes: string[];
  transmissions: string[];
  bodyTypes: string[];
  colors: string[];
  minPrice: number;
  maxPrice: number;
  minYear: number;
  maxYear: number;
}

export interface CarFilters {
  make?: string;
  model?: string;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  color?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  minMileage?: number;
  maxMileage?: number;
  isFeatured?: boolean;
  search?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export interface Service {
  id: number;
  title: string;
  slug: string;
  shortDescription?: string;
  content?: string;
  benefits?: string;
  process?: string;
  faqJson?: string;
  icon?: string;
  imagePath?: string;
  isActive: boolean;
  sortOrder: number;
  metaTitle?: string;
  metaDescription?: string;
}

export interface Testimonial {
  id: number;
  authorName: string;
  authorTitle?: string;
  content: string;
  rating: number;
  isActive: boolean;
  sortOrder: number;
  source?: string;
}

export interface PublicSettings {
  company_name?: string;
  company_cvr?: string;
  company_address?: string;
  company_phone?: string;
  company_emergency_phone?: string;
  company_email?: string;
  opening_hours?: string;
  social_facebook?: string;
  social_instagram?: string;
  show_testimonials?: string;
  google_rating_text?: string;
  show_sold_cars?: string;
  seo_title_suffix?: string;
  seo_default_description?: string;
  ga4_measurement_id?: string;
  gtm_container_id?: string;
  financing_interest_rate?: string;
  financing_establishment_fee?: string;
  financing_monthly_fee?: string;
  financing_disclaimer?: string;
  warranty_partner_name?: string;
  warranty_partner_url?: string;
  logo_path?: string;
}

export interface Lead {
  id: number;
  referenceNumber: string;
  type: LeadType;
  carTitle?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  status: LeadStatus;
  assignedTo?: string;
  createdAt: string;
}

export interface WorkshopBooking {
  id: number;
  referenceNumber: string;
  licensePlate?: string;
  carMake?: string;
  carModel?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  requestedDate?: string;
  requestedTimeSlot?: string;
  status: BookingStatus;
  createdAt: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'owner' | 'staff';
}

export interface DashboardStats {
  cars: Record<string, number>;
  newLeads: number;
  newTradeIns: number;
  newBookings: number;
  recentLeads: Lead[];
  recentBookings: WorkshopBooking[];
}

export interface PaginatedResponse<T> {
  items?: T[];
  cars?: T[];
  leads?: T[];
  bookings?: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SubmitLeadPayload {
  type: LeadType;
  carId?: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  preferredContact?: string;
  subject?: string;
  message?: string;
  desiredDownPayment?: number;
  desiredTermMonths?: number;
  privacyConsent: boolean;
  marketingConsent?: boolean;
  honeypotField?: string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  referenceNumber?: string;
}

// ─── Nummerplade-opslag ───
export interface VehicleLookupResult {
  found?: boolean;
  message?: string;
  make?: string;
  model?: string;
  variant?: string;
  year?: number;
  firstRegistrationDate?: string;
  fuelType?: string;
  fuelConsumptionKmPerL?: number;
  mileage?: number;
  lastInspectionDate?: string;
  lastInspectionResult?: string;
  nextInspectionDate?: string;
  status?: string;
  registrationNumber?: string;
  vin?: string;
  color?: string;
  bodyType?: string;
  engineSize?: string;
  horsepower?: number;
  totalWeight?: number;
  curbWeight?: number;
  inspectionPdfUrl?: string;
}

export interface VehicleLookupLeadPayload {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  message?: string;
  licensePlate?: string;
  privacyConsent: boolean;
  honeypotField?: string;
}
