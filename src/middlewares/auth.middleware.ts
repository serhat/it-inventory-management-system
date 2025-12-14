import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Typescript için Request tipini genişletiyoruz
export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

const SECRET_KEY = "gizli_anahtar"; // auth.controller.ts'deki ile AYNI OLMALI

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  // 1. Anahtarı al
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    console.log("HATA: Header yok!");
    return res.status(401).json({ error: "Giriş anahtarı (Token) bulunamadı!" });
  }

  // 2. "Bearer " kısmını temizle
  const token = authHeader.split(' ')[1]; // "Bearer asd1234..." -> "asd1234..."

  if (!token) {
    console.log("HATA: Token formatı yanlış!");
    return res.status(401).json({ error: "Geçersiz token formatı!" });
  }

  try {
    // 3. Anahtarı doğrula
    const decoded = jwt.verify(token, SECRET_KEY) as any;
    req.user = decoded; // Kimliği isteğe yapıştır
    next(); // Geçebilirsin
  } catch (error) {
    console.log("HATA: Token geçersiz veya süresi dolmuş:", error);
    return res.status(403).json({ error: "Geçersiz Token!" });
  }
};