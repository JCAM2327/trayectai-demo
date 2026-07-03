import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const faculties = await prisma.faculty.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  })
  return NextResponse.json(faculties)
}