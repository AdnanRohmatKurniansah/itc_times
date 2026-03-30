# ITC Times - Backend

**Nama Lengkap**: Adnan Rohmat Kurniansah  
**Keterangan**: "Project digunakan untuk memenuhi seleksi THE HUNTER Web Development ITC UPNYK"

---

ITC Times adalah aplikasi web yang berfungsi untuk memberikan informasi secara general maupun spesifik mengenai ITC, seperti pendaftaran, pelatihan, agenda, dll. 

## 🚀 Tech Stack

Aplikasi ini dibangun menggunakan teknologi berikut:

- **Bahasa Pemrograman:** TypeScript (berjalan di atas Node.js)
- **Framework Web:** Express.js
- **ORM / Database Tools:** Prisma
- **DBMS:** PostgreSQL
- **Security & Validation:** bcrypt (enkripsi password), jsonwebtoken (JWT untuk autentikasi session), Zod (validasi strict dari input request body & params)
- **File Upload:** Multer & Cloudinary

## 🏛️ Architecture

Projek ini menerapkan arsitektur **Layered Architecture** (menggunakan alur Controller-Service). Berikut adalah struktur direktori utama beserta penjelasannya:

```text
src/
├── routes/       // Mendefinisikan endpoint URL dan mengarahkan ke controller
├── controllers/  // Menerima HTTP request, mengambil payload, dan mengirim JSON response
├── services/     // Tempat seluruh logic bisnis beroperasi dan melakukan query ke database
├── validations/  // Layer validasi skema request menggunakan Zod (security data input)
└── middlewares/  // Interceptor penengah (seperti Verifikasi JWT, Role Guard, & Error Handler)
```

Pemisahan tanggung jawab (Separation of Concerns) di atas memfasilitasi penulisan **Clean Code**. Karena kodenya *modular*, ketika ada bug atau fitur baru, pengembang tidak perlu khawatir sistem internal lainnya akan terganggu.

## 🤔 Alasan Pemilihan Teknologi

### 1. Bahasa Pemrograman: TypeScript (Node.js)
**Alasan:**
- **Static Typing & Safety:** TypeScript mempermudah mendeteksi *error/bug* jauh lebih dini melalui kompilasi ketat sebelum *runtime*. Selain itu, kehandalan autocomplete pada IDE akan mempercepat kolaborasi developer.
- **Performa Ekosistem asynchronous:** Node.js yang *event-driven* & *non-blocking I/O* amat handal untuk aplikasi web API seperti ini yang sering memproses data dan file secara konkuren tanpa khawatir bottle-neck.
- **Kemudahan Integrasi (Fullstack friendly):** Apabila *frontend* juga menggunakan framework berbasis JS/TS (Ex: React/Next.js), *context-switching* bagi sebuah tim Web Development tidak perlu banyak dilakukan. Codebase menjadi lebih seragam.

### 2. Database: PostgreSQL dengan Prisma ORM
**Alasan:**
- **Relational Integrity Yang Maksimal:** Aplikasi ini mempunyai keterikatan / relasi tabel yang kompleks (Misalnya data `User` yang memiliki `Announcement`, memiliki `Comment`, beserta keterhubungan M-to-M `AnnouncementTag`). PostgreSQL adalah DBMS Relasional *Open-Source* terkemuka yang menjamin konsistensi data, kecepatan kompleks query, sangat handal untuk skala *Enterprise*.
- **Keamanan Skalabilitas:** Dilengkapi fitur dan extension canggih tanpa mengorbankan keamanan dan reliabilitas transaksi *(ACID Compliance)*.
- **Dukungan Prisma ORM:** Prisma adalah modern Database Toolkit yang otomatis menyediakan dan meng-generate tipe data dari struktur Schema ke dalam TypeScript sehingga sangat mempercepat proses *query* dan memberikan keamanan dari *Type-Error* selama development DB.

## 📱 API Documentation

Dokumentasi REST API sudah dibuat dan disediakan menggunakan standar interaktif **OpenAPI (Swagger)**. Dokumentasi ini mencakup daftar endpoint secara komprehensif, format parameter, serta mock-up request/response.

Untuk mengakses *Documentasi Web Base*-nya:
1. Pastikan server aplikasi sedang berjalan.
2. Buka browser dan arahkan ke alamat berikut:
   ```
   http://localhost:3000/api-docs
   ```

## ⚙️ Syarat & Langkah Menjalankan Projek

### Persyaratan (Prerequisites):
1. **Node.js** v18 atau versi lebih tinggi.
2. **PostgreSQL** (DBMS ter-install lokal atau Cloud DB/Supabase connection string).
3. Akun **Cloudinary** (Aplikasi membutuhkannya untuk menampung gambar server).

### Langkah Menjalankan (Installation & Setup):

1. **Clone Repository (Bila belum ada):**
   ```bash
   git clone <url-repository-anda>
   cd itc_times
   ```

2. **Install Dependensi Package:**
   Jalankan npm CLI untuk unduh semua module/libraries di file package.json.
   ```bash
   npm install
   ```

3. **Pengaturan Environment Variables (`.env`):**
   Salin file referensi env dari `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Buka file `.env` dan **wajib** lengkapi data konfigurasi berikut:
   
   - **Konfigurasi Server:**
     - `PORT`: Port aplikasi berjalan (misal: `3000`).
     - `NODE_ENV`: Mode aplikasi (isi dengan `development`).
     - `BASE_URL`: URL utama server backend (misal: `http://localhost:3000`).
   - **Database (PostgreSQL via Prisma):**
     *Mewajibkan layanan PostgreSQL lokal (via pgAdmin/DBeaver) atau Cloud (cth: Supabase, Neon).*
     - `DATABASE_URL`: Link URI koneksi utama Prisma (misal: `postgresql://postgres:password@localhost:5432/itc_times_db`).
     - `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT`: Detail individual *(opsional jika URL sudah terisi lengkap, namun dianjurkan diisi sesuai koneksi lokal).* 
   - **Keamanan / Auth JWT:**
     - `JWT_ACCESS_TOKEN`: Secret string panjang untuk men-generate token auth (Contoh: `rahasia_itc_token_123`).
     - `JWT_REFRESH_TOKEN`: Secret string untuk memperbarui sesi login. Bebas diisi string acak.
   - **Layanan Cloudinary (Buat Akun untuk Penyimpanan File/Foto):**
     *Aplikasi membutuhkan akun [Cloudinary (Gratis)](https://cloudinary.com/)*. Setelah daftar, ambil kredensial di dashboard Anda:
     - `CLOUDINARY_CLOUD_NAME`: Nama sistem cloud Anda.
     - `CLOUDINARY_API_KEY`: Kunci API Cloudinary Anda.
     - `CLOUDINARY_API_SECRET`: Secret key Cloudinary Anda.
   - **Layanan Email SMTP (Untuk recovery password):**
     *Bisa memanfaatkan Gmail. Buat [App Passwords Google](https://myaccount.google.com/apppasswords).*
     - `SMTP_HOST`: Diisi `smtp.gmail.com`
     - `SMTP_PORT`: Diisi `465` atau `587`
     - `SMTP_USER`: Email pengirim (misal: emailkamu@gmail.com).
     - `SMTP_PASS`: Kunci sandi 16 digit *App Password* Google kamu.

4. **Migrasi dan Seeding Database:**
   Lakukan sinkronisasi skema Prisma menuju PostgreSQL menggunakan command ini:
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```
   Setelah itu, **masukkan data awal** *(seeding)* ke dalam database dengan menjalankan perintah berikut untuk men-generate data default:
   ```bash
   npm run seed
   ```

5. **Start The Server:**
   - Untuk **mode Development** (dengan fitur auto-reload nodemon):
     ```bash
     npm run dev
     ```
   - Untuk mode Build/Production:
     ```bash
     npm run build
     npm start
     ```


