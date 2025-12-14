// src/controllers/material.controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

// --- EKLEME (Bu zaten çalışıyor) ---
export const add = async (req: AuthRequest, res: Response) => {
  try {
    const { name, quantity } = req.body;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Kimlik doğrulanamadı." });

    const material = await prisma.material.create({
      data: { name, quantity: Number(quantity), supplierId: userId }
    });
    res.status(201).json(material);
  } catch (error: any) {
    console.error("EKLEME HATASI:", error);
    res.status(400).json({ error: "Kayıt yapılamadı." });
  }
};

// --- LİSTELEME ---
export const list = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    // Admin her şeyi, Personel sadece kendi eklediğini (veya hiçbir şeyi)
    const whereCondition = role === 'admin' ? {} : { supplierId: req.user?.id };
    
    const materials = await prisma.material.findMany({
      where: whereCondition,
      include: { supplier: { select: { username: true } } },
      orderBy: { id: 'desc' }
    });
    res.json(materials);
  } catch (error) {
    console.error("LİSTELEME HATASI:", error);
    res.status(400).json({ error: "Liste çekilemedi." });
  }
};

// --- SİLME (Burayı Güncelledik) ---
export const remove = async (req: AuthRequest, res: Response) => {
  try {
    const materialId = Number(req.params.id);
    console.log(`Silinecek ID: ${materialId} - İsteyen: ${req.user?.username}`); // LOG

    // Sadece Admin veya ürünü ekleyen silebilir kontrolü eklenebilir
    // Şimdilik sadece silmeye odaklanalım
    
    await prisma.material.delete({ where: { id: materialId } });
    
    console.log("Silme Başarılı ✅");
    res.json({ message: "Silindi" });

  } catch (error: any) {
    console.error("SİLME HATASI:", error); // Terminalde hatayı gör
    res.status(400).json({ error: "Silme işlemi başarısız! (Terminali kontrol et)" });
  }
};

// --- ZİMMETLEME (Burayı Güncelledik) ---
export const assign = async (req: AuthRequest, res: Response) => {
  try {
    const materialId = Number(req.params.id);
    const { unitName, quantityToAssign } = req.body;
    const adminId = req.user?.id;

    console.log(`Zimmet İsteği -> ÜrünID: ${materialId}, Hedef: ${unitName}, Adet: ${quantityToAssign}`);

    // 1. Yetki Kontrolü
    if (req.user?.role !== 'admin') {
      console.log("HATA: Yetkisiz erişim denemesi (Admin değil)");
      return res.status(403).json({ error: "Sadece Admin zimmetleme yapabilir!" });
    }

    // 2. Ürün Var mı?
    const material = await prisma.material.findUnique({ where: { id: materialId } });
    if (!material) return res.status(404).json({ error: "Ürün bulunamadı" });

    // 3. Stok Kontrolü
    const qty = Number(quantityToAssign);
    if (material.quantity < qty) {
      return res.status(400).json({ error: `Yetersiz Stok! Mevcut: ${material.quantity}` });
    }

    // 4. İŞLEM: Stoktan Düş ve Yeni Kayıt Aç
    // Transaction kullanarak ikisini aynı anda yapıyoruz (Biri bozulursa diğeri de iptal olur)
    await prisma.$transaction([
      // A. Stoktan düş
      prisma.material.update({
        where: { id: materialId },
        data: { quantity: material.quantity - qty }
      }),
      // B. Yeni zimmetli kayıt oluştur
      prisma.material.create({
        data: {
          name: material.name,
          quantity: qty,
          supplierId: adminId!, // Adminin ID'si
          assignedTo: unitName  // Zimmet yeri
        }
      })
    ]);

    console.log("Zimmetleme Başarılı ✅");
    res.json({ message: "Zimmetlendi" });

  } catch (error: any) {
    console.error("ZİMMETLEME HATASI:", error);
    res.status(400).json({ error: "Zimmetleme başarısız! (Terminali kontrol et)" });
  }
};