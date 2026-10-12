-- ==============================================================================
-- SKEMA DATABASE TOKEN DISPLAY (Supabase PostgreSQL)
-- Jalankan skrip ini di SQL Editor dashboard Supabase Anda.
-- ==============================================================================

-- 1. Buat tabel active_token untuk menyimpan token aktif tunggal
CREATE TABLE IF NOT EXISTS public.active_token (
    id INT PRIMARY KEY DEFAULT 1,
    token TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT single_active_token_check CHECK (id = 1)
);

-- 2. Berikan komentar deskriptif pada tabel & kolom
COMMENT ON TABLE public.active_token IS 'Menyimpan token aktif tunggal untuk sinkronisasi real-time tampilan antrean/token';
COMMENT ON COLUMN public.active_token.id IS 'ID tunggal bernilai 1 untuk memastikan hanya ada 1 token aktif';
COMMENT ON COLUMN public.active_token.token IS 'Isi string token yang sedang aktif';
COMMENT ON COLUMN public.active_token.updated_at IS 'Waktu terakhir token diperbarui (UTC)';

-- 3. Inisialisasi data awal jika tabel masih kosong
INSERT INTO public.active_token (id, token, updated_at)
VALUES (1, 'TOKEN-001', timezone('utc'::text, now()))
ON CONFLICT (id) DO NOTHING;

-- 4. Aktifkan Row Level Security (RLS)
ALTER TABLE public.active_token ENABLE ROW LEVEL SECURITY;

-- 5. Kebijakan RLS: Publik / Client HANYA boleh membaca (SELECT)
DROP POLICY IF EXISTS "Public can view active token" ON public.active_token;
CREATE POLICY "Public can view active token"
    ON public.active_token
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Catatan Keamanan:
-- Secara default, saat RLS diaktifkan tanpa membuat policy INSERT/UPDATE/DELETE untuk role 'anon',
-- maka seluruh request langsung dari browser/client anonim akan DITOLAK secara otomatis oleh PostgreSQL.
-- Operasi penulisan token hanya dapat dilakukan melalui Vercel Serverless Function (/api/token)
-- yang menggunakan SUPABASE_SERVICE_ROLE_KEY setelah memverifikasi ADMIN_SECRET.

-- 6. Konfigurasi Realtime
-- Atur replica identity ke FULL agar payload realtime menyertakan seluruh data baris
ALTER TABLE public.active_token REPLICA IDENTITY FULL;

-- Tambahkan tabel active_token ke publikasi supabase_realtime
-- (Gunakan blok exception jika tabel sudah terdaftar sebelumnya)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'active_token'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.active_token;
    END IF;
END $$;
