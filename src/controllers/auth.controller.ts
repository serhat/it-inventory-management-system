// src/controllers/auth.controller.ts

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const SECRET_KEY = "gizli_anahtar"; // .env dosyasından da çekilebilir

export const register = async (req: Request, res: Response) => {
  const { username, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: role || 'tedarikci'
      }
    });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: "Kullanıcı oluşturulamadı" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const user = await prisma.user.findUnique({ where: { username } });

  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ error: "Hatalı giriş!" });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role }, 
    SECRET_KEY, 
    { expiresIn: '1h' }
  );

  // KRİTİK NOKTA: Burası rolü göndermezse Frontend kör olur!
  res.status(200).json({
    message: "Giriş Başarılı!",
    token: token,
    role: user.role  // <-- BUNUN BURADA OLDUĞUNA EMİN OL
  });
};