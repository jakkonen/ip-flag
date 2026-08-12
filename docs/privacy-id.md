# Kebijakan Privasi IP Flag

Tanggal berlaku: 11 Agustus 2026.

[English](privacy.html) · [Русский](privacy-ru.html)

IP Flag adalah ekstensi browser yang secara lokal menampilkan bagaimana browser terlihat di internet: alamat IPv4/IPv6 publik, negara keluar, dan organisasi jaringan.

## Data yang diproses

Ekstensi menghubungi layanan eksternal untuk menentukan alamat IPv4 dan IPv6 publik browser. Alamat tersebut kemudian dikirim ke layanan GeoIP untuk menentukan negara dan organisasi jaringan.

Versi saat ini menggunakan `api.ipify.org` untuk IPv4 publik, `api6.ipify.org` untuk IPv6 publik, dan `api.ipapi.is` untuk negara, ASN, serta organisasi jaringan. Jika pengguna mengaktifkan opsi ini, alamat IP publik juga dikirim ke `ipwho.is` untuk mencari wilayah dan kota.

## Data yang tidak dikumpulkan

IP Flag tidak meminta atau mengakses riwayat penjelajahan, URL yang dikunjungi, isi halaman, cookie, kueri pencarian, kata sandi, data akun, atau lokasi perangkat yang tepat.

Ekstensi tidak menggunakan analitik, iklan, telemetri, sinkronisasi cloud, atau backend yang dioperasikan pengembang.

## Penyimpanan lokal dan transfer data

Status jaringan saat ini, gaya bendera yang dipilih, dan cache GeoIP kecil hanya disimpan di penyimpanan lokal ekstensi. Cache disimpan hingga 24 jam dan berisi maksimal 50 alamat IP.

Alamat IP publik dikirim ke layanan tersebut hanya untuk menyediakan fungsi inti ekstensi, melalui HTTPS.

## Perubahan kebijakan ini

Halaman ini akan diperbarui bersama versi ekstensi baru jika pemrosesan data berubah secara material.
