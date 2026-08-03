# Mengelola challenge sebagai admin

Jalankan migrasi `007_community_challenges_and_streaks.sql` terlebih dahulu di Supabase SQL Editor.

Challenge adalah event global. Pengguna hanya dapat melihat event yang `is_published = true` dan waktu saat ini berada di antara `starts_at` serta `ends_at`.

## Membuat dan menerbitkan event

Jalankan sebagai admin melalui Supabase Dashboard SQL Editor (atau backend yang memakai service-role key), bukan dari aplikasi klien:

```sql
insert into public.community_challenges
  (icon, title, days, reward, color, starts_at, ends_at, is_published)
values
  (
    '🌱',
    'Minggu Tanpa Plastik Sekali Pakai',
    7,
    '250 XP + Badge Plastic-Free',
    '#22c55e',
    '2026-08-10 00:00:00+07',
    '2026-08-16 23:59:59+07',
    true
  );
```

## Menjadikan draft aktif atau mengakhiri event

```sql
-- Terbitkan draft.
update public.community_challenges
set is_published = true
where id = 'EVENT_UUID';

-- Akhiri event sekarang.
update public.community_challenges
set ends_at = now()
where id = 'EVENT_UUID';
```

Jangan mengubah tabel lama `public.challenges`; tabel tersebut hanya menyimpan model challenge per-pengguna dari versi sebelumnya. Event terbaru berada di `public.community_challenges`, sementara progres pengguna tersimpan di `public.challenge_participants`.
