export interface Donor {
  id: string;
  name: string;
  age: number;
  weight: number;
  blood_group: string;
  country: string;
  city: string;
  phone: string;
  whatsapp?: string;
  available: boolean;
  last_donated?: string;
  donations_count: number;
  lat?: number;
  lng?: number;
  created_at: string;
  // computed
  distance?: number;
  matchScore?: number;
}

export interface BloodRequest {
  id: string;
  requester_name: string;
  patient_name: string;
  blood_group: string;
  hospital: string;
  city: string;
  country: string;
  surgery_date?: string;
  urgency: 'CRITICAL' | 'HIGH' | 'MODERATE';
  medical_condition?: string;
  status: 'pending' | 'matched' | 'completed' | 'cancelled';
  matched_donor_id?: string;
  created_at: string;
}

export interface ChatMessage {
  id: string | number;
  thread_id: string;
  role: 'ai' | 'user' | 'donor' | 'system' | 'hospital';
  content: string;
  created_at: string;
}

export interface ChatThread {
  id: number;
  name: string;
  avatar: string;
  type: 'ai' | 'donor' | 'hospital';
  bloodGroup?: string;
  lastMsg: string;
  time: string;
  unread: number;
  status?: 'pending' | 'accepted' | 'declined';
  messages: ChatMessage[];
}

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
export type BloodGroup = typeof BLOOD_GROUPS[number];

export const COUNTRIES = [
  { code: 'EG', name: 'Egypt', cities: ['Cairo', 'Alexandria', 'Giza', 'Luxor', 'Aswan'] },
  { code: 'IN', name: 'India', cities: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'] },
  { code: 'US', name: 'United States', cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'] },
  { code: 'GB', name: 'United Kingdom', cities: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow'] },
  { code: 'SA', name: 'Saudi Arabia', cities: ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam'] },
  { code: 'NG', name: 'Nigeria', cities: ['Lagos', 'Abuja', 'Kano', 'Ibadan', 'Port Harcourt'] },
  { code: 'KE', name: 'Kenya', cities: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'] },
  { code: 'PK', name: 'Pakistan', cities: ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad'] },
  { code: 'BD', name: 'Bangladesh', cities: ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna'] },
  { code: 'TR', name: 'Turkey', cities: ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya'] },
  { code: 'ID', name: 'Indonesia', cities: ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Bekasi'] },
  { code: 'BR', name: 'Brazil', cities: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza'] },
  { code: 'MX', name: 'Mexico', cities: ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana'] },
  { code: 'PH', name: 'Philippines', cities: ['Manila', 'Davao', 'Cebu', 'Quezon City', 'Zamboanga'] },
  { code: 'ZA', name: 'South Africa', cities: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth'] },
  { code: 'DE', name: 'Germany', cities: ['Berlin', 'Munich', 'Hamburg', 'Cologne', 'Frankfurt'] },
  { code: 'FR', name: 'France', cities: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice'] },
  { code: 'JP', name: 'Japan', cities: ['Tokyo', 'Osaka', 'Yokohama', 'Nagoya', 'Sapporo'] },
  { code: 'CN', name: 'China', cities: ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu'] },
  { code: 'AU', name: 'Australia', cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'] },
  { code: 'CA', name: 'Canada', cities: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa'] },
  { code: 'AE', name: 'UAE', cities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah'] },
  { code: 'MA', name: 'Morocco', cities: ['Casablanca', 'Rabat', 'Marrakesh', 'Fez', 'Tangier'] },
  { code: 'GH', name: 'Ghana', cities: ['Accra', 'Kumasi', 'Tamale', 'Sekondi', 'Sunyani'] },
] as const;

export const HOSPITALS_DB = [
  { name: 'Cairo University Hospital', city: 'Cairo', country: 'Egypt', lat: 30.06, lng: 31.24 },
  { name: 'Apollo Hospital', city: 'Mumbai', country: 'India', lat: 19.08, lng: 72.88 },
  { name: "King's College Hospital", city: 'London', country: 'United Kingdom', lat: 51.47, lng: -0.09 },
  { name: 'Kenyatta National Hospital', city: 'Nairobi', country: 'Kenya', lat: -1.30, lng: 36.80 },
  { name: 'Al-Hamad Medical City', city: 'Riyadh', country: 'Saudi Arabia', lat: 24.69, lng: 46.72 },
  { name: 'Lagos University Teaching Hospital', city: 'Lagos', country: 'Nigeria', lat: 6.52, lng: 3.38 },
  { name: 'Aga Khan Hospital', city: 'Karachi', country: 'Pakistan', lat: 24.86, lng: 67.08 },
  { name: 'Dhaka Medical College', city: 'Dhaka', country: 'Bangladesh', lat: 23.73, lng: 90.40 },
  { name: 'Cerrahpaşa Medical', city: 'Istanbul', country: 'Turkey', lat: 41.02, lng: 28.94 },
  { name: 'Cipto Mangunkusumo', city: 'Jakarta', country: 'Indonesia', lat: -6.21, lng: 106.84 },
  { name: 'Albert Einstein Hospital', city: 'São Paulo', country: 'Brazil', lat: -23.60, lng: -46.69 },
  { name: 'Hospital General Mexico', city: 'Mexico City', country: 'Mexico', lat: 19.43, lng: -99.14 },
  { name: 'Philippine General Hospital', city: 'Manila', country: 'Philippines', lat: 14.58, lng: 120.99 },
  { name: 'Groote Schuur Hospital', city: 'Cape Town', country: 'South Africa', lat: -33.94, lng: 18.46 },
  { name: 'Charité University Medicine', city: 'Berlin', country: 'Germany', lat: 52.53, lng: 13.38 },
  { name: 'Hôpital de la Pitié-Salpêtrière', city: 'Paris', country: 'France', lat: 48.84, lng: 2.36 },
  { name: 'Tokyo University Hospital', city: 'Tokyo', country: 'Japan', lat: 35.71, lng: 139.77 },
  { name: 'Peking Union Medical College', city: 'Beijing', country: 'China', lat: 39.91, lng: 116.41 },
  { name: 'Royal Melbourne Hospital', city: 'Melbourne', country: 'Australia', lat: -37.79, lng: 144.96 },
  { name: 'Toronto General Hospital', city: 'Toronto', country: 'Canada', lat: 43.66, lng: -79.39 },
  { name: 'Cleveland Clinic Abu Dhabi', city: 'Abu Dhabi', country: 'UAE', lat: 24.47, lng: 54.38 },
  { name: 'Ibn Rochd University Hospital', city: 'Casablanca', country: 'Morocco', lat: 33.59, lng: -7.62 },
  { name: 'Korle Bu Teaching Hospital', city: 'Accra', country: 'Ghana', lat: 5.55, lng: -0.22 },
] as const;
