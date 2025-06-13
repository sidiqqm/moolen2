![logo 1](https://github.com/user-attachments/assets/7e0c90af-3220-4cf6-870a-10f0fcf960f9)

# MooLen
Moolen adalah aplikasi berbasis wab yang mendeteksi suasana hati pengguna melalui analisis ekspresi wajah.

github sebelumnya : https://github.com/sidiqqm/Moolen.git

model : https://drive.google.com/drive/folders/1QvYi3HLzrsLjA1FAs8OyJVjMhB8gEzfS?usp=drive_link

Langkah sebelum menggunakan : 
1. Download model pada drive
2. Masukkan folder model tersebut ke dalam folder API dan masukkan file .env pada api

## Fitur Fitur
- 🎭 Face Mood Detection: membuat sistem yang dapat mendeteksi suasana hati berdasarkan ekspresi wajah. Deteksi dilakukan secara real-time melalui kamera perangkat dan secara otomatis dicatat ke dalam mood tracker.
- ✅ Self Assessment: memberikan pengguna pertanyaan atau skala penilaian untuk mengumpulkan data tentang kondisi emosional mereka. Hasil dari pertanyaan ini akan diolah untuk memprediksi tingkat stres atau kecenderungan masalah psikologis ringan pada pengguna. Model prediksi ini tidak mencakup diagnosa klinis dan akan tetap menyarankan untuk melakukan pengecekan langsung ke psikolog.
- 🌐 Daily Journal: memungkinkan pengguna menulis apa yang mereka rasakan atau pengalaman sehari-hari mereka. Sistem ini hanya menerima input teks bebas (tidak mendeteksi emosi dari tulisan). 
- 📊 Daily Tips:  memberikan saran sederhana dalam bentuk artikel singkat atau kutipan yang relevan setiap hari. Tips ini bersifat edukatif dan tidak berfungsi sebagai pengganti saran profesional.

## Langkah Langkah Penggunaan
Cara untuk menggunakan : 
1.	Buka aplikasi dan akses halaman utama (homepage).
2.	Lakukan login jika sudah memiliki akun. Jika belum, registrasikan akun terlebih dahulu.
3.	Klik tombol "Mood Check-In" untuk memulai pengecekan mood. Hasil akan ditampilkan setelah proses selesai.
4.	Untuk menulis jurnal, klik "Write Down Your Journal" yang akan mengarahkan ke halaman Daily Journal atau menekan tombol "Mood Check-In" pada halaman utama.
5.	Di halaman daily mood akan muncul card yang menyesuaikan dengan hasil mood check-in sebelumnya.
6.	Pada halam daily journal ada fitur CRUD, isikan inputan berikut untuk proses edit:
    -	Title
    -	Mood
    -	Catatan jurnal
    -	Tanggal/waktu
7.	Jurnal akan tersimpan dan ditampilkan sesuai waktu yang diinputkan. Card journal bisa diedit atau dihapus.
8.	Jika ingin melihat tips harian, klik "Daily Tips" di navbar atau homepage.
9.	Untuk self-assessment, klik tombol "Self Assessment" di homepage lalu pilih "Start".
10.	Atur tanggal terlebih dahulu sebelum memulai assessment.
11.	Jawab setiap pertanyaan dengan memilih "Yes" atau "No".
12.	Sistem akan memberikan hasil apakah terdapat indikasi disorder tertentu berdasarkan jawaban yang diberikan.

## Tools 
### 🔧 Frontend
- *Vite*  
- *React.js*  
- *Tailwind CSS*  
  Utility-first CSS framework yang memungkinkan styling antarmuka secara efisien dan responsif.

### 🖥 Backend
- *Node.js*  
- *Express.js*  
- *MySQL*  
- *Google Cloud Auth (OAuth 2.0)*  

### 🧠 Integrasi Machine Learning
- *REST API*  

### 🗄 Manajemen Database & Server
- *phpMyAdmin* 
- *File Browser VPS*  

### ☁ Deployment
- *VPS (Hostinger)*  

## Documentation App
![Screenshot (2319)](https://github.com/user-attachments/assets/ef47477d-f168-4d97-a0df-a0c63c0d5b61)

![Screenshot (2317)](https://github.com/user-attachments/assets/a20e3001-ce0f-468c-8721-c543aa0e3792)

![Screenshot 2025-06-12 214951](https://github.com/user-attachments/assets/ac334195-ff65-4ddc-9b19-de6a4c0c0e2a)

![Screenshot 2025-06-12 213300](https://github.com/user-attachments/assets/5238bffc-5f29-4df9-a3f7-838a308aec43)

![Screenshot 2025-06-12 213139](https://github.com/user-attachments/assets/a1b7c262-384d-485c-9145-0ceb31f369e4)

![Screenshot 2025-06-12 213425](https://github.com/user-attachments/assets/3e345bdc-2cdf-49a4-ac89-bceb8bda9010)


