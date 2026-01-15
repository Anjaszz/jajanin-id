# Spesifikasi Sistem SaaS Marketplace

## Versi
v1.1 – MVP Lengkap (Logic + Layout)

---

## 1. Gambaran Umum Sistem

### Jenis Sistem
SaaS Marketplace Multi-Tenant

### Role Pengguna
1. Admin (Pemilik Platform)
2. Penjual (Seller / Toko)
3. Pembeli (Buyer / User)

Satu akun dapat berperan sebagai Pembeli dan dapat upgrade menjadi Penjual.

---

## 2. Sistem Akun & Autentikasi

### 2.1 Pendaftaran Penjual

#### Form Pendaftaran Penjual

**Wajib**
- Nama toko
- Email
- Nomor WhatsApp
- Alamat lengkap (textarea)
- Link Google Maps

**Opsional**
- Logo toko
- Foto sampul toko
- Link Instagram
- Link TikTok
- Link Facebook

#### Alur Pendaftaran
1. Penjual mengisi form pendaftaran
2. Sistem mengirim OTP ke email
3. Penjual verifikasi OTP
4. Akun penjual aktif dan dapat login ke dashboard

---

### 2.2 Profil & Pengaturan Penjual

#### Data Profil
- Nama & deskripsi toko
- Logo & foto sampul
- Alamat & link Google Maps
- Media sosial
- Jam operasional (opsional)

#### Rekening Bank
- Tidak wajib saat pendaftaran
- Wajib diisi saat klik **Tarik Saldo**
- Jika belum diisi, sistem menampilkan modal wajib isi rekening

---

### 2.3 Akun Pembeli

#### Guest Checkout (Default)
- Nama
- Email
- Nomor HP

#### Akun Pembeli Terdaftar
- Nama
- Email
- Nomor HP
- Password

Pembeli terdaftar memiliki:
- Dashboard akun
- Riwayat transaksi
- Saldo (wallet) 
- Pengaturan profil & rekening

---

## 3. Layout Halaman Toko Publik (Dilihat Pembeli)

### 3.1 Header Toko
- Foto sampul (cover)
- Logo / foto profil (posisi tengah)
- Nama toko
- Alamat toko (klik → Google Maps)
- Ikon media sosial (jika ada)

---

### 3.2 Daftar Produk

Produk ditampilkan **berdasarkan kategori (section)**.

#### Contoh Struktur:
- Kategori: Minuman
  - Produk A
  - Produk B
- Kategori: Makanan
  - Produk C
  - Produk D

---

### 3.3 Kartu Produk

Isi kartu produk:
- Foto produk
- Nama produk
- Harga dan stok (sejajar)
- Tombol **Beli**

#### Interaksi:
- Klik **Beli** → muncul input jumlah (+ / -)
- Produk masuk ke keranjang mengambang

---

### 3.4 Keranjang Mengambang (Floating Cart)
- Muncul di bagian bawah layar
- Menampilkan:
  - Jumlah **produk unik** yang dipilih
- Tombol **Checkout**
- Klik → menuju halaman checkout

---

## 4. Layout Halaman Checkout

### 4.1 Daftar Produk Dipilih
- Foto produk
- Nama produk
- Jumlah
- Harga per item
- Subtotal per produk

---

### 4.2 Ringkasan Pembayaran
- Subtotal
- Biaya tambahan (jika ada)
- Total pembayaran

---

### 4.3 Opsi Pembelian
- 🔘 Beli sekarang (default)
- 🔘 Jadwalkan pesanan
  - Pilih tanggal
  - Pilih jam

---

### 4.4 Metode Pembayaran
- Tunai
- Payment Gateway (Midtrans)
- Saldo (jika login & saldo cukup)

---

### 4.5 Data Pembeli
**Mode Tamu (Default)**
- Nama
- Email
- Nomor HP

**Mode Login**
- Tombol login tersedia
- Jika login:
  - Bisa gunakan saldo
  - Riwayat transaksi tersimpan

---

## 5. Sistem Pembayaran & Fee

### 5.1 Pembayaran Tunai
- Pembeli bayar langsung ke penjual
- Tidak ada biaya tambahan
- Tidak ada fee platform
- Sistem hanya mencatat transaksi

---

### 5.2 Pembayaran Payment Gateway (Midtrans)

#### Biaya untuk Pembeli
- Biaya payment gateway (contoh QRIS 0,7%)
- PPN 11% dari biaya gateway
- Hanya muncul jika memilih payment gateway

#### Biaya untuk Penjual
- Fee platform (contoh 5%)
- Dipotong dari nilai transaksi

#### Contoh:
Harga produk: Rp100.000

Pembeli bayar:
- Rp100.777

Saldo penjual bertambah:
- Rp95.000

Pendapatan platform:
- Rp5.000

---

## 6. Sistem Pesanan (Order Management)

### 6.1 Status Pesanan
1. pending_payment
2. paid
3. pending_confirmation
4. accepted
5. processing
6. ready
7. completed
8. rejected
9. cancelled_by_seller
10. cancelled_by_buyer

---

### 6.2 Layout Halaman Pesanan Penjual

#### Tab Pesanan
1. Menunggu Konfirmasi
2. Diterima / Diproses
3. Selesai
4. Dibatalkan

---

### 6.3 Aksi Penjual
- Terima pesanan
- Tolak pesanan (masuk tab dibatalkan)
- Batalkan pesanan yang sudah diterima (dengan modal peringatan)
- Tandai pesanan siap diambil

---

### 6.4 Riwayat Transaksi Penjual
- Halaman terpisah dari pesanan
- Berisi transaksi selesai
- Filter:
  - Tanggal
  - Metode pembayaran
  - Status
  - Produk

---

## 7. Dashboard Penjual

### Ringkasan
- Total penjualan hari ini
- Total transaksi
- Pendapatan dari gateway
- Grafik penjualan (harian/mingguan)

---

### Menu Dashboard
- Produk (CRUD)
- Kategori (CRUD)
- Pesanan
- Riwayat transaksi
- Saldo
- Pengaturan toko

---

## 8. Sistem Saldo (Wallet)

### 8.1 Saldo Penjual
Saldo bertambah:
- Transaksi gateway selesai

Saldo berkurang:
- Penarikan saldo

Tidak terpengaruh:
- Transaksi tunai

---

### 8.2 Saldo Pembeli
Saldo bertambah:
- Refund transaksi gateway yang dibatalkan penjual

Saldo digunakan untuk:
- Checkout
- Penarikan saldo

---

### 8.3 Penarikan Saldo
1. Klik tarik saldo
2. Jika rekening belum ada → modal wajib isi
3. Ajukan penarikan
4. Admin menyetujui
5. Status: pending → paid

---

## 9. Panel Admin

### 9.1 Dashboard Admin
- Total GMV
- Total pendapatan platform
- Total transaksi
- Jumlah penjual aktif
- Jumlah pembeli aktif

---

### 9.2 Manajemen Akun
- CRUD penjual
- CRUD pembeli
- Suspend / aktifkan akun

---

### 9.3 Manajemen Transaksi
- Semua pesanan
- Detail pesanan lengkap
- Filter & export data

---

### 9.4 Manajemen Penarikan Saldo
- Penarikan penjual
- Penarikan pembeli
- Setujui / tolak
- Export laporan

---

### 9.5 Pengaturan Sistem
- Persentase fee platform
- Aktif / nonaktif metode pembayaran
- Jam operasional default
- Template email
- Toggle PPN (jika sudah PKP)

---

## 10. Konfigurasi Sistem

```txt
enable_cash_payment = true
enable_gateway_payment = true
cash_fee_enabled = false
platform_fee_enabled = true
platform_fee_only_gateway = true
gateway_fee_to_buyer = true
allow_negative_balance = false
login_optional = true
