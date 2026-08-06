# CAWANG — Catat Keuangan

Aplikasi web personal finance planner berbasis dashboard untuk pengguna Indonesia. Membantu pengguna mencatat transaksi, merencanakan anggaran, dan memvisualisasikan arus kas dalam satu siklus keuangan bulanan yang dapat dikustomisasi.

## Tech Stack & Architecture (v1.0 - Next.js)

- **Framework**: Next.js 15+ (App Router, Turbopack)
- **UI & Styling**: React 19, Tailwind CSS v4, `shadcn/ui` (di-install via npm `shadcn`), Lucide Icons.
- **Authentication**: Supabase Auth (diimplementasikan via Client Components & `@supabase/supabase-js`).
- **State & Data Fetching**: React Hooks (`useState`, `useEffect`), Context API (`AuthContext`), React Query (direncanakan).
- **Form & Validation**: React Hook Form, Zod.
- **Architecture Note**: Menggunakan arsitektur Single Page Application (SPA) -like di dalam Next.js App Router (sebagian besar komponen utama dan halaman berjalan sebagai `"use client"`). File CSS utama menggunakan konfigurasi Tailwind v4 native tanpa `tailwind.config.js` konvensional.

## Domain Language & Entities

### Entitas Inti

**Account**:
Wadah uang nyata milik user — rekening bank, dompet digital, atau kas tunai (contoh: BCA, OVO, dompet tunai). Satu Account punya satu Opening Balance dan saldo aktual yang dihitung dari semua Transaction-nya.
*Avoid*: wallet, rekening, sumber dana

**Transaction**:
Satu kejadian finansial nyata yang sudah terjadi — uang masuk (inflow) atau keluar (outflow) dari sebuah Account. Setiap Transaction wajib punya satu Category dan boleh punya banyak Tag.
*Avoid*: entry, record, catatan

**Opening Balance**:
Nilai saldo awal yang diset satu kali saat Account pertama kali dibuat. Tidak berubah. Saldo aktual Account = Opening Balance + semua Transaction.
*Avoid*: initial balance, saldo awal

**Adjustment Transaction**:
Transaction khusus yang dibuat sistem saat proses Reconciliation untuk menutup selisih antara saldo aktual di app vs saldo rekening nyata. Bukan transaksi yang diinput user secara manual.
*Avoid*: correction, koreksi, balance fix

**Reconciliation**:
Proses menyesuaikan saldo Account di app dengan saldo rekening nyata. Menghasilkan tepat satu Adjustment Transaction sebesar selisihnya.
*Avoid*: sinkronisasi saldo, balance sync

**Transfer Pair**:
Dua Transaction yang saling di-link untuk mewakili perpindahan uang antar dua Account milik user yang sama — satu outflow dari Account asal dan satu inflow ke Account tujuan. Keduanya dikecualikan dari laporan cash flow agar tidak dihitung ganda.
*Avoid*: transfer transaction, pemindahan dana

**Recurring Rule**:
Template jadwal yang menghasilkan Transaction secara berkala. Bukan Transaction itu sendiri. Punya frekuensi (harian/mingguan/bulanan/tahunan) dan mode posting: **auto-post** (Transaction dibuat otomatis) atau **requires confirmation** (Transaction menunggu persetujuan user).
*Avoid*: recurring transaction, transaksi berulang, jadwal pembayaran

**Pending Confirmation**:
Recurring Rule yang sudah jatuh tempo dalam mode *requires confirmation* namun Transaction-nya belum dibuat karena menunggu persetujuan user. Ditampilkan sebagai action item di dashboard.
*Avoid*: upcoming transaction, transaksi tertunda

### Kategorisasi

**Category**:
Label wajib yang melekat pada setiap Transaction — mewakili jenis pengeluaran atau pemasukan (contoh: Makan, Transport, Gaji). Dipakai sebagai dimensi utama dalam Budget dan laporan Analytics.
*Avoid*: jenis transaksi, tipe

**Tag**:
Label opsional bebas yang bisa ditambahkan ke Transaction dalam jumlah banyak. Dipakai untuk filter lintas kategori (contoh: #liburan-bali bisa menyentuh Category Makan, Transport, dan Akomodasi sekaligus).
*Avoid*: label, notes, catatan

### Anggaran

**Financial Cycle**:
Periode bulanan tempat Budget dan laporan dihitung. Dimulai dari `start_day` yang dikonfigurasi per user (contoh: `start_day = 15` → Cycle 15 Jan–14 Feb). Selalu bulanan; tidak bisa mingguan atau custom interval.
*Avoid*: periode, bulan, billing cycle

**Budget**:
Alokasi dana untuk satu Category dalam satu Financial Cycle. Dibuat via Budgeting Wizard (otomatis dari framework) atau diisi manual, lalu bisa diedit bebas.
*Avoid*: anggaran, limit, alokasi

**Budgeting Framework**:
Kerangka alokasi anggaran yang dipakai sebagai titik awal pengisian Budget secara otomatis. Pilihan: **50/30/20**, **Zero-Based Budgeting**, **Kakeibo**, atau **Envelope Method**. Setelah wizard selesai, nilai Budget bisa diedit manual.
*Avoid*: metode budgeting, template anggaran

**Budgeting Wizard**:
Alur onboarding tempat user memilih satu Budgeting Framework dan sistem mengisi nilai Budget awal secara otomatis berdasarkan income yang diinput.
*Avoid*: setup budget, konfigurasi anggaran

### Visualisasi

**Calendar View**:
Tampilan kalender yang menggabungkan data aktual dan proyeksi: hari yang sudah lewat menampilkan Transaction nyata, hari yang akan datang menampilkan proyeksi arus kas dari Recurring Rule yang belum jatuh tempo.
*Avoid*: financial calendar, cash flow calendar

**Analytics**:
Kumpulan visualisasi laporan keuangan dalam satu Financial Cycle atau lintas cycle: Spending by Category, Income vs Expense, Net Worth over time, dan Budget vs Actual.
*Avoid*: laporan, report, grafik

**Net Worth**:
Total saldo semua Account milik user pada titik waktu tertentu. Dihitung sebagai jumlah saldo aktual seluruh Account.
*Avoid*: total aset, kekayaan bersih

### Teknis & Batasan v1

**User**:
Satu akun Supabase Auth per individu. Semua data (Account, Transaction, Budget, dll.) terikat eksklusif ke satu User. Tidak ada fitur berbagi data antar User di v1.
*Avoid*: member, profile, workspace owner

**Currency**:
Semua nilai keuangan dalam IDR (Rupiah). Tidak ada dukungan multi-currency di v1.
*Avoid*: mata uang, denominasi
