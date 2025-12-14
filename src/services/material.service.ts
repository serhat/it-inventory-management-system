// src/services/material.service.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// --- MALZEME EKLEME ---
export const createMaterial = async (userId: number, name: string, quantity: number) => {
  return await prisma.material.create({
    data: {
      name: name,
      quantity: quantity,
      supplierId: userId // Token'dan gelen ID'yi buraya yazıyoruz
    }
  });
};

// --- MALZEME LİSTELEME (BÜYÜK MANTIK BURADA) ---
export const getMaterials = async (userId: number, role: string) => {
  
  if (role === 'admin') {
    // SEN (ADMIN): Hepsini getir + Kimin eklediğini de göster (include: supplier)
    return await prisma.material.findMany({
      include: { supplier: { select: { username: true } } }
    });
  } 
  else {
    // TEDARİKÇİ: Sadece 'supplierId'si benim ID'm olanları getir
    return await prisma.material.findMany({
      where: { supplierId: userId }
    });
  }
};