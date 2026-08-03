# Groq untuk AI Coach

`ai-coach` memanggil Groq dari Supabase Edge Function. Browser hanya mengirim pesan ke function dan **tidak pernah** menerima `GROQ_API_KEY`.

## 1. Siapkan CLI dan login

```powershell
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
```

`PROJECT_REF` adalah bagian subdomain pada URL project, misalnya `https://abcdefghijkl.supabase.co` berarti `abcdefghijkl`.

## 2. Simpan key sebagai Supabase secret

Ambil key dari Groq Console, lalu jalankan perintah ini di terminal. Jangan menaruh key di `.env` frontend dan jangan memberi nama `VITE_GROQ_API_KEY`.

```powershell
npx supabase secrets set GROQ_API_KEY="gsk_..."
```

Opsional, untuk mengganti model tanpa edit kode:

```powershell
npx supabase secrets set GROQ_MODEL="llama-3.3-70b-versatile"
```

## 3. Deploy Edge Function

```powershell
npx supabase functions deploy ai-coach
```

Biarkan verifikasi JWT aktif (default). Jangan deploy dengan `--no-verify-jwt`, karena itu membuat endpoint dapat dipanggil tanpa sesi Supabase yang valid.

## 4. Konfigurasi frontend yang boleh dipublikasikan

File `.env.local` frontend hanya memerlukan nilai publik berikut:

```env
VITE_SUPABASE_URL=https://<PROJECT_REF>.supabase.co
VITE_SUPABASE_ANON_KEY=<publishable-anon-key>
```

`VITE_SUPABASE_ANON_KEY` memang aman ada di aplikasi bila RLS sudah aktif. Jangan pernah menambahkan `GROQ_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, atau key rahasia lain dengan awalan `VITE_`.

## Uji

Login di aplikasi, buka AI Coach, lalu kirim pesan. Jika ingin memeriksa konfigurasi tanpa menampilkan nilainya:

```powershell
npx supabase secrets list
```

Jika key Groq pernah masuk ke Git, file frontend, log, atau chat, segera revoke key tersebut di Groq Console dan buat key baru sebelum mengikuti langkah di atas.
