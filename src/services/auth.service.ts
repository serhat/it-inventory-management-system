import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const GIZLI_ANAHTAR = "cok_gizli_bir_kelime"; // Normalde bu şifre .env dosyasında saklanır

// --- KAYIT OLMA FONKSİYONU ---
export const registerUser = async (username: string, password: string, role: string) => {
  
  // 1. Kullanıcı var mı kontrol et
  const existingUser = await prisma.user.findUnique({
    where: { username: username }
  });

  if (existingUser) {
    throw new Error("Bu kullanıcı adı zaten kullanılıyor!");
  }

  // 2. Şifreyi hashle (gizle)
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Kullanıcıyı oluştur
  const newUser = await prisma.user.create({
    data: {
      username: username,
      password: hashedPassword,
      role: role // 'admin' veya 'tedarikci'
    }
  });

  return newUser;
};

// --- GİRİŞ YAPMA (LOGIN) FONKSİYONU ---
export const loginUser = async (username: string, password: string) => {
  
  // 1. Kullanıcıyı bul
  const user = await prisma.user.findUnique({
    where: { username: username }
  });

  if (!user) {
    throw new Error("Kullanıcı bulunamadı!");
  }

  // 2. Şifreyi kontrol et
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Şifre hatalı!");
  }

  // 3. Token oluştur (İçine ID ve Rol bilgisini gizliyoruz)
  const token = jwt.sign(
    { id: user.id, role: user.role }, 
    GIZLI_ANAHTAR, 
    { expiresIn: '1h' } // 1 saat sonra geçersiz olsun
  );

  return token;
};