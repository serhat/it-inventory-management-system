import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import materialRoutes from './routes/material.routes';

const app = express();

app.use(cors());
app.use(express.json());

// --- 🔍 DEDEKTİF KODU BAŞLANGICI ---
// Bu kod gelen her isteği terminale yazar.
app.use((req, res, next) => {
  console.log(`📡 [İSTEK GELDİ]: ${req.method} ${req.url}`);
  next();
});
// --- DEDEKTİF KODU BİTİŞİ ---

// Rotalar
app.use('/api/auth', authRoutes);
app.use('/api/materials', materialRoutes);

// --- 404 YAKALAYICI ---
// Eğer hiçbir rota eşleşmezse burası çalışır ve sebebini söyler
app.use((req, res) => {
  console.log(`❌ [HATA - BULUNAMADI]: ${req.url} adresi tanımlı değil!`);
  res.status(404).json({ error: `Adres Bulunamadı (404): ${req.method} ${req.url}` });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Sunucu şu an çalışıyor: http://localhost:3001`);
});