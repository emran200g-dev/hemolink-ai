
-- Donors table
CREATE TABLE donors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  age integer NOT NULL,
  weight integer NOT NULL,
  blood_group text NOT NULL CHECK (blood_group IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  country text NOT NULL,
  city text NOT NULL,
  phone text NOT NULL,
  whatsapp text,
  available boolean NOT NULL DEFAULT true,
  last_donated date,
  donations_count integer NOT NULL DEFAULT 0,
  lat double precision,
  lng double precision,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Blood requests table
CREATE TABLE blood_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_name text NOT NULL,
  patient_name text NOT NULL,
  blood_group text NOT NULL CHECK (blood_group IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  hospital text NOT NULL,
  city text NOT NULL,
  country text NOT NULL,
  surgery_date timestamptz,
  urgency text NOT NULL DEFAULT 'HIGH' CHECK (urgency IN ('CRITICAL','HIGH','MODERATE')),
  medical_condition text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','matched','completed','cancelled')),
  matched_donor_id uuid REFERENCES donors(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Chat messages table
CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id text NOT NULL,
  role text NOT NULL CHECK (role IN ('ai','user','donor','system','hospital')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS (open read/insert for hackathon - no auth)
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can read donors" ON donors FOR SELECT USING (true);
CREATE POLICY "anyone can insert donors" ON donors FOR INSERT WITH CHECK (true);
CREATE POLICY "anyone can read requests" ON blood_requests FOR SELECT USING (true);
CREATE POLICY "anyone can insert requests" ON blood_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "anyone can read messages" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "anyone can insert messages" ON chat_messages FOR INSERT WITH CHECK (true);

-- Seed sample donors for demo
INSERT INTO donors (name, blood_group, country, city, phone, whatsapp, available, last_donated, donations_count, age, weight, lat, lng) VALUES
  ('Omar Hassan', 'O+', 'Egypt', 'Cairo', '+20 100 123 4567', '+20 100 123 4567', true, '2026-03-01', 47, 34, 78, 30.06, 31.24),
  ('Priya Sharma', 'B+', 'India', 'Mumbai', '+91 98765 43210', '+91 98765 43210', true, '2026-02-15', 41, 28, 62, 19.08, 72.88),
  ('Carlos Mendoza', 'A+', 'Mexico', 'Mexico City', '+52 55 1234 5678', null, true, '2026-01-20', 38, 35, 80, 19.43, -99.14),
  ('Fatima Al-Zahra', 'AB+', 'Saudi Arabia', 'Riyadh', '+966 50 123 4567', '+966 50 123 4567', true, '2025-12-10', 35, 29, 58, 24.69, 46.72),
  ('Yuki Tanaka', 'O-', 'Japan', 'Tokyo', '+81 90 1234 5678', null, false, '2026-04-01', 31, 26, 65, 35.68, 139.69),
  ('Amara Diallo', 'A-', 'Nigeria', 'Lagos', '+234 801 234 5678', '+234 801 234 5678', true, '2026-03-15', 22, 31, 70, 6.52, 3.38),
  ('Sara Ahmed', 'B-', 'Pakistan', 'Karachi', '+92 300 1234567', '+92 300 1234567', true, '2026-02-28', 18, 27, 55, 24.86, 67.08),
  ('Liam Chen', 'AB-', 'China', 'Beijing', '+86 138 0013 8000', null, true, '2026-01-05', 15, 32, 72, 39.90, 116.40),
  ('Aisha Kamel', 'O+', 'Egypt', 'Cairo', '+20 100 987 6543', '+20 100 987 6543', true, '2026-04-10', 12, 25, 60, 30.05, 31.25),
  ('Mina Girgis', 'O+', 'Egypt', 'Cairo', '+20 100 555 1234', null, false, '2026-03-20', 9, 30, 75, 30.07, 31.23),
  ('David Okafor', 'A+', 'Kenya', 'Nairobi', '+254 700 123456', '+254 700 123456', true, '2026-02-01', 28, 33, 82, -1.30, 36.80),
  ('Sofia Patel', 'B+', 'United Kingdom', 'London', '+44 7700 900123', null, true, '2026-03-08', 19, 29, 65, 51.50, -0.12),
  ('Ahmed Nasser', 'O+', 'UAE', 'Dubai', '+971 50 123 4567', '+971 50 123 4567', true, '2026-01-15', 33, 36, 85, 25.20, 55.27),
  ('Maria Santos', 'A-', 'Brazil', 'São Paulo', '+55 11 91234-5678', null, true, '2026-02-20', 16, 28, 58, -23.55, -46.63),
  ('James Osei', 'B-', 'Ghana', 'Accra', '+233 24 123 4567', '+233 24 123 4567', true, '2026-03-25', 24, 31, 76, 5.56, -0.20);

-- Seed sample blood requests
INSERT INTO blood_requests (requester_name, patient_name, blood_group, hospital, city, country, urgency, status, medical_condition) VALUES
  ('Family of Ahmed', 'Ahmed Al-Rashidi', 'O+', 'Cairo General Hospital', 'Cairo', 'Egypt', 'CRITICAL', 'matched', 'Emergency surgery'),
  ('Apollo Coordinator', 'Ravi Kumar', 'B-', 'Apollo Hospital', 'Mumbai', 'India', 'HIGH', 'pending', 'Cardiac surgery'),
  ('St. Mary Family', 'John Williams', 'AB+', 'St. Mary Medical', 'London', 'United Kingdom', 'MODERATE', 'pending', 'Planned surgery'),
  ('Kenyatta Family', 'Grace Wanjiru', 'A+', 'Kenyatta National Hospital', 'Nairobi', 'Kenya', 'HIGH', 'matched', 'Accident trauma');
