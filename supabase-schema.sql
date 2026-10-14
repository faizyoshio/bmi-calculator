-- ====================================================================
-- SKEMA TABEL SUPABASE UNTUK BMI CALCULATOR
-- Jalankan query ini di: Supabase Dashboard -> SQL Editor -> New Query
-- ====================================================================

-- 1. Buat tabel bmi_records
CREATE TABLE IF NOT EXISTS public.bmi_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT DEFAULT 'Anonymous',
  gender TEXT,
  age INTEGER,
  height NUMERIC NOT NULL,
  weight NUMERIC NOT NULL,
  bmi NUMERIC NOT NULL,
  category TEXT NOT NULL,
  health_tip TEXT
);

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE public.bmi_records ENABLE ROW LEVEL SECURITY;

-- 3. Kebijakan agar aplikasi web (anonim) bisa menyimpan hasil kalkulasi
CREATE POLICY "Allow public insert"
  ON public.bmi_records
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 4. Kebijakan agar aplikasi web bisa membaca data (jika ingin melihat riwayat)
CREATE POLICY "Allow public read"
  ON public.bmi_records
  FOR SELECT
  TO anon, authenticated
  USING (true);
