# 🌱 Green Habit Assistant
### *Small Actions, Big Impact.*

---

# 📖 Gambaran Umum

**Green Habit Assistant** adalah aplikasi berbasis *behavior change* yang dirancang untuk membantu pengguna membentuk kebiasaan ramah lingkungan secara konsisten melalui pendekatan psikologi perilaku, gamifikasi, personalisasi, dan analisis kebiasaan.

Berbeda dengan aplikasi *habit tracker* biasa yang hanya mencatat aktivitas, Green Habit Assistant berperan sebagai **Behavior Change System**, yaitu sistem yang secara aktif membantu pengguna membangun kebiasaan hingga menjadi perilaku yang berkelanjutan.

---

# 🎯 Tujuan

Membantu pengguna:

- Meningkatkan konsistensi perilaku ramah lingkungan.
- Mengurangi lupa dalam menjalankan kebiasaan.
- Memberikan motivasi melalui gamifikasi.
- Memberikan umpan balik berdasarkan perkembangan pengguna.
- Menunjukkan dampak nyata dari setiap kebiasaan.

---

# 👥 Target Pengguna

- Pelajar
- Mahasiswa
- Masyarakat umum
- Komunitas peduli lingkungan

---

# 🏗️ Arsitektur Workflow

```text
Splash Screen
      │
      ▼
Login / Register
      │
      ▼
Onboarding
      │
      ▼
Goal Setup
      │
      ▼
Habit Recommendation
      │
      ▼
Dashboard
      │
      ▼
Daily Habit Tracking
      │
      ▼
AI Feedback
      │
      ▼
Progress Analysis
      │
      ▼
Weekly Reflection
      │
      ▼
Repeat
```

---

# 📱 Halaman Aplikasi

---

## 1. Splash Screen

Menampilkan:

- Logo Green Habit Assistant
- Animasi daun
- Loading singkat

---

## 2. Login

Pilihan:

- Login Google
- Login Email
- Guest Mode

---

## 3. Onboarding

### Slide 1

🌎

"Banyak orang peduli terhadap lingkungan."

---

### Slide 2

"Namun tidak semua mampu mempertahankan kebiasaan tersebut."

---

### Slide 3

"Green Habit Assistant membantu membentuk kebiasaan kecil yang berdampak besar."

---

## 4. Goal Setup

Pengguna memilih tujuan utama.

Contoh:

- 🌿 Mengurangi Sampah Plastik
- ⚡ Menghemat Energi
- 🚲 Mengurangi Emisi Karbon
- ♻️ Meningkatkan Daur Ulang
- 🌎 Semua Tujuan

---

## 5. Habit Recommendation

Aplikasi merekomendasikan kebiasaan.

Contoh:

### Senin

- Membawa tumbler

### Selasa

- Mematikan lampu ketika keluar

### Rabu

- Memilah sampah

### Kamis

- Membawa tas belanja

### Jumat

- Jalan kaki minimal 1 km

Pengguna bebas:

- Menambah habit
- Menghapus habit
- Mengubah jadwal

---

# 🏠 Dashboard

Menampilkan informasi utama.

```text
Selamat Pagi, Vito 🌱

🔥 Streak
15 Hari

Progress Minggu Ini
82%

Today's Habit

☐ Membawa tumbler
☐ Mematikan lampu
☐ Jalan kaki
☐ Memilah sampah
```

Menu bawah:

- Home
- Progress
- Challenge
- AI Coach
- Profile

---

# ✅ Daily Habit

Setiap habit memiliki halaman detail.

Contoh:

## Membawa Tumbler

Deskripsi:

"Membawa tumbler membantu mengurangi penggunaan botol plastik sekali pakai."

Manfaat:

- Mengurangi sampah plastik
- Menghemat biaya
- Mengurangi emisi produksi plastik

Estimasi Dampak:

≈ 2 botol plastik/hari

Tombol:

```
DONE
```

---

# 🎉 Habit Completed

Saat tombol DONE ditekan.

Animasi:

🌱

+10 XP

+1 Streak

+Eco Point

---

# 🤖 AI Eco Coach

AI memberikan umpan balik berdasarkan kebiasaan pengguna.

Contoh:

---

"Keren!

Kamu sudah konsisten membawa tumbler selama lima hari."

---

"Habit mematikan lampu sering terlewat pada hari Senin.

Bagaimana jika reminder dipindahkan ke pukul 07.00?"

---

"Kamu berhasil meningkatkan konsistensi sebesar 18% dibanding minggu lalu."

---

# 🌎 Eco Impact Calculator

Mengubah habit menjadi dampak nyata.

Contoh:

Hari Ini

```text
♻️ Plastik Berkurang

2 Botol

🌍 Emisi Berkurang

0.3 kg CO₂

⚡ Energi Hemat

0.5 kWh
```

Minggu Ini

```text
18 Botol Plastik

2.5 kg CO₂

8 kWh Energi
```

---

# 📊 Progress

Grafik kebiasaan.

```text
Senin     ✅

Selasa    ✅

Rabu      ❌

Kamis     ✅

Jumat     ✅

Sabtu     ✅

Minggu    ✅
```

Statistik:

- Completion Rate
- Success Rate
- Streak
- Habit Terbaik
- Habit Tersulit

---

# 🔥 Streak

Contoh

```text
🔥 18 Hari Berturut-Turut
```

Jika streak putus:

AI memberikan motivasi.

"Bukan masalah gagal satu hari.

Mari mulai kembali hari ini."

---

# 🏆 Achievement

Badge:

🌱 Eco Beginner

🌿 Green Starter

🌳 Green Hero

🌲 Forest Guardian

🌎 Earth Protector

Setiap badge memiliki syarat tertentu.

---

# ⭐ XP & Level

Setiap habit menghasilkan XP.

Contoh

```text
Level 1

Seed

0–100 XP

↓

Level 2

Sprout

101–300 XP

↓

Level 3

Sapling

301–700 XP

↓

Level 4

Tree

701–1500 XP

↓

Level 5

Forest Guardian
```

---

# 🎯 Weekly Challenge

Contoh Challenge:

- Tanpa Sedotan Plastik
- Membawa Tumbler 7 Hari
- Jalan Kaki 5 Hari
- Hemat Listrik Selama Seminggu

Reward:

- XP
- Badge
- Eco Point

---

# 📆 Weekly Reflection

Setiap akhir minggu.

AI bertanya:

"Habit apa yang paling sulit minggu ini?"

Pilihan:

- Membawa tumbler
- Memilah sampah
- Jalan kaki
- Hemat listrik

Kemudian AI memberikan rekomendasi.

---

# 📈 Monthly Report

Contoh

```text
Level

Green Hero

Habit Selesai

95

Completion Rate

86%

Plastik Berkurang

43 Botol

CO₂ Berkurang

4.5 kg

Energi Hemat

18 kWh
```

AI Summary

"Konsistensi meningkat 15% dibanding bulan lalu."

---

# 🔔 Reminder

Reminder dapat disesuaikan.

Contoh:

07.00

"Jangan lupa membawa tumbler."

12.00

"Gunakan botol minum yang telah kamu bawa."

20.00

"Sudahkah kamu menyelesaikan habit hari ini?"

---

# ⚙️ Settings

- Dark Mode
- Reminder
- Bahasa
- Habit Management
- Export Data
- Privacy

---

# 🤖 Adaptive Habit System (Novelty)

Green Habit Assistant tidak memberikan target yang sama kepada semua pengguna.

Sistem akan menyesuaikan target berdasarkan performa pengguna.

Contoh:

Minggu Pertama

Target:

5 Habit/Hari

↓

Completion Rate

40%

↓

AI menyesuaikan target

↓

Target Baru

3 Habit/Hari

↓

Completion Rate

90%

↓

Target meningkat menjadi

4 Habit/Hari

Pendekatan ini bertujuan menjaga keberhasilan awal (*early success*) sehingga pengguna tidak mudah menyerah.

---

# 📚 Dasar Teori Setiap Fitur

| Fitur | Dasar Teori | Tujuan |
|---------|------------|---------|
| Reminder | Habit Loop (Cue) | Memicu perilaku |
| Daily Checklist | Self Monitoring | Meningkatkan kesadaran |
| Progress | Feedback Theory | Evaluasi perkembangan |
| Streak | Reinforcement Theory | Mempertahankan konsistensi |
| XP | Gamification | Meningkatkan motivasi |
| Badge | Achievement Motivation | Memberikan penghargaan |
| Eco Impact | Feedback Visualization | Menunjukkan dampak nyata |
| AI Coach | Personalization | Menyesuaikan intervensi |
| Weekly Reflection | Reflective Learning | Evaluasi diri |
| Adaptive Habit | Behavior Change | Menyesuaikan tingkat kesulitan |

---

# 💡 Keunggulan Green Habit Assistant

- Fokus pada pembentukan kebiasaan, bukan sekadar pencatatan.
- Menggabungkan psikologi perilaku dengan gamifikasi.
- Menampilkan dampak lingkungan secara nyata.
- Menggunakan AI sebagai pendamping pengguna.
- Menyesuaikan target berdasarkan perkembangan pengguna.
- Memiliki sistem evaluasi mingguan.
- Mendorong perubahan perilaku yang berkelanjutan.

---

# 🔬 Peran dalam Penelitian

Dalam penelitian, Green Habit Assistant berfungsi sebagai **media intervensi** untuk menguji apakah pendekatan berbasis *behavior change* mampu meningkatkan konsistensi perilaku ramah lingkungan.

Penelitian dapat mengukur beberapa indikator, seperti:

- Tingkat penerimaan pengguna (*user acceptance*).
- Konsistensi penyelesaian habit.
- Perubahan perilaku sebelum dan sesudah penggunaan.
- Persepsi kemudahan penggunaan.
- Persepsi kebermanfaatan aplikasi.
- Tingkat motivasi pengguna.
- Potensi aplikasi sebagai media pembentukan kebiasaan ramah lingkungan.

Dengan demikian, fokus penelitian tidak hanya menilai kualitas aplikasi, tetapi juga mengevaluasi efektivitas pendekatan yang digunakan dalam membentuk perilaku ramah lingkungan.