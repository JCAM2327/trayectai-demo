import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.user.upsert({
    where: { id: 'user-demo-valentina' },
    update: {},
    create: {
      id: 'user-demo-valentina',
      email: 'valentina@demo.com',
      fullName: 'Valentina Demo',
      authProvider: 'email',
      isActive: true,
      emailVerified: false,
    }
  })
  console.log('✅ Usuario demo creado')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })