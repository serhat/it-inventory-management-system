// prisma/seed.ts (Bu dosya prisma klasörünün içinde olacak)

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Şifreleri hashle (Şifre: 123)
  const password = await bcrypt.hash('123', 10);

  // 1. Admin Ekle
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: password,
      role: 'admin',
    },
  });

  // 2. Personel Ekle
  const personel = await prisma.user.upsert({
    where: { username: 'personel' },
    update: {},
    create: {
      username: 'personel',
      password: password,
      role: 'tedarikci', 
    },
  });

  console.log('✅ Kullanıcılar eklendi:', { admin, personel });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });