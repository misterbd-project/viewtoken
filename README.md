# Token Display — Sistem Informasi Token Real-Time

Aplikasi web modern, ringan, responsif, dan aman untuk mengelola nomor token antrean secara real-time. Dibangun menggunakan **React**, **Vite**, **Tailwind CSS**, **Supabase Realtime**, dan siap di-deploy ke **Vercel** dengan arsitektur Serverless API.

---

## 🚀 Fitur Utama

- **Real-Time Instant Update**: Setiap perubahan token di panel Admin disiarkan seketika ke seluruh layar Client tanpa perlu reload halaman.
- **Tampilan Client Skala Besar**: Tipografi responsif dengan CSS `clamp()`, ultra-kontras tinggi, dan optimal untuk layar monitor antrean/TV hingga smartphone tanpa horizontal overflow.
- **Keamanan Server-Side (Tanpa Login Publik)**: Perubahan token diamankan di sisi server melalui Vercel Serverless Function (`api/token.js`) dengan verifikasi `ADMIN_SECRET` dan `SUPABASE_SERVICE_ROLE_KEY`. Frontend hanya menggunakan `anon_key` dengan Row-Level Security (RLS) `SELECT-only`.
- **Anti-Race Condition**: Fetch data awal dan event realtime diproteksi timestamp agar fetch lama yang datang terlambat tidak menimpa pembaruan terbaru.
- **Auto-Reconnect & Resync**: Menangani pemulihan koneksi otomatis jika jaringan internet atau channel realtime terputus.
- **Single-Row Atomic Storage**: Menggunakan constraint PostgreSQL `CHECK (id = 1)` dan operasi atomic upsert untuk memastikan integritas data token tunggal.

---

## 📁 Struktur Folder Proyek

```text
token/
├── api/
│   └── token.js                  # Vercel Serverless Function (Admin Token Handler)
├── public/
│   └── favicon.svg               # Favicon aplikasi
├── src/
│   ├── components/
│   │   ├── NavigationCard.jsx    # Card navigasi Landing Page (Admin & Client)
│   │   └── TokenDisplay.jsx      # Komponen tampilan token besar & status koneksi
│   ├── hooks/
│   │   └── useRealtimeToken.js   # Custom hook Supabase Realtime & Auto-Reconnect
│   ├── lib/
│   │   └── supabase.js           # Client Supabase & helper format waktu Indonesia
│   ├── pages/
│   │   ├── AdminPage.jsx         # Halaman input & konfigurasi token Admin
│   │   ├── ClientPage.jsx        # Halaman display token layar penuh Client
│   │   └── LandingPage.jsx       # Halaman utama dengan dua card navigasi
│   ├── App.jsx                   # Konfigurasi routing React Router
│   ├── index.css                 # Konfigurasi Tailwind CSS v4 & styling dasar
│   └── main.jsx                  # Entry point React
├── supabase/
│   └── schema.sql                # Skrip SQL setup database, RLS, & Realtime
├── .env.example                  # Contoh konfigurasi variabel lingkungan
├── index.html                    # Dokumen HTML utama & SEO meta tags
├── package.json                  # Manajemen dependensi dan skrip npm
├── vercel.json                   # Konfigurasi rewrite SPA & serverless Vercel
├── vite.config.js                # Konfigurasi Vite & dev API middleware
└── README.md                     # Dokumentasi panduan lengkap
```

---

## 🗄️ Langkah Setup Database Supabase

1. Buat proyek baru di [Supabase Dashboard](https://supabase.com).
2. Buka menu **SQL Editor** pada sidebar kiri.
3. Buka file `supabase/schema.sql` pada proyek ini, salin seluruh isinya, lalu jalankan (klik **Run**).
4. Skrip tersebut akan:
   - Membuat tabel `public.active_token` dengan constraint `id = 1`.
   - Mengisi token awal (`TOKEN-001`).
   - Mengaktifkan **Row Level Security (RLS)** dengan kebijakan baca publik (`SELECT`), serta menolak manipulasi langsung dari browser.
   - Mengaktifkan publikasi `supabase_realtime` untuk tabel `active_token`.
5. Buka menu **Project Settings** > **API** di Supabase untuk mendapatkan:
   - **Project URL** (`https://xyz.supabase.co`)
   - **anon / public key**
   - **service_role key** (Secret)

---

## ⚙️ Konfigurasi Environment Variables

Salin file `.env.example` menjadi `.env` di komputer lokal Anda:

```bash
cp .env.example .env
```

Isi variabel-variabel berikut:

| Nama Variabel | Lokasi Digunakan | Deskripsi |
|---|---|---|
| `VITE_SUPABASE_URL` | Browser & Client | URL proyek Supabase Anda |
| `VITE_SUPABASE_ANON_KEY` | Browser & Client | Anon / Public API Key Supabase |
| `SUPABASE_URL` | Serverless Function | URL Supabase (Server-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | Serverless Function | Service Role Key (JANGAN gunakan awalan `VITE_`) |
| `ADMIN_SECRET` | Serverless Function | Kunci rahasia untuk otorisasi simpan token dari Panel Admin |

---

## 💻 Menjalankan di Komputer Lokal

1. Pastikan dependensi telah terinstal:
   ```bash
   npm install
   ```

2. Jalankan development server:
   ```bash
   npm run dev
   ```

3. Buka di browser:
   - Beranda: `http://localhost:5173/`
   - Panel Admin: `http://localhost:5173/admin`
   - Layar Client: `http://localhost:5173/client`

> **Tips:** Vite server telah dilengkapi dengan middleware dev bawaan pada `vite.config.js` yang secara otomatis melayani `/api/token`, sehingga Anda dapat menguji alur verifikasi `ADMIN_SECRET` dan penyimpanan ke Supabase secara langsung tanpa perlu menginstal Vercel CLI!

---

## ☁️ Panduan Deployment ke Vercel

### Metode 1: Menggunakan Vercel Dashboard (Rekomendasi)

1. Push repository proyek ini ke **GitHub**, **GitLab**, atau **Bitbucket**.
2. Masuk ke [Vercel Dashboard](https://vercel.com) dan klik **Add New** > **Project**.
3. Import repository proyek Anda.
4. Pada bagian **Configure Project**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Buka bagian **Environment Variables** dan tambahkan 5 variabel berikut:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_SECRET`
6. Klik **Deploy**.

### Metode 2: Menggunakan Vercel CLI

```bash
# Login ke Vercel
npx vercel login

# Deploy ke Preview
npx vercel

# Deploy ke Production
npx vercel --prod
```

Pastikan variabel lingkungan telah ditambahkan via perintah `npx vercel env add` atau melalui dashboard Vercel.

---

## 🧪 Verifikasi dan Pengujian Skenario

- [x] **Landing Page**: Menampilkan judul, status real-time, dan dua kartu navigasi (Admin & Client).
- [x] **Penyimpanan Admin**: Admin dapat memasukkan token angka/huruf dan menekan tombol Simpan dengan indikator loading.
- [x] **Real-Time Client**: Token yang disimpan langsung berganti di layar Client tanpa perlu refresh.
- [x] **Client Baru Dibuka**: Mengambil token terakhir dari database sebelum mulai mendengarkan event realtime.
- [x] **Multi-Device / Multi-Tab**: Membuka 2 tab Client atau perangkat berbeda menghasilkan sinkronisasi bersamaan.
- [x] **Validasi Input**: Token kosong atau spasi ditolak dengan pesan error yang jelas.
- [x] **Keamanan Endpoint**: Request simpan tanpa `ADMIN_SECRET` yang valid ditolak dengan kode `401 Unauthorized`.
- [x] **Responsivitas**: Token panjang tampil proporsional tanpa merusak layout atau horizontal overflow.
- [x] **Routing SPA**: Membuka langsung `/admin` dan `/client` tidak menghasilkan error 404 berkat konfigurasi `vercel.json`.
