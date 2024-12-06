const express = require('express');
const { Pool } = require('pg');
const open = require('open');
const path = require('path');

const app = express();
const port = 3000;

// PostgreSQL bağlantısı oluştur
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'ders_notu_uygulamasi',  // Veritabanı adı
  port: 5432,
});

// Statik dosyalar için middleware
app.use(express.static(path.join(__dirname)));

// JSON ve URL-encoded verisini işlemek için express middleware'lerini kullan
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ana sayfa route'u
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});

// Kayıt olma sayfası
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'sign_up.html'));
});

// Sign In sayfası
app.get('/sign_in', (req, res) => {
  res.sendFile(path.join(__dirname, 'sign_in.html'));
});

// Kayıt olma işlemi
app.post('/register', (req, res) => {
  const { ogrenci_id, isim, soyisim, bolum_id, email, sifre } = req.body;

  pool.query(
    'INSERT INTO ogrenci (ogrenci_id, isim, soyisim, bolum_id, email, sifre) VALUES ($1, $2, $3, $4, $5, $6)',
    [ogrenci_id, isim, soyisim, bolum_id, email, sifre],
    (error) => {
      if (error) {
        console.error('Veritabanı hatası:', error.message);
        res.status(500).send('Veritabanına kaydetme hatası');
      } else {
        res.status(200).send('Kayıt başarılı');
      }
    }
  );
});

// Giriş yapma işlemi
app.post('/signin', (req, res) => {
  const { email, sifre } = req.body;

  pool.query(
    'SELECT * FROM ogrenci WHERE email = $1 AND sifre = $2',
    [email, sifre],
    (error, result) => {
      if (error) {
        console.error('Veritabanı hatası:', error.message);
        res.status(500).send('Veritabanı hatası');
      } else if (result.rows.length > 0) {
        // Kullanıcı bulundu, ana sayfaya yönlendirme
        res.redirect('/home');
      } else {
        // Kullanıcı bulunamadı
        res.status(401).send('Giriş bilgileri hatalı');
      }
    }
  );
});

// Sunucu başlatma
app.listen(port, () => {
  console.log(`Sunucu ${port} portunda çalışıyor`);
  open('http://localhost:3000');
});
