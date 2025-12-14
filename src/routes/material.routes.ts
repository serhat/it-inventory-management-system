// src/routes/material.routes.ts
import { Router } from 'express';
import { add, list, remove, assign } from '../controllers/material.controller';
import { authenticate } from '../middlewares/auth.middleware'; // <--- BU SATIR ÇOK ÖNEMLİ

 console.log("✅✅✅ MATERIAL ROTALARI YÜKLENDİ! (Assign ve Delete dahil) ✅✅✅");
 
const router = Router();

// Ekleme (Zaten çalışıyordu)
router.post('/', authenticate, add);

// Listeleme
router.get('/', authenticate, list);

// SİLME: Buraya 'authenticate' eklemezsen User ID bulamaz
router.delete('/:id', authenticate, remove); 

// DAĞITMA: Buraya 'authenticate' eklemezsen Admin mi değil mi bilemez
router.patch('/:id/assign', authenticate, assign);

export default router;